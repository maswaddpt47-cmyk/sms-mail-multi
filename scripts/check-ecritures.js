/* Écritures sûres (AG-013, étape 2, amendée par Codex le 31/10) : une panne de stockage à n'importe quelle écriture ne
   laisse ni purge, ni import partiel, ni sauvegarde automatique d'un état intermédiaire, ni message de succès ; un retour
   arrière impossible est annoncé comme tel. Vraies fonctions extraites d'index.html (persist, addHistory, ensureDayOpen,
   applyLunchBreaks, writeProfileHistory compris), stockage et réseau simulés. Données fictives.
   Exécuter : node scripts/check-ecritures.js (INDEX_HTML=<copie> pour une mutation). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start+from.length);assert(end>start,to);return html.slice(start,end);}
function fonction(nom){return section('function '+nom+'(','\nfunction ');}
const CODE=[
  section('function ls(k,d){','\n'),section('function cmsKey(','\n'),section('function toLocalDateStr(d){','\n'),
  section('/* AG-013, étape 2 (31/10/2026) : une écriture est relue','/* clé cloisonnée par profil actif'),
  section('function pkFor(','function readProfileHistory('),
  section('/* Amendement Codex (31/10) : renvoie false si l','/* retrouve l'),
  section('/* Réglages communs, en une fois','function saveLast('),
  section('function maybeAutoBackupProfile(','/* pousse un fichier daté'),
  section('function entryYear(','/* années révolues'),
  section('function archiveYear(','/* affiche les stats agrégées'),
  section('/* AG-013, étape 2 : la sauvegarde est vérifiée entièrement','/* history */'),
  section('function ghRestoreLatest(','/* rétention'),
  section('function ghRestoreFile(','function ghCheckOnStartup('),
  fonction('addHistory'),
  section('function getPermanence(','/* RDV confirmé dont la date est passée'),
  fonction('lunchBreakEntry'),
  section('/* Amendement Codex (31/10) : import ICS en tout ou rien','/* AG-013, étape 2 : même RDV'),
  section('/* AG-013, étape 2 : même RDV','function importPlanningJson(')
].join('\n');

function stockage(){
  const m=new Map(),s={panne:null,lecturePanne:null,perte:null,ecritures:0};
  s.getItem=k=>{if(s.lecturePanne&&s.lecturePanne(k))throw new Error('SecurityError');return m.has(k)?m.get(k):null;};
  s.setItem=(k,v)=>{s.ecritures++;if(s.panne&&s.panne(k,s.ecritures))throw new Error('QuotaExceededError');if(s.perte&&s.perte(k))return;m.set(k,String(v));};
  s.removeItem=k=>{m.delete(k);};   /* une suppression libère de la place : pas d'erreur de quota (comme un navigateur) */
  s.etat=()=>JSON.stringify([...m.entries()].sort());
  return s;
}
function charger(){
  const st=stockage(),journal={toasts:[],pushs:0};
  const S={activeProfile:'p1',history:[],yearlyStats:{},permanences:[],orientations:[],cmsList:[{id:1,nom:'Fumel'}],demarches:[],secteurs:[],customTemplates:[],customVars:[],mandats:[],
    templates:{sms:'modèle'},hiddenBuiltinKeys:[],importText:'',importError:'',modal:'import',saveStatus:''};
  const ctx=vm.createContext({
    Date,JSON,Object,Array,String,Math,Promise,parseInt,escape,decodeURIComponent,setTimeout,atob:s=>Buffer.from(s,'base64').toString('binary'),
    localStorage:st,S,confirm:()=>true,showToast:(m)=>journal.toasts.push(m),renderModal(){},renderAll(){},regen(){},renderAgenda(){},renderTabs(){},renderHeader(){},
    ghToken:()=>'jeton-fictif',githubPush(){journal.pushs++;},HISTORY_MAX:99999,getSlots:()=>[],LUNCH_MOTIF:'Pause déjeuner',
    computeYearArchive:(y)=>({year:y,total:S.history.filter(h=>String(h.date).slice(0,4)==String(y)).length}),
    migratePermanences:(p)=>p.map(x=>Object.assign({},x,{migree:true})),PERM_MODEL_VERSION:3,
    GH_REPO:'depot/fictif',GH_BRANCH:'main',ghHeaders:()=>({}),ghListBackups:(t,cb)=>cb([{path:'b/p1/backup.json'}]),fetch:null
  });
  vm.runInContext(CODE+'\nvar _ghLastAutoPushByProfile={};',ctx);
  return {ctx,S,st,journal};
}
function rdv(id,date,heure,nom,prenom,commune,statut){return {id,date,heure,nom,prenom,commune:commune||'Fumel',statut:statut||'realise',msgType:'confirmation'};}
function sansErreur(S){const c=JSON.parse(JSON.stringify(S));delete c.importError;return c;}

