/* Contrôle ciblé du délai réception → première préparation (données fictives).
   Usage : node scripts/check-reactivity.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
const begin='/* ============================== PREPARATION METRICS ============================== */';
const end='/* ============================== ARCHIVAGE ANNUEL';
const from=html.indexOf(begin),to=html.indexOf(end,from);
assert(from>=0&&to>from,'Bloc PREPARATION METRICS absent ou incomplet.');
const context=vm.createContext({Date,Intl});
vm.runInContext(html.slice(from,to),context);
vm.runInContext(html.match(/function cmsKey\(c\)\{[^\n]*\}/)[0],context);
{const i=html.indexOf('function parisDayStr(');vm.runInContext(html.slice(i,html.indexOf('function cmsKey(',i)),context);}   // AG-016 : lireTs, jourParis (lecteur unique de ts)   // utilisé par preparationCohort (audit 30/10, pt 2)
assert.equal(typeof context.businessDaysBetween,'function');
assert.equal(typeof context.preparationStats,'function');

// Unité : réception exclue, préparation incluse ; seuls samedi/dimanche sont retirés.
const intervals=[
  ['2026-10-16','2026-10-19',1,'vendredi → lundi'],
  ['2026-10-19','2026-10-19',0,'même jour'],
  ['2026-10-17','2026-10-19',1,'samedi → lundi'],
  ['2026-10-16','2026-10-18',0,'week-end sans lundi'],
  ['2026-10-19','2026-10-26',5,'semaine complète'],
  ['2026-03-27','2026-03-30',1,'passage à heure été'],
  ['2026-10-23','2026-10-26',1,'passage à heure hiver'],
  ['2026-12-31','2027-01-04',2,'vendredi férié compté comme jour de semaine'],
  ['2026-10-20','2026-10-19',null,'dates inversées'],
  ['2026-02-30','2026-03-02',null,'jour inexistant'],
  ['2026-10-19T00:00:00Z','2026-10-20',null,'réception non YYYY-MM-DD'],
  ['', '2026-10-19',null,'date absente']
];
intervals.forEach(([start,finish,expected,label])=>assert.equal(context.businessDaysBetween(start,finish),expected,label));

