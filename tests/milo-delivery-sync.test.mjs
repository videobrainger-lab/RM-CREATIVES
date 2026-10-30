import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs';
import {DELIVERY_HEADERS,deliverySheetSnapshot,normalizeOrderId,deliveryKitchen,sheetDate} from '../netlify/lib/kpi-delivery-sheet.mjs';
import {acceptDeliverySync,deliverySyncFreshness,latestDeliveryStatus,importDeliverySnapshot} from '../netlify/lib/kpi-delivery-sync.mjs';
import {buildDeliveryReport,validateDeliveryImport} from '../netlify/lib/kpi-delivery.mjs';
const now=new Date('2026-10-30T10:00:00Z'),today='2026-10-30';
const metadata={sourceName:'Synthetic delivery',sourceUrl:'https://docs.google.com/spreadsheets/d/fixture/edit?gid=20261022',updatedAt:now.toISOString(),coverage:{from:'2026-09-01',to:today},completeThrough:'2026-10-29'};
const rows=()=>[DELIVERY_HEADERS,['2026-09-05','Tilda:1:2','Google Ads',12.34,'Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Aleksandra Čaka iela 74A'],['2026-10-29','id2','Другое',20,'🆕 ЗАКАЗ №123\n🛵 Доставка · кухня: Kārļa Ulmaņa gatve 199\nutm_source=sendpulse'],['2026-10-30','id3','Не определён',5,'landing=centrs']];
const source=()=>deliverySheetSnapshot(rows(),structuredClone(metadata));
const cache=()=>{const map=new Map([['crm-milo-delivery',{...source(),updatedAt:'2026-10-29T10:00:00Z',sendpulseCosts:{currency:'EUR',complete:true,coverage:{from:'2026-09-01',to:'2026-10-29'},sourceUrl:'https://login.sendpulse.com/emailservice/tasks/',daily:[],emailSubscription:{monthlyCents:4900,basis:'owner_declared'}}}]]);let revision=0;return {map,get:async k=>structuredClone(map.get(k)),getWithMetadata:async k=>map.has(k)?{data:structuredClone(map.get(k)),etag:String(revision)}:null,setJSON:async(k,v,opts={})=>{if(opts.onlyIfMatch!==undefined&&opts.onlyIfMatch!==String(revision)||opts.onlyIfNew&&map.has(k))return {modified:false};map.set(k,structuredClone(v));revision++;return {modified:true,etag:String(revision)}}}};
test('full source reconciles kitchens; unrelated landing never sets kitchen',()=>{const s=validateDeliveryImport(source()),r=buildDeliveryReport(s,'2026-09-01',today);assert.equal(r.allTotal.orders,3);assert.deepEqual(r.kitchens.map(k=>k.orders),[1,1,1]);assert.equal(r.kitchens.reduce((a,k)=>a+k.orders,0),r.allTotal.orders);assert.equal(r.partial,true);assert.equal(r.allTotal.averageOrderValue,null);assert.equal(r.allTotal.amount,37.34);});
test('known kitchen variants normalize, arbitrary mentions do not',()=>{assert.equal(deliveryKitchen('Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: KARLA ULMANA GATVE 199'),'highway');assert.equal(deliveryKitchen('Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Центр'),'center');assert.equal(deliveryKitchen('Ответ об источнике: Центр'),'unknown');assert.throws(()=>deliveryKitchen('Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Центр\nКухня: Трасса'));});
test('normalizes stable IDs and removes identical duplicate notifications',()=>{const a=rows();a.push([...a[1]]);a[4][1]=' 1:2 ';const s=deliverySheetSnapshot(a,metadata);assert.equal(normalizeOrderId('Tilda:1:2'),'1:2');assert.equal(s.sourceStats.uniqueOrders,3);assert.equal(s.sourceStats.duplicatesRemoved,1);a[4][3]=99;assert.throws(()=>deliverySheetSnapshot(a,metadata));});
test('invalid amounts, schema, dates, empty source and conflicting attribution fail closed',()=>{for(const mutate of [a=>a[1][3]=12.345,a=>a[1][0]='2026-02-30',a=>a[0]=['banket'],a=>a[1][4]='utm_source=sendpulse']){const a=rows();mutate(a);assert.throws(()=>deliverySheetSnapshot(a,metadata));}assert.throws(()=>deliverySheetSnapshot([DELIVERY_HEADERS],metadata));assert.equal(sheetDate(46296.99),'2026-10-01');});
test('complete calendar days and kitchen counts use selected range',()=>{const r=buildDeliveryReport(source(),'2026-09-01','2026-09-30');assert.equal(r.complete,true);assert.equal(r.allTotal.orders,1);assert.equal(r.allTotal.ordersPerDay,1/30);assert.deepEqual(r.kitchens.map(k=>k.orders),[1,0,0]);});
test('old snapshots keep kitchen counts missing and disclose all as unassigned',()=>{const s=source();delete s.kitchenDaily;const r=buildDeliveryReport(s,'2026-09-01',today);assert.deepEqual(r.kitchens.map(k=>k.orders),[null,null,3]);assert.equal(r.kitchenCoverage,false);});
test('rejects kitchen counts or amounts that disagree with overall source',()=>{const s=source();s.kitchenDaily[0].orders++;assert.throws(()=>validateDeliveryImport(s));});
test('changed old orders and late records replace whole snapshot without double count; costs preserved',async()=>{const c=cache(),a=rows();a[1][3]=13;a.push(['2026-09-07','late','Meta Ads',10,'Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Трасса']);const s=deliverySheetSnapshot(a,metadata);await acceptDeliverySync(c,s,{now,today});const stored=c.map.get('crm-milo-delivery');assert.equal(stored.daily.reduce((a,r)=>a+r.orders,0),4);assert.equal(stored.daily.reduce((a,r)=>a+r.amountCents,0),4800);assert.equal(stored.sendpulseCosts.emailSubscription.monthlyCents,4900);assert.equal(c.map.get('crm-milo-delivery')._sync.status,'ok');assert.equal((await acceptDeliverySync(c,s,{now,today})).replayed,true);assert.equal(c.map.get('crm-milo-delivery').daily.reduce((a,r)=>a+r.orders,0),4);});
test('wrong source, shrinking inventory, incomplete or stale reads retain previous snapshot',async()=>{for(const mutate of [s=>s.sourceUrl=s.sourceUrl.replace('fixture','other'),s=>s.coverage.from='2026-09-02',s=>s.updatedAt='2026-10-30T09:00:00Z',s=>s.completeThrough=today,s=>{s.daily.pop();s.kitchenDaily.pop();}]){const c=cache(),before=structuredClone(c.map.get('crm-milo-delivery')),s=source();mutate(s);await assert.rejects(()=>acceptDeliverySync(c,s,{now,today}));assert.deepEqual(c.map.get('crm-milo-delivery'),before);assert.equal(c.map.get('milo-delivery-sync-status').status,'error');}});
test('explicit read error preserves snapshot and prior successful freshness',async()=>{const c=cache(),before=structuredClone(c.map.get('crm-milo-delivery'));c.map.set('milo-delivery-sync-status',{status:'ok',lastSuccessAt:'2026-10-30T09:00:00Z'});await acceptDeliverySync(c,{status:'error'},{now,today});assert.deepEqual(c.map.get('crm-milo-delivery'),before);assert.equal(c.map.get('milo-delivery-sync-status').lastSuccessAt,'2026-10-30T09:00:00Z');assert.equal(deliverySyncFreshness(c.map.get('milo-delivery-sync-status'),true,now.valueOf()).status,'error');});
test('freshness distinguishes disabled, first sync, stale and current',()=>{assert.equal(deliverySyncFreshness(null,false).status,'disabled');assert.equal(deliverySyncFreshness(null,true).status,'awaiting_first_sync');assert.equal(deliverySyncFreshness({status:'ok',lastSuccessAt:'2026-10-30T07:00:00Z'},true,+now).status,'stale');assert.equal(deliverySyncFreshness({status:'ok',lastSuccessAt:'2026-10-30T09:00:00Z'},true,+now).status,'ok');});
test('Apps Script transformation is generated exactly from tested module',()=>{const pure=fs.readFileSync(new URL('../netlify/lib/kpi-delivery-sheet.mjs',import.meta.url),'utf8').replace(/^export /gm,'');assert.equal(fs.readFileSync(new URL('../integrations/google-apps-script/MiloPulseTransform.gs',import.meta.url),'utf8'),pure);});
test('Apps Script hourly installer is idempotent and never edits other triggers',()=>{let installed=0;const context={PropertiesService:{getUserProperties:()=>({getProperty:k=>k==='MILO_PULSE_SYNC_TOKEN'?'synthetic-test-token-at-least-32-characters':'true'})},ScriptApp:{getProjectTriggers:()=>installed?[{getHandlerFunction:()=> 'miloPulseDeliverySync',getEventType:()=> 'CLOCK'}]:[{getHandlerFunction:()=> 'unrelated'}],newTrigger:name=>{assert.equal(name,'miloPulseDeliverySync');return {timeBased:()=>({everyHours:n=>{assert.equal(n,1);return {create:()=>installed++}}})}}}};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../integrations/google-apps-script/MiloPulseRunner.gs',import.meta.url),'utf8'),context);context.installMiloPulseHourly();context.installMiloPulseHourly();assert.equal(installed,1);});
test('kitchen metrics use own revenue and all calendar days, never average averages',()=>{const a=[DELIVERY_HEADERS,['2026-09-01','a','Google Ads',10,'Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Центр'],['2026-09-02','b','Meta Ads',30,'Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Центр'],['2026-09-02','c','Meta Ads',100,'Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Трасса']];const r=buildDeliveryReport(deliverySheetSnapshot(a,metadata),'2026-09-01','2026-09-30');assert.equal(r.kitchenComplete,true);assert.deepEqual(r.kitchens.slice(0,2).map(k=>({orders:k.orders,amount:k.amount,average:k.averageOrderValue,perDay:k.ordersPerDay})),[{orders:2,amount:40,average:20,perDay:2/30},{orders:1,amount:100,average:100,perDay:1/30}]);assert.equal(r.allTotal.averageOrderValue,140/3);assert.equal(r.kitchens.reduce((a,k)=>a+k.amount,0),r.allTotal.amount);});
test('dedicated sync token has no dashboard rights; shared password cannot submit sync',async()=>{
 const {default:handler}=await import('../netlify/functions/internal.mjs');
 process.env.RM_DASHBOARD_PASSWORD='synthetic-only';delete process.env.RM_MILO_DELIVERY_SYNC_ENABLED;
 const url='https://rmcreatives.com/internal/milo-delivery-sync',basic='Basic '+Buffer.from('rm:synthetic-only').toString('base64'),token='Bearer synthetic-test-token-at-least-32-characters';
 let r=await handler(new Request(url,{method:'POST'}));assert.equal(r.status,409);assert.match(r.headers.get('cache-control'),/private, no-store/);assert.match(r.headers.get('x-robots-tag'),/noindex/);
 process.env.RM_MILO_DELIVERY_SYNC_ENABLED='true';process.env.RM_MILO_DELIVERY_SYNC_TOKEN=token.slice(7);
 try{
  for(const authorization of ['',basic]){r=await handler(new Request(url,{method:'POST',headers:{authorization}}));assert.equal(r.status,401);}
  r=await handler(new Request('https://rmcreatives.com/internal/status',{headers:{authorization:token}}));assert.equal(r.status,401);
  r=await handler(new Request(url,{method:'POST',headers:{authorization:token,origin:'https://foreign.example'}}));assert.equal(r.status,403);
  r=await handler(new Request(url,{method:'POST',headers:{authorization:token}}));assert.equal(r.status,415);
 }finally{delete process.env.RM_MILO_DELIVERY_SYNC_ENABLED;delete process.env.RM_MILO_DELIVERY_SYNC_TOKEN;}
});
test('Apps Script exporter transmits aggregates only, never IDs/comments, and preserves the source',()=>{
  const r=rows(),calls=[],props={MILO_PULSE_ENABLED:'true',MILO_PULSE_SPREADSHEET_ID:'fixture',MILO_PULSE_SYNC_TOKEN:'synthetic-test-token-at-least-32-characters'};
  const sheet={getSheetId:()=>20261022,getName:()=> 'Заказы доставки',getLastColumn:()=>5,getLastRow:()=>r.length,getRange:()=>({getValues:()=>r})};
  const ctx={PropertiesService:{getUserProperties:()=>({getProperty:k=>props[k]})},SpreadsheetApp:{openById:id=>({getSpreadsheetTimeZone:()=> 'Europe/Riga',getSheets:()=>[sheet]})},Utilities:{formatDate:()=> '2026-10-30',base64Encode:s=>Buffer.from(s).toString('base64')},LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock(){}})},UrlFetchApp:{fetch:(url,opt)=>{calls.push({url,opt});return {getResponseCode:()=>200,getContentText:()=>'{"ok":true}'}}}};
  vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../integrations/google-apps-script/MiloPulseTransform.gs',import.meta.url),'utf8')+'\n'+fs.readFileSync(new URL('../integrations/google-apps-script/MiloPulseRunner.gs',import.meta.url),'utf8'),ctx);
  const before=JSON.stringify(r);ctx.miloPulseDeliverySync();assert.equal(calls.length,1);const payload=calls[0].opt.payload;for(const privateValue of ['Tilda:1:2','id2','id3','Aleksandra','utm_source'])assert.ok(!payload.includes(privateValue));assert.ok(JSON.parse(payload).kitchenDaily);assert.equal(JSON.stringify(r),before);assert.equal(calls[0].url,'https://rmcreatives.com/internal/milo-delivery-sync');
});

