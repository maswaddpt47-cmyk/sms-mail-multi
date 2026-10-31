/* Écritures sûres (AG-013, étape 2) : une panne de stockage à n'importe quelle écriture ne laisse ni purge, ni import
   partiel, ni sauvegarde automatique d'un état intermédiaire, ni message de succès. Fonctions extraites d'index.html,
   stockage simulé. Données fictives. Exécuter : node scripts/check-ecritures.js (INDEX_HTML=<copie> pour une mutation). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start);assert(end>start,to);return html.slice(start,end);}
const CODE=[
  section('function ls(k,d){','\n'),
  section('function cmsKey(','\n'),
  section('/* AG-013, étape 2 (31/10/2026) : une écriture est relue','/* clé cloisonnée par profil actif'),
  section('function pkFor(','function readProfileHistory('),
  section('function maybeAutoBackupProfile(','/* pousse un fichier daté'),
  section('function entryYear(','/* années révolues'),
  section('function archiveYear(','/* affiche les stats agrégées'),
  section('/* AG-013, étape 2 : la sauvegarde est vérifiée entièrement','/* history */'),
  section('function ghRestoreLatest(','/* rétention'),
  section('function ghRestoreFile(','function ghCheckOnStartup('),
  section('/* AG-013, étape 2 : même RDV','function importPlanningJson(')
].join('\n');

function stockage(){
  const m=new Map(),s={panne:null,ecritures:0};
  s.getItem=k=>m.has(k)?m.get(k):null;
  s.setItem=(k,v)=>{s.ecritures++;if(s.panne&&s.panne(k,s.ecritures))throw new Error('QuotaExceededError');if(s.perte&&s.perte(k))return;m.set(k,String(v));};   /* perte : écriture perdue sans erreur */
  s.removeItem=k=>{m.delete(k);};
  s.etat=()=>JSON.stringify([...m.entries()].sort());
  return s;
}
function charger(){
  const st=stockage(),journal={toasts:[],pushs:0,persist:0};
  const S={activeProfile:'p1',history:[],yearlyStats:{},permanences:[],orientations:[],cmsList:[{id:1,nom:'Fumel'}],demarches:[],secteurs:[],customTemplates:[],customVars:[],mandats:[],importText:'',importError:'',modal:'import'};
  const ctx=vm.createContext({
    Date,JSON,Object,Array,String,Math,Promise,escape,decodeURIComponent,atob:s=>Buffer.from(s,'base64').toString('binary'),
    localStorage:st,S,confirm:()=>true,showToast:(m)=>journal.toasts.push(m),renderModal(){},renderAll(){},regen(){},renderAgenda(){},renderTabs(){},
    persist(){journal.persist++;},ghToken:()=>'jeton-fictif',githubPush(){journal.pushs++;},
    computeYearArchive:(y)=>({year:y,total:S.history.filter(h=>String(h.date).slice(0,4)==String(y)).length}),
    migratePermanences:(p)=>p.map(x=>Object.assign({},x,{migree:true})),PERM_MODEL_VERSION:3,
    addHistory(item){S.history=[item].concat(S.history);ctx.lsSet(ctx.pk('history'),S.history);ctx.maybeAutoBackupProfile(S.activeProfile);},
    GH_REPO:'depot/fictif',GH_BRANCH:'main',ghHeaders:()=>({}),ghListBackups:(t,cb)=>cb([{path:'b/p1/backup.json'}]),fetch:null
  });
  vm.runInContext(CODE+'\nvar _ghLastAutoPushByProfile={};',ctx);
  return {ctx,S,st,journal};
}
function rdv(id,date,heure,nom,prenom,commune){return {id,date,heure,nom,prenom,commune:commune||'Fumel',statut:'realise',msgType:'confirmation'};}

/* ── lsSet : vrai si écrit et relu, faux sinon ── */
{const {ctx,st,journal}=charger();
 assert.equal(ctx.lsSet('a',{x:1}),true);assert.equal(st.getItem('a'),'{"x":1}');
 st.panne=()=>true;assert.equal(ctx.lsSet('a',{x:2}),false);assert.equal(st.getItem('a'),'{"x":1}');
 assert(journal.toasts.some(t=>/Stockage plein/.test(t)));
 st.panne=null;st.perte=k=>k==='a';assert.equal(ctx.lsSet('a',{x:3}),false,'écriture perdue sans erreur : détectée par la relecture');}

/* ── Archivage : panne à chaque écriture → rien supprimé, pas de succès, pas de sauvegarde ── */
function prepArchive(){
  const e=charger();
  e.S.history=[rdv('a','2025-03-01','09:30','FICTIF','A'),rdv('b','2025-04-01','10:30','FICTIF','B'),rdv('c','2026-10-01','09:30','FICTIF','C')];
  e.S.yearlyStats={2024:{year:2024,total:9}};
  e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('yearly-stats'),JSON.stringify(e.S.yearlyStats));
  e.st.ecritures=0;return e;
}
{const e=prepArchive();e.ctx.archiveYear(2025);   // garde : sans panne, l'archivage aboutit
 assert.equal(e.S.history.length,1);assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).length,1);
 assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('yearly-stats')))[2025].total,2);assert.equal(e.journal.pushs,1);
 assert(e.journal.toasts.some(t=>/archivée/.test(t)));}