// AG-024 : jours ouvrés hors samedis, dimanches et jours fériés nationaux (réactivité affichée).
assert.equal(typeof context.joursOuvresFrance,'function');
[
  ['2026-10-19','2026-10-19',0,'même jour'],
  ['2026-10-16','2026-10-19',1,'vendredi → lundi'],
  ['2026-04-03','2026-04-07',1,'vendredi → mardi, lundi de Pâques férié'],
  ['2026-05-22','2026-05-26',1,'vendredi → mardi, lundi de Pentecôte férié'],
  ['2026-05-13','2026-05-15',1,'mercredi → vendredi, Ascension (jeudi 14/05) férié'],
  ['2026-11-10','2026-11-12',1,'mardi → jeudi, 11 novembre férié'],
  ['2026-12-31','2027-01-04',1,'jeudi → lundi, 1er janvier (vendredi) férié'],
  ['2026-07-13','2026-07-15',1,'14 juillet (mardi) férié'],
  ['2026-08-14','2026-08-17',1,'15 août un samedi : rien de plus retiré'],
  ['2027-03-26','2027-03-30',1,'Pâques 2027 (28/03) : lundi 29/03 férié'],
  ['2026-10-19','2026-10-26',5,'semaine sans férié'],
  ['2026-10-20','2026-10-19',null,'dates inversées'],
  ['2026-02-30','2026-03-02',null,'jour inexistant'],
  ['', '2026-10-19',null,'date absente']
].forEach(([a,b,att,lbl])=>assert.equal(context.joursOuvresFrance(a,b),att,lbl));
// Jours fériés nationaux : exactement 11 par an, dates de Pâques connues.
const f26=Object.keys(context.joursFeriesFrance(2026)).sort();assert.equal(f26.length,11);
assert.deepEqual(f26,['2026-01-01','2026-04-06','2026-05-01','2026-05-08','2026-05-14','2026-05-25','2026-07-14','2026-08-15','2026-11-01','2026-11-11','2026-12-25']);
assert.ok(context.joursFeriesFrance(2025)['2025-04-21']&&context.joursFeriesFrance(2025)['2025-05-29']&&context.joursFeriesFrance(2025)['2025-06-09'],'2025 : Pâques 20/04');
assert.ok(context.joursFeriesFrance(2028)['2028-04-17'],'2028 : Pâques 16/04');
// La préparation moyenne utilise les jours fériés : réception vendredi 03/04/2026, première préparation mardi 07/04 = 1 (et non 2).
assert.equal(context.preparationStats([{dateReception:'2026-04-03',premierePreparationAt:'2026-04-07T09:00:00+02:00'}]).avg,1,'préparation : lundi de Pâques exclu');
// L'estimation des anciennes fiches (réception → dernier message) aussi : vendredi 03/04 → mardi 07/04 = 1 j ouvré.
assert.equal(context.legacyPreparationEstimate([{dateReception:'2026-04-03',ts:'2026-04-07T10:00:00+02:00',msgType:'confirmation'}]).median,1,'estimation : lundi de Pâques exclu');
// AG-025 : réception → dernier message enregistré, toutes fiches, formats anciens, exclusions avec motif.
assert.equal(typeof context.reactiviteDernierMessage,'function');
const fx=(o)=>Object.assign({msgType:'confirmation',commune:'Fumel',body:'x'},o);
const DM=[
  fx({id:'A',dateDemande:'2026-10-05',ts:'06/10/2026 10:15:00'}),                         // ancien champ + ts texte français : lun → mar = 1
  fx({id:'B',dateReception:'2026-10-09',ts:'2026-10-13T08:00:00.000Z'}),                   // ISO Z (10 h à Paris) : ven → mar = 2
  fx({id:'C',dateReception:'2026-11-10',ts:'2026-11-12T09:00:00+01:00',premierePreparationAt:'2026-11-12T09:00:00+01:00'}),   // 11/11 férié = 1 ; préparation présente : comptée quand même
  fx({id:'J',dateReception:'2026-10-07',ts:'07/10/2026 15:00'}),                           // même jour = 0
  fx({id:'D',dateReception:'2026-10-07',ts:''}),                                           // date du message absente
  fx({id:'E1',dateReception:'2026-10-07',ts:'31/02/2026 10:00'}),                          // impossible
  fx({id:'E2',dateReception:'2026-10-07',ts:'hier'}),                                      // illisible
  fx({id:'F',dateReception:'2026-10-20',ts:'2026-10-15T10:00:00+02:00'}),                  // inversée
  fx({id:'G1',dateReception:'',ts:'2026-10-15T10:00:00+02:00'}),                           // réception absente (champ vide)
  fx({id:'G2',dateReception:'xx',ts:'2026-10-15T10:00:00+02:00'}),                         // réception invalide
  fx({id:'G3',dateDemande:'2026-10-25',ts:'2026-10-26T10:00:00+01:00'}),                   // date du message après le 22/10 : à confirmer
  fx({id:'H1',msgType:'relance',dateReception:'2026-10-07',ts:'2026-10-15T10:00:00+02:00'}),   // suivi
  fx({id:'H2',dateRelance:'2026-10-14',dateReception:'2026-10-07',ts:'2026-10-15T10:00:00+02:00'}),   // suivi
  fx({id:'I',msgType:'indispo',dateReception:'2026-10-07',ts:'2026-10-15T10:00:00+02:00'}),    // créneau bloqué : hors population
  fx({id:'K',commune:'Marmande',dateReception:'2026-10-07',ts:'2026-10-08T10:00:00+02:00'}),   // autre CMS
];
const avantDM=JSON.stringify(DM);
let q=context.reactiviteDernierMessage(DM,null,null,'Fumel');
assert.equal(q.n,4,'A, B, C, J calculables');assert.equal(q.mediane,1,'médiane de 0, 1, 1, 2');assert.equal(q.memeJour,1);
assert.deepEqual(JSON.parse(JSON.stringify(q.exclus)),{ts_absent:1,ts_illisible:2,suivi:2,reception_a_confirmer:1,reception_absente:1,reception_invalide:1,inversee:1});
assert.equal(q.nExclus,9);assert.equal(q.horsPeriodeInconnue,0,'sans période : rien à signaler');
q=context.reactiviteDernierMessage(DM,null,null,'');assert.equal(q.n,5,'tous CMS : K en plus');
q=context.reactiviteDernierMessage(DM,'2026-11-01','2026-11-30','fumel ');
assert.equal(q.n,1,'novembre : C seule');assert.equal(q.mediane,1);assert.equal(q.exclus.ts_absent+q.exclus.ts_illisible,3,'dates illisibles comptées quelle que soit la période');assert.equal(q.horsPeriodeInconnue,3);
assert.equal(q.exclus.inversee,0,'F (octobre) hors période');
assert.equal(JSON.stringify(DM),avantDM,'lecture seule');
// AG-025 tranché (décision de l'utilisateur) : moyenne affichée, une décimale. 0, 1 et 5 jours ouvrés → moyenne 2 (médiane 1).
const MOY=[fx({dateReception:'2026-10-07',ts:'07/10/2026 15:00'}),fx({dateReception:'2026-10-07',ts:'08/10/2026 09:00'}),fx({dateReception:'2026-10-05',ts:'2026-10-12T09:00:00+02:00'})];
q=context.reactiviteDernierMessage(MOY,null,null,'');assert.equal(q.moyenne,2,'moyenne de 0, 1, 5');assert.equal(q.mediane,1);
assert.equal(context.reactiviteDernierMessage(MOY.slice(0,1).concat(MOY.slice(0,2)),null,null,'').moyenne,0.3,'0, 0, 1 → 0,3 (une décimale)');
assert.equal(context.reactiviteDernierMessage([],null,null,'').moyenne,null,'aucune fiche calculable : pas de moyenne');
assert.equal(context.reactiviteDernierMessage([fx({dateReception:'2026-10-07',ts:'07/10/2026 15:00'}),fx({dateReception:'2026-10-07',ts:'08/10/2026 09:00'})],null,null,'').mediane,0.5,'médiane paire : moyenne des deux valeurs centrales (0 et 1)');
// Texte réellement affiché : vrai fragment des tuiles avec un DOM minimal.
const deb=html.indexOf("  var reactC=el('div',{class:'ui-stats-metric',id:'ui-preparation-metric'});"),fin=html.indexOf('  wrap.appendChild(kpiRow);',deb);
assert(deb>0&&fin>deb,'fragment des tuiles de réactivité introuvable');
const nd=(tag,attrs,kids)=>{const o={tag,attrs:attrs||{},kids:[],dataset:{},appendChild(c){this.kids.push(c);return c;}};if(kids!=null)(Array.isArray(kids)?kids:[kids]).forEach(k=>o.kids.push(k));return o;};
const tx=o=>typeof o==='string'?o:o.kids.map(tx).join(' | ');
function rendre(hist,prep){const rc=vm.createContext({el:nd,attachPermanenceTip(){},kpiRow:nd('div'),prepMetrics:context.preparationStats(prep),S:{history:hist,statsCMS:'Fumel'},rdv:{start:null,today:'2026-12-31'},
  reactiviteDernierMessage:context.reactiviteDernierMessage,MOTIFS_DERNIER_MESSAGE:context.MOTIFS_DERNIER_MESSAGE,Math,Object});vm.runInContext(html.slice(deb,fin),rc);return rc.kpiRow.kids.map(tx);}
