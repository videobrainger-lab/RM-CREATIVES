export type IndustryPage = {
  slug: string;
  lang: 'en' | 'ru';
  title: string;
  description: string;
  eyebrow: string;
  headline: string;
  intro: string;
  geo: string;
  proofClient: string;
  proofHref: string;
  proofNote: string;
  metrics: { value: string; label: string }[];
  challenge: string;
  capabilities: string[];
  related: { href: string; label: string }[];
  hasAlternate?: boolean;
};

type Vertical = {
  key: 'dental' | 'medical' | 'aesthetic';
  enRoot: string;
  ruRoot: string;
  enName: string;
  ruName: string;
  proofClient: string;
  proofEn: string;
  proofRu: string;
  metrics: { value: string; en: string; ru: string }[];
};

const verticals: Record<string, Vertical> = {
  dental: {
    key: 'dental', enRoot: 'dental-marketing', ruRoot: 'dental-marketing', enName: 'dental clinics', ruName: 'стоматологических клиник', proofClient: 'DENTA', proofEn: '/cases/denta', proofRu: '/ru/cases/denta',
    metrics: [{value:'16,227',en:'tracked enquiries / 2025',ru:'отслеживаемых обращений / 2025'},{value:'10,601',en:'Google Ads conversions / 2025',ru:'конверсий Google Ads / 2025'},{value:'3,831',en:'organic enquiries / 2025',ru:'органическое обращение / 2025'}]
  },
  medical: {
    key: 'medical', enRoot: 'medical-marketing', ruRoot: 'medical-marketing', enName: 'medical clinics', ruName: 'медицинских клиник', proofClient: 'CONSILIUM MEDICUM', proofEn: '/cases/consilium-medicum', proofRu: '/ru/cases/consilium-medicum',
    metrics: [{value:'3,356',en:'Google Ads conversions / 2024',ru:'конверсий Google Ads / 2024'},{value:'€3.25',en:'reported conversion cost / 2024',ru:'стоимость конверсии / 2024'},{value:'24,632',en:'organic clicks / Jan–Aug 2026',ru:'органических клика / янв–авг 2026'}]
  },
  aesthetic: {
    key: 'aesthetic', enRoot: 'aesthetic-clinic-marketing', ruRoot: 'aesthetic-clinic-marketing', enName: 'aesthetic clinics', ruName: 'клиник эстетической медицины', proofClient: 'EPILINE', proofEn: '/cases/epiline', proofRu: '/ru/cases/epiline',
    metrics: [{value:'2,970',en:'Meta enquiries / Jan–Aug 2026',ru:'обращений из Meta / янв–авг 2026'},{value:'1,343',en:'Google Ads conversions / Jan–Aug 2026',ru:'конверсии Google Ads / янв–авг 2026'},{value:'275',en:'organic enquiries',ru:'органических обращений'}]
  }
};

const services = {
  dental: [
    ['seo','Dental SEO Agency','Стоматологическое SEO','Build treatment and local visibility that compounds beyond paid clicks.','Продвигаем услуги и филиалы стоматологии в органическом поиске.'],
    ['google-ads','Google Ads for Dentists','Google Ads для стоматологии','Capture patients already comparing dental treatments and providers.','Привлекаем пациентов, которые уже ищут стоматологические услуги.'],
    ['dental-implants','Dental Implant Marketing','Маркетинг имплантации зубов','Connect high-value implant demand with credible pages and measurable enquiries.','Связываем спрос на имплантацию с убедительными страницами и измеримыми обращениями.'],
    ['websites','Dental Website Design','Сайты для стоматологий','Create patient journeys that support SEO, paid traffic and conversion.','Создаём сайты, которые поддерживают SEO, рекламу и конверсию.']
  ],
  medical: [
    ['seo','Medical SEO Agency','SEO для медицинских клиник','Turn service, specialist and symptom demand into qualified organic journeys.','Превращаем спрос по услугам, врачам и симптомам в органические обращения.'],
    ['google-ads','Google Ads for Medical Clinics','Google Ads для медицинских клиник','Capture active patient demand while respecting healthcare advertising constraints.','Забираем активный спрос с учётом ограничений медицинской рекламы.'],
    ['hair-transplant','Hair Transplant Marketing','Маркетинг трансплантации волос','Build a measurable acquisition system for a considered, high-value procedure.','Строим измеримую систему привлечения на дорогую услугу с длинным выбором.'],
    ['plastic-surgery','Plastic Surgery Marketing','Маркетинг пластической хирургии','Combine search intent, trust and consultation conversion for surgical services.','Соединяем поисковый спрос, доверие и запись на консультацию.'],
    ['fertility-clinics','Fertility Clinic Marketing','Маркетинг клиник репродукции','Create sensitive, compliant patient journeys for fertility services.','Создаём деликатный и прозрачный путь пациента для услуг репродукции.']
  ],
  aesthetic: [
    ['seo','SEO for Aesthetic Clinics','SEO для клиник эстетической медицины','Build organic visibility across procedures, concerns and locations.','Развиваем органическую видимость по процедурам, проблемам и локациям.'],
    ['google-ads','Google Ads for Aesthetic Clinics','Google Ads для эстетических клиник','Capture high-intent treatment demand with focused landing pages.','Забираем горячий спрос на процедуры через релевантные посадочные страницы.'],
    ['meta-ads','Meta Ads for Aesthetic Clinics','Meta Ads для эстетических клиник','Create demand through offers, creative testing and enquiry-focused funnels.','Создаём спрос через офферы, тестирование креативов и воронки обращений.']
  ]
} as const;

