/* AG-022 : origine de la date de réception — classement du délai d'attente, listes recalculées, filtres période/CMS,
   reclassement après confirmation, préparation et « Fiches préparées par mois » inchangées. Vraies fonctions d'index.html,
   données exclusivement fictives. Les écritures (Historique, copie, listes, panne) sont testées dans check-ecritures.js.
   Exécuter : node scripts/check-reception.js   (aussi TZ=Europe/Paris ; INDEX_HTML=<copie> pour une mutation) */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start+from.length);assert(end>start,to);return html.slice(start,end);}
const S={history:[],permanences:[],statsPeriod:'all',statsCMS:''};
const ctx=vm.createContext({Date,S,lsSet:()=>true,pk:k=>'ess-p1-'+k});
vm.runInContext([
  section('function toLocalDateStr(d){','\n'),
  section('var DUREE_CRENEAU=60;','function hasConflict('),
  section('function preparationDayUTC(value){','/* ============================== RENDER: STATS'),
].join('\n'),ctx);
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const J=v=>JSON.parse(JSON.stringify(v));
function f(id,o){return Object.assign({id,nom:'FICTIF '+id,prenom:'Exemple',msgType:'confirmation',statut:'realise',commune:'Marmande',heure:'09:30'},o);}

// 1. Lecteur d'origine : quatre situations distinctes (postérieure = enregistrée, jugée au classement).
assert.deepEqual(J(ctx.etatReception(f('a',{date:'2026-10-20',dateReception:'2026-10-05'}))),{etat:'enregistree',date:'2026-10-05',reprise:''});
assert.deepEqual(J(ctx.etatReception(f('b',{date:'2026-10-20',dateDemande:'2026-10-02'}))),{etat:'reprise',date:'',reprise:'2026-10-02'});
assert.equal(ctx.etatReception(f('c',{date:'2026-10-20',dateReception:'',dateDemande:'2026-10-02'})).etat,'absente','vide explicite : jamais de reprise');
assert.equal(ctx.etatReception(f('d',{date:'2026-10-20',dateReception:'2026-13-40',dateDemande:'2026-10-02'})).invalide,true,'invalide : signalée, jamais reprise');
assert.equal(ctx.etatReception(f('e',{date:'2026-10-20'})).etat,'absente');
assert.equal(ctx.receptionChampInitial(f('b',{date:'2026-10-20',dateDemande:'2026-10-02'})),'','reprise jamais préremplie');
// receptionDateFor (préparation, AG-002) garde sa reprise : contrat non rouvert.
assert.equal(ctx.receptionDateFor(f('b',{date:'2026-10-20',dateDemande:'2026-10-02'})),'2026-10-02');

