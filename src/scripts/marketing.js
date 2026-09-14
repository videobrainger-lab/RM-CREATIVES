// The ID is public. Never pass form values or advanced-matching data to Meta.
const PIXEL_ID = '820795989687551';
const CONSENT_KEY = 'rm:marketing-consent:v1';
const RECEIPT_KEY = 'rm:enquiry-receipt:v1';
const MAX_AGE = 180 * 86400000;
const path = location.pathname;
const language = document.documentElement.lang === 'ru' ? 'ru' : 'en';
const banner = document.getElementById('marketing-consent');
const product = path.match(/^\/(?:ru\/)?(performance|search|sites)\/?$/)?.[1];
let allowed = false;
let initialized = false;
let pageTracked = false;
let hotTracked = false;

function read(storageName, key) {
  try { return JSON.parse(window[storageName].getItem(key)); } catch { return null; }
}
function write(storageName, key, value) {
  try { window[storageName].setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function remove(storageName, key) {
  try { window[storageName].removeItem(key); } catch { /* Storage may be blocked. */ }
}
function initialize() {
  if (initialized || !allowed) return;
  initialized = true;
  if (!window.fbq) {
    const fbq = window.fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
      else fbq.queue.push(arguments);
    };
    if (!window._fbq) window._fbq = fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }
  window.fbq('consent', 'grant');
  window.fbq('set', 'autoConfig', false, PIXEL_ID);
  window.fbq('init', PIXEL_ID);
}
function track(name, params = {}, custom = false, eventId) {
  if (!allowed) return;
  initialize();
  const args = [custom ? 'trackSingleCustom' : 'trackSingle', PIXEL_ID, name, {
    site: 'rmcreatives.com', language, ...params,
  }];
  if (eventId) args.push({ eventID: eventId });
  window.fbq(...args);
}
function trackPage() {
  if (!allowed || pageTracked) return;
  pageTracked = true;
  track('PageView');
  if (product) track('ViewContent', { content_name: product, content_category: 'agency_service' });
}
function setConsent(choice) {
  allowed = choice === 'granted';
  write('localStorage', CONSENT_KEY, { choice, at: Date.now() });
  banner.hidden = true;
  if (allowed) {
    if (initialized) window.fbq('consent', 'grant');
    trackPage();
  } else {
    if (window.fbq) window.fbq('consent', 'revoke');
    // Clear the cookies on the host and parent domain when withdrawing consent.
    for (const name of ['_fbp', '_fbc']) {
      document.cookie = `${name}=; Max-Age=0; Path=/`;
      for (const domain of [location.hostname, '.rmcreatives.com']) {
        document.cookie = `${name}=; Max-Age=0; Path=/; Domain=${domain}`;
      }
    }
  }
}
const saved = read('localStorage', CONSENT_KEY);
if (saved && ['granted', 'denied'].includes(saved.choice) && Date.now() >= saved.at && Date.now() - saved.at < MAX_AGE) {
  allowed = saved.choice === 'granted';
} else banner.hidden = false;
document.querySelectorAll('[data-marketing-choice]').forEach(button => {
  button.addEventListener('click', () => setConsent(button.dataset.marketingChoice));
});
document.querySelectorAll('[data-marketing-settings]').forEach(button => {
  button.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('button').focus();
  });
});
trackPage();

// Carry the product in the link, so the form also works without tracking consent.
if (product) document.querySelectorAll('a[href]').forEach(link => {
  const url = new URL(link.href, location.href);
  if (url.origin === location.origin && /^\/(?:ru\/)?contact\/?$/.test(url.pathname)) {
    url.searchParams.set('service', product);
    link.href = url.href;
  }
});
function serviceCode(value) {
  return /^RM (Performance|Search|Sites)\b/.exec(value)?.[1].toLowerCase() || 'multiple';
}
function recordLead(receipt) {
  if (receipt.marketing) track('Lead', { content_name: receipt.service, lead_source: 'project_enquiry_form' }, false, receipt.id);
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', {
    lead_source: 'project_enquiry_form', language, service: receipt.service, page_path: path,
  });
}
if (/^\/(?:ru\/)?thank-you\/?$/.test(path)) {
  const receipt = read('sessionStorage', RECEIPT_KEY);
  remove('sessionStorage', RECEIPT_KEY);
  if (receipt && receipt.path === path.replace(/\/$/, '') && Date.now() >= receipt.at && Date.now() - receipt.at < 300000) recordLead(receipt);
}

const form = document.querySelector('form[name="project-enquiry"], form[name="project-enquiry-ru"]');
if (form) {
  const select = form.elements.namedItem('service');
  const requested = new URLSearchParams(location.search).get('service');
  if (['performance', 'search', 'sites'].includes(requested)) {
    const option = Array.from(select.options).find(item => item.value && serviceCode(item.value) === requested);
    if (option) select.value = option.value;
  }
  form.addEventListener('input', event => {
    if (!allowed || hotTracked || !['name', 'company', 'email', 'phone', 'service', 'message'].includes(event.target.name) || !event.target.value.trim()) return;
    hotTracked = true;
    track('HotInterest', { content_name: select.value ? serviceCode(select.value) : 'unspecified', action: 'form_start' }, true);
  });
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  form.appendChild(status);
  let submitting = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    if (form.elements.namedItem('bot-field').value) return;
    submitting = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = language === 'ru' ? 'Отправляем…' : 'Sending…';
    let response;
    try {
      response = await fetch('/', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString(),
      });
      if (!response.ok) throw new Error('Form submission failed');
    } catch {
      status.textContent = language === 'ru' ? 'Не удалось подтвердить отправку. Попробуйте ещё раз или напишите на clientcare@rmcreatives.com.' : 'We could not confirm submission. Please try again or email clientcare@rmcreatives.com.';
      button.disabled = false;
      submitting = false;
      return;
    }
    // A receipt is created only after the form endpoint accepts the POST.
    // Consume it on the thank-you page, so direct visits/reloads are not leads.
    const destination = new URL(form.action, location.href);
    const receipt = {
      id: crypto.randomUUID(), at: Date.now(), path: destination.pathname.replace(/\/$/, ''),
      service: serviceCode(select.value), marketing: allowed,
    };
    if (!write('sessionStorage', RECEIPT_KEY, receipt)) {
      try { recordLead(receipt); } catch { /* Tracking must never block a confirmed enquiry. */ }
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    location.assign(destination.href);
  });
}
