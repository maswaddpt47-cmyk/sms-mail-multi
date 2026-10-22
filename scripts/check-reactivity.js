/* Contrôle ciblé du délai réception → première préparation (données fictives).
   Usage : node scripts/check-reactivity.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const begin='/* ============================== PREPARATION METRICS ============================== */';
const end='/* ============================== ARCHIVAGE ANNUEL';
const from=html.indexOf(begin),to=html.indexOf(end,from);
assert(from>=0&&to>from,'Bloc PREPARATION METRICS absent ou incomplet.');
const context=vm.createContext({Date,Intl});
vm.runInContext(html.slice(from,to),context);
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
console.log('Réactivité : '+intervals.length+' intervalles vérifiés ; moyenne, provenance Paris, couverture, idempotence et lecture seule conformes.');
