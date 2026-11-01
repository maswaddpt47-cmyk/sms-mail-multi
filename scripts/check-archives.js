/* AG-017, étape 6 d'AG-013 : archives annuelles ag017-v1 (contrat figé, confirmé par Codex 5b78987).
   Charge l'application ENTIÈRE (vraies fonctions), horloge fixée au 05/01/2028, stockage simulé, données fictives.
   Cas convenus : calendriers RDV / préparation, deux ordres d'archivage, restauration et déplacement, nouvelle fiche après archivage,
   fiches sans identifiant, conservation des marqueurs, recomptage avant purge, anciennes archives, confidentialité des exports.
   Exécuter : node scripts/check-archives.js (INDEX_HTML=<copie> pour une mutation ; TZ=UTC et TZ=Europe/Paris). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const RealDate=Date,FIXE=new RealDate('2028-01-05T10:00:00Z').getTime();
class D extends RealDate{constructor(...a){a.length?super(...a):super(FIXE);}static now(){return FIXE;}}

function charger(){
  const m=new Map(),toasts=[];
  const localStorage={getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},key:i=>[...m.keys()][i]??null,get length(){return m.size;}};
  const noeud=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},removeChild(){},insertBefore(){}});
  const document={addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},getElementById(){return null;},createElement:noeud,createTextNode:noeud,body:noeud(),documentElement:noeud()};
  const window={addEventListener(){},matchMedia(){return {matches:false,addEventListener(){}};},localStorage,location:{href:''},navigator:{}};
  const c=vm.createContext({document,window,localStorage,navigator:{},location:{href:''},setTimeout(){},clearTimeout(){},setInterval(){},console,Intl,Date:D,Math,JSON,URL:{createObjectURL(){return '';}},Blob:function(){}});
  vm.runInContext(code,c);
  Object.assign(c,{showToast:t=>toasts.push(String(t)),renderModal(){},renderAll(){},regen(){},renderHeader(){},githubPush(){},maybeAutoBackupProfile(){},ghToken:()=>'',confirm:()=>true,renderStats(){},renderAgenda(){},renderTabs(){}});
  vm.runInContext(`S.activeProfile='p1';S.history=[];S.yearlyStats={};S.cmsList=[{id:1,nom:'Fumel'},{id:2,nom:'Marmande'}];S.secteurs=['Fumel','Marmande'];
    S.demarches=[{id:101,nom:'Demande CNI'},{id:102,nom:'Logement social'}];S.permanences=[];S.orientations=[];S.templates={};S.hiddenBuiltinKeys=[];S.customTemplates=[];S.customVars=[];S.mandats=[];`,c);
  return {c,m,toasts,S:c.S};
}
const J=o=>JSON.parse(JSON.stringify(o));   // sort du contexte vm (comparaisons profondes)
function fiche(o){return Object.assign({channel:'sms',msgType:'confirmation',civilite:'Mme',nom:'FICTIF',prenom:'X',commune:'Fumel',selectedCMS:'1',selectedDemarche:'101',demarche:'Demande CNI',heure:'09:30',statut:'realise',ts:'01/01/2026 10:00:00',body:'x'},o);}
function poser(e,liste){e.S.history=liste.map(J);e.c.lsSet(e.c.pk('history'),e.S.history);}
function tot(e,y){return J(e.c.totauxPreparationAnnee(y));}
function archiver(e,y){const avant=e.S.history.length;e.c.archiveYear(y);return {archive:J(e.S.yearlyStats[y]||null),purgees:avant-e.S.history.length};}
function importer(e,donnees){e.S.importText=JSON.stringify(donnees);return e.c.doImport();}
// préparation le 15/12/2025 (réception 12/12, délai 1 j ouvré), RDV 08/01/2026 ; préparation 02/11/2026, RDV 05/01/2027 ; une fiche 2026 ordinaire
const A=fiche({id:'f-A',nom:'ALPHA',prenom:'A',date:'2026-01-08',dateReception:'2025-12-12',premierePreparationAt:'2025-12-15T09:00:00.000Z'});
const B=fiche({id:'f-B',nom:'BETA',prenom:'B',date:'2027-01-05',statut:'lapin',dateReception:'2026-11-02',premierePreparationAt:'2026-11-02T09:00:00.000Z'});
const C=fiche({id:'f-C',nom:'GAMMA',prenom:'C',date:'2026-03-10',heure:'10:30',dateReception:'2026-02-27',premierePreparationAt:'2026-03-02T09:00:00.000Z',channel:'mail'});

/* ── calendriers RDV / préparation et deux ordres d'archivage ── */
for(const ordre of [[2026,2027],[2027,2026]]){
  const e=charger();poser(e,[A,B,C]);
  const t25=tot(e,2025),t26=tot(e,2026);
  assert.equal(t25.fiches,1);assert.equal(t26.fiches,2);assert.equal(t25.n,1);assert.equal(t25.somme,1);
  for(const y of ordre){
    const {archive,purgees}=archiver(e,y);
    assert(archive,'archive '+y+' créée');assert.equal(archive.methode,'ag017-v1');assert.equal(e.c.lectureArchive(archive),'ag017-v1');
    assert.equal(purgees,y===2026?2:1,'cohorte '+y+' purgée');assert.equal(archive.controle.recomptage,'concordant');
    assert.deepEqual(tot(e,2025),t25,'ordre '+ordre+' : préparations 2025 inchangées après '+y);
    assert.deepEqual(tot(e,2026),t26,'ordre '+ordre+' : préparations 2026 inchangées après '+y);
  }
  const a26=J(e.S.yearlyStats[2026]);
  assert.deepEqual(Object.keys(a26.preparees.parMois).sort(),['2025-12','2026-03'],'préparations rangées à leur propre mois');
  assert.deepEqual(Object.keys(a26.rdv.parMois).sort(),['2026-01','2026-03'],'RDV rangés au mois du RDV');
  assert.deepEqual(a26.idsFiches,['f-A','f-C']);assert.equal(a26.rdv.personnesAccompagnees,2);
  assert.equal(a26.creneaux.denominateur,2);assert.equal(a26.creneaux.realises,2);
  assert(!('trendByMonth' in a26)&&!('heatmap' in a26)&&!('avgRdv' in a26),'Q2/Q4 : champs retirés des nouvelles archives');
  assert.equal(e.S.history.length,0);
}
console.log('Calendriers RDV / préparation et deux ordres d\'archivage OK.');

