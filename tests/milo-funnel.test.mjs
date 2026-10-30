import test from 'node:test';
import assert from 'node:assert/strict';
import {buildMiloFunnel,emptyMiloFunnel,fetchMiloFunnel,miloFunnelRange} from '../netlify/lib/kpi-milo-funnel.mjs';
const now=new Date('2026-10-30T06:30:00Z'); // Still October29 in the property's timezone.
const from='2026-10-22',to='2026-10-28';
const totals=[{totalusers:483,property_timezone:'America/Los_Angeles'}];
const events=[['view_item',30,108],['add_to_cart',47,213],['begin_checkout',7,14],['purchase',37,38]].map(([event_name,totalusers,event_count])=>({event_name,totalusers,event_count}));
test('whole-period distinct users and independent stages are preserved, not forced into a funnel',()=>{
  const r=buildMiloFunnel(from,to,totals,events,now);
  assert.equal(r.users,483);assert.deepEqual(r.steps.map(s=>s.users),[30,47,7,37]);assert.equal(r.status,'ok');
  assert.equal(r.method,'independent_event_users');assert.equal(r.deliveryOnly,false);assert.equal(r.kitchenAvailable,false);
  assert.equal(r.timezone,'America/Los_Angeles');assert.ok(!JSON.stringify(r).includes('conversion'));assert.ok(!JSON.stringify(r).includes('loss'));
});
test('range uses complete Pacific days, not Riga or UTC yesterday; DST dates remain calendar based',()=>{
  assert.deepEqual(miloFunnelRange(from,'2026-10-30',now).range,{from,to:'2026-10-28'});
  assert.equal(miloFunnelRange('2026-10-29','2026-10-30',now).range,null);
  assert.equal(miloFunnelRange('2026-11-01','2026-11-04',new Date('2026-11-02T07:30:00Z')).range,null);
  assert.equal(miloFunnelRange('2026-11-01','2026-11-04',new Date('2026-11-02T09:30:00Z')).range.to,'2026-11-01');
  assert.throws(()=>miloFunnelRange('2026-02-30',to,now));
});
test('missing event reports and empty reports are unknown, explicit zeros remain zero',()=>{
  const r=buildMiloFunnel(from,to,totals,events.slice(0,3),now);
  assert.equal(r.status,'partial');assert.equal(r.steps[3].users,null);assert.equal(r.steps[3].events,null);
  assert.equal(buildMiloFunnel(from,to,[],[],now).users,null);
  const z=buildMiloFunnel(from,to,[{totalusers:'0'}],[{event_name:'purchase',totalusers:0,event_count:0}],now);
  assert.equal(z.users,0);assert.equal(z.steps[3].users,0);
  assert.equal(emptyMiloFunnel('2026-10-29','2026-10-30',now).status,'no_complete_days');
});
test('duplicate/daily rows, wrong timezone, wrong property and invalid counts fail closed',()=>{
  for(const e of [[...events,events[0]],[{...events[0],date:from}],[{...events[0],totalusers:-1}],[{...events[0],event_count:null}],[{...events[0],property_timezone:'Europe/Riga'}],[{...events[0],account_id:'other'}],[{...events[0],totalusers:200}]])assert.throws(()=>buildMiloFunnel(from,to,totals,e,now));
  assert.throws(()=>buildMiloFunnel(from,to,[...totals,...totals],events,now));
});
test('fetch requests exactly whole-period totals and event counts without date dimension',async()=>{
  const calls=[];
  const r=await fetchMiloFunnel({from,to,key:'synthetic-key',account:'413689112',now,pull:async(...args)=>{calls.push(args);return args[1].includes('event_name')?events:totals;}});
  assert.equal(r.users,483);assert.equal(calls.length,2);
  for(const c of calls){assert.equal(c[0],'googleanalytics4');assert.ok(!c[1].includes('date'));assert.equal(c[2],from);assert.equal(c[3],to);assert.deepEqual(c[5],['413689112']);}
});
test('no full day avoids upstream calls; failures are sanitized and never converted to zeros',async()=>{
  const bad=async()=>{throw Error('https://example.test/?api_key=secret');};
  await assert.rejects(()=>fetchMiloFunnel({from,to,key:'synthetic-key',account:'413689112',now,pull:bad}),e=>!e.message.includes('secret')&&e.message.includes('GA4'));
  assert.equal((await fetchMiloFunnel({from:'2026-10-30',to:'2026-10-30',now,pull:bad})).status,'no_complete_days');
  await assert.rejects(()=>fetchMiloFunnel({from,to,key:'synthetic-key',account:'wrong',now,pull:bad}),/not configured/);
});

