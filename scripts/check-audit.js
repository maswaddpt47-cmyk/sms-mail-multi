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
function f(date,heure,commune,statut,nom,prenom,extra){return Object.assign({date,heure,commune,statut,nom:NOM_SECRET+'-'+nom,prenom,msgType:'confirmation',channel:'sms',ts:'01/10/2026 10:00:00',telephone:TEL_SECRET,body:'message '+NOM_SECRET},extra||{});}
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
assert.equal(tous.statuts.en_attente,3);   // en_attente + vide + inconnu

// comparaison avec le vrai calcul de l'application : aucun écart
const noms={};sauvegarde.history.forEach(h=>{if(h.commune&&!noms[A.cle(h.commune)])noms[A.cle(h.commune)]=h.commune.trim();});
const bilan=(m,c)=>app.monthlyReportData(sauvegarde.history,m,c,maintenant);
const ecarts=A.comparer(r,bilan,noms);
assert(ecarts.length>=11*3,'comparaison menée sur plusieurs CMS');   // garde : la comparaison a bien eu lieu
assert.deepEqual(ecarts.filter(e=>e.ecart!==0),[],'bilan de l\'application = recomptage indépendant');
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
console.log('Audit de sauvegarde : 16 types d\'anomalies, réattribution distinguée, recomptage = bilan de l\'application, écart détecté, rapport anonyme, lecture seule OK.');
