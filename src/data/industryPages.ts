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
  audience: string;
  marketContext: string;
  intentSignals: string[];
  strategySteps: { title: string; copy: string }[];
  measurement: string;
  qualification: string[];
  faqs: { question: string; answer: string }[];
  ctaTitle: string;
  ctaCopy: string;
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

type LocalisedDetail = { en: string; ru: string };
type LocalisedList = { en: string[]; ru: string[] };

const verticalDetail: Record<Vertical['key'], {
  audience: LocalisedDetail;
  market: LocalisedDetail;
  intent: LocalisedList;
  qualification: LocalisedList;
}> = {
  dental: {
    audience: {
      en: 'For independent dental practices, multi-location groups and specialist clinics that need predictable demand for priority treatments—not a larger volume of unqualified form fills.',
      ru: 'Для частных стоматологий, сетей и специализированных клиник, которым нужен прогнозируемый спрос на приоритетные услуги, а не просто больше нецелевых заявок.'
    },
    market: {
      en: 'Dental demand is local, treatment-led and strongly influenced by trust. A person comparing implants, orthodontics or cosmetic dentistry needs different evidence, language and next steps. The strategy therefore starts with treatment economics, catchment area, clinician capacity and the clinic’s ability to respond quickly.',
      ru: 'Спрос в стоматологии локальный и привязан к конкретному лечению. Пациент, выбирающий имплантацию, ортодонтию или эстетическую стоматологию, ожидает разных доказательств и сценариев записи. Поэтому стратегия начинается с экономики услуг, географии, загрузки врачей и скорости обработки обращений.'
    },
    intent: {
      en: ['Treatment + location searches with clear booking intent','Comparisons of clinicians, techniques, price and finance options','Urgent, restorative and high-value elective treatment demand','Local proof: reviews, cases, accreditations and convenient access'],
      ru: ['Запросы «услуга + город» с готовностью записаться','Сравнение врачей, методов, стоимости и вариантов оплаты','Спрос на срочное, восстановительное и дорогостоящее лечение','Локальные доказательства: отзывы, кейсы, квалификация и доступность клиники']
    },
    qualification: {
      en: ['Requested treatment or clinical need','Clinic location and realistic travel radius','Ability to attend a consultation','Preferred contact method and response status'],
      ru: ['Интересующая услуга или клиническая задача','Город и реальная готовность приехать','Готовность записаться на консультацию','Канал связи и результат обработки обращения']
    }
  },
  medical: {
    audience: {
      en: 'For private clinics, specialist centres and medical groups that need a measurable route from health-related research to an appropriate consultation request.',
      ru: 'Для частных клиник, специализированных центров и медицинских сетей, которым нужен измеримый путь от поиска информации до целевого обращения на консультацию.'
    },
    market: {
      en: 'Medical acquisition sits inside a high-trust, high-compliance decision. Patients may search by service, specialist, symptom or diagnosis, but the page and campaign must avoid overpromising and must explain who the service is for, how care is delivered and what happens next.',
      ru: 'Продвижение медицинских услуг связано с высоким уровнем доверия и ограничениями рекламы. Пациенты ищут услугу, врача, симптом или диагноз, но коммуникация не должна обещать результат. Она должна объяснять показания, процесс и следующий шаг.'
    },
    intent: {
      en: ['Service, specialist and condition-led discovery','Questions about eligibility, preparation, safety and recovery','Comparison of expertise, location, availability and patient experience','Consultation requests that require careful routing and follow-up'],
      ru: ['Поиск по услуге, специалисту, состоянию или проблеме','Вопросы о показаниях, подготовке, безопасности и восстановлении','Сравнение экспертизы, локации, доступности и опыта пациентов','Обращения, требующие корректной маршрутизации и последующего контакта']
    },
    qualification: {
      en: ['Relevant service or specialist','Location and appointment availability','Appropriate next step: call, consultation or assessment','Consent-safe attribution without sensitive health details'],
      ru: ['Нужная услуга или специалист','Город и доступное время приёма','Подходящий следующий шаг: звонок, консультация или диагностика','Атрибуция без передачи чувствительных медицинских данных']
    }
  },
  aesthetic: {
    audience: {
      en: 'For aesthetic and medical-aesthetic clinics that want more booked consultations while protecting treatment positioning, practitioner trust and long-term client value.',
      ru: 'Для эстетических и косметологических клиник, которым нужны записи на консультации при сохранении доверия к специалистам, позиционирования процедур и долгосрочной ценности клиента.'
    },
    market: {
      en: 'Aesthetic demand moves between active search and discovery. Some clients know the treatment they want; others respond to a concern, result or seasonal offer. Growth therefore needs both demand capture and demand creation, supported by credible proof, consultation-led pages and fast follow-up.',
      ru: 'Спрос в эстетической медицине формируется и через поиск, и через визуальное знакомство с процедурой. Часть клиентов уже знает услугу, другая реагирует на проблему, результат или сезонное предложение. Поэтому нужны и захват спроса, и его создание, доказательства, консультационные страницы и быстрая обработка.'
    },
    intent: {
      en: ['Procedure and concern searches by location','Before-and-after research and practitioner comparison','Price, package, downtime and suitability questions','Repeat-treatment, membership and rebooking opportunities'],
      ru: ['Поиск процедур и решений проблемы по городу','Изучение результатов и сравнение специалистов','Вопросы о цене, курсе, восстановлении и показаниях','Повторные процедуры, программы и возврат клиентов']
    },
    qualification: {
      en: ['Treatment or concern of interest','Location, timing and consultation readiness','New or returning client status','Booked consultation, attended visit and rebooking where available'],
      ru: ['Интересующая процедура или эстетическая задача','Город, сроки и готовность к консультации','Новый или возвращающийся клиент','Запись, визит и повторная запись при наличии данных']
    }
  }
};

