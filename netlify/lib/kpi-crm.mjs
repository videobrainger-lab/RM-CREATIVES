import { validateRange } from './kpi-model.mjs';
const CHANNELS = ['google','meta','unattributed','other'];
const COUNTS = ['inquiries','forms','calls','bookings','bookingsMissingDate','attendedMarked'];
export function validateCrmImport(source) {
  if (source?.version !== 1 || source.project !== 'denta') throw new Error('Некорректный источник CRM.');
  validateRange(source.coverage?.from,source.coverage?.to);
  if (!Array.isArray(source.daily) || source.daily.length > 6000 || typeof source.visitTracking !== 'boolean' || !Number.isFinite(Date.parse(source.updatedAt))) throw new Error('Некорректные данные CRM.');
  if (!/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\//.test(source.sourceUrl||'') || typeof source.sourceName !== 'string' || source.sourceName.length > 150) throw new Error('Некорректная ссылка CRM.');
  const keys = new Set();
  for (const row of source.daily) {
    validateRange(row.date,row.date);
    const key=row.date+':'+row.channel;
    if (!CHANNELS.includes(row.channel) || keys.has(key) || row.date<source.coverage.from || row.date>source.coverage.to || !COUNTS.every(k=>Number.isSafeInteger(row[k])&&row[k]>=0) || row.forms+row.calls!==row.inquiries || row.bookings>row.inquiries || row.bookingsMissingDate>row.bookings || row.attendedMarked>row.inquiries) throw new Error('Некорректные счётчики CRM.');
    keys.add(key);
  }
  // Persist only aggregate fields: no patient names, contacts, IDs or notes.
  return {version:1,project:'denta',sourceName:source.sourceName,sourceUrl:source.sourceUrl,sheetName:String(source.sheetName||'').slice(0,100),updatedAt:source.updatedAt,coverage:{...source.coverage},visitTracking:source.visitTracking,duplicatesRemoved:Number.isSafeInteger(source.duplicatesRemoved)?source.duplicatesRemoved:0,daily:source.daily.map(row=>Object.fromEntries(['date','channel',...COUNTS].map(k=>[k,row[k]])))};
}
export function buildCrmReport(source,from,to,advertising=[]) {
  if (!source) return null;
  const available=to>=source.coverage.from&&from<=source.coverage.to;
  const complete=from>=source.coverage.from&&to<=source.coverage.to;
  const rows=source.daily.filter(row=>row.date>=from&&row.date<=to);
  const channels=CHANNELS.map(channel=>{
    const records=rows.filter(r=>r.channel===channel),ad=advertising.find(c=>c.channel===channel);
    const counts=Object.fromEntries(COUNTS.map(k=>[k,available?records.reduce((n,r)=>n+r[k],0):null]));
    return {channel,...counts,attended:available&&source.visitTracking?counts.attendedMarked:null,spend:ad?.spend??null,currency:ad?.currency||'EUR',costBooking:complete&&counts.bookings>0&&ad?.spend!==null&&ad?.spend!==undefined?ad.spend/counts.bookings:null};
  });
  const total=Object.fromEntries(COUNTS.map(k=>[k,available?channels.reduce((n,c)=>n+c[k],0):null]));
  total.attended=available&&source.visitTracking?total.attendedMarked:null;
  const paid=channels.filter(c=>['google','meta'].includes(c.channel));
  const paidBookings=available?paid.reduce((n,c)=>n+c.bookings,0):null;
  const paidSpend=paid.every(c=>c.spend!==null&&c.currency==='EUR')?paid.reduce((n,c)=>n+c.spend,0):null;
  return {available,complete,partial:available&&!complete,coverage:source.coverage,sourceName:source.sourceName,sourceUrl:source.sourceUrl,sheetName:source.sheetName,updatedAt:source.updatedAt,duplicatesRemoved:source.duplicatesRemoved,channels,total,paidBookings,paidSpend,costPaidBooking:complete&&paidSpend!==null&&paidBookings>0?paidSpend/paidBookings:null,visitTracking:source.visitTracking,method:'inquiry_cohort_current_status'};
}
