/* TeenJob front-end demo. No server, real authentication, or backend storage. */
(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const toast = (message) => {
    let el = $('#site-toast');
    if (!el) { el=document.createElement('div'); el.id='site-toast'; el.className='toast'; el.setAttribute('role','status'); document.body.append(el); }
    el.textContent=message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),3500);
  };
  // Mobile navigation works on every page.
  const burger=$('.burger'), nav=$('#nav-wrap');
  if (burger && nav) {
    burger.addEventListener('click',()=>{ const open=nav.classList.toggle('open'); burger.setAttribute('aria-expanded',String(open)); burger.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню'); burger.textContent=open?'✕':'☰'; });
    nav.addEventListener('click',e=>{ if(e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Открыть меню'); burger.textContent='☰'; } });
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') {nav.classList.remove('open'); burger.setAttribute('aria-expanded','false'); burger.textContent='☰';} });
  }
  // Registration tabs.
  $$('[data-tab]').forEach(btn=>btn.addEventListener('click',()=>{
    const name=btn.dataset.tab;
    $$('[data-tab]').forEach(b=>{const active=b===btn;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});
    $$('.tab-panel').forEach(panel=>panel.classList.toggle('active',panel.id===`panel-${name}`));
  }));
  // Never save passwords, phone numbers, IDs or uploaded documents in this prototype.
  $$('form[data-demo-form]').forEach(form=>form.addEventListener('submit',e=>{
    e.preventDefault();
    if(!form.reportValidity()) return;
    const kind=form.dataset.demoForm;
    if(kind==='teen') {
      const birth=$('#t-birth')?.value;
      if(!birth) return;
      const age=ageFromDate(birth);
      if(age<15 || age>18) { toast('Сейчас этот прототип рассчитан на возраст 15–18 лет.'); return; }
      const msg=age===15 ? 'Форма проверена. В 15 лет трудоустройство возможно только в предусмотренных законом случаях — обязательно уточни условия. Аккаунт не создан.' : 'Форма заполнена корректно. Это демо: аккаунт не создан и данные никуда не отправлены.';
      $('#teen-form-status').textContent=msg; toast(msg);
    } else {
      const msg='Форма заполнена корректно. Проверка компании и отправка данных не выполняются в демо-версии.';
      $('#employer-form-status').textContent=msg; toast(msg);
    }
  }));
  function ageFromDate(value){ const d=new Date(value+'T12:00:00'); const now=new Date(); let a=now.getFullYear()-d.getFullYear(); if(now.getMonth()<d.getMonth()||(now.getMonth()===d.getMonth()&&now.getDate()<d.getDate()))a--; return a; }
  // Generic mock forms (login, contact, employer post): do not pretend that backend actions happened.
  $$('form[data-mock]').forEach(form=>form.addEventListener('submit',e=>{ e.preventDefault(); if(form.reportValidity()) toast(form.dataset.mock || 'Это демонстрационная форма: данные не отправлены.'); }));
  // Homepage search controls use the same option vocabulary as the listings page.
  const homeRegion=$('#f-region'), homeType=$('#f-type'), homeTime=$('#f-time');
  const setOptions=(el, items, label)=>{ if(!el || el.options.length>1)return; el.innerHTML=''; const first=document.createElement('option'); first.value=''; first.textContent=label; el.append(first); items.forEach(([value,text])=>{const o=document.createElement('option');o.value=value;o.textContent=text;el.append(o);}); };
  setOptions(homeRegion,[['Бишкек','Бишкек'],['Ош','Ош'],['Чуйская область','Чуйская область'],['Удалённо','Удалённо']],'Все регионы');
  setOptions(homeType,[['Промо','Промоутер'],['Онлайн','Онлайн'],['Контент','Контент'],['Обслуживание','Обслуживание'],['Офис','Офис']],'Любой тип');
  setOptions(homeTime,[['После учёбы','После учёбы'],['Неполный день','Неполный день'],['Гибкий','Гибкий'],['Выходные','Выходные']],'Любой график');
  const categoryMap={courier:'Обслуживание',cafe:'Обслуживание',shop:'Обслуживание',promo:'Промо',online:'Онлайн',event:'Обслуживание',help:'Офис'};
  // Jobs database: one live external listing, plus clearly marked demo examples for filter testing.
  const jobs=[
    {id:'altyn-promoter',title:'Промоутер в ювелирный магазин «Алтын»',company:'Кыргызский Ювелирный Завод «Алтын»',region:'Бишкек',type:'Промо',time:'Неполный день',length:'4–6 часов',pay:27000,payText:'27 000 сом (указано в объявлении)',age:null,source:'real',sourceName:'NewJob.kg',url:'https://newjob.kg/vacancy/2kv9x7',description:'Раздача листовок; в объявлении указано: без опыта, неполный день, район ЦУМ, график 5/2 с 9:30 до 14:00. Возраст не указан — обязательно уточни, принимают ли несовершеннолетних и как оформляют работу.',updated:'Внешнее объявление',tags:['Без опыта','Неполный день','Возраст уточнить']},
    {id:'hh-parttime',title:'Посмотреть свежие вакансии на подработку',company:'HeadHunter Кыргызстан',region:'Бишкек',type:'Обслуживание',time:'Гибкий',length:'Не указано',pay:0,payText:'Оплата зависит от вакансии',age:null,source:'real',sourceName:'HeadHunter.kg',url:'https://bishkek.headhunter.kg/vacancies/podrabotka/offlayn',description:'Список текущих объявлений о подработке в Бишкеке. В выдаче есть разные профессии, часть требует опыта или водительских прав. Проверь возрастные требования каждого объявления.',updated:'Открыть актуальный список',tags:['Внешний сайт','Нужно проверить возраст']},
    {id:'demo-design',title:'Помощник по дизайну для соцсетей',company:'Пример для демонстрации фильтров',region:'Удалённо',type:'Контент',time:'После учёбы',length:'Разовая задача',pay:800,payText:'Пример: 800 сом за задачу',age:15,source:'demo',sourceName:'Демо TeenJob',url:'help.html',description:'Демонстрационный пример, не реальная вакансия. Можно потренироваться создавать баннеры и простые публикации.',updated:'Демо-пример',tags:['Удалённо','Навык: Canva','Не реальная вакансия']},
    {id:'demo-content',title:'Помощник по коротким видео',company:'Пример для демонстрации фильтров',region:'Бишкек',type:'Контент',time:'После учёбы',length:'До 4 часов',pay:700,payText:'Пример: 700 сом за смену',age:16,source:'demo',sourceName:'Демо TeenJob',url:'help.html',description:'Демонстрационный пример для тестирования поиска. Не является открытой вакансией.',updated:'Демо-пример',tags:['Без опыта','После учёбы','Не реальная вакансия']},
    {id:'demo-cafe',title:'Помощник на мероприятии',company:'Пример для демонстрации фильтров',region:'Ош',type:'Обслуживание',time:'Выходные',length:'4–6 часов',pay:1000,payText:'Пример: 1 000 сом за смену',age:17,source:'demo',sourceName:'Демо TeenJob',url:'help.html',description:'Демонстрационный пример. В реальном объявлении должны быть указаны обязанности, место, график и условия оплаты.',updated:'Демо-пример',tags:['Выходные','Разовая работа','Не реальная вакансия']},
    {id:'demo-data',title:'Помощник по вводу данных',company:'Пример для демонстрации фильтров',region:'Удалённо',type:'Онлайн',time:'Гибкий',length:'До 4 часов',pay:600,payText:'Пример: 600 сом за задачу',age:18,source:'demo',sourceName:'Демо TeenJob',url:'help.html',description:'Демонстрационный пример. Никогда не плати за доступ к заданиям и не передавай документы неизвестным людям.',updated:'Демо-пример',tags:['Онлайн','Гибкий график','Не реальная вакансия']}
  ];
  const list=$('#list');
  if(list){
    const q=$('#q'), region=$('#f-region'), type=$('#f-type'), time=$('#f-time'), length=$('#f-length'), pay=$('#f-pay'), age=$('#f-age'), source=$('#f-source'), sort=$('#f-sort');
    const payVal=$('#pay-val'), count=$('#count'), active=$('#active');
    const params=new URLSearchParams(location.search); if(q && params.get('q'))q.value=params.get('q'); if(type && params.get('type')){const wanted=categoryMap[params.get('type')]||params.get('type'); if([...type.options].some(o=>o.value===wanted))type.value=wanted;} if(region&&params.get('region')&&[...region.options].some(o=>o.value===params.get('region')))region.value=params.get('region'); if(time&&params.get('time')&&[...time.options].some(o=>o.value===params.get('time')))time.value=params.get('time');
    const fillSelect=(el,values,firstLabel)=>{ if(!el)return; const old=el.value; el.innerHTML=''; const first=document.createElement('option');first.value='';first.textContent=firstLabel;el.append(first);values.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;el.append(o)}); if(values.includes(old))el.value=old; };
    // Selects are populated only when they don't already have explicit options.
    if(region && region.options.length<=1) fillSelect(region,[...new Set(jobs.map(j=>j.region))],'Все регионы');
    if(type && type.options.length<=1) fillSelect(type,[...new Set(jobs.map(j=>j.type))],'Любой тип');
    if(time && time.options.length<=1) fillSelect(time,[...new Set(jobs.map(j=>j.time))],'Любой график');
    if(length && length.options.length<=1) fillSelect(length,[...new Set(jobs.map(j=>j.length))],'Любая длительность');
    const suggest=$('#suggest'); if(suggest) ['Промоутер','Дизайн','Контент','Онлайн','Помощник','Неполный день'].forEach(v=>{const o=document.createElement('option');o.value=v;suggest.append(o)});
    const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const card=j=>`<article class="card job-card"><span class="badge ${j.source==='real'?'warn':'ok'}">${j.source==='real'?'↗ Внешнее объявление':'Демо-пример'}</span><h2 class="h3 job-title">${esc(j.title)}</h2><p>${esc(j.company)}</p><div class="job-pay">${esc(j.payText)}</div><div class="job-details"><span>📍 ${esc(j.region)}</span><span>🕒 ${esc(j.time)} · ${esc(j.length)}</span><span>🎂 ${j.age?`В демо указано: ${j.age}+`:'Возраст не указан'}</span></div><div class="job-tags">${j.tags.map(t=>`<span class="badge">${esc(t)}</span>`).join('')}</div><p>${esc(j.description)}</p><div class="job-source">Источник: ${esc(j.sourceName)} · ${esc(j.updated)}</div><div class="job-bottom"><a class="btn btn-block ${j.source==='real'?'':'btn-ghost'}" href="${esc(j.url)}" ${j.source==='real'?'target="_blank" rel="noopener noreferrer"':''}>${j.source==='real'?'Открыть оригинал ↗':'Это только пример'}</a></div></article>`;
    const render=()=>{
      const term=(q?.value||'').trim().toLowerCase(), minPay=Number(pay?.value||0), selectedAge=age?.value||'', sourceValue=source?.value||'';
      if(payVal)payVal.textContent=minPay?`${minPay} сом и выше`:'любая';
      let filtered=jobs.filter(j=>{
        const text=[j.title,j.company,j.description,j.region,j.type,j.time,j.tags.join(' ')].join(' ').toLowerCase();
        if(term&&!text.includes(term))return false;
        if(region?.value&&j.region!==region.value)return false;
        if(type?.value&&j.type!==type.value)return false;
        if(time?.value&&j.time!==time.value)return false;
        if(length?.value&&j.length!==length.value)return false;
        if(minPay && j.pay<minPay)return false;
        if(sourceValue && j.source!==sourceValue)return false;
        if(selectedAge){ if(j.source==='demo') { if(Number(selectedAge)<(j.age||99))return false; } else { /* External listings remain visible but explicitly age-unverified. */ } }
        return true;
      });
      if(sort?.value==='pay-desc')filtered.sort((a,b)=>b.pay-a.pay); else if(sort?.value==='pay-asc')filtered.sort((a,b)=>a.pay-b.pay); else filtered.sort((a,b)=>(a.source==='real'?0:1)-(b.source==='real'?0:1));
      if(count)count.textContent=`Найдено: ${filtered.length} ${filtered.length===1?'объявление':filtered.length<5?'объявления':'объявлений'} · ${filtered.filter(j=>j.source==='real').length} внешних`;
      if(list)list.innerHTML=filtered.map(card).join('');
      if(active){active.innerHTML='';const vals=[[q?.value,'Поиск'],[region?.value,'Регион'],[type?.value,'Тип'],[time?.value,'График'],[length?.value,'Длительность'],[selectedAge?`${selectedAge} лет`:'','Возраст'],[sourceValue==='real'?'Внешние':sourceValue==='demo'?'Демо':'','Источник'],[minPay?`${minPay}+ сом`:'','Оплата']].filter(x=>x[0]); vals.forEach(([v,k])=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=`${k}: ${v} ×`;b.addEventListener('click',()=>{if(k==='Поиск')q.value='';if(k==='Регион')region.value='';if(k==='Тип')type.value='';if(k==='График')time.value='';if(k==='Длительность')length.value='';if(k==='Возраст')age.value='';if(k==='Источник')source.value='';if(k==='Оплата')pay.value='0';render();});active.append(b);});}
    };
    $('#search-form')?.addEventListener('submit',e=>{e.preventDefault();render()});
    [q,region,type,time,length,pay,age,source,sort].filter(Boolean).forEach(el=>el.addEventListener('input',render));
    $('#reset-filters')?.addEventListener('click',()=>{if(q)q.value='';[region,type,time,length,age,source].filter(Boolean).forEach(el=>el.value='');if(pay)pay.value='0';if(sort)sort.value='new';render();});
    $('.filter-toggle')?.addEventListener('click',()=>{const form=$('#search-form');const open=form.classList.toggle('open');$('.filter-toggle').setAttribute('aria-expanded',String(open));});
    render();
  }
  const latest=$('#latest'); if(latest){ latest.innerHTML=`<article class="card job-card"><span class="badge warn">↗ Внешнее объявление</span><h3>Промоутер в магазине «Алтын»</h3><p>Бишкек · неполный день</p><p class="job-pay">27 000 сом</p><p class="small muted">Возраст не указан — уточни у работодателя.</p><a class="btn btn-block" href="https://newjob.kg/vacancy/2kv9x7" target="_blank" rel="noopener noreferrer">Открыть оригинал ↗</a></article><article class="card job-card"><span class="badge warn">↗ Внешний список</span><h3>Подработка в Бишкеке</h3><p>HeadHunter Кыргызстан</p><p class="small muted">Много разных объявлений. Возраст и график проверяй в каждой вакансии.</p><a class="btn btn-ghost btn-block" href="https://bishkek.headhunter.kg/vacancies/podrabotka/offlayn" target="_blank" rel="noopener noreferrer">Посмотреть список ↗</a></article><article class="card job-card"><span class="badge">Помощь</span><h3>Не уверен, безопасна ли вакансия?</h3><p>Проверь оплату, работодателя и условия до отклика.</p><a class="btn btn-ghost btn-block" href="help.html">Спросить чат-бота</a></article>`; }
  // Local rule-based chatbot, with safe answers and no external AI/API.
  const chat=$('#chat-messages'), chatForm=$('#chat-form'), chatInput=$('#chat-input');
  const answers={
    'first-job':'Начни с вакансий без опыта и небольших задач: создание простого дизайна, помощь на мероприятиях или задания с понятными условиями. На странице вакансий используй фильтры и открывай оригинал объявления. Уточни обязанности, часы, сумму и дату выплаты до согласия.',
    'scam':'Стоп-сигналы: просят оплатить регистрацию или обучение; обещают очень большие деньги за простые действия; требуют код из SMS, пароль или данные карты; не называют компанию и адрес; торопят принять решение. Не отправляй деньги или документы. Сохрани переписку и поговори с доверенным взрослым.',
    'pay':'До начала спроси: сколько платят, за какой объём или часы, когда и каким способом выплачивают, оплачивается ли пробная смена и кто отвечает за расходы. Попроси условия письменно. Не начинай работу, если оплату отказываются назвать.',
    'site':'Попробуй обновить страницу, открыть сайт в другом браузере и проверить соединение. Если сломались фильтры — нажми «Сбросить». Если регистрация пишет, что аккаунт не создан, это ожидаемо: пока это демонстрационный сайт без сервера.',
    'age':'В Кыргызстане общий минимальный возраст приёма на работу — 16 лет. Для 15-летних есть предусмотренные законом исключительные случаи, поэтому до согласия уточни оформление и условия у работодателя. Запрещены опасные виды работ и условия, которые вредят здоровью или учёбе. Не скрывай возраст.',
    'default':'Я могу подсказать по четырём темам: поиск первой работы, возраст 15–18 лет, признаки мошенничества, оплата и ошибки сайта. Напиши, что именно произошло, но не указывай личные данные, пароли или коды.'
  };
  function addBubble(text,who){if(!chat)return;const el=document.createElement('div');el.className=`chat-bubble ${who}`;el.textContent=text;chat.append(el);chat.scrollTop=chat.scrollHeight;}
  function replyTo(text){const t=text.toLowerCase();let key='default';if(/мошен|обман|предоплат|скам|подозр|развод|код из смс/.test(t))key='scam';else if(/оплат|зарплат|деньг|сколько плат|выплат/.test(t))key='pay';else if(/15 лет|мне 15|возраст|скольки лет|несовершеннолет/.test(t))key='age';else if(/первая работа|без опыта|найти работу|ищу работу|ваканс/.test(t))key='first-job';else if(/сайт|ошиб|фильтр|регистрац|войти|не работает/.test(t))key='site';addBubble(answers[key],'bot');}
  chatForm?.addEventListener('submit',e=>{e.preventDefault();const v=(chatInput?.value||'').trim();if(!v)return;addBubble(v,'user');chatInput.value='';replyTo(v);});
  $$('[data-question]').forEach(btn=>btn.addEventListener('click',()=>{const key=btn.dataset.question;if(chat){const labels={ 'first-job':'Я ищу первую работу','scam':'Это похоже на обман','pay':'Как проверить оплату?','site':'У меня проблема с сайтом','age':'Мне 15 лет'};addBubble(labels[key]||'Нужна помощь','user');addBubble(answers[key]||answers.default,'bot');$('#chatbot')?.scrollIntoView({behavior:'smooth',block:'start'});}else{toast(answers[key]||answers.default);}}));
  $('#chat-clear')?.addEventListener('click',()=>{if(chat){chat.innerHTML='';addBubble('Чат начат заново. Что хочешь узнать? Не отправляй пароли, SMS-коды и документы.','bot');}});
  // Show a small note when entering the demo login page.
  if(location.pathname.endsWith('/login.html') || location.pathname.endsWith('login.html')) {
    const form=$('form[data-mock]'); if(form) form.addEventListener('submit',()=>toast('Вход недоступен: серверная авторизация ещё не подключена.'));
  }
})();