/* ── lsSet : vrai si écrit et relu, faux sinon (panne ou écriture perdue sans erreur) ── */
{const {ctx,st,journal}=charger();
 assert.equal(ctx.lsSet('a',{x:1}),true);
 st.panne=()=>true;assert.equal(ctx.lsSet('a',{x:2}),false);assert.equal(st.getItem('a'),'{"x":1}');assert(journal.toasts.some(t=>/Stockage plein/.test(t)));
 st.panne=null;st.perte=k=>k==='a';assert.equal(ctx.lsSet('a',{x:3}),false,'écriture perdue sans erreur : détectée');}

/* ── ecrireTout : lecture préalable impossible → rien écrit ; retour arrière impossible → incohérence annoncée ── */
{const {ctx,st}=charger();st.setItem('k1','"v1"');st.setItem('k2','"v2"');const avant=st.etat();
 st.lecturePanne=k=>k==='k2';assert.equal(ctx.ecrireTout([['k1','n1'],['k2','n2']]),false);st.lecturePanne=null;
 assert.equal(st.etat(),avant,'valeur d\'avant illisible : aucune écriture, aucune suppression');assert.equal(ctx.ecrireTout.incoherent,false);}
{const {ctx,st}=charger();st.setItem('k1','"v1"');st.ecritures=0;
 st.panne=(k,i)=>i>=2;   // première écriture réussie, puis panne durable : le retour arrière échoue aussi
 assert.equal(ctx.ecrireTout([['k1','n1'],['k2','n2']]),false);assert.equal(ctx.ecrireTout.incoherent,true,'retour arrière échoué : signalé');}

/* ── persist (réel) : tout ou rien ── */
{const e=charger();const n=e.ctx.reglagesAPersister('x').length;assert.equal(n,8);
 assert.equal(e.ctx.persist(),true);assert.equal(e.journal.pushs,1);assert.match(e.S.saveStatus,/^Sauvegardé/);   // garde
 for(let k=1;k<=n;k++){
   const f=charger();f.st.setItem('ess-cms','"ancien"');f.st.ecritures=0;const avant=f.st.etat();
   f.st.panne=(cle,i)=>i===k;assert.equal(f.ctx.persist(),false,'persist, panne '+k);
   assert.equal(f.st.etat(),avant,'persist, panne '+k+' : rien de modifié');assert.equal(f.journal.pushs,0);assert.doesNotMatch(f.S.saveStatus,/Sauvegardé/);
 }}

/* ── writeProfileHistory (réel) : échec signalé, mémoire réalignée, pas de sauvegarde ── */
{const e=charger();e.S.history=[rdv('a','2026-10-05','09:30','FICTIF','A','Fumel','confirme')];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
 const arr=e.S.history;arr[0].statut='realise';e.st.panne=()=>true;
 assert.equal(e.ctx.writeProfileHistory('p1',arr),false);
 assert.equal(e.S.history[0].statut,'confirme','mémoire réalignée sur le stockage');assert.equal(e.journal.pushs,0,'aucune sauvegarde');
 e.st.panne=null;const arr2=e.S.history;arr2[0].statut='realise';assert.equal(e.ctx.writeProfileHistory('p1',arr2),true);assert.equal(e.journal.pushs,1);}
