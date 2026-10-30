import {validateDeliveryImport} from './kpi-delivery.mjs';
const totals=s=>s.daily.reduce((a,r)=>({orders:a.orders+r.orders,cents:a.cents+r.amountCents}),{orders:0,cents:0});
export function deliverySyncFreshness(status,enabled,now=Date.now()){
  return {enabled,status:!enabled?'disabled':!status?.lastSuccessAt?'awaiting_first_sync':status.status==='error'?'error':now-Date.parse(status.lastSuccessAt)>2*3600000?'stale':'ok',lastAttemptAt:status?.lastAttemptAt||null,lastSuccessAt:status?.lastSuccessAt||null};
}
export async function acceptDeliverySync(cache,input,{now=new Date(),today}={}){
  const previous=await cache.get('crm-milo-delivery',{type:'json'});
  const status=await cache.get('milo-delivery-sync-status',{type:'json'});
  const timestamp=now.toISOString();
  if(input?.status==='error'){
    await cache.setJSON('milo-delivery-sync-status',{status:'error',lastAttemptAt:timestamp,lastSuccessAt:status?.lastSuccessAt||null});return {retained:true};
  }
  try{
    const source=validateDeliveryImport(input);
    if(!previous||source.sourceUrl!==previous.sourceUrl||source.coverage.from!==previous.coverage.from||source.coverage.to!==today||source.completeThrough!==new Date(Date.parse(today)-86400000).toISOString().slice(0,10)||!source.kitchenDaily)throw Error('Unexpected source scope');
    const age=now-Date.parse(source.updatedAt);
    if(age< -60000||age>15*60000||Date.parse(source.updatedAt)<Date.parse(previous.updatedAt))throw Error('Stale source snapshot');
    if(source.updatedAt===previous.updatedAt){
      if(JSON.stringify(source.daily)!==JSON.stringify(previous.daily)||JSON.stringify(source.kitchenDaily)!==JSON.stringify(previous.kitchenDaily))throw Error('Conflicting replay');
      await cache.setJSON('milo-delivery-sync-status',{status:'ok',lastAttemptAt:timestamp,lastSuccessAt:status?.lastSuccessAt||timestamp});
      return {coverage:previous.coverage,updatedAt:previous.updatedAt,orders:totals(previous).orders,replayed:true};
    }
    // A falling ID inventory can indicate a partial read or removed rows; reconcile manually.
    if(totals(source).orders<totals(previous).orders)throw Error('Source inventory shrank');
    const next=validateDeliveryImport({...source,sendpulseCosts:previous.sendpulseCosts});
    await cache.setJSON('crm-milo-delivery',next);
    await cache.setJSON('milo-delivery-sync-status',{status:'ok',lastAttemptAt:timestamp,lastSuccessAt:timestamp});
    return {coverage:next.coverage,updatedAt:next.updatedAt,orders:totals(next).orders};
  }catch(error){
    await cache.setJSON('milo-delivery-sync-status',{status:'error',lastAttemptAt:timestamp,lastSuccessAt:status?.lastSuccessAt||null});
    throw Error('Не удалось проверить заказы. Последний достоверный срез сохранён.');
  }
}