/* ── test 1 : fiche identifiée archivée en 2026, restaurée, déplacée en 2027 ; la purge 2027 reste possible ── */
{const e=charger();poser(e,[A,C]);archiver(e,2026);
 assert(importer(e,{history:[J(A)]}),'import d\'historique seul (archive conservée)');
 assert.equal(e.S.history[0].nonReconciliee,undefined,'identifiée : pas de marqueur, reconnue par son id');
 e.S.history[0]=Object.assign({},e.S.history[0],{date:'2027-01-08'});e.c.lsSet(e.c.pk('history'),e.S.history);   // déplacement (même chemin qu'update : Object.assign)
 assert.equal(tot(e,2025).fiches,1,'préparations 2025 = 1, pas 2');
 const {archive}=archiver(e,2027);assert(archive,'purge 2027 acceptée');
 assert.equal(archive.effectifs.contributrices,0);assert.equal(archive.effectifs.dejaComptees,1);assert.deepEqual(archive.idsFiches,[]);
 assert.equal(tot(e,2025).fiches,1);}
console.log('Test 1 (restaurée puis déplacée, purge acceptée) OK.');

/* ── test 2 : fiche sans id comptée en 2026, sauvegarde où son RDV était déjà déplacé en 2027, importée sans marqueur ── */
{const G=fiche({nom:'SANSID',prenom:'G',date:'2026-01-09',dateReception:'2025-12-12',premierePreparationAt:'2025-12-15T09:00:00.000Z'});
 const e=charger();poser(e,[G]);archiver(e,2026);assert.equal(tot(e,2025).fiches,1);
 assert(importer(e,{history:[Object.assign(J(G),{date:'2027-01-09'})]}));
 assert.equal(e.S.history[0].nonReconciliee.motif,'import-avec-archive','sauvegarde déjà déplacée : marquée');
 const t=tot(e,2025);assert.equal(t.fiches,1,'pas de double compte');assert.equal(t.exclues,1);
 assert.match(e.toasts.at(-1),/1 fiche\(s\) sans identifiant signalée\(s\) non réconciliée\(s\)/);}
