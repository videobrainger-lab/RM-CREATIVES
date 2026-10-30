(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n = value => value === null || value === undefined ? '<span class="missing">нет данных</span>' : new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2}).format(value);
  const money = (value,currency='EUR') => value === null || value === undefined ? n(null) : new Intl.NumberFormat('ru-RU',{style:'currency',currency,maximumFractionDigits:2}).format(value);
  const fmtDate = value => new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short'}).format(new Date(value+'T12:00:00Z'));
  const fmtRangeDate=value=>new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(value+'T12:00:00Z'));
  let config, reports, project='all', requestId=0, pollTimer, seoPollTimer;
  const labels = {clinic:'Платные каналы',delivery:'Доставка',services:'Банкеты и услуги',shared:'Общие и нераспределённые кампании'};
  const oldChannel = (projectId,groupId,channel) => reports?.previous.projects.find(p=>p.id===projectId)?.groups.find(g=>g.id===groupId)?.channels.find(c=>c.channel===channel);
  function change(value,previous,reverse=false) {
    if (!$('compare').checked) return '';
    if (value===null || previous===null || previous===undefined) return '<span class="cell-change">нет сравнения</span>';
    if (previous===0) return '<span class="cell-change">'+(value===0?'без изменений':'ранее 0')+'</span>';
    const delta=(value/previous-1)*100;
    return '<span class="cell-change '+(Math.abs(delta)<.05?'':(delta>0)!==reverse?'up':'down')+'">'+(delta>0?'+':'')+n(delta)+'% к прошлому периоду</span>';
  }
  function expenseChange(current,previous,currency='EUR') {
    if(!$('compare').checked)return '';
    if(current===null||current===undefined||previous===null||previous===undefined)return '<span class="cell-change">нет сравнения расходов</span>';
    const delta=current-previous,percent=previous>0?(delta/previous*100):null;
    return '<span class="cell-change">'+(delta>0?'+':'')+money(delta,currency)+' · '+(percent===null?(current===0?'без изменений':'ранее 0; процент недоступен'):(percent>0?'+':'')+n(percent)+'%')+'</span>';
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
        const value=p.deliveryCrm?p.deliveryCrm.channels.find(c=>c.channel===ch)?.orders??null:p.crm?p.crm.channels.find(c=>c.channel===ch)?.bookings??null:result.length&&result.every(c=>c[key]!==null)?result.reduce((s,c)=>s+c[key],0):null;
        return '<div class="channel-mini"><div>'+(ch==='google'?'Google Ads':'Meta Ads')+'<small>'+spendHTML(rows)+'</small></div><div><strong>'+n(value)+'</strong><small>'+(p.deliveryCrm?'заказов · CRM':p.crm?'записей · CRM':p.id==='milo'?'покупок · доставка':ch==='google'?'Primary':'лидов в кабинете')+'</small></div></div>';
      }).join('')+'<div class="crm-note">'+(p.deliveryCrm?'CRM · доставка: '+n(p.deliveryCrm.total.orders)+' заказов · '+money(p.deliveryCrm.total.amount)+(p.deliveryCrm.partial?' · неполный период':''):p.crm?'CRM · платные каналы: '+n(p.crm.total.inquiries)+' обращений · '+n(p.crm.total.bookings)+' записей'+(p.crm.partial?' · неполный период':''):'CRM: записи, визиты и оплаты ещё не подключены')+'</div><button class="card-open" data-project="'+p.id+'">Открыть проект <span>↗</span></button></article>';
    }).join('')+'</div><div class="crm-strip"><div><strong>Результат бизнеса — отдельный слой</strong><p>DENTA: обращения и записи из Google Ads и Meta по данным CRM. MILO: заказы доставки из CRM. MILO: воронка услуг из CRM. EPILINE пока показывает конверсии рекламных кабинетов.</p></div></div>';
  }
  function table(p,g){
    if(g.id==='services'&&p.servicesCrm)return servicesView(p,g);
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
    if(p.deliveryCrm)return miloView(p)+seoView(p);
    if(p.crm)return dentaView(p);
    const channels=p.groups.flatMap(g=>g.channels);
    const google=channels.filter(c=>c.channel==='google'), meta=channels.filter(c=>c.channel==='meta');
    return (p.id==='milo'?seoView(p):'')+'<div class="cards">'+metric('Расход · Google Ads',spendHTML(google),'В валюте рекламного кабинета')+metric('Расход · Meta Ads',spendHTML(meta),'В валюте рекламного кабинета')+metric(p.id==='milo'?'Квал. заявки · услуги':'Записи · CRM',n(null),'Источник бизнеса не подключён')+metric(p.id==='milo'?'Фактически оплачено':'Пришли на приём',n(null),'Источник бизнеса не подключён')+'</div>'+p.groups.map(g=>table(p,g)).join('')+'<div class="crm-strip"><div><strong>CRM и фактические оплаты пока не подключены</strong><p>Не заменяем записи кликами по телефону или WhatsApp. Пустые показатели означают отсутствие подтверждённых данных.</p></div></div>';
  }
  const pct = value => value===null||value===undefined?n(null):n(value)+'%';
  function seoChart(history,key,label,format=n){
    const values=history.map(r=>r[key]), known=values.filter(v=>v!==null), max=Math.max(1,...known);
    const points=values.map((v,i)=>v===null?null:[22+i*51,79-v/max*63]);
    // Missing months break the line; they never become zero.
    let segments=[],segment=[];
    points.forEach(p=>{if(p)segment.push(p.join(','));else if(segment.length){segments.push(segment);segment=[];}});if(segment.length)segments.push(segment);
    const svg=segments.map(s=>'<polyline points="'+s.join(' ')+'"/>').join('')+points.filter(Boolean).map(p=>'<circle cx="'+p[0]+'" cy="'+p[1]+'" r="3"/>').join('');
    return '<div class="seo-chart"><h3>'+label+'</h3><svg viewBox="0 0 300 96" role="img" aria-label="'+escape(label)+' за шесть месяцев"><path class="chart-baseline" d="M16 80H286"/>'+svg+'</svg><div class="seo-chart-months">'+history.map((r,i)=>'<span title="'+escape(r.month+': '+(values[i]===null?'нет данных':String(values[i])))+'">'+escape(r.month.slice(5))+'</span>').join('')+'</div><div class="metric-hint">Последний месяц: '+format(values.at(-1))+'</div></div>';
  }
  function seoView(p){
    const c=p.seo;if(!c)return '';
    const old=reports.previous.projects.find(x=>x.id===p.id)?.seo;
    const busy=config.seoStatus?.status==='running';
    const cards=metric('Выручка из SEO, €',money(c.seo.revenue),'Без вычета отмен и возвратов',change(c.seo.revenue,old?.seo.revenue??null))+metric('Заказы из SEO',n(c.seo.orders),'Покупки, зарегистрированные GA4',change(c.seo.orders,old?.seo.orders??null))+metric('Конверсия SEO → заказ',pct(c.seo.conversion),'Заказы / органические сессии · '+n(c.seo.sessions)+' сессий',change(c.seo.conversion,old?.seo.conversion??null))+metric('Небрендовые клики',n(c.clicks),'Google Search Console · '+fmtDate(c.searchRange.from)+' — '+fmtDate(c.searchRange.to),change(c.clicks,old?.clicks??null))+metric('Коммерческие запросы · топ-3 / топ-10',n(c.visibility.top3Count)+' / '+n(c.visibility.top10Count),pct(c.visibility.top3)+' / '+pct(c.visibility.top10)+' · из '+n(c.visibility.queries)+' запросов<br>GSC · Латвия · средняя позиция запроса<br>'+fmtDate(c.searchRange.from)+' — '+fmtDate(c.searchRange.to))+metric('Заказы из AI · выручка',n(c.ai.orders)+' / '+money(c.ai.revenue),'Распознаваемые AI-переходы · '+n(c.ai.sessions)+' сессий',change(c.ai.revenue,old?.ai.revenue??null));
    const sourceInfo=Object.entries(c.sources).map(([id,s])=>escape(id==='ga4'?'GA4':id==='commercial'?'GSC · коммерческие запросы':'Search Console')+': '+fmtDate(s.coverage.from)+' — '+fmtDate(s.coverage.to)+' · '+escape(new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Moscow'}).format(new Date(s.updatedAt)))+' МСК').join('<br>')||'Данные ещё не загружены. Нажмите «Обновить SEO». Нулевые значения не подставляются.';
    const warning=config.seoStatus?.status==='error'?'<div class="notice">'+escape(config.seoStatus.message)+'</div>':'';
    return '<section class="seo-section" aria-labelledby="seo-title"><div class="section-heading"><div><div class="eyebrow muted">ОРГАНИЧЕСКИЙ РОСТ</div><h2 id="seo-title">SEO / GEO</h2><p>От небрендового поиска до заказов</p></div><button class="secondary" id="seo-refresh" '+(busy?'disabled':'')+'>'+(busy?'Обновляем SEO…':'Обновить SEO ↻')+'</button></div>'+warning+'<div class="cards seo-cards">'+cards+'</div><div class="seo-charts">'+seoChart(c.history,'revenue','Выручка SEO, €',money)+seoChart(c.history,'orders','Заказы SEO')+seoChart(c.history,'clicks','Небрендовые клики')+'</div><p class="seo-caption">Шесть календарных месяцев. Последний — по выбранную дату. Пробел означает отсутствие полной истории, а не ноль.</p><div class="seo-diagnostics">'+metric('MILO рекомендуют в AI-ответах',pct(c.aiMentions),'Мониторинг ответов ещё не подключён. Для подключения нужен набор коммерческих вопросов LV/RU, города Рига/Юрмала и источник проверенных ответов с датой, моделью и ссылкой. AI-переходы в GA4 уже считаются отдельно; они не показывают долю рекомендаций.')+metric('Показы в Google AI',n(c.googleAiImpressions),'В GSC есть отдельный отчёт GenAI для ссылок в AI Overviews / AI Mode. Текущий коннектор не передаёт его; нужен проверенный CSV-экспорт. Если отчёта нет при малом объёме, это не ноль.')+'</div><div class="crm-strip"><div><strong>Источники SEO / GEO</strong><p>'+sourceInfo+'</p><p>Обновление ежедневно в 07:00 МСК при сохранённом ключе Windsor. Search Console загружается с запасом 3 дня. Для кликов берём такой же по длине период до последней доступной даты; сравнение сдвигается на столько же дней. Фактический период указан на карточке. Дни GSC — Pacific Time; даты CRM — Europe/Riga.</p></div></div><details class="method"><summary>Методика SEO / GEO и история по месяцам</summary><div><p>SEO — сессии Organic Search в GA4, атрибуция по источнику сессии. AI-переходы определяются по точным доменам ChatGPT, Perplexity, Gemini, Copilot и Claude; платные переходы исключены. AI-переходы выделяются отдельно и не дублируются в SEO.</p><p>Выручка — gross_purchase_revenue, без вычета отмен и возвратов. Это зарегистрированные покупки GA4, не подтверждение фактической оплаты. GA4 MILO ведётся в USD: суммы переводятся в EUR по дневному курсу ECB; в выходные используется последний опубликованный курс. Это пересчёт, а не восстановление исходной суммы заказа в евро.</p><p>Небрендовые клики исключают варианты MILO / MĪLO / МИЛО. Скрытые Google запросы не распределяются между брендом и небрендом. Небрендовые клики нельзя связать с конкретными заказами; выручка включает брендовый поиск. Топ-3/топ-10 — доля видимых коммерческих небрендовых запросов из Латвии, у которых средняя позиция GSC за указанный период ≤ 3 / ≤ 10. Позиция взвешена по показам. Коммерческий словарь LV/RU: доставка, заказ еды, суши, пицца, банкеты, кейтеринг и выбор места для праздника. Это изменяющийся набор запросов GSC; скрытые запросы исключены. Фиксированный локальный rank tracker не подключён.</p></div><div class="table-scroll"><table><thead><tr><th>Месяц</th><th>Выручка SEO, €</th><th>Заказы SEO</th><th>Небрендовые клики</th></tr></thead><tbody>'+c.history.map(r=>'<tr><td>'+escape(r.month)+'</td><td>'+money(r.revenue)+'</td><td>'+n(r.orders)+'</td><td>'+n(r.clicks)+'</td></tr>').join('')+'</tbody></table></div></details></section>';
  }
  function servicesView(p,g){
    const c=p.servicesCrm,old=reports.previous.projects.find(x=>x.id===p.id)?.servicesCrm;
    const rows=c.channels.map(r=>{const prev=old?.channels.find(x=>x.channel===r.channel);return '<tr><td>'+(r.channel==='google'?'Google Ads':'Meta Ads')+'</td><td>'+money(r.spend,r.currency)+'</td><td>'+n(r.leads)+change(r.leads,prev?.leads??null,true)+'</td><td>'+n(r.qualified)+change(r.qualified,prev?.qualified??null,true)+'</td><td>'+n(r.paidLeads)+'</td><td>'+money(r.received)+'</td></tr>';}).join('');
    const period=c.partial?'<div class="notice">CRM услуг содержит заявки с '+fmtDate(c.coverage.from)+' по '+fmtDate(c.coverage.to)+'. Показана только доступная часть выбранного периода.</div>':'';
    return period+'<section class="table-block"><div class="table-heading"><div><h2>Банкеты и услуги</h2><p>Заявки, квалификация и оплаты из CRM</p></div><span class="tag">Google Таблица</span></div><div class="table-scroll"><table><thead><tr><th>Канал</th><th>Расход</th><th>Заявки · CRM</th><th>Квал. лиды</th><th>Оплатили · заявок</th><th>Получено, EUR</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="table-foot">Воронка заявок по дате поступления. Квалификация — по сохранённой дате первого достижения этапа. Оплатившие — заявки с положительной суммой «Получено, EUR»; сумма учитывает авансы и текущие возвраты. Это не число транзакций и не платежи, поступившие именно в выбранные даты. Статус «Нет оплаты» даёт 0; незаполненные данные об оплате — «нет данных».</div></section><div class="crm-strip"><div><strong>Источник: <a href="'+escape(c.sourceUrl)+'" target="_blank" rel="noreferrer" class="blue-text">'+escape(c.sourceName)+' ↗</a></strong><p>Срез: '+new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Moscow'}).format(new Date(c.updatedAt))+' МСК. Только Google Ads и Meta Ads; источник без метки платного канала исключён. Автосинхронизация с «Пульсом» пока не включена.</p></div></div><details class="method"><summary>Конверсии услуг по атрибуции рекламных кабинетов</summary>'+table({...p,servicesCrm:null},g)+'</details>';
  }
  function miloView(p){
    const c=p.deliveryCrm,old=reports.previous.projects.find(x=>x.id===p.id)?.deliveryCrm;
    const names={google:'Google Ads',meta:'Meta Ads',sendpulse:'SendPulse'};
    const comparable=c.complete&&old?.complete;
    const prior=key=>comparable?old?.total[key]??null:null;
    const kitchenCard=(label,key,value,hint,format=n)=>{
      const parts='<div class="order-kitchens" aria-label="Показатели по кухне">'+[['center','Центр'],['highway','Трасса'],['unknown','Не распределены']].map(([id,name])=>{
        const row=c.kitchens?.find(r=>r.kitchen===id),before=old?.kitchens?.find(r=>r.kitchen===id);
        const known=row?row[key]:(id==='unknown'?c.allTotal?.[key]:null);
        const display=id!=='unknown'&&row?.orders===0&&!c.kitchenComplete?null:known;
        const delta=c.kitchenComplete&&old?.kitchenComplete?change(known,before?.[key]??null,true):$('compare').checked?'<span class="cell-change">нет сравнения по кухне</span>':'';
        return '<div><span>'+name+'</span><strong>'+format(display)+'</strong>'+delta+'</div>';
      }).join('')+'</div>';
      return '<div class="metric orders-card"><div>'+metric(label,format(value),hint,change(value,comparable?old?.allTotal?.[key]??null:null,true))+'</div>'+parts+'<p class="kitchen-note">'+(c.kitchenComplete?'Фактическая кухня в CRM.':'Разбивка неполная: часть заказов без кухни. По точкам показана известная часть; сравнение недоступно.')+'</p></div>';
    };
    const all='<div class="cards crm-overview">'+kitchenCard('Все заказы · CRM','orders',c.allTotal?.orders,'Все источники, включая неизвестный')+kitchenCard('Сумма заказов · CRM','amount',c.allTotal?.amount,'Все оформленные заказы · EUR',money)+kitchenCard('Средний чек','averageOrderValue',c.allTotal?.averageOrderValue,'Сумма CRM-заказов / их количество',money)+kitchenCard('Заказов в день · в среднем','ordersPerDay',c.allTotal?.ordersPerDay,'Заказы / '+n(c.allTotal?.calendarDays)+' календарных дней, включая дни без заказов')+'</div>';
    const heading='<div class="section-heading"><div><div class="eyebrow muted">ПЛАТНЫЕ КАНАЛЫ И CRM</div><h2>Реклама и продажи</h2></div></div>';
    const costDisplay=r=>r.spend===null&&r.knownSpend!==null&&r.knownSpend!==undefined?money(r.knownSpend,r.currency)+'<small> · известная часть</small>':money(r.spend,r.currency);
    const email=c.channels.find(r=>r.channel==='sendpulse');
    const emailMethod=email?.emailCostBasis==='owner_declared'?'<p>Email: '+money(email.emailMonthly)+' в месяц по данным владельца, не проверенный инвойс. За часть месяца: месячная сумма × выбранные календарные дни / все дни этого месяца. Email за период: '+money(email.emailSpend)+'. SMS отдельно: '+money(email.smsSpend)+'. Оценка email по кредитам не добавляется.</p>':'';
    const oldCost=r=>{const prev=old?.channels.find(x=>x.channel===r.channel);return prev?.currency===r.currency?prev.spend:null;};
    const breakdown=c.channels.map(r=>names[r.channel]+': '+costDisplay(r)+expenseChange(r.spend,oldCost(r),r.currency)).join('<br>');
    const comparisonNote=$('compare').checked?'<p class="seo-caption">Сравнение: '+fmtRangeDate(reports.current.from)+' — '+fmtRangeDate(reports.current.to)+' с '+fmtRangeDate(reports.previous.from)+' — '+fmtRangeDate(reports.previous.to)+' · '+(reports.comparisonMode==='calendar_month'?'Те же календарные даты предыдущего месяца; несуществующее число ограничено последним днём месяца.':'Предыдущий период той же длины.')+'</p>':'';
    const orderBreakdown=c.channels.map(r=>names[r.channel]+': '+n(r.orders)).join(' · ');
    const cards='<div class="cards paid-cards">'+metric('Расход · доставка',money(c.total.spend),breakdown,expenseChange(c.total.spend,old?.total.spend??null))+metric('Заказы · CRM',n(c.total.orders),orderBreakdown,change(c.total.orders,prior('orders'),true))+metric('Цена заказа · CRM',money(c.total.costOrder),'Расход трёх платных каналов / их CRM-заказы',change(c.total.costOrder,prior('costOrder')))+metric('Сумма заказов · CRM',money(c.total.amount),'Google Ads + Meta Ads + SendPulse',change(c.total.amount,prior('amount'),true))+metric('ROAS',c.total.roas===null?n(null):n(c.total.roas)+'×','Сумма платных CRM-заказов / расход',change(c.total.roas,prior('roas'),true))+'</div>';
    const rows=c.channels.map(r=>'<tr><td>'+names[r.channel]+'</td><td>'+costDisplay(r)+expenseChange(r.spend,oldCost(r),r.currency)+'</td><td>'+n(r.orders)+'</td><td>'+money(r.costOrder,r.currency)+'</td><td>'+money(r.amount)+'</td><td>'+(r.roas===null?n(null):n(r.roas)+'×')+'</td></tr>').join('');
    const period=c.partial?'<div class="notice">CRM содержит данные с '+fmtDate(c.coverage.from)+' по '+fmtDate(c.coverage.to)+'. Полные дни — по '+fmtDate(c.completeThrough)+'. Показана доступная часть периода; сравнение, средний чек, заказы в день, цена заказа и ROAS за неполный период не рассчитываются. По умолчанию текущий незавершённый день исключён.</div>':'';
    const missing=c.missingCosts?.length?'<div class="notice">Не загружен полный расход: '+c.missingCosts.map(id=>names[id]).join(', ')+'. Общий расход, цена платного заказа и общий ROAS появятся после импорта всех расходов за период. Если показана известная часть SendPulse, она включает начисления по отчётам рассылок; стоимость использованного пакета email ещё не распределена. Пополнение баланса не считается расходом рассылки.</div>':'';
    const table='<section class="table-block"><div class="table-heading"><div><h2>Доставка · реальные заказы</h2><p>По дате оформления заказа в CRM</p></div><span class="tag">Google Таблица</span></div><div class="table-scroll"><table><thead><tr><th>Канал</th><th>Расход</th><th>Заказы · CRM</th><th>Цена заказа</th><th>Сумма заказов</th><th>ROAS</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="table-foot">Цена заказа = расход канала / заказы CRM. ROAS = сумма заказов CRM / расход канала. Все источники входят в верхний итог; здесь — Google Ads, Meta Ads и SendPulse по проверенной метке CRM. Повторные ID исключены. Заказы с неизвестным источником не распределяются между рекламными каналами. Для SendPulse нужны фактические расходы рассылок; общая метка email без подтверждения платформы не считается SendPulse. Ноль означает отсутствие заказов с такой меткой в таблице, а не отсутствие продаж канала.</div></section>';
    const source='<div class="crm-strip"><div><strong>Источник: <a href="'+escape(c.sourceUrl)+'" target="_blank" rel="noreferrer" class="blue-text">'+escape(c.sourceName)+' ↗</a></strong><p>Срез: '+new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Moscow'}).format(new Date(c.updatedAt))+' МСК. '+(config.miloDeliverySync?.enabled?'Заказы проверяются каждый час. Последняя успешная синхронизация и задержки указаны сверху. Сегодня — неполный день; для сравнения используются завершённые дни.':'Автоматическая синхронизация таблицы с «Пульсом» пока не включена.')+'</p><p>Количество и суммы отражают оформленные заказы доставки. Статусы отмен и подтверждения оплаты в текущей вкладке отсутствуют; фактические оплаты и возвраты не рассчитываются. Услуги и банкеты показаны отдельно по данным CRM.</p></div></div>';
    return period+all+comparisonNote+heading+missing+cards+table+emailMethod+source+p.groups.filter(g=>g.id!=='delivery').map(g=>tableAds(p,g)).join('')+'<details class="method"><summary>Покупки доставки по атрибуции рекламных кабинетов</summary>'+tableAds(p,p.groups.find(g=>g.id==='delivery'))+'</details>';
  }
  function dentaView(p){
    const c=p.crm,old=reports.previous.projects.find(x=>x.id===p.id)?.crm;
    const names={google:'Google Ads',meta:'Meta Ads'};
    const cards='<div class="cards">'+metric('Расход · платные каналы',money(c.paidSpend),'Google Ads + Meta, EUR')+metric('Обращения · платные каналы',n(c.total.inquiries),'Цена обращения: <strong>'+money(c.costPaidInquiry)+'</strong><br>Звонки: '+n(c.total.calls)+' · формы: '+n(c.total.forms),change(c.total.inquiries,old?.total.inquiries??null,true))+metric('Записи · платные каналы',n(c.total.bookings),'Google Ads + Meta · текущий статус',change(c.total.bookings,old?.total.bookings??null,true))+metric('Цена записи · платные каналы',money(c.costPaidBooking),'Расход / записи из Google Ads и Meta',change(c.costPaidBooking,old?.costPaidBooking??null))+'</div>';
    const rows=c.channels.map(row=>{
      const prev=old?.channels.find(x=>x.channel===row.channel);
      return '<tr><td>'+names[row.channel]+'</td><td>'+money(row.spend,row.currency)+'</td><td>'+n(row.inquiries)+change(row.inquiries,prev?.inquiries??null,true)+'</td><td>'+money(row.costInquiry,row.currency)+change(row.costInquiry,prev?.costInquiry??null)+'</td><td>'+n(row.calls)+'</td><td>'+n(row.bookings)+change(row.bookings,prev?.bookings??null,true)+'</td><td>'+money(row.costBooking,row.currency)+'</td><td>'+n(row.attended)+'</td></tr>';
    }).join('');
    const rangeNote=c.partial?'<div class="notice">CRM содержит данные с '+fmtDate(c.coverage.from)+' по '+fmtDate(c.coverage.to)+'. В выбранный период попала только часть доступной истории. Цена записи за неполный период не рассчитывается.</div>':'';
    const table='<section class="table-block"><div class="table-heading"><div><h2>Реальные результаты · DENTA</h2><p>Обращения по дате поступления, результат — текущий статус в CRM</p></div><span class="tag">Google Таблица</span></div><div class="table-scroll"><table><thead><tr><th>Источник</th><th>Расход</th><th>Обращения</th><th>Цена обращения</th><th>Звонки</th><th>Записи</th><th>Цена записи</th><th>Пришли</th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="table-foot">Учитываются только обращения из Google Ads и Meta: звонки и формы. Это количество обращений, а не уникальных пациентов. Источник определяется по метке CRM, UTM и идентификаторам рекламного перехода.</div></section>';
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
    const freshness=(name,source)=>name+': '+(source?.coverage?.to?'срез '+fmtDate(source.coverage.to):'не подключено');
    const sync=config.miloDeliverySync;
    const syncTime=sync?.lastSuccessAt?new Intl.DateTimeFormat('ru-RU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Riga'}).format(new Date(sync.lastSuccessAt))+' · Рига':null;
    const deliveryNote=sync?.enabled?' · каждый час · '+(sync.status==='error'?'ошибка чтения, сохранён прошлый срез':sync.status==='stale'?'обновление задерживается':sync.status==='awaiting_first_sync'?'ожидается первая синхронизация':'синхронизировано '+syncTime):' · автообновление не включено';
    const crmNote=project==='denta'?freshness('DENTA CRM',config.crmDenta):project==='epiline'?'EPILINE CRM: не подключено':project==='milo'?[freshness('MILO · доставка CRM',config.crmMiloDelivery)+deliveryNote,freshness('MILO · услуги CRM',config.crmMiloServices)].join(' · '):'';
    $('status').textContent='Данные обновлены: '+when+' · '+(config.configured?'Реклама: ежедневно в 07:00 МСК':'Реклама: автообновление ожидает ключ Windsor')+(crmNote?' · '+crmNote:'');
    $('source-list').innerHTML='<div class="source-row"><span>Google Ads / Meta Ads</span><span>'+(config.updatedAt?'Данные загружены':'Ожидаем загрузку')+'</span></div><div class="source-row"><span>Автообновление Windsor</span><span>'+(config.configured?'Ключ сохранён':'Нужен API-ключ')+'</span></div><div class="source-row"><span>DENTA · Google Таблица</span><span>'+(config.crmDenta?'Срез загружен':'Не подключено')+'</span></div><div class="source-row"><span>MILO · доставка из CRM</span><span>'+(config.crmMiloDelivery?'Срез загружен':'Не подключено')+'</span></div><div class="source-row"><span>MILO · услуги из CRM</span><span>'+(config.crmMiloServices?'Срез загружен':'Не подключено')+'</span></div><div class="source-row"><span>MILO · SEO / GEO</span><span>'+(config.seoMilo?'Срез загружен':'Ожидаем загрузку GA4 / GSC')+'</span></div><div class="source-row"><span>EPILINE · CRM</span><span>Не подключено</span></div>';
  }
  async function load(){
    const id=++requestId;
    if(!$('from').value||!$('to').value||$('from').value>$('to').value){notice('Проверьте даты периода.',true);return;}
    $('content').setAttribute('aria-busy','true');
    try{
      const data=await api('data?'+new URLSearchParams({from:$('from').value,to:$('to').value,comparison:($('period').value==='month'||($('from').value===config.today.slice(0,7)+'-01'&&$('to').value===dateOffset(config.today,-1)))?'calendar_month':'previous_period'}));
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
  function selectProject(value){project=value;if(config)updateStatus();render();const url=new URL(location);url.searchParams.set('project',value);history.replaceState(null,'',url);}
  document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(b)selectProject(b.dataset.project);if(e.target.closest('#seo-refresh'))refreshSeo();});
  async function pollSeo(){
    clearTimeout(seoPollTimer);
    try { config=await api('status');updateStatus();await load();
      if(config.seoStatus?.status==='running')seoPollTimer=setTimeout(pollSeo,10000);
    } catch(error){notice(error.message,true);}
  }
  async function refreshSeo(){
    try {await api('seo-refresh',{method:'POST'});config.seoStatus={status:'running'};render();seoPollTimer=setTimeout(pollSeo,10000);}
    catch(error){notice(error.message,true);}
  }
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
  (async()=>{try{config=await api('status');project=new URL(location).searchParams.get('project')||'all';if(!['all','denta','epiline','milo'].includes(project))project='all';updateStatus();if(project==='milo')$('period').value='28';$('to').max=config.today;$('from').max=$('to').max;applyPeriod();await load();if(config.status?.status==='running')pollTimer=setTimeout(poll,10000);if(config.seoStatus?.status==='running')seoPollTimer=setTimeout(pollSeo,10000);else if(project==='milo'&&!config.seoMilo&&config.configured&&config.seoStatus?.status==='not_loaded')await refreshSeo();}catch(error){notice(error.message,true);}})();
})();