for(const n of [1,2]){
  const e=prepArchive(),avant=e.st.etat(),memHist=JSON.stringify(e.S.history),memStats=JSON.stringify(e.S.yearlyStats);
  e.st.panne=(k,i)=>i===n;e.ctx.archiveYear(2025);
  assert.equal(e.st.etat(),avant,'archivage, panne à l\'écriture '+n+' : stockage inchangé');
  assert.equal(JSON.stringify(e.S.history),memHist,'archivage : historique en mémoire inchangé');
  assert.equal(JSON.stringify(e.S.yearlyStats),memStats,'archivage : archives en mémoire inchangées');
  assert.equal(e.journal.pushs,0,'archivage : aucune sauvegarde GitHub');
  assert(!e.journal.toasts.some(t=>/archivée/.test(t)),'archivage : aucun succès annoncé');
  assert(e.journal.toasts.some(t=>/Archivage annulé/.test(t)));
}

/* ── Import JSON : vérifié en entier, appliqué en une fois ── */
const sauvegarde={cmsList:[{id:1,nom:'Fumel'},{id:2,nom:'Marmande'}],demarches:[{id:1,nom:'D'}],secteurs:['Fumel'],customTemplates:[],customVars:[],mandats:[],
  history:[rdv('x','2026-10-02','09:30','FICTIF','X')],yearlyStats:{2025:{year:2025}},permanences:[{commune:'Fumel',exceptDate:'2026-10-02'}],orientations:[{nom:'FICTIF'}]};
function prepImport(texte){
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];
  e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem('ess-cms',JSON.stringify(e.S.cmsList));
  e.S.importText=texte;e.st.ecritures=0;return e;
}
{const e=prepImport(JSON.stringify(sauvegarde));assert.equal(e.ctx.doImport(),true);   // garde : import complet
 const ecrites=e.st.ecritures;assert(ecrites>=10,'toutes les clés écrites');
 assert.equal(e.S.history[0].id,'x');assert.equal(e.S.permanences[0].migree,true);assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('perm-version'))),3);
 assert.equal(e.journal.persist,1);assert(e.journal.toasts.some(t=>/Import réussi/.test(t)));
 // panne à chaque écriture possible : aucune clé modifiée, mémoire intacte, pas de succès, pas de sauvegarde automatique
 for(let n=1;n<=ecrites;n++){
   const f=prepImport(JSON.stringify(sauvegarde)),avant=f.st.etat(),mem=JSON.stringify(f.S);
   f.st.panne=(k,i)=>i===n;
   assert.equal(f.ctx.doImport(),false,'import, panne à l\'écriture '+n);
   assert.equal(f.st.etat(),avant,'import, panne à l\'écriture '+n+' : stockage restauré');
   const S2=JSON.parse(JSON.stringify(f.S));delete S2.importError;const m2=JSON.parse(mem);delete m2.importError;
   assert.deepEqual(S2,m2,'import, panne à l\'écriture '+n+' : mémoire intacte');
   assert.equal(f.journal.persist,0);assert.equal(f.journal.pushs,0);
   assert(!f.journal.toasts.some(t=>/Import réussi/.test(t)));assert.match(f.S.importError,/Aucune donnée modifiée|aucune donnée modifiée/);
 }}
for(const [nom,texte] of [['JSON invalide','{pas du json'],['history non liste',JSON.stringify(Object.assign({},sauvegarde,{history:{}}))],
  ['fiche illisible',JSON.stringify(Object.assign({},sauvegarde,{history:[null]}))],['yearlyStats liste',JSON.stringify(Object.assign({},sauvegarde,{yearlyStats:[]}))],['tableau',JSON.stringify([1,2])]]){
  const e=prepImport(texte),avant=e.st.etat();
  assert.equal(e.ctx.doImport(),false,nom);assert.equal(e.st.ecritures,0,nom+' : aucune écriture');assert.equal(e.st.etat(),avant);
  assert.equal(e.S.history[0].id,'ancien',nom+' : mémoire intacte');
}
// migratePermanences qui échoue : rien d'écrit
{const e=prepImport(JSON.stringify(sauvegarde));e.ctx.migratePermanences=()=>{throw new Error('migration');};
 assert.equal(e.ctx.doImport(),false);assert.equal(e.st.ecritures,0);}