const serviceDetail: Record<string, {
  market: LocalisedDetail;
  steps: { en: { title: string; copy: string }[]; ru: { title: string; copy: string }[] };
  measurement: LocalisedDetail;
  questions: LocalisedList;
}> = {
  hub: {
    market: {en:'The work is sequenced across organic search, paid acquisition, conversion and lead handling so each channel supports the same commercial priorities.',ru:'Работы выстраиваются по единой последовательности: органический поиск, платное привлечение, конверсия и обработка обращений поддерживают одни коммерческие приоритеты.'},
    steps:{en:[{title:'Diagnose the constraint',copy:'Review demand, visibility, media, landing pages and lead handling before choosing channels.'},{title:'Prioritise services and markets',copy:'Select opportunities where demand, clinic capacity and patient value support investment.'},{title:'Build and connect',copy:'Launch pages, campaigns and measurement as one acquisition system.'},{title:'Improve lead quality',copy:'Use search terms, calls, forms and CRM feedback to refine the system.'}],ru:[{title:'Найти ограничение',copy:'Проверяем спрос, видимость, рекламу, страницы и обработку обращений до выбора каналов.'},{title:'Определить приоритеты',copy:'Выбираем услуги и рынки, где спрос, загрузка клиники и ценность пациента оправдывают инвестиции.'},{title:'Запустить единую систему',copy:'Связываем страницы, кампании и измерение в одну систему привлечения.'},{title:'Повышать качество',copy:'Используем запросы, звонки, формы и обратную связь из CRM для оптимизации.'}]},
    measurement:{en:'Reporting separates visibility and traffic from enquiries. Where CRM data is available, it also follows qualified leads, booked consultations and attended visits.',ru:'Отчётность отделяет видимость и трафик от обращений. При наличии данных CRM мы также отслеживаем целевые лиды, записи и состоявшиеся визиты.'},
    questions:{en:['Which channel should the clinic start with?','How do you define a qualified enquiry?','Can the strategy support several locations?'],ru:['С какого канала клинике лучше начать?','Как определяется целевое обращение?','Подходит ли система для нескольких филиалов?']}
  },
  seo: {
    market:{en:'SEO must match the way patients search and the way the clinic delivers care. Technical fixes alone will not rank a generic page for every service, specialist and location.',ru:'SEO должно соответствовать тому, как пациенты ищут и как клиника оказывает услуги. Одних технических исправлений недостаточно, чтобы одна общая страница ранжировалась по всем услугам, специалистам и городам.'},
    steps:{en:[{title:'Technical and index audit',copy:'Resolve crawl, canonical, migration and duplication issues before expanding content.'},{title:'Demand architecture',copy:'Map commercial intent to service, specialist and location pages without cannibalisation.'},{title:'Trust-led content',copy:'Answer selection questions with accurate service information, proof and clear next steps.'},{title:'Authority and local signals',copy:'Strengthen relevant citations, internal links, reviews and expert evidence.'}],ru:[{title:'Технический и индексный аудит',copy:'Исправляем обход, canonical, миграцию и дубли до расширения контента.'},{title:'Архитектура спроса',copy:'Распределяем коммерческие запросы по услугам, специалистам и городам без каннибализации.'},{title:'Контент доверия',copy:'Отвечаем на вопросы выбора точной информацией, доказательствами и понятным следующим шагом.'},{title:'Авторитет и локальные сигналы',copy:'Усиливаем внутренние ссылки, упоминания, отзывы и экспертные доказательства.'}]},
    measurement:{en:'The primary view is non-brand organic performance by landing page: clicks, sessions, enquiry rate and qualified enquiries. Rankings are diagnostic, not the final business result.',ru:'Главный отчёт показывает non-brand organic по посадочным страницам: клики, сессии, конверсию в обращение и целевые лиды. Позиции используются для диагностики, а не как конечный бизнес-результат.'},
    questions:{en:['How long does clinic SEO take?','Do you create service and location pages?','How do you avoid duplicate or thin medical content?'],ru:['Сколько времени занимает SEO клиники?','Создаёте ли вы страницы услуг и городов?','Как вы избегаете дублей и слабого медицинского контента?']}
  },
  'google-ads': {
    market:{en:'Paid search works when keywords, service economics, landing-page relevance and response capacity agree. A cheap conversion is not useful if it cannot become the right consultation.',ru:'Поисковая реклама работает, когда запросы, экономика услуги, посадочная страница и возможность обработать спрос согласованы. Дешёвая конверсия бесполезна, если она не может стать нужной консультацией.'},
    steps:{en:[{title:'Forecast active demand',copy:'Size search demand by service and location before assigning budget.'},{title:'Structure by intent',copy:'Separate high-value services, brand terms, locations and research traffic.'},{title:'Align landing pages',copy:'Continue the search promise with relevant proof, information and one clear action.'},{title:'Optimise beyond CPL',copy:'Use search terms and lead outcomes to remove waste and improve consultation quality.'}],ru:[{title:'Оценить активный спрос',copy:'Считаем спрос по услугам и городам до распределения бюджета.'},{title:'Разделить намерения',copy:'Разводим дорогие услуги, бренд, географию и информационный трафик.'},{title:'Согласовать страницы',copy:'Продолжаем обещание объявления релевантной информацией, доказательствами и одним действием.'},{title:'Оптимизировать глубже CPL',copy:'Используем поисковые фразы и результат обработки лида, чтобы сокращать потери и повышать качество.'}]},
    measurement:{en:'We report spend, search demand, calls and forms, then connect them to lead quality or booked consultations when the clinic can return those outcomes.',ru:'Мы показываем расходы, поисковый спрос, звонки и формы, а при наличии обратной связи связываем их с качеством лида и записью на консультацию.'},
    questions:{en:['What budget does a clinic need for Google Ads?','Do you build dedicated landing pages?','How do you measure calls and qualified enquiries?'],ru:['Какой бюджет нужен клинике для Google Ads?','Создаёте ли вы отдельные посадочные страницы?','Как измеряются звонки и целевые обращения?']}
  },
  'meta-ads': {
    market:{en:'Meta creates demand before a person searches. The commercial task is to find a credible offer and creative angle, then qualify interest without relying on aggressive claims or sensitive personal attributes.',ru:'Meta создаёт спрос до появления поискового запроса. Коммерческая задача — найти убедительный оффер и креативный угол, затем квалифицировать интерес без агрессивных обещаний и использования чувствительных персональных признаков.'},
    steps:{en:[{title:'Define the offer',copy:'Choose services with capacity, a clear audience and a credible reason to act.'},{title:'Build creative hypotheses',copy:'Test benefit, process, practitioner and educational angles instead of one repeated ad.'},{title:'Design the enquiry path',copy:'Match lead form or landing page depth to treatment complexity and intent.'},{title:'Feed back lead quality',copy:'Optimise with contactability, qualification and booking signals—not platform leads alone.'}],ru:[{title:'Сформировать оффер',copy:'Выбираем услуги с доступной загрузкой, понятной аудиторией и убедительной причиной обратиться.'},{title:'Построить гипотезы креативов',copy:'Тестируем пользу, процесс, специалиста и образовательные углы вместо одного объявления.'},{title:'Спроектировать путь обращения',copy:'Подбираем глубину лид-формы или страницы под сложность услуги и намерение.'},{title:'Возвращать качество в рекламу',copy:'Оптимизируем по дозвону, квалификации и записи, а не только по лидам платформы.'}]},
    measurement:{en:'The useful view combines spend and CPL with contact rate, qualification rate and booked consultations. Creative fatigue and response time are reviewed alongside media performance.',ru:'Полезный отчёт соединяет расходы и CPL с дозвоном, долей целевых лидов и записями. Усталость креативов и скорость ответа оцениваются вместе с рекламными метриками.'},
    questions:{en:['Which clinic services work on Meta?','Do you produce the creative and copy?','How do you improve lead quality?'],ru:['Какие услуги клиники работают в Meta?','Создаёте ли вы креативы и тексты?','Как повышается качество лидов?']}
  },
  'dental-implants': {
    market:{en:'Implant demand is valuable but rarely simple. Patients compare clinical approach, total treatment scope, finance, recovery and trust before they agree to a consultation.',ru:'Спрос на имплантацию ценен, но решение редко бывает быстрым. Пациенты сравнивают подход, полный объём лечения, оплату, восстановление и доверие до записи на консультацию.'},
    steps:{en:[{title:'Separate implant intent',copy:'Distinguish single implants, full-arch treatment, complex rehabilitation and research queries.'},{title:'Explain the pathway',copy:'Show assessment, planning, treatment stages, clinician role and realistic next steps.'},{title:'Build credible proof',copy:'Use reviewed cases, technology and expertise without implying guaranteed clinical outcomes.'},{title:'Qualify consultation demand',copy:'Capture location, treatment interest, timing and consultation readiness.'}],ru:[{title:'Разделить спрос',copy:'Отделяем одиночную имплантацию, полную реабилитацию, сложные случаи и информационные запросы.'},{title:'Объяснить путь лечения',copy:'Показываем диагностику, планирование, этапы, роль врача и реалистичный следующий шаг.'},{title:'Собрать доказательства',copy:'Используем проверенные кейсы, технологии и экспертность без гарантии клинического результата.'},{title:'Квалифицировать консультацию',copy:'Фиксируем город, интересующую услугу, сроки и готовность прийти на консультацию.'}]},
    measurement:{en:'The core funnel is treatment search or campaign → implant page → consultation enquiry → qualified case → attended assessment. Revenue attribution is added only when CRM and treatment-plan data support it.',ru:'Основная воронка: запрос или реклама → страница имплантации → обращение → целевой случай → состоявшаяся диагностика. Выручка добавляется только при наличии корректных данных CRM и планов лечения.'},
    questions:{en:['Can you market full-arch and complex implant treatment?','How do you handle price and finance messaging?','What makes an implant lead qualified?'],ru:['Можно ли продвигать полную реабилитацию и сложную имплантацию?','Как говорить о цене и оплате?','Как определяется целевой лид на имплантацию?']}
  },
  websites: {
    market:{en:'A clinic website is the shared conversion layer for organic search, paid traffic and referrals. Its structure must reflect patient decisions while remaining easy for the clinic to maintain.',ru:'Сайт клиники — общая конверсионная среда для SEO, рекламы и рекомендаций. Его структура должна соответствовать решениям пациента и оставаться управляемой для команды клиники.'},
    steps:{en:[{title:'Map patient decisions',copy:'Organise services, clinicians, locations and proof around real questions before designing screens.'},{title:'Design mobile conversion',copy:'Make calls, forms, directions and booking actions clear on the devices patients use most.'},{title:'Build SEO foundations',copy:'Create clean templates, metadata, canonicals, structured data and migration controls.'},{title:'Connect measurement',copy:'Track meaningful actions and pass source context into the enquiry workflow.'}],ru:[{title:'Карта решений пациента',copy:'Организуем услуги, врачей, филиалы и доказательства вокруг реальных вопросов до дизайна экранов.'},{title:'Мобильная конверсия',copy:'Делаем звонки, формы, маршрут и запись понятными на устройствах, которыми пользуются пациенты.'},{title:'SEO-фундамент',copy:'Создаём чистые шаблоны, метаданные, canonical, structured data и правила миграции.'},{title:'Подключить измерение',copy:'Отслеживаем значимые действия и передаём источник обращения в процесс обработки.'}]},
    measurement:{en:'We measure landing-page engagement, calls, forms and booking actions by source. A redesign is evaluated by conversion and retained organic visibility, not visual preference alone.',ru:'Мы измеряем взаимодействие с посадочными страницами, звонки, формы и запись по источникам. Редизайн оценивается по конверсии и сохранению органической видимости, а не только по внешнему виду.'},
    questions:{en:['Will the new site preserve existing SEO?','Can you build for several clinics or locations?','Which booking and analytics tools can be connected?'],ru:['Сохранится ли SEO при запуске нового сайта?','Можно ли сделать структуру для нескольких филиалов?','Какие системы записи и аналитики можно подключить?']}
  },
  'hair-transplant': {
    market:{en:'Hair-transplant patients often compare countries, techniques, surgeons and packages over a long research cycle. Marketing must support both local and cross-border decisions without reducing the choice to price.',ru:'Пациенты по трансплантации волос долго сравнивают страны, методы, хирургов и пакеты. Маркетинг должен поддерживать локальный и международный выбор, не сводя решение только к цене.'},
    steps:{en:[{title:'Map technique and destination demand',copy:'Separate FUE, DHI, surgeon, clinic and medical-travel searches by market.'},{title:'Build the trust sequence',copy:'Explain candidacy, planning, team credentials, recovery and follow-up.'},{title:'Create consultation assets',copy:'Use pages and forms that collect enough context for a useful first assessment.'},{title:'Measure to attended consultation',copy:'Connect channel, enquiry, qualification and scheduled assessment where systems allow.'}],ru:[{title:'Карта методов и географии',copy:'Разделяем запросы FUE, DHI, врача, клиники и медицинского туризма по рынкам.'},{title:'Последовательность доверия',copy:'Объясняем показания, планирование, квалификацию команды, восстановление и сопровождение.'},{title:'Материалы для консультации',copy:'Создаём страницы и формы, собирающие достаточно контекста для первичной оценки.'},{title:'Измерение до консультации',copy:'Связываем канал, обращение, квалификацию и назначенную консультацию, где это позволяют системы.'}]},
    measurement:{en:'Performance is assessed by consultation-ready enquiries, country or city, treatment interest and attended assessments—not by raw lead volume alone.',ru:'Результат оценивается по обращениям, готовым к консультации, географии, интересу к методу и состоявшимся диагностикам, а не только по числу лидов.'},
    questions:{en:['Can you market to international patients?','How should before-and-after proof be used?','What information should the first enquiry collect?'],ru:['Можно ли привлекать международных пациентов?','Как использовать фотографии до и после?','Какие данные собирать в первом обращении?']}
  },
  'plastic-surgery': {
    market:{en:'Plastic-surgery marketing has to balance procedure demand, surgeon authority, realistic expectations and advertising restrictions. The consultation—not a promised outcome—is the conversion.',ru:'Маркетинг пластической хирургии должен соединять спрос на операцию, авторитет хирурга, реалистичные ожидания и ограничения рекламы. Конверсией является консультация, а не обещанный результат.'},
    steps:{en:[{title:'Prioritise procedures',copy:'Choose operations with demand, capacity and a clear clinical offer.'},{title:'Build surgeon authority',copy:'Explain expertise, consultation, suitability, preparation and recovery.'},{title:'Use compliant proof',copy:'Review testimonials, imagery and claims for the target jurisdiction.'},{title:'Qualify consultation requests',copy:'Measure procedure interest, location, timing and readiness for assessment.'}],ru:[{title:'Выбрать операции',copy:'Определяем направления со спросом, загрузкой и понятным клиническим предложением.'},{title:'Усилить авторитет хирурга',copy:'Раскрываем опыт, консультацию, показания, подготовку и восстановление.'},{title:'Использовать корректные доказательства',copy:'Проверяем отзывы, изображения и формулировки под требования рынка.'},{title:'Квалифицировать консультации',copy:'Измеряем интерес к операции, город, сроки и готовность к оценке.'}]},
    measurement:{en:'The reporting path is procedure demand → consultation enquiry → qualified candidate → attended consultation. Clinical suitability and final treatment decisions remain with the provider.',ru:'Отчётность строится по цепочке: спрос на операцию → обращение → подходящий кандидат → состоявшаяся консультация. Клинические показания и решение о лечении остаются у врача.'},
    questions:{en:['Which procedures should be marketed first?','Can you use patient results and testimonials?','How do you measure consultation quality?'],ru:['Какие операции продвигать первыми?','Можно ли использовать результаты пациентов и отзывы?','Как измеряется качество консультационных обращений?']}
  },
  'fertility-clinics': {
    market:{en:'Fertility decisions are sensitive, information-heavy and often shared between partners. Content and acquisition should reduce uncertainty while protecting privacy and avoiding outcome promises.',ru:'Решение о лечении бесплодия чувствительное, информационно сложное и часто принимается партнёрами. Контент и реклама должны снижать неопределённость, защищать приватность и не обещать результат.'},
    steps:{en:[{title:'Map the decision journey',copy:'Cover assessment, IVF and related services without forcing every search into one page.'},{title:'Explain care clearly',copy:'Describe team, pathway, timing, support and the role of consultation.'},{title:'Protect privacy',copy:'Minimise sensitive data in forms, analytics events and advertising audiences.'},{title:'Measure appropriate next steps',copy:'Track calls, information requests and consultations by service without exposing health detail.'}],ru:[{title:'Карта пути пациента',copy:'Разделяем диагностику, ЭКО и связанные услуги вместо одной общей страницы.'},{title:'Понятно объяснить помощь',copy:'Раскрываем команду, этапы, сроки, поддержку и роль консультации.'},{title:'Защитить приватность',copy:'Минимизируем чувствительные данные в формах, событиях аналитики и рекламных аудиториях.'},{title:'Измерять корректные действия',copy:'Отслеживаем звонки, запросы информации и консультации по услугам без раскрытия медицинских деталей.'}]},
    measurement:{en:'Reporting focuses on service-level enquiries and consultation progression. Sensitive personal or health information should not be sent to advertising platforms.',ru:'Отчётность показывает обращения и движение к консультации по услугам. Чувствительные персональные и медицинские данные не должны передаваться рекламным платформам.'},
    questions:{en:['How do you protect patient privacy in tracking?','Can content cover IVF and diagnostic services separately?','Which conversion should a fertility clinic optimise?'],ru:['Как защищается приватность в аналитике?','Можно ли разделить ЭКО и диагностические услуги?','Какую конверсию должна оптимизировать репродуктивная клиника?']}
  }
};

