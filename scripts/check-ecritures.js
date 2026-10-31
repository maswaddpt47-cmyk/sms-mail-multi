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
  section('function pkFor(','function countTodayRdv('),
  section('/* Amendement Codex (31/10) : renvoie false si l','/* retrouve l'),
  section('/* Réglages communs, en une fois','function saveLast('),
  section('function maybeAutoBackupProfile(','/* pousse un fichier daté'),
  section('function showToast(','function renderToast('),
  fonction('duplicateDem'),fonction('pointerStatut'),fonction('libererApresRelance'),fonction('writeProfileOrientations'),
  section('function clearHistory(','function exportHistoryCSV('),fonction('deleteHistItem'),fonction('saveHistItem'),
  section('function entryYear(','/* années révolues'),
  section('function archiveYear(','/* affiche les stats agrégées'),
  section('/* AG-013, étape 2 : la sauvegarde est vérifiée entièrement','/* history */'),
  section('function ghRestoreLatest(','/* rétention'),
  section('function ghRestoreFile(','function ghCheckOnStartup('),
  fonction('addHistory'),fonction('addHistoryBrut'),fonction('blockSlot'),fonction('blockSlotBrut'),fonction('hasConflict'),
  fonction('readProfileOrientations'),fonction('confirmOrientImport'),fonction('enregistrerDeplacement'),fonction('enregistrerCopie'),fonction('ensureDayOpenFor'),fonction('blockWholeDay'),
  fonction('preparationDayUTC'),fonction('receptionDateFor'),
  section('function getPermanence(','/* RDV confirmé dont la date est passée'),
  fonction('lunchBreakEntry'),
  section('/* Amendement Codex (31/10) : import ICS en tout ou rien','/* AG-013, étape 2 : même RDV'),
  section('/* AG-013, étape 2 : même RDV','function importPlanningJson('),
  fonction('handleGenerate'),fonction('lireListeStockee'),fonction('copyBody'),fonction('empreinteDossier'),fonction('findHistIdx'),fonction('migrateSharedCmsList'),
  // 5e vérification de Codex : partie migrations du vrai chargement (jusqu'aux pauses déjeuner, hors rendu)
  section('function loadProfileData(){','  applyLunchBreaks();')+'}'
].join('\n');