// chaque appelant tient compte du résultat
html.split('\n').filter(l=>/writeProfileHistory\(/.test(l)&&!/function writeProfileHistory/.test(l)).forEach(l=>{
  assert.match(l,/if\(!writeProfileHistory\(|=writeProfileHistory\(/,'appelant sans contrôle du résultat : '+l.trim().slice(0,90));
});

/* ── Archivage : panne à chaque écriture → rien supprimé, pas de succès, pas de sauvegarde ── */
function prepArchive(){
  const e=charger();
  e.S.history=[rdv('a','2025-03-01','09:30','FICTIF','A'),rdv('b','2025-04-01','10:30','FICTIF','B'),rdv('c','2026-10-01','09:30','FICTIF','C')];
  e.S.yearlyStats={2024:{year:2024,total:9}};
  e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('yearly-stats'),JSON.stringify(e.S.yearlyStats));
  e.st.ecritures=0;return e;
}
{const e=prepArchive();e.ctx.archiveYear(2025);
 assert.equal(e.S.history.length,1);assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('yearly-stats')))[2025].total,2);assert.equal(e.journal.pushs,1);}
for(const n of [1,2]){
  const e=prepArchive(),avant=e.st.etat(),mem=JSON.stringify([e.S.history,e.S.yearlyStats]);
  e.st.panne=(k,i)=>i===n;e.ctx.archiveYear(2025);
  assert.equal(e.st.etat(),avant,'archivage, panne '+n+' : stockage inchangé');assert.equal(JSON.stringify([e.S.history,e.S.yearlyStats]),mem);
  assert.equal(e.journal.pushs,0);assert(!e.journal.toasts.some(t=>/archivée/.test(t)));assert(e.journal.toasts.some(t=>/Archivage annulé/.test(t)));
}

/* ── Import JSON : vérifié en entier (éléments compris), appliqué en une fois avec les réglages ── */
const sauvegarde={cmsList:[{id:1,nom:'Fumel'},{id:2,nom:'Marmande'}],demarches:[{id:1,nom:'D',documents:[]}],secteurs:['Fumel'],customTemplates:[],customVars:[],mandats:[],
  history:[rdv('x','2026-10-02','09:30','FICTIF','X')],yearlyStats:{2025:{year:2025}},permanences:[{commune:'Fumel',exceptDate:'2026-10-02'}],orientations:[{nom:'FICTIF'}]};
function prepImport(texte){
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];
  e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem('ess-cms',JSON.stringify(e.S.cmsList));e.st.setItem('ess-templates','{"sms":"ancien"}');
  e.S.importText=texte;e.st.ecritures=0;return e;
}
{const e=prepImport(JSON.stringify(sauvegarde));assert.equal(e.ctx.doImport(),true);
 const ecrites=e.st.ecritures;assert(ecrites>=13,'données et réglages écrits ensemble');
 assert.equal(e.S.history[0].id,'x');assert.equal(e.st.getItem('ess-templates'),JSON.stringify(e.S.templates));assert.equal(e.journal.pushs,1,'une seule sauvegarde, à la fin');
 for(let n=1;n<=ecrites;n++){
   const f=prepImport(JSON.stringify(sauvegarde)),avant=f.st.etat(),mem=sansErreur(f.S);
   f.st.panne=(k,i)=>i===n;
   assert.equal(f.ctx.doImport(),false,'import, panne à l\'écriture '+n);
   assert.equal(f.st.etat(),avant,'import, panne '+n+' : stockage restauré');assert.deepEqual(sansErreur(f.S),mem,'import, panne '+n+' : mémoire intacte');
   assert.equal(f.journal.pushs,0);assert(!f.journal.toasts.some(t=>/Import réussi/.test(t)));assert.match(f.S.importError,/aucune donnée modifiée/);
 }
 // panne durable : retour arrière impossible → incohérence annoncée, jamais « aucune donnée modifiée »
 const g=prepImport(JSON.stringify(sauvegarde));g.st.panne=(k,i)=>i>=2;
 assert.equal(g.ctx.doImport(),false);assert.doesNotMatch(g.S.importError,/aucune donnée modifiée/);assert.match(g.S.importError,/retour en arrière incomplet/);
 // valeur d'avant illisible : rien n'est écrit ni supprimé
 const h=prepImport(JSON.stringify(sauvegarde)),avantH=h.st.etat();h.st.lecturePanne=k=>k==='ess-templates';
 assert.equal(h.ctx.doImport(),false);h.st.lecturePanne=null;assert.equal(h.st.etat(),avantH);}
