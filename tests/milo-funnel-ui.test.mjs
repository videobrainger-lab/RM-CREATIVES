import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildReport,comparisonRange} from '../netlify/lib/kpi-model.mjs';
import {miloFixture} from './fixtures/milo-dashboard.mjs';
const flush=async()=>{await new Promise(setImmediate);await new Promise(setImmediate)};
const report=(from='2026-10-01',to='2026-10-28',users=483)=>({version:1,status:'ok',requestedRange:{from,to},range:{from,to},timezone:'America/Los_Angeles',updatedAt:'2026-10-29T12:00:00Z',users,method:'independent_event_users',steps:['view_item','add_to_cart','begin_checkout','purchase'].map((event,i)=>({id:event,event,users:[30,47,7,37][i],events:[108,213,14,38][i],status:'ok'}))});
async function harness(onFunnel,project='milo'){
 const snapshot=miloFixture(),nodes=new Map(),handlers={},calls=[];
 let clock=Date.now();const Clock=class extends Date{static now(){return clock}};
 const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:true,innerHTML:'',textContent:'',events:{},addEventListener(name,cb){this.events[name]=cb},setAttribute(){},removeAttribute(){}});return nodes.get(id)};
 const document={getElementById:get,querySelectorAll:()=>[],addEventListener(name,cb){handlers[name]=cb}};
 const config={today:'2026-10-29',updatedAt:snapshot.updatedAt,configured:false,seoMilo:{},seoStatus:{status:'ok'}};
 const fetch=async path=>{
  calls.push(path);const u=new URL(path,'http://localhost');let body;
  if(path.includes('/status'))body=config;
  else if(path.includes('/milo-funnel'))body=await onFunnel(u);
  else {const from=u.searchParams.get('from'),to=u.searchParams.get('to'),old=comparisonRange(from,to);body={current:buildReport(snapshot,from,to),previous:buildReport(snapshot,old.from,old.to)}}
  return {ok:true,status:200,json:async()=>body};
 };
 vm.runInNewContext(fs.readFileSync(new URL('../public/internal-assets/dashboard.js',import.meta.url),'utf8'),{document,Intl,Date:Clock,URL,URLSearchParams,location:new URL('http://localhost/internal/?project='+project),history:{replaceState(){}},setTimeout,clearTimeout,fetch});
 await flush();return {get,calls,advance:ms=>{clock+=ms},html:()=>get('content').innerHTML,change:async(id,value)=>{get(id).value=value;get(id).events.change();await flush()},click:async selector=>{handlers.click({target:{closest:s=>s===selector?{}:null}});await flush()}};
}
test('MILO shows independent user/event counts with honest scope, timezone and no funnel percentages',async()=>{
 const h=await harness(async u=>({report:report(u.searchParams.get('from'),u.searchParams.get('to'))}));
 const html=h.html().split('<section class="milo-funnel"')[1].split('</section>')[0];
 for(const text of ['Воронка заказов','483','30','47','37','213','America/Los_Angeles','кейтеринг','разделение по кухням недоступно','не подтверждена','Проценты потерь не рассчитываются'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('%'));assert.equal(h.calls.filter(s=>s.includes('/milo-funnel')).length,1);
 h.get('compare').events.change();await flush();assert.equal(h.calls.filter(s=>s.includes('/milo-funnel')).length,1);
});
test('loading and errors do not invent zero; explicit retry recovers without automatic retry loop',async()=>{
 let resolve;let count=0;const h=await harness(async u=>{count++;if(count===1)return new Promise(r=>resolve=r);return {report:report(u.searchParams.get('from'),u.searchParams.get('to'))}});
 assert.ok(h.html().includes('Загружаем GA4'));
 resolve({error:'failed'});await flush();assert.ok(h.html().includes('Не удалось обновить GA4'));assert.equal(count,1);
 await h.click('#milo-funnel-retry');assert.ok(h.html().includes('483'));assert.equal(count,2);
});
test('missing event is not zero and actual clamped Pacific period is labelled',async()=>{
 const h=await harness(async u=>{const r=report(u.searchParams.get('from'),u.searchParams.get('to'));r.range.to='2026-10-27';r.steps[1]={id:'add_to_cart',users:null,events:null,status:'missing'};return {report:r}});
 const html=h.html().split('<section class="milo-funnel"')[1].split('</section>')[0];
 assert.ok(html.includes('28.10.2026'));assert.ok(html.includes('27.10.2026'));assert.ok(html.includes('нет данных'));assert.ok(html.includes('Нет зарегистрированных данных'));
});
test('late response cannot replace newer selected range, and switching projects cannot display MILO diagnostic elsewhere',async()=>{
 const pending=[];const h=await harness(u=>new Promise(resolve=>pending.push({u,resolve})));
 await h.change('from','2026-10-05');assert.equal(pending.length,2);
 const newer=pending[1];newer.resolve({report:report('2026-10-05','2026-10-28',222)});await flush();assert.ok(h.html().includes('222'));
 pending[0].resolve({report:report('2026-10-01','2026-10-28',999)});await flush();assert.ok(!h.html().includes('999'));
 await h.change('project-select','epiline');assert.ok(!h.html().includes('milo-funnel-title'));
 await h.change('project-select','milo');assert.ok(h.html().includes('222'));assert.equal(pending.length,2);
});
test('stale same-range server cache remains labelled and can be retried',async()=>{
 const h=await harness(async u=>({report:report(u.searchParams.get('from'),u.searchParams.get('to')),stale:true,error:'upstream'}));
 assert.ok(h.html().includes('последний доступный срез этого же периода'));assert.ok(h.html().includes('483'));assert.ok(h.html().includes('Повторить загрузку GA4'));
});
test('other projects never start a GA4 diagnostic query',async()=>{
 const h=await harness(()=>{throw Error('must not query')},'epiline');assert.ok(!h.calls.some(s=>s.includes('/milo-funnel')));assert.ok(!h.html().includes('milo-funnel-title'));
});
test('retry keeps same-period cached values while loading, never relabels them as a different range',async()=>{
 let count=0,resolve;const h=await harness(async u=>{count++;return count===1?{report:report(u.searchParams.get('from'),u.searchParams.get('to')),stale:true,error:'upstream'}:new Promise(r=>resolve=r)});
 await h.click('#milo-funnel-retry');assert.ok(h.html().includes('483'));assert.ok(h.html().includes('предыдущий срез этого же периода'));assert.equal(count,2);
 resolve({report:report('2026-10-01','2026-10-28',500)});await flush();assert.ok(h.html().includes('500'));assert.ok(!h.html().includes('предыдущий срез этого же периода'));
});
test('fresh report with cache warning is not labelled stale and warning is escaped',async()=>{
 const h=await harness(async u=>({report:report(u.searchParams.get('from'),u.searchParams.get('to')),stale:false,error:'Свежие данные получены; <cache> не сохранён.'}));
 const html=h.html();assert.ok(html.includes('483'));assert.ok(html.includes('&lt;cache&gt;'));assert.ok(!html.includes('Не удалось получить свежие данные'));assert.ok(!html.includes('Повторить загрузку GA4'));
});
test('client period cache expires after an hour on next render without a timer',async()=>{
 let count=0;const h=await harness(async u=>{count++;return {report:report(u.searchParams.get('from'),u.searchParams.get('to'),count===1?483:501)}});
 h.advance(3599999);h.get('compare').events.change();await flush();assert.equal(count,1);
 h.advance(1);h.get('compare').events.change();await flush();assert.equal(count,2);assert.ok(h.html().includes('501'));
 h.get('compare').events.change();await flush();assert.equal(count,2);
});
