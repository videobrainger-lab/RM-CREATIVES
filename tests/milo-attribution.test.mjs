import test from 'node:test';
import assert from 'node:assert/strict';
import {advance,classify,fields,MODEL,WINDOW_MS,validateOrderAttribution} from '../integrations/milo-attribution/attribution.mjs';
const now=Date.parse('2026-10-23T10:00:00Z'),url='https://milo-cafe.lv/ru';
const seo=advance(null,{url,referrer:'https://www.google.lv/search?q=sushi',now,consent:true});
test('SEO persists on direct return without extending its original 30-day window',()=>{
  assert.equal(seo.channel,'seo');
  const kept=advance(seo,{url,now:now+29*86400000,consent:true});assert.deepEqual(kept,seo);
  assert.equal(advance(seo,{url,now:now+WINDOW_MS,consent:true}),null);
});
test('a later paid entry replaces SEO; later search replaces paid entry',()=>{
  const ads=advance(seo,{url:url+'?gclid=test',referrer:'https://www.google.com/',now:now+1000,consent:true});
  assert.equal(ads.channel,'google_ads');
  assert.equal(advance(ads,{url,referrer:'https://www.google.lv/',now:now+2000,consent:true}).channel,'seo');
  assert.equal(classify(url+'?utm_source=social&utm_medium=cpc').channel,'meta_ads');
  assert.equal(classify(url+'?utm_source=partner&utm_medium=cpc').channel,'paid_other');
});
test('internal navigation, reload and payment return do not become new touches',()=>{
  assert.deepEqual(advance(seo,{url:url+'?gclid=test',referrer:'https://milo-cafe.lv/',now:now+1000,consent:true}),seo);
  assert.deepEqual(advance(seo,{url,referrer:'https://www.google.lv/',now:now+1000,consent:true,navigation:'reload'}),seo);
  assert.deepEqual(advance(seo,{url,referrer:'https://checkout.stripe.com/',now:now+1000,consent:true}),seo);
});
test('AI, email and ordinary referrals replace earlier search; lookalike hosts are not search',()=>{
  assert.equal(classify(url,'https://chatgpt.com/').channel,'ai');
  assert.equal(classify(url,'https://google.com.evil.example/').channel,'referral');
  assert.equal(advance(seo,{url:url+'?utm_source=newsletter&utm_medium=email',now:now+1000,consent:true}).channel,'email');
  assert.equal(advance(seo,{url,referrer:'https://example.com/',now:now+1000,consent:true}).channel,'referral');
});
test('denied/revoked analytics consent clears attribution; unknown is never inferred as SEO',()=>{
  assert.equal(advance(seo,{url,now,consent:false}),null);
  assert.equal(fields(null).MILO_attribution_channel,'unknown');
  assert.equal(classify(url+'?utm_source=google').channel,'referral');
});
test('order contract validates model, timestamp, expiry and strips arbitrary data',()=>{
  const payload=fields(seo,now);
  assert.equal(validateOrderAttribution(payload,new Date(now+1000).toISOString()).channel,'seo');
  assert.equal(validateOrderAttribution({...payload,MILO_attribution_model:'first_touch'},new Date(now).toISOString()),null);
  assert.equal(validateOrderAttribution(payload,new Date(now+WINDOW_MS).toISOString()),null);
  assert.equal(validateOrderAttribution(payload,new Date(now-1).toISOString()),null);
  assert.equal(payload.MILO_attribution_model,MODEL);
  assert.equal(Object.keys(payload).length,5);
  assert.equal(JSON.stringify(payload).includes('q=sushi'),false);
});