const pairFocus: Record<string, LocalisedDetail> = {
  'dental:hub':{en:'The priority is to connect treatment demand with the right location, clinician capacity and follow-up process.',ru:'Приоритет — связать спрос на лечение с нужным филиалом, загрузкой врача и обработкой обращения.'},
  'dental:seo':{en:'The architecture should distinguish preventive, urgent, restorative, orthodontic, implant and cosmetic searches while preserving one coherent dental authority cluster.',ru:'Архитектура должна разделять профилактический, срочный, восстановительный, ортодонтический, имплантологический и эстетический спрос в едином стоматологическом кластере.'},
  'dental:google-ads':{en:'Campaigns are separated by treatment value and urgency so emergency dentistry does not consume the budget intended for implants or orthodontics.',ru:'Кампании разделяются по ценности и срочности услуги, чтобы неотложная стоматология не расходовала бюджет имплантации или ортодонтии.'},
  'dental:dental-implants':{en:'The page and campaign must support a considered consultation for implants or full-arch treatment, not present a complex clinical decision as an impulse purchase.',ru:'Страница и реклама должны вести к осознанной консультации по имплантации или полной реабилитации, а не превращать сложное лечение в импульсную покупку.'},
  'dental:websites':{en:'Treatment pages, clinician profiles, location information and booking actions are designed as one patient journey rather than separate website sections.',ru:'Страницы лечения, профили врачей, информация о филиалах и запись проектируются как единый путь пациента, а не отдельные разделы.'},
  'medical:hub':{en:'The acquisition model must route each enquiry to the right service or specialist while keeping claims, privacy and clinical accuracy under control.',ru:'Система должна направлять обращение к нужной услуге или специалисту и одновременно контролировать обещания, приватность и медицинскую точность.'},
  'medical:seo':{en:'Service, specialist, symptom and location intent need separate roles so informational visibility supports—not competes with—commercial clinic pages.',ru:'Запросы по услугам, врачам, симптомам и городам получают разные роли, чтобы информационный контент усиливал, а не конкурировал с коммерческими страницами.'},
  'medical:google-ads':{en:'Eligibility, policy constraints and service availability are checked before budget is assigned to medical search terms.',ru:'Допустимость рекламы, ограничения площадки и доступность услуги проверяются до распределения бюджета по медицинским запросам.'},
  'medical:hair-transplant':{en:'The funnel supports technique research, surgeon comparison and cross-border planning before asking for a clinical assessment.',ru:'Воронка поддерживает изучение методов, сравнение хирургов и планирование поездки до запроса на медицинскую оценку.'},
  'medical:plastic-surgery':{en:'Procedure pages must set realistic expectations and make the surgeon consultation the next step, with every visual and claim reviewed.',ru:'Страницы операций должны формировать реалистичные ожидания и вести к консультации хирурга, а каждое изображение и утверждение требует проверки.'},
  'medical:fertility-clinics':{en:'The experience should help people understand pathways and options without exposing sensitive intent in advertising or analytics systems.',ru:'Коммуникация должна объяснять варианты и этапы, не раскрывая чувствительное намерение в рекламе и системах аналитики.'},
  'aesthetic:hub':{en:'The system balances high-intent treatment searches with discovery-led demand, then connects both to consultation, rebooking and retention.',ru:'Система сочетает горячий поиск процедур с формированием спроса и связывает оба направления с консультацией, повторной записью и удержанием.'},
  'aesthetic:seo':{en:'Procedure, concern and city pages are consolidated into useful journeys instead of producing dozens of interchangeable treatment pages.',ru:'Страницы процедур, эстетических задач и городов собираются в полезные маршруты вместо десятков взаимозаменяемых страниц.'},
  'aesthetic:google-ads':{en:'Search campaigns prioritise treatment-ready demand and use dedicated pages to answer price, suitability, practitioner and downtime questions.',ru:'Поисковые кампании забирают спрос на конкретные процедуры, а отдельные страницы отвечают на вопросы о цене, показаниях, специалисте и восстановлении.'},
  'aesthetic:meta-ads':{en:'Creative testing is organised around concerns, treatments, practitioners and seasonal moments, with lead quality returned from the booking team.',ru:'Тестирование креативов строится вокруг эстетических задач, процедур, специалистов и сезонности, а команда записи возвращает данные о качестве лидов.'}
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
  const serviceKey=service?.[0]||'hub';
  const hubNames={dental:'Dental Marketing Agency',medical:'Medical Marketing Agency',aesthetic:'Aesthetic Clinic Marketing Agency'};
  const name=service?(isEn?service[1]:service[2]):(isEn?hubNames[v.key]:`Маркетинговое агентство для ${v.ruName}`);
  const intro=service?(isEn?service[3]:service[4]):(isEn?`An integrated acquisition system for ${v.enName}: search demand, paid media, conversion and transparent measurement.`:`Система привлечения пациентов для ${v.ruName}: поисковый спрос, реклама, конверсия и прозрачная аналитика.`);
  const keyword=name;
  const title=isEn?`${keyword} | RM CREATIVES`:`${keyword} | RM CREATIVES`;
  const description=isEn?`${name} built around patient demand, conversion and measurable enquiries. See the ${v.proofClient} results and request a demand forecast.`:`${name}: спрос, реклама, конверсия и измеримые обращения. Посмотрите результаты ${v.proofClient} и запросите прогноз спроса.`;
  const challenge=service?(isEn?`${service[3]} Success depends on matching the message, evidence and next step to the decision a patient is making.`:`${service[4]} Результат зависит от соответствия сообщения, доказательств и следующего шага решению пациента.`):(isEn?`Growth becomes difficult when channels, pages and lead handling are managed separately. We connect them around the services, locations and patient decisions that matter to ${v.enName}.`:`Рост замедляется, когда реклама, страницы и обработка обращений работают отдельно. Мы связываем их вокруг услуг, географии и решений пациентов.`);
  const capabilities=service&&serviceCaps[service[0]]?(isEn?serviceCaps[service[0]].en:serviceCaps[service[0]].ru):(isEn?commonCapsEn:commonCapsRu);
  const verticalCopy=verticalDetail[v.key];
  const serviceCopy=serviceDetail[serviceKey];
  const focus=pairFocus[`${v.key}:${serviceKey}`]||{en:`The programme is adapted to the services, patient decisions and commercial model of ${v.enName}.`,ru:`Программа адаптируется к услугам, решениям пациентов и коммерческой модели ${v.ruName}.`};
  const questions=isEn?serviceCopy.questions.en:serviceCopy.questions.ru;
  const faqs=[
    {question:questions[0],answer:isEn?`${focus.en} We review current demand, capacity and evidence before recommending scope, budget or timing.`:`${focus.ru} До рекомендации объёма, бюджета и сроков мы проверяем спрос, загрузку и доступные доказательства.`},
    {question:questions[1],answer:isEn?`Yes. The work includes the relevant research, messaging, page or campaign assets and measurement described on this page. Clinical facts and jurisdiction-specific claims are reviewed with the clinic before publication.`:`Да. Работа включает исследование, сообщения, страницы или рекламные материалы и измерение, описанные на этой странице. Клинические факты и формулировки для конкретного рынка согласуются с клиникой до публикации.`},
    {question:questions[2],answer:isEn?`We separate raw enquiries from the signals the clinic can act on: service fit, location, contactability, consultation readiness and the result of follow-up. The exact definition is agreed before reporting begins.`:`Мы отделяем все обращения от сигналов, на которые может влиять клиника: соответствие услуге, география, доступность контакта, готовность к консультации и результат обработки. Точное определение согласуется до начала отчётности.`},
    {question:isEn?`Which markets does this ${name.toLowerCase()} service cover?`:`На какие рынки рассчитана услуга «${name}»?`,answer:isEn?`English-language delivery focuses on the US, UK and Europe, with terminology, proof and compliance adapted to the selected market. We do not assume that one message works unchanged across countries.`:`Русскоязычная стратегия ориентирована на Казахстан, Узбекистан и более широкий русскоязычный спрос. Терминология, конкурентная среда и ограничения проверяются отдельно по выбранному рынку.`},
    {question:isEn?'What happens before launch?':'Что происходит до запуска?',answer:isEn?`We review analytics, demand, existing pages or campaigns, tracking and response capacity. The result is a prioritised launch plan with named assumptions and measurable enquiry actions.`:`Мы проверяем аналитику, спрос, текущие страницы или кампании, отслеживание и возможность обрабатывать обращения. Результат — приоритетный план запуска с зафиксированными предположениями и измеримыми действиями.`}
  ];
  return {
    slug,lang,title,description,eyebrow:name.toUpperCase(),headline:isEn?`${name} built around patient demand.`:`${name}: спрос, обращения и прозрачная аналитика.`,intro,
    geo:isEn?'US / UK / EUROPE':'KAZAKHSTAN / UZBEKISTAN / RU-SPEAKING',proofClient:v.proofClient,proofHref:isEn?v.proofEn:v.proofRu,
    proofNote:isEn?`${v.proofClient} reporting. Metrics use the periods and definitions shown in the case study.`:`Данные ${v.proofClient}. Периоды и определения метрик указаны в кейсе.`,
    metrics:v.metrics.map(m=>({value:m.value,label:isEn?m.en:m.ru})),challenge,capabilities,
    audience:isEn?verticalCopy.audience.en:verticalCopy.audience.ru,
    marketContext:`${isEn?verticalCopy.market.en:verticalCopy.market.ru} ${isEn?serviceCopy.market.en:serviceCopy.market.ru} ${isEn?focus.en:focus.ru}`,
    intentSignals:isEn?verticalCopy.intent.en:verticalCopy.intent.ru,
    strategySteps:isEn?serviceCopy.steps.en:serviceCopy.steps.ru,
    measurement:isEn?serviceCopy.measurement.en:serviceCopy.measurement.ru,
    qualification:isEn?verticalCopy.qualification.en:verticalCopy.qualification.ru,
    faqs,
    ctaTitle:isEn?`Build a ${name.toLowerCase()} plan around real demand.`:`Построим план «${name}» вокруг реального спроса.`,
    ctaCopy:isEn?`We will review the priority services, target locations, current acquisition and measurement, then outline the most credible route to qualified enquiries.`:`Проверим приоритетные услуги, географию, текущие каналы и измерение, затем предложим реалистичный путь к целевым обращениям.`,
    related:links(v,lang).filter(x=>x.href!==`/${isEn?'':'ru/'}industries/${slug}/`)
  };
}

