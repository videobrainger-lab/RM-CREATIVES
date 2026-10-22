import {validateRange} from './kpi-model.mjs';
const COUNTS=['leads','qualified','paidLeads','receivedCents','paymentUnknown'];
export function validateServicesImport(s){
 if(s?.version!==1||s.project!=='milo-services')throw Error('Invalid services source');
 validateRange(s.coverage?.from,s.coverage?.to);
 if(!Number.isFinite(Date.parse(s.updatedAt))||!/^https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+\//.test(s.sourceUrl||'')||typeof s.sourceName!=='string'||s.sourceName.length>150||!Array.isArray(s.daily)||s.daily.length>6000)throw Error('Invalid services metadata');
 const keys=new Set();for(const r of s.daily){validateRange(r.date,r.date);const key=r.date+':'+r.channel;if(!['google','meta','other'].includes(r.channel)||keys.has(key)||r.date<s.coverage.from||r.date>s.coverage.to||!COUNTS.every(k=>Number.isSafeInteger(r[k])&&(k==='receivedCents'||r[k]>=0))||r.qualified>r.leads||r.paidLeads+r.paymentUnknown>r.leads)throw Error('Invalid services counts');keys.add(key);}
 return {version:1,project:s.project,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,coverage:{from:s.coverage.from,to:s.coverage.to},daily:s.daily.map(r=>Object.fromEntries(['date','channel',...COUNTS].map(k=>[k,r[k]])))};
}
export function buildServicesReport(s,from,to,ads=[]){
 if(!s)return null;const available=to>=s.coverage.from&&from<=s.coverage.to,complete=from>=s.coverage.from&&to<=s.coverage.to;
 const channels=['google','meta'].map(channel=>{const rows=s.daily.filter(r=>r.channel===channel&&r.date>=from&&r.date<=to),counts=Object.fromEntries(COUNTS.map(k=>[k,available?rows.reduce((n,r)=>n+r[k],0):null])),ad=ads.find(c=>c.channel===channel),spend=ad?.spend??null;return {channel,...counts,paidLeads:available&&counts.paymentUnknown===0?counts.paidLeads:null,received:available&&counts.paymentUnknown===0?counts.receivedCents/100:null,spend,currency:ad?.currency||'EUR',costLead:complete&&spend!==null&&counts.leads>0?spend/counts.leads:null,costQualified:complete&&spend!==null&&counts.qualified>0?spend/counts.qualified:null};});
 return {available,complete,partial:available&&!complete,coverage:s.coverage,sourceName:s.sourceName,sourceUrl:s.sourceUrl,updatedAt:s.updatedAt,channels,method:'lead_cohort_current_outcomes'};
}
