import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCrmReport, validateCrmImport } from '../netlify/lib/kpi-crm.mjs';
const source=()=>({version:1,project:'denta',sourceName:'Fixture CRM',sourceUrl:'https://docs.google.com/spreadsheets/d/example123/edit',sheetName:'Inquiries',updatedAt:'2026-10-22T10:00:00Z',coverage:{from:'2026-10-07',to:'2026-10-22'},visitTracking:false,duplicatesRemoved:2,daily:[{date:'2026-10-15',channel:'google',inquiries:12,forms:4,calls:8,bookings:3,bookingsMissingDate:2,attendedMarked:0},{date:'2026-10-15',channel:'meta',inquiries:5,forms:5,calls:0,bookings:2,bookingsMissingDate:2,attendedMarked:0},{date:'2026-10-15',channel:'unattributed',inquiries:9,forms:2,calls:7,bookings:1,bookingsMissingDate:1,attendedMarked:0}]});
const ads=[{channel:'google',spend:90,currency:'EUR'},{channel:'meta',spend:60,currency:'EUR'}];
test('CRM counts source outcomes, separates calls and prices only paid-source bookings',()=>{
 const r=buildCrmReport(source(),'2026-10-15','2026-10-21',ads);
 assert.equal(r.total.inquiries,17);assert.equal(r.total.calls,8);assert.equal(r.total.forms,9);
 assert.equal(r.total.bookings,5);assert.equal(r.paidBookings,5);assert.equal(r.costPaidBooking,30);
 assert.equal(r.channels[0].costBooking,30);assert.equal(r.channels[1].costBooking,30);
 assert.deepEqual(r.channels.map(c=>c.channel),['google','meta']);assert.equal(r.total.attended,null);
 assert.equal(r.total.bookingsMissingDate,4);
});
test('partial CRM periods retain known counts but never calculate mismatched CPA',()=>{
 const r=buildCrmReport(source(),'2026-10-01','2026-10-21',ads);
 assert.equal(r.partial,true);assert.equal(r.total.bookings,5);assert.equal(r.costPaidBooking,null);assert.equal(r.channels[0].costBooking,null);
 const before=buildCrmReport(source(),'2026-09-01','2026-09-30',ads);
 assert.equal(before.available,false);assert.equal(before.total.inquiries,null);assert.equal(before.total.bookings,null);
});
test('CRM import allowlists aggregates, strips patient fields and rejects inconsistent/duplicate counters',()=>{
 const s=source();s.daily[0].patientName='must not persist';s.patientPhone='must not persist';
 const clean=validateCrmImport(s);
 assert.equal('patientPhone' in clean,false);assert.equal('patientName' in clean.daily[0],false);
 const wrong=source();wrong.daily[0].forms=100;assert.throws(()=>validateCrmImport(wrong));
 const duplicate=source();duplicate.daily.push({...duplicate.daily[0]});assert.throws(()=>validateCrmImport(duplicate));
 const badUrl=source();badUrl.sourceUrl='https://evil.example/';assert.throws(()=>validateCrmImport(badUrl));
});
