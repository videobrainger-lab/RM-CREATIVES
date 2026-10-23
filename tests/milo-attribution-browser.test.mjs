import test from 'node:test';
import assert from 'node:assert/strict';
import {STORAGE_KEY} from '../integrations/milo-attribution/attribution.mjs';
let serial=0;
async function page({granted=true,blocked=false}={}){
  const values=new Map(),listeners={},inputs=[];
  const form={elements:inputs,closest:()=>({}),appendChild(x){inputs.push(x);},querySelectorAll(){return inputs.filter(x=>x.name?.startsWith('MILO_attribution_'));}};
  const d={cookie:granted?'milo_consent_v1=1; t_cookiesCategories=%5B%22analytics%22%5D':'',referrer:'https://www.google.lv/search?q=sushi',addEventListener(name,fn){listeners[name]=fn;},createElement(){const x={remove(){inputs.splice(inputs.indexOf(x),1);}};return x;},querySelectorAll(){return form.querySelectorAll();}};
  const storage={getItem(k){if(blocked)throw Error('blocked');return values.get(k)||null;},setItem(k,v){if(blocked)throw Error('blocked');values.set(k,v);},removeItem(k){if(blocked)throw Error('blocked');values.delete(k);}};
  const liveOrder={submit(){throw Error('A test must never submit an order');}};
  const w={location:{href:'https://milo-cafe.lv/ru'},localStorage:storage,performance:{getEntriesByType:()=>[{type:'navigate'}]},setInterval(fn){w.tick=fn;},MILOLiveOrder:liveOrder};
  globalThis.window=w;globalThis.document=d;
  try{await import('../integrations/milo-attribution/browser.mjs?test='+serial++);}finally{delete globalThis.window;delete globalThis.document;}
  const click=()=>listeners.click({target:{closest:()=>({form})}});
  return {w,d,values,form,click,liveOrder};
}
test('native checkout can disable fields; capture hook re-enables only attribution fields',async()=>{
  const p=await page();p.click();assert.equal(p.form.elements.length,5);
  p.form.elements.forEach(x=>x.disabled=true);p.click();
  assert.equal(p.form.elements.length,5);assert.ok(p.form.elements.every(x=>x.disabled===false));
  assert.equal(p.form.elements.find(x=>x.name==='MILO_attribution_channel').value,'seo');
  assert.equal(p.w.MILOLiveOrder,p.liveOrder);
  assert.deepEqual([...p.values.keys()],[STORAGE_KEY]);
  assert.equal(p.values.get(STORAGE_KEY).includes('q=sushi'),false);
});
test('revocation immediately removes already prepared attribution fields before submission',async()=>{
  const p=await page();p.click();p.d.cookie='';p.click();
  assert.equal(p.form.elements.length,0);p.w.tick();assert.equal(p.values.size,0);
});
test('no consent does not persist data, denied browser storage does not break checkout',async()=>{
  const p=await page({granted:false});p.click();assert.equal(p.values.size,0);assert.equal(p.form.elements.length,0);
  const q=await page({blocked:true});assert.doesNotThrow(q.click);
  assert.equal(q.form.elements.find(x=>x.name==='MILO_attribution_channel').value,'seo');
});