const commonCapsEn = ['Demand and competitor research','Service and location architecture','Conversion-focused landing pages','Call, form and lead-quality tracking','Continuous optimisation around measurable enquiries'];
const commonCapsRu = ['Анализ спроса и конкурентов','Структура услуг и географии','Конверсионные посадочные страницы','Отслеживание звонков, форм и качества лидов','Оптимизация по измеримым обращениям'];
const serviceCaps:Record<string,{en:string[];ru:string[]}>= {
  seo:{en:['Technical and indexation audit','Treatment, specialist and location keyword mapping','Commercial page architecture','Local visibility and authority signals','Organic enquiry measurement'],ru:['Технический и индексный аудит','Семантика услуг, специалистов и географии','Архитектура коммерческих страниц','Локальная видимость и сигналы доверия','Измерение органических обращений']},
  'google-ads':{en:['High-intent search mapping','Campaign structure by service and location','Compliant ad and landing-page messaging','Call and form conversion tracking','Search-term and budget optimisation'],ru:['Карта коммерческого поискового спроса','Структура кампаний по услугам и географии','Корректные объявления и посадочные страницы','Отслеживание звонков и форм','Оптимизация запросов и бюджета']},
  'dental-implants':{en:['Implant and full-arch demand research','Consultation-focused landing pages','Clinician, process and proof messaging','Finance communication where permitted','Lead-quality and consultation tracking'],ru:['Анализ спроса на имплантацию и полную реабилитацию','Посадочные страницы под консультацию','Коммуникация врача, процесса и доказательств','Информация о финансировании, где допустимо','Контроль качества обращений и консультаций']},
  websites:{en:['Patient-first information architecture','Treatment and location templates','Mobile conversion journeys','SEO-ready technical foundation','Analytics, forms and CRM integrations'],ru:['Patient-first информационная архитектура','Шаблоны услуг и филиалов','Мобильные конверсионные сценарии','Техническая SEO-база','Интеграции аналитики, форм и CRM']},
  'hair-transplant':{en:['Procedure and technique demand mapping','Before-and-after proof framework','Surgeon and clinic trust signals','Consultation funnel design','Source-to-consultation attribution'],ru:['Семантика процедур и методов','Система доказательств до/после','Доверие к врачу и клинике','Воронка записи на консультацию','Атрибуция от источника до консультации']},
  'plastic-surgery':{en:['Procedure-specific search strategy','Surgeon authority and patient education','Consultation landing pages','Compliant proof and testimonial structure','Enquiry and consultation measurement'],ru:['Поисковая стратегия по операциям','Экспертность хирурга и обучение пациента','Страницы записи на консультацию','Корректная структура доказательств и отзывов','Измерение обращений и консультаций']},
  'fertility-clinics':{en:['Sensitive demand and language research','Service and patient-journey architecture','Trust, team and process communication','Privacy-conscious conversion paths','Enquiry attribution by service'],ru:['Исследование чувствительного спроса и формулировок','Архитектура услуг и пути пациента','Коммуникация команды, процесса и доверия','Конверсионные пути с учётом приватности','Атрибуция обращений по услугам']},
  'meta-ads':{en:['Offer and audience strategy','Compliant creative production','Lead-form and landing-page funnels','Creative and message testing','CPL and lead-quality optimisation'],ru:['Стратегия офферов и аудиторий','Корректное производство креативов','Воронки лид-форм и посадочных страниц','Тестирование креативов и сообщений','Оптимизация CPL и качества лидов']}
};

function links(v: Vertical, lang: 'en'|'ru') {
  const root = lang === 'en' ? `/industries/${v.enRoot}` : `/ru/industries/${v.ruRoot}`;
  const hub = {href:`${root}/`,label:lang==='en'?`${v.enName[0].toUpperCase()+v.enName.slice(1)} marketing`:`Маркетинг ${v.ruName}`};
  return [hub, ...services[v.key].map(s=>({href:`${root}/${s[0]}/`,label:lang==='en'?s[1]:s[2]}))];
}