const [tPrep,tDM]=rendre(DM,DM);
{const [,tM]=rendre(MOY.map(x=>Object.assign({},x)),[]);assert.ok(tM.startsWith('33 % | Le même jour — réception → dernier message enregistré | Moyenne : 2 j ouvrés (week-ends et fériés nationaux exclus) · 3 fiches calculables'),'tuile : pourcentage en grand, moyenne en note : '+tM);}
{const [,tV]=rendre([],[]);assert.ok(tV.startsWith('— | Le même jour — réception → dernier message enregistré | 0 fiche calculable'),'sans fiche : tiret, sans moyenne : '+tV);}
assert.ok(tPrep.startsWith('1 j | Préparation moy. (jours ouvrés)'),'première préparation à part : '+tPrep);
assert.ok(tPrep.includes('1 dossier mesuré'),'première préparation : seule C');
assert.ok(tDM.startsWith('25 % | Le même jour — réception → dernier message enregistré | Moyenne : 1 j ouvré (week-ends et fériés nationaux exclus) · 4 fiches calculables'),'tuile : '+tDM);
assert.ok(tDM.includes('4 fiches calculables · même jour = même date civile'),'effectif calculable');
assert.ok(tDM.includes('Exclues (9) : 1 date du message absente · 2 date du message illisible ou impossible · 2 dernier message de suivi (relance, rappel, lapin) · 1 réception à confirmer · 1 réception absente · 1 réception invalide · 1 dernier message antérieur à la réception.'),'motifs : '+tDM);
assert.ok(tDM.includes('pas forcément le premier envoi'),'limite écrite');
assert.equal(/premier envoi :|date d.envoi/i.test(tDM.replace('pas forcément le premier envoi (non enregistré)','')),false,'jamais présenté comme le premier envoi');
// A24 (Codex) : 0 jour ouvré n'est pas « le jour même » : réception mercredi 13/05/2026, message jeudi 14/05 (Ascension).
const asc={dateReception:'2026-05-13',premierePreparationAt:'2026-05-14T10:00:00+02:00',ts:'2026-05-14T10:00:00+02:00',commune:'Fumel',msgType:'confirmation'};
assert.equal(context.joursOuvresFrance('2026-05-13','2026-05-14'),0,'Ascension : 0 jour ouvré');
const [aPrep,aDM]=rendre([asc],[asc]);
assert.ok(aPrep.startsWith('0 j | Préparation moy.'),'A24 tuile : '+aPrep);assert.ok(aDM.startsWith('0 % | Le même jour — réception → dernier message enregistré | Moyenne : 0 j ouvré'),'A24 dernier message : '+aDM);
assert.ok(aDM.includes('1 fiche calculable'),'dates civiles différentes : 0 %, alors que 0 jour ouvré');
assert.equal(/jour même/i.test(aPrep+aDM),false,'aucun « jour même » tiré de 0 jour ouvré');
// Les archives gardent lun.–ven. (AG-017 clos) : même intervalle = 2.
assert.equal(context.businessDaysBetween('2026-04-03','2026-04-07'),2,'archives : méthode inchangée');