console.log('Test 2 (sauvegarde déjà déplacée) OK.');

/* ── test 3 : sans id restaurée dans une cohorte archivée, marquée, déplacée, puis archivée ; marqueur conservé ── */
{const H=fiche({nom:'RESTAUREE',prenom:'H',date:'2026-05-05',premierePreparationAt:null});
 const e=charger();poser(e,[fiche({id:'f-Z',nom:'Z',date:'2026-05-04'})]);archiver(e,2026);
 assert(importer(e,{history:[J(H)]}));assert.equal(e.S.history[0].nonReconciliee.motif,'cohorte-archivee');
 // marqueur conservé : régénération (addHistoryBrut), déplacement, aller-retour JSON
 e.c.addHistoryBrut(Object.assign(J(H),{body:'régénéré'}),true);
 assert(e.S.history.find(h=>h.nom==='RESTAUREE').nonReconciliee,'régénération : marqueur conservé');
 const i=e.S.history.findIndex(h=>h.nom==='RESTAUREE');e.S.history[i]=Object.assign({},e.S.history[i],{date:'2027-02-02'});e.c.lsSet(e.c.pk('history'),e.S.history);
 assert.equal(e.c.classerFicheArchive(e.S.history[i],e.c.idsArchives(e.S.yearlyStats),e.S.yearlyStats),'nonReconciliee','déplacée vers une cohorte ouverte : toujours non réconciliée');
 const sauvegarde=J(e.c.exportDataForProfile('p1'));assert(sauvegarde.history.some(h=>h.nonReconciliee),'sauvegarde complète : marqueur présent');
 const {archive}=archiver(e,2027);assert.equal(archive.nonReconciliees.total,1);assert.equal(archive.nonReconciliees.moisInconnu,1);
 assert.equal(archive.effectifs.contributrices,0);
 assert.match(e.c.texteTotalFiches(tot(e,2027)),/mois inconnu/,'signalement conservé après purge');}
console.log('Test 3 (marqueur après déplacement, régénération, sauvegarde et purge) OK.');

/* ── test 4 : fiche créée après l'archivage, RDV daté de l'année archivée → contributrice ── */
{const e=charger();poser(e,[A]);archiver(e,2026);
 e.c.addHistoryBrut({channel:'sms',msgType:'confirmation',civilite:'M.',nom:'NOUVEAU',prenom:'N',commune:'Fumel',date:'2026-06-01',heure:'09:30',dateReception:'2027-12-20',body:'x',ts:e.c.tsParis()},true);
 const n=e.S.history.find(h=>h.nom==='NOUVEAU');assert(n.id&&!n.nonReconciliee);
 assert.equal(e.c.classerFicheArchive(n,e.c.idsArchives(e.S.yearlyStats),e.S.yearlyStats),'contributrice');
 assert.equal(tot(e,2028).fiches,1,'comptée à sa préparation (05/01/2028)');}
console.log('Test 4 (nouvelle fiche après archivage) OK.');

/* ── test 5 : profil sans archive, import de fiches sans identifiant → aucune marquée ── */
{const e=charger();assert(importer(e,{history:[fiche({nom:'LIBRE',date:'2027-03-03'})]}));assert.equal(e.S.history[0].nonReconciliee,undefined);
 // filet du chargement : cohorte archivée → marquée ; cohorte ouverte → non
 const r=J(e.c.marquerNonReconciliees([fiche({nom:'V',date:'2026-02-02'}),fiche({nom:'W',date:'2027-02-02'})],{2026:{methode:'ag017-v1'}},false));
 assert.equal(r.marquees,1);assert.equal(r.history[0].nonReconciliee.motif,'cohorte-archivee');assert.equal(r.history[1].nonReconciliee,undefined);
 assert(/marquerNonReconciliees\(S\.history,S\.yearlyStats,false\)/.test(code),'filet de sécurité branché au chargement');}
