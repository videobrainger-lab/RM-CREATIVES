import { buildDeliveryReport } from './kpi-delivery.mjs';
import { buildCrmReport } from './kpi-crm.mjs';
export const PROJECTS = [
  { id: 'denta', name: 'DENTA', kind: 'clinic', note: 'Стоматология' },
  { id: 'epiline', name: 'EPILINE', kind: 'clinic', note: 'Красота и эстетика' },
  { id: 'milo', name: 'MILO', kind: 'restaurant', note: 'Доставка и услуги' }
];

// Account and campaign IDs are supplied by a private server-side snapshot.
export function direction(project, campaign, assignments = {}) {
  if (project !== 'milo') return 'clinic';
  return ['delivery','services'].includes(assignments[String(campaign)]) ? assignments[String(campaign)] : 'shared';
}
export const num = value => value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value);
const sum = (rows, key) => rows.length && rows.every(row => num(row[key]) !== null) ? rows.reduce((n, row) => n + Number(row[key]), 0) : null;
const ratio = (a, b) => a !== null && b > 0 ? a / b : null;
export function validateRange(from, to) {
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  if (!valid(from) || !valid(to) || from > to || (Date.parse(to) - Date.parse(from)) / 86400000 > 365) throw new Error('Выберите корректный период до 366 дней.');
}
export function previousRange(from, to) {
  const duration = Date.parse(to) - Date.parse(from) + 86400000;
  return { from: new Date(Date.parse(from) - duration).toISOString().slice(0,10), to: new Date(Date.parse(from) - 86400000).toISOString().slice(0,10) };
}

export function buildReport(snapshot, from, to) {
  validateRange(from, to);
  const covered = from >= snapshot.coverage.from && to <= snapshot.coverage.to;
  const inRange = r => r.date >= from && r.date <= to;
  const attrs = new Map((snapshot.actionDefinitions || []).map(r => [r.account_id + ':' + r.conversion_action_name, r]));
  const projects = PROJECTS.map(project => {
    const groups = project.kind === 'restaurant' ? ['delivery', 'services', 'shared'] : ['clinic'];
    return { ...project, groups: groups.map(group => {
      const channels = ['google', 'meta'].map(channel => {
        const account = snapshot.accounts?.[project.id]?.[channel];
        const match = r => r.account_id === account && direction(project.id, r.campaign_id, snapshot.campaignDirections) === group && inRange(r);
        const rows = covered ? (snapshot[channel] || []).filter(match) : [];
        const events = covered && channel === 'google' ? (snapshot.events || []).filter(match) : [];
        const currencies = [...new Set(rows.map(r => r.currency || r.account_currency).filter(Boolean))];
        const knownCurrency = channel === 'google' && project.id === 'epiline' ? 'USD' : 'EUR';
        const currency = currencies.length === 1 ? currencies[0] : currencies.length > 1 ? null : knownCurrency;
        const available = covered && snapshot.sources?.[channel]?.status === 'ok';
        const metric = key => available ? (rows.length ? sum(rows, key) : 0) : null;
        const eventMetric = predicate => {
          if (!available || snapshot.sources?.events?.status !== 'ok' || snapshot.sources?.definitions?.status !== 'ok') return null;
          // An unmapped nonzero action makes the classification incomplete.
          if (events.some(e => !attrs.has(e.account_id + ':' + e.conversion_action_name) && Number(e.all_conversions))) return null;
          return events.filter(e => predicate(attrs.get(e.account_id + ':' + e.conversion_action_name), e)).reduce((n,e) => n + Number(e.all_conversions || 0), 0);
        };
        const secondary = channel === 'google' ? eventMetric(a => a && String(a.conversion_action_primary_for_goal).toLowerCase() === 'false') : null;
        const purchases = channel === 'google' ? eventMetric(a => a?.conversion_action_category === 'PURCHASE') : metric('actions_offsite_conversion_fb_pixel_purchase');
        const bookings = channel === 'google' ? eventMetric((a,e) => /\bbooking_created\b/.test(e.conversion_action_name)) : metric('conversions_schedule_website');
        let revenue = channel === 'meta' ? metric('action_values_offsite_conversion_fb_pixel_purchase') : null;
        if (channel === 'google' && purchases !== null) revenue = events.filter(e => attrs.get(e.account_id + ':' + e.conversion_action_name)?.conversion_action_category === 'PURCHASE').reduce((n,e) => n + Number(e.all_conversions_value || 0), 0);
        const spend = currency ? metric('spend') : null;
        const actions = new Map();
        events.forEach(e => {
          const a = attrs.get(e.account_id + ':' + e.conversion_action_name);
          const key = e.conversion_action_name;
          if (!actions.has(key)) actions.set(key, { name:key, primary: a ? String(a.conversion_action_primary_for_goal).toLowerCase() === 'true' : null, count:0 });
          actions.get(key).count += Number(e.all_conversions || 0);
        });
        return { channel, currency, spend, primary:channel === 'google' ? metric('conversions') : null, secondary,
          leads:channel === 'meta' ? metric('actions_lead') : null, purchases, revenue, bookings,
          costPurchase:ratio(spend,purchases), costBooking:ratio(spend,bookings), roas:ratio(revenue,spend),
          qualified:null, paid:null, crmBookings:null, attended:null,
          available, actions:[...actions.values()], campaigns:rows.reduce((out,r)=>{ if(!out.some(c=>c.id===r.campaign_id))out.push({id:r.campaign_id,name:r.campaign});return out;},[])
        };
      });
      return { id:group, channels };
    }) };
  });
  const milo=projects.find(p=>p.id==='milo');
  milo.deliveryCrm=buildDeliveryReport(snapshot.crm?.miloDelivery,from,to,milo.groups.find(g=>g.id==='delivery').channels);
  const denta=projects.find(p=>p.id==='denta');
  denta.crm=buildCrmReport(snapshot.crm?.denta,from,to,denta.groups[0].channels);
  return { from, to, covered, coverage:snapshot.coverage, updatedAt:snapshot.updatedAt, sources:snapshot.sources, projects,
    definitionsAsOf:snapshot.definitionsAsOf, crmStatus:'not_connected' };
}