function stockage(){
  const m=new Map(),s={panne:null,lecturePanne:null,perte:null,ecritures:0};
  s.getItem=k=>{if(s.lecturePanne&&s.lecturePanne(k))throw new Error('SecurityError');if(s.lectureFausse&&s.lectureFausse(k))return '"relecture faussée"';return m.has(k)?m.get(k):null;};
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
    localStorage:st,S,confirm:()=>true,renderToast(){if(S.toast)journal.toasts.push(S.toast.msg);},renderConfig(){},renderHistory(){},renderHistoryList(){},renderOrientations(){},compute:()=>({dem:{nom:'Démarche fictive'},body:'x'}),isDuplicate:()=>false,getProfile:(pid)=>({nom:pid}),findHistIdx:(a,h)=>a.indexOf(h)>=0?a.indexOf(h):a.findIndex(x=>x.id===h.id),relanceTs:()=>NaN,renderModal(){},renderAll(){},regen(){},renderAgenda(){},renderTabs(){},renderHeader(){},
    ghToken:()=>'jeton-fictif',githubPush(){journal.pushs++;},HISTORY_MAX:99999,getSlots:()=>[],LUNCH_MOTIF:'Pause déjeuner',
    computeYearArchive:(y)=>({year:y,total:S.history.filter(h=>String(h.date).slice(0,4)==String(y)).length}),
    migratePermanences:(p)=>p.map(x=>Object.assign({},x,{migree:true})),PERM_MODEL_VERSION:3,
    canGenerate:()=>true,telProblem:()=>'',renderGenerate(){},renderMandat(){},
    PROFILES:[{id:'p1'},{id:'p2'}],DEFAULT_CMS:[],DEFAULT_DEMARCHES:[],DEFAULT_SECTEURS:[],DEFAULT_TEMPLATES:{sms:'défaut v5'},DEFAULT_CUSTOM:[],DEFAULT_PERMANENCES:[],
    GH_REPO:'depot/fictif',GH_BRANCH:'main',ghHeaders:()=>({}),ghListBackups:(t,cb)=>cb([{path:'b/p1/backup.json'}]),fetch:null
  });
  vm.runInContext(CODE+'\nvar _ghLastAutoPushByProfile={},_toastId=0;',ctx);
  return {ctx,S,st,journal};
}
function rdv(id,date,heure,nom,prenom,commune,statut){return {id,date,heure,nom,prenom,commune:commune||'Fumel',statut:statut||'realise',msgType:'confirmation'};}
function sansErreur(S){const c=JSON.parse(JSON.stringify(S));delete c.importError;delete c.saveStatus;delete c.toast;return c;}   /* bandeau et message d'alerte : changements d'interface voulus */

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
 e.st.panne=null;const arr2=e.S.history;arr2[0].statut='realise';assert.equal(e.ctx.writeProfileHistory('p1',arr2),true);
 assert.equal(e.journal.pushs,0,'après un échec : sauvegardes automatiques suspendues jusqu\'au rechargement');assert.match(e.S.saveStatus,/Enregistrement impossible/);}
{const e=charger();e.S.history=[rdv('a','2026-10-05','09:30','FICTIF','A')];assert.equal(e.ctx.writeProfileHistory('p1',e.S.history),true);assert.equal(e.journal.pushs,1);}   // sans échec : sauvegarde
// chaque appelant tient compte du résultat
html.split('\n').filter(l=>/writeProfileHistory\(/.test(l)&&!/function writeProfileHistory/.test(l)).forEach(l=>{
  assert.match(l,/if\(!writeProfileHistory\(|=writeProfileHistory\(/,'appelant sans contrôle du résultat : '+l.trim().slice(0,90));
});

/* ── Contre-exemples de la 2e vérification de Codex, exécutés ── */
// génération ordinaire : addHistory refusé → pas de fiche en mémoire, pas de sauvegarde, pas de succès affiché
{const e=charger();e.S.history=[];e.st.panne=k=>k===e.ctx.pk('history');
 assert.equal(e.ctx.addHistory({date:'2026-10-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'P',body:'texte'},true),false);
 e.ctx.showToast('✓ Message généré et enregistré');
 assert.equal(e.S.history.length,0,'fiche refusée absente de la mémoire');assert.equal(e.journal.pushs,0);assert.equal(e.st.getItem(e.ctx.pk('since-export')),null,'pas d\'effet secondaire');
 assert(!e.journal.toasts.some(m=>/généré et enregistré/.test(m)),'pas de faux succès');assert(e.journal.toasts.some(m=>/Opération non enregistrée/.test(m)));}
// le filet ne dure que l'action en cours : un succès ultérieur s'affiche normalement
// suppression et effacement de l'historique, modification d'une fiche : mémoire = stockage après échec
{const e=charger();e.S.history=[rdv('a','2026-10-05','09:30','FICTIF','A'),rdv('b','2026-10-06','09:30','FICTIF','B')];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
 e.st.panne=()=>true;e.ctx.deleteHistItem(0);assert.equal(e.S.history.length,2,'suppression refusée : fiche toujours là');
 e.ctx.clearHistory();assert.equal(e.S.history.length,2,'effacement refusé : historique conservé');
 e.S.editHistBody='modifié';e.ctx.saveHistItem(0);assert.equal(e.S.history[0].body,undefined,'modification refusée : réalignée sur le stockage');
 assert.equal(e.st.getItem(e.ctx.pk('history')),JSON.stringify(e.S.history),'mémoire = stockage');}
// protections isolées : réalignement seul (clé absente = vide), retour explicite d'addHistory quand la relecture est impossible,
// réalignement de tous les réglages quand l'échec porte sur une autre clé que celle modifiée
{const e=charger();e.S.history=[rdv('z','2026-10-05','09:30','Z','Z')];e.st.panne=()=>true;e.ctx.lsSet(e.ctx.pk('history'),e.S.history);
 assert.deepEqual(JSON.parse(JSON.stringify(e.S.history)),[],'historique jamais enregistré : réaligné sur vide');}
{const e=charger();e.S.history=[rdv('a','2026-10-04','09:30','A','A')];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
 e.st.panne=k=>k===e.ctx.pk('history');e.st.lecturePanne=k=>k===e.ctx.pk('history');
 assert.equal(e.ctx.addHistory({date:'2026-10-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'P'}),false);e.st.lecturePanne=null;
 assert.equal(e.S.history.length,1,'relecture impossible : addHistory remet lui-même l\'historique d\'avant');}
{const e=charger();e.S.demarches=[{id:1,nom:'D',documents:[]}];e.st.setItem('ess-demarches',JSON.stringify(e.S.demarches));
 e.st.panne=k=>k==='ess-lastSave';e.ctx.duplicateDem(1);
 assert.equal(e.S.demarches.length,1,'échec sur une autre clé : démarches réalignées par persist');assert(!e.journal.toasts.some(m=>/Démarche dupliquée/.test(m)));}
// 3e vérification de Codex : action à deux données
// génération : fiche enregistrée mais journée refusée → tout annulé (fiche, journée, compteur)
{const e=charger();e.S.history=[];e.S.permanences=[];e.st.setItem(e.ctx.pk('since-export'),'2');e.st.ecritures=0;const avant=e.st.etat();
 e.st.panne=k=>k===e.ctx.pk('permanences');
 assert.equal(e.ctx.addHistory({date:'2026-10-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'P',body:'texte'},true),false);
 assert.equal(e.st.etat(),avant,'génération : ni fiche, ni journée, ni compteur');assert.equal(e.S.history.length,0);assert.equal(e.S.permanences.length,0);assert.equal(e.journal.pushs,0);}
{const e=charger();assert.equal(e.ctx.addHistory({date:'2026-10-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'P'}),true);   // garde : sans panne
 assert.equal(e.S.permanences.length,1,'journée ouverte');assert.equal(e.journal.pushs,1,'une seule sauvegarde, à la fin');}
// blocage d'un créneau : journée ouverte mais blocage refusé → journée annulée aussi
{const e=charger();e.S.history=[];e.S.permanences=[];const avant=e.st.etat();
 e.st.panne=k=>k===e.ctx.pk('history');
 assert.equal(e.ctx.blockSlot('Fumel','2026-10-07','10:30','Réunion'),false);
 assert.equal(e.st.etat(),avant,'blocage : journée non créée');assert.equal(e.S.permanences.length,0);assert.equal(e.S.history.length,0);}
{const e=charger();assert.equal(e.ctx.blockSlot('Fumel','2026-10-07','10:30','Réunion'),true);assert.equal(e.S.history.length,1);assert.equal(e.S.permanences.length,1);}
// import d'orientations sur deux profils : panne sur le second → rien d'écrit, préparation conservée, pas de sauvegarde
{const e=charger();e.S.orientations=[];const rows=[{include:true,targetProfile:'p1',id:'o1',nom:'A'},{include:true,targetProfile:'p2',id:'o2',nom:'B'}];
 e.S.orientImportRows=rows;e.S.modal='orient-import';const avant=e.st.etat();
 e.st.panne=k=>k==='ess-p2-orientations';
 assert.equal(e.ctx.confirmOrientImport(),false);
 assert.equal(e.st.etat(),avant,'orientations : aucun profil écrit');assert.equal(e.S.orientImportRows,rows,'préparation conservée');assert.equal(e.journal.pushs,0);
 assert(!e.journal.toasts.some(m=>/orientation\(s\) ajoutée/.test(m)));
 const f=charger();f.S.orientations=[];f.S.orientImportRows=rows;f.ctx.confirmOrientImport();
 assert.equal(JSON.parse(f.st.getItem('ess-p2-orientations')).length,1);assert.equal(f.S.orientations.length,1);assert.equal(f.S.orientImportRows,null);assert.equal(f.journal.pushs,2,'une sauvegarde par profil, après coup');}
// orientations
{const e=charger();e.S.orientations=[{nom:'A'}];e.st.setItem(e.ctx.pk('orientations'),JSON.stringify(e.S.orientations));e.st.panne=()=>true;
 assert.equal(e.ctx.writeProfileOrientations('p1',[{nom:'A'},{nom:'B'}]),false);assert.equal(e.S.orientations.length,1);assert.equal(e.journal.pushs,0);}
// réglages : dupliquer une démarche refusée → une seule démarche, pas de « Démarche dupliquée »
{const e=charger();e.S.demarches=[{id:1,nom:'D',documents:[]}];e.st.setItem('ess-demarches',JSON.stringify(e.S.demarches));e.st.ecritures=0;
 e.st.panne=(k,i)=>k==='ess-demarches';e.ctx.duplicateDem(1);
 assert.equal(e.S.demarches.length,1,'mémoire réalignée');assert(!e.journal.toasts.some(m=>/Démarche dupliquée/.test(m)),'pas de faux succès');}
// libérer après relance : pas de « Créneau libéré » si le pointage échoue
{const e=charger();const h=rdv('a','2026-10-05','09:30','FICTIF','A','Fumel','en_attente');h.dateRelance='2026-10-04';e.S.history=[h];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
 e.st.panne=()=>true;e.ctx.libererApresRelance(h);
 assert(!e.journal.toasts.some(m=>/Créneau libéré/.test(m)),'pas de faux succès');assert.equal(e.S.history[0].statut,'en_attente','statut réaligné');
 const f=charger();const h2=rdv('b','2026-10-05','09:30','FICTIF','B','Fumel','en_attente');h2.dateRelance='2026-10-04';f.S.history=[h2];
 f.ctx.libererApresRelance(h2);assert(f.journal.toasts.some(m=>/Créneau libéré/.test(m)),'sans panne : succès affiché');}
// opération groupée : un échec intermédiaire annule même si l'écriture finale réussit
{const e=charger();e.S.history=[];let n=0;e.st.panne=(k)=>k===e.ctx.pk('history')&&++n===1;
 const r=e.ctx.operationHistorique(()=>{e.ctx.addHistory({date:'2026-10-05',heure:'09:30',commune:'Fumel',nom:'A',prenom:'A'});e.ctx.addHistory({date:'2026-10-06',heure:'09:30',commune:'Fumel',nom:'B',prenom:'B'});});
 assert.equal(r.ok,false,'échec intermédiaire : opération annulée');assert.equal(e.S.history.length,0);}

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
// P09 (vérification de clôture de Codex) : une année déjà archivée n'est jamais réarchivée ; archive et fiches réapparues conservées
{const e=prepArchive();e.S.history.push(rdv('r','2024-05-02','09:30','REVENU','R'));e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
 const avant=e.st.etat();e.ctx.archiveYear(2024);
 assert.equal(e.st.etat(),avant,'P09 : stockage inchangé');assert.equal(e.S.yearlyStats[2024].total,9,'P09 : archive existante conservée');
 assert.equal(e.S.history.filter(h=>h.date.startsWith('2024')).length,1,'P09 : fiche réapparue conservée');
 assert(e.journal.toasts.some(t=>/déjà archivée/.test(t)),'P09 : refus annoncé');assert.equal(e.journal.pushs,0);}

/* ── Import JSON : vérifié en entier (éléments compris), appliqué en une fois avec les réglages ── */
const sauvegarde={cmsList:[{id:1,nom:'Fumel'},{id:2,nom:'Marmande'}],demarches:[{id:1,nom:'D',documents:[]}],secteurs:['Fumel'],customTemplates:[],customVars:[],mandats:[],
  history:[rdv('x','2026-10-02','09:30','FICTIF','X')],yearlyStats:{2025:{year:2025}},permanences:[{commune:'Fumel',exceptDate:'2026-10-02'}],orientations:[{nom:'FICTIF'}]};
function prepImport(texte){
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];
  e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem('ess-cms',JSON.stringify(e.S.cmsList));e.st.setItem('ess-templates',JSON.stringify(e.S.templates));
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
// import JSON : écriture de l'historique faite mais relecture faussée une fois → retour arrière, mémoire = stockage final
{const e=prepImport(JSON.stringify(sauvegarde)),avant=e.st.etat();let n=0;
 e.st.lectureFausse=k=>k===e.ctx.pk('history')&&++n===2;   // 1re lecture : valeur d'avant ; 2e : relecture après écriture
 assert.equal(e.ctx.doImport(),false);e.st.lectureFausse=null;
 assert.equal(e.st.etat(),avant,'stockage revenu à l\'ancien');assert.equal(e.S.history[0].id,'ancien','mémoire réalignée sur le stockage final');
 assert.equal(e.st.getItem(e.ctx.pk('history')),JSON.stringify(e.S.history));}
for(const [nom,texte] of [['JSON invalide','{pas du json'],['history non liste',JSON.stringify(Object.assign({},sauvegarde,{history:{}}))],
  ['fiche illisible',JSON.stringify(Object.assign({},sauvegarde,{history:[null]}))],['yearlyStats liste',JSON.stringify(Object.assign({},sauvegarde,{yearlyStats:[]}))],
  ['tableau','[1,2]'],['CMS nul','{"cmsList":[null],"history":[]}'],['CMS sans identifiant','{"cmsList":[{"nom":"Fumel"}]}'],
  ['démarche sans liste de documents','{"demarches":[{"nom":"D","documents":"x"}]}'],['modèle avec corps numérique','{"customTemplates":[{"nom":"M","body":1}]}'],['fiche avec nom numérique','{"history":[{"date":"2026-10-01","nom":5}]}'],['secteur non texte','{"secteurs":[{}]}'],['permanence nulle','{"permanences":[null]}']]){
  const e=prepImport(texte),avant=e.st.etat();
  assert.equal(e.ctx.doImport(),false,nom);assert.equal(e.st.ecritures,0,nom+' : aucune écriture');assert.equal(e.st.etat(),avant);
  assert.equal(e.journal.pushs,0,nom+' : aucune sauvegarde');assert.equal(e.S.history[0].id,'ancien');
}
{const e=prepImport(JSON.stringify(sauvegarde));e.ctx.migratePermanences=()=>{throw new Error('migration');};assert.equal(e.ctx.doImport(),false);assert.equal(e.st.ecritures,0);}

/* ── Restaurer depuis GitHub : pas de succès si l'import échoue ; profil figé ── */
async function restaurer(contenu,fonction,options){
  options=options||{};
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));let appele=0;   /* mémoire chargée depuis le stockage, comme dans l'application */
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
    {const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];e.st.setItem('ess-cms','"ancien"');e.st.ecritures=0;e.st.panne=(k,i)=>i>=2;
     e.ctx.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({content:Buffer.from(JSON.stringify(sauvegarde),'utf8').toString('base64')})});
     if(fonction==='fichier')e.ctx.ghRestoreFile('jeton','b');else e.ctx.ghRestoreLatest('jeton',()=>{});await new Promise(r=>setTimeout(r,30));
     assert(e.journal.toasts.some(m=>/retour en arrière incomplet/.test(m)),fonction+' : incohérence relayée');assert(!e.journal.toasts.some(m=>/aucune donnée modifiée/.test(m)),fonction+' : pas de « aucune donnée modifiée »');}
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
     if(r.ok){assert(n>e.st.ecritures,'planning : succès seulement si aucune panne ne s\'est produite');}
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

  /* ── 4e vérification de Codex : actions complètes, par leurs vrais chemins ── */
  // déplacement d'un RDV (profil actif) : fiche modifiée sur place + journée cible refusée → tout rétabli
  {const e=charger();e.S.history=[rdv('m1','2026-10-05','09:30','FICTIF','M','Fumel','confirme')];e.S.permanences=[{commune:'Fumel',exceptDate:'2026-10-05'}];
   e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),JSON.stringify(e.S.permanences));const avant=e.st.etat();
   const appliquer=()=>{const f=e.S.history[0];Object.assign(f,{date:'2026-10-09'});return e.ctx.writeProfileHistory('p1',e.S.history)?f:null;};
   e.st.panne=k=>k===e.ctx.pk('permanences');
   assert.equal(e.ctx.enregistrerDeplacement('p1',appliquer).ok,false);
   assert.equal(e.st.etat(),avant,'déplacement : stockage inchangé');assert.equal(e.S.history[0].date,'2026-10-05','fiche modifiée sur place : rétablie');assert.equal(e.journal.pushs,0);
   const f=charger();f.S.history=[rdv('m1','2026-10-05','09:30','FICTIF','M','Fumel','confirme')];
   const ok=f.ctx.enregistrerDeplacement('p1',()=>{const x=f.S.history[0];x.date='2026-10-09';return f.ctx.writeProfileHistory('p1',f.S.history)?x:null;});
   assert.equal(ok.ok,true);assert(f.S.permanences.some(p=>p.exceptDate==='2026-10-09'),'journée cible ouverte');assert.equal(f.journal.pushs,1);}
  // déplacement d'un RDV d'un autre profil : historique et journées de ce profil rétablis
  {const e=charger();e.st.setItem('ess-p2-history',JSON.stringify([rdv('m2','2026-10-05','09:30','FICTIF','N','Fumel','confirme')]));e.st.setItem('ess-p2-permanences','[]');const avant=e.st.etat();
   e.st.panne=k=>k==='ess-p2-permanences';
   const r=e.ctx.enregistrerDeplacement('p2',()=>{const arr=JSON.parse(e.st.getItem('ess-p2-history'));arr[0].date='2026-10-09';return e.ctx.writeProfileHistory('p2',arr)?arr[0]:null;});
   assert.equal(r.ok,false);assert.equal(e.st.etat(),avant,'autre profil : historique et journées inchangés');}
  // copie d'un message : réception enregistrée puis message refusé → ni réception ni message
  function prepCopie(){const e=charger();Object.assign(e.S,{date:'2026-10-12',heure:'09:30',commune:'Fumel',nom:'COPIE',prenom:'C',dateReception:'2026-10-10',selectedCMS:1,channel:'sms',msgType:'confirmation'});
    e.S.history=[Object.assign(rdv('c1','2026-10-12','09:30','COPIE','C'),{dateReception:'2026-10-01',body:'ancien'})];e.S.permanences=[];
    e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),'[]');return e;}
  {const e=prepCopie(),avant=e.st.etat();e.st.panne=k=>k===e.ctx.pk('permanences');
   assert.equal(e.ctx.enregistrerCopie('nouveau message').ok,false);
   assert.equal(e.st.etat(),avant,'copie : stockage inchangé');assert.equal(e.S.history.length,1);assert.equal(e.S.history[0].dateReception,'2026-10-01','réception rétablie');assert.equal(e.journal.pushs,0);
   const f=prepCopie();assert.equal(f.ctx.enregistrerCopie('nouveau message').ok,true);
   assert.equal(f.S.history[0].body,'nouveau message');assert.equal(f.S.history.find(h=>h.id==='c1').dateReception,'2026-10-10');}
  /* ── P05 : même texte pour deux dossiers distincts → deux fiches ; même dossier recopié → une seule ── */
  {const e=prepCopie();e.S.history=[];e.st.setItem(e.ctx.pk('history'),'[]');
   assert.equal(e.ctx.enregistrerCopie('Texte générique').ok,true);
   Object.assign(e.S,{nom:'AUTRE',prenom:'B',heure:'10:30'});assert.equal(e.ctx.enregistrerCopie('Texte générique').ok,true);
   assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).length,2,'P05 : texte identique, dossier différent → enregistré');
   assert.equal(e.ctx.enregistrerCopie('Texte générique').ok,true);
   assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).length,2,'P05 témoin : même dossier recopié → pas de doublon');}
  /* ── P04 : deux fiches de même nom et même créneau, prénoms différents → la bonne est retrouvée ── */
  {const e=charger();const A=rdv('a','2026-11-05','09:30','HOMONYME','Alice'),B=rdv('b','2026-11-05','09:30','HOMONYME','Bruno');
   const arr=[A,B];const copieB=JSON.parse(JSON.stringify(B));delete copieB.id;
   assert.equal(e.ctx.findHistIdx(arr,copieB),1,'P04 : prénom pris en compte');
   assert.equal(e.ctx.findHistIdx(arr,JSON.parse(JSON.stringify(B))),1,'P04 : identifiant pris en compte');
   const copieA=JSON.parse(JSON.stringify(A));delete copieA.id;assert.equal(e.ctx.findHistIdx(arr,copieA),0,'P04 témoin');
   const inconnu=Object.assign({},copieA,{prenom:'Chloé'});assert.equal(e.ctx.findHistIdx(arr,inconnu),-1,'P04 : aucune fiche d\'une autre personne modifiée');}
  /* ── P03 : dossier changé pendant l'attente du presse-papiers → rien enregistré ; témoin sans changement ── */
  for(const change of ['dossier','profil',null]){
    const e=prepCopie();e.S.history=[];e.st.setItem(e.ctx.pk('history'),'[]');e.S.generatedBody='Message de A';
    let fin;e.ctx.doCopy=()=>new Promise(r=>{fin=r;});e.ctx.compactSmsText=t=>t;e.ctx.updatePreviewOnly=()=>{};e.ctx.flashCopied=()=>{};
    e.ctx.copyBody();
    if(change==='dossier')Object.assign(e.S,{nom:'AUTRE',prenom:'B'});
    if(change==='profil'){e.st.setItem('ess-cms-migrated-v2','1');e.S.activeProfile='p2';e.ctx.loadProfileData();}
    fin(true);await new Promise(r=>setTimeout(r,0));
    const h1=JSON.parse(e.st.getItem('ess-p1-history')||'[]'),h2=JSON.parse(e.st.getItem('ess-p2-history')||'[]');
    if(change){assert.equal(h1.length+h2.length,0,'P03 '+change+' changé : rien enregistré');assert(e.journal.toasts.some(t=>/dossier a changé/.test(t)));}
    else{assert.equal(h1.length,1,'P03 témoin : copie enregistrée');assert.equal(h1[0].nom,'COPIE');}
  }
  /* ── P02 : chaque lecture de fichier qui écrit retient son profil (contrôle de structure) et le contexte est vérifié ── */
  {const lecteurs=[...html.matchAll(/new FileReader\(\);[\s\S]{0,140}?onload=function\((?:e|ev)\)\{([\s\S]{0,160})/g)];
   const sansGarde=lecteurs.filter(m=>!/contexteIntact\(ctxDepart\)/.test(m[1])&&!/Lecture du fichier/.test(m[1]));
   assert.equal(lecteurs.length,6,'6 lectures de fichier recensées');assert.equal(sansGarde.length,0,'P02 : toute lecture de fichier qui écrit vérifie son contexte');
   const e=charger();const c=e.ctx.contexteFige();assert.equal(e.ctx.contexteIntact(c),true);
   e.st.setItem('ess-cms-migrated-v2','1');e.S.activeProfile='p2';e.ctx.loadProfileData();assert.equal(e.ctx.contexteIntact(c),false,'P02 : profil changé détecté');
   const d=e.ctx.contexteFige();e.ctx.loadProfileData();assert.equal(e.ctx.contexteIntact(d),false,'P02 : rechargement du même profil détecté');}
  /* ── P08 / T12 : vrai githubPush, réseau simulé ── */
  function prepPush(){const e=charger();for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"'],['ess-p1-perm-version','3']])e.st.setItem(k,v);
    e.st.setItem('ess-p1-history',JSON.stringify([rdv('s1','2026-11-03','09:30','SAUVE','A')]));e.ctx.loadProfileData();
    vm.runInContext(fonction('exportDataForProfile')+fonction('sauvegardeFiable'),e.ctx);   // vraies fonctions, extraites du fichier
    const push=vm.runInContext('('+fonction('githubPush')+')',e.ctx);
    Object.assign(e.ctx,{ghToken:()=>'jeton-fictif',ghNowFile:()=>'b/p1/fictif.json',ghCleanOldBackups(){},renderHeader(){},btoa:x=>Buffer.from(x,'binary').toString('base64'),unescape,encodeURIComponent});
    const res={puts:0,envoye:null,finPut:null};
    e.ctx.fetch=(url,opt)=>{if(opt&&opt.method==='PUT'){res.puts++;res.envoye=JSON.parse(decodeURIComponent(escape(Buffer.from(JSON.parse(opt.body).content,'base64').toString('binary'))));return new Promise(r=>{res.finPut=()=>r({ok:true});});}return Promise.resolve({ok:false});};
    return {e,push,res};}
  const tours=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setTimeout(r,0));};
  {const {e,push,res}=prepPush();e.st.setItem('ess-p1-since-export','1');
   push(true);await tours();assert.equal(res.puts,1);assert.equal(res.envoye.history.length,1);
   e.st.setItem('ess-p1-since-export','2');   // une fiche ajoutée pendant l'envoi
   res.finPut();await tours();
   assert.equal(e.st.getItem('ess-p1-since-export'),'1','P08 : la fiche ajoutée pendant l\'envoi reste comptée');
   push(true);await tours();res.finPut();await tours();assert.equal(e.st.getItem('ess-p1-since-export'),'0','P08 témoin : tout envoyé → 0');}
  {const {e,push,res}=prepPush();let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
   push(false);await tours();
   assert.equal(res.puts,0,'T12 : aucune sauvegarde envoyée avec un historique non lu');assert(e.journal.toasts.some(t=>/Sauvegarde refusée/.test(t)),'T12 : refus annoncé');
   assert(!e.journal.toasts.some(t=>/réussie/.test(t)));
   e.ctx.loadProfileData();push(false);await tours();assert.equal(res.puts,1,'T12 témoin : sauvegarde après chargement réussi');assert.equal(res.envoye.history.length,1);}
  /* ── T03 : donnée d'un autre profil illisible ou lecture refusée → jamais remplacée ── */
  for(const mode of ['lecture refusée','corrompue']){
    const e=charger();const k='ess-p2-orientations';e.st.setItem(k,mode==='corrompue'?'{pas du json':JSON.stringify([{nom:'ANCIENNE'}]));
    const avant=e.st.getItem(k);let n=0;if(mode==='lecture refusée')e.st.lecturePanne=x=>x===k&&++n===1;
    const lu=e.ctx.readProfileOrientations('p2');e.st.lecturePanne=null;
    assert.equal(e.ctx.writeProfileOrientations('p2',lu.concat([{nom:'NOUVELLE'}])),false,'T03 '+mode+' : écriture refusée');
    assert.equal(e.st.getItem(k),avant,'T03 '+mode+' : orientations de p2 intactes');
    e.st.setItem('ess-cms-migrated-v2','1');e.ctx.loadProfileData();   // un chargement de p1 ne lève pas la protection de p2
    const relu=e.ctx.readProfileOrientations('p2');
    if(mode==='corrompue'){assert.equal(e.ctx.writeProfileOrientations('p2',relu.concat([{nom:'NOUVELLE'}])),false,'T03 : reste verrouillée tant qu\'illisible');assert.equal(e.st.getItem(k),avant);}
    else{assert.equal(e.ctx.writeProfileOrientations('p2',relu.concat([{nom:'NOUVELLE'}])),true,'T03 témoin : relue correctement → écrite');
      assert.deepEqual(JSON.parse(e.st.getItem(k)).map(o=>o.nom),['ANCIENNE','NOUVELLE'],'T03 : anciennes conservées');}
  }
  /* ── T14 : chargement interrompu → aucune donnée écrite ensuite ; rechargement réussi → écritures rétablies ── */
  {const e=charger();e.st.setItem('ess-p2-history',JSON.stringify([rdv('b','2026-11-04','09:30','B','B')]));e.S.history=[rdv('a','2026-11-03','09:30','A','A')];
   e.S.activeProfile='p2';let n=0;e.st.lecturePanne=k=>k==='ess-cms-migrated-v2'&&++n===1;
   assert.throws(()=>e.ctx.loadProfileData(),'T14 : chargement interrompu');e.st.lecturePanne=null;
   const avant=e.st.getItem('ess-p2-history');
   assert.equal(e.ctx.addHistory({date:'2026-11-05',heure:'09:30',commune:'Fumel',nom:'C',prenom:'C'}),false,'T14 : saisie refusée');
   assert.equal(e.st.getItem('ess-p2-history'),avant,'T14 : historique de p2 non remplacé par la mémoire de p1');
   assert(e.journal.toasts.some(t=>/Chargement du profil interrompu/.test(t)));
   e.st.setItem('ess-cms-migrated-v2','1');e.ctx.loadProfileData();
   assert.equal(e.ctx.addHistory({date:'2026-11-05',heure:'09:30',commune:'Fumel',nom:'C',prenom:'C'}),true,'T14 : écritures rétablies après chargement réussi');
   assert.deepEqual(JSON.parse(e.st.getItem('ess-p2-history')).map(h=>h.nom).sort(),['B','C'],'T14 : B conservé');}
  // bloquer toute une journée : refus au 2e créneau → aucun créneau bloqué, aucune sauvegarde
  {const e=charger();e.S.history=[];e.S.permanences=[{commune:'Fumel',exceptDate:'2026-10-14',pauseAuto:true}];e.st.setItem(e.ctx.pk('permanences'),JSON.stringify(e.S.permanences));const avant=e.st.etat();
   let n=0;e.st.panne=k=>k===e.ctx.pk('history')&&++n===2;
   assert.equal(e.ctx.blockWholeDay('Fumel','2026-10-14',[{heure:'09:30'},{heure:'10:30'},{heure:'11:30'}],'Formation'),false);
   assert.equal(e.st.etat(),avant,'journée : aucun créneau bloqué');assert.equal(e.S.history.length,0);assert.equal(e.journal.pushs,0);
   const f=charger();assert.equal(f.ctx.blockWholeDay('Fumel','2026-10-14',[{heure:'09:30'},{heure:'10:30'},{heure:'11:30',taken:{}}],'Formation'),true);
   assert.equal(f.S.history.length,2,'créneaux libres bloqués, créneau pris ignoré');assert.equal(f.journal.pushs,1);}
  // protection isolée : une opération imbriquée en échec de lecture préalable, dont le résultat est ignoré, fait échouer l'englobante
  {const e=charger();e.S.history=[];let lectures=0;e.st.lecturePanne=k=>k===e.ctx.pk('history')&&++lectures===2;
   const r=e.ctx.operationHistorique(()=>{e.ctx.operationHistorique(()=>{});e.S.history.push(rdv('i','2026-10-20','09:30','I','I'));});
   e.st.lecturePanne=null;assert.equal(r.ok,false,'échec imbriqué ignoré par l\'appelant : l\'englobante échoue quand même');assert.equal(e.S.history.length,0);}
  // lecture préalable impossible dans une opération imbriquée : l'import entier échoue, aucun ajout compté
  for(const quoi of ['planning','ics']){
    const e=charger();e.S.history=[];e.S.permanences=[];const avant=e.st.etat();let lectures=0;
    e.st.lecturePanne=k=>k===e.ctx.pk('history')&&++lectures===2;   // 1re : opération englobante ; 2e : premier addHistory
    const r=quoi==='planning'?e.ctx.appliquerPlanning([{date:'2026-10-15',heure:'09:30',nom:'A',prenom:'A',commune:'Fumel'},{date:'2026-10-16',heure:'09:30',nom:'B',prenom:'B',commune:'Fumel'}])
      :e.ctx.importICSText('BEGIN:VEVENT\nDTSTART;TZID=Europe/Paris:20261015T093000\nSUMMARY:A\nLOCATION:Fumel\nEND:VEVENT\nBEGIN:VEVENT\nDTSTART;TZID=Europe/Paris:20261016T093000\nSUMMARY:B\nLOCATION:Fumel\nEND:VEVENT');
    e.st.lecturePanne=null;
    assert(quoi==='planning'?r.ok===false&&r.added===0:r===-1,quoi+' : échec annoncé, aucun ajout compté');
    assert.equal(e.st.etat(),avant,quoi+' : rien enregistré');assert.equal(e.S.history.length,0);assert.equal(e.journal.pushs,0);
  }

  /* ── Rappel d'export : après la 5e fiche enregistrée, jamais après une fiche refusée ── */
  {const e=charger();e.st.setItem(e.ctx.pk('since-export'),'4');
   assert.equal(e.ctx.addHistory({date:'2026-10-08',heure:'09:30',commune:'Fumel',nom:'R',prenom:'R'}),true);
   await new Promise(r=>setTimeout(r,700));assert(e.journal.toasts.some(m=>/5 messages non sauvegardés/.test(m)),'rappel affiché après la 5e fiche');
   const f=charger();f.st.setItem(f.ctx.pk('since-export'),'4');f.st.panne=k=>k===f.ctx.pk('permanences');
   assert.equal(f.ctx.addHistory({date:'2026-10-08',heure:'09:30',commune:'Fumel',nom:'R',prenom:'R'}),false);
   await new Promise(r=>setTimeout(r,700));assert(!f.journal.toasts.some(m=>/messages non sauvegardés/.test(m)),'pas de rappel pour une fiche refusée');}

  /* ── Pas de sauvegarde automatique pendant une écriture groupée ── */
  {const e=charger();let pendant=-1;
   e.st.setItem=(orig=>(k,v)=>{if(k==='b')pendant=e.ctx._ecrituresGroupees;e.ctx.maybeAutoBackupProfile('p1');return orig(k,v);})(e.st.setItem);
   assert.equal(e.ctx.ecrireTout([['a',1],['b',2]]),true);assert.equal(pendant,1);assert.equal(e.journal.pushs,0);
   e.ctx.maybeAutoBackupProfile('p1');assert.equal(e.journal.pushs,1);}

  /* ── 5e vérification de Codex : migrations du chargement, marqueur seulement avec ses données (vrai loadProfileData) ── */
  // catalogue partagé : refus du catalogue fusionné → pas de marqueur, fusion retentée et complète après rétablissement
  {const e=charger();e.st.setItem('ess-cms',JSON.stringify([{nom:'Agen'}]));e.st.setItem('ess-p1-cms',JSON.stringify([{nom:'Nérac'}]));e.st.setItem('ess-pm-start-v1','"1"');
   e.st.setItem('ess-tpl-version','"v5-lapin-templates"');e.st.setItem(e.ctx.pk('perm-version'),'3');
   e.st.panne=k=>k==='ess-cms';e.ctx.loadProfileData();
   assert.equal(e.st.getItem('ess-cms-migrated-v2'),null,'catalogue refusé : migration non déclarée achevée');
   assert.deepEqual(JSON.parse(e.st.getItem('ess-cms')).map(c=>c.nom),['Agen']);
   e.st.panne=null;e.ctx.loadProfileData();
   assert.equal(e.st.getItem('ess-cms-migrated-v2'),'1','marqueur posé au chargement suivant, format inchangé');
   assert.deepEqual(JSON.parse(e.st.getItem('ess-cms')).map(c=>c.nom),['Agen','Nérac'],'fusion complète après rétablissement');
   assert.deepEqual(e.S.cmsList.map(c=>c.nom),['Agen','Nérac']);}
  // 6e vérification de Codex : source illisible ou lecture refusée une fois → catalogue intact, pas de marqueur, fusion complète ensuite
  for(const cas of ['ancien refusé','partagé refusé','ancien illisible','ancien vide','partagé vide']){
    const e=charger();e.st.setItem('ess-cms',cas==='partagé vide'?'':JSON.stringify([{nom:'Agen'}]));e.st.setItem('ess-pm-start-v1','"1"');
    e.st.setItem('ess-p1-cms',cas==='ancien illisible'?'{pas du json':cas==='ancien vide'?'':JSON.stringify([{nom:'Nérac'}]));
    e.st.setItem('ess-tpl-version','"v5-lapin-templates"');e.st.setItem(e.ctx.pk('perm-version'),'3');
    const cle=cas==='partagé refusé'?'ess-cms':'ess-p1-cms';let n=0;
    if(cas.endsWith('refusé'))e.st.lecturePanne=k=>k===cle&&++n===1;
    e.ctx.migrateSharedCmsList();e.st.lecturePanne=null;
    assert.equal(e.st.getItem('ess-cms-migrated-v2'),null,cas+' : migration non déclarée achevée');
    if(cas==='partagé vide')assert.equal(e.st.getItem('ess-cms'),'',cas+' : source vide non écrasée');
    else assert.deepEqual(JSON.parse(e.st.getItem('ess-cms')).map(c=>c.nom),['Agen'],cas+' : catalogue partagé intact');
    if(cas==='ancien illisible'||cas==='ancien vide')e.st.setItem('ess-p1-cms',JSON.stringify([{nom:'Nérac'}]));
    if(cas==='partagé vide')e.st.setItem('ess-cms',JSON.stringify([{nom:'Agen'}]));
    e.ctx.loadProfileData();
    assert.equal(e.st.getItem('ess-cms-migrated-v2'),'1',cas+' : marqueur posé après rétablissement');
    assert.deepEqual(JSON.parse(e.st.getItem('ess-cms')).map(c=>c.nom),['Agen','Nérac'],cas+' : fusion complète après rétablissement');
  }
  // clé réellement absente : traitement inchangé (ancien catalogue de profil absent → pas de blocage)
  {const e=charger();e.st.setItem('ess-cms',JSON.stringify([{nom:'Agen'}]));e.ctx.migrateSharedCmsList();
   assert.equal(e.st.getItem('ess-cms-migrated-v2'),'1','clés absentes : migration achevée');}
  // 8e vérification de Codex : vrai chargement, réglage Fumel encore à faire, source partagée vide ou malformée → rien réécrit, même après deux chargements
  for(const brut of ['','{pas du json']){
    const e=charger();e.st.setItem('ess-cms',brut);e.st.setItem('ess-p1-cms',JSON.stringify([{nom:'Fumel'}]));
    e.st.setItem('ess-tpl-version','"v5-lapin-templates"');e.st.setItem(e.ctx.pk('perm-version'),'3');
    e.ctx.loadProfileData();e.ctx.loadProfileData();
    const q=JSON.stringify(brut);
    assert.equal(e.st.getItem('ess-cms'),brut,q+' : source refusée conservée après deux chargements');
    assert.equal(e.st.getItem('ess-pm-start-v1'),null,q+' : réglage Fumel non posé');
    assert.equal(e.st.getItem('ess-cms-migrated-v2'),null,q+' : migration CMS non déclarée achevée');
    e.st.setItem('ess-cms',JSON.stringify([{nom:'Agen'}]));e.ctx.loadProfileData();
    assert.deepEqual(JSON.parse(e.st.getItem('ess-cms')).map(c=>c.nom),['Agen','Fumel'],q+' : fusion complète après réparation');
    assert.equal(JSON.parse(e.st.getItem('ess-cms'))[1].debutApresMidi,'14:00',q+' : réglage Fumel posé après réparation');
    assert.equal(e.st.getItem('ess-pm-start-v1'),'"1"');assert.equal(e.st.getItem('ess-cms-migrated-v2'),'1');
  }
  // 9e vérification de Codex : catalogue personnalisé valide, réglage Fumel à faire, lecture du catalogue refusée une fois
  // au chargement — marqueur CMS ancien ou posé par ce chargement → rien perdu, Fumel réglé au chargement suivant
  for(const marqueur of ['ancien','posé ici']){
    let suspendu=0;
    for(let visee=1;visee<=6;visee++){   // la panne vise tour à tour chacune des 6 premières lectures d'ess-cms
      const e=charger();const perso=[{nom:'Agen',adresse:'1 rue fictive'},{nom:'Fumel'}];const cas=marqueur+', lecture '+visee;
      e.st.setItem('ess-cms',JSON.stringify(perso));
      if(marqueur==='ancien')e.st.setItem('ess-cms-migrated-v2','1');
      e.st.setItem('ess-tpl-version','"v5-lapin-templates"');e.st.setItem(e.ctx.pk('perm-version'),'3');
      let n=0;e.st.lecturePanne=k=>k==='ess-cms'&&++n===visee;
      e.ctx.loadProfileData();e.st.lecturePanne=null;
      const lu=JSON.parse(e.st.getItem('ess-cms'));
      assert.equal(lu.length,2,cas+' : catalogue personnalisé conservé (pas remplacé par le repli)');assert.equal(lu[0].adresse,'1 rue fictive',cas+' : personnalisation conservée');
      if(e.st.getItem('ess-pm-start-v1')===null)suspendu++;
      else assert.equal(lu.find(c=>c.nom==='Fumel').debutApresMidi,'14:00',cas+' : réglage posé sur le vrai catalogue');
      e.ctx.loadProfileData();
      const fin=JSON.parse(e.st.getItem('ess-cms'));
      assert.equal(fin[0].adresse,'1 rue fictive',cas+' : personnalisation conservée après reprise');
      assert.equal(fin.find(c=>c.nom==='Fumel').debutApresMidi,'14:00',cas+' : réglage Fumel posé à la reprise');
      assert.equal(e.st.getItem('ess-pm-start-v1'),'"1"',cas);
    }
    assert(suspendu>0,marqueur+' : au moins un refus atteint la lecture stricte et suspend le réglage');
  }
  // migration déjà achevée, catalogue devenu vide ou malformé, Fumel à faire → source conservée, rien posé
  for(const brut of ['','{pas du json']){
    const e=charger();e.st.setItem('ess-cms',brut);e.st.setItem('ess-cms-migrated-v2','1');
    e.st.setItem('ess-tpl-version','"v5-lapin-templates"');e.st.setItem(e.ctx.pk('perm-version'),'3');
    e.ctx.loadProfileData();e.ctx.loadProfileData();
    assert.equal(e.st.getItem('ess-cms'),brut,JSON.stringify(brut)+' : source illisible conservée (marqueur CMS ancien)');
    assert.equal(e.st.getItem('ess-pm-start-v1'),null);
  }
  /* ── P01 (vérification de clôture de Codex) : deux onglets sur le même profil, aucun n'écrase l'autre ── */
  {const A=charger(),B=charger();B.ctx.localStorage=A.st;B.st=A.st;   // B partage le stockage de A (deux onglets)
   for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"'],['ess-p1-perm-version','3']])A.st.setItem(k,v);
   A.ctx.loadProfileData();B.ctx.loadProfileData();
   const fiche=(n)=>({date:'2026-11-05',heure:n==='A'?'09:30':'10:30',commune:'Fumel',nom:'ONGLET'+n,prenom:n});
   assert.equal(A.ctx.addHistory(fiche('A')),true,'P01 : A enregistre');
   assert.equal(A.ctx.lsSet('ess-p1-history',A.S.history),true,'P01 témoin : écritures successives du même onglet sans conflit');
   assert.equal(B.ctx.addHistory(fiche('B')),false,'P01 : B, parti d\'un état ancien, est refusé');
   const stock=()=>JSON.parse(A.st.getItem('ess-p1-history')).map(h=>h.nom).sort().join(',');
   assert.equal(stock(),'ONGLETA','P01 : la fiche de A n\'est pas écrasée');
   assert(B.journal.toasts.some(t=>/autre onglet/.test(t)),'P01 : conflit annoncé');
   assert.equal(B.S.history.map(h=>h.nom).join(','),'ONGLETA','P01 : la mémoire de B suit le stockage');
   assert.equal(B.ctx.addHistory(fiche('B')),true,'P01 : B refait son action');assert.equal(stock(),'ONGLETA,ONGLETB','P01 : les deux fiches sont conservées');
   // réglage commun (catalogue CMS) modifié par A puis par B : même protection
   A.S.cmsList=[{id:1,nom:'Agen'}];assert.equal(A.ctx.lsSet('ess-cms',A.S.cmsList),true);
   B.S.cmsList=[{id:2,nom:'Nérac'}];assert.equal(B.ctx.lsSet('ess-cms',B.S.cmsList),false,'P01 : réglage commun protégé');
   assert.equal(JSON.parse(A.st.getItem('ess-cms'))[0].nom,'Agen');assert.equal(B.S.cmsList[0].nom,'Agen','P01 : mémoire de B réalignée');
   // symétrie : A, désormais en retard sur B, est refusé à son tour, puis réaligné
   assert.equal(A.ctx.addHistory(Object.assign(fiche('A'),{heure:'11:30'})),false,'P01 : A en retard refusé à son tour');
   assert.equal(A.S.history.length,2,'P01 : mémoire de A réalignée sur les deux fiches');}
  /* ── Balayage du chargement (après la 9e vérification de Codex) : aucune donnée illisible au chargement n'est écrasée ── */
  {
    const valeurs={'ess-cms':[{nom:'Agen',adresse:'1 rue fictive'},{nom:'Fumel'}],'ess-demarches':[{id:'d1',nom:'Démarche fictive'}],'ess-secteurs':['Secteur fictif'],
      'ess-templates':{sms:'modèle perso'},'ess-custom-tpl':[{id:'c1'}],'ess-vars':[{nom:'v'}],'ess-hidden':['cle'],'ess-mandats':[{id:'m1'}],
      'ess-p1-history':[rdv('h1','2026-09-01','09:30','HIST','A')],'ess-p1-yearly-stats':{2024:{total:3}},'ess-p1-orientations':[{nom:'ORI'}],
      'ess-p1-permanences':[{commune:'Fumel',jour:1}]};
    const marqueurs={'ess-pm-start-v1':'1','ess-tpl-version':'v5-lapin-templates','ess-p1-perm-version':3};
    const preparer=(faits)=>{const e=charger();
      for(const[k,v]of Object.entries(valeurs))e.st.setItem(k,JSON.stringify(v));
      e.st.setItem('ess-cms-migrated-v2','1');
      if(faits)for(const[k,v]of Object.entries(marqueurs))e.st.setItem(k,JSON.stringify(v));
      return e;};
    const modes={'lecture refusée':null,'chaîne vide':'','JSON malformé':'{pas du json','mauvais type':'T'};
    let cas=0;
    for(const faits of [true,false])for(const cle of Object.keys(valeurs).concat(Object.keys(marqueurs)))for(const[mode,brut]of Object.entries(modes)){
      const estMarqueur=cle in marqueurs;if(estMarqueur&&mode==='mauvais type')continue;   // un marqueur n'a pas de type de liste/objet
      const e=preparer(faits);const nom=(faits?'migrations faites':'migrations à faire')+', '+cle+', '+mode;
      if(brut==='T')e.st.setItem(cle,Array.isArray(valeurs[cle])?'{"a":1}':'[1]');else if(brut!==null)e.st.setItem(cle,brut);
      const avant=e.st.getItem(cle);let n=0;const ecrituresAvant=e.st.ecritures;
      if(brut===null)e.st.lecturePanne=k=>k===cle&&++n===1;   // une seule lecture refusée
      e.ctx.loadProfileData();
      // la panne vise la 1re lecture : pour une clé lue d'abord par la migration CMS (ess-cms), refaire avec la 2e
      e.st.lecturePanne=null;
      if(!estMarqueur||brut!==null)assert.equal(e.st.getItem(cle),avant,nom+' : valeur stockée intacte après chargement');
      if(estMarqueur&&faits)assert.equal(e.st.ecritures,ecrituresAvant,nom+' : marqueur illisible → migration suspendue, aucune écriture (pas d\'écriture puis retour arrière)');
      for(const[k,v]of Object.entries(valeurs))if(k!==cle&&!(k==='ess-cms'&&!faits)&&!(k==='ess-templates'&&!faits)&&!(k==='ess-p1-permanences'&&!faits))
        assert.equal(e.st.getItem(k),JSON.stringify(v),nom+' : '+k+' intact');
      if(!estMarqueur){
        assert.equal(e.ctx.lsSet(cle,Array.isArray(valeurs[cle])?[]:{}),false,nom+' : clé verrouillée, écriture refusée');
        assert.equal(e.st.getItem(cle),avant,nom+' : rien écrit après coup');
        assert(e.journal.toasts.some(t=>/illisibles au chargement/.test(t)),nom+' : message dédié');
        if(brut===null){e.ctx.loadProfileData();
          const ref=preparer(faits);ref.ctx.loadProfileData();   // même départ, chargement sans panne
          assert.equal(e.st.getItem(cle),ref.st.getItem(cle),nom+' : après rétablissement, même résultat qu\'un chargement sans panne');
          assert.equal(e.ctx._clesIllisibles[cle],undefined,nom+' : déverrouillée au chargement réussi suivant');}
      }
      cas++;
    }
    assert(cas>=80,'au moins 80 cas parcourus ('+cas+')');
    // 10e vérification de Codex : choix Fumel « par défaut 13h30 » et modèle intégré personnalisé, marqueurs courants présents
    for(const[marq,cleDonnee]of[['ess-pm-start-v1','ess-cms'],['ess-tpl-version','ess-templates']]){
      const temoin=preparer(true);const w0=temoin.st.ecritures;temoin.ctx.loadProfileData();
      assert.equal(temoin.st.ecritures,w0,marq+' : témoin sans panne, aucune écriture');
      const e=preparer(true);const avant=e.st.getItem(cleDonnee),w1=e.st.ecritures;let n=0;
      e.st.lecturePanne=k=>k===marq&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
      assert.equal(e.st.ecritures,w1,marq+' refusé une fois : aucune écriture');assert.equal(e.st.getItem(cleDonnee),avant,marq+' : réglage ou texte conservé');
      e.ctx.loadProfileData();assert.equal(e.st.getItem(cleDonnee),avant,marq+' : reprise sans perte');
      assert.equal(e.st.ecritures,w1,marq+' : reprise sans écriture (marqueur courant)');}
    // fiche saisie après un chargement où l'historique n'a pas pu être lu : refusée, historique intact
    {const e=preparer(true);let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
     assert.equal(e.S.history.length,0,'mémoire au repli');
     assert.equal(e.ctx.addHistory({date:'2026-11-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'N'}),false,'fiche refusée');
     assert.equal(e.st.getItem('ess-p1-history'),JSON.stringify(valeurs['ess-p1-history']),'historique intact après saisie');assert.equal(e.journal.pushs,0,'aucune sauvegarde automatique');
     e.ctx.loadProfileData();assert.equal(e.S.history.length,1,'historique relu au chargement suivant');
     assert.equal(e.ctx.addHistory({date:'2026-11-05',heure:'09:30',commune:'Fumel',nom:'N',prenom:'N'}),true,'saisie de nouveau possible');
     assert.equal(JSON.parse(e.st.getItem('ess-p1-history')).length,2);}
    // pauses déjeuner : historique illisible → journées non modifiées non plus (écriture groupée)
    {const e=preparer(true);const demain=e.ctx.toLocalDateStr(new Date(Date.now()+864e5*2));
     e.st.setItem('ess-p1-permanences',JSON.stringify([{commune:'Fumel',exceptDate:demain,debut:'09:30',fin:'16:30'}]));
     e.ctx.getSlots=()=>[{heure:'12:30',taken:false}];
     let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
     const perm=e.st.getItem('ess-p1-permanences'),hist=e.st.getItem('ess-p1-history');
     e.ctx.applyLunchBreaks();
     assert.equal(e.st.getItem('ess-p1-history'),hist,'pauses : historique illisible non écrasé');
     assert.equal(e.st.getItem('ess-p1-permanences'),perm,'pauses : journées non marquées sans leur pause');
     e.ctx.loadProfileData();e.ctx.applyLunchBreaks();
     const h=JSON.parse(e.st.getItem('ess-p1-history'));assert.equal(h.length,2,'pause ajoutée au chargement réussi suivant');assert.equal(h[0].id,'h1','historique d\'origine conservé');
     assert.equal(JSON.parse(e.st.getItem('ess-p1-permanences'))[0].pauseAuto,true);}
  }
  // journées et version : refus de l'une ou de l'autre → ni l'une ni l'autre ; migration rejouée ensuite
  for(const refus of ['permanences','perm-version']){
    const e=charger();const ancien=[{commune:'Fumel',jour:1}];e.st.setItem(e.ctx.pk('permanences'),JSON.stringify(ancien));
    e.st.setItem('ess-cms-migrated-v2','1');e.st.setItem('ess-pm-start-v1','"1"');e.st.setItem('ess-tpl-version','"v5-lapin-templates"');
    e.st.panne=k=>k===e.ctx.pk(refus);e.ctx.loadProfileData();
    assert.equal(e.st.getItem(e.ctx.pk('perm-version')),null,refus+' refusé : version non posée');
    assert.equal(e.st.getItem(e.ctx.pk('permanences')),JSON.stringify(ancien),refus+' refusé : ancien modèle intact');
    assert.deepEqual(e.S.permanences,ancien,refus+' refusé : mémoire = stockage');
    e.st.panne=null;e.ctx.loadProfileData();
    assert.equal(e.st.getItem(e.ctx.pk('perm-version')),'3');assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('permanences')))[0].migree,true,refus+' : migration rejouée et enregistrée');
  }
  // modèles et version ; réglage Fumel et son marqueur
  {const e=charger();e.st.setItem('ess-templates',JSON.stringify({sms:'ancien'}));e.st.setItem('ess-cms',JSON.stringify([{nom:'Fumel'}]));e.st.setItem('ess-cms-migrated-v2','1');e.st.setItem(e.ctx.pk('perm-version'),'3');
   e.st.panne=k=>k==='ess-tpl-version'||k==='ess-pm-start-v1';e.ctx.loadProfileData();
   assert.equal(e.st.getItem('ess-templates'),JSON.stringify({sms:'ancien'}),'version refusée : modèles d\'avant conservés');assert.equal(e.st.getItem('ess-tpl-version'),null);
   assert.equal(e.S.templates.sms,'ancien','mémoire = stockage');
   assert.equal(JSON.parse(e.st.getItem('ess-cms'))[0].debutApresMidi,undefined,'marqueur Fumel refusé : réglage non écrit');assert.equal(e.S.cmsList[0].debutApresMidi,undefined);
   e.st.panne=null;e.ctx.loadProfileData();
   assert.equal(e.st.getItem('ess-tpl-version'),'"v5-lapin-templates"');assert.equal(JSON.parse(e.st.getItem('ess-templates')).sms,'défaut v5');
   assert.equal(JSON.parse(e.st.getItem('ess-cms'))[0].debutApresMidi,'14:00');assert.equal(e.st.getItem('ess-pm-start-v1'),'"1"');}

  /* ── 5e vérification de Codex : handleGenerate (véritable appelant) n'annonce jamais un succès après une opération annulée ── */
  {const e=charger();e.ctx.handleGenerate();   // garde : succès normal
   assert.equal(e.S.history.length,1);assert(e.journal.toasts.some(m=>/généré et enregistré/.test(m)),'succès affiché quand tout est enregistré');}
  for(const variante of ['lecture','since-export']){
    const e=charger();const avant=e.st.etat();let n=0;
    if(variante==='lecture')e.st.lecturePanne=k=>k===e.ctx.pk('history')&&++n===1;
    else e.st.panne=k=>k===e.ctx.pk('since-export');
    e.ctx.handleGenerate();e.st.lecturePanne=null;e.st.panne=null;
    assert.equal(e.S.history.length,0,variante+' : aucune fiche');assert.equal(e.st.etat(),avant,variante+' : rien enregistré');assert.equal(e.journal.pushs,0);
    assert(!e.journal.toasts.some(m=>/généré et enregistré/.test(m)),variante+' : pas de faux succès');
    assert(e.journal.toasts.some(m=>/NON enregistré/.test(m)),variante+' : échec annoncé');
  }

  console.log('Migrations du chargement (marqueur avec ses données) et handleGenerate OK.');
  console.log('Écritures sûres : lsSet, ecrireTout (lecture préalable, retour arrière vérifié), persist, writeProfileHistory et appelants, archivage, import JSON (éléments, réglages, panne à chaque écriture), restaurations (profil figé), planning et ICS avec le vrai addHistory OK.');
})().catch(e=>{console.error(e);process.exit(1);});
