// Pure transformation shared with the Apps Script exporter. No customer fields persist.
const DELIVERY_HEADERS=['Дата заказа','Номер заказа','Источник','Сумма заказа, EUR','Комментарий'];
function normalizeOrderId(value){
  const id=String(value??'').normalize('NFKC').trim().replace(/^tilda\s*:\s*/i,'').toLowerCase();
  if(!id||id.length>180)throw Error('Invalid order ID');
  return id;
}
function deliveryKitchen(comment){
  const lines=String(comment||'').split('\n').filter(l=>/^(?:🛵\s*доставка\s*·\s*)?кухня\s*:/iu.test(l.trim()));
  const kitchens=new Set(lines.map(l=>{
    const v=l.split(':').slice(1).join(':').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
    if(['aleksandra caka iela 74a','центр','centrs'].includes(v))return 'center';
    if(['karla ulmana gatve 199','трасса','trase'].includes(v))return 'highway';
    return 'unknown';
  }));
  if(kitchens.size>1)throw Error('Conflicting kitchen');
  return [...kitchens][0]||'unknown';
}
function sheetChannel(source,comment){
  const s=String(source||'').trim().toLowerCase();
  const explicit=/^(?:utm_source|ответ об источнике|источник)\s*[:=]\s*sendpulse\s*$/im.test(String(comment||''));
  if(explicit&&['google ads','meta ads'].includes(s))throw Error('Conflicting attribution');
  if(explicit||s==='sendpulse')return 'sendpulse';
  return ({'google ads':'google','meta ads':'meta','не определён':'unknown','не определен':'unknown','':'unknown','unknown':'unknown','рекомендация':'referral','organic search':'organic','direct':'direct','email':'email'})[s]||'other';
}
function sheetDate(value){
  // Sheets numeric dates are local wall dates, not UTC instants.
  if(typeof value==='number'&&Number.isFinite(value)&&value>0)return new Date(Math.floor(value)*86400000+Date.UTC(1899,11,30)).toISOString().slice(0,10);
  if(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value).toISOString().slice(0,10)===value)return value;
  throw Error('Invalid local order date');
}
function sheetCents(value){
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||Math.abs(value*100-Math.round(value*100))>1e-6||!Number.isSafeInteger(Math.round(value*100)))throw Error('Invalid EUR amount');
  return Math.round(value*100);
}
function deliverySheetSnapshot(rows,metadata){
  if(!Array.isArray(rows)||JSON.stringify(rows[0])!==JSON.stringify(DELIVERY_HEADERS)||rows.length>50001)throw Error('Unexpected delivery schema');
  const ids=new Map(),daily=new Map(),kitchens=new Map();let duplicatesRemoved=0;
  for(const row of rows.slice(1)){
    if(row.every(v=>v===''||v===null||v===undefined))continue;
    const id=normalizeOrderId(row[1]),date=sheetDate(row[0]),amountCents=sheetCents(row[3]),channel=sheetChannel(row[2],row[4]),kitchen=deliveryKitchen(row[4]);
    if(date<metadata.coverage.from||date>metadata.coverage.to)throw Error('Order outside source coverage');
    const order={date,amountCents,channel,kitchen};
    if(ids.has(id)){if(JSON.stringify(ids.get(id))!==JSON.stringify(order))throw Error('Conflicting duplicate order');duplicatesRemoved++;continue;}
    ids.set(id,order);
    for(const [map,dimension,value] of [[daily,'channel',channel],[kitchens,'kitchen',kitchen]]){
      const key=date+':'+value,r=map.get(key)||{date,[dimension]:value,orders:0,amountCents:0};r.orders++;r.amountCents+=amountCents;map.set(key,r);
    }
  }
  if(!ids.size)throw Error('Empty source; last good snapshot retained');
  return {...metadata,version:2,project:'milo-delivery',allSources:true,currency:'EUR',daily:[...daily.values()],kitchenDaily:[...kitchens.values()],sourceStats:{uniqueOrders:ids.size,duplicatesRemoved}};
}