for(const [nom,texte] of [['JSON invalide','{pas du json'],['history non liste',JSON.stringify(Object.assign({},sauvegarde,{history:{}}))],
  ['fiche illisible',JSON.stringify(Object.assign({},sauvegarde,{history:[null]}))],['yearlyStats liste',JSON.stringify(Object.assign({},sauvegarde,{yearlyStats:[]}))],
  ['tableau','[1,2]'],['CMS nul','{"cmsList":[null],"history":[]}'],['CMS sans identifiant','{"cmsList":[{"nom":"Fumel"}]}'],
  ['démarche sans liste de documents','{"demarches":[{"nom":"D","documents":"x"}]}'],['secteur non texte','{"secteurs":[{}]}'],['permanence nulle','{"permanences":[null]}']]){
  const e=prepImport(texte),avant=e.st.etat();
  assert.equal(e.ctx.doImport(),false,nom);assert.equal(e.st.ecritures,0,nom+' : aucune écriture');assert.equal(e.st.etat(),avant);
  assert.equal(e.journal.pushs,0,nom+' : aucune sauvegarde');assert.equal(e.S.history[0].id,'ancien');
}
{const e=prepImport(JSON.stringify(sauvegarde));e.ctx.migratePermanences=()=>{throw new Error('migration');};assert.equal(e.ctx.doImport(),false);assert.equal(e.st.ecritures,0);}