console.log('Test 5 (sans archive : rien marqué ; filet du chargement) OK.');

/* ── test 6 : affichage — borne pour un nombre de fiches seulement ; moyenne non certifiée sans borne ; mois inconnu ── */
{const e=charger();
 const t={annee:2026,fiches:4,n:1,somme:10,partiel:[],exclues:1,moisInconnu:0};
 assert.match(e.c.texteTotalFiches(t),/entre 4 et 5/);
 const m=e.c.texteMoyennePreparation(t);assert.match(m,/^10 j — non certifié, 1 fiche exclue$/);assert(!/entre/.test(m),'pas de borne sur une moyenne');
 assert.match(e.c.texteTotalFiches(Object.assign({},t,{exclues:0,moisInconnu:2})),/entre 4 et 6 .*dont 2 de mois inconnu/);
 assert.equal(e.c.texteTotalFiches(Object.assign({},t,{exclues:0})),'4');
 // exemple de Codex : moyenne affichée 10 avec une fiche exclue qui en vaudrait 100
 poser(e,[fiche({id:'f-M',date:'2027-02-01',dateReception:'2026-10-01',premierePreparationAt:'2026-10-15T09:00:00.000Z'}),fiche({nom:'EXCLUE',date:'2027-02-01',heure:'10:30',premierePreparationAt:'2026-10-15T09:00:00.000Z',nonReconciliee:{depuis:'2027-12-01',motif:'import-avec-archive'}})]);
 const tt=tot(e,2026);assert.equal(tt.n,1);assert.equal(tt.exclues,1);assert.match(e.c.texteMoyennePreparation(tt),/non certifié, 1 fiche exclue/);}
console.log('Test 6 (borne réservée aux nombres, moyenne non certifiée, mois inconnu) OK.');

/* ── test 7 : purge refusée pour chaque altération ; rien d'écrit ── */
for(const [nom,alterer] of [
  ['mois de préparation déplacé',a=>{a.preparees.parMois['2026-12']=a.preparees.parMois['2025-12'];delete a.preparees.parMois['2025-12'];}],
  ['somme de jours à 1000',a=>{a.preparation.parMois['2025-12'].sommeJoursOuvres=1000;}],
  ['lapins au-dessus du dénominateur',a=>{a.creneaux.lapins=a.creneaux.denominateur+1;}],
  ['déjà comptées faussées',a=>{a.effectifs.dejaComptees++;}],
  ['non réconciliées faussées',a=>{a.nonReconciliees.total++;}],
  ['champ absent au lieu de zéro',a=>{delete a.creneaux.sansCms;}]]){
  const e=charger();poser(e,[A,C]);const vrai=e.c.computeYearArchive,avant=e.m.get(e.c.pk('history'));
  e.c.computeYearArchive=y=>{const a=vrai(y);alterer(a);return a;};
  e.c.archiveYear(2026);
  assert.equal(e.S.yearlyStats[2026],undefined,nom+' : aucune archive');assert.equal(e.m.get(e.c.pk('history')),avant,nom+' : rien supprimé');
  assert.match(e.toasts.at(-1),/refusé/,nom+' : refus annoncé');
}
console.log('Test 7 (purge refusée pour chaque altération) OK.');

