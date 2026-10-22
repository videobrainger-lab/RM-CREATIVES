import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReport, previousRange, direction, validateRange } from '../netlify/lib/kpi-model.mjs';
import { session, authenticated, sameOrigin } from '../netlify/lib/kpi-auth.mjs';
const coverage={from:'2026-07-24',to:'2026-10-21'};
const sources={google:{status:'ok'},meta:{status:'ok'},events:{status:'ok'},definitions:{status:'ok'}};
const assignments={'delivery-id':'delivery','services-id':'services'};
const base=()=>({accounts:{denta:{google:'google-denta',meta:'meta-denta'},epiline:{google:'google-epiline',meta:'meta-epiline'},milo:{google:'google-milo',meta:'meta-milo'}},campaignDirections:assignments,coverage,sources,google:[],meta:[],events:[],actionDefinitions:[]});
test('password, signed session, expiry and CSRF checks',()=>{
  process.env.RM_DASHBOARD_PASSWORD='test-only-long-password';
  const req=(token)=>new Request('https://rmcreatives.com/internal/data',{headers:{cookie:'__Host-rm_internal='+token}});
  assert.equal(authenticated(req(session(process.env.RM_DASHBOARD_PASSWORD))),true);
  assert.equal(authenticated(req(session('wrong-password'))),false);
  assert.equal(authenticated(req(session(process.env.RM_DASHBOARD_PASSWORD,Date.now()-1000))),false);
  assert.equal(authenticated(req('bad.signature')),false);
  assert.equal(authenticated(new Request('https://rmcreatives.com/internal')),false);
  assert.equal(sameOrigin(new Request('https://rmcreatives.com/internal/settings',{headers:{origin:'https://evil.example'}})),false);
  assert.equal(sameOrigin(new Request('https://rmcreatives.com/internal/settings')),false);
  assert.equal(sameOrigin(new Request('https://rmcreatives.com/internal/settings',{headers:{origin:'https://rmcreatives.com'}})),true);
});
test('periods are inclusive with correct equal-length comparison and strict validation',()=>{
  assert.deepEqual(previousRange('2026-10-15','2026-10-21'),{from:'2026-10-08',to:'2026-10-14'});
  assert.throws(()=>validateRange('2026-02-30','2026-03-02'));
  assert.throws(()=>validateRange('2026-10-21','2026-10-15'));
  const s=base();
  const report=buildReport(s,'2026-07-01','2026-07-30');
  assert.equal(report.covered,false);
  assert.equal(report.projects[0].groups[0].channels[0].spend,null);
});
test('MILO allocates by ID, leaves brand/shared spend outside delivery CPA',()=>{
  assert.equal(direction('milo','shared-id',assignments),'shared');
  assert.equal(direction('milo','services-id',assignments),'services');
  assert.equal(direction('milo','delivery-id',assignments),'delivery');
  const s=base();
  s.google=[{date:'2026-10-21',account_id:'google-milo',campaign_id:'delivery-id',campaign:'renamed',currency:'EUR',spend:100,conversions:20,all_conversions:30},{date:'2026-10-21',account_id:'google-milo',campaign_id:'shared-id',currency:'EUR',spend:50,conversions:10,all_conversions:10}];
  s.actionDefinitions=[{account_id:'google-milo',conversion_action_name:'purchase',conversion_action_primary_for_goal:'True',conversion_action_category:'PURCHASE'},{account_id:'google-milo',conversion_action_name:'cart',conversion_action_primary_for_goal:'False',conversion_action_category:'ADD_TO_CART'}];
  s.events=[{date:'2026-10-21',account_id:'google-milo',campaign_id:'delivery-id',conversion_action_name:'purchase',all_conversions:5,all_conversions_value:200},{date:'2026-10-21',account_id:'google-milo',campaign_id:'delivery-id',conversion_action_name:'cart',all_conversions:10}];
  const p=buildReport(s,'2026-10-15','2026-10-21').projects.find(p=>p.id==='milo');
  const c=p.groups.find(g=>g.id==='delivery').channels[0];
  assert.equal(c.spend,100);assert.equal(c.purchases,5);assert.equal(c.costPurchase,20);assert.equal(c.secondary,10);assert.equal(c.revenue,200);assert.equal(c.roas,2);
  assert.equal(c.primary,20);assert.equal(c.qualified,null);
});
test('unknown classification is unavailable; appointment category does not imply actual booking',()=>{
  const s=base();
  s.google=[{date:'2026-10-21',account_id:'google-denta',campaign_id:'x',currency:'EUR',spend:10,conversions:1,all_conversions:4}];
  s.events=[{date:'2026-10-21',account_id:'google-denta',campaign_id:'x',conversion_action_name:'form',all_conversions:4}];
  let c=buildReport(s,'2026-10-15','2026-10-21').projects[0].groups[0].channels[0];
  assert.equal(c.secondary,null);
  s.actionDefinitions=[{account_id:'google-denta',conversion_action_name:'form',conversion_action_primary_for_goal:'False',conversion_action_category:'BOOK_APPOINTMENT'}];
  c=buildReport(s,'2026-10-15','2026-10-21').projects[0].groups[0].channels[0];
  assert.equal(c.secondary,4);assert.equal(c.bookings,0);assert.equal(c.crmBookings,null);assert.equal(c.costBooking,null);
});
test('missing source and actual zero are different, and EPILINE retains USD / EUR',()=>{
  const s=base();s.sources={...sources,meta:{status:'error'}};
  const report=buildReport(s,'2026-10-15','2026-10-21');
  const channels=report.projects.find(p=>p.id==='epiline').groups[0].channels;
  assert.equal(channels[0].currency,'USD');assert.equal(channels[0].spend,0);
  assert.equal(channels[1].currency,'EUR');assert.equal(channels[1].spend,null);
});
