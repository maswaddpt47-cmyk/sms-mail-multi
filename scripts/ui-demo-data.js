/* Démonstration autonome uniquement : exécuter AVANT le script de l’application.
   Ce fichier ne lit jamais le stockage réel et ne fait aucun appel réseau. */
(function(){
  'use strict';
  var values=new Map();
  var memoryStorage={
    getItem:function(key){key=String(key);return values.has(key)?values.get(key):null;},
    setItem:function(key,value){values.set(String(key),String(value));},
    removeItem:function(key){values.delete(String(key));},
    clear:function(){values.clear();},
    key:function(index){index=Number(index)>>>0;return index<values.size?Array.from(values.keys())[index]:null;}
  };
  Object.defineProperty(memoryStorage,'length',{enumerable:true,get:function(){return values.size;}});
  Object.defineProperty(window,'localStorage',{configurable:true,enumerable:true,value:memoryStorage});

  function put(key,value){memoryStorage.setItem(key,JSON.stringify(value));}
  function localDay(date){return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
  function shifted(date,days){var copy=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);copy.setDate(copy.getDate()+days);return copy;}
  function frenchDay(date){return date.toLocaleDateString('fr-FR');}
  var now=new Date();
  var todayDate=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  var today=localDay(todayDate);
  var mondayDate=shifted(todayDate,-((todayDate.getDay()+6)%7));
  var monday=localDay(mondayDate),friday=localDay(shifted(mondayDate,4));
  var previous=localDay(shifted(todayDate,-5));
  var recent=localDay(shifted(todayDate,-1));
  var cms=[
    {id:99001,nom:'CMS Démo Centre',adresse:'Adresse fictive — espace de démonstration Centre'},
    {id:99002,nom:'CMS Démo Rives',adresse:'Adresse fictive — espace de démonstration Rives'}
  ];
  var demarches=[
    {id:99001,theme:'Démonstration fictive',nom:'Prendre en main une messagerie — démo',documents:['Document fictif de démonstration']},
    {id:99002,theme:'Démonstration fictive',nom:'Organiser ses documents — démo',documents:[]},
    {id:99003,theme:'Démonstration fictive',nom:'Utiliser les services en ligne — démo',documents:['Identifiant de démonstration sans donnée réelle']}
  ];
  put('ess-cms',cms);
  memoryStorage.setItem('ess-cms-migrated-v2','1');
  put('ess-demarches',demarches);
  put('ess-secteurs',cms.map(function(c){return c.nom;}));
  put('ess-vars',[{id:99001,nom:'signature_demo',valeur:'Équipe de démonstration — données fictives'}]);
  put('ess-custom-tpl',[
    {id:99001,nom:'Premier contact — exemple fictif',canal:'sms',type:'proposition',sujet:'',body:'[DÉMO FICTIVE]\nBonjour {civilite} {prenom} {nom},\n\nNous vous proposons un rendez-vous le {date} à {heure} au {commune}, pour : {demarche}.\n\n{signature_demo}'}
  ]);
  put('ess-hidden',[]);
  put('ess-lastSave','démo en mémoire');
  put('ess-relance-delai',3);
  put('ess-caltype','google');
  memoryStorage.setItem('ess-dark','0');

  var profileIds=['michel','cynthia','corentin'];
  var historyByProfile={};
  profileIds.forEach(function(profileId,profileIndex){
    var centre=cms[profileIndex%cms.length];
    var group=String(profileIndex+1);
    var specs=[
      {date:today,heure:'09:30',statut:'confirme',channel:'sms',msgType:'confirmation',prenom:'Camille',code:'01',dem:0},
      {date:today,heure:'10:30',statut:'en_attente',channel:'mail',msgType:'proposition',prenom:'Alex',code:'02',dem:1},
      {date:today,heure:'13:30',statut:'excuse',channel:'mail',msgType:'confirmation',prenom:'Sacha',code:'03',dem:2},
      {date:monday,heure:'11:30',statut:'realise',channel:'sms',msgType:'confirmation',prenom:'Charlie',code:'04',dem:0},
      {date:friday,heure:'15:30',statut:'confirme',channel:'mail',msgType:'confirmation',prenom:'Lou',code:'05',dem:2},
      {date:previous,heure:'14:30',statut:'lapin',channel:'sms',msgType:'confirmation',prenom:'Noa',code:'06',dem:1}
    ];
    var history=specs.map(function(spec,index){
      var dem=demarches[spec.dem];
      var code=group+spec.code;
      var nom='FICTIF '+code;
      var greeting='[DÉMO FICTIVE — aucun message réel]\nBonjour '+spec.prenom+' '+nom+',\n\n';
      var body=greeting+'Votre accompagnement « '+dem.nom+' » est prévu le '+spec.date.split('-').reverse().join('/')+' à '+spec.heure+' au '+centre.nom+'.\n\n'+centre.adresse+'.\n\nÉquipe de démonstration — données fictives.';
      var creationDate=spec.statut==='en_attente'?shifted(todayDate,-5):shifted(new Date(spec.date+'T12:00:00'),-1);
      if(creationDate>todayDate)creationDate=shifted(todayDate,-1);
      var item={
        id:'demo-history-'+profileId+'-'+code,
        channel:spec.channel,msgType:spec.msgType,statut:spec.statut,
        civilite:index%2?'M.':'Mme',prenom:spec.prenom,nom:nom,telephone:'',
        demarche:dem.nom,selectedDemarche:String(dem.id),demarcheAutre:'',
        commune:centre.nom,selectedCMS:String(centre.id),date:spec.date,heure:spec.heure,
        dateDemande:localDay(creationDate),
        ts:frenchDay(creationDate)+' '+String(14-index).padStart(2,'0')+':05:00',
        body:body,subject:spec.channel==='mail'?'[DÉMO] Rendez-vous — '+dem.nom:'',
        notes:'Exemple entièrement fictif pour explorer l’interface.'
      };
      if(spec.statut==='excuse')item.excuseMotif='Indisponibilité fictive — créneau à nouveau libre.';
      return item;
    });
    history.sort(function(a,b){function stamp(h){var parts=h.ts.slice(0,10).split('/');return parts.reverse().join('-')+h.ts.slice(10);}return stamp(b).localeCompare(stamp(a));});
    historyByProfile[profileId]=history;
    put('ess-'+profileId+'-history',history);
    var days={};
    history.forEach(function(h){days[h.date]=true;});
    put('ess-'+profileId+'-permanences',Object.keys(days).sort().map(function(date,index){return {
      id:'demo-day-'+profileId+'-'+index,commune:centre.nom,exceptDate:date,debut:'09:30',fin:'16:30'
    };}));
    put('ess-'+profileId+'-perm-version','v2-jours-a-la-volee');
    put('ess-'+profileId+'-yearly-stats',{});
    put('ess-'+profileId+'-last',{selectedCMS:String(centre.id),selectedDemarche:'99001',commune:centre.nom});
    memoryStorage.setItem('ess-'+profileId+'-lastLogin',frenchDay(todayDate));
    // Les compteurs restent visibles ; la modale de rappel ne masque pas la démo à l’ouverture.
    memoryStorage.setItem('ess-'+profileId+'-overdue-reminder-date',today);
    put('ess-'+profileId+'-orientations',[
      {id:'demo-orientation-'+profileId+'-01',civilite:'Mme',prenom:'Ari',nom:'FICTIF ORIENTATION '+group+'01',telephone:'',commune:centre.nom,communeBenef:'Commune fictive Centre',structure:centre.nom,motif:demarches[0].nom,orienteur:'Référent fictif A',date:today,etat:'À contacter — démo',done:false},
      {id:'demo-orientation-'+profileId+'-02',civilite:'M.',prenom:'Eden',nom:'FICTIF ORIENTATION '+group+'02',telephone:'',commune:centre.nom,communeBenef:'Commune fictive Rives',structure:centre.nom,motif:demarches[1].nom,orienteur:'Référent fictif B',date:recent,etat:'Demande reçue — démo',done:false},
      {id:'demo-orientation-'+profileId+'-03',civilite:'Mme',prenom:'Kim',nom:'FICTIF ORIENTATION '+group+'03',telephone:'',commune:centre.nom,communeBenef:'Commune fictive Centre',structure:centre.nom,motif:demarches[2].nom,orienteur:'Référent fictif C',date:previous,etat:'Traité — démo',done:true}
    ]);
  });
  put('ess-mandats',[
    {id:'demo-mandat-01',civilite:'Mme',prenom:'Camille',nom:'FICTIF 101',commune:cms[0].nom,num:'DEMO-'+now.getFullYear()+'-0001',aidant:'Conseiller fictif A',structure:'Structure de démonstration fictive',duree:'1 an',date:frenchDay(todayDate),ts:frenchDay(todayDate)+' 09:00:00'},
    {id:'demo-mandat-02',civilite:'M.',prenom:'Alex',nom:'FICTIF 202',commune:cms[1].nom,num:'DEMO-'+now.getFullYear()+'-0002',aidant:'Conseiller fictif B',structure:'Structure de démonstration fictive',duree:'1 an',date:frenchDay(shifted(todayDate,-1)),ts:frenchDay(shifted(todayDate,-1))+' 10:00:00'}
  ]);
  memoryStorage.setItem('ess-mandat-counter','2');
  // Aucun profil actif n’est enregistré : le choix du profil reste le premier écran.
  window.__SMS_MAIL_DEMO__={fictive:true,memoryOnly:true,resetOnReload:true,profiles:profileIds.slice(),today:today,weekStart:monday};

  function mountBanner(){
    if(document.getElementById('sms-mail-demo-banner'))return;
    var style=document.createElement('style');
    style.id='sms-mail-demo-style';
    style.textContent='body{display:grid;grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}#profile-root,#app-root{grid-column:1;grid-row:2;min-height:0;}#sms-mail-demo-banner{grid-column:1;grid-row:1;padding:9px 18px;background:#fff5d8;color:#684708;border-bottom:1px solid #e7d49b;font:500 11px/1.6 system-ui,sans-serif;text-align:center;overflow-wrap:anywhere;}#sms-mail-demo-banner strong{font-weight:800;}#sms-mail-demo-banner span{margin-left:8px;}@media(max-width:520px){#sms-mail-demo-banner{font-size:10px;padding:8px 12px;}#sms-mail-demo-banner span{display:block;margin-left:0;}}@media print{body{display:block;height:auto;}#sms-mail-demo-banner{display:none!important;}#app-root{height:auto!important;}}';
    document.head.appendChild(style);
    var banner=document.createElement('aside');
    banner.id='sms-mail-demo-banner';banner.className='no-print';banner.setAttribute('aria-label','Mode démonstration');
    var title=document.createElement('strong');title.textContent='DÉMONSTRATION — DONNÉES FICTIVES';
    var text=document.createElement('span');text.textContent='Modifications en mémoire uniquement, réinitialisées au rechargement. Téléphones et connexions non renseignés.';
    banner.appendChild(title);banner.appendChild(text);
    document.body.insertBefore(banner,document.body.firstChild);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountBanner,{once:true});
  else mountBanner();
})();
