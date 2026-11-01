/* Outil d'audit de sauvegarde (AG-013, étape 1) : anomalies repérées, recomptage indépendant égal au bilan de
   l'application, écart volontaire détecté, rapport sans donnée personnelle, aucune écriture. Données fictives.
   Exécuter : node scripts/check-audit.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const A=require('./audit-sauvegarde.js');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start);assert(end>start,to);return html.slice(start,end);}
const app=vm.createContext({Date});
vm.runInContext(section('function toLocalDateStr(d){','\n')+'\n'+section('var DUREE_CRENEAU=60;','function hasConflict(')+section('function statsRdvModel(','/* ============================== RENDER: STATS'),app);

const NOM_SECRET='ZORGLUB',TEL_SECRET='0611223344';
function f(date,heure,commune,statut,nom,prenom,extra){return Object.assign({date,heure,commune,statut,nom:NOM_SECRET+'-'+nom,prenom,msgType:'confirmation',channel:'sms',ts:'01/10/2026 10:00:00',telephone:TEL_SECRET,demarche:prenom==='Léa'?'Démarche B':'Démarche A',body:'message '+NOM_SECRET},extra||{});}
const sauvegarde={
  cmsList:[{id:1,nom:'Villeneuve-Sur-Lot'},{id:2,nom:'Fumel'}],
  history:[
    f('2026-10-01','09:30','Villeneuve-Sur-Lot','realise',NOM_SECRET,'Paul',{selectedCMS:1}),
    f('2026-10-08','09:30','villeneuve-sur-lot ','realise',NOM_SECRET,'Paul',{selectedCMS:1}),   // même CMS écrit autrement
    f('2026-10-02','10:30','Fumel','lapin','ESSAI','Léa',{dateRelance:'2026-10-01',selectedCMS:1}),   // référence CMS ≠ nom
    f('2026-10-02','10:30','Fumel','realise','AUTRE','Marc'),               // réattribution normale (Lapin puis réalisé)
    f('2026-10-03','11:30','Fumel','confirme','UN','A'),
    f('2026-10-03','11:30','Fumel','en_attente','DEUX','B'),                // deux RDV actifs sur un créneau
    f('2026-10-06','13:30','Fumel','excuse','DOUBLE','D'),
    f('2026-10-06','13:30','Fumel','excuse','DOUBLE','D'),                  // doublon probable
    f('2026-10-07','','Fumel','realise','SANS','Heure'),                    // heure absente
    f('2026-10-09','14:30','Fumel','','VIDE','S'),                          // statut vide
    f('2026-10-09','15:30','Fumel','bizarre','INCONNU','S',{channel:'pigeon',msgType:'autre'}),
    f('2026-10-10','09:30','','realise','SANSCMS','X'),                     // CMS vide
    f('2026-10-10','10:30','Agen','realise','HORS','Catalogue'),            // CMS absent du catalogue
    f('2026-10-00','10:30','Fumel','realise','JOUR','Zero'),                // date impossible (forme valide)
    f('','10:30','Fumel','realise','SANS','Date'),
    f('2026-10-13','9h30','Fumel','realise','HEURE','Mal',{ts:'2026-10-12T08:00:00Z',dateDemande:'12/10/2026'}),
    f('2026-10-14','09:30','Fumel','pas_de_retour','VIEILLE','Relance',{dateRelance:'2026-10-20'}),
    f('2026-10-16','09:30','Fumel','confirme','TYPE','Relance',{msgType:'relance'}),   // relance par le type seul
    f('2026-10-17','09:30','Fumel','realise','AUTRE','Zoé'),                // homonyme de AUTRE Marc, autre prénom
    f('2026-11-05','09:30','Fumel','confirme','FUTUR','Y'),                 // après le jour courant : hors recomptage
    {date:'2026-10-15',heure:'12:30',commune:'Fumel',msgType:'indispo',nom:'Pause déjeuner'}
  ]
};
const avant=JSON.stringify(sauvegarde),maintenant=new Date(2026,9,25,12);
const r=A.auditer(sauvegarde,{maintenant});
const types=r.parType;
// chaque cas fictif est repéré, avec le nombre attendu
[['Même CMS écrit de plusieurs façons',1],['Référence CMS et nom différents',1],['Deux RDV actifs sur un créneau',2],
 ['Doublon probable (même personne, même créneau)',2],['Heure absente',1],['Statut vide',1],['Statut inconnu',1],['Canal inconnu',1],
 ['Type de message inconnu',1],['CMS vide',1],['CMS absent du catalogue',1],['Date impossible ou mal écrite',1],['Date absente',1],
 ['Heure mal écrite',1],['Date mal écrite (dateDemande)',1],['Relance de provenance incertaine',1]]
  .forEach(([t,n])=>assert.equal(types[t],n,t));
assert.equal(r.reattributions,1,'la réattribution normale est comptée à part, pas comme anomalie');
assert.equal(r.formatsTs['français']+r.formatsTs.ISO,20);assert.equal(r.formatsTs.ISO,1);
assert.equal(r.blocages,1);

// recomptage indépendant, valeurs attendues recomptées à la main (octobre, tous CMS, jusqu'au 25/10)
const tous=r.recomptage.find(l=>l.mois==='2026-10'&&l.cms==='');
assert.equal(tous.fiches,18);        // fiches datées d'octobre jusqu'au 25 (2026-10-00 compte : forme valide) ; sans date, futur et blocage exclus
assert.equal(tous.realisees,9);
assert.equal(tous.personnes,8);      // Paul deux fois ; AUTRE Marc et AUTRE Zoé distincts
assert.equal(tous.relances,3);
assert.equal(tous.statuts.en_attente,1);   // un seul vrai « en attente »
assert.equal(tous.statuts.a_verifier,2);   // statut vide + statut inconnu : « Statut à vérifier », plus assimilés à « en attente » (AG-014 B)

// comparaison avec le vrai calcul de l'application : aucun écart
const noms={};sauvegarde.history.forEach(h=>{if(h.commune&&!noms[A.cle(h.commune)])noms[A.cle(h.commune)]=h.commune.trim();});
const bilan=(m,c)=>app.monthlyReportData(sauvegarde.history,m,c,maintenant);
const ecarts=A.comparer(r,bilan,noms);
assert(ecarts.length>=11*3,'comparaison menée sur plusieurs CMS');   // garde : la comparaison a bien eu lieu
assert.deepEqual(ecarts.filter(e=>e.statut!=='ok'),[],'bilan de l\'application = recomptage indépendant');
assert(ecarts.some(e=>/^Démarche n°1$/.test(e.indicateur)),'les démarches sont comparées');
// un bilan faux est détecté
const faux=A.comparer(r,(m,c)=>{const d=bilan(m,c);return d&&Object.assign({},d,{realised:d.realised+1});},noms);
assert(faux.some(e=>e.indicateur==='Réalisés'&&e.ecart===1),'écart volontaire détecté');

// rapport anonymisé et lecture seule
const texte=A.rapportTexte(r,ecarts);
assert.doesNotMatch(texte,new RegExp(NOM_SECRET+'|'+TEL_SECRET+'|Paul','i'),'aucune donnée personnelle dans le rapport');
assert.doesNotMatch(JSON.stringify(r.anomalies),new RegExp(NOM_SECRET+'|'+TEL_SECRET,'i'));
assert.equal(JSON.stringify(sauvegarde),avant,'la sauvegarde n\'est pas modifiée');
['scripts/audit-sauvegarde.js','audit.html'].forEach(p=>{
  const src=fs.readFileSync(path.join(__dirname,'..',p),'utf8');
  assert.doesNotMatch(src,/localStorage|sessionStorage|indexedDB|XMLHttpRequest|method:\s*['"]POST/i,p+' : ni stockage ni envoi');
});
assert.throws(()=>A.auditer({}),/historique/);

/* Contre-exemples de Codex (vérification de l'étape 1, 31/10) */
// 1. aucune valeur saisie recopiée : un téléphone glissé dans n'importe quel champ ne ressort pas
const fuite={cmsList:sauvegarde.cmsList,history:[
  f('2026-10-20','09:30','Fumel',TEL_SECRET,'FUITE','A'),
  f('2026-10-20','10:30','Fumel','realise','FUITE','B',{channel:TEL_SECRET,msgType:TEL_SECRET}),
  f('2026-10-20',TEL_SECRET,'Fumel','realise','FUITE','C'),
  f(TEL_SECRET,'11:30','Fumel','realise','FUITE','D'),
  f('2026-10-21','09:30',TEL_SECRET,'realise','FUITE','E',{demarche:TEL_SECRET}),
  f('2026-10-21','09:30','Fumel','pas_de_retour','FUITE','F',{dateRelance:TEL_SECRET,dateDemande:TEL_SECRET,dateReception:TEL_SECRET})]};