// 2. Classement et listes sur un historique fictif, filtres période/CMS de Statistiques.
const now=new Date();const today=ctx.parisDayStr(now);
const jours=n=>{const d=new Date(now.getTime()-n*86400000);return ctx.parisDayStr(d);};
S.history=[
  f('m1',{date:jours(5),dateReception:jours(15)}),                      /* mesurable, 10 j */
  f('r1',{date:jours(6),dateDemande:jours(20)}),                        /* reprise à confirmer */
  f('v1',{date:jours(7),dateReception:'',dateDemande:jours(20)}),       /* vide explicite */
  f('i1',{date:jours(8),dateReception:'pas une date'}),                 /* invalide */
  f('p1',{date:jours(9),dateReception:jours(2)}),                       /* postérieure au RDV */
  f('r2',{date:jours(10),dateDemande:jours(30),commune:'Fumel'}),       /* reprise, autre CMS */
  f('r3',{date:jours(200),dateDemande:jours(230)}),                     /* reprise, hors période 1 mois */
  f('x1',{date:jours(5),dateDemande:jours(20),msgType:'indispo'}),      /* créneau bloqué : hors population */
];
const premAvant=J(ctx.fichesPrepareesModel(S.history,null,today,''));
const prepAvant=J(ctx.preparationStats(S.history));
function compter(period,cms){S.statsPeriod=period;S.statsCMS=cms;const e=ctx.statsRdvModel(S.history,[],period,cms,new Date()).entries;return ctx.delaiAttenteParCms(e);}
let r=compter('all','');
assert.deepEqual([r.global.mesurables,r.global.reprise,r.global.sansReception,r.global.incoherente],[1,3,2,1],'tout : 1 mesurable, 3 à confirmer, 2 absentes/invalides, 1 après RDV');
r=compter('1m','');assert.equal(r.global.reprise,2,'1 mois : la reprise ancienne sort');
r=compter('1m','Marmande');assert.deepEqual([r.global.mesurables,r.global.reprise,r.global.sansReception,r.global.incoherente],[1,1,2,1],'1 mois + Marmande');
r=compter('all','fumel');assert.equal(r.global.reprise,1,'CMS comparé par cmsKey');assert.equal(r.global.mesurables,0);
// listes recalculées = effectifs, motifs distincts
S.statsPeriod='1m';S.statsCMS='Marmande';
const lr=ctx.delaiListeLignes('reprise',null);assert.deepEqual(J(lr).map(x=>[x.personne,x.rec,x.motif]),[['Exemple FICTIF r1',jours(20),'reprise']]);
const ls=ctx.delaiListeLignes('sans_reception',null);assert.deepEqual(J(ls).map(x=>[x.personne,!!x.invalide]),[['Exemple FICTIF i1',true],['Exemple FICTIF v1',false]],'tri par date du RDV');
assert.equal(ctx.motifExclusion(ls[0]),'Réception invalide (valeur illisible)');assert.equal(ctx.motifExclusion(ls[1]),'Réception absente');
assert.equal(ctx.motifExclusion(lr[0]),'Ancienne date du message reprise, à confirmer');
assert.equal(ctx.delaiListeLignes('apres_rdv',null).length,1);assert.equal(ctx.delaiListeLignes('mesures',null).length,1);
assert.equal(ctx.delaiListeLignes('reprise','fumel').length,0,'filtre CMS de ligne combiné au filtre de la page');
assert.equal(lr[0].ref,S.history[1],'la ligne désigne la fiche elle-même, pas une copie');

// 3. Confirmation de la reprise r1 : reclassée mesurable, effectifs recalculés ; rien d'autre ne bouge.
const res=ctx.enregistrerReception(lr[0].ref,lr[0].rec);assert.equal(res.ok,true);
r=compter('1m','Marmande');assert.deepEqual([r.global.mesurables,r.global.reprise,r.global.sansReception,r.global.incoherente],[2,0,2,1],'r1 reclassée mesurable');
assert.equal(ctx.delaiListeLignes('mesures',null).some(x=>x.personne==='Exemple FICTIF r1'&&x.d===14),true,'délai calculé sur la date confirmée');
assert.equal(ctx.delaiListeLignes('reprise',null).length,0);
assert.deepEqual(J(ctx.fichesPrepareesModel(S.history,null,today,'')),premAvant,'« Fiches préparées par mois » inchangé');
assert.deepEqual(J(ctx.preparationStats(S.history)),prepAvant,'préparation moyenne inchangée (même date lue)');
assert.equal(own(S.history[1],'premierePreparationAt'),false,'aucune première préparation inventée');
assert.equal(S.history[1].dateDemande,jours(20),'date du message conservée');
// 4. Saisie d'une autre date sur la fiche vide v1 ; puis date postérieure saisie sur i1 → « Après le RDV ».
assert.equal(ctx.enregistrerReception(S.history[2],jours(12)).ok,true);
assert.equal(ctx.enregistrerReception(S.history[3],jours(1)).ok,true);
r=compter('1m','Marmande');assert.deepEqual([r.global.mesurables,r.global.reprise,r.global.sansReception,r.global.incoherente],[3,0,0,2]);
// 5. Médiane : calculée dans le modèle, jamais affichée (AG-021 conservé), aucune moyenne.
const card=section('function carteDelaiAttente(','/* ============================== AG-020');
assert.equal(/\.mediane\b|medianePremiers|medianeNombres|moyenne/i.test(card.replace(/Médiane masquée/g,'')),false,'carte sans médiane ni moyenne');
console.log('AG-022 : origine de la réception (4 cas), filtres période/CMS, listes recalculées, reclassement après confirmation, préparation inchangée OK.');
