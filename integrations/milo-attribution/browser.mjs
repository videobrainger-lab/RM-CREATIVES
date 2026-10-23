import {advance,fields,validTouch,STORAGE_KEY} from './attribution.mjs';
(function(w,d){
  'use strict';
  if(w.MILOAttribution30d)return;
  let touch=null;
  const cookie=name=>{try{return decodeURIComponent((d.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))||'').slice(name.length+1));}catch{return '';}};
  const consent=()=>{try{return cookie('milo_consent_v1')==='1'&&JSON.parse(cookie('t_cookiesCategories')||'[]').includes('analytics');}catch{return false;}};
  function refresh(){
    let saved=touch;try{saved=JSON.parse(w.localStorage.getItem(STORAGE_KEY)||'null');}catch{}
    const navigation=w.performance?.getEntriesByType('navigation')[0]?.type||'navigate';
    touch=advance(saved,{url:w.location.href,referrer:d.referrer,consent:consent(),navigation});
    try{if(touch)w.localStorage.setItem(STORAGE_KEY,JSON.stringify(touch));else w.localStorage.removeItem(STORAGE_KEY);}catch{}
  }
  function apply(form){
    if(!form||!form.closest('.t706'))return;
    if(!consent()){form.querySelectorAll('input[name^="MILO_attribution_"]').forEach(x=>x.remove());return;}
    if(!validTouch(touch,Date.now()))touch=null;
    for(const [name,value] of Object.entries(fields(touch))){
      let input=Array.from(form.elements).find(x=>x.name===name);
      if(!input){input=d.createElement('input');input.type='hidden';input.name=name;form.appendChild(input);}
      // The existing checkout normalizer disables nonessential fields; re-enable
      // only these five attribution fields just before native submission.
      input.disabled=false;input.value=value;
    }
  }
  refresh();
  d.addEventListener('click',event=>{const button=event.target.closest?.('button[type=submit],input[type=submit]');if(button)apply(button.form);},true);
  d.addEventListener('submit',event=>apply(event.target),true);
  // Consent manager pushes an existing dataLayer event. Observe without
  // replacing its push function or changing any consent state.
  let last=consent();
  w.setInterval(()=>{const next=consent();if(next!==last){last=next;refresh();if(!next)d.querySelectorAll('input[name^="MILO_attribution_"]').forEach(x=>x.remove());}},1000);
  w.MILOAttribution30d={fields:()=>fields(consent()?touch:null),apply};
})(window,document);