export const enIndustryPages: IndustryPage[] = [];
export const ruIndustryPages: IndustryPage[] = [];
for (const v of Object.values(verticals)) {
  if(v.key!=='dental') enIndustryPages.push(makePage(v,'en'));
  ruIndustryPages.push(makePage(v,'ru'));
  for(const service of services[v.key]) { enIndustryPages.push(makePage(v,'en',service)); ruIndustryPages.push(makePage(v,'ru',service)); }
}

enIndustryPages.push({
  slug:'med-spa-marketing',lang:'en',title:'Med Spa Marketing Agency | RM CREATIVES',description:'Med spa marketing for the US market across SEO, Google Ads, Meta Ads, landing pages and measurable enquiries.',eyebrow:'MED SPA MARKETING AGENCY',headline:'Med spa marketing built for the US patient journey.',intro:'Create treatment demand, capture high-intent searches and turn interest into measurable consultation enquiries.',geo:'UNITED STATES',proofClient:'EPILINE',proofHref:'/cases/epiline',proofNote:'Epiline is an aesthetic-clinic proof case; terminology and execution are adapted for the US med spa market.',metrics:verticals.aesthetic.metrics.map(m=>({value:m.value,label:m.en})),challenge:'The US med spa category is highly competitive and offer-led. Growth requires clear treatment positioning, compliant creative, strong local visibility and fast lead handling.',capabilities:commonCapsEn,related:[{href:'/industries/aesthetic-clinic-marketing/',label:'Aesthetic Clinic Marketing'},{href:'/industries/aesthetic-clinic-marketing/seo/',label:'SEO for Aesthetic Clinics'},{href:'/industries/aesthetic-clinic-marketing/google-ads/',label:'Google Ads for Aesthetic Clinics'},{href:'/industries/aesthetic-clinic-marketing/meta-ads/',label:'Meta Ads for Aesthetic Clinics'}],hasAlternate:false,
  audience:'For US med spas that need a repeatable system for new consultations, memberships and rebooking across injectables, laser, body and skin services.',
  marketContext:'US med spa growth combines local search, paid search, social discovery and retention. A new-patient offer can generate volume, but the economics depend on service mix, practitioner capacity, contact speed, show rate and repeat value. The acquisition plan therefore connects the first enquiry to consultation and rebooking rather than optimising isolated platform leads.',
  intentSignals:['Med spa and treatment searches by city or neighbourhood','Research around injectables, laser, skin and body services','Offer-led discovery through Instagram and Facebook','Membership, package, repeat-treatment and reactivation demand'],
  strategySteps:[
    {title:'Model treatment economics',copy:'Prioritise services using gross value, capacity, repeat potential and realistic acquisition cost.'},
    {title:'Capture local intent',copy:'Build treatment and location visibility across SEO, maps and paid search.'},
    {title:'Create qualified demand',copy:'Test compliant offers and creative paths for people who are not actively searching yet.'},
    {title:'Connect booking and retention',copy:'Measure response, booked consultations, show rate, treatment and rebooking where systems allow.'}
  ],
  measurement:'The reporting view follows sessions and media cost through enquiry, contact, booked consultation and repeat value. CPL is useful, but it is not treated as a substitute for consultation quality or patient lifetime value.',
  qualification:['Treatment or concern of interest','Location and appointment readiness','New, returning or membership client','Contacted, booked, attended and rebooked status'],
  faqs:[
    {question:'What is different about US med spa marketing?',answer:'The category is local, offer-led and retention-sensitive. The strategy must account for state-level rules, practitioner positioning, treatment mix, memberships, rebooking and the economics of repeat care.'},
    {question:'Should a med spa start with SEO, Google Ads or Meta Ads?',answer:'The sequence depends on current visibility, speed, treatment capacity and offer strength. Search captures existing intent; Meta can create demand; SEO compounds local visibility. We use the diagnostic to decide the order.'},
    {question:'Can you market injectables and other regulated treatments?',answer:'We can build the acquisition system, but treatment eligibility, clinical wording, before-and-after use and final approval must be reviewed for the relevant state and platform.'},
    {question:'How do you measure med spa lead quality?',answer:'We agree a practical definition using treatment fit, location, contactability and consultation readiness, then add booking, show and rebooking signals where the CRM or booking platform provides them.'},
    {question:'Can the strategy include memberships and reactivation?',answer:'Yes. New-patient acquisition is only one part of the model. Membership, package, repeat-treatment and dormant-client journeys can be included when the underlying consent and booking data are available.'}
  ],
  ctaTitle:'Build a US med spa growth plan around consultations and lifetime value.',
  ctaCopy:'Share your locations, priority treatments, capacity and current acquisition data. We will outline the most credible mix of search, paid social, conversion and retention.',
});

export const allIndustryPaths = [...enIndustryPages.map(p=>`/industries/${p.slug}/`),...ruIndustryPages.map(p=>`/ru/industries/${p.slug}/`),'/industries/dental-marketing/'];
