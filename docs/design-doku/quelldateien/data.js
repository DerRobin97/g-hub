/* Mock data for G-Hub — Marketing Hub */
window.GHUB_VERSION = 'Version 2.6.0';
window.DATA = (function(){
  const channels = {
    instagram:{name:'Instagram', short:'IG', color:'var(--ch-instagram)'},
    linkedin: {name:'LinkedIn',  short:'in', color:'var(--ch-linkedin)'},
    x:        {name:'X',         short:'X',  color:'var(--ch-x)'},
    facebook: {name:'Facebook',  short:'f',  color:'var(--ch-facebook)'},
    tiktok:   {name:'TikTok',    short:'TT', color:'var(--ch-tiktok)'},
    youtube:  {name:'YouTube',   short:'YT', color:'var(--ch-youtube)'},
  };

  const team = [
    {id:'me', name:'Du', initials:'DU', grad:'linear-gradient(140deg,#cdf24d,#5fd3a3)', role:'Owner'},
    {id:'lena', name:'Lena Frank', initials:'LF', grad:'linear-gradient(140deg,#5b6cff,#a64dff)', role:'Content Lead'},
    {id:'jonas', name:'Jonas Berg', initials:'JB', grad:'linear-gradient(140deg,#ff7a5c,#ff4d8d)', role:'Designer'},
    {id:'mira', name:'Mira Cap', initials:'MC', grad:'linear-gradient(140deg,#3fe0d0,#3f9bff)', role:'Social Manager'},
    {id:'tom', name:'Tom Velt', initials:'TV', grad:'linear-gradient(140deg,#ffce6b,#ff7a5c)', role:'Analyst'},
  ];

  const kpis = [
    {id:'reach', label:'Reichweite', value:284500, fmt:'compact', delta:12.4, up:true, icon:'eye',
      spark:[24,28,26,33,31,38,42,40,47,52,49,58]},
    {id:'eng', label:'Engagement', value:6.8, suffix:'%', delta:0.9, up:true, icon:'heart',
      spark:[4.1,4.6,4.4,5.0,5.3,5.1,5.8,6.0,6.2,6.1,6.6,6.8]},
    {id:'fol', label:'Neue Follower', value:3120, fmt:'compact', delta:8.1, up:true, icon:'users',
      spark:[120,150,140,180,210,190,240,260,250,290,300,312]},
    {id:'conv', label:'Conversions', value:842, delta:-3.2, up:false, icon:'target',
      spark:[92,88,95,90,84,88,80,86,83,79,85,84]},
  ];

  // Kampagne → Maßnahmen → Rabattaktionen
  const campaigns = [
    {id:'c1', name:'Sommer-Launch 2026', status:'live', channels:['instagram','facebook'],
      budget:8000, spent:5240, progress:0.66, reach:142000, kpi:'+18% Reichweite', due:'12. Jun', zeitraum:'01.–30. Jun', color:'var(--ch-instagram)',
      massnahmen:[
        {id:'m1', name:'Instagram Reels-Serie', typ:'Organisch', status:'live', progress:0.7, posts:6, rabatte:[]},
        {id:'m2', name:'Rabattaktion Sommer', typ:'Promotion', status:'live', progress:0.55, posts:3, rabatte:[
          {id:'r1', name:'−20 % auf alles', typ:'Prozent', wert:'−20 %', code:'SOMMER20', zeitraum:'01.–14. Jun', genutzt:412, limit:1000},
          {id:'r2', name:'2-für-1 Accessoires', typ:'2 für 1', wert:'2:1', code:'—', zeitraum:'07.–10. Jun', genutzt:88, limit:200},
          {id:'r3', name:'Gratis Versand ab 50 €', typ:'Versand', wert:'0 €', code:'FREISOMMER', zeitraum:'01.–30. Jun', genutzt:640, limit:2000},
        ]},
        {id:'m3', name:'Influencer-Kooperation', typ:'Paid', status:'review', progress:0.2, posts:2, rabatte:[
          {id:'r4', name:'Creator-Code −15 %', typ:'Code', wert:'−15 %', code:'LENA15', zeitraum:'12.–26. Jun', genutzt:56, limit:500},
        ]},
      ]},
    {id:'c2', name:'B2B Lead-Gen Q2', status:'live', channels:['linkedin','x'],
      budget:12000, spent:7100, progress:0.59, reach:64000, kpi:'342 Leads', due:'30. Jun', zeitraum:'15. Apr–30. Jun', color:'var(--ch-linkedin)',
      massnahmen:[
        {id:'m8', name:'LinkedIn Thought-Leadership', typ:'Organisch', status:'live', progress:0.6, posts:8, rabatte:[]},
        {id:'m9', name:'Lead-Magnet Aktion', typ:'Promotion', status:'live', progress:0.5, posts:4, rabatte:[
          {id:'r8', name:'Gratis Marketing-Audit', typ:'Code', wert:'0 €', code:'AUDIT', zeitraum:'01.–30. Jun', genutzt:128, limit:300},
        ]},
        {id:'m10', name:'Retargeting Ads', typ:'Paid', status:'live', progress:0.45, posts:3, rabatte:[]},
      ]},
    {id:'c3', name:'Produkt-Teaser Reels', status:'review', channels:['instagram','youtube'],
      budget:4500, spent:900, progress:0.2, reach:0, kpi:'Review ausstehend', due:'08. Jun', zeitraum:'05.–20. Jun', color:'var(--ch-youtube)',
      massnahmen:[
        {id:'m11', name:'Reels-Produktion', typ:'Organisch', status:'review', progress:0.3, posts:4, rabatte:[]},
        {id:'m12', name:'Pre-Launch Rabatt', typ:'Promotion', status:'draft', progress:0, posts:0, rabatte:[
          {id:'r9', name:'Vorbesteller −10 %', typ:'Prozent', wert:'−10 %', code:'TEASER10', zeitraum:'15.–20. Jun', genutzt:0, limit:400},
        ]},
      ]},
    {id:'c4', name:'Newsletter Re-Engagement', status:'draft', channels:['facebook'],
      budget:2000, spent:0, progress:0, reach:0, kpi:'Entwurf', due:'20. Jun', zeitraum:'10.–24. Jun', color:'var(--ch-facebook)',
      massnahmen:[
        {id:'m13', name:'Reaktivierungs-Serie', typ:'Organisch', status:'draft', progress:0, posts:0, rabatte:[]},
        {id:'m14', name:'Willkommen-zurück Rabatt', typ:'Promotion', status:'draft', progress:0, posts:0, rabatte:[
          {id:'r10', name:'Comeback −15 %', typ:'Prozent', wert:'−15 %', code:'WILLKOMMEN15', zeitraum:'10.–24. Jun', genutzt:0, limit:600},
        ]},
      ]},
  ];

  // Social-Media-Planer — nur Instagram + Facebook
  const planerStatus = {
    entwurf:{label:'Entwurf', color:'var(--text-3)'},
    freigabe:{label:'Freigabe', color:'var(--warn)'},
    geplant:{label:'Geplant', color:'var(--ch-linkedin)'},
    live:{label:'Live', color:'var(--ok)'},
  };
  const planerPosts = [
    {id:'pp1', ch:'instagram', t:'Sommer-Drop Teaser Reel', time:'Fr 18:00', day:12, hhmm:'18:00', status:'entwurf', ai:true, autopost:false, by:'me',
      cap:'Es wird heiß ☀️ Unser Sommer-Drop kommt – sichere dir früh die besten Styles. #sommerdrop #newcollection'},
    {id:'pp2', ch:'facebook',  t:'Team-Vorstellung: Die Crew', time:'—', day:null, hhmm:'', status:'entwurf', ai:false, autopost:false, by:'jonas',
      cap:'Lernt das Team hinter den Kulissen kennen 👋 Wer steckt eigentlich hinter euren Lieblingsprodukten?'},
    {id:'pp3', ch:'instagram', t:'3 Styling-Tipps Karussell', time:'Mi 12:00', day:10, hhmm:'12:00', status:'freigabe', ai:true, autopost:false, by:'lena',
      cap:'3 Styling-Tipps für den Sommer ☀️ Swipe für die Looks unseres neuen Drops. Welcher ist dein Favorit? #styling'},
    {id:'pp4', ch:'facebook',  t:'Event: Late-Night-Shopping', time:'Do 09:00', day:11, hhmm:'09:00', status:'freigabe', ai:false, autopost:false, by:'mira',
      cap:'Diesen Freitag: Late-Night-Shopping bis 24 Uhr 🌙 Komm vorbei – Drinks & 20 % auf alles.'},
    {id:'pp5', ch:'instagram', t:'Produkt-Drop Reveal', time:'Heute 18:00', day:12, hhmm:'18:00', status:'geplant', ai:true, autopost:true, by:'me',
      cap:'Es ist soweit – der Drop ist LIVE 🔥 Jetzt shoppen, solange der Vorrat reicht. Link in Bio.'},
    {id:'pp6', ch:'facebook',  t:'Wochenend-Special −20 %', time:'Sa 10:00', day:13, hhmm:'10:00', status:'geplant', ai:false, autopost:true, by:'mira',
      cap:'Nur dieses Wochenende: −20 % auf den gesamten Shop mit Code SOMMER20. Bis Sonntag!'},
    {id:'pp7', ch:'instagram', t:'Countdown Story Day 1', time:'So 19:00', day:14, hhmm:'19:00', status:'geplant', ai:true, autopost:true, by:'me',
      cap:'Noch 3 Tage… 👀 Countdown läuft. Bleib dran für exklusive Previews in unseren Stories.'},
    {id:'pp8', ch:'instagram', t:'Behind the Scenes Shooting', time:'Live · +1,2k', day:9, hhmm:'14:00', status:'live', ai:false, autopost:false, by:'lena',
      cap:'Ein Blick hinter die Kulissen unseres Sommer-Shootings 📸 Swipe für mehr.'},
    {id:'pp9', ch:'facebook',  t:'Kundenstimme „Bestes Produkt"', time:'Live · 312 ❤', day:8, hhmm:'11:00', status:'live', ai:false, autopost:false, by:'mira',
      cap:'„Das beste Produkt, das ich je gekauft habe." – Danke für die tollen Reviews! ❤'},
  ];

  // Analytics — Google + Meta via API
  const ana = {
    gesamt:{ reach:284500, conv:842, spend:6140, roas:4.2 },
    google:{ name:'Google', color:'#4285F4', icon:'search', conv:486, spend:3420,
      series:[42,45,44,50,53,51,58,60,63,61,67,70,72,75,78,82],
      kpis:[
        {label:'Impressionen', val:'1,24 Mio', icon:'eye', delta:9.1, up:true},
        {label:'Klicks', val:'38,4K', icon:'target', delta:6.2, up:true},
        {label:'CTR', val:'3,1 %', icon:'zap', delta:0.4, up:true},
        {label:'Ø CPC', val:'0,74 €', icon:'trend', delta:5.0, up:true},
      ]},
    meta:{ name:'Meta', color:'#0866FF', icon:'globe', conv:356, spend:2720,
      series:[30,34,33,38,40,44,47,49,52,55,58,60,64,66,70,73],
      split:[{ch:'instagram', val:64},{ch:'facebook', val:36}],
      kpis:[
        {label:'Reichweite', val:'198K', icon:'eye', delta:14.2, up:true},
        {label:'Engagement', val:'6,8 %', icon:'heart', delta:0.9, up:true},
        {label:'Neue Follower', val:'3,1K', icon:'users', delta:8.1, up:true},
        {label:'Frequenz', val:'2,4', icon:'trend', delta:2.1, up:false},
      ]},
    gesamtKpis:[
      {label:'Conversions', val:'842', icon:'target', delta:3.2, up:false},
      {label:'Werbeausgaben', val:'6.140 €', icon:'zap', delta:4.0, up:true},
      {label:'ROAS', val:'4,2×', icon:'trend', delta:7.5, up:true},
      {label:'Klicks', val:'76,8K', icon:'eye', delta:6.9, up:true},
    ],
  };

  // content scheduled — keyed by day-of-month (June 2026)
  const content = {
    3:[{ch:'instagram', t:'Behind-the-Scenes Reel', time:'09:00', status:'sched'},
       {ch:'linkedin', t:'Branchen-Insight Post', time:'12:30', status:'sched'}],
    4:[{ch:'tiktok', t:'Trend-Audio Clip', time:'17:00', status:'draft'}],
    5:[{ch:'x', t:'Produkt-Thread (6 Teile)', time:'10:00', status:'review'},
       {ch:'instagram', t:'Karussell: 5 Tipps', time:'15:00', status:'sched'},
       {ch:'facebook', t:'Event-Ankündigung', time:'18:00', status:'sched'}],
    9:[{ch:'youtube', t:'Tutorial: Setup in 5 Min', time:'11:00', status:'sched'}],
    11:[{ch:'instagram', t:'Sommer-Launch Teaser', time:'09:00', status:'sched'},
        {ch:'tiktok', t:'Countdown Day 1', time:'19:00', status:'sched'}],
    12:[{ch:'instagram', t:'Launch! Reveal Reel', time:'10:00', status:'sched'},
        {ch:'facebook', t:'Launch Announcement', time:'10:05', status:'sched'},
        {ch:'linkedin', t:'Launch Story', time:'11:00', status:'draft'}],
    17:[{ch:'linkedin', t:'Case-Study Karussell', time:'13:00', status:'sched'}],
    18:[{ch:'x', t:'Q&A Live-Thread', time:'16:00', status:'draft'}],
    24:[{ch:'instagram', t:'UGC Repost', time:'14:00', status:'sched'},
        {ch:'youtube', t:'Webinar Highlights', time:'17:00', status:'review'}],
  };

  const tasks = [
    {id:'t1', t:'Reel-Skript für Sommer-Launch finalisieren', who:'lena', due:'Heute', done:false, prio:'high', tag:'Content'},
    {id:'t2', t:'Creatives für TikTok-Ads exportieren', who:'jonas', due:'Heute', done:false, prio:'high', tag:'Design'},
    {id:'t3', t:'LinkedIn-Captions Korrektur lesen', who:'me', due:'Morgen', done:false, prio:'med', tag:'Content'},
    {id:'t4', t:'Influencer-Briefing versenden', who:'mira', due:'4. Jun', done:false, prio:'med', tag:'Outreach'},
    {id:'t5', t:'Mai-Report an Geschäftsführung', who:'tom', due:'Erledigt', done:true, prio:'low', tag:'Analytics'},
    {id:'t6', t:'Hashtag-Set für Q2 aktualisieren', who:'mira', due:'Erledigt', done:true, prio:'low', tag:'Content'},
  ];

  const inbox = [
    {id:'n1', type:'comment', who:'lena', txt:'hat dich in "Sommer-Launch" erwähnt', sub:'„Kannst du den Hook noch checken?"', t:'vor 8 Min', unread:true},
    {id:'n2', type:'approve', who:'mira', txt:'Freigabe angefragt', sub:'Produkt-Teaser Reels · 2 Posts', t:'vor 41 Min', unread:true},
    {id:'n3', type:'metric', who:null, txt:'Sommer-Launch übertrifft Ziel', sub:'Reichweite +18% über Plan', t:'vor 2 Std', unread:true},
    {id:'n4', type:'comment', who:'jonas', txt:'hat Creatives hochgeladen', sub:'6 neue Assets in der Bibliothek', t:'vor 5 Std', unread:false},
    {id:'n5', type:'system', who:null, txt:'3 Posts wurden veröffentlicht', sub:'Instagram · LinkedIn · X', t:'Gestern', unread:false},
  ];

  const assets = [
    {id:'a1', tag:'reel-cover.mp4', kind:'Video', ch:'instagram'},
    {id:'a2', tag:'launch-key-visual', kind:'Bild', ch:null},
    {id:'a3', tag:'carousel-01.png', kind:'Bild', ch:'instagram'},
    {id:'a4', tag:'logo-pack.zip', kind:'Datei', ch:null},
    {id:'a5', tag:'ad-banner-1080', kind:'Bild', ch:'facebook'},
    {id:'a6', tag:'webinar-cut.mp4', kind:'Video', ch:'youtube'},
    {id:'a7', tag:'quote-template', kind:'Bild', ch:'linkedin'},
    {id:'a8', tag:'product-shot-03', kind:'Bild', ch:null},
  ];

  // analytics
  const reachSeries = [38,42,40,47,52,49,58,55,63,68,64,72,70,78,82,79,88,84,92,96,90,101,98,108];
  const channelMix = [
    {ch:'instagram', val:42},
    {ch:'tiktok', val:23},
    {ch:'linkedin', val:18},
    {ch:'youtube', val:9},
    {ch:'x', val:8},
  ];
  const topPosts = [
    {ch:'instagram', t:'5 Growth-Hacks Karussell', reach:48200, eng:9.2},
    {ch:'tiktok', t:'Trend-Audio Behind-the-Scenes', reach:39100, eng:11.4},
    {ch:'linkedin', t:'Case Study: 3× ROI', reach:21800, eng:6.1},
  ];

  // news & trends (Branchen-Trends, Plattform-Updates, Mentions)
  const news = {
    highlight: {
      cat:'Trend',
      title:'Kurzvideos dominieren 2026: Reels & Shorts treiben 68 % der organischen Reichweite',
      teaser:'Das Wachstum verschiebt sich plattformübergreifend klar zu kurzen, vertikalen Videos. Marken mit ≥3 Reels pro Woche wachsen 2,4× schneller.',
      src:'Social Media Today', time:'vor 2 Std', tag:'trend-report-2026'
    },
    items: [
      {cat:'Plattform', title:'Instagram rollt „Trial Reels“ für alle Business-Accounts aus', src:'Meta Newsroom', time:'vor 4 Std'},
      {cat:'Plattform', title:'LinkedIn priorisiert künftig Karussell-Posts im Feed', src:'LinkedIn Blog', time:'vor 6 Std'},
      {cat:'Trend', title:'UGC schlägt Hochglanz: authentische Inhalte mit +34 % Engagement', src:'HubSpot', time:'vor 9 Std'},
      {cat:'Mention', title:'„Sommer-Launch 2026“ in 12 Branchen-Newslettern erwähnt', src:'Mention-Tracking', time:'Gestern'},
      {cat:'Plattform', title:'TikTok erweitert Suchanzeigen auf den DACH-Raum', src:'TikTok Business', time:'Gestern'},
      {cat:'Trend', title:'KI-Captioning halbiert die Produktionszeit für Social-Clips', src:'Later', time:'vor 2 Tagen'},
      {cat:'Mention', title:'G-Hub von @marketingweek als „Tool der Woche“ gelistet', src:'X · @marketingweek', time:'vor 2 Tagen'},
    ],
    unread: 4
  };

  const worktime = {
    target: 40,
    week: [{d:'Mo', h:8.0}, {d:'Di', h:7.5}, {d:'Mi', h:8.0}, {d:'Do', h:6.0}, {d:'Fr', h:3.0}],
    clockedIn: true, since:'09:12',
    month: { label:'Juni 2026', done:142.5, target:160, balance:4.5 },
    absence: { urlaubLeft:18, urlaubUsed:12, sick:2, holidays:1 },
    today: { worked:3.2, break:0.5 },
  };

  const myTasks = [
    { id:'a1', t:'Reel-Skript Sommer-Launch finalisieren', proj:'Sommer-Launch 2026', date:3, time:'14:00', due:'Heute', prio:'high', status:'arbeit', role:'lead', people:['me','lena'], tag:'Content' },
    { id:'a2', t:'LinkedIn-Captions Korrektur lesen', proj:'B2B Lead-Gen Q2', date:3, time:'17:00', due:'Heute', prio:'med', status:'offen', role:'lead', people:['me'], tag:'Content' },
    { id:'a3', t:'TikTok-Ad Creatives freigeben', proj:'Sommer-Launch 2026', date:4, time:'10:00', due:'Morgen', prio:'high', status:'offen', role:'collab', people:['jonas','me'], tag:'Design' },
    { id:'a4', t:'Influencer-Briefing abstimmen', proj:'Sommer-Launch 2026', date:5, time:'12:30', due:'Fr 5. Jun', prio:'med', status:'offen', role:'collab', people:['mira','me','lena'], tag:'Outreach' },
    { id:'a5', t:'Kampagnen-Budget Q3 planen', proj:'Allgemein', date:9, time:'09:00', due:'Di 9. Jun', prio:'med', status:'offen', role:'lead', people:['me','tom'], tag:'Planung' },
    { id:'a6', t:'Landingpage-Texte Review', proj:'Herbst-Kollektion', date:11, time:'15:00', due:'Do 11. Jun', prio:'low', status:'offen', role:'collab', people:['lena','me'], tag:'Content' },
    { id:'a7', t:'Webinar-Setup testen', proj:'Produkt-Teaser', date:12, time:'11:00', due:'Fr 12. Jun', prio:'high', status:'arbeit', role:'lead', people:['me','jonas'], tag:'Event' },
    { id:'a8', t:'Monatsreport Mai abschließen', proj:'Analytics', date:null, time:'', due:'Erledigt', prio:'low', status:'erledigt', role:'collab', people:['tom','me'], tag:'Analytics' },
    { id:'a9', t:'Hashtag-Set Q2 aktualisieren', proj:'Content-Hub', date:null, time:'', due:'Erledigt', prio:'low', status:'erledigt', role:'lead', people:['me','mira'], tag:'Content' },
  ];

  return {channels, team, kpis, campaigns, content, tasks, inbox, assets,
          reachSeries, channelMix, topPosts, news, worktime,
          planerStatus, planerPosts, ana, myTasks,
          teamById:Object.fromEntries(team.map(m=>[m.id,m]))};
})();