/* ── test 8 : export de contrôle anonymisé ≠ sauvegarde complète privée ; identifiants conservés ── */
{const e=charger();
 e.S.demarches.push({id:103,nom:'IDENTIFIANT_FICTIF_CATALOGUE'});e.S.cmsList.push({id:3,nom:'CONTACT_FICTIF_CATALOGUE'});
 poser(e,[A,C,fiche({id:'f-L',nom:'LIBRE',date:'2026-04-04',selectedDemarche:'__autre__',demarche:'TEXTE_LIBRE_FICTIF'}),fiche({id:'f-K',nom:'CATA',date:'2026-04-05',selectedDemarche:'103',demarche:'IDENTIFIANT_FICTIF_CATALOGUE',commune:'CONTACT_FICTIF_CATALOGUE'})]);
 archiver(e,2026);const arc=J(e.S.yearlyStats[2026]);
 assert(arc.rdv.parDemarche['Autre (texte libre)']===1&&!JSON.stringify(arc).includes('TEXTE_LIBRE_FICTIF'),'archive : aucun texte libre');
 assert.equal(arc.rdv.parDemarche['IDENTIFIANT_FICTIF_CATALOGUE'],1,'archive : libellé de catalogue conservé à l\'écran');
 const ctl=JSON.stringify(e.c.construireControleArchive(e.S.yearlyStats[2026]));
 for(const interdit of ['f-A','f-C','f-L','f-K','IDENTIFIANT_FICTIF_CATALOGUE','CONTACT_FICTIF_CATALOGUE','TEXTE_LIBRE_FICTIF','Demande CNI','Fumel','idsFiches','ALPHA'])assert(!ctl.includes(interdit),'export de contrôle sans « '+interdit+' »');
 assert(/Démarche n°1/.test(ctl)&&/CMS n°1/.test(ctl)&&/Autre \(texte libre\)/.test(ctl),'catégories neutres');
 const priv=J(e.c.exportDataForProfile('p1'));assert.deepEqual(priv.yearlyStats[2026].idsFiches,['f-A','f-C','f-K','f-L'],'sauvegarde complète privée : identifiants présents');
 e.S.yearlyStats={};e.c.lsSet(e.c.pk('yearly-stats'),{});   // archive supprimée du profil…
 assert(importer(e,priv));assert.deepEqual(J(e.S.yearlyStats[2026].idsFiches),['f-A','f-C','f-K','f-L'],'… restaurée depuis la sauvegarde privée avec ses identifiants');}
console.log('Test 8 (export de contrôle anonymisé, sauvegarde privée, identifiants restaurés) OK.');

/* ── test 9 : anciennes archives, méthode inconnue, archive incomplète, total partiel ── */
{const e=charger();
 assert.equal(e.c.lectureArchive({year:2024,total:3,usagersN:2}),'historique');
 assert.equal(e.c.lectureArchive({methode:'ag099',year:2025}),'inconnue');
 assert.equal(e.c.lectureArchive({methode:'ag017-v1',year:2025}),'incomplete');
 assert.equal(e.c.construireControleArchive({methode:'ag017-v1',year:2025}),null);
 e.S.yearlyStats={2024:{year:2024,total:3,byMonth:{'2024-03':{sms:3,mail:0}}}};
 const t=tot(e,2024);assert.deepEqual(t.partiel,['2024']);assert.equal(t.fiches,0);
 assert.match(e.c.texteTotalFiches(t),/partiel : archive 2024 non prise en compte/,'jamais de zéro certifié avec une ancienne archive');
 assert(/'📅 Délai moy\. RDV \(ancienne méthode\) : '\+arc\.avgRdv/.test(code),'ancienne archive : délai sous sa méthode historique');}
console.log('Test 9 (anciennes archives, méthode inconnue, total partiel) OK.');

/* ── Q3 : non pointés annoncés dans la confirmation ; texte « sans nom ni téléphone » ── */
{const e=charger();let msg='';e.c.confirm=t=>{msg=t;return false;};
 poser(e,[fiche({id:'f-1',date:'2026-02-02',statut:'en_attente'}),fiche({id:'f-2',date:'2026-02-03',statut:'confirme'}),fiche({id:'f-3',date:'2026-02-04',statut:'bizarre'})]);
 e.c.archiveYear(2026);assert.match(msg,/1 en attente, 1 confirmé\(s\) à pointer, 1 statut à vérifier/);assert.match(msg,/sans nom ni téléphone/);
 assert.equal(e.S.history.length,3,'refus de confirmation : rien supprimé');}
console.log('Q3 (avertissement des non pointés) OK.');

