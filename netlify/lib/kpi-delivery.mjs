import { validateRange } from './kpi-model.mjs';
export function validateDeliveryImport(s){
 if(s?.version!==1||s.project!=='milo-delivery')throw Error('Invalid delivery source');
 validateRange(s.coverage?.from,s.coverage?.to);
 if(!Number.isFinite(Date.parse(s.updatedAt))||!/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\//.test(s.sourceUrl||'')||typeof s.sourceName!=='string'||s.sourceName.length>150||!Array.isArray(s.daily)||s.daily.length>6000)throw Error('Invalid delivery metadata');
 const keys=new Set();
 for(const r of s.daily){validateRange(r.date,r.date);const k=r.date+':'+r.channel;if(!['google','meta','other'].includes(r.channel)||keys.has(k)||r.date<s.coverage.from||r.date>s.coverage.to||!Number.isSafeInteger(r.orders)||r.orders<0||!Number.isSafeInteger(r.amountCents)||r.amountCents<0)throw Error('Invalid delivery counts');keys.add(k);}
 return {version:1,project:s.project,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,coverage:{from:s.coverage.from,to:s.coverage.to},daily:s.daily.map(({date,channel,orders,amountCents})=>({date,channel,orders,amountCents}))};
}
export function buildDeliveryReport(s,from,to,ads=[]){
 if(!s)return null;
 const available=to>=s.coverage.from&&from<=s.coverage.to,complete=from>=s.coverage.from&&to<=s.coverage.to;
 const channels=['google','meta'].map(channel=>{const rows=s.daily.filter(r=>r.channel===channel&&r.date>=from&&r.date<=to),ad=ads.find(c=>c.channel===channel);const orders=available?rows.reduce((n,r)=>n+r.orders,0):null,amount=available?rows.reduce((n,r)=>n+r.amountCents,0)/100:null,spend=ad?.spend??null;return {channel,orders,amount,spend,currency:ad?.currency||'EUR',costOrder:complete&&spend!==null&&orders>0?spend/orders:null};});
 const orders=available?channels.reduce((n,r)=>n+r.orders,0):null,amount=available?channels.reduce((n,r)=>n+r.amount,0):null,spend=channels.every(r=>r.spend!==null&&r.currency==='EUR')?channels.reduce((n,r)=>n+r.spend,0):null;
 return {available,complete,partial:available&&!complete,coverage:s.coverage,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,channels,total:{orders,amount,spend,costOrder:complete&&spend!==null&&orders>0?spend/orders:null},method:'orders_received_not_payment'};
}