const row=(id,dateReception,premierePreparationAt)=>({id,msgType:'confirmation',channel:'sms',dateReception,premierePreparationAt});
const snapshot=value=>JSON.stringify(value);
const check=(entries,expected,label)=>{
  const before=snapshot(entries),result=context.preparationStats(entries);
  assert.deepEqual(JSON.parse(snapshot(result)),expected,label);
  assert.equal(snapshot(entries),before,label+' : entrée modifiée');
  assert.equal(snapshot(context.preparationStats(entries)),snapshot(result),label+' : résultat non idempotent');
  return result;
};
// Même population / recomptage indépendant : 0 jour et 1 jour font une moyenne de 0,5.
const valid=[row('fictif-same-day','2026-10-19','2026-10-19T08:00:00Z'),row('fictif-weekend','2026-10-16','2026-10-19T08:00:00Z')];
valid.forEach(Object.freeze);Object.freeze(valid);
check(valid,{avg:0.5,count:2,excluded:0},'moyenne sans arrondir chaque délai');
// Provenance : le jour du timestamp est celui de Paris, y compris autour de minuit.
check([
  row('fictif-utc-sunday','2026-10-16','2026-10-18T22:30:00Z'),
  row('fictif-offset-monday','2026-10-16','2026-10-19T00:30:00+02:00'),
  row('fictif-winter-midnight','2026-01-02','2026-01-04T23:30:00Z')
],{avg:1,count:3,excluded:0},'jour Europe/Paris et fuseau explicite');
// Les anciennes dates ambiguës ne reconstituent jamais une première préparation.
const invalid=[
  {id:'fictif-legacy',msgType:'confirmation',dateDemande:'2026-10-16',ts:'19/10/2026 10:00:00'},
  row('fictif-no-reception','','2026-10-19T08:00:00Z'),
  row('fictif-no-timezone','2026-10-16','2026-10-19T10:00:00'),
  row('fictif-invalid-day','2026-02-30','2026-03-02T08:00:00Z'),
  row('fictif-backwards','2026-10-20','2026-10-19T08:00:00Z')
];
check(invalid,{avg:null,count:0,excluded:invalid.length},'données manquantes, anciennes ou incohérentes');
check(valid.concat(invalid,{id:'fictif-blocked',msgType:'indispo'}),{avg:0.5,count:2,excluded:invalid.length},'indisponibilités hors population');
check([],{avg:null,count:0,excluded:0},'population vide');
// La réception déjà renseignée dans l'ancien champ est conservée comme point zéro.
check([{msgType:'confirmation',dateDemande:'2026-10-16',premierePreparationAt:'2026-10-19T08:00:00Z'}],{avg:1,count:1,excluded:0},'réception historique et première préparation connue');
check([{msgType:'confirmation',dateReception:'',dateDemande:'2026-10-16',premierePreparationAt:'2026-10-19T08:00:00Z'}],{avg:null,count:0,excluded:1},'nouvelle réception vide sans repli sur date du message');
assert.equal(context.receptionDateFor({dateDemande:'2026-10-16'}),'2026-10-16');
assert.equal(context.receptionDateFor({dateReception:'2026-10-15',dateDemande:'2026-10-16'}),'2026-10-15');
console.log('Réactivité : '+intervals.length+' intervalles vérifiés ; moyenne, provenance Paris, couverture, idempotence et lecture seule conformes.');

// Audit 30/10, pt 5 : « le jour même » = même date civile, pas zéro jour ouvré (vendredi → dimanche = 0 jour ouvré, 2 jours civils).
const lp=context.legacyPreparationEstimate([
  {date:'2026-11-02',heure:'09:30',ts:'25/10/2026 10:00',dateReception:'2026-10-23'},   // vendredi → dimanche : 0 jour ouvré, pas le même jour
  {date:'2026-11-02',heure:'09:30',ts:'26/10/2026 10:00',dateReception:'2026-10-26'}]); // même jour
assert.equal(lp.count,2);assert.equal(lp.sameDay,1);
// Audit 30/10, pt 2 : filtre CMS insensible à la casse et aux accents.
const coh=context.preparationCohort([{commune:'Fumel',ts:'01/10/2026',msgType:'confirmation'},{commune:'FUMEL ',ts:'01/10/2026',msgType:'confirmation'},{commune:'Agen',ts:'01/10/2026',msgType:'confirmation'}],null,null,'fumel');
assert.equal(coh.length,2);
console.log('Audit 30/10 : jour même, filtre CMS conformes.');
