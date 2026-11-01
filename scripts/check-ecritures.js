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
  section('function ls(k,d){','\n'),section('function parisDayStr(','function cmsKey('),section('function cmsKey(','\n'),section('function toLocalDateStr(d){','\n'),
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
  fonction('nouvelIdFiche'),fonction('addHistory'),fonction('addHistoryBrut'),fonction('blockSlot'),fonction('blockSlotBrut'),fonction('hasConflict'),fonction('occupantCreneau'),fonction('confirmerCreneau'),section('var STATUTS=[','/* Amendement de Codex sur AG-006'),
  fonction('readProfileOrientations'),fonction('confirmOrientImport'),fonction('enregistrerDeplacement'),fonction('enregistrerCopie'),fonction('ensureDayOpenFor'),fonction('blockWholeDay'),
  fonction('preparationDayUTC'),fonction('receptionDateFor'),fonction('etatReception'),fonction('receptionChampInitial'),fonction('sourceReception'),fonction('receptionAEcrire'),fonction('enregistrerReception'),fonction('openHistInGen'),
  section('function getPermanence(','/* RDV confirmé dont la date est passée'),
  fonction('lunchBreakEntry'),
  section('/* Amendement Codex (31/10) : import ICS en tout ou rien','/* AG-013, étape 2 : même RDV'),
  section('/* AG-013, étape 2 : même RDV','function importPlanningJson('),
  fonction('archiveOldDaysCore'),fonction('identiteMandat'),fonction('numeroMandatValable'),fonction('generateMandatNum'),  fonction('handleGenerate'),fonction('lireListeStockee'),fonction('copyBody'),fonction('empreinteDossier'),fonction('figerChampsCopie'),fonction('findHistIdx'),fonction('migrateSharedCmsList'),
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
    controleAvantPurge:()=>[],nonPointesCohorte:()=>({attente:0,aPointer:0,aVerifier:0}),marquerNonReconciliees:(h)=>({history:h,marquees:0}),   /* AG-017 : testés pour de vrai dans check-archives.js */
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
{const e=charger();const n=e.ctx.reglagesAPersister('x').length;assert.equal(n,9,'8 réglages + favoris des démarches (P06)');
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
// T11 (vérification de clôture de Codex) : historique purgé écrit, relecture refusée, restauration refusée → message d'incohérence, jamais « aucune donnée supprimée »
{const e=prepArchive();const H=e.ctx.pk('history');let relu=0,ecrit=0;
 e.st.lecturePanne=k=>k===H&&e.st.ecritures>=2&&++relu===1;   // relecture de l'historique purgé refusée
 const set0=e.st.setItem;e.st.setItem=(k,v)=>{if(k===H&&++ecrit===2)throw new Error('QuotaExceededError');return set0(k,v);};   // sa restauration refusée
 e.ctx.archiveYear(2025);e.st.lecturePanne=null;e.st.setItem=set0;
 assert(e.journal.toasts.some(t=>/retour en arrière incomplet/.test(t)),'T11 : incohérence annoncée');
 assert(!e.journal.toasts.some(t=>/aucune donnée supprimée/.test(t)),'T11 : pas de fausse assurance');
 assert.equal(e.S.history.length,JSON.parse(e.st.getItem(H)).length,'T11 : mémoire = stockage');}
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

/* ── AG-022 : réception — une modification sans rapport ne confirme ni ne vide rien ; confirmation explicite seule ; panne = rien ── */
{const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
 const prepH=(extra)=>{const e=charger();e.S.history=[Object.assign(rdv('h1','2026-10-20','09:30','FICTIF','Reprise'),{dateDemande:'2026-10-24',body:'b',notes:'',premierePreparationAt:'2026-10-03T08:00:00+02:00'},extra||{})];
   e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));return e;};
 const ouvrir=(e)=>{const h=e.S.history[0];Object.assign(e.S,{editHistIdx:0,editHistBody:h.body||'',editHistNotes:h.notes||'',editHistDateDemande:h.dateDemande||'',editHistDateReception:e.ctx.receptionChampInitial(h),editHistReceptionInit:e.ctx.receptionChampInitial(h),editHistReprise:e.ctx.etatReception(h).reprise,editHistTel:h.telephone||''});};
 // reprise : champ non prérempli, modification des notes seule → aucune réception écrite
 {const e=prepH();ouvrir(e);assert.equal(e.S.editHistDateReception,'','reprise jamais préremplie');assert.equal(e.S.editHistReprise,'2026-10-24');
  e.S.editHistNotes='note sans rapport';assert.equal(e.ctx.saveHistItem(0),true);
  const f=JSON.parse(e.st.getItem(e.ctx.pk('history')))[0];assert.equal(own(f,'dateReception'),false,'notes seules : réception non confirmée');assert.equal(f.notes,'note sans rapport');
  assert.equal(e.ctx.etatReception(f).etat,'reprise');assert.equal(f.premierePreparationAt,'2026-10-03T08:00:00+02:00');}
 // confirmation explicite (bouton « Confirmer cette date » = champ rempli avec la reprise)
 {const e=prepH();ouvrir(e);e.S.editHistDateReception=e.S.editHistReprise;assert.equal(e.ctx.saveHistItem(0),true);
  const f=JSON.parse(e.st.getItem(e.ctx.pk('history')))[0];assert.equal(f.dateReception,'2026-10-24');assert.equal(e.ctx.etatReception(f).etat,'enregistree');
  assert.equal(f.dateDemande,'2026-10-24','date du message inchangée');assert.equal(f.premierePreparationAt,'2026-10-03T08:00:00+02:00','première préparation inchangée');assert.equal(own(f,'premierePreparationAt'),true);}
 // autre date saisie
 {const e=prepH();ouvrir(e);e.S.editHistDateReception='2026-10-05';e.ctx.saveHistItem(0);assert.equal(e.S.history[0].dateReception,'2026-10-05');}
 // échec d'enregistrement : rien ne change, l'édition reste ouverte
 {const e=prepH();ouvrir(e);e.S.editHistDateReception=e.S.editHistReprise;const avant=e.st.etat(),ref=e.S.history[0];e.st.panne=()=>true;
  assert.equal(e.ctx.saveHistItem(0),false);assert.equal(e.st.etat(),avant,'stockage inchangé');assert.equal(JSON.stringify(e.S.history[0]),JSON.stringify(ref),'fiche en mémoire inchangée (réalignée sur le stockage)');
  assert.equal(own(e.S.history[0],'dateReception'),false);assert.equal(e.S.editHistIdx,0,'édition gardée ouverte');}
 // réception explicitement vide / invalide : champ intact = valeur d'origine conservée
 {const e=prepH({dateReception:''});ouvrir(e);e.S.editHistNotes='x';e.ctx.saveHistItem(0);assert.equal(e.S.history[0].dateReception,'');assert.equal(e.ctx.etatReception(e.S.history[0]).etat,'absente');}
 {const e=prepH({dateReception:'xx'});ouvrir(e);assert.equal(e.S.editHistReprise,'','invalide : pas de reprise proposée');e.S.editHistNotes='x';e.ctx.saveHistItem(0);
  assert.equal(e.S.history[0].dateReception,'xx','valeur illisible non normalisée');assert.equal(e.ctx.etatReception(e.S.history[0]).invalide,true);}
 // réception enregistrée effacée volontairement : écrite vide
 {const e=prepH({dateReception:'2026-10-23'});ouvrir(e);assert.equal(e.S.editHistDateReception,'2026-10-23');e.S.editHistDateReception='';e.ctx.saveHistItem(0);assert.equal(e.S.history[0].dateReception,'');}
 // enregistrerReception (listes du délai d'attente) : succès, panne, date invalide, fiche introuvable
 {const e=prepH(),h=e.S.history[0];assert.equal(e.ctx.enregistrerReception(h,'2026-10-24').ok,true);assert.equal(e.S.history[0].dateReception,'2026-10-24');
  assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history')))[0].dateReception,'2026-10-24');assert.equal(e.S.history[0].premierePreparationAt,'2026-10-03T08:00:00+02:00');}
 {const e=prepH(),h=e.S.history[0],avant=e.st.etat();e.st.panne=()=>true;const r=e.ctx.enregistrerReception(h,'2026-10-24');
  assert.equal(r.ok,false);assert.equal(e.st.etat(),avant);assert.equal(JSON.stringify(e.S.history[0]),JSON.stringify(h));assert.equal(own(e.S.history[0],'dateReception'),false,'panne : fiche toujours à confirmer');}
 {const e=prepH(),h=e.S.history[0];assert.equal(e.ctx.enregistrerReception(h,'2026-02-30').ok,false);assert.equal(e.ctx.enregistrerReception(h,'').ok,false);
  assert.equal(e.ctx.enregistrerReception(Object.assign({},h),'2026-10-24').ok,false,'copie hors historique : refusée');assert.equal(own(e.S.history[0],'dateReception'),false);}
 // copie d'un message ouvert depuis l'Historique sur une fiche reprise : ni confirmation implicite ni « vide » posé
 const prepC=(S2)=>{const e=charger();Object.assign(e.S,{date:'2026-10-20',heure:'09:30',commune:'Fumel',nom:'FICTIF',prenom:'Reprise',dateDemande:'2026-10-24',selectedCMS:1,channel:'sms',msgType:'confirmation'},S2);
   e.S.history=[Object.assign(rdv('c1','2026-10-20','09:30','FICTIF','Reprise'),{dateDemande:'2026-10-24',body:'ancien'})];e.S.permanences=[];
   e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),'[]');return e;};
 {const e=prepC({dateReception:'',receptionReprise:'2026-10-24'});assert.equal(e.ctx.enregistrerCopie('nouveau').ok,true);
  const f=e.S.history.find(h=>h.id==='c1');assert.equal(f.body,'nouveau');assert.equal(own(f,'dateReception'),false,'copie sans confirmation : reprise intacte');}
 {const e=prepC({dateReception:'2026-10-24',receptionReprise:'2026-10-24'});assert.equal(e.ctx.enregistrerCopie('nouveau').ok,true);
  assert.equal(e.S.history.find(h=>h.id==='c1').dateReception,'2026-10-24','confirmation explicite enregistrée avec la copie');}
 {const e=prepC({dateReception:'2026-10-24',receptionReprise:'2026-10-24'});assert.equal(e.ctx.enregistrerCopie('ancien').ok,true);   /* même texte : pas de nouvelle fiche, la confirmation passe quand même */
  assert.equal(e.S.history.find(h=>h.id==='c1').dateReception,'2026-10-24');}
 {const e=prepC({dateReception:'',receptionReprise:''});assert.equal(e.ctx.enregistrerCopie('nouveau').ok,true);
  assert.equal(own(e.S.history.find(h=>h.id==='c1'),'dateReception'),false,'formulaire vide sur une fiche sans réception : rien posé');}
 {const e=prepC({dateReception:'',receptionReprise:''});e.S.history=[];e.st.setItem(e.ctx.pk('history'),'[]');assert.equal(e.ctx.enregistrerCopie('nouveau').ok,true);
  assert.equal(e.S.history[0].dateReception,'','nouvelle fiche : réception vide explicite, comme avant');}
 {const e=prepC({dateReception:'',receptionReprise:'2026-10-24'});e.S.history=[];e.st.setItem(e.ctx.pk('history'),'[]');assert.equal(e.ctx.enregistrerCopie('nouveau').ok,true);
  assert.equal(own(e.S.history[0],'dateReception'),false,'reprise non confirmée copiée vers une nouvelle fiche : toujours à confirmer');assert.equal(e.ctx.etatReception(e.S.history[0]).etat,'reprise');}
 /* Amendement de Codex (R1/R2, 01/11/2026) : fiche ouverte par le vrai openHistInGen, champ Réception non touché.
    R1 : « Générer » ; R2 : copie avec réception invalide, nouveau texte et texte identique sur une fiche plus ancienne. */
 const prepO=(extra,avant)=>{const e=charger();e.ctx.showActivePane=()=>{};if(typeof e.ctx.jourParis!=='function')e.ctx.jourParis=()=>'2026-11-01';
   const f=Object.assign(rdv('o1','2026-10-20','09:30','FICTIF','Ouverte'),{selectedCMS:'1',dateDemande:'2026-10-23',body:'ancien',premierePreparationAt:'2026-10-02T08:00:00+02:00',statut:'confirme'},extra);
   e.S.history=(avant||[]).concat([f]);e.S.permanences=[];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),'[]');
   e.ctx.openHistInGen(e.S.history.find(h=>h.id==='o1'));return e;};
 const o1=e=>e.S.history.find(h=>h.id==='o1');
 // R1 : reprise, « Générer » sans toucher la réception → reprise intacte, préparation lisible comme avant
 {const e=prepO();assert.equal(e.S.dateReception,'','reprise jamais préremplie');assert.equal(e.S.receptionReprise,'2026-10-23');
  assert.equal(e.ctx.receptionDateFor(o1(e)),'2026-10-23');e.ctx.handleGenerate();const f=o1(e);
  assert.equal(own(f,'dateReception'),false,'R1 : aucune réception vide posée');assert.equal(e.ctx.etatReception(f).etat,'reprise');
  assert.equal(e.ctx.receptionDateFor(f),'2026-10-23','R1 : la préparation lit toujours la même date');assert.equal(f.premierePreparationAt,'2026-10-02T08:00:00+02:00');
  assert.equal(own(JSON.parse(e.st.getItem(e.ctx.pk('history'))).find(h=>h.id==='o1'),'dateReception'),false,'R1 : stockage sans réception vide');}
 // R1 : même formulaire, autre jour → nouvelle fiche, reprise toujours à confirmer
 {const e=prepO();e.S.date='2026-10-27';e.ctx.handleGenerate();const n=e.S.history.find(h=>h.date==='2026-10-27');
  assert.ok(n,'nouvelle fiche créée');assert.equal(own(n,'dateReception'),false);assert.equal(e.ctx.etatReception(n).etat,'reprise','R1 : nouvelle fiche à confirmer');
  assert.equal(own(o1(e),'dateReception'),false,'fiche d\'origine intacte');}
 // R1 : confirmation explicite → réception enregistrée
 {const e=prepO();e.S.dateReception=e.S.receptionReprise;e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-23');assert.equal(e.ctx.etatReception(o1(e)).etat,'enregistree');}
 // R1 : réception invalide non touchée → valeur brute conservée ; date saisie → enregistrée
 {const e=prepO({dateReception:'pas une date'});assert.equal(e.S.dateReception,'');e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'pas une date','R1 : invalide non normalisée');}
 {const e=prepO({dateReception:'pas une date'});e.S.dateReception='2026-10-05';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-05');}
 // réception enregistrée : intacte au « Générer », effacée volontairement → vide
 {const e=prepO({dateReception:'2026-10-03'});e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-03');}
 {const e=prepO({dateReception:'2026-10-03'});e.S.dateReception='';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'','effacement explicite écrit');}
 // R2 : copie, réception invalide non touchée, nouveau texte → valeur brute conservée
 {const e=prepO({dateReception:'pas une date'});assert.equal(e.ctx.enregistrerCopie('nouveau texte fictif').ok,true);const f=o1(e);
  assert.equal(f.body,'nouveau texte fictif');assert.equal(f.dateReception,'pas une date','R2 : invalide conservée');assert.equal(e.ctx.etatReception(f).invalide,true);}
 // R2 : texte identique, fiche qui n'est pas la première de l'historique
 {const e=prepO({dateReception:'pas une date'},[Object.assign(rdv('autre','2026-10-21','10:30','AUTRE','Fiche'),{body:'autre'})]);
  assert.notEqual(e.S.history[0].id,'o1');assert.equal(e.ctx.enregistrerCopie('ancien').ok,true);
  assert.equal(o1(e).dateReception,'pas une date','R2 : texte identique, invalide conservée');
  assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).find(h=>h.id==='o1').dateReception,'pas une date');}
 // R2 : reprise non touchée, copie → toujours à confirmer ; puis confirmation → enregistrée
 {const e=prepO();assert.equal(e.ctx.enregistrerCopie('nouveau texte fictif').ok,true);assert.equal(own(o1(e),'dateReception'),false);assert.equal(e.ctx.receptionDateFor(o1(e)),'2026-10-23');}
 {const e=prepO();e.S.dateReception=e.S.receptionReprise;assert.equal(e.ctx.enregistrerCopie('nouveau texte fictif').ok,true);assert.equal(o1(e).dateReception,'2026-10-23');}
 // formulaire neuf (aucune fiche chargée) : comportement inchangé, réception vide explicite
 {const e=charger();e.ctx.showActivePane=()=>{};Object.assign(e.S,{date:'2026-10-28',heure:'09:30',commune:'Fumel',nom:'NEUF',prenom:'F',dateReception:'',receptionReprise:'',receptionSource:null,selectedCMS:1});
  e.ctx.handleGenerate();assert.equal(e.S.history[0].dateReception,'','formulaire neuf : vide explicite, comme avant');}
 /* NR1 (vérification de Codex du correctif) : saisie → enregistrement réussi → effacement → second enregistrement, sans réouverture */
 {const e=prepO();e.S.dateReception='2026-10-03';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-03');
  e.S.dateReception='';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'','NR1 Générer : effacement explicite écrit');
  assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).find(h=>h.id==='o1').dateReception,'');}
 {const e=prepO({dateReception:'pas une date'});e.S.dateReception='2026-10-03';assert.equal(e.ctx.enregistrerCopie('texte fictif 1').ok,true);assert.equal(o1(e).dateReception,'2026-10-03');
  e.S.dateReception='';assert.equal(e.ctx.enregistrerCopie('texte fictif 2').ok,true);assert.equal(o1(e).dateReception,'','NR1 copie : effacement explicite écrit, ancienne valeur invalide non réinjectée');}
 // NR1 croisé : copie puis « Générer », et après le recalage, champ réellement intact → valeur enregistrée conservée
 {const e=prepO();e.S.dateReception='2026-10-03';assert.equal(e.ctx.enregistrerCopie('texte fictif 1').ok,true);e.S.dateReception='';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'');}
 {const e=prepO();e.S.dateReception='2026-10-03';e.ctx.handleGenerate();e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-03','intact après recalage : conservée');}
 // NR1 : échec de stockage au premier enregistrement → référence inchangée, la reprise reste protégée
 {const e=prepO();e.S.dateReception='2026-10-03';e.st.panne=()=>true;e.ctx.handleGenerate();e.st.panne=null;
  assert.equal(e.S.receptionSource.aChamp,false,'échec : référence d\'ouverture conservée');assert.equal(e.S.receptionSource.init,'');
  e.S.dateReception='';e.ctx.handleGenerate();assert.equal(own(o1(e),'dateReception'),false,'échec puis effacement : reprise toujours à confirmer');}
 {const e=prepO({dateReception:'pas une date'});e.S.dateReception='2026-10-03';e.st.panne=()=>true;assert.equal(e.ctx.enregistrerCopie('texte fictif 1').ok,false);e.st.panne=null;
  assert.equal(e.S.receptionSource.brut,'pas une date','échec de copie : référence inchangée');}
 // NR1 : panne au second écrit de la copie (réception déjà écrite, message refusé) → opération annulée, référence inchangée
 {const e=prepO({dateReception:'pas une date'});e.S.dateReception='2026-10-03';const n0=e.st.ecritures;e.st.panne=(k,n)=>n===n0+2;
  assert.equal(e.ctx.enregistrerCopie('texte fictif 1').ok,false);e.st.panne=null;assert.equal(e.S.receptionSource.brut,'pas une date','panne partielle : pas de recalage');}
 // NR1 : copie du texte identique (seule la réception est écrite), puis effacement
 {const e=prepO();assert.equal(e.S.history[0].id,'o1');e.S.dateReception='2026-10-03';assert.equal(e.ctx.enregistrerCopie('ancien').ok,true);assert.equal(o1(e).dateReception,'2026-10-03');
  e.S.dateReception='';assert.equal(e.ctx.enregistrerCopie('ancien').ok,true);assert.equal(o1(e).dateReception,'','NR1 texte identique : effacement écrit');}
 /* AG-023 : réception saisie avant le 22/10 (dateDemande, champ dateReception absent) — préremplie, jamais écrite sans modification */
 {const e=prepO({dateDemande:'2026-10-05'});assert.equal(e.S.dateReception,'2026-10-05','Générer : préremplie');assert.equal(e.S.receptionReprise,'','aucune mention « à confirmer »');
  e.ctx.handleGenerate();assert.equal(own(o1(e),'dateReception'),false,'Générer intact : rien écrit');assert.equal(e.ctx.etatReception(o1(e)).etat,'ancienne');}
 {const e=prepO({dateDemande:'2026-10-05'});assert.equal(e.ctx.enregistrerCopie('texte fictif').ok,true);assert.equal(own(o1(e),'dateReception'),false,'copie intacte : rien écrit');}
 {const e=prepO({dateDemande:'2026-10-05'});e.S.dateReception='2026-10-07';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'2026-10-07','date modifiée : écrite');}
 {const e=prepO({dateDemande:'2026-10-05'});e.S.dateReception='';e.ctx.handleGenerate();assert.equal(o1(e).dateReception,'','effacement volontaire : écrit');}
 {const e=prepH({dateDemande:'2026-10-05'});ouvrir(e);assert.equal(e.S.editHistDateReception,'2026-10-05','Historique : préremplie');e.S.editHistNotes='x';assert.equal(e.ctx.saveHistItem(0),true);
  assert.equal(own(e.S.history[0],'dateReception'),false,'Historique intact : rien écrit');}
 console.log('AG-022 NR1 : effacement après un enregistrement réussi, sans réouverture (Générer et copie), panne sans recalage OK.');
 console.log('AG-022 R1/R2 : « Générer » et copie depuis une fiche ouverte — reprise, invalide et réception enregistrée conservées si le champ est intact OK.');
 console.log('AG-022 : réception — modification sans rapport neutre, confirmation explicite, panne sans effet, copie sans confirmation implicite OK.');}

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
  /* ── P03 (vérification finale de Codex) : démarche libre modifiée pendant la copie → refus ; champs figés au départ ── */
  {const e=prepCopie();e.S.history=[];e.st.setItem(e.ctx.pk('history'),'[]');Object.assign(e.S,{selectedDemarche:'__autre__',demarcheAutre:'DEMARCHE_A',generatedBody:'Message de A'});
   e.ctx.compute=()=>({dem:{nom:e.S.selectedDemarche==='__autre__'?e.S.demarcheAutre:'X'},body:'x'});
   let fin;e.ctx.doCopy=()=>new Promise(r=>{fin=r;});e.ctx.compactSmsText=t=>t;e.ctx.updatePreviewOnly=()=>{};e.ctx.flashCopied=()=>{};
   e.ctx.copyBody();e.S.demarcheAutre='DEMARCHE_B';fin(true);await new Promise(r=>setTimeout(r,0));
   assert.equal(JSON.parse(e.st.getItem('ess-p1-history')).length,0,'P03 : démarche libre changée pendant la copie → rien enregistré');
   assert(e.journal.toasts.some(t=>/dossier a changé/.test(t)));
   // l'enregistrement lui-même ne relit plus le formulaire : champs figés avant, formulaire modifié après
   const f=prepCopie();f.S.history=[];f.st.setItem(f.ctx.pk('history'),'[]');Object.assign(f.S,{selectedDemarche:'__autre__',demarcheAutre:'DEMARCHE_A'});
   f.ctx.compute=()=>({dem:{nom:f.S.selectedDemarche==='__autre__'?f.S.demarcheAutre:'X'},body:'x'});
   const fige=f.ctx.figerChampsCopie();Object.assign(f.S,{demarcheAutre:'DEMARCHE_B',nom:'AUTRE',prenom:'Z'});
   assert.equal(f.ctx.enregistrerCopie('Message de A',fige).ok,true);
   const h=JSON.parse(f.st.getItem('ess-p1-history'))[0];assert.equal(h.demarche,'DEMARCHE_A','P03 : démarche figée');assert.equal(h.nom,'COPIE','P03 : nom figé');}
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
    vm.runInContext(section('var _couvert={};','function githubPush(')+fonction('exportDataForProfile')+fonction('sauvegardeFiable')+fonction('exportData')+fonction('downloadExport'),e.ctx);   // vraies fonctions, extraites du fichier
    const push=vm.runInContext('('+fonction('githubPush')+')',e.ctx);
    Object.assign(e.ctx,{ghToken:()=>'jeton-fictif',ghNowFile:()=>'b/p1/fictif.json',ghCleanOldBackups(){},renderHeader(){},btoa:x=>Buffer.from(x,'binary').toString('base64'),unescape,encodeURIComponent});
    const res={puts:0,envoye:null,finPut:null,fins:[]};
    e.ctx.fetch=(url,opt)=>{if(opt&&opt.method==='PUT'){res.puts++;res.envoye=JSON.parse(decodeURIComponent(escape(Buffer.from(JSON.parse(opt.body).content,'base64').toString('binary'))));return new Promise(r=>{res.finPut=()=>r({ok:true});res.fins.push(res.finPut);});}return Promise.resolve({ok:false});};
    Object.assign(e.ctx,{Blob:function(){},URL:{createObjectURL:()=>'x',revokeObjectURL(){}},document:{createElement:()=>({click(){}})}});
    return {e,push,res};}
  const tours=async()=>{for(let i=0;i<5;i++)await new Promise(r=>setTimeout(r,0));};
  {const {e,push,res}=prepPush();e.st.setItem('ess-p1-since-export','1');
   push(true);await tours();assert.equal(res.puts,1);assert.equal(res.envoye.history.length,1);
   e.st.setItem('ess-p1-since-export','2');   // une fiche ajoutée pendant l'envoi
   res.finPut();await tours();
   assert.equal(e.st.getItem('ess-p1-since-export'),'1','P08 : la fiche ajoutée pendant l\'envoi reste comptée');
   push(true);await tours();res.finPut();await tours();assert.equal(e.st.getItem('ess-p1-since-export'),'0','P08 témoin : tout envoyé → 0');}
  // P08 (vérification finale de Codex) : deux sauvegardes chevauchantes, dans les deux ordres d'arrivée des réponses
  for(const ordre of ['A puis B','B puis A']){
    const {e,push,res}=prepPush();const since=(v)=>e.st.setItem('ess-p1-since-export',String(v));const lire=()=>e.st.getItem('ess-p1-since-export');
    since(1);push(true);await tours();since(2);push(true);await tours();assert.equal(res.fins.length,2,'deux envois en vol');
    const [finA,finB]=res.fins;
    if(ordre==='A puis B'){finA();await tours();since(parseInt(lire(),10)+1);finB();await tours();assert.equal(lire(),'1','P08 chevauchement '+ordre+' : seule la fiche ajoutée entre les deux réponses reste comptée');}
    else{finB();await tours();assert.equal(lire(),'0','P08 '+ordre+' : B couvre tout');finA();await tours();assert.equal(lire(),'0','P08 '+ordre+' : A, plus ancienne, ne retire rien de plus');}
  }
  // P08 : export local pendant un envoi, puis ajout, puis réponse → la fiche ajoutée reste comptée
  {const {e,push,res}=prepPush();e.st.setItem('ess-p1-since-export','1');push(true);await tours();
   e.ctx.downloadExport();assert.equal(e.st.getItem('ess-p1-since-export'),'0','P08 : export remet à zéro');
   e.st.setItem('ess-p1-since-export','1');res.finPut();await tours();
   assert.equal(e.st.getItem('ess-p1-since-export'),'1','P08 : export puis ajout pendant un envoi → la fiche ajoutée reste comptée');}
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
  /* ── T02 : écriture des pauses refusée dès la lecture préalable → mémoire inchangée, échec propagé ── */
  {const e=charger();for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"'],['ess-p1-perm-version','3']])e.st.setItem(k,v);
   const demain=e.ctx.toLocalDateStr(new Date(Date.now()+864e5*2));
   e.st.setItem('ess-p1-permanences',JSON.stringify([{commune:'Fumel',exceptDate:demain,debut:'09:30',fin:'16:30',pauseAuto:true}]));
   e.ctx.loadProfileData();e.S.permanences=[{commune:'Fumel',exceptDate:demain,debut:'09:30',fin:'16:30'}];e.st.setItem('ess-p1-permanences',JSON.stringify(e.S.permanences));e.ctx._versionLue['ess-p1-permanences']=e.st.getItem('ess-p1-permanences');
   e.ctx.getSlots=()=>[{heure:'12:30',taken:false}];const avant=e.st.etat(),echecs=e.ctx._echecsEcriture;
   let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;
   assert.equal(e.ctx.applyLunchBreaks(),false,'T02 : échec annoncé');e.st.lecturePanne=null;
   assert.equal(e.S.history.length,0,'T02 : aucune pause fantôme en mémoire');assert.equal(e.S.permanences[0].pauseAuto,undefined,'T02 : journée non marquée en mémoire');
   assert.equal(e.st.etat(),avant,'T02 : stockage inchangé');assert(e.ctx._echecsEcriture>echecs,'T02 : échec compté (propagé)');
   assert.equal(e.ctx.applyLunchBreaks(),true,'T02 témoin');assert.equal(e.S.history.length,1);assert.equal(JSON.parse(e.st.getItem('ess-p1-history')).length,1);}
  /* ── T01 : historique non lu → pas de migration des journées ni d'archivage automatique d'après un repli vide ── */
  {const e=charger();for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"']])e.st.setItem(k,v);
   const ancien=[{commune:'Fumel',jour:1}];e.st.setItem('ess-p1-permanences',JSON.stringify(ancien));e.st.setItem('ess-p1-history',JSON.stringify([rdv('h1','2026-09-01','09:30','HIST','A')]));
   let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
   assert.equal(e.st.getItem('ess-p1-perm-version'),null,'T01 : migration des journées suspendue');assert.equal(e.st.getItem('ess-p1-permanences'),JSON.stringify(ancien),'T01 : journées intactes');
   e.ctx.loadProfileData();assert.equal(e.st.getItem('ess-p1-perm-version'),'3','T01 : migration faite au chargement réussi suivant');}
  {const e=charger();for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"'],['ess-p1-perm-version','3']])e.st.setItem(k,v);
   const vieux='2026-01-15',perms=[{commune:'Fumel',exceptDate:vieux}];e.st.setItem('ess-p1-permanences',JSON.stringify(perms));
   e.st.setItem('ess-p1-history',JSON.stringify([rdv('h1',vieux,'09:30','APOINTER','A','Fumel','en_attente')]));
   let n=0;e.st.lecturePanne=k=>k==='ess-p1-history'&&++n===1;e.ctx.loadProfileData();e.st.lecturePanne=null;
   assert.equal(e.ctx.archiveOldDaysCore(true),0,'T01 : pas d\'archivage d\'après un historique non lu');assert.equal(e.st.getItem('ess-p1-permanences'),JSON.stringify(perms));
   e.ctx.loadProfileData();assert.equal(e.ctx.archiveOldDaysCore(true),0,'T01 témoin : journée avec RDV en attente jamais archivée');}
  /* ── P06 : favoris des démarches enregistrés et relus ── */
  {const e=charger();e.st.setItem('ess-cms-migrated-v2','1');e.ctx.loadProfileData();
   e.S.favDemarches=['d1','d3'];assert.equal(e.ctx.persist(),true);
   const f=charger();f.ctx.localStorage=e.st;f.st=e.st;f.ctx.loadProfileData();
   assert.deepEqual([...f.S.favDemarches],['d1','d3'],'P06 : favoris retrouvés dans une nouvelle instance');}
  /* ── P07 : changer de bénéficiaire alloue un nouveau numéro ── */
  {const e=charger();Object.assign(e.S,{mandatPrenom:'Alice',mandatNom:'FICTIF',mandatNum:''});
   const allouer=()=>{if(!e.ctx.numeroMandatValable()){e.S.mandatNum=e.ctx.generateMandatNum();e.S.mandatNumPour=e.ctx.identiteMandat();}return e.S.mandatNum;};
   const n1=allouer();assert.equal(allouer(),n1,'P07 témoin : même bénéficiaire, même numéro');
   Object.assign(e.S,{mandatPrenom:'Bruno',mandatNom:'AUTRE'});const n2=allouer();
   assert.notEqual(n2,n1,'P07 : autre bénéficiaire, autre numéro');assert.equal(e.st.getItem('ess-mandat-counter'),'2','P07 : compteur avancé deux fois');
   assert(/if\(!numeroMandatValable\(\)\)\{S\.mandatNum=generateMandatNum\(\);S\.mandatNumPour=identiteMandat\(\);\}/.test(fonction('generateMandatDocx')),'P07 : la génération du document utilise ce contrôle');}
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
  /* ── R1 / R2 (vérification des corrections de Codex, 01/11) : conflit entre onglets ── */
  function deuxOnglets(){const A=charger(),B=charger();B.ctx.localStorage=A.st;B.st=A.st;
    for(const[k,v]of[['ess-cms-migrated-v2','1'],['ess-pm-start-v1','"1"'],['ess-tpl-version','"v5-lapin-templates"'],['ess-p1-perm-version','3']])A.st.setItem(k,v);
    A.ctx.loadProfileData();B.ctx.loadProfileData();return {A,B};}
  const ficheR=(n,h)=>({date:'2026-11-05',heure:h,commune:'Fumel',nom:'ONGLET'+n,prenom:n});
  // R1 : A écrit ENTRE l'instantané de B et sa première écriture → le retour arrière de B ne doit pas effacer A
  for(const action of ['addHistory','ecrireTout']){
    const {A,B}=deuxOnglets();let enB=false,lectures=0,fait=false,okA=null;
    A.st.lecturePanne=k=>{if(enB&&!fait&&k==='ess-p1-history'&&++lectures===2){fait=true;enB=false;okA=A.ctx.addHistory(ficheR('A','09:30'));enB=true;}return false;};
    enB=true;
    const r=action==='addHistory'?B.ctx.addHistory(ficheR('B','10:30')):B.ctx.ecrireTout([['ess-p1-history',[ficheR('B','10:30')]],['ess-p1-orientations',[]]]);
    enB=false;A.st.lecturePanne=null;
    assert(fait,'R1 '+action+' : A a bien écrit entre l\'instantané et la première écriture de B');assert.equal(okA,true,'R1 '+action+' : l\'écriture de A a réussi');
    assert.equal(r,false,'R1 '+action+' : B est refusé');
    const noms=JSON.parse(A.st.getItem('ess-p1-history')||'[]').map(h=>h.nom);
    assert(noms.includes('ONGLETA'),'R1 '+action+' : la fiche de A n\'est PAS effacée par le retour arrière de B ('+noms+')');
    assert(B.S.history.some(h=>h.nom==='ONGLETA'),'R1 '+action+' : la mémoire de B suit le stockage');
    if(action==='addHistory'){
      const r2=B.ctx.addHistory(ficheR('B','10:30'));assert.equal(r2,true,'R1 '+action+' : reprise réussie');
      assert.deepEqual(JSON.parse(A.st.getItem('ess-p1-history')).map(h=>h.nom).filter(n=>n!=='Pause déjeuner').sort(),['ONGLETA','ONGLETB'],'R1 : A et B conservés après la reprise');}
  }
  // R1 (vérification de Codex, 2e) : compteur d'export — A ajoute entre l'instantané et le premier contrôle de B ; B refusé ne remet pas le compteur de A à 0
  {const {A,B}=deuxOnglets();let enB=false,n=0,fait=false;
   A.st.lecturePanne=k=>{if(enB&&!fait&&k==='ess-p1-history'&&++n===2){fait=true;enB=false;A.ctx.addHistory(ficheR('A','09:30'));enB=true;}return false;};
   enB=true;const r=B.ctx.addHistory(ficheR('B','10:30'));enB=false;A.st.lecturePanne=null;
   assert(fait&&r===false,'R1 compteur : conflit provoqué');assert.equal(A.st.getItem('ess-p1-since-export'),'1','R1 compteur : le compteur de A n\'est pas remis à 0 par le retour arrière de B');}
  // R1 (vérification de Codex, 3e) : ancienne tentative — B avait écrit un historique vide, A y ajoute X puis le VIDE entre l'instantané et la première écriture de B : l'état vidé par A ne ressuscite pas X
  for(const action of ['addHistory','ecrireTout']){
   const {A,B}=deuxOnglets();
   assert.equal(B.ctx.lsSet('ess-p1-history',[]),true);                                   // B a déjà écrit « vide » (ancienne tentative)
   A.ctx.loadProfileData();assert.equal(A.ctx.addHistory(ficheR('X','09:30')),true);B.ctx.loadProfileData();   // A repart de l'état de B, ajoute X, B le recharge
   let enB=false,n=0,fait=false;
   A.st.lecturePanne=k=>{if(enB&&!fait&&k==='ess-p1-history'&&++n===2){fait=true;enB=false;A.ctx.lsSet('ess-p1-history',[]);enB=true;}return false;};   // A vide l'historique pendant l'opération de B
   enB=true;const r=action==='addHistory'?B.ctx.addHistory(ficheR('Y','10:30')):B.ctx.ecrireTout([['ess-p1-history',[ficheR('Y','10:30')]],['ess-p1-orientations',[]]]);enB=false;A.st.lecturePanne=null;
   assert(fait&&r===false,'R1 ancienne tentative '+action+' : conflit provoqué');
   assert.equal(A.st.getItem('ess-p1-history'),'[]','R1 ancienne tentative '+action+' : l\'historique vidé par A n\'est pas reconstitué par le retour arrière de B (X ressuscité)');}
  // R2 (vérification de Codex) : conflit puis lecture de réalignement refusée → mémoire peut différer du stockage : panne, sauvegarde auto bloquée
  {const {A,B}=deuxOnglets();assert.equal(A.ctx.addHistory(ficheR('A','09:30')),true);   // B est en retard
   let n=0;B.st.lecturePanne=k=>k==='ess-p1-history'&&++n===2;                             // 1re lecture : contrôle du conflit ; 2e : réalignement, refusée
   assert.equal(B.ctx.lsSet('ess-p1-history',[]),false);B.st.lecturePanne=null;
   assert.equal(B.ctx._stockageEnEchec,true,'R2 : réalignement incomplet → panne');
   const pushs=B.journal.pushs;B.ctx.maybeAutoBackupProfile('p1');assert.equal(B.journal.pushs,pushs,'R2 : aucune sauvegarde automatique avec une mémoire non réalignée');}
  // R2 (vérification de Codex) : conflit puis retour arrière refusé → état partiel : panne, sauvegarde auto bloquée
  {const {A,B}=deuxOnglets();A.st.setItem('ess-cms',JSON.stringify([{id:9,nom:'Seed'}]));A.ctx.loadProfileData();B.ctx.loadProfileData();   // catalogue présent : son retour arrière est une vraie écriture
   assert.equal(A.ctx.lsSet('ess-demarches',[{id:'d1',nom:'D',documents:[]}]),true);   // B est en retard sur les démarches
   const base=B.st.ecritures;B.st.panne=(k,i)=>k==='ess-cms'&&i>base+1;                       // 1re écriture du CMS acceptée, son retour arrière refusé
   const r=B.ctx.ecrireTout([['ess-cms',[{id:1,nom:'Agen'}]],['ess-demarches',[]]]);B.st.panne=null;
   assert.equal(r,false);assert.equal(B.ctx.ecrireTout.incoherent,true,'R2 : retour arrière refusé signalé');
   assert.equal(B.ctx._stockageEnEchec,true,'R2 : état partiel → panne');
   const pushs=B.journal.pushs;B.ctx.maybeAutoBackupProfile('p1');assert.equal(B.journal.pushs,pushs,'R2 : aucune sauvegarde automatique après un retour arrière refusé');
   assert.equal(JSON.parse(A.st.getItem('ess-demarches'))[0].id,'d1','R2 : la démarche de A est intacte');}
  // R1 témoin : sans écriture concurrente, le retour arrière d'une vraie panne est inchangé (couvert par les tests de panne ci-dessus)
  // R2 : après un conflit résolu, les sauvegardes automatiques ne restent pas suspendues
  {const {A,B}=deuxOnglets();
   assert.equal(A.ctx.addHistory(ficheR('A','09:30')),true);
   assert.equal(B.ctx.addHistory(ficheR('B','10:30')),false,'R2 : conflit');
   assert.equal(B.ctx._stockageEnEchec,false,'R2 : un conflit n\'est pas une panne de stockage');
   assert.equal(B.ctx.addHistory(ficheR('B','10:30')),true,'R2 : reprise');
   assert.equal(B.ctx._stockageEnEchec,false);assert(B.journal.pushs>=1,'R2 : sauvegarde automatique déclenchée après la reprise ('+B.journal.pushs+')');
   assert.match(B.S.saveStatus,/^Sauvegardé|Modifié dans un autre onglet|Dernière|Données/,'R2 : pas de message « Enregistrement impossible »');}
  // R2 témoin : une vraie panne de stockage suspend toujours les sauvegardes
  {const e=charger();e.st.panne=()=>true;e.ctx.lsSet('ess-p1-history',[]);assert.equal(e.ctx._stockageEnEchec,true,'R2 témoin : panne réelle → suspension maintenue');}
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

  /* ── AG-016 D3 et (D) : anti-doublon par cmsKey, identifiant des nouvelles fiches, repli sûr des localisateurs ── */
  {const e=charger();const fiche=(commune,body)=>({channel:'sms',msgType:'confirmation',date:'2026-11-05',heure:'09:30',commune,nom:'FICTIF',prenom:'Ana',body});
   assert.equal(e.ctx.addHistoryBrut(fiche('Fumel','m1'),true),true);
   const id1=e.S.history[0].id,prep1=e.S.history[0].premierePreparationAt;
   assert(typeof id1==='string'&&/^f-/.test(id1),'(D) : nouvelle fiche identifiée');
   assert.equal(e.ctx.addHistoryBrut(fiche('fumel ','m2'),true),true);
   assert.equal(e.S.history.length,1,'D3 : « Fumel » puis « fumel␣ » → une seule fiche');
   assert.equal(e.S.history[0].body,'m2');assert.equal(e.S.history[0].id,id1,'(D) : identifiant conservé à la régénération');
   assert.equal(e.S.history[0].premierePreparationAt,prep1,'D3 : première préparation conservée');
   assert.equal(e.S.history[0].commune,'Fumel','D3 : graphie de la fiche retrouvée conservée');
   assert.equal(e.S.permanences.filter(p=>e.ctx.cmsKey(p.commune)==='fumel'&&p.exceptDate==='2026-11-05').length,1,'D3 : pas de deuxième journée sous une autre graphie');
   assert.equal(e.st.getItem(e.ctx.pk('history')),JSON.stringify(e.S.history),'stockage = mémoire');
   assert.equal(e.ctx.addHistoryBrut(Object.assign(fiche('Fumel','m3'),{prenom:'Bea'}),true),true);
   assert.notEqual(e.S.history[0].id,id1,'(D) : deux fiches, deux identifiants');
   assert.equal(e.ctx.addHistoryBrut(Object.assign(fiche('FUMEL','m4'),{id:'f-intrus'}),true),true);
   assert.equal(e.S.history.find(h=>h.prenom==='Ana').id,id1,'(D) : un identifiant entrant n\'écrase jamais celui de la fiche retrouvée');
   // ancienne fiche sans identifiant : régénérée, elle reste sans identifiant (aucune migration, Q2)
   const anc=rdv(undefined,'2026-11-06','10:30','ANCIEN','Old');delete anc.id;e.S.history.push(anc);
   assert.equal(e.ctx.addHistoryBrut(Object.assign({},anc,{body:'regen',commune:'FUMEL',id:'f-intrus'}),true),true);
   const reg=e.S.history.find(h=>h.nom==='ANCIEN');assert.equal(reg.body,'regen');assert(!('id' in reg),'(D) : pas d\'identifiant donné à une ancienne fiche');
   // planning réimporté : l'identifiant de la fiche retrouvée n'est jamais écrasé
   e.ctx.appliquerPlanning([{date:'2026-11-05',heure:'09:30',commune:'fumel',nom:'fictif',prenom:'ana',statut:'confirme',id:'autre'}]);
   assert.equal(e.S.history.find(h=>String(h.prenom).toLowerCase()==='ana'&&h.heure==='09:30').id,id1,'(D) : planning sans écrasement d\'identifiant');
   // sauvegarde : l'identifiant passe la vérification d'import et survit à l'aller-retour JSON
   assert.equal(e.ctx.verifierSauvegarde({history:JSON.parse(JSON.stringify(e.S.history))}),'');}
  {const e=charger();let n=0;e.ctx.crypto={randomUUID:()=>['x','x','y'][n++]};
   assert.equal(e.ctx.nouvelIdFiche([{id:'f-x'}]),'f-y','(D) : aucune collision avec l\'historique');}
  {const e=charger();const C={date:'2026-11-07',heure:'11:30',commune:'Fumel',nom:'N',prenom:'P'};
   const vieille=Object.assign({},C),autre=Object.assign({},C,{id:'f-autre'}),cherche=Object.assign({},C,{id:'f-perdu'});
   assert.equal(e.ctx.findHistIdx([autre,vieille],cherche),1,'(D) : repli vers l\'unique fiche ancienne');
   assert.equal(e.ctx.findHistIdx([autre],cherche),-1,'(D) : jamais une autre fiche identifiée');
   assert.equal(e.ctx.findHistIdx([vieille,Object.assign({},C)],cherche),-1,'(D) : jamais un candidat ambigu');
   assert.equal(e.ctx.findHistIdx([vieille],Object.assign({},C)),0,'témoin : fiche sans identifiant retrouvée comme avant');}
  // locate de la fenêtre RDV de l'Agenda, extrait tel quel
  {const src=section('  function locate(){','  function update(');let toast=0;
   const fabrique=new Function('t','owner','readProfileHistory','showToast',src+'\nreturn locate;');
   const C={date:'2026-11-07',heure:'11:30',commune:'Fumel',nom:'N',prenom:'P',msgType:'confirmation',channel:'sms',ts:'01/11/2026 10:00:00'};
   const loc=(hist,t)=>fabrique(t,'p1',()=>hist,()=>{toast++;})();
   const vieille=Object.assign({},C),autre=Object.assign({},C,{id:'f-autre'}),copie=Object.assign({},C,{id:'f-perdu'});
   assert.equal(loc([autre,vieille],copie).index,1,'locate : repli vers l\'unique fiche ancienne (vieille sauvegarde restaurée)');
   assert.equal(loc([autre],copie),null,'locate : jamais une autre fiche identifiée');
   assert.equal(loc([vieille,Object.assign({},C)],copie),null,'locate : jamais un candidat ambigu');
   assert.equal(loc([vieille],Object.assign({},C)).index,0,'locate témoin : fiche sans identifiant');
   assert.equal(loc([autre,Object.assign({},C,{id:'f-perdu'})],copie).index,1,'locate : par identifiant');
   assert.equal(toast,2,'« Rouvrez l\'agenda » annoncé quand rien de sûr n\'est trouvé');}
  /* ── 01/11/2026, signalé par l'utilisateur : heure choisie avant le CMS → double réservation sur un simple toast ── */
  {const prep=(rep)=>{const e=charger();const msgs=[];e.ctx.confirm=(m)=>{msgs.push(m);return rep;};
     const occ={id:'f-occ',date:'2026-11-25',heure:'09:30',commune:'Marmande',civilite:'Mme',prenom:'Fictive',nom:'OCCUPANTE',msgType:'proposition',statut:'confirme',channel:'sms'};
     e.S.history=[occ];e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));
     Object.assign(e.S,{date:'2026-11-25',heure:'09:30',commune:'Marmande',selectedCMS:'2',nom:'ESSAI',prenom:'Nouveau',channel:'sms',msgType:'proposition'});
     return {e,msgs};};
   {const {e,msgs}=prep(false);const avant=e.st.getItem(e.ctx.pk('history'));e.ctx.handleGenerate();
    assert.equal(msgs.length,1,'confirmation demandée');assert(/déjà pris par Mme Fictive OCCUPANTE/.test(msgs[0]),'occupant nommé');assert(/25\/11 à 09:30 \(Marmande\)/.test(msgs[0]));
    assert.equal(e.S.history.length,1,'refus : aucune fiche ajoutée');assert.equal(e.st.getItem(e.ctx.pk('history')),avant,'refus : stockage inchangé');}
   {const {e,msgs}=prep(true);e.ctx.handleGenerate();
    assert.equal(msgs.length,1);assert.equal(e.S.history.length,2,'double réservation acceptée : enregistrée');assert(e.S.history.some(h=>h.id==='f-occ'),'occupant conservé');}
   {const {e,msgs}=prep(true);assert.equal(e.ctx.confirmerCreneau('2026-11-25','09:30','Marmande'),true);e.ctx.handleGenerate();
    assert.equal(msgs.length,1,'déjà acceptée au choix du CMS : pas redemandée à la génération');}
   {const {e,msgs}=prep(false);
    assert.equal(e.ctx.confirmerCreneau('2026-11-25','10:30','Marmande'),true,'créneau libre : rien demandé');
    assert.equal(e.ctx.confirmerCreneau('2026-11-25','09:30',''),true,'sans CMS : rien à contrôler encore');
    e.S.history[0].statut='lapin';assert.equal(e.ctx.confirmerCreneau('2026-11-25','09:30','Marmande'),true,'créneau libéré : réutilisable sans question');
    assert.equal(msgs.length,0);}}
  // raccordement de l'écran : choix du CMS et de la date contrôlés quand l'heure est déjà choisie, plus de simple toast
  {const gen=section('function renderGenerate(','\nfunction ');
   assert(/if\(!confirmerCreneau\(S\.date,S\.heure,v\)\)patch\.heure='';/.test(gen),'choix du CMS contrôlé');
   assert(/if\(!confirmerCreneau\(v,S\.heure,S\.commune\)\)patch\.heure='';/.test(gen),'choix de la date contrôlé');
   assert(!/Créneau déjà pris/.test(section('function handleGenerate(','\nfunction ')),'plus de simple toast');
   assert(!/— Choisir —/.test(gen)&&/Choisissez d’abord la date et le CMS/.test(gen),'plus de liste d\'heures avant la date et le CMS');}
  assert(/S\._lastLapinDetected=false;\s*saveLast\(\);/.test(section('function onReset(','\nfunction ')),'« Effacer » enregistre le formulaire vide (CMS et démarche oubliés)');
  console.log('Double réservation : confirmation explicite à la génération et au choix du CMS ou de la date OK.');
  console.log('AG-016 D3 et (D) : anti-doublon par cmsKey, identifiants des nouvelles fiches, repli sûr des localisateurs OK.');
  console.log('Écritures sûres : lsSet, ecrireTout (lecture préalable, retour arrière vérifié), persist, writeProfileHistory et appelants, archivage, import JSON (éléments, réglages, panne à chaque écriture), restaurations (profil figé), planning et ICS avec le vrai addHistory OK.');
})().catch(e=>{console.error(e);process.exit(1);});
