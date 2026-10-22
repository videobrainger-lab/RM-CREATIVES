(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = value => value === null || value === undefined ? '<span class="missing">нет данных</span>' : new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value);
  const money = (value,currency='EUR') => value === null || value === undefined ? n(null) : new Intl.NumberFormat('ru-RU',{style:'currency',currency,maximumFractionDigits:2}).format(value);
  const fmtDate = value => new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(value+'T12:00:00Z'));
  let config, reports, project='all', requestId=0, pollTimer;
  const labels = {clinic:'Платные каналы',delivery:'Доставка',services:'Банкеты и услуги',shared:'Общие и нераспределённые кампании'};
  const oldChannel = (projectId,groupId,channel) => reports?.previous.projects.find(p=>p.id===projectId)?.groups.find(g=>g.id===groupId)?.channels.find(c=>c.channel===channel);
  function change(value,previous,reverse=false) {
    if (!$('compare').checked) return '';
    if (value===null || previous===null || previous===undefined) return '<span class="cell-change">нет сравнения</span>';
    if (previous===0) return '<span class="cell-change">'+(value===0?'без изменений':'ранее 0')+'</span>';
    const delta=(value/previous-1)*100;
    return '<span class="cell-change '+(Math.abs(delta)<.05?'':(delta>0)!==reverse?'up':'down')+'">'+(delta>0?'+':'')+n(delta)+'% к прошлому периоду</span>';
  }
  async function api(path,options) {
    const response = await fetch('/internal/'+path,{...options,cache:'no-store'});
    if (response.status===401) { location.href='/internal/'; throw new Error('Войдите снова.'); }
    const body=await response.json();
    if (!response.ok) throw new Error(body.error||'Не удалось загрузить данные.');
    return body;
  }
  function notice(message,error=false){$('notice').innerHTML=message?'<div class="notice '+(error?'error':'')+'">'+escape(message)+'</div>':'';}
  const expenses = channels => {
    const amounts=new Map();
    channels.filter(c=>c.spend!==null).forEach(c=>amounts.set(c.currency,(amounts.get(c.currency)||0)+c.spend));
    return [...amounts].map(([currency,value])=>({currency,value}));
  };
  const spendHTML = channels => expenses(channels).map(a=>'<span class="currency-line">'+money(a.value,a.currency)+'</span>').join('') || n(null);
  function metric(label,value,hint='',delta='') {return '<div class="metric"><div class="metric-label">'+label+'</div><div class="metric-value">'+value+'</div><div class="metric-hint">'+hint+'</div>'+delta+'</div>';}
  function overview(){
    return '<div class="section-heading"><div><h2>Все проекты</h2><p>Результаты каналов отдельно. Без двойного подсчёта.</p></div><span class="tag">3 проекта · 2 рекламные системы</span></div><div class="project-grid">'+reports.current.projects.map(p=>{
      const channels=p.groups.flatMap(g=>g.channels), prior=reports.previous.projects.find(r=>r.id===p.id)?.groups.flatMap(g=>g.channels)||[];
      const spend=expenses(channels),before=expenses(prior);
      return '<article class="project-card"><div class="card-title"><i class="dot '+(p.id==='denta'?'blue':p.id==='epiline'?'purple':'orange')+'"></i><h2>'+p.name+'</h2></div><p class="project-note">'+p.note+'</p><div class="eyebrow muted">РАСХОД НА РЕКЛАМУ</div><div class="project-spend">'+spendHTML(channels)+'</div><div class="change">'+spend.map(a=>change(a.value,before.find(b=>b.currency===a.currency)?.value??null)).join('')+'</div>'+['google','meta'].map(ch=>{
        const rows=channels.filter(c=>c.channel===ch);
        const result=p.id==='milo'?rows.filter(c=>p.groups.find(g=>g.id==='delivery')?.channels.includes(c)):rows;
        const key=p.id==='milo'?'purchases':ch==='google'?'primary':'leads';
        const value=p.crm?p.crm.channels.find(c=>c.channel===ch)?.bookings??null:result.length&&result.every(c=>c[key]!==null)?result.reduce((s,c)=>s+c[key],0):null;
        return '<div class="channel-mini"><div>'+(ch==='google'?'Google Ads':'Meta Ads')+'<small>'+spendHTML(rows)+'</small></div><div><strong>'+n(value)+'</strong><small>'+(p.crm?'записей · CRM':p.id==='milo'?'покупок · доставка':ch==='google'?'Primary':'лидов в кабинете')+'</small></div></div>';
      }).join('')+'<div class="crm-note">'+(p.crm?'CRM · платные каналы: '+n(p.crm.total.inquiries)+' обращений · '+n(p.crm.total.bookings)+' записей'+(p.crm.partial?' · неполный период':''):'CRM: записи, визиты и оплаты ещё не подключены')+'</div><button class="card-open" data-project="'+p.id+'">Открыть проект <span>↗</span></button></article>';
    }).join('')+'</div><div class="crm-strip"><div><strong>Результат бизнеса — отдельный слой</strong><p>DENTA: обращения и записи из Google Ads и Meta по данным CRM. Остальные проекты пока показывают конверсии рекламных кабинетов.</p></div></div>';
  }
  function table(p,g){
    const columns=g.id==='delivery'?[['spend','Расход','money'],['purchases','Покупки · реклама'],['costPurchase','Цена покупки','money'],['revenue','Ценность покупок','money'],['roas','ROAS','roas']]:g.id==='services'?[['spend','Расход','money'],['primary','Primary · Google'],['leads','Лиды · Meta'],['qualified','Квал. заявки'],['paid','Оплачено','money']]:g.id==='shared'?[['spend','Расход','money'],['primary','Primary · Google'],['leads','Лиды · Meta'],['purchases','Покупки · реклама']]:[['spend','Расход','money'],['primary','Primary'],['secondary','Secondary'],['leads','Лиды · Meta'],['bookings','Записи · реклама'],['costBooking','Цена записи','money']];
    const foot=g.id==='delivery'?'Покупки и их ценность — по атрибуции каждого рекламного кабинета. Общие кампании показаны отдельным блоком.':g.id==='services'?'Primary не равны подтверждённым заявкам. Квалификация и фактические оплаты требуют данных бизнеса.':g.id==='shared'?'Брендовые, смешанные и ещё не распределённые кампании. Их расход не включён в цену результата доставки и услуг.':'Записи — booking_created в Google Ads и Website schedule в Meta. Это атрибуция рекламы, а не уникальные записи CRM.';
    return '<section class="table-block"><div class="table-heading"><div><h2>'+labels[g.id]+'</h2><p>'+(g.id==='clinic'?'От расходов до записи':g.id==='shared'?'Не теряем расходы и не распределяем их произвольно':'Своя воронка и свои результаты')+'</p></div><span class="tag">'+p.name+'</span></div><div class="table-scroll"><table><thead><tr><th>Канал</th>'+columns.map(c=>'<th>'+c[1]+'</th>').join('')+'</tr></thead><tbody>'+g.channels.map(c=>{
      const prev=oldChannel(p.id,g.id,c.channel);
      return '<tr><td><span class="channel-logo">'+(c.channel==='google'?'G':'m')+'</span>'+(c.channel==='google'?'Google Ads':'Meta Ads')+'</td>'+columns.map(([key,label,type])=>{
        const inapplicable=(key==='primary'||key==='secondary')&&c.channel!=='google'||key==='leads'&&c.channel!=='meta';
        if(inapplicable)return '<td><span class="missing">—</span></td>';
        const value=c[key], displayed=type==='money'?money(value,c.currency||'EUR'):type==='roas'?(value===null?n(null):n(value)+'×'):n(value);
        return '<td>'+displayed+change(value,prev?.[key]??null,!['spend','costPurchase','costBooking'].includes(key))+'</td>';
      }).join('')+'</tr>';
    }).join('')+'</tbody></table></div><div class="table-foot">'+foot+'</div>'+details(g)+'</section>';
  }
  function details(g){
    const google=g.channels.find(c=>c.channel==='google');
    return '<details class="actions"><summary>Состав событий Google Ads</summary><div class="table-scroll"><table><thead><tr><th>Действие</th><th>Текущий тип</th><th>All conversions</th></tr></thead><tbody>'+google.actions.map(a=>'<tr><td>'+escape(a.name)+'</td><td class="primary-label">'+(a.primary===null?'Не определён':a.primary?'Primary':'Secondary')+'</td><td>'+n(a.count)+'</td></tr>').join('')+'</tbody></table></div>'+(google.actions.length?'':'<p class="table-foot">Нет зарегистрированных событий за выбранный период либо источник событий недоступен.</p>')+'</details><details class="actions"><summary>Кампании в этом блоке</summary><div class="table-foot">'+g.channels.map(c=>'<p><strong>'+(c.channel==='google'?'Google Ads':'Meta Ads')+'</strong><br>'+c.campaigns.map(a=>escape(a.name)).join('<br>')+'</p>').join('<br>')+'</div></details>';
  }
  function projectView(p){
    if(p.crm)return dentaView(p);
    const channels=p.groups.flatMap(g=>g.channels);
    const google=channels.filter(c=>c.channel==='google'), meta=channels.filter(c=>c.channel==='meta');
    return '<div class="cards">'+metric('Расход · Google Ads',spendHTML(google),'В валюте рекламного кабинета')+metric('Расход · Meta Ads',spendHTML(meta),'В валюте рекламного кабинета')+metric(p.id==='milo'?'Квал. заявки · услуги':'Записи · CRM',n(null),'Источник бизнеса не подключён')+metric(p.id==='milo'?'Фактически оплачено':'Пришли на приём',n(null),'Источник бизнеса не подключён')+'</div>'+p.groups.map(g=>table(p,g)).join('')+'<div class="crm-strip"><div><strong>CRM и фактические оплаты пока не подключены</strong><p>Не заменяем записи кликами по телефону или WhatsApp. Пустые показатели означают отсутствие подтверждённых данных.</p></div></div>';
  }
  function dentaView(p){
    const c=p.crm,old=reports.previous.projects.find(x=>x.id===p.id)?.crm;
    const names={google:'Google Ads',meta:'Meta Ads'};
    const cards='<div class="cards">'+metric('Расход · платные каналы',money(c.paidSpend),'Google Ads + Meta, EUR')+metric('Обращения · платные каналы',n(c.total.inquiries),'Звонки: '+n(c.total.calls)+' · формы: '+n(c.total.forms),change(c.total.inquiries,old?.total.inquiries??null,true))+metric('Записи · платные каналы',n(c.total.bookings),'Google Ads + Meta · текущий статус',change(c.total.bookings,old?.total.bookings??null,true))+metric('Цена записи · платные каналы',money(c.costPaidBooking),'Расход / записи из Google Ads и Meta',change(c.costPaidBooking,old?.costPaidBooking??null))+'</div>';
    const rows=c.channels.map(row=>{
      const prev=old?.channels.find(x=>x.channel===row.channel);
      return '<tr><td>'+names[row.channel]+'</td><td>'+money(row.spend,row.currency)+'</td><td>'+n(row.inquiries)+change(row.inquiries,prev?.inquiries??null,true)+'</td><td>'+n(row.calls)+'</td><td>'+n(row.bookings)+change(row.bookings,prev?.bookings??null,true)+'</td><td>'+money(row.costBooking,row.currency)+'</td><td>'+n(row.attended)+'</td></tr>';
    }).join('');
    const rangeNote=c.partial?'<div class="notice">CRM содержит данные с '+fmtDate(c.coverage.from)+' по '+fmtDate(c.coverage.to)+'. В выбранный период попала только часть доступной истории. Цена записи за неполный период не рассчитывается.</div>':'';
    const table='<section class="table-block"><div class="table-heading"><div><h2>Реальные результаты · DENTA</h2><p>Обращения по дате поступления, результат — текущий статус в CRM</p></div><span class="tag">Google Таблица</span></div><div class="table-scroll"><table><thead><tr><th>Источник</th><th>Расход</th><th>Обращения</th><th>Звонки</th><th>Записи</th><th>Цена записи</th><th>Пришли</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="table-foot">Учитываются только обращения из Google Ads и Meta: звонки и формы. Это количество обращений, а не уникальных пациентов. Источник определяется по метке CRM, UTM и идентификаторам рекламного перехода.</div></section>';
    const source='<div class="crm-strip"><div><strong>Источник: <a href="'+escape(c.sourceUrl)+'" target="_blank" rel="noreferrer" class="blue-text">'+escape(c.sourceName)+' ↗</a></strong><p>Срез: '+new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Moscow'}).format(new Date(c.updatedAt))+' МСК. Автоматическая синхронизация CRM пока не включена.</p><p>«Записался» — статус Pierakstījās. '+n(c.total.bookingsMissingDate)+' записей в выбранной группе обращений не имеют даты подтверждения. Поэтому это результат обращений выбранного периода, а не число новых записей, созданных в эти даты.</p><p>'+(c.visitTracking?'Посещения — по отметкам CRM.':'Посещения в CRM ещё не заполнены — показываем «нет данных».')+' Исключены повторные строки с одинаковым inquiry_id: '+n(c.duplicatesRemoved)+'.</p></div></div>';
    return rangeNote+cards+table+source+'<details class="method"><summary>Конверсии и кампании рекламных кабинетов</summary>'+p.groups.map(g=>tableAds(p,g)).join('')+'</details>';
  }
  const tableAds=table;
  function render(){
    if(!reports)return;
    const p=reports.current.projects.find(p=>p.id===project);
    $('page-title').innerHTML=(p?p.name:'Пульс проектов')+'<span class="blue-text">.</span>';
    $('breadcrumb').textContent=p?'ПРОЕКТ / '+p.note.toUpperCase():'ОБЗОР АГЕНТСТВА';
    $('subtitle').textContent=p?(p.id==='milo'?'Доставка и услуги. Отдельные расходы и результаты.':'Платные каналы. От расходов до реальной записи.'):'Сколько потратили. Что получили. Где нужно внимание.';
    $('content').innerHTML=p?projectView(p):overview();
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.project===project));
    $('project-select').value=project;
  }
  function updateStatus(){
    const when=config.updatedAt?new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Moscow'}).format(new Date(config.updatedAt))+' МСК':'ещё не обновлены';
    $('status').textContent='Данные обновлены: '+when+' · '+(config.configured?'Реклама: ежедневно в 07:00 МСК':'Реклама: автообновление ожидает ключ Windsor')+(config.crmDenta?' · DENTA CRM: срез '+fmtDate(config.crmDenta.coverage.to):'');
    $('source-list').innerHTML='<div class="source-row"><span>Google Ads / Meta Ads</span><span>'+(config.updatedAt?'Данные загружены':'Ожидаем загрузку')+'</span></div><div class="source-row"><span>Автообновление Windsor</span><span>'+(config.configured?'Ключ сохранён':'Нужен API-ключ')+'</span></div><div class="source-row"><span>DENTA · Google Таблица</span><span>'+(config.crmDenta?'Срез загружен':'Не подключено')+'</span></div><div class="source-row"><span>EPILINE / MILO · CRM</span><span>Не подключено</span></div>';
  }
  async function load(){
    const id=++requestId;
    if(!$('from').value||!$('to').value||$('from').value>$('to').value){notice('Проверьте даты периода.',true);return;}
    $('content').setAttribute('aria-busy','true');
    try{
      const data=await api('data?'+new URLSearchParams({from:$('from').value,to:$('to').value}));
      if(id!==requestId)return;
      reports=data;render();
      if(!reports.current.covered)notice('Этот период ещё не загружен. Доступные данные: '+fmtDate(reports.current.coverage.from)+' — '+fmtDate(reports.current.coverage.to)+'. Обновите данные или выберите другой период.');
      else if(config.status?.status==='error')notice(config.status.message,true);
      else notice('');
    }catch(error){if(id!==requestId)return;notice(error.message,true);$('content').innerHTML='<div class="empty">Данные не загрузились. Повторите попытку или проверьте подключения.</div>';}
    finally{if(id===requestId)$('content').removeAttribute('aria-busy');}
  }
  const dateOffset=(date,days)=>new Date(Date.parse(date)+days*86400000).toISOString().slice(0,10);
  function applyPeriod(){
    if($('period').value==='custom')return;
    const today=config.today, to=dateOffset(today,-1), period=$('period').value;
    $('to').value=to;
    $('from').value=period==='month'?today.slice(0,7)+'-01':dateOffset(to,1-Number(period));
    if($('from').value>to)$('from').value=to;
  }
  function selectProject(value){project=value;render();const url=new URL(location);url.searchParams.set('project',value);history.replaceState(null,'',url);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(b)selectProject(b.dataset.project);});
  $('project-select').addEventListener('change',()=>selectProject($('project-select').value));
  $('period').addEventListener('change',()=>{applyPeriod();load();});
  ['from','to'].forEach(id=>$(id).addEventListener('change',()=>{$('period').value='custom';load();}));
  $('compare').addEventListener('change',render);
  $('settings-toggle').addEventListener('click',()=>$('settings').showModal());
  $('settings-top').addEventListener('click',()=>$('settings').showModal());
  $('settings-close').addEventListener('click',()=>$('settings').close());
  async function poll(){
    clearTimeout(pollTimer);
    try{config=await api('status');updateStatus();const state=config.status?.status;
      if(state==='running'){$('settings-status').textContent='Windsor готовит данные…';pollTimer=setTimeout(poll,10000);}
      else {$('refresh').disabled=false;$('refresh').textContent='Обновить данные ↻';$('settings-status').textContent=state==='error'?config.status.message:state==='ok'?'Данные обновлены.':'';await load();}
    }catch(error){notice(error.message,true);$('refresh').disabled=false;}
  }
  async function refresh(){
    if(!config.configured){$('settings').showModal();return;}
    $('refresh').disabled=true;$('refresh').textContent='Обновляем…';$('settings-status').textContent='Запускаем обновление…';
    try{await api('refresh',{method:'POST'});pollTimer=setTimeout(poll,10000);}
    catch(error){$('settings-status').textContent=error.message;notice(error.message,true);$('refresh').disabled=false;}
  }
  $('refresh').addEventListener('click',refresh);
  $('key-form').addEventListener('submit',async e=>{e.preventDefault();const submit=e.target.querySelector('button');submit.disabled=true;
    try{await api('settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({windsorKey:$('windsor-key').value.trim()})});$('windsor-key').value='';config.configured=true;updateStatus();await refresh();}
    catch(error){$('settings-status').textContent=error.message;}finally{submit.disabled=false;}
  });
  (async()=>{try{config=await api('status');updateStatus();project=new URL(location).searchParams.get('project')||'all';if(!['all','denta','epiline','milo'].includes(project))project='all';$('to').max=config.today;$('from').max=$('to').max;applyPeriod();await load();if(config.status?.status==='running')pollTimer=setTimeout(poll,10000);}catch(error){notice(error.message,true);}})();
})();