/* ── L1 (vérification de Codex 8e3f369) : vraie archive réimportée avec UN champ manquant ou faux → « incomplète », aucun chiffre ── */
for(const [nom,abimer] of [
  ['periodeRdv supprimée',a=>{delete a.periodeRdv;}],
  ['mois de préparation sans sms',a=>{delete a.preparees.parMois['2025-12'].sms;}],
  ['unités supprimées',a=>{delete a.unites;}],
  ['canaux supprimés',a=>{delete a.rdv.canaux;}],
  ['lapins en texte',a=>{a.creneaux.lapins='1';}],
  ['clé de mois invalide',a=>{a.rdv.parMois['2026-13']={total:0,realise:0};}],
  ['mois de préparation invalide, totaux intacts',a=>{a.preparees.parMois['2025-13']=a.preparees.parMois['2025-12'];delete a.preparees.parMois['2025-12'];}],
  ['statut inconnu chez les non réconciliées',a=>{a.nonReconciliees.parStatut.inventé=0;}],
  ['identifiant non textuel',a=>{a.idsFiches.push(42);}],
  ['invariant cassé (somme des statuts)',a=>{a.rdv.statuts.realise++;}]]){
  const e=charger();poser(e,[A,C]);archiver(e,2026);
  const sauv=J(e.c.exportDataForProfile('p1'));abimer(sauv.yearlyStats[2026]);
  assert(importer(e,sauv),nom+' : import accepté');
  const a=e.S.yearlyStats[2026];
  assert.equal(e.c.lectureArchive(a),'incomplete',nom+' : lue comme incomplète');
  assert.equal(e.c.construireControleArchive(a),null,nom+' : non exportable, sans exception');
  for(const y of [2025,2026]){const t=tot(e,y),txt=e.c.texteTotalFiches(t);assert.deepEqual(t.partiel,['2026'],nom+' : total partiel');assert(!/NaN|undefined/.test(txt+e.c.texteMoyennePreparation(t)),nom+' : ni NaN ni undefined');}
}
console.log('L1 (archive partiellement incomplète : aucun chiffre, total partiel, pas d\'export) OK.');

/* ── L2 : champs ajoutés à une archive importée jamais recopiés dans l'export de contrôle ; la sauvegarde privée garde l'archive entière ── */
{const e=charger();poser(e,[A,C]);archiver(e,2026);
 const sauv=J(e.c.exportDataForProfile('p1')),a=sauv.yearlyStats[2026],M='IDENTIFIANT_FICTIF_PRIVE_f-TEST';
 a.unites.notePrivee=M;a.effectifs.notePrivee=1;a.rdv.parMois['2026-01'].notePrivee=M;a.preparees.parMois['2025-12'].notePrivee=M;
 a.preparation.parMois['2025-12'].notePrivee=M;a.creneaux.notePrivee=1;a.rdv.canaux.notePrivee=1;a.cohorte.notePrivee=M;a.notePrivee=M;
 assert(importer(e,sauv));
 assert.equal(e.c.lectureArchive(e.S.yearlyStats[2026]),'ag017-v1','champs en plus : archive toujours lisible');
 const ctl=JSON.stringify(e.c.construireControleArchive(e.S.yearlyStats[2026]));
 assert(!ctl.includes('notePrivee')&&!ctl.includes(M),'export de contrôle : aucun champ supplémentaire recopié');
 assert(JSON.stringify(e.c.exportDataForProfile('p1')).includes(M),'sauvegarde complète privée : archive entière conservée');}
console.log('L2 (export de contrôle sur le seul schéma autorisé) OK.');

/* ── L3 : une erreur des lecteurs de catalogue du calcul principal est détectée par le recomptage, purge refusée ── */
for(const lecteur of ['libelleDemarcheArchive','libelleCmsArchive']){
  const e=charger();poser(e,[A,C]);e.c[lecteur]=()=>'MAUVAIS_LIBELLE_FICTIF';
  const avant=e.m.get(e.c.pk('history'));e.c.archiveYear(2026);
  assert.equal(e.S.yearlyStats[2026],undefined,lecteur+' faussé : aucune archive');assert.equal(e.m.get(e.c.pk('history')),avant);
  assert.match(e.toasts.at(-1),/refusé/);
}
console.log('L3 (recomptage indépendant des lecteurs de catalogue) OK.');
