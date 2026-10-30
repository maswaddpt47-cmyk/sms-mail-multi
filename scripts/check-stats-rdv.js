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
// Deux demi-journées complémentaires : ne pas compter les fermetures opposées.
const splitDate='2026-11-04',am='Lieu fictif matin',pm='Lieu fictif après-midi';
const splitPerms=[{...futurePerm,exceptDate:splitDate,commune:am},{...futurePerm,exceptDate:splitDate,commune:pm}];
const splitHistory=['09:30','10:30','11:30'].map((t,i)=>row('matin-'+i,splitDate,i===2?'en_attente':'confirme',t,am));
splitHistory.push(row('après-midi',splitDate,'confirme','14:00',pm));
for(const t of ['12:30','13:30','14:30','15:30','16:30'])splitHistory.push(row('fermé matin-'+t,splitDate,null,t,am,'indispo'));
for(const t of ['09:30','10:30','11:30','12:30'])splitHistory.push(row('fermé après-midi-'+t,splitDate,null,t,pm,'indispo'));
const beforeSplit=JSON.stringify({splitHistory,splitPerms}),split=ctx.statsRdvModel(splitHistory,splitPerms,'1m','',today);
assert.equal(split.days.length,2);assert.equal(split.days.reduce((n,d)=>n+d.total,0),5); // 14:00 hors grille masque 13:30 et 14:30 : l'après-midi n'a plus que 2 places (28/10)
const morning=split.days.find(d=>d.commune===am),afternoon=split.days.find(d=>d.commune===pm);
assert.equal(morning.half,'morning');assert.equal(morning.total,3);assert.equal(morning.occupied,3);assert.equal(morning.blocked,0);assert.equal(morning.free,0);assert.equal(morning.pending,1);assert.equal(morning.overbooked,0);
assert.equal(afternoon.half,'afternoon');assert.equal(afternoon.total,2);assert.equal(afternoon.occupied,1);assert.equal(afternoon.blocked,0);assert.equal(afternoon.free,1);assert.equal(split.free,1);assert.equal(afternoon.freeHours.join(','),'15:30');
const filtered=ctx.statsRdvModel(splitHistory,splitPerms,'1m',pm,today);assert.equal(filtered.days.length,1);assert.equal(filtered.days[0].total,2);assert.equal(filtered.free,1);
assert.equal(JSON.stringify({splitHistory,splitPerms}),beforeSplit);
// Créneaux libres chevauchés par un RDV hors grille : masqués (28/10, Saint-Pardoux 04/11 : RDV à 14:00, 15:00, 16:00).
const spC='Lieu fictif décalé',spPerm={...futurePerm,exceptDate:splitDate,commune:spC};
const spHist=[row('d14',splitDate,'confirme','14:00',spC),row('d15',splitDate,'confirme','15:00',spC),row('d16',splitDate,'confirme','16:00',spC)];
for(const t of ['09:30','10:30','11:30','12:30'])spHist.push(row('fermé matin sp-'+t,splitDate,null,t,spC,'indispo'));
const spSlots=ctx.getSlots(spC,splitDate,spHist,spPerm);
assert.equal(spSlots.filter(x=>!x.taken).length,0);assert.equal(spSlots.masquees.map(x=>x.heure).join(','),'13:30,14:30,15:30');
const spDay=ctx.statsRdvModel(spHist,[spPerm],'1m','',today).days[0];
assert.equal(spDay.occupied,3);assert.equal(spDay.free,0);assert.equal(spDay.marks.filter(m=>m==='free').length,0);assert.equal(spDay.freeHours.length,0);
// Non-régression : RDV à l'heure pile ou libéré → rien n'est masqué.
const onGrid=ctx.getSlots(spC,splitDate,[row('p1',splitDate,'confirme','14:30',spC)],spPerm);assert.equal(onGrid.masquees.length,0);assert.ok(onGrid.some(x=>x.heure==='13:30'&&!x.taken));
const freed=ctx.getSlots(spC,splitDate,[row('p2',splitDate,'annule','14:00',spC)],spPerm);assert.equal(freed.masquees.length,0);
// Le jour même, une place libérée n'est pas réattribuable ; les jours futurs la rendent libre.
const todayStr='2026-10-22',tp={...perm,exceptDate:todayStr,archived:false};
const sameDay=ctx.statsRdvModel([row('s1',todayStr,'lapin','09:30'),row('s2',todayStr,'lapin','10:30'),row('s3',todayStr,'confirme','11:30'),row('s4',todayStr,'annule','13:30'),row('s5',todayStr,'excuse','14:30'),row('s6',todayStr,'pas_de_retour','15:30')],[tp],'1m','A',today);
const sd=sameDay.days[0];assert.equal(sd.occupied,1);assert.equal(sd.releasedN,5);assert.equal(JSON.stringify(sd.released),JSON.stringify({lapin:2,excuse:1,annule:1,pas_de_retour:1}));assert.equal(sd.free,0);assert.equal(sameDay.free,0);
// Créneau réattribué : titulaire actif → réservé, plus de place libérée comptée.
const realloc=ctx.statsRdvModel([row('r1',todayStr,'lapin','09:30'),row('r2',todayStr,'confirme','09:30')],[tp],'1m','A',today).days[0];
assert.equal(realloc.occupied,1);assert.equal(realloc.releasedN,0);assert.equal(realloc.free,5);
// Même lapin sur un jour futur : place libre immédiatement (comportement inchangé).
const futureLapin=ctx.statsRdvModel([row('f1',future,'lapin','09:30')],[futurePerm],'1m','A',today).days[0];
assert.equal(futureLapin.releasedN,0);assert.equal(futureLapin.free,6);
// Cases en ordre chronologique, tous types mêlés ; les places disponibles viennent après.
const chrono=ctx.statsRdvModel([row('c1',todayStr,'confirme','09:30'),row('c2',todayStr,'lapin','10:30'),row('c3',todayStr,'lapin','11:30'),row('c4',todayStr,'en_attente','13:30'),row('c5',todayStr,'confirme','14:30')],[tp],'1m','A',today).days[0];
assert.equal(chrono.marks.join(','),'booked,lapin,lapin,pending,booked,free');assert.equal(chrono.free,1);
const unsorted=ctx.statsRdvModel([row('u1',todayStr,'en_attente','15:30'),row('u2',todayStr,'confirme','09:30')],[tp],'1m','A',today).days[0];
assert.equal(unsorted.marks.join(','),'booked,free,free,free,free,pending');   // la barre suit les créneaux : 09:30 occupé, libres, 15:30 en attente
// Lapins par permanence passée : groupés date+CMS, plus récents d'abord, total = tous les RDV du jour.
const lp=ctx.statsRdvModel([row('l1','2026-10-20','lapin','09:30'),row('l2','2026-10-20','confirme','10:30'),row('l3','2026-10-21','realise','09:30'),row('l4','2026-10-21','lapin','10:30','B'),row('l5','2026-10-21','lapin','11:30','B'),row('l6',todayStr,'lapin','09:30')],[],'all','',today);
assert.equal(lp.lapinDays.map(d=>d.date+d.commune+d.lapins+'/'+d.total).join(','),'2026-10-22A1/1,2026-10-21B2/2,2026-10-20A1/2');
assert.equal(ctx.statsRdvModel([row('l7','2026-10-20','lapin','09:30','B')],[],'all','A',today).lapinDays.length,0);
// Créneaux, pas fiches : trois fiches sur 14:00 (réalisé, annulé, excusé) ne valent qu'un créneau.
const slotCount=ctx.statsRdvModel([row('s1',todayStr,'lapin','10:30'),row('s2',todayStr,'lapin','11:30'),row('s3',todayStr,'realise','14:00'),row('s4',todayStr,'annule','14:00'),row('s5',todayStr,'excuse','14:00'),row('s6',todayStr,'lapin','14:00')],[],'all','',today).lapinDays[0];
assert.equal(slotCount.lapins+'/'+slotCount.total,'3/3');
const slotCount2=ctx.statsRdvModel([row('t1',todayStr,'lapin','10:30'),row('t2',todayStr,'lapin','10:30'),row('t3',todayStr,'realise','14:00'),row('t4',todayStr,'annule','14:00')],[],'all','',today).lapinDays[0];
assert.equal(slotCount2.lapins+'/'+slotCount2.total,'1/2');
// Taux par créneau : 14:00 porte réalisé+annulé+excusé = 1 créneau réalisé ; cas 23/10 réel : 2 lapins sur 6.
const sr=ctx.statsRdvModel([row('q1',todayStr,'realise','09:30'),row('q2',todayStr,'lapin','10:30'),row('q3',todayStr,'lapin','11:30'),row('q4',todayStr,'realise','14:00'),row('q5',todayStr,'annule','14:00'),row('q6',todayStr,'excuse','14:00'),row('q7',todayStr,'realise','15:00'),row('q8',todayStr,'realise','16:00')],[],'all','A',today).slotRates;
assert.equal(sr.total+'/'+sr.realised+'/'+sr.lapins,'6/4/2');
const both=ctx.statsRdvModel([row('b1',todayStr,'lapin','10:30'),row('b2',todayStr,'realise','10:30')],[],'all','A',today).slotRates;
assert.equal(both.total+'/'+both.realised+'/'+both.lapins,'1/1/1');
// Remplissage (30/10) : base de 6 places par journée (date + CMS) portant un RDV avec heure ; sans heure et indispo hors compte.
assert.equal(sr.jours+'/'+sr.places,'1/6');
const fill=ctx.statsRdvModel([row('f1',todayStr,'realise','09:30'),row('f2',todayStr,'realise','10:30','B'),row('f3','2026-03-02','lapin','09:30'),row('f4',todayStr,'realise',''),row('f5',todayStr,null,'11:30','A','indispo')],[],'all','',today).slotRates;
assert.equal(fill.jours+'/'+fill.places+'/'+fill.total,'3/18/3');
// Audit Codex du 30/10 (AG-006) — identiques en UTC et Europe/Paris.
// Pt 1 : délai message → RDV en jours civils, zéro inclus, antérieur ou invalide exclus.
assert.equal(ctx.delaiRdvJours('25/10/2026 10:00','2026-10-25'),0);assert.equal(ctx.delaiRdvJours('25/10/2026','2026-11-04'),10);
assert.equal(ctx.delaiRdvJours('25/10/2026','2026-10-24'),null);assert.equal(ctx.delaiRdvJours('31/02/2026','2026-03-05'),null);assert.equal(ctx.delaiRdvJours('','2026-03-05'),null);
assert.equal(ctx.delaiRdvJours('28/03/2026','2026-03-30'),2);   // passage à l'heure d'été
// Pt 3 : début de période d'après la date civile Paris (30/09 22:30 UTC = 01/10 00:30 Paris), quel que soit le fuseau de l'appareil.
assert.equal(ctx.statsRdvModel([],[],'1m','',new Date(Date.UTC(2026,8,30,22,30))).start,'2026-09-01');
// Pt 4 : clé usager avec séparateur ; homonymes = un seul usager (limite connue).
assert.notEqual(ctx.usagerKey({nom:'AB',prenom:'C'}),ctx.usagerKey({nom:'A',prenom:'BC'}));
assert.equal(ctx.usagerKey({nom:' Dupont ',prenom:'Ana'}),ctx.usagerKey({nom:'DUPONT',prenom:'ana'}));assert.equal(ctx.usagerKey({}),'');
// Pt 7 : statut vide, inconnu ou propriété héritée = « en attente » ; démarche nommée « constructor » comptée, absente signalée.
assert.equal(ctx.statutAffiche({statut:'toString'}),'en_attente');assert.equal(ctx.statutAffiche({statut:''}),'en_attente');assert.equal(ctx.statutAffiche({}),'en_attente');assert.equal(ctx.statutAffiche({statut:'lapin'}),'lapin');
const p7=ctx.statsRdvModel([row('p1',todayStr,'toString','09:30'),row('p2',todayStr,'inconnu','10:30'),row('p3',todayStr,null,'11:30'),{...row('p4',todayStr,'realise','14:30'),demarche:'constructor'},{...row('p5',todayStr,'realise','15:30'),demarche:''},{...row('p6',todayStr,'realise','16:30'),demarche:'__proto__'}],[],'all','A',today);
assert.equal(p7.byStatut.en_attente,3);assert.equal(p7.byStatut.realise,3);assert.equal(Object.values(p7.byStatut).reduce((a,b)=>a+b,0),p7.entries.length);   // somme des sept statuts = fiches
assert.equal(p7.byDemarche.constructor,1);assert.equal(p7.byDemarche['__proto__'],1);assert.equal(p7.sansDemarche,1);
// Amendement Codex sur AG-006 : mêmes regroupements à l'écran et dans les nouvelles archives (CMS par cmsKey, démarches sans prototype, types en clés propres).
const parCms=ctx.comptageParCms([{commune:'Fumel'},{commune:'FUMEL '},{commune:''},{commune:'Agen'},{commune:'fumel'},{commune:'constructor'}]);
assert.equal(JSON.stringify(parCms),JSON.stringify([{nom:'Fumel',n:3},{nom:'Agen',n:1},{nom:'constructor',n:1}]));
const dems=ctx.comptageDemarches([{demarche:'constructor'},{demarche:'__proto__'},{demarche:'constructor'},{demarche:''}]);
assert.equal(dems.constructor,2);assert.equal(dems['__proto__'],1);assert.deepEqual(Object.keys(dems).sort(),['__proto__','constructor']);
assert.equal(JSON.parse(JSON.stringify(dems)).constructor,2);   // l'archive survit à la sérialisation
const types=ctx.comptageTypes([{msgType:'toString'},{msgType:'proposition'},{msgType:'relance'},{msgType:'proposition'}],['proposition','confirmation','sans_appel']);
assert.equal(JSON.stringify(types),JSON.stringify({proposition:2,confirmation:0,sans_appel:0}));
assert.equal(ctx.comptageTypes([{msgType:'relance'}],['proposition','relance']).relance,1);
// Remplissage net : un créneau dont toutes les fiches sont libérées ne compte pas ; une fiche active le fait compter.
const net=ctx.statsRdvModel([row('n1',todayStr,'realise','09:30'),row('n2',todayStr,'lapin','10:30'),row('n3',todayStr,'annule','11:30'),row('n4',todayStr,'excuse','11:30'),row('n5',todayStr,'confirme','11:30'),row('n6',todayStr,null,'14:30'),row('n7',todayStr,'toString','15:30')],[],'all','A',today).slotRates;
assert.equal(net.total+'/'+net.occupes+'/'+net.places,'5/4/6');   // 5 créneaux ; 10:30 libéré ; 11:30 porte une fiche confirmée ; statut vide ou inconnu = non libéré
// Demi-journée (30/10, Saint-Pardoux) : permanence d'après-midi seule = 3 places ; sans permanence enregistrée = 6, signalé.
const pDemi={id:'pd',commune:'A',exceptDate:'2026-10-20',debut:'13:30',fin:'16:30'};
const rowsDemi=[row('d1','2026-10-20','realise','13:30'),row('d2','2026-10-20','realise','14:30'),row('d3','2026-10-20','lapin','15:30')];
const dm=ctx.statsRdvModel(rowsDemi,[pDemi],'all','A',today).slotRates;
assert.equal(dm.places+'/'+dm.joursDemi+'/'+dm.sansPerm+'/'+dm.total,'3/1/0/3');
const dm0=ctx.statsRdvModel(rowsDemi,[],'all','A',today).slotRates;assert.equal(dm0.places+'/'+dm0.joursDemi+'/'+dm0.sansPerm,'6/0/1');
const dmB=ctx.monthlyReportData(rowsDemi,'2026-10','A',new Date(2026,9,25,12),[pDemi]);assert.equal(dmB.places+'/'+dmB.joursDemi+'/'+dmB.fillPct,'3/1/100');
assert.equal(dmB.occupes+'/'+dmB.fillNetPct,'2/67');   // le lapin de 15:30 libère son créneau : 2 non libérés sur 3 places
// Bilan mensuel : même population que les statistiques, recomptage indépendant, unités, anonymat, état vide.
const bil=[];let bid=0;const add=(date,heure,statut,commune,demarche,msgType='confirmation')=>bil.push({...row('b'+(bid++),date,statut,heure,commune,msgType),demarche});
add('2026-09-03','09:30','realise','A','Impôts');add('2026-09-03','10:30','lapin','A','Impôts');add('2026-09-03','11:30','realise','B','CAF');
add('2026-09-03','10:30','realise','A','CAF');            // créneau 10:30 réattribué : lapin puis réalisé, un seul créneau
add('2026-09-04','09:30','excuse','B','CAF');add('2026-09-04','09:30','realise','B','Logement');add('2026-09-04','14:30','annule','B','Logement');
add('2026-09-04','16:30',null,'B','', 'indispo');add('2026-08-31','09:30','realise','A','Août');add('2026-10-05','09:30','confirme','A','Octobre');
for(let i=0;i<12;i++)add('2026-09-10','1'+(i%7)+':30','realise','A','Démarche '+String(i).padStart(2,'0'));
const bilBefore=JSON.stringify(bil),nowBil=new Date(2026,9,25,12);
const r1=ctx.monthlyReportData(bil,'2026-09','',nowBil);
assert.equal(JSON.stringify(ctx.monthlyReportData(bil,'2026-09','',nowBil)),JSON.stringify(r1));assert.equal(JSON.stringify(bil),bilBefore);   // A : idempotent, lecture seule
// C : recomptage indépendant depuis la source brute
const sep=bil.filter(h=>h.date.startsWith('2026-09')&&h.msgType!=='indispo');
const slotsSet=new Set(sep.map(h=>h.date+'|'+h.commune+'|'+h.heure)),realSlots=new Set(sep.filter(h=>h.statut==='realise').map(h=>h.date+'|'+h.commune+'|'+h.heure)),lapSlots=new Set(sep.filter(h=>h.statut==='lapin').map(h=>h.date+'|'+h.commune+'|'+h.heure));
assert.equal(r1.entries,sep.length);assert.equal(r1.realised,sep.filter(h=>h.statut==='realise').length);
const joursSet=new Set(sep.filter(h=>h.heure).map(h=>h.date+'|'+h.commune));assert.equal(r1.jours,joursSet.size);assert.equal(r1.places,joursSet.size*6);assert.equal(r1.fillPct,Math.round(slotsSet.size/(joursSet.size*6)*100));
// AG-008 : issue exclusive par créneau (ordre Réalisé > Confirmé > En attente > Lapin > Pas de retour > Excusé > Annulé), somme = nombre de créneaux ; recomptage indépendant.
const ORD=['realise','confirme','en_attente','lapin','pas_de_retour','excuse','annule'],KNOWN=new Set(ORD);
const issuesAttendues=Object.fromEntries(ORD.map(st=>[st,0]));
for(const k of slotsSet){const sts=new Set(sep.filter(h=>h.date+'|'+h.commune+'|'+h.heure===k).map(h=>KNOWN.has(h.statut)?h.statut:'en_attente'));issuesAttendues[ORD.find(st=>sts.has(st))]++;}
assert.equal(JSON.stringify(r1.issues),JSON.stringify(issuesAttendues));
assert.equal(Object.values(r1.issues).reduce((a,b)=>a+b,0),r1.slots);assert.equal(r1.issues.realise,r1.realisedSlots);assert(r1.issues.lapin<=r1.lapinSlots);
const pst=ctx.statsRdvModel([row('s1',todayStr,'realise','09:30'),row('s2',todayStr,'lapin','09:30'),row('s3',todayStr,'toString','10:30'),row('s4',todayStr,'excuse','11:30'),row('s5',todayStr,'annule','11:30'),row('s6',todayStr,'excuse','14:30'),row('s7',todayStr,'pas_de_retour','14:30'),row('s8',todayStr,'lapin','15:30'),row('s9',todayStr,'confirme','15:30')],[],'all','A',today).slotRates;
assert.equal(JSON.stringify(pst.issues),JSON.stringify({realise:1,confirme:1,en_attente:1,lapin:0,pas_de_retour:1,excuse:1,annule:0}));   // 09:30 réalisé+lapin → Réalisé ; 15:30 lapin+confirmé → Confirmé ; 14:30 → Pas de retour ; 11:30 → Excusé
assert.equal(pst.total,5);
assert.equal(r1.slots,slotsSet.size);assert.equal(r1.realisedSlots,realSlots.size);assert.equal(r1.lapinSlots,lapSlots.size);
assert.equal(r1.concretPct,Math.round(realSlots.size/slotsSet.size*100));assert.equal(r1.lapinPct,Math.round(lapSlots.size/slotsSet.size*100));
assert.equal(r1.accompanied,new Set(sep.filter(h=>h.statut==='realise').map(h=>(h.nom+'|'+h.prenom).toLowerCase())).size);
assert.equal(r1.today,'2026-09-30');       // mois échu : « aujourd'hui » = fin du mois
// B : mêmes populations — somme des CMS = global, un CMS filtré = sa ligne, bilan = écran
assert.equal(r1.byCms.reduce((n,c)=>n+c.entries,0),r1.entries);assert.equal(r1.byCms.reduce((n,c)=>n+c.realised,0),r1.realised);assert.equal(r1.byCms.reduce((n,c)=>n+c.slots,0),r1.slots);
const rB=ctx.monthlyReportData(bil,'2026-09','B',nowBil),lineB=r1.byCms.find(c=>c.cms==='B');assert.equal(rB.entries,lineB.entries);assert.equal(rB.slots,lineB.slots);assert.equal(rB.byCms.length,1);
const screen=ctx.statsRdvModel(bil.filter(h=>h.date.startsWith('2026-09')),[],'all','',new Date(2026,8,30,12));assert.equal(screen.entries.length,r1.entries);assert.equal(screen.realised.length,r1.realised);assert.equal(screen.slotRates.total,r1.slots);
// E : top 10 démarches + « autres » ne tronquent rien
assert.equal(r1.demarches.length,10);assert.equal(r1.demarches.reduce((n,d)=>n+d.n,0)+r1.otherDemarchesN,sep.filter(h=>h.statut==='realise'&&h.demarche).length);
// E : unités, anonymat, mois courant et vide
const htmlB=ctx.monthlyReportHtml(r1,{profil:'Profil fictif',date:'25/10/2026',archivedYear:false});
assert.match(htmlB,/Taux de remplissage/);assert.match(htmlB,/Taux de remplissage net/);assert.match(htmlB,/Issue du créneau/);assert.match(htmlB,/100 %/);assert.match(htmlB,/rendez-vous enregistrés/);assert.match(htmlB,/créneaux horaires/);assert.doesNotMatch(htmlB,/fiche/i);assert.doesNotMatch(htmlB,/FICTIF|Exemple|0[1-9]( ?\d{2}){4}/);assert.match(htmlB,/ne reprend ni nom, ni téléphone/);
assert.equal(ctx.monthlyReportData(bil,'2026-10','',nowBil).today,'2026-10-25');      // mois en cours : jusqu'au jour courant
// Mois en cours (30/10) : un RDV du 28/10 est exclu au 25/10 (volumes et statuts), rapport marqué partiel ; mois échu non partiel.
const avecFutur=bil.concat([row('z1','2026-10-28','confirme','09:30','A')]);
const oct=ctx.monthlyReportData(bil,'2026-10','',nowBil),octF=ctx.monthlyReportData(avecFutur,'2026-10','',nowBil);
assert.equal(octF.entries,oct.entries);assert.equal(octF.byStatut.confirme,oct.byStatut.confirme);assert.equal(oct.partiel,true);assert.equal(r1.partiel,false);
assert.equal(ctx.monthlyReportData(avecFutur,'2026-10','',new Date(2026,10,2,12)).entries,oct.entries+1);   // mois échu : le RDV du 28/10 compte
const vide=ctx.monthlyReportData(bil,'2025-01','',nowBil);assert.equal(vide.empty,true);
assert.match(ctx.monthlyReportHtml(vide,{profil:'P',date:'d',archivedYear:true}),/archivée/);assert.match(ctx.monthlyReportHtml(vide,{profil:'P',date:'d',archivedYear:false}),/Aucun rendez-vous daté/);
assert.equal(ctx.monthlyReportData(bil,'2026-9','',nowBil),null);
// Pause déjeuner d'office : conditions d'application, puis les chiffres de places ne bougent pas.
const lp0={id:'p',commune:'A',exceptDate:'2026-10-30',debut:'09:30',fin:'16:30'},todayL='2026-10-25';
const lunch=ctx.lunchBreakEntry(lp0,[],todayL);
assert.equal(lunch.heure+'|'+lunch.nom+'|'+lunch.msgType+'|'+lunch.date,'12:30|Pause déjeuner|indispo|2026-10-30');
assert.equal(ctx.lunchBreakEntry({...lp0,pauseAuto:true},[],todayL),null);                 // déjà traitée (ou libérée à la main) : ne revient pas
assert.equal(ctx.lunchBreakEntry({...lp0,exceptDate:'2026-10-20'},[],todayL),null);        // journée passée
assert.equal(ctx.lunchBreakEntry({...lp0,archived:true},[],todayL),null);
assert.equal(ctx.lunchBreakEntry({...lp0,debut:'13:30'},[],todayL),null);                  // après-midi seul
assert.equal(ctx.lunchBreakEntry({...lp0,fin:'12:30'},[],todayL),null);                    // matin seul
assert.equal(ctx.lunchBreakEntry(lp0,[row('x','2026-10-30','confirme','12:30')],todayL),null);   // 12:30 déjà réservé
assert.equal(ctx.lunchBreakEntry(lp0,[row('y','2026-10-30',null,'12:30','A','indispo')],todayL),null); // déjà bloqué
assert.equal(ctx.lunchBreakEntry(lp0,[row('z','2026-10-30','lapin','12:30')],todayL).heure,'12:30');   // créneau libéré : on bloque
const pauseRow=row('pause','2026-10-30',null,'12:30','A','indispo');pauseRow.nom='Pause déjeuner';
const withP=(hist)=>[hist,hist.concat([pauseRow])].map(h=>{const d=ctx.statsRdvModel(h,[lp0],'1m','A',new Date(2026,9,25,12)).days[0];return JSON.stringify([d.total,d.occupied,d.free,d.blocked,d.overbooked,d.marks.length]);});
const base1=[row('a1','2026-10-30','confirme','09:30'),row('a2','2026-10-30','confirme','10:30'),row('a3','2026-10-30','en_attente','14:30')];
const [noP,yesP]=withP(base1);assert.equal(yesP,noP);                                      // la pause ne retire pas une place
const allH=['09:30','10:30','11:30','12:30','13:30','14:30','15:30','16:30'];
const closedOther=allH.map((h,i)=>{const r=row('c'+i,'2026-10-30',null,h,'A','indispo');r.nom='Fermé';return r;});
const closedPause=closedOther.map(r=>r.heure==='12:30'?{...r,nom:'Pause déjeuner'}:r);
const dClosedOther=ctx.statsRdvModel(closedOther,[lp0],'1m','A',new Date(2026,9,25,12)).days[0],dClosedPause=ctx.statsRdvModel(closedPause,[lp0],'1m','A',new Date(2026,9,25,12)).days[0];
assert.equal([dClosedPause.total,dClosedPause.free,dClosedPause.overbooked].join(),[dClosedOther.total,dClosedOther.free,dClosedOther.overbooked].join());
assert.equal(dClosedPause.free+'|'+dClosedPause.overbooked,'0|0');                         // journée fermée avec pause : 0 place, pas de faux dépassement
// Grille par CMS : après-midi à 3 créneaux d'1 h, début réglable (défaut 13:30, Fumel 14:00) ; plus de 16:30.
const gp={commune:'Marmande',exceptDate:'2026-11-03',debut:'09:30',fin:'16:30'};
const hours=(c,hist=[])=>ctx.getSlots(c,'2026-11-03',hist,{...gp,commune:c}).map(s=>s.heure).join(',');
ctx.S={cmsList:[{id:1,nom:'Marmande'},{id:2,nom:'Fumel',debutApresMidi:'14:00'},{id:3,nom:'Villeneuve-Sur-Lot',debutApresMidi:'99:99'}]};
assert.equal(hours('Marmande'),'09:30,10:30,11:30,12:30,13:30,14:30,15:30');
assert.equal(hours('Fumel'),'09:30,10:30,11:30,12:30,14:00,15:00,16:00');
assert.equal(hours('FUMEL'),'09:30,10:30,11:30,12:30,14:00,15:00,16:00');                // casse et accents sans effet
assert.equal(hours('Villeneuve-Sur-Lot'),'09:30,10:30,11:30,12:30,13:30,14:30,15:30');      // valeur invalide : défaut
assert.equal(hours('Inconnu'),'09:30,10:30,11:30,12:30,13:30,14:30,15:30');
assert.match(hours('Marmande',[row('t1','2026-11-03','confirme','16:30','Marmande')]),/15:30,16:30$/);   // RDV existant à 16:30 : conservé, hors grille
assert.match(hours('Fumel',[row('t2','2026-11-03','confirme','13:30','Fumel')]),/12:30,13:30,15:00/);     // RDV existant à 13:30 : conservé ; 14:00 libre masqué (chevauchement, 28/10)
assert.deepEqual(Array.from(ctx.afternoonGridHours('Fumel')),['14:00','15:00','16:00']);
// demi-journée ouverte détectée avec la grille du CMS (Fumel : 14:00/15:00/16:00)
const fp={id:'f',commune:'Fumel',exceptDate:'2026-11-03',debut:'09:30',fin:'16:30'};
const blk=(c,h)=>{const r=row('k'+c+h,'2026-11-03',null,h,c,'indispo');r.nom='Fermé';return r;};
const fAm=ctx.statsRdvModel(['09:30','10:30','11:30','12:30'].map(h=>blk('Fumel',h)),[fp],'1m','Fumel',new Date(2026,10,1,12)).days[0];
assert.equal(fAm.half+'|'+fAm.total+'|'+fAm.free,'afternoon|3|3');
const fMo=ctx.statsRdvModel(['14:00','15:00','16:00'].map(h=>blk('Fumel',h)),[fp],'1m','Fumel',new Date(2026,10,1,12)).days[0];
assert.equal(fMo.half+'|'+fMo.total+'|'+fMo.free,'morning|3|3');
delete ctx.S;
// Journée jamais ouverte : pas de 12:30 dans la grille (la pause y sera posée à l'ouverture) ; journée ouverte : 12:30 présent.
ctx.getPermanence=()=>null;
assert.equal(ctx.getSlots('Marmande','2026-11-10',[]).map(s=>s.heure).join(','),'09:30,10:30,11:30,13:30,14:30,15:30');
assert.match(ctx.getSlots('Marmande','2026-11-10',[row('o1','2026-11-10','confirme','12:30','Marmande')]).map(s=>s.heure).join(','),/11:30,12:30,13:30/);   // RDV déjà pris à 12:30 : conservé
assert.match(ctx.getSlots('Marmande','2026-11-10',[],{...gp,exceptDate:'2026-11-10'}).map(s=>s.heure).join(','),/11:30,12:30,13:30/);                // journée ouverte : 12:30 présent
delete ctx.getPermanence;
// Audit Codex (AG-004) : données manquantes, fuseau Paris, variantes de CMS.
const nowQ=new Date(2026,9,25,12);
const q=(arr,month='2026-10',cms='')=>ctx.monthlyReportData(arr,month,cms,nowQ);
const qr=(id,h,st,c,dem,extra={})=>({...row(id,'2026-10-05',st,h,c),demarche:dem,...extra});
// CMS absent : ligne « CMS non renseigné », la somme des lignes retrouve le total
const noC=q([qr('n1','09:30','realise','A','Impôts'),qr('n2','10:30','realise','','Impôts')]);
assert.equal(noC.entries,2);assert.equal(noC.byCms.reduce((n,c)=>n+c.entries,0)+noC.sansCms,noC.entries);assert.equal(noC.sansCms+'|'+noC.sansCmsRealised,'1|1');
assert.match(ctx.monthlyReportHtml(noC,{profil:'P',date:'d'}),/CMS non renseigné/);
// Heure absente : ni créneau ni taux, signalée
const noH=q([qr('h1','','realise','A','X'),qr('h2','','lapin','A','X')]);
assert.equal(noH.slots+'|'+noH.sansHeure+'|'+noH.concretPct+'|'+noH.lapinPct,'0|2|null|null');assert.match(ctx.monthlyReportHtml(noH,{profil:'P',date:'d'}),/sans heure/);
// Statut absent : classé « en attente » partout, la répartition retrouve le total
const noS=q([qr('s1','09:30',null,'A','X'),qr('s2','10:30','realise','A','X')]);
assert.equal(Object.values(noS.byStatut).reduce((a,b)=>a+b,0),noS.entries);assert.equal(noS.byStatut.en_attente,1);
// Démarche absente : comptée et nommée, plus de « Aucun accompagnement » contradictoire
const noD=q([qr('d1','09:30','realise','A','')]);
assert.equal(noD.realised+'|'+noD.sansDemarche,'1|1');const hd=ctx.monthlyReportHtml(noD,{profil:'P',date:'d'});assert.match(hd,/Démarche non renseignée/);assert.doesNotMatch(hd,/Aucun accompagnement réalisé/);
// Fuseau : le 01/10 à 00 h 30 Paris, le jour courant est le 01/10 (même si l'appareil est en UTC)
const t0=new Date(Date.UTC(2026,8,30,22,30));assert.equal(ctx.parisDayStr(t0),'2026-10-01');
const tz=ctx.statsRdvModel([{...row('z1','2026-10-01','realise','09:30','A')}],[],'all','',t0);assert.equal(tz.slotRates.total+'|'+tz.slotRates.realised,'1|1');
// Variantes de CMS : « Fumel » et « FUMEL » sont un seul CMS (un créneau, 100 % / 100 %), filtre inclus
const vr=[qr('v1','09:30','realise','Fumel','X'),qr('v2','09:30','lapin','FUMEL','X')];
const v=q(vr);assert.equal(v.slots+'|'+v.concretPct+'|'+v.lapinPct+'|'+v.byCms.length,'1|100|100|1');assert.equal(q(vr,'2026-10','fumel').entries,2);
// Promesse de confidentialité : plus aucune formule absolue, rappel de relire les textes libres
const ph=ctx.monthlyReportHtml(v,{profil:'P',date:'d'});assert.match(ph,/saisies librement/);assert.doesNotMatch(ph,/Aucun nom, téléphone/);
// Heures libres d'une journée à venir (mêmes créneaux que les tuiles libres de l'Agenda).
const fhDay=(hist,perm=lp0,when=new Date(2026,9,25,12))=>ctx.statsRdvModel(hist,[perm],'1m','A',when).days[0].freeHours.join(',');
assert.equal(fhDay([row('f1','2026-10-30','confirme','09:30'),row('f2','2026-10-30','confirme','10:30'),row('f3','2026-10-30','en_attente','14:30')]),'11:30,13:30,15:30');
assert.equal(fhDay([row('f4','2026-10-30','lapin','09:30')]),'09:30,10:30,11:30,13:30,14:30,15:30');           // créneau libéré un jour futur : de nouveau libre
const todayFree=ctx.statsRdvModel([row('f5','2026-10-25','lapin','09:30')],[{...lp0,exceptDate:'2026-10-25'}],'1m','A',new Date(2026,9,25,12)).days[0].freeHours.join(',');
assert.equal(todayFree.includes('09:30'),false);                                                                      // libéré aujourd'hui : non réattribuable
const fAll=['09:30','10:30','11:30','12:30','13:30','14:30','15:30'].map(h=>{const r=row('x'+h,'2026-10-30',null,h,'A','indispo');r.nom='Fermé';return r;});
assert.equal(fhDay(fAll),'');                                                                                          // journée fermée : aucune heure libre
// Barre = créneaux dans l'ordre des heures (le vendredi 30/10 de Fumel commence par une case vide si 09:30 est libre).
const fum=ctx.statsRdvModel([row('u1','2026-10-30','confirme','10:30','A'),row('u2','2026-10-30','confirme','14:30','A')],[lp0],'1m','A',new Date(2026,9,25,12)).days[0];
assert.equal(fum.marks.join(','),'free,booked,free,free,booked,free');assert.equal(fum.markInfo.map(i=>i.heure).join(','),'09:30,10:30,11:30,13:30,14:30,15:30');
assert.equal(fum.marks.length,fum.total);assert.equal(fum.marks.filter(k=>k==='free').length,fum.free);
const full=ctx.statsRdvModel(['09:30','10:30','11:30','13:30','14:30','15:30'].map((h,i)=>row('g'+i,'2026-10-30','confirme',h,'A')),[lp0],'1m','A',new Date(2026,9,25,12)).days[0];
assert.equal(full.marks.join(','),'booked,booked,booked,booked,booked,booked');                                        // journée pleine : aucune case libre
const offGrid=ctx.statsRdvModel([row('o1','2026-10-30','confirme','14:00','A')],[lp0],'1m','A',new Date(2026,9,25,12)).days[0];
assert.equal(offGrid.marks.length,5);assert.equal(offGrid.total,5);assert.equal(offGrid.marks.indexOf('booked'),3);   // RDV hors grille à 14:00 : 13:30 et 14:30 masqués (chevauchement), capacité 5 (28/10)
console.log('Statistiques RDV et planification : périodes/CMS, six places, annulation remplacée, blocage, dépassement, idempotence et lecture seule OK.');