/* ── Restaurer depuis GitHub : pas de « réussie » si l'import échoue ── */
async function restaurer(contenu,fonction,panne){
  const e=charger();e.S.history=[rdv('ancien','2026-09-01','09:30','ANCIEN','A')];let appele=0;
  if(panne)e.st.panne=()=>true;
  e.ctx.fetch=()=>Promise.resolve({ok:true,json:()=>Promise.resolve({content:Buffer.from(contenu,'utf8').toString('base64')})});
  if(fonction==='fichier')e.ctx.ghRestoreFile('jeton','b/p1/backup.json');else e.ctx.ghRestoreLatest('jeton',()=>{appele++;});
  await new Promise(r=>setTimeout(r,20));return {e,appele};
}
(async()=>{
  for(const fonction of ['fichier','dernier']){
    const ok=await restaurer(JSON.stringify(sauvegarde),fonction,false);
    assert.equal(ok.e.S.history[0].id,'x',fonction+' : restauration appliquée');   // garde
    if(fonction==='fichier')assert(ok.e.journal.toasts.some(t=>/Restauration réussie/.test(t)));else assert.equal(ok.appele,1);
    for(const [cas,contenu,panne] of [['illisible','{"history":{}}',false],['stockage plein',JSON.stringify(sauvegarde),true]]){
      const r=await restaurer(contenu,fonction,panne);
      assert(!r.e.journal.toasts.some(t=>/Restauration réussie/.test(t)),fonction+' '+cas+' : pas de succès');
      assert.equal(r.appele,0,fonction+' '+cas+' : suite non lancée');
      assert(r.e.journal.toasts.some(t=>/Restauration annulée/.test(t)),fonction+' '+cas+' : échec annoncé');
      assert.equal(r.e.S.history[0].id,'ancien',fonction+' '+cas+' : mémoire intacte');
    }
  }

  /* ── Import du planning : clé date + heure + CMS + nom + prénom ; tout ou rien ── */
  {const e=charger();e.S.history=[rdv('h1','2026-10-05','09:30','Martin','Léa','Fumel')];
   const r=e.ctx.appliquerPlanning([
     {date:'2026-10-05',heure:'10:30',nom:'MARTIN',prenom:'Léa',commune:'Fumel'},      // même personne, autre heure : nouveau RDV
     {date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Paul',commune:'Fumel'},     // homonyme, autre prénom : nouveau RDV
     {date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Léa',commune:'Marmande'},   // autre CMS : nouveau RDV
     {date:'2026-10-05',heure:'09:30',nom:' martin ',prenom:'LÉA',commune:'fumel ',statut:'confirme'}]);   // même RDV : mis à jour
   assert.deepEqual([r.ok,r.added,r.updated],[true,3,1]);
   assert.equal(e.S.history.length,4);assert.equal(e.S.history.find(h=>h.id==='h1').statut,'confirme');
   assert.equal(JSON.parse(e.st.getItem(e.ctx.pk('history'))).length,4);assert.equal(e.journal.pushs,1,'une seule sauvegarde, à la fin');}
  let echecs=0;
  for(let n=1;n<=4;n++){
    const e=charger();e.S.history=[rdv('h1','2026-10-05','09:30','Martin','Léa','Fumel')];e.S.permanences=[{commune:'Fumel',exceptDate:'2026-10-05'}];
    e.st.setItem(e.ctx.pk('history'),JSON.stringify(e.S.history));e.st.setItem(e.ctx.pk('permanences'),JSON.stringify(e.S.permanences));e.st.ecritures=0;
    const avant=e.st.etat(),mem=JSON.stringify([e.S.history,e.S.permanences]);
    e.st.panne=(k,i)=>i===n;
    const r=e.ctx.appliquerPlanning([{date:'2026-10-05',heure:'09:30',nom:'Martin',prenom:'Léa',commune:'Fumel',statut:'confirme'},{date:'2026-10-06',heure:'09:30',nom:'N',prenom:'P',commune:'Fumel'}]);   // doublon d'abord : il modifie le tableau d'origine
    // tout ou rien : soit l'état complet est enregistré et relu, soit tout revient à l'état d'avant
    if(r.ok){
      assert.equal(e.st.getItem(e.ctx.pk('history')),JSON.stringify(e.S.history),'planning, panne '+n+' rattrapée : stockage = mémoire');
      assert.equal(e.S.history.length,2);
    }else{
      echecs++;
      assert.equal(e.st.etat(),avant,'planning, panne '+n+' : stockage restauré');
      assert.equal(JSON.stringify([e.S.history,e.S.permanences]),mem,'planning, panne '+n+' : mémoire restaurée');
      assert.equal(e.journal.pushs,0,'planning, panne '+n+' : aucune sauvegarde');
    }
  }
  assert(echecs>=2,'les pannes de l\'enregistrement final annulent l\'import');   // garde

  /* ── Pas de sauvegarde automatique pendant une écriture groupée ── */
  {const e=charger();let pendant=-1;e.ctx.githubPush=()=>{e.journal.pushs++;};
   e.st.setItem=(orig=>(k,v)=>{if(k==='b')pendant=e.ctx._ecrituresGroupees;e.ctx.maybeAutoBackupProfile('p1');return orig(k,v);})(e.st.setItem);
   assert.equal(e.ctx.ecrireTout([['a',1],['b',2]]),true);assert.equal(pendant,1);assert.equal(e.journal.pushs,0,'aucun push pendant l\'écriture groupée');
   e.ctx.maybeAutoBackupProfile('p1');assert.equal(e.journal.pushs,1,'push possible après');}

  console.log('Écritures sûres : lsSet vérifié, archivage, import JSON (panne à chaque écriture), restaurations GitHub, planning (clé et tout ou rien), sauvegarde suspendue OK.');
})().catch(e=>{console.error(e);process.exit(1);});