/* ── Restaurer depuis GitHub : pas de succès si l'import échoue ; profil figé ── */
async function restaurer(contenu,fonction,options){
  options=options||{};
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];let appele=0;
  if(options.panne)e.st.panne=()=>true;
  e.ctx.fetch=()=>new Promise(res=>setTimeout(()=>{if(options.changerProfil)e.S.activeProfile='p2';res({ok:true,json:()=>Promise.resolve({content:Buffer.from(contenu,'utf8').toString('base64')})});},5));
  if(fonction==='fichier')e.ctx.ghRestoreFile('jeton','b/p1/backup.json');else e.ctx.ghRestoreLatest('jeton',()=>{appele++;});
  await new Promise(r=>setTimeout(r,40));return {e,appele};
}
(async()=>{
  for(const fonction of ['fichier','dernier']){
    const ok=await restaurer(JSON.stringify(sauvegarde),fonction);
    assert.equal(ok.e.S.history[0].id,'x',fonction+' : restauration appliquée');
    if(fonction==='fichier')assert(ok.e.journal.toasts.some(t=>/Restauration réussie/.test(t)));else assert.equal(ok.appele,1);
    for(const [cas,contenu,opt] of [['illisible','{"history":{}}',{}],['stockage plein',JSON.stringify(sauvegarde),{panne:true}],['profil changé',JSON.stringify(sauvegarde),{changerProfil:true}]]){
      const r=await restaurer(contenu,fonction,opt);
      assert(!r.e.journal.toasts.some(t=>/Restauration réussie/.test(t)),fonction+' '+cas+' : pas de succès');
      assert.equal(r.appele,0,fonction+' '+cas+' : suite non lancée');
      assert(r.e.journal.toasts.some(t=>/Restauration annulée/.test(t)),fonction+' '+cas+' : échec annoncé');
      assert.equal(r.e.S.history[0].id,'ancien',fonction+' '+cas+' : mémoire intacte');
      if(opt.changerProfil)assert.equal(r.e.st.getItem('ess-p2-history'),null,fonction+' : profil p2 non écrasé');
    }
  }

  /* ── Import du planning (vrai addHistory) : clé complète ; tout ou rien, compteur d'export compris ── */
  {const e=charger();e.S.history=[rdv('h1','2026-10-05','09:30','Martin','Léa','Fumel')];
   const r=e.ctx.appliquerPlanning([
     {date:'2026-10-05',heure:'10:30',nom:'MARTIN',prenom:'Léa',commune:'Fumel'},
     {date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Paul',commune:'Fumel'},
     {date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Léa',commune:'Marmande'},
     {date:'2026-10-05',heure:'09:30',nom:' martin ',prenom:'LÉA',commune:'fumel ',statut:'confirme'}]);
   assert.deepEqual([r.ok,r.added,r.updated],[true,3,1]);assert.equal(e.S.history.length,4);
   assert.equal(e.journal.pushs,1,'une seule sauvegarde, à la fin');assert.equal(e.st.getItem(e.ctx.pk('since-export')),'3','compteur d\'export tenu par le vrai addHistory');}
  {let echecs=0;
   for(let n=1;n<=12;n++){
     const e=charger();e.S.history=[rdv('h1','2026-10-05','09:30','Martin','Léa','Fumel')];e.S.permanences=[{commune:'Fumel',exceptDate:'2026-10-05'}];
     e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),JSON.stringify(e.S.permanences));e.st.setItem(e.ctx.pk('since-export'),'7');e.st.ecritures=0;
     const avant=e.st.etat(),mem=JSON.stringify([e.S.history,e.S.permanences]);
     e.st.panne=(k,i)=>i===n;
     const r=e.ctx.appliquerPlanning([{date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Léa',commune:'Fumel',statut:'confirme'},{date:'2026-10-06',heure:'09:30',nom:'N',prenom:'P',commune:'Fumel'}]);
     if(r.ok){assert.equal(e.st.getItem(e.ctx.pk('history')),JSON.stringify(e.S.history),'planning, panne '+n+' rattrapée : stockage = mémoire');}
     else{echecs++;
       assert.equal(e.st.etat(),avant,'planning, panne '+n+' : stockage restauré (compteur d\'export compris)');
       assert.equal(JSON.stringify([e.S.history,e.S.permanences]),mem,'planning, panne '+n+' : mémoire restaurée');
       assert.equal(e.journal.pushs,0,'planning, panne '+n+' : aucune sauvegarde');}
   }
   assert(echecs>=2,'les pannes de l\'enregistrement final annulent l\'import');}

  /* ── Import ICS (vrai addHistory) : une sauvegarde à la fin seulement ; tout ou rien ── */
  const ics='BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART;TZID=Europe/Paris:20261005T093000\nSUMMARY:RDV A\nLOCATION:Fumel\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART;TZID=Europe/Paris:20261006T103000\nSUMMARY:RDV B\nLOCATION:Fumel\nEND:VEVENT\nEND:VCALENDAR';
  {const e=charger();let historiqueAuPush=null;e.ctx.githubPush=()=>{e.journal.pushs++;historiqueAuPush=JSON.parse(e.st.getItem(e.ctx.pk('history'))).length;};
   assert.equal(e.ctx.importICSText(ics),2);assert.equal(e.journal.pushs,1,'une seule sauvegarde');assert.equal(historiqueAuPush,2,'sauvegarde de l\'état complet, pas intermédiaire');}
  {const e=charger();e.st.setItem(e.ctx.pk('since-export'),'4');e.st.ecritures=0;const avant=e.st.etat();
   e.st.panne=(k,i)=>k===e.ctx.pk('history')&&i>4;   // l'enregistrement final de l'historique échoue
   assert.equal(e.ctx.importICSText(ics),-1);assert.equal(e.st.etat(),avant,'ICS : stockage restauré');assert.equal(e.S.history.length,0);assert.equal(e.journal.pushs,0);}

  /* ── Pas de sauvegarde automatique pendant une écriture groupée ── */
  {const e=charger();let pendant=-1;
   e.st.setItem=(orig=>(k,v)=>{if(k==='b')pendant=e.ctx._ecrituresGroupees;e.ctx.maybeAutoBackupProfile('p1');return orig(k,v);})(e.st.setItem);
   assert.equal(e.ctx.ecrireTout([['a',1],['b',2]]),true);assert.equal(pendant,1);assert.equal(e.journal.pushs,0);
   e.ctx.maybeAutoBackupProfile('p1');assert.equal(e.journal.pushs,1);}

  console.log('Écritures sûres : lsSet, ecrireTout (lecture préalable, retour arrière vérifié), persist, writeProfileHistory et appelants, archivage, import JSON (éléments, réglages, panne à chaque écriture), restaurations (profil figé), planning et ICS avec le vrai addHistory OK.');
})().catch(e=>{console.error(e);process.exit(1);});
