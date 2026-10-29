import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {buildReport,comparisonRange} from '../netlify/lib/kpi-model.mjs';
import {miloFixture} from './fixtures/milo-dashboard.mjs';
function fixture(){
 const s=miloFixture();s.accounts.denta={google:'denta-google',meta:'denta-meta'};s.accounts.epiline={google:'epiline-google',meta:'epiline-meta'};
 for(const [project,google,meta,currency] of [['denta',11,22,'EUR'],['epiline',42,84,'USD']]){
  for(const date of ['2026-10-15','2026-10-22']){
   s.google.push({date,account_id:s.accounts[project].google,campaign_id:project,campaign:project,spend:google,currency,conversions:1});
   s.meta.push({date,account_id:s.accounts[project].meta,campaign_id:project,campaign:project,spend:meta,account_currency:'EUR'});
  }
 }
 s.crm.denta={version:1,project:'denta',sourceName:'DENTA fixture only',sourceUrl:'https://docs.google.com/spreadsheets/d/fixture/edit',updatedAt:s.updatedAt,coverage:s.coverage,visitTracking:false,duplicatesRemoved:0,daily:[{date:'2026-10-22',channel:'google',inquiries:3,forms:1,calls:2,bookings:1,bookingsMissingDate:0,attendedMarked:0}]};
 return s;
}
async function harness(project){
 const s=fixture(),nodes=new Map(),handlers={};
 const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'',checked:true,innerHTML:'',textContent:'',events:{},addEventListener(name,cb){this.events[name]=cb},setAttribute(){},removeAttribute(){}});return nodes.get(id)};
 get('period').value='7';
 const config={today:'2026-10-29',updatedAt:s.updatedAt,configured:true,status:{status:'ok'},seoMilo:{},seoStatus:{status:'ok'},crmDenta:{coverage:{from:'2026-09-01',to:'2026-10-22'}},crmMiloDelivery:{coverage:{from:'2026-09-01',to:'2026-10-28'}},crmMiloServices:{coverage:{from:'2026-10-01',to:'2026-10-25'}}};
 const context={document:{getElementById:get,querySelectorAll:()=>[],addEventListener(name,cb){handlers[name]=cb}},Intl,URL,URLSearchParams,location:new URL('http://localhost/internal/?project='+project),history:{replaceState(){}},setTimeout:()=>0,clearTimeout(){},fetch:async path=>{
  const u=new URL(path,'http://localhost');const from=u.searchParams.get('from'),to=u.searchParams.get('to');
  if(path.endsWith('/status'))return {ok:true,status:200,json:async()=>config};
  const previous=comparisonRange(from,to,u.searchParams.get('comparison'));
  return {ok:true,status:200,json:async()=>({current:buildReport(s,from,to),previous:buildReport(s,previous.from,previous.to)})};
 }};
 vm.runInNewContext(fs.readFileSync(new URL('../public/internal-assets/dashboard.js',import.meta.url),'utf8'),context);
 const settle=async()=>{await new Promise(setImmediate);await new Promise(setImmediate)};await settle();
 return {get,settle,sidebar(value){handlers.click({target:{closest:selector=>selector==='[data-project]'?{dataset:{project:value}}:null}})},dropdown(value){get('project-select').value=value;get('project-select').events.change()}};
}
const expectStatus=(h,project)=>{
 const status=h.get('status').textContent;
 if(project==='denta'){assert.match(status,/DENTA CRM: срез 22 окт/);assert.doesNotMatch(status,/MILO|EPILINE/);}
 if(project==='epiline'){assert.match(status,/EPILINE CRM: не подключено/);assert.doesNotMatch(status,/DENTA|MILO/);assert.ok(!h.get('content').innerHTML.includes('Реальные результаты · DENTA'));}
 if(project==='milo'){assert.match(status,/MILO · доставка CRM: срез 28 окт/);assert.match(status,/MILO · услуги CRM: срез 25 окт/);assert.doesNotMatch(status,/DENTA|EPILINE/);}
 if(project==='all')assert.doesNotMatch(status,/DENTA|MILO|EPILINE|CRM: срез/);
};
for(const project of ['denta','epiline','milo','all'])test('direct '+project+' link scopes freshness to the selected project',async()=>{expectStatus(await harness(project),project)});
test('sidebar and dropdown changes immediately recompute freshness without another data fetch',async()=>{
 const h=await harness('denta');
 for(const project of ['epiline','milo','denta','all','epiline']){h.sidebar(project);expectStatus(h,project);h.dropdown(project);expectStatus(h,project);}
 assert.match(h.get('page-title').innerHTML,/EPILINE/);assert.ok(h.get('content').innerHTML.includes('42,00'));
});
test('date changes retain the correct source freshness and project data',async()=>{
 const h=await harness('epiline');h.get('from').value='2026-10-01';h.get('from').events.change();await h.settle();expectStatus(h,'epiline');
 assert.ok(h.get('content').innerHTML.includes('84,00'));assert.ok(!h.get('content').innerHTML.includes('DENTA fixture only'));
 h.dropdown('milo');h.get('to').value='2026-10-21';h.get('to').events.change();await h.settle();expectStatus(h,'milo');
 h.sidebar('denta');expectStatus(h,'denta');
});
test('model keeps three advertising account scopes and attaches DENTA CRM only to DENTA',()=>{
 const report=buildReport(fixture(),'2026-10-22','2026-10-28');const denta=report.projects.find(p=>p.id==='denta'),epiline=report.projects.find(p=>p.id==='epiline'),milo=report.projects.find(p=>p.id==='milo');
 assert.equal(denta.groups[0].channels[0].spend,11);assert.equal(epiline.groups[0].channels[0].spend,42);assert.equal(epiline.groups[0].channels[0].currency,'USD');
 assert.equal(denta.crm.total.inquiries,3);assert.equal(epiline.crm,undefined);assert.equal(milo.crm,undefined);assert.equal(epiline.deliveryCrm,undefined);
});