test('cache hit within one hour avoids both credentials lookup and upstream calls',async()=>{
  const {getCachedMiloFunnel}=await import('../netlify/lib/kpi-milo-funnel.mjs');
  const previous=buildMiloFunnel(from,to,totals,events,new Date(+now-1800000));let readKey;
  const result=await getCachedMiloFunnel({from,to,now,cache:{get:async k=>(readKey=k,previous)},getSettings:()=>{throw Error('must not read settings');},pull:()=>{throw Error('must not query');}});
  assert.equal(readKey,'milo-funnel-v1/'+from+'/'+to);assert.equal(result.report,previous);assert.equal(result.stale,false);
});
test('stale cache survives upstream error, no-cache failure returns a sanitized 502 envelope',async()=>{
  const {getCachedMiloFunnel}=await import('../netlify/lib/kpi-milo-funnel.mjs');
  const previous=buildMiloFunnel(from,to,totals,events,new Date(+now-7200000));let writes=0;
  const args={from,to,now,account:'413689112',getSettings:async()=>({windsorKey:'synthetic-key'}),pull:async()=>{throw Error('secret-url');}};
  const r=await getCachedMiloFunnel({...args,cache:{get:async()=>previous,setJSON:async()=>writes++}});
  assert.equal(r.report,previous);assert.equal(r.stale,true);assert.equal(writes,0);assert.ok(!r.error.includes('secret'));
  const missing=await getCachedMiloFunnel({...args,cache:{get:async()=>null}});assert.equal(missing.statusCode,502);assert.equal(missing.report,undefined);
});
test('Pacific date advancement invalidates a fresh cached clamped range',async()=>{
  const {getCachedMiloFunnel}=await import('../netlify/lib/kpi-milo-funnel.mjs');
  const before=new Date('2026-10-30T06:50:00Z'),after=new Date('2026-10-30T07:10:00Z'),selectedTo='2026-10-30';
  const previous=buildMiloFunnel(from,selectedTo,totals,events,before);let calls=0,saved;
  const r=await getCachedMiloFunnel({from,to:selectedTo,now:after,cache:{get:async()=>previous,setJSON:async(k,v)=>saved=v},account:'413689112',getSettings:async()=>({windsorKey:'synthetic-key'}),pull:async(...args)=>{calls++;assert.equal(args[3],'2026-10-29');return args[1].includes('event_name')?events:totals;}});
  assert.equal(calls,2);assert.equal(r.report.range.to,'2026-10-29');assert.equal(saved,r.report);
});
test('cache read/write failures still return valid source data and never zero the previous report',async()=>{
  const {getCachedMiloFunnel}=await import('../netlify/lib/kpi-milo-funnel.mjs');
  const args={from,to,now,account:'413689112',getSettings:async()=>({windsorKey:'synthetic-key'}),pull:async(...args)=>args[1].includes('event_name')?events:totals};
  let stored;
  const readFailure=await getCachedMiloFunnel({...args,cache:{get:async()=>{throw Error('secret');},setJSON:async(k,v)=>stored=v}});
  assert.equal(readFailure.report.users,483);assert.equal(stored.users,483);assert.equal(readFailure.stale,false);
  const previous=buildMiloFunnel(from,to,totals,events,new Date(+now-7200000));
  const writeFailure=await getCachedMiloFunnel({...args,cache:{get:async()=>previous,setJSON:async()=>{throw Error('secret');}}});
  assert.equal(writeFailure.report.users,483);assert.equal(writeFailure.stale,false);assert.ok(writeFailure.error.includes('кэш'));assert.ok(!writeFailure.error.includes('secret'));
});