const rf=A.auditer(fuite,{maintenant});
const ef=A.comparer(rf,(m,c)=>app.monthlyReportData(fuite.history,m,c,maintenant),{});
assert(rf.anomalies.length>=8,'les champs pollués sont bien signalés');   // garde
assert.doesNotMatch(A.rapportTexte(rf,ef),new RegExp(TEL_SECRET+'|'+NOM_SECRET),'rapport sans valeur saisie');
assert.doesNotMatch(JSON.stringify(rf.anomalies)+JSON.stringify(ef)+JSON.stringify(rf.recomptage.map(l=>l.libelle)),new RegExp(TEL_SECRET),'aucune sortie affichée ne recopie la saisie');
assert(rf.anomalies.some(a=>/^CMS hors catalogue n°\d+$/.test(a.cms)),'CMS inconnu désigné par un numéro');
// 1 bis. catalogue pollué (2e vérification de Codex) : son nom ne ressort ni comme CMS ni dans la précision selectedCMS
const catPollue={cmsList:[{id:1,nom:TEL_SECRET},{id:2,nom:'Fumel'}],history:[
  f('2026-10-23','09:30',TEL_SECRET,'realise','CAT','A'),
  f('2026-10-23','10:30','Fumel','realise','CAT','B',{selectedCMS:1}),
  f('2026-10-23','11:30','Fumel','realise','CAT','C',{selectedCMS:1}),f('2026-10-23','11:30','fumel','realise','CAT','D')]};
