// Pure transformation shared with the Apps Script exporter. No customer fields persist.
export const DELIVERY_HEADERS=['Дата заказа','Номер заказа','Источник','Сумма заказа, EUR','Комментарий'];
export function normalizeOrderId(value){
  const id=String(value??'').normalize('NFKC').trim().replace(/^tilda\s*:\s*/i,'').toLowerCase();
  if(!id||id.length>180)throw Error('Invalid order ID');
  return id;
}
const kitchenLabel=value=>{
  const v=String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  return ({'aleksandra caka iela 74a':'center','центр':'center','centrs':'center','karla ulmana gatve 199':'highway','трасса':'highway','trase':'highway'})[v]||'unknown';
};
// Optional original checkout fields are an explicit input, not inferred from page/UTM/address.
// The current five-column sheet supplies only the structured system header below.
export function deliveryRouting(comment,raw={}){
  const candidates=[],lines=String(comment||'').split('\n').map(x=>x.trim()).filter(Boolean);
  // Verified notification envelope: order number first, fulfillment header second.
  // Never discover a kitchen by scanning an address or a quoted line in customer comments.
  if(/^🆕\s*ЗАКАЗ\s*№\s*\d+$/u.test(lines[0]||'')){
    const pickup=/^🥡\s*самовывоз\s*:\s*(.+)$/iu.exec(lines[1]||''),delivery=/^🛵\s*доставка\s*·\s*кухня\s*:\s*(.+)$/iu.exec(lines[1]||'');
    if(pickup||delivery)candidates.push({kitchen:kitchenLabel((pickup||delivery)[1]),fulfillment:pickup?'pickup':'delivery'});
  }
  // Historical CSV imports use their own verified envelope, not a free-text kitchen search.
  if(/^Импорт CSV(?:\s|[.:]|$)/u.test(lines[0]||'')&&/^Плат[её]жная система\s*:/iu.test(lines[1]||'')){
    let i=/^utm_source=[^;\n]+;\s*utm_medium=[^;\n]+$/i.test(lines[2]||'')?3:2;
    for(;i<lines.length;i++){
      const legacy=/^кухня\s*:\s*(.+)$/iu.exec(lines[i]);
      if(!legacy)break;
      candidates.push({kitchen:kitchenLabel(legacy[1]),fulfillment:'unknown'});
    }
  }
  const code=String(raw.MILO_kitchen||'').trim(),address=String(raw.MILO_kitchen_address||'').trim(),mode=String(raw.MILO_fulfillment||'').trim();
  if(code||address||mode){
    if(code&&!['home','centre'].includes(code)||mode&&!['delivery','pickup'].includes(mode))throw Error('Invalid checkout routing');
    const kitchen=code?({home:'highway',centre:'center'})[code]:kitchenLabel(address);
    if(address&&(kitchenLabel(address)==='unknown'||kitchenLabel(address)!==kitchen))throw Error('Conflicting checkout kitchen');
    if(kitchen!=='unknown')candidates.unshift({kitchen,fulfillment:mode||'unknown'});
  }
  const kitchens=new Set(candidates.map(x=>x.kitchen)),modes=new Set(candidates.map(x=>x.fulfillment).filter(x=>x!=='unknown'));
  if(kitchens.size>1||modes.size>1)throw Error('Conflicting fulfillment routing');
  return {kitchen:candidates[0]?.kitchen||'unknown',fulfillment:[...modes][0]||mode||'unknown'};
}
export function deliveryKitchen(comment,raw){return deliveryRouting(comment,raw).kitchen;}
export function sheetChannel(source,comment){
  const s=String(source||'').trim().toLowerCase();
  const explicit=/^(?:utm_source|ответ об источнике|источник)\s*[:=]\s*sendpulse\s*$/im.test(String(comment||''));
  if(explicit&&['google ads','meta ads'].includes(s))throw Error('Conflicting attribution');
  if(explicit||s==='sendpulse')return 'sendpulse';
  return ({'google ads':'google','meta ads':'meta','не определён':'unknown','не определен':'unknown','':'unknown','unknown':'unknown','рекомендация':'referral','organic search':'organic','direct':'direct','email':'email'})[s]||'other';
}
export function sheetDate(value){
  // Sheets numeric dates are local wall dates, not UTC instants.
  if(typeof value==='number'&&Number.isFinite(value)&&value>0)return new Date(Math.floor(value)*86400000+Date.UTC(1899,11,30)).toISOString().slice(0,10);
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value)return value;
  throw Error('Invalid local order date');
}
export function sheetCents(value){
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||Math.abs(value*100-Math.round(value*100))>1e-6||!Number.isSafeInteger(Math.round(value*100)))throw Error('Invalid EUR amount');
  return Math.round(value*100);
}
export function deliverySheetSnapshot(rows,metadata,routingByOrderId={}){
  if(!Array.isArray(rows)||JSON.stringify(rows[0])!==JSON.stringify(DELIVERY_HEADERS)||rows.length>50001)throw Error('Unexpected delivery schema');
  const ids=new Map(),daily=new Map(),kitchens=new Map();let duplicatesRemoved=0;
  for(const row of rows.slice(1)){
    if(row.every(v=>v===''||v===null||v===undefined))continue;
    const id=normalizeOrderId(row[1]),date=sheetDate(row[0]),amountCents=sheetCents(row[3]),channel=sheetChannel(row[2],row[4]),{kitchen,fulfillment}=deliveryRouting(row[4],routingByOrderId[id]);
    if(date<metadata.coverage.from||date>metadata.coverage.to)throw Error('Order outside source coverage');
    const order={date,amountCents,channel,kitchen,fulfillment};
    if(ids.has(id)){if(JSON.stringify(ids.get(id))!==JSON.stringify(order))throw Error('Conflicting duplicate order');duplicatesRemoved++;continue;}
    ids.set(id,order);
    for(const [map,dimension,value] of [[daily,'channel',channel],[kitchens,'kitchen',kitchen]]){
      const key=date+':'+value,r=map.get(key)||{date,[dimension]:value,orders:0,amountCents:0};r.orders++;r.amountCents+=amountCents;map.set(key,r);
    }
  }
  if(!ids.size)throw Error('Empty source; last good snapshot retained');
  return {...metadata,version:2,project:'milo-delivery',allSources:true,currency:'EUR',daily:[...daily.values()],kitchenDaily:[...kitchens.values()],sourceStats:{uniqueOrders:ids.size,duplicatesRemoved}};
}
