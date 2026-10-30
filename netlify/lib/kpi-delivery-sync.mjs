import {validateDeliveryImport} from './kpi-delivery.mjs';
const DATA='crm-milo-delivery', STATUS='milo-delivery-sync-status';
const totals=s=>s.daily.reduce((a,r)=>({orders:a.orders+r.orders,cents:a.cents+r.amountCents}),{orders:0,cents:0});
export function latestDeliveryStatus(committed,attempt){
  if(!committed)return attempt;
  if(!attempt||Date.parse(committed.lastAttemptAt)>=Date.parse(attempt.lastAttemptAt))return committed;
  return {...attempt,lastSuccessAt:committed.lastSuccessAt||attempt.lastSuccessAt||null};
}
export function deliverySyncFreshness(status,enabled,now=Date.now()){
  return {enabled,status:!enabled?'disabled':status?.status==='error'?'error':!status?.lastSuccessAt?'awaiting_first_sync':now-Date.parse(status.lastSuccessAt)>2*3600000?'stale':'ok',lastAttemptAt:status?.lastAttemptAt||null,lastSuccessAt:status?.lastSuccessAt||null};
}
// Netlify Blobs conditional writes protect against another export or a manual import.
// No process-local mutex: different function instances must observe the same revision.
async function replace(cache,entry,value){
  if(entry&&!entry.etag)throw Error('Missing store revision');
  const result=await cache.setJSON(DATA,value,entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
  if(!result?.modified)throw Error('Concurrent delivery update; retry from a fresh read');
}
export async function importDeliverySnapshot(cache,source){
  const entry=await cache.getWithMetadata(DATA,{type:'json'});
  if(entry&&Date.parse(source.updatedAt)<Date.parse(entry.data.updatedAt))throw Error('Stale manual import');
  await replace(cache,entry,source);
}
export async function acceptDeliverySync(cache,input,{now=new Date(),today}={}){
  const entry=await cache.getWithMetadata(DATA,{type:'json'}),previous=entry?.data;
  const oldAttempt=await cache.get(STATUS,{type:'json'});
  const status=latestDeliveryStatus(previous?._sync,oldAttempt),timestamp=now.toISOString();
  const failed={status:'error',lastAttemptAt:timestamp,lastSuccessAt:status?.lastSuccessAt||null};
  // Failure telemetry is separate from the last good snapshot. It can never overwrite orders.
  const markFailure=async()=>{try{await cache.setJSON(STATUS,failed);}catch{/* Original failure remains unconfirmed, never claim retention. */}};
  if(input?.status==='error'){await markFailure();return {retained:true};}
  let next;
  try{
    const source=validateDeliveryImport(input);
    if(!previous||source.sourceUrl!==previous.sourceUrl||source.coverage.from!==previous.coverage.from||source.coverage.to!==today||source.completeThrough!==new Date(Date.parse(today)-86400000).toISOString().slice(0,10)||!source.kitchenDaily)throw Error('Unexpected source scope');
    const age=now-Date.parse(source.updatedAt);
    if(age< -60000||age>15*60000||Date.parse(source.updatedAt)<Date.parse(previous.updatedAt))throw Error('Stale source snapshot');
    const replayed=source.updatedAt===previous.updatedAt;
    if(replayed&&(JSON.stringify(source.daily)!==JSON.stringify(previous.daily)||JSON.stringify(source.kitchenDaily)!==JSON.stringify(previous.kitchenDaily)))throw Error('Conflicting replay');
    if(totals(source).orders<totals(previous).orders)throw Error('Source inventory shrank');
    // The success timestamp and orders commit in ONE conditional write, not two blobs.
    next={...validateDeliveryImport({...source,sendpulseCosts:previous.sendpulseCosts}),_sync:{status:'ok',lastAttemptAt:timestamp,lastSuccessAt:timestamp}};
    await replace(cache,entry,next);
    return {coverage:next.coverage,updatedAt:next.updatedAt,orders:totals(next).orders,...(replayed?{replayed:true}:{})};
  }catch{
    // A transport failure may occur after a successful commit. Read before declaring failure.
    if(next){try{const actual=await cache.get(DATA,{type:'json'});if(JSON.stringify(actual)===JSON.stringify(next))return {coverage:next.coverage,updatedAt:next.updatedAt,orders:totals(next).orders,confirmedAfterRead:true};}catch{}}
    await markFailure();
    throw Error('Синхронизация заказов не подтверждена. Проверьте текущий срез перед повтором.');
  }
}
