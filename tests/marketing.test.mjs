import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const code = readFileSync(new URL('../src/scripts/marketing.js', import.meta.url), 'utf8');
const storage = () => { const values = new Map(); return { getItem: k => values.get(k) || null, setItem: (k,v) => values.set(k,v), removeItem: k => values.delete(k) }; };
function setup({ path='/ru/performance/', choice, session=storage(), success=true, blocked=false }={}) {
  const handlers = {}, buttons = {}, calls = [], scripts = [], ga = [], posts = [], visits = [];
  const local = storage();
  if (choice) local.setItem('rm:marketing-consent:v1', JSON.stringify({choice,at:Date.now()}));
  const banner = { hidden:true, querySelector:()=>({focus(){}}) };
  const select = {value:'RM Search — Google Ads',options:[]};
  const submit = {disabled:false};
  const form = { elements:{namedItem:n=>n==='service'?select:{value:''}}, querySelector:()=>submit,
    appendChild:()=>{}, addEventListener:(n,fn)=>handlers[n]=fn, reportValidity:()=>true,
    action:'https://rmcreatives.com/ru/thank-you' };
  const document = {documentElement:{lang:'ru'},head:{appendChild:x=>scripts.push(x)},
    getElementById:()=>banner, cookie:'',
    createElement:()=>({setAttribute(){}}),
    querySelector:()=>path.includes('contact')?form:null,
    querySelectorAll:selector=>selector==='[data-marketing-choice]'?['granted','denied'].map(choice=>({dataset:{marketingChoice:choice},addEventListener:(n,fn)=>buttons[choice]=fn})):[]};
  const window = {document,localStorage:local,sessionStorage:session,gtag:(...a)=>ga.push(a)};
  if (blocked) Object.defineProperty(window,'sessionStorage',{get(){throw new Error('blocked');}});
  const location = {pathname:path,hostname:'rmcreatives.com',origin:'https://rmcreatives.com',href:`https://rmcreatives.com${path}`,search:'',assign:url=>visits.push(url)};
  const context = vm.createContext({window,document,location,URL,URLSearchParams,Date,crypto:{randomUUID:()=> 'test-event-id'},
    FormData:class { *[Symbol.iterator](){yield ['form-name','project-enquiry-ru'];yield ['email','private@example.com'];} },
    fetch:async(url,options)=>{posts.push(options);return {ok:success};},setTimeout:fn=>fn()});
  vm.runInContext(code,context);
  function events(){return Array.from(window.fbq?.queue || [], a=>Array.from(a)).filter(a=>a[0].startsWith('trackSingle'));}
  return {events,window,buttons,handlers,submit,scripts,ga,posts,visits,banner,session};
}
test('no Meta script/events before consent or after decline',()=>{
  const a=setup();assert.equal(a.banner.hidden,false);assert.equal(a.scripts.length,0);
  a.buttons.denied();assert.equal(a.scripts.length,0);assert.deepEqual(a.events(),[]);
});
test('grant sends one page and product view to the specified pixel; revoke gates events',()=>{
  const a=setup();a.buttons.granted();a.buttons.granted();
  assert.equal(a.scripts.length,1);assert.deepEqual(a.events().map(e=>e[2]),['PageView','ViewContent']);
  assert.ok(a.events().every(e=>e[1]==='3564188807089922'));
  a.buttons.denied();assert.equal(a.window.fbq.queue.at(-1)[1],'revoke');
});
test('form start sends HotInterest once, with no field contents',()=>{
  const a=setup({path:'/ru/contact/',choice:'granted'});
  a.handlers.input({target:{name:'email',value:'private@example.com'}});
  a.handlers.input({target:{name:'message',value:'private message'}});
  assert.deepEqual(a.events().map(e=>e[2]),['PageView','HotInterest']);
  assert.ok(!JSON.stringify(a.events()).includes('private'));
});
test('failed POST produces no Lead, no receipt, and enables retry',async()=>{
  const a=setup({path:'/ru/contact/',choice:'granted',success:false});
  await a.handlers.submit({preventDefault(){}});
  assert.equal(a.submit.disabled,false);assert.equal(a.visits.length,0);
  assert.equal(a.session.getItem('rm:enquiry-receipt:v1'),null);
  assert.ok(!a.events().some(e=>e[2]==='Lead'));
});
test('successful POST produces one Lead across double submit, redirect and reload',async()=>{
  const a=setup({path:'/ru/contact/',choice:'granted'});
  await Promise.all([a.handlers.submit({preventDefault(){}}),a.handlers.submit({preventDefault(){}})]);
  assert.equal(a.posts.length,1);assert.equal(a.visits.length,1);
  const thanks=setup({path:'/ru/thank-you/',choice:'granted',session:a.session});
  assert.equal(thanks.events().filter(e=>e[2]==='Lead').length,1);
  assert.equal(thanks.ga.length,1);
  const reload=setup({path:'/ru/thank-you/',choice:'granted',session:a.session});
  assert.equal(reload.events().filter(e=>e[2]==='Lead').length,0);assert.equal(reload.ga.length,0);
});
test('no consent still submits form, but does not emit Meta Lead',async()=>{
  const a=setup({path:'/ru/contact/'});await a.handlers.submit({preventDefault(){}});
  const thanks=setup({path:'/ru/thank-you/',session:a.session});
  assert.equal(a.visits.length,1);assert.equal(thanks.scripts.length,0);assert.equal(thanks.ga.length,1);
});
test('blocked session storage does not break successful submission',async()=>{
  const a=setup({path:'/ru/contact/',choice:'granted',blocked:true});await a.handlers.submit({preventDefault(){}});
  assert.equal(a.visits.length,1);assert.equal(a.events().filter(e=>e[2]==='Lead').length,1);
});
