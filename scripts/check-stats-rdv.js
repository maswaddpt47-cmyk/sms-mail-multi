/* Vérification ciblée du modèle statistique, données exclusivement fictives.
   Exécuter : node scripts/check-stats-rdv.js */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);return html.slice(start,html.indexOf(to,start));}
const ctx=vm.createContext({Date});
vm.runInContext(section('function toLocalDateStr(d){','\n')+'\n'+section('var DUREE_CRENEAU=60;','function hasConflict(')+section('function statsRdvModel(','/* ============================== RENDER: STATS'),ctx);
function row(id,date,status,time,commune='A',type='confirmation'){return{id,date,statut:status,heure:time,commune,msgType:type,nom:'FICTIF '+id,prenom:'Exemple',demarche:status==='realise'?'Démarche fictive':'Autre',ts:'01/01/2000'};}
const date='2026-10-20',today=new Date(2026,9,22,12);
const keys=['realise','confirme','en_attente','annule','excuse','lapin','pas_de_retour'];
const history=keys.map((k,i)=>row(String(i),date,k,String(9+i).padStart(2,'0')+':30'));
history.push(row('bloc',date,null,'16:30','A','indispo'),row('ancien','2026-05-01','realise','09:30'),row('futur','2026-12-01','confirme','09:30'),row('autre',date,'realise','09:30','B'),row('sans date','','realise','09:30'));
const perm={exceptDate:date,commune:'A',debut:'09:30',fin:'16:30',archived:true};
const days=[perm,{...perm,id:'doublon'}];const before=JSON.stringify({history,days});
const calculate=(period='1m',cms='A')=>ctx.statsRdvModel(history,days,period,cms,today);
const m=calculate();
// Même population : chaque statut est présent une fois, année/mois issus du RDV.
assert.equal(m.entries.length,7);assert.equal(m.past.length,7);assert.equal(m.realised.length,1);assert.equal(m.lapins.length,1);
assert.equal(Object.values(m.byMonth['2026-10']).reduce((a,b)=>a+b,0),7);
keys.forEach(k=>assert.equal(m.byMonth['2026-10'][k],1));assert.equal(m.byDemarche['Démarche fictive'],1);
// La planification future exclut cette permanence passée/archivée.
assert.equal(m.days.length,0);assert.equal(m.free,0);
assert.equal(calculate('all').entries.length,9);assert.equal(calculate('1m','B').entries.length,1);
assert.equal(JSON.stringify(calculate()),JSON.stringify(m));assert.equal(JSON.stringify({history,days}),before);
const empty=ctx.statsRdvModel([],[],'1m','',today);assert.equal(empty.entries.length,0);assert.equal(empty.free,0);
assert.equal(ctx.statsRdvModel([],[],'1m','',new Date(2026,2,31,12)).start,'2026-02-28');
// Capacité utilisateur de six, indépendante de la grille Agenda et du filtre historique.
const future='2026-10-23';
const futurePerm={...perm,exceptDate:future,archived:false};
const futureDays=[futurePerm,{...futurePerm,id:'doublon futur'},perm,{...futurePerm,exceptDate:'2026-10-24',archived:true},{...futurePerm,commune:'B'}];
const active=['09:30','10:30','11:30','13:30','14:30'].map((t,i)=>row('prévu-'+i,future,i===4?'en_attente':'confirme',t));
const replaced=row('ancienne annulation',future,'annule','09:30');
const plan=ctx.statsRdvModel(active.concat(replaced),futureDays,'1m','A',today);
assert.equal(plan.entries.length,0);assert.equal(plan.days.length,1);assert.equal(plan.days[0].total,6);assert.equal(plan.days[0].occupied,5);assert.equal(plan.free,1);assert.equal(plan.days[0].pending,1);
const blocked=ctx.statsRdvModel(active.slice(0,4).concat(row('indispo',future,null,'14:30','A','indispo'),row('excusé',future,'excuse','15:30')),futureDays,'1m','A',today);
assert.equal(blocked.days[0].occupied,4);assert.equal(blocked.days[0].blocked,1);assert.equal(blocked.free,1);
const overload=ctx.statsRdvModel(['09:30','10:30','11:30','12:30','13:30','14:30','15:30'].map((t,i)=>row('surplus-'+i,future,'confirme',t)),futureDays,'1m','A',today);
assert.equal(overload.days[0].occupied,7);assert.equal(overload.free,0);assert.equal(overload.days[0].overbooked,1);
const untouched=JSON.stringify({active,futureDays});ctx.statsRdvModel(active,futureDays,'1m','A',today);assert.equal(JSON.stringify({active,futureDays}),untouched);
console.log('Statistiques RDV et planification : périodes/CMS, six places, annulation remplacée, blocage, dépassement, idempotence et lecture seule OK.');
