// Add to the existing bound MILO Apps Script project only after release approval.
// User properties belong to the trigger owner, not all spreadsheet editors.
function miloPulseConfig_(){
  const p=PropertiesService.getUserProperties();
  const sheetId=p.getProperty('MILO_PULSE_SPREADSHEET_ID'),token=p.getProperty('MILO_PULSE_SYNC_TOKEN');
  if(p.getProperty('MILO_PULSE_ENABLED')!=='true'||!sheetId||!token||token.length<32)throw Error('MILO Pulse activation is incomplete');
  return {sheetId,token};
}
function miloPulsePost_(payload,cfg){
  const response=UrlFetchApp.fetch('https://rmcreatives.com/internal/milo-delivery-sync',{
    method:'post',contentType:'application/json',payload:JSON.stringify(payload),
    headers:{Authorization:'Bearer '+cfg.token},
    muteHttpExceptions:true,followRedirects:false,validateHttpsCertificates:true
  });
  if(response.getResponseCode()!==200)throw Error('MILO Pulse sync was not accepted');
  const body=JSON.parse(response.getContentText());if(!body.ok)throw Error('MILO Pulse sync was not confirmed');
}
function miloPulseRead_(){
  const cfg=miloPulseConfig_(),ss=SpreadsheetApp.openById(cfg.sheetId);
  if(ss.getSpreadsheetTimeZone()!=='Europe/Riga')throw Error('Unexpected source timezone');
  const sheet=ss.getSheets().find(s=>s.getSheetId()===20261022);
  if(!sheet||sheet.getName()!=='Заказы доставки'||sheet.getLastColumn()!==5)throw Error('Unexpected delivery sheet');
  const last=sheet.getLastRow();if(last<2||last>50001)throw Error('Unexpected source size');
  const read=()=>sheet.getRange(1,1,last,5).getValues().map(r=>r.map(v=>v instanceof Date?Utilities.formatDate(v,'Europe/Riga','yyyy-MM-dd'):v));
  const rows=read();
  // A consistent full read, never just append: old order edits and late records are included.
  if(sheet.getLastRow()!==last||JSON.stringify(rows)!==JSON.stringify(read()))throw Error('Source changed during read');
  const today=Utilities.formatDate(new Date(),'Europe/Riga','yyyy-MM-dd');
  const yesterday=new Date(Date.parse(today+'T12:00:00Z')-86400000).toISOString().slice(0,10);
  return {cfg,snapshot:deliverySheetSnapshot(rows,{sourceName:'MILO Café — Заказы доставки',sourceUrl:'https://docs.google.com/spreadsheets/d/'+cfg.sheetId+'/edit?gid=20261022',updatedAt:new Date().toISOString(),coverage:{from:'2026-09-01',to:today},completeThrough:yesterday})};
}
function miloPulseDeliverySync(){
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  let cfg;
  try{cfg=miloPulseConfig_();const result=miloPulseRead_();miloPulsePost_(result.snapshot,cfg);}
  catch(error){
    if(cfg){try{miloPulsePost_({status:'error'},cfg);}catch(ignored){}}
    // Never log upstream response text, credentials, IDs, comments, or order records.
    throw Error('MILO Pulse sync was not confirmed. Check current snapshot, authorization, schema and source consistency before retry.');
  }finally{lock.releaseLock();}
}
// Safe inspection: does not transmit or alter orders. No raw values in the result.
function miloPulseDeliveryDryRun(){
  const s=miloPulseRead_().snapshot;
  return {coverage:s.coverage,completeThrough:s.completeThrough,uniqueOrders:s.sourceStats.uniqueOrders,duplicatesRemoved:s.sourceStats.duplicatesRemoved,amountCents:s.daily.reduce((n,r)=>n+r.amountCents,0),kitchens:s.kitchenDaily.reduce((a,r)=>(a[r.kitchen]=(a[r.kitchen]||0)+r.orders,a),{})};
}
function inspectMiloPulseHourly(){
  return ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='miloPulseDeliverySync').map(t=>({handler:t.getHandlerFunction(),type:String(t.getEventType())}));
}
// Run explicitly once after approval and inspecting triggers under every existing owner.
// Never remove or replace unrelated triggers. One creator owns this hourly job.
function installMiloPulseHourly(){
  miloPulseConfig_();const existing=inspectMiloPulseHourly();
  if(existing.length>1)throw Error('Multiple MILO Pulse triggers; reconcile before activation');
  if(existing.length===1)return {alreadyInstalled:true};
  ScriptApp.newTrigger('miloPulseDeliverySync').timeBased().everyHours(1).create();
  return {installed:true};
}