const rc=A.auditer(catPollue,{maintenant});
const ec=A.comparer(rc,(m,c)=>app.monthlyReportData(catPollue.history,m,c,maintenant),{});
assert(rc.anomalies.some(a=>a.type==='Référence CMS et nom différents'),'chemin selectedCMS parcouru');   // garde
assert(rc.recomptage.some(l=>l.libelle==='CMS n°1'),'CMS du catalogue désigné par son rang');
assert.doesNotMatch(A.rapportTexte(rc,ec)+JSON.stringify(rc)+JSON.stringify(ec),new RegExp(TEL_SECRET),'aucun nom du catalogue recopié');
// 2. statut hérité (toString) : pas une place libérée
const herite=A.auditer({history:[f('2026-10-22','09:30','Fumel','toString','UN','A'),f('2026-10-22','09:30','Fumel','confirme','DEUX','B')]},{maintenant});
assert.equal(herite.parType['Deux RDV actifs sur un créneau'],2,'toString n\'est pas un statut libéré');
assert.equal(herite.reattributions,0);
// 3. bilan absent ou valeur manquante : « non comparé », jamais zéro
const absent=A.comparer(r,()=>null,noms);
assert(absent.length&&absent.every(e=>e.statut==='non comparé'),'bilan absent signalé');
const trou=A.comparer(r,(m,c)=>{const d=bilan(m,c);return d&&Object.assign({},d,{accompanied:undefined});},noms);
assert(trou.some(e=>e.indicateur==='Personnes accompagnées'&&e.statut==='non comparé'),'valeur manquante signalée');
const sansAnnule=A.comparer(r,(m,c)=>{const d=bilan(m,c);if(!d)return d;const bs=Object.assign({},d.byStatut);delete bs.annule;return Object.assign({},d,{byStatut:bs});},noms);
assert(sansAnnule.some(e=>e.indicateur==='Statut annule'&&e.statut==='non comparé'),'compteur de statut absent : non comparé, pas zéro');
assert.match(A.rapportTexte(r,absent),/non comparée/);assert.match(A.rapportTexte(r,ecarts),/Non couvert par la comparaison/);
// 4. démarches modifiées : écart détecté
const dem999=A.comparer(r,(m,c)=>{const d=bilan(m,c);return d&&Object.assign({},d,{demarches:d.demarches.map(x=>Object.assign({},x,{n:999}))});},noms);
assert(dem999.some(e=>/^Démarche n°/.test(e.indicateur)&&e.statut==='écart'),'démarches faussées détectées');
const vide=A.auditer({history:[]},{maintenant});
assert.equal(vide.fiches,0);assert.deepEqual(A.comparer(vide,bilan,{}),[]);
assert.match(A.rapportTexte(vide,[]),/sauvegarde vide/,'une sauvegarde vide est signalée, pas présentée comme sans écart');
console.log('Audit de sauvegarde : 16 types d\'anomalies, réattribution distinguée, recomptage = bilan de l\'application, écart détecté, rapport anonyme, lecture seule OK.');
