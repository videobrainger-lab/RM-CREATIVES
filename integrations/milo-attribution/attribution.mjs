export const MODEL = 'last_non_direct_30d_v1';
export const WINDOW_MS = 30 * 86400000;
export const STORAGE_KEY = 'milo_attribution_30d_v1';
export const CHANNELS = ['seo','google_ads','meta_ads','paid_other','ai','email','social','referral'];
const own = host => host === 'milo-cafe.lv' || host === 'www.milo-cafe.lv';
const domain = (host, base) => host === base || host.endsWith('.'+base);
const searches = ['google.com','google.lv','google.lt','google.ee','google.co.uk','google.de','google.fi','google.se','google.ru','bing.com','duckduckgo.com','search.yahoo.com','yandex.com','yandex.ru','search.brave.com'];
const ai = ['chatgpt.com','chat.openai.com','perplexity.ai','gemini.google.com','copilot.microsoft.com','claude.ai'];
const social = ['facebook.com','instagram.com','t.co','tiktok.com','vk.com'];
// Payment returns do not represent a new acquisition touch.
const payments = ['checkout.stripe.com','payments.stripe.com','hooks.stripe.com','paypal.com'];
const text = (value, max) => typeof value === 'string' && value.length <= max && !/[\u0000-\u001f<>]/.test(value);
export function validTouch(value, now) {
  return !!value && value.model === MODEL && CHANNELS.includes(value.channel) &&
    text(value.source,100) && text(value.medium,40) && Number.isSafeInteger(value.touchedAt) &&
    value.touchedAt <= now && now-value.touchedAt < WINDOW_MS;
}
export function classify(url, referrer = '') {
  let u, ref;
  try { u=new URL(url); } catch { return null; }
  try { ref=new URL(referrer); } catch { ref=null; }
  const p=u.searchParams, source=(p.get('utm_source')||'').trim().toLowerCase(), medium=(p.get('utm_medium')||'').trim().toLowerCase(), host=ref?.hostname.toLowerCase()||'';
  const paid=/^(cpc|ppc|paid.*|display|cpm|cpv)$/.test(medium);
  const googleClick=['gclid','gbraid','wbraid'].some(k=>!!p.get(k));
  const meta=source==='social'||/^(facebook|fb|instagram|ig|meta)$/.test(source)||p.get('utm_source_platform')==='meta';
  if(googleClick)return {channel:'google_ads',source:'google',medium:'cpc'};
  if(paid)return {channel:meta?'meta_ads':/^(google|adwords|googleads)$/.test(source)?'google_ads':'paid_other',source:text(source,100)&&source?source:'paid',medium};
  if(source&&text(source,100)&&text(medium,40)) {
    if(ai.some(h=>source===h||source===h.replace('.com','').replace('.ai','')))return {channel:'ai',source,medium:medium||'referral'};
    if(medium==='organic'&&searches.some(h=>source===h||source===h.split('.')[0]))return {channel:'seo',source,medium:'organic'};
    if(/^(email|e-mail)$/.test(medium))return {channel:'email',source,medium:'email'};
    if(/^(social|social-network|organic_social)$/.test(medium))return {channel:'social',source,medium};
    // A tagged campaign with an unknown medium is not labelled organic.
    return {channel:'referral',source,medium:medium||'referral'};
  }
  if(!host||own(host)||payments.some(h=>domain(host,h)))return null;
  if(ai.some(h=>domain(host,h)))return {channel:'ai',source:host,medium:'referral'};
  if(searches.some(h=>domain(host,h)))return {channel:'seo',source:host,medium:'organic'};
  if(social.some(h=>domain(host,h)))return {channel:'social',source:host,medium:'social'};
  return {channel:'referral',source:host,medium:'referral'};
}
export function advance(previous, {url,referrer='',now=Date.now(),consent=false,navigation='navigate'}={}) {
  if(!consent)return null;
  const current=validTouch(previous,now)?previous:null;
  let internal=false;try { internal=own(new URL(referrer).hostname); } catch {}
  if(current&&(internal||navigation==='reload'||navigation==='back_forward'))return current;
  const candidate=classify(url,referrer);
  return candidate?{...candidate,touchedAt:now,model:MODEL}:current;
}
export function fields(touch,now=Date.now()) {
  const valid=validTouch(touch,now);
  return {MILO_attribution_model:MODEL,MILO_attribution_channel:valid?touch.channel:'unknown',MILO_attribution_source:valid?touch.source:'',MILO_attribution_medium:valid?touch.medium:'',MILO_attribution_at:valid?new Date(touch.touchedAt).toISOString():''};
}
export function validateOrderAttribution(payload,orderTime) {
  const now=Date.parse(orderTime),at=Date.parse(payload?.MILO_attribution_at);
  const touch={model:payload?.MILO_attribution_model,channel:payload?.MILO_attribution_channel,source:payload?.MILO_attribution_source,medium:payload?.MILO_attribution_medium,touchedAt:at};
  return Number.isFinite(now)&&validTouch(touch,now)?touch:null;
}