function makePage(v: Vertical, lang:'en'|'ru', service?: typeof services[keyof typeof services][number]): IndustryPage {
  const isEn=lang==='en';
  const root=isEn?v.enRoot:v.ruRoot;
  const slug=service?`${root}/${service[0]}`:root;
  const hubNames={dental:'Dental Marketing Agency',medical:'Medical Marketing Agency',aesthetic:'Aesthetic Clinic Marketing Agency'};
  const name=service?(isEn?service[1]:service[2]):(isEn?hubNames[v.key]:`Маркетинговое агентство для ${v.ruName}`);
  const intro=service?(isEn?service[3]:service[4]):(isEn?`An integrated acquisition system for ${v.enName}: search demand, paid media, conversion and transparent measurement.`:`Система привлечения пациентов для ${v.ruName}: поисковый спрос, реклама, конверсия и прозрачная аналитика.`);
  const keyword=name;
  const title=isEn?`${keyword} | RM CREATIVES`:`${keyword} | RM CREATIVES`;
  const description=isEn?`${name} built around patient demand, conversion and measurable enquiries. See the ${v.proofClient} results and request a demand forecast.`:`${name}: спрос, реклама, конверсия и измеримые обращения. Посмотрите результаты ${v.proofClient} и запросите прогноз спроса.`;
  const challenge=service?(isEn?`${service[3]} Success depends on matching the message, evidence and next step to the decision a patient is making.`:`${service[4]} Результат зависит от соответствия сообщения, доказательств и следующего шага решению пациента.`):(isEn?`Growth becomes difficult when channels, pages and lead handling are managed separately. We connect them around the services, locations and patient decisions that matter to ${v.enName}.`:`Рост замедляется, когда реклама, страницы и обработка обращений работают отдельно. Мы связываем их вокруг услуг, географии и решений пациентов.`);
  const capabilities=service&&serviceCaps[service[0]]?(isEn?serviceCaps[service[0]].en:serviceCaps[service[0]].ru):(isEn?commonCapsEn:commonCapsRu);
  return {slug,lang,title,description,eyebrow:name.toUpperCase(),headline:isEn?`${name} built around patient demand.`:`${name}: спрос, обращения и прозрачная аналитика.`,intro,geo:isEn?'US / UK / EUROPE':'KAZAKHSTAN / UZBEKISTAN / RU-SPEAKING',proofClient:v.proofClient,proofHref:isEn?v.proofEn:v.proofRu,proofNote:isEn?`${v.proofClient} reporting. Metrics use the periods and definitions shown in the case study.`:`Данные ${v.proofClient}. Периоды и определения метрик указаны в кейсе.`,metrics:v.metrics.map(m=>({value:m.value,label:isEn?m.en:m.ru})),challenge,capabilities,related:links(v,lang).filter(x=>x.href!==`/${isEn?'':'ru/'}industries/${slug}/`)};
}

export const enIndustryPages: IndustryPage[] = [];
export const ruIndustryPages: IndustryPage[] = [];
for (const v of Object.values(verticals)) {
  if(v.key!=='dental') enIndustryPages.push(makePage(v,'en'));
  ruIndustryPages.push(makePage(v,'ru'));
  for(const service of services[v.key]) { enIndustryPages.push(makePage(v,'en',service)); ruIndustryPages.push(makePage(v,'ru',service)); }
}

enIndustryPages.push({
  slug:'med-spa-marketing',lang:'en',title:'Med Spa Marketing Agency | RM CREATIVES',description:'Med spa marketing for the US market across SEO, Google Ads, Meta Ads, landing pages and measurable enquiries.',eyebrow:'MED SPA MARKETING AGENCY',headline:'Med spa marketing built for the US patient journey.',intro:'Create treatment demand, capture high-intent searches and turn interest into measurable consultation enquiries.',geo:'UNITED STATES',proofClient:'EPILINE',proofHref:'/cases/epiline',proofNote:'Epiline is an aesthetic-clinic proof case; terminology and execution are adapted for the US med spa market.',metrics:verticals.aesthetic.metrics.map(m=>({value:m.value,label:m.en})),challenge:'The US med spa category is highly competitive and offer-led. Growth requires clear treatment positioning, compliant creative, strong local visibility and fast lead handling.',capabilities:commonCapsEn,related:[{href:'/industries/aesthetic-clinic-marketing/',label:'Aesthetic Clinic Marketing'},{href:'/industries/aesthetic-clinic-marketing/seo/',label:'SEO for Aesthetic Clinics'},{href:'/industries/aesthetic-clinic-marketing/google-ads/',label:'Google Ads for Aesthetic Clinics'},{href:'/industries/aesthetic-clinic-marketing/meta-ads/',label:'Meta Ads for Aesthetic Clinics'}],hasAlternate:false
});

export const allIndustryPaths = [...enIndustryPages.map(p=>`/industries/${p.slug}/`),...ruIndustryPages.map(p=>`/ru/industries/${p.slug}/`),'/industries/dental-marketing/'];
