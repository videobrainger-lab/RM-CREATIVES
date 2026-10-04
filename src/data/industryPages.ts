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

// Approved EN/RU master copy; proof metrics and route definitions above stay intact.
const masterCopy: Record<string, Partial<IndustryPage>> = {
  "dental-marketing": {
    "headline": "Dental marketing managed as one ac­qui­si­tion system — with AI helping us see more of it.",
    "intro": "We connect SEO, Google Ads, landing pages and measurement around the treatments your clinic wants to grow. Specialists own each channel; AI helps them analyse demand, performance and patient-journey signals across the system instead of working from isolated reports.",
    "capabilities": [
      "Demand research — AI-assisted analysis expands the number of treatment, location and competitor signals we can review; a strategist decides which opportunities matter commercially.",
      "SEO / GEO — specialists map treatment and local demand, while AI helps inspect query sets, page overlap, Search Console signals, competitor coverage and emerging AI-search visibility.",
      "Google Ads — a paid-search specialist manages budgets; AI helps review larger volumes of search terms, spend and conversion patterns to find waste sooner.",
      "Landing pages — UX and content decisions are supported by search, ad and behaviour data rather than generic best practices.",
      "Enquiry optimisation — calls, forms and available CRM outcomes feed back into decisions so the system can learn which demand is actually useful."
    ],
    "challenge": "It fails when channels optimise different things. SEO grows traffic, paid search grows clicks, the website talks in internal clinic language and lead outcomes never return to marketing. We use a shared data context so every team member works toward the same treatment and enquiry priorities.",
    "ctaCopy": "Turn dental demand into measurable enquiries. We will review treatments, target locations, current acquisition and measurement, then identify the highest-value constraints.",
    "eyebrow": "DENTAL MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Demand research",
        "copy": "AI-assisted analysis expands the number of treatment, location and com­peti­tor signals we can review; a strate­gist decides which op­por­tu­ni­ties matter com­mer­cial­ly."
      },
      {
        "title": "SEO / GEO",
        "copy": "spe­cial­ists map treatment and local demand, while AI helps inspect query sets, page overlap, Search Console signals, com­peti­tor coverage and emerging AI-search vis­i­bil­i­ty."
      },
      {
        "title": "Google Ads",
        "copy": "a paid-search spe­cial­ist manages budgets; AI helps review larger volumes of search terms, spend and con­ver­sion patterns to find waste sooner."
      },
      {
        "title": "Landing pages",
        "copy": "UX and content decisions are supported by search, ad and behaviour data rather than generic best practices."
      }
    ],
    "measurement": "Enquiry optimisation — calls, forms and available CRM outcomes feed back into decisions so the system can learn which demand is actually useful.",
    "title": "Dental Marketing Agency for Clinics | RM CREATIVES",
    "description": "Dental Marketing Agency for Clinics. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Turn dental demand into mea­sur­able enquiries."
  },
  "ru/dental-marketing": {
    "headline": "Маркетинг сто­ма­то­ло­гии. Спе­ци­а­ли­сты + ИИ.",
    "intro": "Мы связываем SEO, Google Ads, посадочные страницы и аналитику вокруг тех видов лечения, которые клиника хочет развивать. Каждый канал находится у профильного специалиста; ИИ помогает анализировать спрос, эффективность и путь пациента на уровне всей системы, а не отдельных отчётов.",
    "capabilities": [
      "Исследование спроса — AI-анализ расширяет количество сигналов по лечению, географии и конкурентам; стратег определяет, какие возможности имеют коммерческий смысл.",
      "SEO / GEO — специалисты строят карту спроса по лечению и географии, а ИИ помогает анализировать запросы, пересечения страниц, Search Console, конкурентов и видимость в AI-поиске.",
      "Google Ads — специалист управляет бюджетом; ИИ помогает чаще и глубже проверять поисковые запросы, расходы и паттерны конверсий, чтобы раньше находить потери.",
      "Посадочные страницы — UX и контент опираются на данные поиска, рекламы и поведения, а не на абстрактные best practices.",
      "Оптимизация обращений — звонки, формы и доступные результаты CRM возвращаются в систему, чтобы понимать, какой спрос действительно полезен."
    ],
    "challenge": "Обычно проблема в другом: разные каналы оптимизируют разные вещи. SEO растит трафик, поисковая реклама — клики, сайт говорит внутренним языком клиники, а результаты обработки лидов не возвращаются в маркетинг. Мы используем общий контекст данных, чтобы вся команда работала на одни и те же приоритетные услуги и обращения.",
    "ctaCopy": "Превратим стоматологический спрос в измеримые обращения. Проверим услуги, географию, текущую систему привлечения и измерение, а затем найдём ограничения с самым высоким влиянием на рост.",
    "eyebrow": "DENTAL MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Ис­сле­до­ва­ние спроса",
        "copy": "AI-анализ расширяет ко­ли­че­ство сигналов по лечению, географии и кон­ку­рен­там; стратег опре­де­ля­ет, какие воз­мож­но­сти имеют ком­мер­че­ский смысл."
      },
      {
        "title": "SEO / GEO",
        "copy": "спе­ци­а­ли­сты строят карту спроса по лечению и географии, а ИИ помогает ана­ли­зи­ро­вать запросы, пе­ре­се­че­ния страниц, Search Console, кон­ку­рен­тов и видимость в AI-поиске."
      },
      {
        "title": "Google Ads",
        "copy": "спе­ци­а­лист управляет бюджетом; ИИ помогает чаще и глубже проверять поисковые запросы, расходы и паттерны конверсий, чтобы раньше находить потери."
      },
      {
        "title": "По­са­доч­ные страницы",
        "copy": "UX и контент опираются на данные поиска, рекламы и поведения, а не на аб­стракт­ные best practices."
      }
    ],
    "measurement": "Оптимизация обращений — звонки, формы и доступные результаты CRM возвращаются в систему, чтобы понимать, какой спрос действительно полезен.",
    "title": "Маркетинг стоматологии | RM CREATIVES",
    "description": "Маркетинг стоматологии. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Превратим сто­ма­то­ло­ги­че­ский спрос в измеримые обращения."
  },
  "dental-marketing/seo": {
    "headline": "Dental SEO with human strategy and AI-scale analysis.",
    "intro": "Build visibility for treatments and locations patients actually search — without publishing dozens of pages that compete with one another. Our SEO specialists use AI to analyse larger semantic sets, Search Console data, site structure, competitor coverage and page overlap, then make human decisions about what the clinic should own in search.",
    "capabilities": [
      "Technical and indexation audit with AI-assisted pattern detection across larger sets of URLs.",
      "Treatment, specialist and location demand mapping based on real search language.",
      "Commercial page architecture designed to prevent cannibalisation between services, articles and locations.",
      "Content briefs grounded in patient questions, commercial intent and clinical review.",
      "GEO / AI visibility checks alongside classic search visibility where relevant.",
      "Organic enquiry measurement so rankings are not mistaken for the business result."
    ],
    "challenge": "Build visibility for treatments and locations patients actually search — without publishing dozens of pages that compete with one another. Our SEO specialists use AI to analyse larger semantic sets, Search Console data, site structure, competitor coverage and page overlap, then make human decisions about what the clinic should own in search.",
    "ctaCopy": "Show us the site and priority treatments. We will map where organic demand is being missed, duplicated or wasted.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Technical and in­dex­a­tion audit with AI-assisted pattern detection across larger sets of URLs."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Treatment, spe­cial­ist and location demand mapping based on real search language."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Com­mer­cial page ar­chi­tec­ture designed to prevent can­ni­bal­i­sa­tion between services, articles and locations."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Content briefs grounded in patient questions, com­mer­cial intent and clinical review."
      }
    ],
    "measurement": "AI makes it possible to inspect more queries and pages; the SEO specialist decides what deserves a page, what should be consolidated and which opportunities match the clinic’s economics and expertise.",
    "title": "Dental SEO Agency | RM CREATIVES",
    "description": "Dental SEO Agency. Human SEO strategy with AI-assisted demand, Search Console and page-overlap analysis. Build visibility around useful patient enquiries.",
    "ctaTitle": "Show us the site and priority treat­ments."
  },
  "ru/dental-marketing/seo": {
    "headline": "SEO для сто­ма­то­ло­гии: стратегия человека и масштаб анализа ИИ.",
    "intro": "Развиваем видимость по тем услугам и локациям, которые пациенты действительно ищут, без публикации десятков страниц, конкурирующих друг с другом. SEO-специалист использует ИИ для анализа больших семантических массивов, Search Console, структуры сайта, конкурентов и пересечения страниц, а затем принимает решение, какие темы клинике действительно стоит занимать в поиске.",
    "capabilities": [
      "Технический и индексный аудит с AI-поиском повторяющихся проблем на больших массивах URL.",
      "Карта спроса по услугам, врачам и локациям на основе реального языка поиска пациентов.",
      "Архитектура коммерческих страниц, которая снижает каннибализацию между услугами, статьями и географическими страницами.",
      "ТЗ на контент, основанные на вопросах пациентов, коммерческом намерении и медицинской проверке.",
      "Контроль GEO / AI visibility вместе с классической поисковой видимостью, где это имеет смысл.",
      "Измерение органических обращений, чтобы не путать рост позиций с бизнес-результатом."
    ],
    "challenge": "ИИ позволяет проверить больше запросов и страниц; SEO-специалист решает, что заслуживает отдельной страницы, что нужно объединить и какие возможности соответствуют экономике и экспертизе клиники.",
    "ctaCopy": "Покажите сайт и приоритетные услуги. Мы найдём, где органический спрос теряется, дублируется или уходит не на те страницы.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Тех­ни­че­ский и индексный аудит с AI-поиском по­вто­ря­ю­щих­ся проблем на больших массивах URL."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карта спроса по услугам, врачам и локациям на основе реального языка поиска пациентов."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Ар­хи­тек­ту­ра ком­мер­че­ских страниц, которая снижает кан­ни­ба­ли­за­цию между услугами, статьями и гео­гра­фи­че­ски­ми стра­ни­ца­ми."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "ТЗ на контент, осно­ван­ные на вопросах пациентов, ком­мер­че­ском намерении и ме­ди­цин­ской проверке."
      }
    ],
    "measurement": "ИИ позволяет проверить больше запросов и страниц; SEO-специалист решает, что заслуживает отдельной страницы, что нужно объединить и какие возможности соответствуют экономике и экспертизе клиники.",
    "title": "SEO для стоматологии | RM CREATIVES",
    "description": "SEO для стоматологии. AI-анализ спроса, Search Console, пересечения страниц и видимости в поиске. Решения принимает SEO-специалист.",
    "ctaTitle": "Покажите сайт и при­о­ри­тет­ные услуги."
  },
  "dental-marketing/google-ads": {
    "headline": "Google Ads for dentists with deeper account control.",
    "intro": "Dental search can be expensive because the patient is close to choosing a clinic. A paid-search specialist controls the account; AI helps inspect search terms, budget distribution, conversion patterns and landing-page relevance across more data and more frequently.",
    "capabilities": [
      "Separate emergency, restorative, implant, orthodontic and cosmetic intent so one service does not consume another service’s budget.",
      "Use AI-assisted query analysis to surface irrelevant, ambiguous and emerging search patterns faster.",
      "Compare spend, conversions and landing-page performance together instead of optimising keywords in isolation.",
      "Feed available call or CRM quality signals back into campaign decisions.",
      "Keep healthcare and local advertising judgement under human control."
    ],
    "challenge": "Dental search can be expensive because the patient is close to choosing a clinic. A paid-search specialist controls the account; AI helps inspect search terms, budget distribution, conversion patterns and landing-page relevance across more data and more frequently.",
    "ctaCopy": "We will map active dental demand by treatment and location before recommending budget or campaign structure.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Separate emergency, restora­tive, implant, or­thodon­tic and cosmetic intent so one service does not consume another service’s budget."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Use AI-assisted query analysis to surface ir­rel­e­vant, ambiguous and emerging search patterns faster."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Compare spend, con­ver­sions and landing-page per­for­mance together instead of op­ti­mis­ing keywords in isolation."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Feed available call or CRM quality signals back into campaign decisions."
      }
    ],
    "measurement": "Keep healthcare and local advertising judgement under human control.",
    "title": "Google Ads for Dentists | RM CREATIVES",
    "description": "Google Ads for Dentists. Specialist budget control with AI-assisted search-term, spend, conversion and landing-page analysis for useful patient enquiries.",
    "ctaTitle": "We will map active dental demand by treatment and location before rec­om­mend­ing budget or campaign structure."
  },
  "ru/dental-marketing/google-ads": {
    "headline": "Google Ads для сто­ма­то­ло­гии с более глубоким контролем аккаунта.",
    "intro": "Поиск в стоматологии может быть дорогим, потому что пациент уже близок к выбору клиники. Аккаунтом управляет специалист по поисковой рекламе; ИИ помогает чаще и на большем объёме данных анализировать запросы, распределение бюджета, паттерны конверсий и релевантность посадочных.",
    "capabilities": [],
    "challenge": "Поиск в стоматологии может быть дорогим, потому что пациент уже близок к выбору клиники. Аккаунтом управляет специалист по поисковой рекламе; ИИ помогает чаще и на большем объёме данных анализировать запросы, распределение бюджета, паттерны конверсий и релевантность посадочных.",
    "ctaCopy": "Сначала оценим активный спрос по услугам и географии, затем предложим бюджет и структуру кампаний.",
    "strategySteps": [],
    "measurement": "Поиск в стоматологии может быть дорогим, потому что пациент уже близок к выбору клиники. Аккаунтом управляет специалист по поисковой рекламе; ИИ помогает чаще и на большем объёме данных анализировать запросы, распределение бюджета, паттерны конверсий и релевантность посадочных.",
    "title": "Google Ads для стоматологии | RM CREATIVES",
    "description": "Google Ads для стоматологии. Контроль бюджета специалистом и AI-анализ запросов, расходов, конверсий и посадочных для привлечения целевых обращений.",
    "ctaTitle": "Сначала оценим активный спрос по услугам и географии, затем предложим бюджет и структуру кампаний."
  },
  "dental-marketing/dental-implants": {
    "headline": "Dental implant marketing for a decision that cannot be reduced to a lead form.",
    "intro": "Implant and full-arch patients research techniques, price, trust, recovery, finance and alternatives before they contact a clinic. AI helps us analyse that decision landscape at scale; human specialists turn it into search coverage, credible pages and a consultation path.",
    "capabilities": [
      "Implant and full-arch demand map across commercial and research-stage intent.",
      "AI-assisted analysis of common questions, competitor positioning and content gaps.",
      "Google Ads structure around high-intent treatment demand.",
      "Consultation-led landing pages with clinician, process and proof signals.",
      "Measurement from source to enquiry and, where available, consultation outcome."
    ],
    "challenge": "Implant and full-arch patients research techniques, price, trust, recovery, finance and alternatives before they contact a clinic. AI helps us analyse that decision landscape at scale; human specialists turn it into search coverage, credible pages and a consultation path.",
    "ctaCopy": "Build an implant acquisition system around qualified consultation demand, not raw lead volume.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Implant and full-arch demand map across com­mer­cial and research-stage intent."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "AI-assisted analysis of common questions, com­peti­tor po­si­tion­ing and content gaps."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Google Ads structure around high-intent treatment demand."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Con­sul­ta­tion-led landing pages with clinician, process and proof signals."
      }
    ],
    "measurement": "Measurement from source to enquiry and, where available, consultation outcome.",
    "title": "Dental Implant Marketing | RM CREATIVES",
    "description": "Dental Implant Marketing. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Build an implant ac­qui­si­tion system around qualified con­sul­ta­tion demand, not raw lead volume."
  },
  "ru/dental-marketing/dental-implants": {
    "headline": "Маркетинг им­план­та­ции для решения, которое нельзя свести к лид-форме.",
    "intro": "Пациенты, выбирающие имплантацию и полную реабилитацию, изучают методы, стоимость, доверие, восстановление, финансирование и альтернативы ещё до обращения. ИИ помогает масштабно анализировать эту карту выбора; специалисты превращают её в поисковое покрытие, убедительные страницы и путь к консультации.",
    "capabilities": [
      "Карту спроса на имплантацию и full-arch от коммерческих запросов до этапа исследования.",
      "AI-анализ частых вопросов, позиционирования конкурентов и контентных пробелов.",
      "Структуру Google Ads вокруг высокоинтентного спроса на лечение.",
      "Посадочные страницы под консультацию с информацией о враче, процессе и доказательствах.",
      "Измерение от источника до обращения и, где возможно, до результата консультации."
    ],
    "challenge": "Пациенты, выбирающие имплантацию и полную реабилитацию, изучают методы, стоимость, доверие, восстановление, финансирование и альтернативы ещё до обращения. ИИ помогает масштабно анализировать эту карту выбора; специалисты превращают её в поисковое покрытие, убедительные страницы и путь к консультации.",
    "ctaCopy": "Строим систему привлечения на имплантацию вокруг качественного спроса на консультацию, а не сырого количества лидов.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карту спроса на им­план­та­цию и full-arch от ком­мер­че­ских запросов до этапа ис­сле­до­ва­ния."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ частых вопросов, по­зи­ци­о­ни­ро­ва­ния кон­ку­рен­тов и кон­тент­ных пробелов."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Структуру Google Ads вокруг вы­со­ко­ин­тент­но­го спроса на лечение."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "По­са­доч­ные страницы под кон­суль­та­цию с ин­фор­ма­ци­ей о враче, процессе и до­ка­за­тель­ствах."
      }
    ],
    "measurement": "Измерение от источника до обращения и, где возможно, до результата консультации.",
    "title": "Маркетинг имплантации зубов | RM CREATIVES",
    "description": "Маркетинг имплантации зубов. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Строим систему при­вле­че­ния на им­план­та­цию вокруг ка­че­ствен­но­го спроса на кон­суль­та­цию, а не сырого ко­ли­че­ства лидов."
  },
  "dental-marketing/websites": {
    "headline": "Dental websites built from patient demand, not internal clinic structure.",
    "intro": "We use search demand, paid-media data and patient behaviour to shape the site before design decisions harden. AI helps analyse larger volumes of queries, existing pages and content; human UX and clinical judgement decide the final patient journey.",
    "capabilities": [
      "Patient-first information architecture across treatments, clinicians and locations.",
      "Pages that answer the same questions patients bring from Google Ads and organic search.",
      "Mobile conversion paths for calls, forms, messages and booking.",
      "SEO-ready technical foundations and analytics from launch.",
      "AI-assisted QA for consistency, metadata, links and repeated implementation issues."
    ],
    "challenge": "We use search demand, paid-media data and patient behaviour to shape the site before design decisions harden. AI helps analyse larger volumes of queries, existing pages and content; human UX and clinical judgement decide the final patient journey.",
    "ctaCopy": "Turn the website into the conversion layer for the whole dental acquisition system.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Patient-first in­for­ma­tion ar­chi­tec­ture across treat­ments, clin­i­cians and locations."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Pages that answer the same questions patients bring from Google Ads and organic search."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Mobile con­ver­sion paths for calls, forms, messages and booking."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "SEO-ready technical foun­da­tions and analytics from launch."
      }
    ],
    "measurement": "AI-assisted QA for consistency, metadata, links and repeated implementation issues.",
    "title": "Dental Website Design | RM CREATIVES",
    "description": "Dental Website Design. Human UX with AI-assisted demand research, content analysis and QA. Build clear patient journeys from search to enquiry.",
    "ctaTitle": "Turn the website into the con­ver­sion layer for the whole dental ac­qui­si­tion system."
  },
  "ru/dental-marketing/websites": {
    "headline": "Сайты сто­ма­то­ло­гий, по­стро­ен­ные от спроса пациентов, а не от вну­трен­ней структуры клиники.",
    "intro": "Мы используем поисковый спрос, данные платной рекламы и поведение пациентов, чтобы сформировать сайт до того, как дизайн станет неизменяемым. ИИ помогает анализировать большие массивы запросов, текущих страниц и контента; финальный путь пациента определяют UX-специалисты и клиническая логика.",
    "capabilities": [
      "Patient-first архитектуру по услугам, врачам и локациям.",
      "Страницы, которые отвечают на те же вопросы, с которыми пациент приходит из Google Ads и органического поиска.",
      "Мобильные сценарии конверсии для звонков, форм, сообщений и записи.",
      "SEO-ready техническую базу и аналитику с момента запуска.",
      "AI-QA согласованности, метаданных, ссылок и повторяющихся ошибок реализации."
    ],
    "challenge": "Мы используем поисковый спрос, данные платной рекламы и поведение пациентов, чтобы сформировать сайт до того, как дизайн станет неизменяемым. ИИ помогает анализировать большие массивы запросов, текущих страниц и контента; финальный путь пациента определяют UX-специалисты и клиническая логика.",
    "ctaCopy": "Превращаем сайт в конверсионный слой всей системы привлечения стоматологии.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Patient-first ар­хи­тек­ту­ру по услугам, врачам и локациям."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Страницы, которые отвечают на те же вопросы, с которыми пациент приходит из Google Ads и ор­га­ни­че­ско­го поиска."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Мобильные сценарии конверсии для звонков, форм, сообщений и записи."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "SEO-ready тех­ни­че­скую базу и аналитику с момента запуска."
      }
    ],
    "measurement": "AI-QA согласованности, метаданных, ссылок и повторяющихся ошибок реализации.",
    "title": "Сайты для стоматологий | RM CREATIVES",
    "description": "Сайты для стоматологий. UX под управлением людей, AI-анализ спроса, контента и техническая проверка. Понятный путь пациента к обращению.",
    "ctaTitle": "Пре­вра­ща­ем сайт в кон­вер­си­он­ный слой всей системы при­вле­че­ния сто­ма­то­ло­гии."
  },
  "medical-marketing": {
    "headline": "Medical marketing with more data in view — and human judgement in control.",
    "intro": "Private clinics and specialist centres need measurable patient demand without reducing healthcare decisions to generic performance marketing. We combine specialist channel management with AI-assisted research and analysis, so more demand, policy, page and outcome signals can be reviewed together.",
    "capabilities": [
      "Demand and competitor research across service, specialist, condition and location intent.",
      "SEO architecture that keeps informational visibility from competing with commercial clinic pages.",
      "Google Ads controlled by a specialist with AI-assisted query, spend and conversion analysis.",
      "Landing pages designed around eligibility, trust and the correct next step.",
      "Consent-conscious measurement that connects marketing to enquiries without treating sensitive health data casually.",
      "Lead-quality feedback used to improve acquisition when the clinic can return it."
    ],
    "challenge": "AI helps our team process the scale and complexity. Humans remain responsible for clinical context, advertising judgement, priorities and publication.",
    "ctaCopy": "Build the acquisition system around the medical services, locations and patient journeys that actually matter to the clinic.",
    "eyebrow": "MEDICAL MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Demand and com­peti­tor research across service, spe­cial­ist, condition and location intent."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "SEO ar­chi­tec­ture that keeps in­for­ma­tion­al vis­i­bil­i­ty from competing with com­mer­cial clinic pages."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Google Ads con­trolled by a spe­cial­ist with AI-assisted query, spend and con­ver­sion analysis."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Landing pages designed around el­i­gi­bil­i­ty, trust and the correct next step."
      }
    ],
    "measurement": "Lead-quality feedback used to improve acquisition when the clinic can return it.",
    "title": "Medical Marketing Agency | RM CREATIVES",
    "description": "Medical Marketing Agency. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Build the ac­qui­si­tion system around the medical services, locations and patient journeys that actually matter to the clinic."
  },
  "ru/medical-marketing": {
    "headline": "Ме­ди­цин­ский маркетинг: больше данных в поле зрения, решения — под контролем человека.",
    "intro": "Частным клиникам и специализированным центрам нужен измеримый пациентский спрос без превращения медицинского выбора в обычный performance-маркетинг. Мы соединяем профильное управление каналами с AI-исследованиями и анализом, чтобы спрос, политики, страницы и результаты обращений рассматривались вместе.",
    "capabilities": [
      "Исследование спроса и конкурентов по услугам, специалистам, состояниям и географии.",
      "SEO-архитектура, в которой информационный контент усиливает, а не конкурирует с коммерческими страницами клиники.",
      "Google Ads под управлением специалиста с AI-анализом запросов, расходов и конверсий.",
      "Посадочные страницы, построенные вокруг показаний, доверия и правильного следующего шага.",
      "Измерение с учётом consent и приватности, которое связывает маркетинг с обращениями без легкомысленного обращения с чувствительными медицинскими данными.",
      "Обратная связь по качеству лидов возвращается в систему, если клиника может её передавать."
    ],
    "challenge": "Частным клиникам и специализированным центрам нужен измеримый пациентский спрос без превращения медицинского выбора в обычный performance-маркетинг. Мы соединяем профильное управление каналами с AI-исследованиями и анализом, чтобы спрос, политики, страницы и результаты обращений рассматривались вместе.",
    "ctaCopy": "Строим систему привлечения вокруг тех медицинских услуг, локаций и пациентских сценариев, которые действительно важны клинике.",
    "eyebrow": "MEDICAL MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Ис­сле­до­ва­ние спроса и кон­ку­рен­тов по услугам, спе­ци­а­ли­стам, со­сто­я­ни­ям и географии."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "SEO-ар­хи­тек­ту­ра, в которой ин­фор­ма­ци­он­ный контент усиливает, а не кон­ку­ри­ру­ет с ком­мер­че­ски­ми стра­ни­ца­ми клиники."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Google Ads под управ­ле­ни­ем спе­ци­а­ли­ста с AI-анализом запросов, расходов и конверсий."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "По­са­доч­ные страницы, по­стро­ен­ные вокруг показаний, доверия и пра­виль­но­го сле­ду­ю­ще­го шага."
      }
    ],
    "measurement": "Обратная связь по качеству лидов возвращается в систему, если клиника может её передавать.",
    "title": "Маркетинг медицинских клиник | RM CREATIVES",
    "description": "Маркетинг медицинских клиник. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Строим систему при­вле­че­ния вокруг тех ме­ди­цин­ских услуг, локаций и па­ци­ент­ских сценариев, которые дей­стви­тель­но важны клинике."
  },
  "medical-marketing/seo": {
    "headline": "Medical SEO that separates vis­i­bil­i­ty from useful patient demand.",
    "intro": "Medical search spans services, specialists, symptoms, conditions and questions. AI helps us analyse that large semantic landscape, page overlap, Search Console performance and competitor coverage. An SEO specialist decides how those signals should become a safe, useful site architecture.",
    "capabilities": [
      "Technical and indexation audit across the full site.",
      "Service, specialist, symptom and location demand mapping.",
      "Clear roles for commercial pages and informational content to reduce cannibalisation.",
      "AI-assisted content-gap and internal-link analysis.",
      "GEO / AI search visibility monitoring where useful.",
      "Organic enquiry measurement instead of traffic-only reporting."
    ],
    "challenge": "Medical search spans services, specialists, symptoms, conditions and questions. AI helps us analyse that large semantic landscape, page overlap, Search Console performance and competitor coverage. An SEO specialist decides how those signals should become a safe, useful site architecture.",
    "ctaCopy": "Find where medical search demand is being missed, duplicated or routed to the wrong page.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Technical and in­dex­a­tion audit across the full site."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Service, spe­cial­ist, symptom and location demand mapping."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Clear roles for com­mer­cial pages and in­for­ma­tion­al content to reduce can­ni­bal­i­sa­tion."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "AI-assisted content-gap and internal-link analysis."
      }
    ],
    "measurement": "Organic enquiry measurement instead of traffic-only reporting.",
    "title": "Medical SEO Agency | RM CREATIVES",
    "description": "Medical SEO Agency. Human SEO strategy with AI-assisted demand, Search Console and page-overlap analysis. Build visibility around useful patient enquiries.",
    "ctaTitle": "Find where medical search demand is being missed, du­pli­cat­ed or routed to the wrong page."
  },
  "ru/medical-marketing/seo": {
    "headline": "Ме­ди­цин­ское SEO, которое отделяет видимость от полезного па­ци­ент­ско­го спроса.",
    "intro": "Медицинский поиск охватывает услуги, врачей, симптомы, состояния и вопросы. ИИ помогает анализировать большой семантический массив, пересечения страниц, Search Console и конкурентов. SEO-специалист решает, как превратить эти сигналы в безопасную и полезную архитектуру сайта.",
    "capabilities": [
      "Технический и индексный аудит всего сайта.",
      "Карту спроса по услугам, врачам, симптомам и географии.",
      "Чёткие роли коммерческих страниц и информационного контента для снижения каннибализации.",
      "AI-анализ контентных пробелов и внутренней перелинковки.",
      "Мониторинг GEO / AI search visibility там, где он полезен.",
      "Измерение органических обращений вместо отчётности только по трафику."
    ],
    "challenge": "Медицинский поиск охватывает услуги, врачей, симптомы, состояния и вопросы. ИИ помогает анализировать большой семантический массив, пересечения страниц, Search Console и конкурентов. SEO-специалист решает, как превратить эти сигналы в безопасную и полезную архитектуру сайта.",
    "ctaCopy": "Найдём, где медицинский поисковый спрос теряется, дублируется или попадает не на ту страницу.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Тех­ни­че­ский и индексный аудит всего сайта."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карту спроса по услугам, врачам, симптомам и географии."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Чёткие роли ком­мер­че­ских страниц и ин­фор­ма­ци­он­но­го контента для снижения кан­ни­ба­ли­за­ции."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ кон­тент­ных пробелов и вну­трен­ней пе­ре­лин­ков­ки."
      }
    ],
    "measurement": "Измерение органических обращений вместо отчётности только по трафику.",
    "title": "SEO для медицинских клиник | RM CREATIVES",
    "description": "SEO для медицинских клиник. AI-анализ спроса, Search Console, пересечения страниц и видимости в поиске. Решения принимает SEO-специалист.",
    "ctaTitle": "Найдём, где ме­ди­цин­ский поисковый спрос теряется, ду­бли­ру­ет­ся или попадает не на ту страницу."
  },
  "medical-marketing/google-ads": {
    "headline": "Google Ads for medical clinics: spe­cial­ist control with AI-assisted vigilance.",
    "intro": "Medical accounts combine fragmented search intent, policy constraints and high-value patient decisions. A paid-search specialist owns the account; AI helps scan search terms, spend, conversions, account changes and landing-page signals more broadly and more often.",
    "capabilities": [
      "Forecast active demand by service and location before allocating budget.",
      "Separate brand, service, location and research intent.",
      "Use AI-assisted analysis to surface irrelevant queries, spend anomalies and conversion shifts sooner.",
      "Align ads with compliant, service-specific landing pages.",
      "Measure calls and forms, then connect lead quality or bookings where data is available.",
      "Keep policy, clinical wording and final budget decisions under human review."
    ],
    "challenge": "Medical accounts combine fragmented search intent, policy constraints and high-value patient decisions. A paid-search specialist owns the account; AI helps scan search terms, spend, conversions, account changes and landing-page signals more broadly and more often.",
    "ctaCopy": "Capture active medical demand without letting platform automation decide what is clinically or commercially important.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Forecast active demand by service and location before al­lo­cat­ing budget."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Separate brand, service, location and research intent."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Use AI-assisted analysis to surface ir­rel­e­vant queries, spend anomalies and con­ver­sion shifts sooner."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Align ads with compliant, service-specific landing pages."
      }
    ],
    "measurement": "Keep policy, clinical wording and final budget decisions under human review.",
    "title": "Google Ads for Medical Clinics | RM CREATIVES",
    "description": "Google Ads for Medical Clinics. Specialist budget control with AI-assisted search-term, spend, conversion and landing-page analysis for patient enquiries.",
    "ctaTitle": "Capture active medical demand without letting platform au­to­ma­tion decide what is clin­i­cal­ly or com­mer­cial­ly important."
  },
  "ru/medical-marketing/google-ads": {
    "headline": "Google Ads для ме­ди­цин­ских клиник: контроль спе­ци­а­ли­ста и AI-мо­ни­то­ринг.",
    "intro": "Медицинские аккаунты объединяют фрагментированный спрос, ограничения рекламных политик и дорогие решения пациентов. Аккаунтом управляет paid-search специалист; ИИ помогает шире и чаще проверять запросы, расходы, конверсии, изменения в аккаунте и сигналы посадочных страниц.",
    "capabilities": [
      "Прогноз активного спроса по услугам и географии до распределения бюджета.",
      "Разделение брендового, сервисного, географического и исследовательского намерения.",
      "AI-анализ для раннего обнаружения нерелевантных запросов, аномалий расходов и сдвигов конверсии.",
      "Связку объявлений с корректными страницами конкретных услуг.",
      "Измерение звонков и форм с последующим подключением качества лидов или записей, если данные доступны.",
      "Политики площадок, медицинские формулировки и финальные бюджетные решения остаются под человеческим контролем."
    ],
    "challenge": "Медицинские аккаунты объединяют фрагментированный спрос, ограничения рекламных политик и дорогие решения пациентов. Аккаунтом управляет paid-search специалист; ИИ помогает шире и чаще проверять запросы, расходы, конверсии, изменения в аккаунте и сигналы посадочных страниц.",
    "ctaCopy": "Забираем активный медицинский спрос, не позволяя автоматике платформы решать, что клинически и коммерчески важно.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Прогноз активного спроса по услугам и географии до рас­пре­де­ле­ния бюджета."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Раз­де­ле­ние брен­до­во­го, сер­вис­но­го, гео­гра­фи­че­ско­го и ис­сле­до­ва­тель­ско­го намерения."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ для раннего об­на­ру­же­ния не­ре­ле­вант­ных запросов, аномалий расходов и сдвигов конверсии."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Связку объ­яв­ле­ний с кор­рект­ны­ми стра­ни­ца­ми кон­крет­ных услуг."
      }
    ],
    "measurement": "Политики площадок, медицинские формулировки и финальные бюджетные решения остаются под человеческим контролем.",
    "title": "Google Ads для медицинских клиник | RM CREATIVES",
    "description": "Google Ads для медицинских клиник. Контроль бюджета специалистом и AI-анализ запросов, расходов, конверсий и посадочных для привлечения целевых обращений.",
    "ctaTitle": "Забираем активный ме­ди­цин­ский спрос, не позволяя ав­то­ма­ти­ке платформы решать, что кли­ни­че­ски и ком­мер­че­ски важно."
  },
  "medical-marketing/hair-transplant": {
    "headline": "Hair Trans­plant Marketing with human judgement and AI-scale research.",
    "intro": "Hair-transplant acquisition combines technique research, surgeon comparison, trust, price and often cross-border planning. AI helps us analyse the full research landscape; specialists build the search, page and consultation system around the real decision.",
    "capabilities": [
      "Analyse technique, location and surgeon-related demand at scale.",
      "Map the research journey before the consultation request.",
      "Use AI-assisted competitor and content-gap analysis without copying generic clinic claims.",
      "Build paid and organic capture around qualified consultation intent.",
      "Measure source-to-consultation outcomes where systems allow."
    ],
    "challenge": "Hair-transplant acquisition combines technique research, surgeon comparison, trust, price and often cross-border planning. AI helps us analyse the full research landscape; specialists build the search, page and consultation system around the real decision.",
    "ctaCopy": "Start with the patient decision, the service economics and the evidence the clinic can responsibly support.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Analyse technique, location and surgeon-related demand at scale."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Map the research journey before the con­sul­ta­tion request."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Use AI-assisted com­peti­tor and content-gap analysis without copying generic clinic claims."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Build paid and organic capture around qualified con­sul­ta­tion intent."
      }
    ],
    "measurement": "Measure source-to-consultation outcomes where systems allow.",
    "title": "Hair Transplant Marketing | RM CREATIVES",
    "description": "Hair Transplant Marketing. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Start with the patient decision, the service economics and the evidence the clinic can re­spon­si­bly support."
  },
  "ru/medical-marketing/hair-transplant": {
    "headline": "Маркетинг транс­план­та­ции волос: че­ло­ве­че­ское решение и AI-масштаб ис­сле­до­ва­ния.",
    "intro": "Привлечение на трансплантацию волос включает изучение методов, сравнение хирургов, доверие, цену и часто международную поездку. ИИ помогает анализировать весь исследовательский ландшафт; специалисты строят поисковую, контентную и консультационную систему вокруг реального решения пациента.",
    "capabilities": [
      "Анализ спроса по методам, географии и хирургам в масштабе.",
      "Карту пути исследования до запроса на консультацию.",
      "AI-анализ конкурентов и контентных пробелов без копирования типичных клинических обещаний.",
      "Платный и органический захват спроса вокруг квалифицированного намерения записаться на консультацию.",
      "Измерение от источника до консультации там, где системы это позволяют."
    ],
    "challenge": "Привлечение на трансплантацию волос включает изучение методов, сравнение хирургов, доверие, цену и часто международную поездку. ИИ помогает анализировать весь исследовательский ландшафт; специалисты строят поисковую, контентную и консультационную систему вокруг реального решения пациента.",
    "ctaCopy": "Начинаем с решения пациента, экономики услуги и доказательств, которые клиника может корректно подтвердить.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Анализ спроса по методам, географии и хирургам в масштабе."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карту пути ис­сле­до­ва­ния до запроса на кон­суль­та­цию."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ кон­ку­рен­тов и кон­тент­ных пробелов без ко­пи­ро­ва­ния типичных кли­ни­че­ских обещаний."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Платный и ор­га­ни­че­ский захват спроса вокруг ква­ли­фи­ци­ро­ван­но­го намерения за­пи­сать­ся на кон­суль­та­цию."
      }
    ],
    "measurement": "Измерение от источника до консультации там, где системы это позволяют.",
    "title": "Маркетинг трансплантации волос | RM CREATIVES",
    "description": "Маркетинг трансплантации волос. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Начинаем с решения пациента, экономики услуги и до­ка­за­тельств, которые клиника может корректно под­твер­дить."
  },
  "medical-marketing/plastic-surgery": {
    "headline": "Plastic Surgery Marketing with human judgement and AI-scale research.",
    "intro": "Plastic-surgery marketing needs demand capture, patient education and realistic expectations. AI helps the team inspect search patterns, questions and competitor messaging across more data; surgeons and specialists retain control over clinical claims and proof.",
    "capabilities": [
      "Map procedure-specific search demand and comparison behaviour.",
      "Use AI-assisted analysis to find recurring concerns, questions and content gaps.",
      "Build surgeon authority and consultation-led pages.",
      "Review visual proof and claims under human control.",
      "Connect enquiries to consultation outcomes where possible."
    ],
    "challenge": "Plastic-surgery marketing needs demand capture, patient education and realistic expectations. AI helps the team inspect search patterns, questions and competitor messaging across more data; surgeons and specialists retain control over clinical claims and proof.",
    "ctaCopy": "Start with the patient decision, the service economics and the evidence the clinic can responsibly support.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Map procedure-specific search demand and com­par­i­son behaviour."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Use AI-assisted analysis to find recurring concerns, questions and content gaps."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Build surgeon authority and con­sul­ta­tion-led pages."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Review visual proof and claims under human control."
      }
    ],
    "measurement": "Connect enquiries to consultation outcomes where possible.",
    "title": "Plastic Surgery Marketing | RM CREATIVES",
    "description": "Plastic Surgery Marketing. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Start with the patient decision, the service economics and the evidence the clinic can re­spon­si­bly support."
  },
  "ru/medical-marketing/plastic-surgery": {
    "headline": "Маркетинг пла­сти­че­ской хирургии: че­ло­ве­че­ское решение и AI-масштаб ис­сле­до­ва­ния.",
    "intro": "Пластической хирургии нужен одновременно захват спроса, обучение пациента и реалистичные ожидания. ИИ помогает команде изучать больше поисковых паттернов, вопросов и сообщений конкурентов; хирурги и специалисты сохраняют контроль над медицинскими утверждениями и доказательствами.",
    "capabilities": [
      "Карту поискового спроса и сравнения по конкретным операциям.",
      "AI-анализ повторяющихся опасений, вопросов и контентных пробелов.",
      "Экспертность хирурга и страницы, ведущие к консультации.",
      "Человеческую проверку визуальных доказательств и утверждений.",
      "Связь обращений с результатами консультаций, где это возможно."
    ],
    "challenge": "Пластической хирургии нужен одновременно захват спроса, обучение пациента и реалистичные ожидания. ИИ помогает команде изучать больше поисковых паттернов, вопросов и сообщений конкурентов; хирурги и специалисты сохраняют контроль над медицинскими утверждениями и доказательствами.",
    "ctaCopy": "Начинаем с решения пациента, экономики услуги и доказательств, которые клиника может корректно подтвердить.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карту по­ис­ко­во­го спроса и сравнения по кон­крет­ным операциям."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ по­вто­ря­ю­щих­ся опасений, вопросов и кон­тент­ных пробелов."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Экс­перт­ность хирурга и страницы, ведущие к кон­суль­та­ции."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Че­ло­ве­че­скую проверку ви­зу­аль­ных до­ка­за­тельств и утвер­жде­ний."
      }
    ],
    "measurement": "Связь обращений с результатами консультаций, где это возможно.",
    "title": "Маркетинг пластической хирургии | RM CREATIVES",
    "description": "Маркетинг пластической хирургии. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Начинаем с решения пациента, экономики услуги и до­ка­за­тельств, которые клиника может корректно под­твер­дить."
  },
  "medical-marketing/fertility-clinics": {
    "headline": "Fertility Clinic Marketing with human judgement and AI-scale research.",
    "intro": "Fertility marketing combines complex research, sensitive intent, trust and privacy. AI can accelerate research and pattern analysis, but sensitive health context must be handled deliberately and the final patient communication remains human-led.",
    "capabilities": [
      "Analyse service and information demand without exposing sensitive intent unnecessarily.",
      "Build clear pathways across services, team and process information.",
      "Use AI-assisted content analysis to identify unanswered questions and duplication.",
      "Design privacy-conscious enquiry paths and measurement.",
      "Optimise around appropriate consultation actions rather than raw traffic."
    ],
    "challenge": "Fertility marketing combines complex research, sensitive intent, trust and privacy. AI can accelerate research and pattern analysis, but sensitive health context must be handled deliberately and the final patient communication remains human-led.",
    "ctaCopy": "Start with the patient decision, the service economics and the evidence the clinic can responsibly support.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Analyse service and in­for­ma­tion demand without exposing sensitive intent un­nec­es­sar­i­ly."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Build clear pathways across services, team and process in­for­ma­tion."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Use AI-assisted content analysis to identify unan­swered questions and du­pli­ca­tion."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Design privacy-conscious enquiry paths and mea­sure­ment."
      }
    ],
    "measurement": "Optimise around appropriate consultation actions rather than raw traffic.",
    "title": "Fertility Clinic Marketing | RM CREATIVES",
    "description": "Fertility Clinic Marketing. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Start with the patient decision, the service economics and the evidence the clinic can re­spon­si­bly support."
  },
  "ru/medical-marketing/fertility-clinics": {
    "headline": "Маркетинг клиник ре­про­дук­ции: че­ло­ве­че­ское решение и AI-масштаб ис­сле­до­ва­ния.",
    "intro": "Маркетинг репродуктивной медицины сочетает сложное исследование, чувствительный контекст, доверие и приватность. ИИ может ускорять исследование и поиск паттернов, но чувствительные медицинские данные должны обрабатываться осознанно, а финальная коммуникация с пациентом остаётся под управлением людей.",
    "capabilities": [
      "Анализ спроса по услугам и информации без ненужного раскрытия чувствительного намерения.",
      "Понятные пути между услугами, командой и информацией о процессе.",
      "AI-анализ контента для поиска неотвеченных вопросов и дублей.",
      "Конверсионные и измерительные сценарии с учётом приватности.",
      "Оптимизацию по правильным действиям к консультации, а не по сырому трафику."
    ],
    "challenge": "Маркетинг репродуктивной медицины сочетает сложное исследование, чувствительный контекст, доверие и приватность. ИИ может ускорять исследование и поиск паттернов, но чувствительные медицинские данные должны обрабатываться осознанно, а финальная коммуникация с пациентом остаётся под управлением людей.",
    "ctaCopy": "Начинаем с решения пациента, экономики услуги и доказательств, которые клиника может корректно подтвердить.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Анализ спроса по услугам и ин­фор­ма­ции без ненужного раскрытия чув­стви­тель­но­го намерения."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Понятные пути между услугами, командой и ин­фор­ма­ци­ей о процессе."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ контента для поиска не­от­ве­чен­ных вопросов и дублей."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Кон­вер­си­он­ные и из­ме­ри­тель­ные сценарии с учётом при­ват­но­сти."
      }
    ],
    "measurement": "Оптимизацию по правильным действиям к консультации, а не по сырому трафику.",
    "title": "Маркетинг клиник репродукции | RM CREATIVES",
    "description": "Маркетинг клиник репродукции. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Начинаем с решения пациента, экономики услуги и до­ка­за­тельств, которые клиника может корректно под­твер­дить."
  },
  "aesthetic-clinic-marketing": {
    "headline": "Aesthetic clinic growth with faster learning across every channel.",
    "intro": "Aesthetic demand moves between active search and discovery. We connect Meta, Google, SEO, landing pages and booking feedback around the same treatment priorities. Specialists make the decisions; AI helps them compare more offers, queries, creatives, pages and lead-quality signals at once.",
    "capabilities": [
      "Meta: human creative and offer strategy with AI-assisted pattern analysis across tests and lead quality.",
      "Google Ads: specialist budget control with AI-assisted search-term and conversion analysis.",
      "SEO / GEO: demand, Search Console, page overlap, competitor and AI-search visibility reviewed together.",
      "Website: conversion journeys informed by paid, organic and behaviour data.",
      "CRM / booking feedback: use booked, attended and repeat signals where available to distinguish cheap leads from useful demand."
    ],
    "challenge": "Aesthetic marketing changes quickly. Creative fatigue, seasonal offers, competitor pressure and treatment demand can shift before a monthly report catches them. AI-assisted analysis helps surface those shifts earlier; human specialists decide how to respond without damaging treatment positioning or practitioner trust.",
    "ctaCopy": "Build the channel mix around treatment demand, capacity and long-term client value — not around whichever platform reports the cheapest lead.",
    "eyebrow": "AESTHETIC CLINIC MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Meta: human creative and offer strategy with AI-assisted pattern analysis across tests and lead quality."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Google Ads: spe­cial­ist budget control with AI-assisted search-term and con­ver­sion analysis."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "SEO / GEO: demand, Search Console, page overlap, com­peti­tor and AI-search vis­i­bil­i­ty reviewed together."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Website: con­ver­sion journeys informed by paid, organic and behaviour data."
      }
    ],
    "measurement": "CRM / booking feedback: use booked, attended and repeat signals where available to distinguish cheap leads from useful demand.",
    "title": "Aesthetic Clinic Marketing | RM CREATIVES",
    "description": "Aesthetic Clinic Marketing. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Build the channel mix around treatment demand, capacity and long-term client value — not around whichever platform reports the cheapest lead."
  },
  "ru/aesthetic-clinic-marketing": {
    "headline": "Рост эсте­ти­че­ской клиники с более быстрым обучением на каждом канале.",
    "intro": "Спрос в эстетике перемещается между активным поиском и discovery. Мы связываем Meta, Google, SEO, посадочные и обратную связь из системы записи вокруг одних приоритетных процедур. Решения принимают специалисты; ИИ помогает одновременно сравнивать больше офферов, запросов, креативов, страниц и сигналов качества лидов.",
    "capabilities": [
      "Meta: человеческая креативная и офферная стратегия + AI-анализ паттернов тестов и качества лидов.",
      "Google Ads: контроль бюджета специалистом + AI-анализ запросов и конверсий.",
      "SEO / GEO: спрос, Search Console, пересечения страниц, конкуренты и AI-search visibility анализируются вместе.",
      "Сайт: конверсионные маршруты формируются на данных платного, органического и поведенческого трафика.",
      "CRM / booking feedback: где возможно, используем записи, визиты и повторные обращения, чтобы отличать дешёвые лиды от полезного спроса."
    ],
    "challenge": "Эстетический маркетинг меняется быстро. Выгорание креативов, сезонные офферы, давление конкурентов и спрос на процедуры могут измениться раньше, чем это будет видно в месячном отчёте. AI-анализ помогает увидеть изменения раньше; специалисты решают, как реагировать, не разрушая позиционирование процедур и доверие к врачу.",
    "ctaCopy": "Строим микс каналов вокруг спроса на процедуры, загрузки и долгосрочной ценности клиента — а не вокруг того, где рекламная платформа показывает самый дешёвый лид.",
    "eyebrow": "AESTHETIC CLINIC MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Meta: че­ло­ве­че­ская кре­а­тив­ная и офферная стратегия + AI-анализ паттернов тестов и качества лидов."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Google Ads: контроль бюджета спе­ци­а­ли­стом + AI-анализ запросов и конверсий."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "SEO / GEO: спрос, Search Console, пе­ре­се­че­ния страниц, кон­ку­рен­ты и AI-search vis­i­bil­i­ty ана­ли­зи­ру­ют­ся вместе."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Сайт: кон­вер­си­он­ные маршруты фор­ми­ру­ют­ся на данных платного, ор­га­ни­че­ско­го и по­ве­ден­че­ско­го трафика."
      }
    ],
    "measurement": "Эстетический маркетинг меняется быстро. Выгорание креативов, сезонные офферы, давление конкурентов и спрос на процедуры могут измениться раньше, чем это будет видно в месячном отчёте. AI-анализ помогает увидеть изменения раньше; специалисты решают, как реагировать, не разрушая позиционирование процедур и доверие к врачу.",
    "title": "Маркетинг эстетических клиник | RM CREATIVES",
    "description": "Маркетинг эстетических клиник. Специалисты связывают рекламу, SEO, сайт и обращения. ИИ помогает анализировать больше данных и точнее выбирать приоритеты.",
    "ctaTitle": "Строим микс каналов вокруг спроса на процедуры, загрузки и дол­го­сроч­ной ценности клиента — а не вокруг того, где рекламная платформа по­ка­зы­ва­ет самый дешёвый лид."
  },
  "aesthetic-clinic-marketing/seo": {
    "headline": "SEO for aesthetic clinics with AI-assisted demand and page analysis.",
    "intro": "Patients search by treatment, concern, location, result, price and recovery. AI helps us analyse the long tail and the site at scale; SEO specialists decide which pages should exist, which should be consolidated and which search opportunities actually support the clinic’s treatment priorities.",
    "capabilities": [
      "Technical and indexation audit across the site.",
      "Procedure, concern and location demand mapping.",
      "AI-assisted Search Console, competitor and cannibalisation analysis.",
      "Commercial page architecture instead of dozens of interchangeable treatment pages.",
      "GEO / AI visibility monitoring where relevant.",
      "Organic enquiry tracking alongside visibility and sessions."
    ],
    "challenge": "Patients search by treatment, concern, location, result, price and recovery. AI helps us analyse the long tail and the site at scale; SEO specialists decide which pages should exist, which should be consolidated and which search opportunities actually support the clinic’s treatment priorities.",
    "ctaCopy": "Grow organic visibility around the treatments and concerns that can become real consultations.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Technical and in­dex­a­tion audit across the site."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Procedure, concern and location demand mapping."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "AI-assisted Search Console, com­peti­tor and can­ni­bal­i­sa­tion analysis."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Com­mer­cial page ar­chi­tec­ture instead of dozens of in­ter­change­able treatment pages."
      }
    ],
    "measurement": "Organic enquiry tracking alongside visibility and sessions.",
    "title": "SEO for Aesthetic Clinics | RM CREATIVES",
    "description": "SEO for Aesthetic Clinics. Human SEO strategy with AI-assisted demand, Search Console and page-overlap analysis. Build visibility around patient enquiries.",
    "ctaTitle": "Grow organic vis­i­bil­i­ty around the treat­ments and concerns that can become real con­sul­ta­tions."
  },
  "ru/aesthetic-clinic-marketing/seo": {
    "headline": "SEO для эсте­ти­че­ских клиник с AI-анализом спроса и страниц.",
    "intro": "Пациенты ищут по процедуре, проблеме, локации, результату, цене и восстановлению. ИИ помогает анализировать long tail и сайт в масштабе; SEO-специалист решает, какие страницы должны существовать, какие нужно объединить и какие поисковые возможности действительно поддерживают приоритетные процедуры клиники.",
    "capabilities": [
      "Технический и индексный аудит сайта.",
      "Карту спроса по процедурам, проблемам и географии.",
      "AI-анализ Search Console, конкурентов и каннибализации.",
      "Архитектуру коммерческих страниц вместо десятков взаимозаменяемых страниц процедур.",
      "Мониторинг GEO / AI visibility, где это имеет смысл.",
      "Отслеживание органических обращений вместе с видимостью и сессиями."
    ],
    "challenge": "Пациенты ищут по процедуре, проблеме, локации, результату, цене и восстановлению. ИИ помогает анализировать long tail и сайт в масштабе; SEO-специалист решает, какие страницы должны существовать, какие нужно объединить и какие поисковые возможности действительно поддерживают приоритетные процедуры клиники.",
    "ctaCopy": "Развиваем органическую видимость вокруг процедур и запросов, которые могут стать реальными консультациями.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Тех­ни­че­ский и индексный аудит сайта."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Карту спроса по про­це­ду­рам, проблемам и географии."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ Search Console, кон­ку­рен­тов и кан­ни­ба­ли­за­ции."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Ар­хи­тек­ту­ру ком­мер­че­ских страниц вместо десятков вза­и­мо­за­ме­ня­е­мых страниц процедур."
      }
    ],
    "measurement": "Отслеживание органических обращений вместе с видимостью и сессиями.",
    "title": "SEO для эстетических клиник | RM CREATIVES",
    "description": "SEO для эстетических клиник. AI-анализ спроса, Search Console, пересечения страниц и видимости в поиске. Решения принимает SEO-специалист.",
    "ctaTitle": "Развиваем ор­га­ни­че­скую видимость вокруг процедур и запросов, которые могут стать реальными кон­суль­та­ци­я­ми."
  },
  "aesthetic-clinic-marketing/google-ads": {
    "headline": "Google Ads for aesthetic clinics with less budget hidden in the wrong searches.",
    "intro": "A paid-search specialist controls bidding, structure and priorities. AI helps analyse search terms, spend, conversions and landing-page relevance across more data, so treatment-ready demand can be separated from research traffic and low-value noise faster.",
    "capabilities": [
      "Treatment and location demand forecast before budget allocation.",
      "Campaign structure around treatment value and search readiness.",
      "AI-assisted query and spend analysis to surface waste earlier.",
      "Dedicated landing pages that answer price, suitability, practitioner and downtime questions.",
      "Lead-quality feedback from booking where available.",
      "Human approval of all budget, offer and medical-aesthetic claims."
    ],
    "challenge": "A paid-search specialist controls bidding, structure and priorities. AI helps analyse search terms, spend, conversions and landing-page relevance across more data, so treatment-ready demand can be separated from research traffic and low-value noise faster.",
    "ctaCopy": "Capture people already comparing treatments — with enough account control to know where the money is going.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Treatment and location demand forecast before budget al­lo­ca­tion."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Campaign structure around treatment value and search readiness."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "AI-assisted query and spend analysis to surface waste earlier."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Dedicated landing pages that answer price, suit­abil­i­ty, prac­ti­tion­er and downtime questions."
      }
    ],
    "measurement": "Human approval of all budget, offer and medical-aesthetic claims.",
    "title": "Google Ads for Aesthetic Clinics | RM CREATIVES",
    "description": "Google Ads for Aesthetic Clinics. Specialist budget control with AI-assisted search-term, spend, conversion and landing-page analysis for patient enquiries.",
    "ctaTitle": "Capture people already comparing treat­ments — with enough account control to know where the money is going."
  },
  "ru/aesthetic-clinic-marketing/google-ads": {
    "headline": "Google Ads для эсте­ти­че­ских клиник: меньше бюджета спрятано в не­пра­виль­ных запросах.",
    "intro": "Специалист по поисковой рекламе контролирует ставки, структуру и приоритеты. ИИ помогает анализировать запросы, расходы, конверсии и релевантность посадочных на большем массиве данных, чтобы быстрее отделять готовый к процедуре спрос от исследовательского трафика и слабого шума.",
    "capabilities": [
      "Прогноз спроса по процедурам и географии до распределения бюджета.",
      "Структуру кампаний вокруг ценности процедуры и готовности к покупке.",
      "AI-анализ запросов и расходов для более раннего поиска потерь.",
      "Отдельные посадочные, которые отвечают на вопросы о цене, показаниях, специалисте и восстановлении.",
      "Обратную связь по качеству лидов из системы записи, где доступно.",
      "Человеческое подтверждение бюджета, офферов и medical-aesthetic формулировок."
    ],
    "challenge": "Специалист по поисковой рекламе контролирует ставки, структуру и приоритеты. ИИ помогает анализировать запросы, расходы, конверсии и релевантность посадочных на большем массиве данных, чтобы быстрее отделять готовый к процедуре спрос от исследовательского трафика и слабого шума.",
    "ctaCopy": "Забираем людей, которые уже сравнивают процедуры, и сохраняем достаточный контроль аккаунта, чтобы понимать, куда уходит каждый значимый кусок бюджета.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Прогноз спроса по про­це­ду­рам и географии до рас­пре­де­ле­ния бюджета."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Структуру кампаний вокруг ценности процедуры и го­тов­но­сти к покупке."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ запросов и расходов для более раннего поиска потерь."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Отдельные по­са­доч­ные, которые отвечают на вопросы о цене, по­ка­за­ни­ях, спе­ци­а­ли­сте и вос­ста­нов­ле­нии."
      }
    ],
    "measurement": "Человеческое подтверждение бюджета, офферов и medical-aesthetic формулировок.",
    "title": "Google Ads для эстетических клиник | RM CREATIVES",
    "description": "Google Ads для эстетических клиник. Контроль бюджета специалистом и AI-анализ запросов, расходов, конверсий и посадочных для привлечения целевых обращений.",
    "ctaTitle": "Забираем людей, которые уже срав­ни­ва­ют процедуры, и сохраняем до­ста­точ­ный контроль аккаунта, чтобы понимать, куда уходит каждый значимый кусок бюджета."
  },
  "aesthetic-clinic-marketing/meta-ads": {
    "headline": "Meta Ads for aesthetic clinics: human creative strategy, AI-assisted learning speed.",
    "intro": "Meta creates demand before a person searches. That makes creative, offer and timing critical. Our specialist sets the direction; AI helps compare a larger history of treatments, angles, audiences, costs and lead-quality outcomes so we can learn faster than manual campaign-by-campaign review.",
    "capabilities": [
      "Offer and audience strategy around treatment economics and capacity.",
      "Creative systems organised by concern, treatment, practitioner and seasonal moment.",
      "AI-assisted analysis of creative fatigue, cost changes and response patterns.",
      "Lead-form and landing-page funnels with measurable enquiry actions.",
      "Booking-team feedback used to separate cheap leads from useful enquiries.",
      "Human control over claims, visuals, budget and the next test."
    ],
    "challenge": "Meta creates demand before a person searches. That makes creative, offer and timing critical. Our specialist sets the direction; AI helps compare a larger history of treatments, angles, audiences, costs and lead-quality outcomes so we can learn faster than manual campaign-by-campaign review.",
    "ctaCopy": "Create patient demand, then make every new test smarter than the last one.",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Offer and audience strategy around treatment economics and capacity."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Creative systems organised by concern, treatment, prac­ti­tion­er and seasonal moment."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "AI-assisted analysis of creative fatigue, cost changes and response patterns."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Lead-form and landing-page funnels with mea­sur­able enquiry actions."
      }
    ],
    "measurement": "Human control over claims, visuals, budget and the next test.",
    "title": "Meta Ads for Aesthetic Clinics | RM CREATIVES",
    "description": "Meta Ads for Aesthetic Clinics. Human creative strategy with AI-assisted analysis of offers, fatigue and lead quality. Learn faster from every campaign test.",
    "ctaTitle": "Create patient demand, then make every new test smarter than the last one."
  },
  "ru/aesthetic-clinic-marketing/meta-ads": {
    "headline": "Meta Ads для эсте­ти­че­ских клиник: че­ло­ве­че­ская кре­а­тив­ная стратегия, AI-скорость обучения.",
    "intro": "Meta создаёт спрос ещё до того, как человек начал искать. Поэтому креатив, оффер и момент показа критичны. Специалист задаёт направление; ИИ помогает сравнивать большую историю процедур, углов, аудиторий, стоимости и качества лидов, чтобы учиться быстрее, чем при ручной проверке кампаний по одной.",
    "capabilities": [
      "Стратегию офферов и аудиторий вокруг экономики процедур и загрузки.",
      "Систему креативов по проблемам, процедурам, специалистам и сезонным моментам.",
      "AI-анализ выгорания креативов, изменений стоимости и паттернов реакции.",
      "Воронки лид-форм и посадочных с измеримыми действиями.",
      "Обратную связь команды записи, чтобы отделять дешёвые лиды от полезных обращений.",
      "Человеческий контроль утверждений, визуалов, бюджета и следующего теста."
    ],
    "challenge": "Meta создаёт спрос ещё до того, как человек начал искать. Поэтому креатив, оффер и момент показа критичны. Специалист задаёт направление; ИИ помогает сравнивать большую историю процедур, углов, аудиторий, стоимости и качества лидов, чтобы учиться быстрее, чем при ручной проверке кампаний по одной.",
    "ctaCopy": "Создаём пациентский спрос и делаем каждый следующий тест умнее предыдущего.",
    "strategySteps": [
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Стратегию офферов и аудиторий вокруг экономики процедур и загрузки."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Систему креативов по проблемам, про­це­ду­рам, спе­ци­а­ли­стам и сезонным моментам."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "AI-анализ выгорания креативов, изменений стоимости и паттернов реакции."
      },
      {
        "title": "Спе­ци­а­лист + ИИ",
        "copy": "Воронки лид-форм и по­са­доч­ных с из­ме­ри­мы­ми дей­стви­я­ми."
      }
    ],
    "measurement": "Человеческий контроль утверждений, визуалов, бюджета и следующего теста.",
    "title": "Meta Ads для эстетических клиник | RM CREATIVES",
    "description": "Meta Ads для эстетических клиник. Стратегия специалиста и AI-анализ креативов, офферов и качества лидов. Каждый тест опирается на историю кампаний.",
    "ctaTitle": "Создаём па­ци­ент­ский спрос и делаем каждый следующий тест умнее пре­ды­ду­ще­го."
  },
  "med-spa-marketing": {
    "headline": "Med spa growth with AI-assisted ac­qui­si­tion and human com­mer­cial judgement.",
    "intro": "US med spa growth sits across local search, treatment discovery, offers, booking and repeat value. We use specialists to own channel strategy and AI tools to connect more data across acquisition, consultation and rebooking so decisions are not made from CPL alone.",
    "capabilities": [
      "Treatment economics and capacity model before scaling acquisition.",
      "Local SEO and Google Ads for active treatment intent.",
      "Meta demand creation with AI-assisted creative and offer analysis.",
      "Landing pages and booking paths built around treatment questions and trust.",
      "Measurement from enquiry to consultation and repeat value where systems allow.",
      "Human review for state-level rules, clinical wording, visual proof and platform policy."
    ],
    "challenge": "US med spa growth sits across local search, treatment discovery, offers, booking and repeat value. We use specialists to own channel strategy and AI tools to connect more data across acquisition, consultation and rebooking so decisions are not made from CPL alone.",
    "ctaCopy": "Build the acquisition mix around consultations, treatment margin and lifetime value — not a screenshot of cheap leads.",
    "eyebrow": "MED SPA MARKETING / HUMAN + AI",
    "strategySteps": [
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Treatment economics and capacity model before scaling ac­qui­si­tion."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Local SEO and Google Ads for active treatment intent."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Meta demand creation with AI-assisted creative and offer analysis."
      },
      {
        "title": "Spe­cial­ist + AI",
        "copy": "Landing pages and booking paths built around treatment questions and trust."
      }
    ],
    "measurement": "Human review for state-level rules, clinical wording, visual proof and platform policy.",
    "title": "Med Spa Marketing Agency | RM CREATIVES",
    "description": "Med Spa Marketing Agency. Specialists connect search, advertising, websites and enquiry data. AI expands research and analysis; humans make the decisions.",
    "ctaTitle": "Build the ac­qui­si­tion mix around con­sul­ta­tions, treatment margin and lifetime value — not a screen­shot of cheap leads."
  }
};
for (const page of [...enIndustryPages, ...ruIndustryPages]) {
  const copy = masterCopy[`${page.lang === "ru" ? "ru/" : ""}${page.slug}`];
  if (copy) Object.assign(page, copy);
}

export const allIndustryPaths = [...enIndustryPages.map(p=>`/industries/${p.slug}/`),...ruIndustryPages.map(p=>`/ru/industries/${p.slug}/`),'/industries/dental-marketing/'];
