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
// A24 (Codex) : 0 jour ouvré n'est pas « le jour même » quand la préparation tombe un férié. Vrai fragment de rendu des tuiles,
// exécuté avec un DOM minimal : réception mercredi 13/05/2026, préparation jeudi 14/05/2026 (Ascension).
{const deb=html.indexOf("  var reactC=el('div',{class:'ui-stats-metric',id:'ui-preparation-metric'});"),fin=html.indexOf('  wrap.appendChild(kpiRow);',deb);
 assert(deb>0&&fin>deb,'fragment des tuiles de réactivité introuvable');
 const n=(tag,attrs,kids)=>{const o={tag,attrs:attrs||{},kids:[],dataset:{},appendChild(c){this.kids.push(c);return c;}};if(kids!=null)(Array.isArray(kids)?kids:[kids]).forEach(k=>o.kids.push(k));return o;};
 const txt=o=>typeof o==='string'?o:o.kids.map(txt).join(' | ');
 const asc={dateReception:'2026-05-13',premierePreparationAt:'2026-05-14T10:00:00+02:00'},ascAncienne={dateReception:'2026-05-13',ts:'2026-05-14T10:00:00+02:00',msgType:'confirmation'};
 assert.equal(context.joursOuvresFrance('2026-05-13','2026-05-14'),0,'Ascension : 0 jour ouvré');
 const rc=vm.createContext({el:n,attachPermanenceTip(){},kpiRow:n('div'),prepMetrics:context.preparationStats([asc]),legacyPrep:context.legacyPreparationEstimate([ascAncienne]),Math});
 vm.runInContext(html.slice(deb,fin),rc);const t=txt(rc.kpiRow);
 assert.equal(rc.prepMetrics.avg,0);assert.equal(rc.legacyPrep.median,0);assert.equal(rc.legacyPrep.sameDay,0,'dates civiles différentes');
 assert.equal(/jour même/i.test(t.replace(/Traitées le jour même \(estimation\)/,'').replace(/0 % \| /,'')),false,'aucun « le jour même » tiré de 0 jour ouvré : '+t);
 assert.ok(t.startsWith('0 j | Préparation moy. (jours ouvrés)'),'tuile : 0 j ouvré');
 assert.ok(t.includes('0 % | Traitées le jour même (estimation)'),'estimation : pourcentage fondé sur les dates civiles');
 assert.ok(t.includes('médiane : 0 j ouvré (fériés exclus)'),'estimation : médiane en jours ouvrés');}
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