test('first failed sync is error, not awaiting a first sync',()=>{assert.equal(deliverySyncFreshness({status:'error'},true,+now).status,'error');});
test('success and snapshot persist atomically without a second status write',async()=>{
 const c=cache(),write=c.setJSON;let writes=0;c.setJSON=async(k,...args)=>{writes++;assert.equal(k,'crm-milo-delivery');return write(k,...args)};
 await acceptDeliverySync(c,source(),{now,today});assert.equal(writes,1);assert.equal(c.map.get('crm-milo-delivery')._sync.lastSuccessAt,now.toISOString());
});
test('concurrent replacement rejects stale revision without losing newer data or cost edits',async()=>{
 const c=cache(),write=c.setJSON;let raced=false;c.setJSON=async(k,v,opts)=>{
  if(k==='crm-milo-delivery'&&!raced){raced=true;const newer=structuredClone(c.map.get(k));newer.updatedAt='2026-10-30T10:01:00Z';newer.sendpulseCosts.emailSubscription.monthlyCents=5000;await write(k,newer);}
  return write(k,v,opts);
 };
 await assert.rejects(()=>acceptDeliverySync(c,source(),{now,today}));assert.equal(c.map.get('crm-milo-delivery').updatedAt,'2026-10-30T10:01:00Z');assert.equal(c.map.get('crm-milo-delivery').sendpulseCosts.emailSubscription.monthlyCents,5000);
});
test('network failure after committed write is reconciled by read, not falsely retained',async()=>{
 const c=cache(),write=c.setJSON;c.setJSON=async(k,...args)=>{const r=await write(k,...args);if(k==='crm-milo-delivery')throw Error('lost acknowledgement');return r};
 const r=await acceptDeliverySync(c,source(),{now,today});assert.equal(r.confirmedAfterRead,true);assert.equal(c.map.get('crm-milo-delivery')._sync.status,'ok');
});
test('newer atomic success supersedes old failure telemetry',()=>{
 const success={status:'ok',lastAttemptAt:now.toISOString(),lastSuccessAt:now.toISOString()},error={status:'error',lastAttemptAt:'2026-10-30T09:00:00Z'};
 assert.equal(latestDeliveryStatus(success,error).status,'ok');assert.equal(latestDeliveryStatus(success,{...error,lastAttemptAt:'2026-10-30T11:00:00Z'}).lastSuccessAt,success.lastSuccessAt);
});
test('stored history beyond 366 days remains valid without changing UI range policy',async()=>{
 const s=source();s.coverage.to='2027-09-02';s.completeThrough='2027-09-01';s.updatedAt='2027-09-02T10:00:00Z';assert.doesNotThrow(()=>validateDeliveryImport(s));
 await acceptDeliverySync(cache(),s,{now:new Date(s.updatedAt),today:'2027-09-02'});
});
test('manual delivery restore also uses a conditional write and rejects old timestamps',async()=>{
 const c=cache();await importDeliverySnapshot(c,validateDeliveryImport(source()));const old=source();old.updatedAt='2026-10-29T01:00:00Z';await assert.rejects(()=>importDeliverySnapshot(c,old));
});
test('sync-only credential cannot read GA4 and unauthenticated requests reveal no report',async()=>{
 const {default:handler}=await import('../netlify/functions/internal.mjs');process.env.RM_DASHBOARD_PASSWORD='synthetic-only';
 for(const authorization of ['', 'Bearer synthetic-test-token-at-least-32-characters']){
  const r=await handler(new Request('https://rmcreatives.com/internal/milo-funnel?from=2026-10-01&to=2026-10-28',{headers:{authorization}}));assert.equal(r.status,401);assert.match(r.headers.get('cache-control'),/no-store/);
 }
});
test('structured pickup headers assign fulfillment kitchen without scanning free delivery addresses',async()=>{
 const {deliveryRouting}=await import('../netlify/lib/kpi-delivery-sheet.mjs');
 assert.deepEqual(deliveryRouting('🆕 ЗАКАЗ №123\n🥡 Самовывоз: Kārļa Ulmaņa gatve 199\nДополнительная информация'),{kitchen:'highway',fulfillment:'pickup'});
 assert.deepEqual(deliveryRouting('🆕 ЗАКАЗ №123\n🥡 Самовывоз: Aleksandra Čaka iela 74A'),{kitchen:'center',fulfillment:'pickup'});
 for(const comment of ['Кухня: Центр','Комментарий клиента\nКухня: Aleksandra Čaka iela 74A','Адрес клиента: Aleksandra Čaka iela 74A','Комментарий: заберу из Kārļa Ulmaņa gatve 199','Самовывоз: Aleksandra Čaka iela 74A','landing=/edienkarte-centrs','Заметка: 🥡 Самовывоз: Kārļa Ulmaņa gatve 199','🥡 Самовывоз: Kārļa Ulmaņa gatve 199','Комментарий клиента\n🥡 Самовывоз: Kārļa Ulmaņa gatve 199','🆕 ЗАКАЗ №123\nКомментарий клиента\n🥡 Самовывоз: Kārļa Ulmaņa gatve 199'])assert.equal(deliveryRouting(comment).kitchen,'unknown');
 assert.throws(()=>deliveryRouting('🆕 ЗАКАЗ №123\n🥡 Самовывоз: Kārļa Ulmaņa gatve 199',{MILO_kitchen:'home',MILO_fulfillment:'delivery'}));
 assert.throws(()=>deliveryRouting('🆕 ЗАКАЗ №123\n🥡 Самовывоз: Kārļa Ulmaņa gatve 199',{MILO_kitchen:'centre'}));
});
test('optional original checkout routing takes precedence over page hints but conflicts fail closed',async()=>{
 const {deliveryRouting}=await import('../netlify/lib/kpi-delivery-sheet.mjs');
 assert.deepEqual(deliveryRouting('landing=/edienkarte-centrs',{MILO_kitchen:'home',MILO_kitchen_address:'Kārļa Ulmaņa gatve 199',MILO_fulfillment:'delivery'}),{kitchen:'highway',fulfillment:'delivery'});
 assert.equal(deliveryRouting('',{MILO_kitchen:'centre'}).kitchen,'center');
 assert.throws(()=>deliveryRouting('Импорт CSV: fixture\nПлатёжная система: stripe\nКухня: Центр',{MILO_kitchen:'home'}));
 assert.throws(()=>deliveryRouting('',{MILO_kitchen:'home',MILO_kitchen_address:'Aleksandra Čaka iela 74A'}));
 assert.throws(()=>deliveryRouting('',{MILO_kitchen:'page-center'}));
});
test('pickup and delivery remain distinct when checking duplicate order IDs',()=>{
 const a=rows();a[1][4]='🆕 ЗАКАЗ №123\n🥡 Самовывоз: Aleksandra Čaka iela 74A';const b=[...a[1]];b[4]='🆕 ЗАКАЗ №123\n🛵 Доставка · кухня: Aleksandra Čaka iela 74A';a.push(b);assert.throws(()=>deliverySheetSnapshot(a,metadata));
 const s=deliverySheetSnapshot(rows(),metadata,{'id3':{MILO_kitchen:'centre',MILO_fulfillment:'delivery'}});assert.equal(s.kitchenDaily.filter(r=>r.kitchen==='center').reduce((n,r)=>n+r.orders,0),2);assert.equal(s.kitchenDaily.filter(r=>r.kitchen==='unknown').length,0);
});

test('historical kitchen comes only from the proven CSV envelope with optional UTM line',()=>{
 assert.equal(deliveryKitchen('Импорт CSV: fixture\nПлатёжная система: stripe\nutm_source=sms; utm_medium=base\nКухня: Kārļa Ulmaņa gatve 199'),'highway');
 assert.equal(deliveryKitchen('Импорт CSV: fixture\nПлатёжная система: stripe\nКомментарий клиента: текст\nКухня: Kārļa Ulmaņa gatve 199'),'unknown');
 assert.equal(deliveryKitchen('🆕 ЗАКАЗ №123\nКомментарий клиента\nКухня: Центр'),'unknown');
});
