/* Calendrier indépendant : données entièrement fictives ; aucun fichier d'usagers ni sauvegarde réelle. */
const assert=require('node:assert/strict'),path=require('node:path');
const C=require(process.env.CALENDAR_JS||path.join(__dirname,'../calendar.js'));
const ics=(events)=>'BEGIN:VCALENDAR\r\nVERSION:2.0\r\n'+events.map(e=>'BEGIN:VEVENT\r\n'+e+'\r\nEND:VEVENT').join('\r\n')+'\r\nEND:VCALENDAR';
const event=(id,extra='')=>'UID:'+id+'\r\nDTSTART:20261106T093000\r\nDTEND:20261106T103000\r\nSUMMARY:Réunion fictive '+id+(extra?'\r\n'+extra:'');
const p=C.parse(ics([event('fictif-a','DESCRIPTION:Texte\\nDeuxième ligne\\, suite\\; fin\\\\\r\nLOCATION:Salle fictive\r\nATTENDEE:mailto:personne@example.invalid\r\nORGANIZER:mailto:autre@example.invalid'),event('fictif-b')]));
assert.equal(p.events.length,2);assert.equal(p.events[0].start,'2026-11-06T08:30:00.000Z');assert.equal(p.events[0].end,'2026-11-06T09:30:00.000Z');
assert.equal(p.events[0].description,'Texte\nDeuxième ligne, suite; fin\\');assert.equal(p.warnings.participants,2);assert(!JSON.stringify(p.events).includes('mailto:'));
const z=C.parse(ics(['UID:z\r\nDTSTART:20261106T083000Z\r\nDTEND:20261106T093000Z\r\nSUMMARY:Conférence fictive',event('fictif-fold','SUMMARY:Titre fictif très\r\n  long')])).events;
assert.equal(z[0].start,p.events[0].start);assert.equal(z[1].title,'Titre fictif très long');
const timezone=C.parse(ics(['UID:tz\r\nDTSTART;TZID="Romance Standard Time":20260706T093000\r\nDTEND;TZID=Europe/Paris:20260706T103000\r\nSUMMARY:Été fictif'])).events[0];assert.equal(timezone.start,'2026-07-06T07:30:00.000Z');
const whole=C.parse(ics(['UID:day\r\nDTSTART;VALUE=DATE:20261106\r\nDTEND;VALUE=DATE:20261108\r\nSUMMARY:Deux jours fictifs'])).events[0];
assert(whole.allDay);assert(C.overlaps(whole,'2026-11-06'));assert(C.overlaps(whole,'2026-11-07'));assert(!C.overlaps(whole,'2026-11-08'),'fin ICS exclusive');
const midnight=C.parse(ics(['UID:night\r\nDTSTART:20261106T233000\r\nDTEND:20261107T003000\r\nSUMMARY:Nuit fictive'])).events[0];assert(C.overlaps(midnight,'2026-11-06')&&C.overlaps(midnight,'2026-11-07'));
assert.deepEqual(C.bounds('2026-11-06','week'),['2026-11-02','2026-11-09']);
/* Code couleur GDIN : classement par mots entiers de l'objet, collectif → Atelier, sinon Autre (données fictives). */
{const ev=(desc,extra={})=>({key:'k'+desc,title:'Personne fictive',location:'',description:desc,start:'2026-11-03T09:00:00.000Z',end:'2026-11-03T10:00:00.000Z',allDay:false,cancelled:false,...extra});const sid=(d,x)=>C.stageOf(ev(d,x)).id;
 assert.equal(sid('Demande de logement social'),'accompagnement');assert.equal(sid('Dossier CAF'),'accompagnement');assert.equal(sid('Démarche ANTS'),'accompagnement');
 assert.equal(sid('Atelier partenaire régie'),'intervention','atelier partenaire avant atelier');assert.equal(sid('Atelier smartphone'),'atelier');assert.equal(sid('Prise de contact'),'contact');
 assert.equal(sid('Suivi pass'),'pass');assert.equal(sid('Sondage satisfaction'),'sondage');assert.equal(sid('Réservation salle'),'reservation');
 assert.equal(sid('Café numérique'),'autre','mot entier : café n’est pas CAF');assert.equal(sid('Texte fictif inconnu'),'autre');
 assert.equal(C.stageOf({...ev('Texte fictif inconnu'),collective:true,members:[ev('Texte fictif inconnu'),ev('Texte fictif inconnu')]}).id,'atelier','collectif sans mot-clé → Atelier');
 assert.equal(sid('Demande de logement social',{end:'2026-11-03T09:00:00.000Z'}),'lapin','sans durée → lapin, avant l’objet');assert.equal(sid('Atelier fictif',{allDay:true,start:'2026-11-03',end:'2026-11-04'}),'atelier','journée entière ≠ lapin');
 for(const t of ['Carte solidaire','CHQ ÉNERGIE','Chèque énergie','Formation numérique'])assert.equal(sid(t),'accompagnement','27/11 : '+t+' → Parme');assert.equal(sid('Carte'),'autre','mot entier : « carte » seul reste en Autre');
 assert.equal(C.STAGES.length,10);assert.deepEqual(C.STAGES.find(s=>s.id==='excuse'),{id:'excuse',label:'Excusé',keys:[],bg:'#4F6D8F',border:'#3F5873',text:'#FFFFFF'},'27/11 : étape Excusé ajoutée, sans mot-clé');assert.equal(C.STAGES.find(s=>s.id==='lapin').label,'Lapin');assert.deepEqual(C.STAGES.find(s=>s.id==='accompagnement'),{id:'accompagnement',label:'Accompagnement',keys:['accompagnement','demarche','demarches','logement','caf','ants','anef','carsat','inpi','carte solidaire','chq energie','cheque energie','formation numerique'],bg:'#9999FF',border:'#6363FE',text:'#000000'});}
/* AG-036 : choix d'étape par objet (Q1 par objet, priorité : sans durée > choix > mots-clés > collectif > Autre ; R2 Codex : jamais pour un objet vide). */
{const ev=(desc,extra={})=>({key:'k'+desc,title:'Personne fictive',location:'',description:desc,start:'2026-11-03T09:00:00.000Z',end:'2026-11-03T10:00:00.000Z',allDay:false,cancelled:false,...extra});
 const sid=(d,m,extra)=>C.stageOf(ev(d,extra),m).id,M=o=>Object.assign(Object.create(null),o);
 assert.equal(sid('Texte fictif inconnu'),'autre');assert.equal(sid('Texte fictif inconnu',M({'texte fictif inconnu':'excuse'})),'excuse','choix appliqué à l’objet');
 assert.equal(sid('TEXTE  fictif   Inconnu\n0600000000',M({'texte fictif inconnu':'reservation'})),'reservation','casse, espaces et accents neutralisés par norm');
 assert.equal(sid('Demande de logement social',M({'demande de logement social':'contact'})),'contact','le choix passe avant les mots-clés');
 assert.equal(sid('Demande de logement social',M({'autre objet':'contact'})),'accompagnement','autre objet : mots-clés conservés');
 assert.equal(sid('Texte fictif inconnu',M({'texte fictif inconnu':'excuse'}),{end:'2026-11-03T09:00:00.000Z'}),'lapin','sans durée avant le choix');
 assert.equal(sid('',M({'':'excuse'})),'autre','objet vide : aucun choix appliqué');assert.equal(C.stageOf(ev('0600000000\nmail@exemple.fr'),M({})).id,'autre','objet = numéro : le détail ne propose pas de choix (aucune clé, voir choiceKey)');
 for(const [obj,attendu] of [['',''],['0600000000',''],['+33 6 00 00 00 00',''],['mail@exemple.fr',''],['CARTE  Solidaire','carte solidaire'],['Chèque énergie','cheque energie']])assert.equal(C.choiceKey(obj),attendu,'clé de choix : '+JSON.stringify(obj));
 assert.equal(sid('constructor',{}),'autre','objet « constructor » sans choix : pas d’héritage');assert.equal(sid('__proto__',{}),'autre');assert.equal(sid('Texte fictif inconnu',{'texte fictif inconnu':'inexistante'}),'autre','identifiant inconnu ignoré');
 assert.equal(C.stageOf(ev('Atelier fictif'),M({})).id,'atelier');
 const ok=m=>C.validStages({version:1,map:m});
 assert(ok({}));assert(ok({'carte solidaire':'accompagnement','x':'excuse','y':'lapin'}));
 for(const [cas,d] of [['null',null],['version 2',{version:2,map:{}}],['sans map',{version:1}],['map tableau',{version:1,map:[]}],['id inconnu',{version:1,map:{x:'rouge'}}],['clé non normalisée',{version:1,map:{'Carte Solidaire':'excuse'}}],['clé vide',{version:1,map:{'':'excuse'}}],['valeur non texte',{version:1,map:{x:3}}]])assert.equal(C.validStages(d),false,'refusé : '+cas);
 const mem=new Map(),storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v)};let profil='p1',pannes=false;
 const ctx={profileId:'p1',stagesKey:'ess-p1-calendar-stages-v1',storage,currentProfile:()=>profil,noteVersion(){},write:(k,v)=>{if(pannes)return false;mem.set(k,JSON.stringify(v));return true;}};
 assert.deepEqual(C.loadStages(storage,ctx.stagesKey),{map:{},raw:null},'absent = aucun choix');
 {const cur=C.loadStages(storage,ctx.stagesKey);C.saveStages(ctx,M({'carte solidaire':'accompagnement'}),cur.raw);assert.deepEqual(JSON.parse(mem.get(ctx.stagesKey)),{version:1,map:{'carte solidaire':'accompagnement'}},'écrit sous forme versionnée, objet → identifiant (pas de CSS)');}
 {const cur=C.loadStages(storage,ctx.stagesKey);assert.equal(cur.map['carte solidaire'],'accompagnement');profil='p2';assert.throws(()=>C.saveStages(ctx,cur.map,cur.raw),/profil a changé/);profil='p1';
  mem.set(ctx.stagesKey,JSON.stringify({version:1,map:{}}));assert.throws(()=>C.saveStages(ctx,cur.map,cur.raw),/autre onglet/,'copie ancienne refusée');
  const frais=C.loadStages(storage,ctx.stagesKey);pannes=true;assert.throws(()=>C.saveStages(ctx,M({x:'excuse'}),frais.raw),/non confirmé/);pannes=false;
  assert.throws(()=>C.saveStages(ctx,M({'Majuscule':'excuse'}),frais.raw),/invalide/,'clé non normalisée refusée à l’écriture');}
 // R1 (Codex) : deux onglets, même stockage ; le sélecteur écrit contre la version AFFICHÉE, jamais une relecture fraîche
 {mem.delete(ctx.stagesKey);const A=C.loadStages(storage,ctx.stagesKey),B=C.loadStages(storage,ctx.stagesKey);
  C.chooseStage(ctx,B,'carte solidaire','reservation');assert.deepEqual(JSON.parse(mem.get(ctx.stagesKey)).map,{'carte solidaire':'reservation'},'onglet B enregistré');
  assert.throws(()=>C.chooseStage(ctx,A,'carte solidaire','excuse'),/autre onglet/,'R1 : onglet A périmé refusé, pas de rebase silencieux');assert.deepEqual(JSON.parse(mem.get(ctx.stagesKey)).map,{'carte solidaire':'reservation'},'R1 : le choix de B est conservé');
  const frais=C.loadStages(storage,ctx.stagesKey);C.chooseStage(ctx,frais,'carte solidaire','excuse');assert.equal(JSON.parse(mem.get(ctx.stagesKey)).map['carte solidaire'],'excuse','après réouverture, le choix passe');
  C.chooseStage(ctx,C.loadStages(storage,ctx.stagesKey),'carte solidaire','');assert.deepEqual(JSON.parse(mem.get(ctx.stagesKey)).map,{},'« Automatique » retire le choix de l’objet');
  assert.throws(()=>C.chooseStage(ctx,C.loadStages(storage,ctx.stagesKey),'','excuse'),/Aucun choix possible/,'objet vide : refusé');}
 // R2 (Codex) : une clé acceptée par le format est écrite, jamais perdue en silence (propriété propre __proto__)
 {mem.delete(ctx.stagesKey);assert(C.validStages(JSON.parse('{"version":1,"map":{"__proto__":"excuse"}}')),'__proto__ propre accepté par le format');
  C.chooseStage(ctx,C.loadStages(storage,ctx.stagesKey),'__proto__','excuse');assert.match(mem.get(ctx.stagesKey),/"__proto__":"excuse"/,'R2 : écrit tel quel');
  const relu=C.loadStages(storage,ctx.stagesKey);assert.equal(Object.keys(relu.map).length,1,'R2 : relu avec la clé');assert.equal(C.stageOf({key:'k',title:'x',location:'',description:'__proto__',start:'2026-11-03T09:00:00.000Z',end:'2026-11-03T10:00:00.000Z',allDay:false},relu.map).id,'excuse','R2 : appliqué à l’objet « __proto__ »');
  assert.equal(Object.getPrototypeOf(JSON.parse(mem.get(ctx.stagesKey)).map),Object.prototype,'aucune pollution de prototype');assert.equal(({}).excuse,undefined);}
 for(const abime of ['pas du json','{"version":1,"map":{"x":"rouge"}}','{"version":2,"map":{}}']){mem.set(ctx.stagesKey,abime);assert.throws(()=>C.loadStages(storage,ctx.stagesKey),'illisible : '+abime);assert.equal(mem.get(ctx.stagesKey),abime,'illisible jamais réécrit');}
 console.log('AG-036 : choix d’étape par objet (priorité, objet vide, prototype, normalisation), format versionné validé, écriture sûre (profil, autre onglet, panne, illisible) OK.');}
/* AG-038 : RDV de l'Agenda projetés ; l'Agenda prime sur un doublon GDIN seulement si la correspondance est complète et non ambiguë (R1), par inscription avant regroupement (R2). */
{const mk=(id,nom,prenom,heure,commune,statut)=>({id,nom,prenom,date:'2026-11-27',heure,commune,demarche:'Demande de logement social',statut:statut||'realise',label:'Libellé '+(statut||'realise'),bg:'#cfc',border:'#080',text:'#000'});
 const ics=(i,titre,debutZ,lieu,action)=>({key:'gdin:'+JSON.stringify(['u'+i,action||'',debutZ,debutZ,titre,lieu||'',action?'participant:'+titre:'description:'+titre]),title:titre,location:lieu||'',description:(action?'Participant : '+titre+'\n':'')+'Demande de logement social',start:debutZ,end:debutZ,allDay:false,cancelled:false});
 const D='2026-11-27T08:30:00.000Z';   // 09:30 Paris
 const items=l=>C.agendaItems(l);
 // correspondance complète : l'ICS est masqué, l'Agenda reste, rien n'est supprimé
 {const ev=[ics(1,'DU TEST Alice',D,'Fumel')],avant=JSON.stringify(ev),r=C.project(ev,items([mk('a1','DU TEST','Alice','09:30','Fumel')]));
  assert.equal(r.ics.length,0,'ICS identique masqué');assert.equal(r.agenda.length,1);assert.equal(r.agenda[0].masked.length,1,'inscription masquée consultable');assert.equal(r.matched,1);assert.equal(JSON.stringify(ev),avant,'inscriptions stockées intactes');}
 // casse, accents, espaces neutralisés ; lieu inconnu d'un côté = compatible
 assert.equal(C.project([ics(1,'du  test   ALICE',D,'')],items([mk('a1','DU TEST','Alice','09:30','Fumel')])).matched,1,'norm + lieu ICS inconnu');
 assert.equal(C.project([ics(1,'ÉLISE Océane',D,'CMS de Fumel')],items([mk('a1','Élise','Océane','09:30','Fumel')])).matched,1,'accents et casse neutralisés');
 assert.equal(C.project([ics(1,'ÉLISE',D,'CMS de Fumel')],items([mk('a1','Élise','Océane','09:30','Fumel')])).matched,0,'« NOM » seul ≠ « NOM Prénom » : pas de découpage approximatif');
 assert.equal(C.project([ics(1,'ELISE Oceane',D,'CMS de Fumel')],items([mk('a1','ELISE','Oceane','09:30','Fumel')])).matched,1,'lieu de l’Agenda en mots entiers dans « CMS de Fumel »');
 // R1 : ce qui ne correspond pas entièrement garde les deux entrées
 for(const [cas,ev,ag] of [
   ['heure différente',[ics(1,'DU TEST Alice','2026-11-27T09:00:00.000Z','Fumel')],[mk('a1','DU TEST','Alice','09:30','Fumel')]],
   ['jour différent',[ics(1,'DU TEST Alice','2026-11-28T08:30:00.000Z','Fumel')],[mk('a1','DU TEST','Alice','09:30','Fumel')]],
   ['ordre Prénom NOM',[ics(1,'Alice DU TEST',D,'Fumel')],[mk('a1','DU TEST','Alice','09:30','Fumel')]],
   ['prénom différent',[ics(1,'DU TEST Alicia',D,'Fumel')],[mk('a1','DU TEST','Alice','09:30','Fumel')]],
   ['lieux connus incompatibles',[ics(1,'DU TEST Alice',D,'Marmande')],[mk('a1','DU TEST','Alice','09:30','Fumel')]],
   ['RDV sans heure',[ics(1,'DU TEST Alice',D,'Fumel')],[mk('a1','DU TEST','Alice','','Fumel')]],
   ['nom vide',[ics(1,'Alice',D,'Fumel')],[mk('a1','','Alice','09:30','Fumel')]]]){
   const r=C.project(ev,items(ag));assert.equal(r.matched,0,'R1 : '+cas+' → pas de fusion');assert.equal(r.ics.length,1,'R1 : '+cas+' → ICS conservé');assert.equal(r.agenda[0].masked.length,0);}
 // R1 : candidats multiples (homonymes) des deux côtés → rien de masqué, signalé
 {const r=C.project([ics(1,'DUPONT Jean',D,'Fumel'),ics(2,'DUPONT Jean',D,'Fumel')],items([mk('a1','DUPONT','Jean','09:30','Fumel')]));assert.equal(r.matched,0);assert.equal(r.ambiguous,1);assert.equal(r.ics.length,2,'deux ICS homonymes conservés');}
 {const r=C.project([ics(1,'DUPONT Jean',D,'Fumel')],items([mk('a1','DUPONT','Jean','09:30','Fumel'),mk('a2','DUPONT','Jean','09:30','Fumel')]));assert.equal(r.matched,0);assert.equal(r.ambiguous,2,'deux fiches Agenda homonymes : jamais l’une plutôt que l’autre');assert.equal(r.ics.length,1);}
 // R2 : rapprocher par inscription AVANT de regrouper : atelier P+Q, seul P a un RDV Agenda → Q reste, total = 2
 {const P=ics(1,'PERSONNE Paul',D,'Fumel','777'),Q=ics(2,'QUENTIN Quentin',D,'Fumel','777'),r=C.project([P,Q],items([mk('a1','PERSONNE','Paul','09:30','Fumel')]));
  assert.equal(r.matched,1);assert.deepEqual(r.ics.map(e=>e.title),['QUENTIN Quentin'],'seule l’inscription rapprochée est retirée');
  const total=C.countEvents(r.ics).evenements+r.agenda.length;assert.equal(total,2,'Q (ICS) + P (Agenda) = 2 événements, pas 1 séance + 1 RDV − 1 doublon');
  const rest=C.countEvents(r.ics);assert.equal(rest.inscriptions,1,'reste : une inscription');assert.equal(C.countEvents([P,Q]).evenements,1,'avant projection : 1 séance de 2 inscriptions');}
 // R4 : statut exact conservé, clé stable (pas d'index), id relu, fiche sans id signalée
 {const a=items([mk('a1','AA','Bb','10:00','Fumel','lapin'),mk('','CC','Dd','11:00','Fumel','pas_de_retour'),{...mk('a3','EE','Ff','12:00','Fumel','annule')}]);
  assert.deepEqual(a.map(x=>x.statut),['lapin','pas_de_retour','annule'],'statut exact, pas de « annulé » générique');assert.deepEqual(a.map(x=>x.cancelled),[false,false,true],'seul annulé = annulé');
  assert.equal(a[0].key,'agenda:id:a1','clé stable fondée sur l’identifiant, jamais sur l’index');assert.equal(a[1].fid,'','fiche sans id : aucun identifiant fabriqué');assert.match(a[1].key,/^agenda:sansid:/);
  const b=items([mk('a1','AA','Bb','10:00','Fumel','lapin')]);assert.equal(b[0].key,a[0].key,'même clé si l’historique change d’ordre');}
 assert.equal(items([{...mk('a9','AA','Bb','10:00','Fumel'),date:'pas une date'},null,'x']).length,0,'entrées invalides ignorées');
 assert.equal(C.placesCompatible('Fumelles','Fumel'),false,'mot entier : « Fumel » n’est pas dans « Fumelles »');assert.equal(C.placesCompatible('','Fumel'),true);assert.equal(C.placesCompatible('Salle des fêtes','Fumel'),false);assert.equal(C.placesCompatible('Mairie de Fumel-sur-Lot','Fumel'),true,'« Fumel » mot entier dans « Fumel-sur-Lot » (tiret = séparateur)');
 {const css=require('node:fs').readFileSync(process.env.CALENDAR_CSS||path.join(__dirname,'../calendar.css'),'utf8');   // les couleurs passent par data-stage pour GDIN : la tuile Agenda a sa propre règle (27/11 : sans elle, toutes les tuiles Agenda étaient bleu foncé)
  assert(/\.ics-event\[data-source="agenda"\]\{color:var\(--stage-text\);background:var\(--stage-bg\);border-color:var\(--stage-border\);\}/.test(css),'AG-038 : règle CSS des tuiles Agenda (mode clair)');assert(/\[data-theme="dark"\] \.ics-event\[data-source="agenda"\]/.test(css),'AG-038 : règle CSS des tuiles Agenda (mode sombre)');for(const st of ['confirme','en_attente','realise','excuse','annule','lapin','pas_de_retour'])assert(css.includes('.ics-event[data-statut="'+st+'"]{--ics-rail:'),'AG-038 : liseré sombre du statut '+st);}
 console.log('AG-038 : projection Agenda (correspondance complète seule, ambiguïtés conservées, rapprochement avant regroupement, statut exact, clés stables) OK.');}
/* AG-031 : lundi–vendredi en Semaine/Mois, week-end compté s'il cache un événement. */
assert.deepEqual(C.visibleDays(C.bounds('2026-11-06','week'),'week'),['2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06'],'AG-031 : semaine sans week-end');
assert.equal(C.visibleDays(C.bounds('2026-11-06','month'),'month').length,30,'AG-031 : mois = 6 semaines de 5 jours');
assert.deepEqual(C.visibleDays(C.bounds('2026-11-07','day'),'day'),['2026-11-07'],'AG-031 : vue Jour garde le samedi choisi');
{const sat={key:'s',title:'Atelier fictif samedi',location:'',description:'',start:'2026-11-07T09:00:00.000Z',end:'2026-11-07T10:00:00.000Z',allDay:false,cancelled:false},fri={...sat,key:'f',start:'2026-11-06T09:00:00.000Z',end:'2026-11-06T10:00:00.000Z'},span={...sat,key:'v',start:'2026-11-06T16:00:00.000Z',end:'2026-11-07T08:00:00.000Z'},allSat={...sat,key:'a',start:'2026-11-07',end:'2026-11-08',allDay:true};
 assert.deepEqual(C.hiddenWeekend([sat,fri,span,allSat],C.bounds('2026-11-06','week'),'week').map(e=>e.key),['s','a'],'AG-031 : seuls les événements invisibles en semaine sont comptés');
 assert.equal(C.hiddenWeekend([sat],C.bounds('2026-11-07','day'),'day').length,0,'AG-031 : rien de caché en vue Jour');}
assert.deepEqual(C.bounds('2026-11-06','month'),['2026-10-26','2026-12-07']);
const unsupported=C.parse(ics([event('repeat','RRULE:FREQ=WEEKLY'),event('exception','RECURRENCE-ID:20261106T093000'),'UID:bad\r\nDTSTART:20260230T093000', 'UID:gap\r\nDTSTART;TZID=Europe/Paris:20260329T023000', 'UID:unknown\r\nDTSTART;TZID=Fuseau/Inconnu:20261106T090000']));
assert.equal(unsupported.events.length,0);assert.equal(unsupported.warnings.recurrences,2);assert.equal(unsupported.warnings.dates,3);
assert.equal(C.parse(ics(['UID:duration\r\nDTSTART:20261106T090000\r\nDURATION:PT90M'])).events[0].end,'2026-11-06T09:30:00.000Z');
assert(C.parse(ics([event('cancel','STATUS:CANCELLED')])).events[0].cancelled);
assert.throws(()=>C.parse('pas un calendrier'));assert.throws(()=>C.parse('BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:20261106T090000\nEND:VCALENDAR'));
const merge=C.merge(p.events,p.events);assert.equal(merge.added,0);assert.equal(merge.unchanged,2);assert.equal(merge.events.length,2);
const changed={...p.events[0],title:'Réunion fictive déplacée'};const m=C.merge(p.events,[changed]);assert.equal(m.updated,1);assert.equal(m.events.length,2);assert.equal(m.events[0].title,changed.title);
assert.equal(C.merge([],p.events.concat(p.events)).events.length,2,'doublons du fichier');
/* Contrat GDIN : références entièrement fictives, sans fichier réel d'usagers. */
const workshop=(n,overrides={})=>[
 'UID:'+(overrides.uid||'demande-fictive-'+n),'CATEGORIES:'+(overrides.action||'ACTION-FICTIVE-1'),
 'DTSTART:'+(overrides.start||'20261102T093000'),'DTEND:'+(overrides.end||'20261102T113000'),
 'SUMMARY:Participant fictif '+n,'DESCRIPTION:Action : '+(overrides.activity||'Espace Santé')+'\\nParticipant : Participant fictif '+n,
 'LOCATION:'+(overrides.location||'Salle fictive A'),overrides.cancelled?'STATUS:CANCELLED':''
].filter(Boolean).join('\r\n');
const ten=C.parse(ics(Array.from({length:10},(_,i)=>workshop(i+1)))).events;
const grouped=C.sessions(ten);assert.equal(grouped.length,1);assert.equal(grouped[0].title,'Espace Santé');assert.equal(grouped[0].members.length,10);assert.equal(grouped[0].participants.length,10);
assert.equal(grouped[0].start,'2026-11-02T08:30:00.000Z');assert.equal(grouped[0].end,'2026-11-02T10:30:00.000Z');assert.equal(C.sessions(ten,false).length,10);
const reused=C.parse(ics([workshop(1),workshop(2,{uid:'demande-fictive-1'}),workshop(1,{start:'20261103T093000',end:'20261103T113000'})])).events;
assert.equal(C.merge([],reused).events.length,3,'UID répété : participants et créneaux conservés');assert.equal(C.sessions(reused).length,2);
assert.equal(C.merge(ten,ten.concat(ten)).events.length,10,'fichiers qui se recouvrent');
assert.equal(C.sessions(C.parse(ics([workshop(1),workshop(2,{action:'AUTRE-ACTION'}),workshop(3,{location:'Autre salle'}),workshop(4,{activity:'Autre activité'})])).events).length,4,'action, lieu ou activité distincts : pas de regroupement');
assert.equal(C.sessions(p.events).length,2,'sans action, aucune fusion de rendez-vous simultanés');
const cancelled=C.sessions(C.parse(ics([workshop(1),workshop(2,{cancelled:true})])).events)[0];assert.equal(cancelled.cancelled,false);assert.equal(cancelled.participants.filter(p=>p.cancelled).length,1);
assert.equal(C.select(grouped,{query:'sante'}).length,1);assert.equal(C.select(grouped,{query:'Participant fictif 10'}).length,1);assert.equal(C.select(grouped,{action:'inexistante'}).length,0);assert.equal(C.select(grouped,{location:'Autre salle'}).length,0);assert.equal(C.select(grouped,{type:'collective'}).length,1);assert.equal(C.select(grouped,{type:'individual'}).length,0);
const zero=C.sessions(C.parse(ics(['UID:zero\r\nCATEGORIES:ZERO\r\nDTSTART:20261102T120000\r\nDTEND:20261102T120000\r\nSUMMARY:Durée nulle fictive'])).events)[0];assert.equal(zero.zeroDuration,true);assert.equal(zero.start,zero.end);assert.equal(C.select([zero],{type:'zero'}).length,1);
const legacy={...ten[0],key:'uid:demande-fictive-1'};assert.equal(C.merge([legacy],ten).events.length,10,'ancien import exactement reconnu, pas de double');
assert.equal(C.merge([{...legacy,start:'2026-11-01T08:30:00.000Z'}],ten).events.length,11,'aucune destruction sans correspondance');
const noUID=C.parse(ics(['DTSTART:20261106T090000\r\nDTEND:20261106T100000\r\nSUMMARY:Sans UID fictif'])).events[0];assert.equal(C.merge([{...noUID,key:'event:'+JSON.stringify([noUID.start,noUID.end,noUID.title,noUID.location])}],[noUID]).events.length,1,'ancien repli sans UID réimporté sans doublon');
assert.equal(C.merge(ten,[{...ten[0],description:'Description fictive corrigée'}]).updated,1,'métadonnées mises à jour sans doublon');
/* AG-029 D1 : même titre/UID/créneau, noms seulement dans DESCRIPTION. */
const sameTitle=(name,note='',ids=true)=>['DTSTART:20261102T093000','DTEND:20261102T113000','SUMMARY:Atelier fictif identique',ids?'UID:demande-partagée-fictive\r\nCATEGORIES:ACTION-FICTIVE-D1':'','DESCRIPTION:Action : Atelier fictif\\nParticipant : '+name+(note?'\\n'+note:'')].filter(Boolean).join('\r\n');
const described=C.parse(ics([sameTitle('Personne fictive A'),sameTitle('Personne fictive B')])).events;
assert.equal(C.merge([],described).events.length,2,'D1 : deux participants au même SUMMARY conservés');assert.deepEqual(C.sessions(described)[0].participants.map(p=>p.name),['Personne fictive A','Personne fictive B']);
assert.equal(C.merge([],C.parse(ics([sameTitle('Personne fictive A','',false),sameTitle('Personne fictive B','',false)])).events).events.length,2,'D1 sans UID ni action');
const unstructured=C.parse(ics(['DTSTART:20261102T093000\r\nSUMMARY:Identique fictif\r\nDESCRIPTION:Inscription fictive A','DTSTART:20261102T093000\r\nSUMMARY:Identique fictif\r\nDESCRIPTION:Inscription fictive B'])).events;assert.equal(C.merge([],unstructured).events.length,2,'description non structurée conservée dans l’identité de repli');
const oldGDIN={...described[1],key:'gdin:'+JSON.stringify(JSON.parse(described[1].key.slice(5)).slice(0,6))};
const reconciled=C.merge([oldGDIN],described);assert.equal(reconciled.events.length,2,'ancienne clé GDIN rapprochée exactement, aucun double au réimport');assert.equal(reconciled.added,1);assert.equal(reconciled.updated,1);assert.equal(C.merge(reconciled.events,described).unchanged,2);
assert.equal(C.merge([{...oldGDIN,description:'Autre contenu fictif'}],described).events.length,3,'ancienne ligne différente conservée, pas de rapprochement incertain');
const noteChanged=C.parse(ics([sameTitle('Personne fictive A','Note fictive corrigée')])).events;assert.equal(C.merge(described,noteChanged).updated,1);assert.equal(C.merge(described,noteChanged).events.length,2,'participant explicite stable : note corrigée sans doublon');
assert.equal(C.merge([],described.concat(described)).identical,2);const present=C.merge(described,described.concat(described));assert.equal(present.identical,2);assert.equal(present.unchanged,2,'lignes du lot identiques séparées des inscriptions déjà présentes');
assert.throws(()=>C.merge([],described.concat(noteChanged)),/Deux versions différentes/,'lot contradictoire refusé, aucune version choisie silencieusement');
/* AG-030 : deux versions d'une inscription dans un même fichier : la dernière gardée et comptée ; entre fichiers : refus conservé. */
const versionEv=(cancelled)=>'UID:version-fictive\r\nCATEGORIES:ACTION-VERSION-FICTIVE\r\nDTSTART:20261102T093000\r\nDTEND:20261102T113000\r\nSUMMARY:Personne fictive Version\r\nDESCRIPTION:Demande fictive'+(cancelled?'\r\nSTATUS:CANCELLED':'');
const twoVersions=C.parse(ics([versionEv(true),versionEv(false)]));assert.equal(twoVersions.warnings.versions,1,'AG-030 : version remplacée comptée');assert.equal(twoVersions.events.length,1);assert.equal(twoVersions.events[0].cancelled,false,'AG-030 : dernière version du fichier gardée');
const m030=C.merge([],twoVersions.events);assert.equal(m030.events.length,1);assert.equal(m030.events[0].cancelled,false,'AG-030 : import accepté, sans refus du fichier entier');
const reversed=C.parse(ics([versionEv(false),versionEv(true)]));assert.equal(reversed.events[0].cancelled,true,'AG-030 : annulation postérieure gardée');
const withCopy=C.parse(ics([versionEv(true),versionEv(true),versionEv(false)]));assert.equal(withCopy.warnings.versions,1);assert.equal(C.merge([],withCopy.events).events.length,1,'AG-030 : copie identique de l’ancienne version sans refus');assert.equal(C.merge([],withCopy.events).events[0].cancelled,false);
assert.equal(C.parse(ics([versionEv(false),versionEv(false)])).warnings.versions,0,'AG-030 : copies identiques non comptées comme versions');
/* Amendement Codex AG-030 : une identité compte une fois, répétitions identiques comptées sur le contenu d'origine. */
const seqCount=(seq)=>{const p=C.parse(ics(seq.map(c=>versionEv(c))));return [p.warnings.versions,p.warnings.copies+C.merge([],p.events).identical,p.events.length,p.events[0].cancelled];};
assert.deepEqual(seqCount([0,1,0]),[1,1,1,false],'A/B/A : 1 identité multiversion, 1 copie, A gardée');
assert.deepEqual(seqCount([0,0,1,0]),[1,2,1,false],'A/A/B/A : 1 identité multiversion, 2 copies');
assert.deepEqual(seqCount([0,0,0]),[0,2,1,false],'A/A/A : 0 multiversion, 2 copies');
assert.throws(()=>C.merge([],C.parse(ics([versionEv(true)])).events.concat(C.parse(ics([versionEv(false)])).events)),/fichiers différents/,'AG-030 : refus conservé entre fichiers');
const missingActivity={...ten[1],description:'Participant : Participant fictif 2'};assert.equal(C.sessions([ten[0],missingActivity]).length,2,'D2 : intitulé absent = groupe distinct, limite explicitée');
/* Objet GDIN en texte libre : structure confirmée par l'utilisateur, nom fictif. */
const plainObject='UID:objet-fictif\r\nCATEGORIES:ACTION-OBJET-FICTIF\r\nDTSTART:20261106T103000\r\nDTEND:20261106T113000\r\nSUMMARY:Personne fictive Objet\r\nDESCRIPTION:Demande de logement social';
const plainEvent=C.parse(ics([plainObject])).events[0],plainSession=C.sessions([plainEvent])[0];
assert.equal(C.objectLabel(plainSession),'Demande de logement social');assert.equal(C.metadata(plainEvent).activity,'','objet d’affichage ne modifie pas le regroupement');
assert.equal(C.select([plainSession],{object:'Demande de logement social'}).length,1);assert.equal(C.select([plainSession],{object:'Autre objet fictif'}).length,0);
assert.equal(C.objectLabel({...plainEvent,description:'Participant : Personne fictive\nObjet : Autre objet fictif'}),'Autre objet fictif');
assert.equal(C.objectLabel(C.sessions(ten)[0]),'Espace Santé');assert.equal(C.objectLabel({...plainSession,members:[plainEvent,{...plainEvent,description:'Autre objet fictif'}]}),'','collectif hétérogène : aucun objet supposé commun');
assert.equal(C.merge([plainEvent],C.parse(ics([plainObject])).events).unchanged,1,'objet libre affiché sans changer l’identité');
const placed=C.positions([p.events[0],{...p.events[1],end:'2026-11-06T10:30:00.000Z'}],'2026-11-06');assert.equal(placed.length,2);assert.equal(placed[0].columns,2);assert.notEqual(placed[0].column,placed[1].column);
const hist=[{id:'f1',date:'2026-11-06',heure:'09:30',nom:'FICTIF',prenom:'Exemple',commune:'Lieu fictif',statut:'confirme',label:'Confirmé',bg:'#eef',border:'#00f',text:'#000'}],histBefore=JSON.stringify(hist);assert.equal(C.agendaItems(hist).length,1);assert.equal(JSON.stringify(hist),histBefore,'AG-038 : la projection ne modifie jamais ses données');
assert.equal(C.agendaItems([{...hist[0],heure:''}])[0].unknownTime,true,'RDV sans heure conservé, heure à préciser');
const data=new Map(),storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v)};
let profile='fictif-a',writes=0,ref=null,fail=false;
const ctx={profileId:profile,currentProfile:()=>profile,history:hist,key:'ess-fictif-a-calendar-ics-v1',storage,noteVersion:(k,v)=>{ref=v;},write:(k,v)=>{writes++;if(fail)return false;storage.setItem(k,JSON.stringify(v));return true;}};
C.save(ctx,p.events,null);assert.equal(C.load(storage,ctx.key).events.length,2);assert.equal(C.load(storage,'ess-fictif-b-calendar-ics-v1').events.length,0);assert.equal(ref,null);
assert.throws(()=>C.save(ctx,[],null),/autre onglet/);const before=storage.getItem(ctx.key);fail=true;assert.throws(()=>C.save(ctx,[],before),/non confirmé/);assert.equal(storage.getItem(ctx.key),before);fail=false;
profile='fictif-b';assert.throws(()=>C.save(ctx,[],before),/profil/);profile='fictif-a';storage.setItem('broken','{');assert.throws(()=>C.load(storage,'broken'));storage.setItem('wrong',JSON.stringify({version:2,events:[]}));assert.throws(()=>C.load(storage,'wrong'));

/* Vrai parcours du composant : choix d'un ICS fictif, aperçu, ajout, répétition, vues, détail et profil. */
class N{
 constructor(tag,doc){this.tagName=tag;this.ownerDocument=doc;this.children=[];this.attrs={};this.listeners={};this.style={setProperty(){}};this.dataset={};this._text='';}
 set textContent(t){this._text=String(t);this.children=[];}get textContent(){return this._text+this.children.map(n=>n.textContent).join(' ');}
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k];}appendChild(n){n.parentNode=this;this.children.push(n);return n;}replaceChildren(){this.children.forEach(n=>{n.parentNode=null;});this.children=[];this._text='';}
 addEventListener(k,f){(this.listeners[k]||(this.listeners[k]=[])).push(f);}async fire(k,payload={}){const ev=Object.assign({target:this,preventDefault(){this.defaultPrevented=true;}},payload);for(const f of this.listeners[k]||[])await f(ev);return ev;}click(){if(!this.disabled){this.focus();return this.fire('click');}}get lastChild(){return this.children[this.children.length-1];}focus(options){this.ownerDocument.activeElement=this;this.focusOptions=options;}get isConnected(){for(let n=this;n;n=n.parentNode)if(n===this.ownerDocument.root)return true;return false;}getBoundingClientRect(){return {left:10,top:10,right:310,bottom:410};}show(){this.open=true;}showModal(){throw new Error('Le calendrier ne doit pas rendre le document inactif par showModal.');}close(){this.open=false;this.fire('close');}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);this.parentNode=null;}
}
const doc={defaultView:{innerWidth:390,confirm:()=>true},createElement(t){return new N(t,doc);},createTextNode(t){const n=new N('#text',doc);n.textContent=t;return n;}};
function nodes(n,f){return (f(n)?[n]:[]).concat(...n.children.map(c=>nodes(c,f)));}const pane=doc.createElement('div');doc.root=pane;
const byText=t=>nodes(pane,n=>n.tagName==='button'&&n.textContent===t)[0];
(async()=>{
 const ui={...ctx,profileId:'fictif-ui',history:[]};profile='fictif-ui';C.render(pane,ui);
 assert(pane.textContent.includes('Aucun événement'));assert(byText('Jour').getAttribute('aria-pressed')==='true','vue téléphone');
 const input=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];input.files=[{size:200,text:async()=>ics([event('ui','SUMMARY:<img src=x onerror=alert(1)>')])}];await input.fire('change');
 assert(pane.textContent.includes('Vérifier l’import'));assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),null,'aperçu sans écriture');
 // Le nouveau détail passe par le vrai fichier choisi et reste en lecture seule avant validation.
 let previewList=nodes(pane,n=>n.tagName==='details'&&n.className==='ics-preview-list')[0];assert(previewList,'liste détaillée disponible avant import');assert(!previewList.attrs.open&&!previewList.open,'liste repliée au départ');
 assert.equal(nodes(previewList,n=>n.tagName==='button').length,0,'contenu construit seulement à l’ouverture');previewList.open=true;await previewList.fire('toggle');
 let previewEntry=nodes(previewList,n=>n.tagName==='button'&&n.className==='ics-button ics-preview-event')[0];assert(previewEntry,'événement à importer consultable');assert(previewEntry.textContent.includes('<img'));assert(previewEntry.textContent.includes('vendredi 6 novembre 2026'));assert(previewEntry.textContent.includes('09:30–10:30'),'horaires convertis en heure de Paris');assert(previewEntry.textContent.includes('Lieu non renseigné'));assert(!nodes(pane,n=>n.tagName==='img').length,'aperçu rendu en texte sûr');
 await previewEntry.click();let previewDialog=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];assert(previewDialog,'détail de l’aperçu ouvert');assert.equal(previewDialog.attrs['aria-label'],'Détail de l’événement à importer');assert(previewDialog.textContent.includes('aucun événement ajouté'));assert(!byText('Retirer cet événement importé'),'pas de suppression depuis un événement en aperçu');assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),null,'consultation avant import sans écriture');
 await previewDialog.parentNode.fire('keydown',{key:'Tab',shiftKey:true});assert.equal(doc.activeElement,byText('Revenir à l’aperçu'),'Maj+Tab vers la dernière action de l’aperçu');await byText('Revenir à l’aperçu').click();assert.equal(nodes(pane,n=>n.tagName==='dialog').length,0);assert.equal(doc.activeElement,previewEntry,'retour au même événement en aperçu');
 const big=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];big.files=[{size:6*1024*1024,text:async()=>''}];await big.fire('change');assert(!pane.textContent.includes('Vérifier l’import'),'ancien aperçu retiré après choix refusé');assert(pane.textContent.includes('volumineux'));
 const valid=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];valid.files=[{size:200,text:async()=>ics([event('ui','SUMMARY:<img src=x onerror=alert(1)>')])}];await valid.fire('change');
 await byText('Ajouter au calendrier').click();assert.equal(C.load(storage,'ess-fictif-ui-calendar-ics-v1').events.length,1);
 const hostile=nodes(pane,n=>n.tagName==='button'&&n.textContent.includes('<img'))[0];assert(hostile,'événement affiché');assert(!nodes(pane,n=>n.tagName==='img').length,'texte non interprété');await hostile.click();assert(nodes(pane,n=>n.tagName==='dialog'&&n.open).length);await byText('Fermer').click();
 assert.equal(nodes(pane,n=>n.tagName==='dialog').length,0,'fermeture sans rechargement');assert.equal(doc.activeElement,hostile,'focus rendu à la tuile');assert.equal(hostile.focusOptions.preventScroll,true);
 const beforeDismiss=storage.getItem('ess-fictif-ui-calendar-ics-v1');await hostile.click();let modal=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];assert.equal(byText('Fermer').parentNode.className,'ics-dialog-header','bouton hors du contenu défilant');assert(nodes(modal,n=>n.className==='ics-dialog-body').length);
 let blocker=modal.parentNode;assert.equal(blocker.className,'ics-dialog-overlay');await blocker.fire('click',{target:modal});assert.equal(modal.open,true,'clic à l’intérieur ne ferme pas');await blocker.fire('click');assert.equal(nodes(pane,n=>n.tagName==='dialog').length,0,'clic sur le fond ferme et supprime la fenêtre');assert.equal(nodes(pane,n=>n.className==='ics-dialog-overlay').length,0,'aucun fond transparent ne reste pour bloquer le calendrier');assert.equal(doc.activeElement,hostile);
 await hostile.click();modal=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];const cancel=await modal.fire('cancel');assert.equal(cancel.defaultPrevented,true);assert.equal(nodes(pane,n=>n.tagName==='dialog').length,0,'annulation native ferme sans résidu modal');assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),beforeDismiss,'fermer ne modifie pas les imports');
 await hostile.click();modal=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];blocker=modal.parentNode;const remove=byText('Retirer cet événement importé');await blocker.fire('keydown',{key:'Tab',shiftKey:true});assert.equal(doc.activeElement,remove,'Maj+Tab reste dans la fenêtre');await blocker.fire('keydown',{key:'Tab',shiftKey:false});assert.equal(doc.activeElement,byText('Fermer'),'Tab boucle sur Fermer');const escape=await blocker.fire('keydown',{key:'Escape'});assert(escape.defaultPrevented);assert.equal(nodes(pane,n=>n.className==='ics-dialog-overlay').length,0,'Échap supprime toute la couche de blocage');assert.equal(doc.activeElement,hostile);await byText('Jour').click();assert.equal(byText('Jour').getAttribute('aria-pressed'),'true','commandes du calendrier accessibles après fermeture');
 await byText('Semaine').click();assert(nodes(pane,n=>(n.className||'').includes('ics-timeline')).length);await byText('Mois').click();assert.equal(nodes(pane,n=>(n.className||'').split(' ').includes('ics-month-day')).length,30,'AG-031 : vue Mois sans week-end');
 C.render(pane,ui);const again=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];again.files=[{size:200,text:async()=>ics([event('ui','SUMMARY:<img src=x onerror=alert(1)>')])}];await again.fire('change');await byText('Ajouter au calendrier').click();assert.equal(C.load(storage,'ess-fictif-ui-calendar-ics-v1').events.length,1);
 const multi=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];assert(multi.attrs.multiple);multi.files=[{size:2000,text:async()=>ics(Array.from({length:5},(_,i)=>workshop(i+1)))},{size:2000,text:async()=>ics(Array.from({length:6},(_,i)=>workshop(i+5)))}];await multi.fire('change');assert(pane.textContent.includes('1 événements après'));assert(pane.textContent.includes('1 lignes strictement identiques fusionnées dans cet import.'));
 const beforePreview=storage.getItem('ess-fictif-ui-calendar-ics-v1');previewList=nodes(pane,n=>n.tagName==='details'&&n.className==='ics-preview-list')[0];previewList.open=true;await previewList.fire('toggle');let previewEntries=nodes(previewList,n=>n.tagName==='button'&&n.className==='ics-button ics-preview-event');assert.equal(previewEntries.length,1,'liste issue du même regroupement que le résumé');await previewEntries[0].click();previewDialog=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];assert(previewDialog.textContent.includes('Participant fictif 10'),'inscriptions du collectif consultables avant ajout');assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),beforePreview,'aucune modification d’un calendrier déjà rempli pendant la consultation');assert(!byText('Retirer cet événement importé'));await byText('Fermer').click();await byText('Ajouter au calendrier').click();
 assert.equal(C.load(storage,'ess-fictif-ui-calendar-ics-v1').events.length,11,'10 inscriptions + ancien événement');
 const atelier=nodes(pane,n=>n.tagName==='button'&&(n.className||'').includes('ics-event')&&n.textContent.includes('Espace Santé'))[0];assert(atelier);await atelier.click();assert(pane.textContent.includes('Participants / inscriptions (10)'));assert(pane.textContent.includes('Participant fictif 10'));await byText('Fermer').click();
 const query=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='search')[0];query.value='introuvable';await query.fire('input');assert(!nodes(pane,n=>(n.className||'').split(' ').includes('ics-event')).length);await byText('Réinitialiser les filtres').click();
 const brokenMulti=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];brokenMulti.files=[{size:200,text:async()=>ics([workshop(99)])},{size:200,text:async()=> 'pas un ICS'}];const untouched=storage.getItem('ess-fictif-ui-calendar-ics-v1');await brokenMulti.fire('change');assert(!byText('Ajouter au calendrier'));assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),untouched,'lot invalide : aucune écriture partielle');
 const contradictory=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];contradictory.files=[{size:200,text:async()=>ics([sameTitle('Personne fictive A')])},{size:200,text:async()=>ics([sameTitle('Personne fictive A','Note différente')])}];await contradictory.fire('change');assert(pane.textContent.includes('Deux versions différentes'));assert(byText('Ajouter au calendrier').disabled);assert.equal(storage.getItem('ess-fictif-ui-calendar-ics-v1'),untouched,'AG-030 : deux fichiers contradictoires : aperçu sans écriture ni plantage');
 const oneFile=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];oneFile.files=[{size:200,text:async()=>ics([sameTitle('Personne fictive A'),sameTitle('Personne fictive A','Note différente')])}];await oneFile.fire('change');assert(pane.textContent.includes('plusieurs versions dans un même fichier'),'AG-030 : versions annoncées dans l’aperçu');assert(!byText('Ajouter au calendrier').disabled,'AG-030 : fichier unique accepté');
 const aba=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];aba.files=[{size:200,text:async()=>ics([sameTitle('Personne fictive A'),sameTitle('Personne fictive A','Note différente'),sameTitle('Personne fictive A')])}];await aba.fire('change');assert(pane.textContent.includes('1 inscription(s) présente(s) en plusieurs versions'),'AG-030 : A/B/A annonce 1 inscription dans l’aperçu');assert(pane.textContent.includes('1 lignes strictement identiques'),'AG-030 : A/B/A annonce 1 copie dans l’aperçu');
 const plainInput=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];plainInput.files=[{size:300,text:async()=>ics([plainObject])}];await plainInput.fire('change');await byText('Ajouter au calendrier').click();
 const objectChip=nodes(pane,n=>n.tagName==='button'&&(n.className||'').split(' ').includes('ics-event')&&n.textContent.includes('Demande de logement social'))[0];assert(objectChip,'objet brut présent dans la tuile par le vrai import');assert(!objectChip.textContent.includes('ACTION-OBJET-FICTIF'));await objectChip.click();const objectDialog=nodes(pane,n=>n.tagName==='dialog'&&n.open)[0];assert.equal(nodes(objectDialog,n=>n.tagName==='h3')[0].textContent,'Demande de logement social');const dateParagraphs=nodes(objectDialog,n=>n.tagName==='p'&&n.textContent.includes('vendredi'));assert.equal(dateParagraphs.length,1);assert.equal((dateParagraphs[0].textContent.match(/vendredi/g)||[]).length,1,'date non répétée sur une même journée');assert(!nodes(objectDialog,n=>n.tagName==='p'&&n.textContent.includes('Action ACTION-OBJET-FICTIF')).length);await byText('Fermer').click();
 const objectFilter=nodes(pane,n=>n.tagName==='select'&&n.attrs['aria-label']==='Objet')[0];objectFilter.value='Demande de logement social';await objectFilter.fire('change');assert.equal(nodes(pane,n=>n.tagName==='button'&&(n.className||'').split(' ').includes('ics-event')).length,1);await byText('Réinitialiser les filtres').click();
 assert.equal(JSON.stringify(hist),histBefore,'historique métier inchangé');profile='autre';C.render(pane,{...ui,profileId:'autre'});assert(!pane.textContent.includes('<img'),'cloisonnement des profils');
 /* AG-035 : réimport enrichi (téléphone, e-mail) sans doublon ; doublons déjà créés proposés au retrait, jamais retirés d'office. */
 {const objet='Demande de logement social',TEL='Téléphone : 06 00 00 00 01',MAIL='E-mail : fictif@example.invalid';
  const ag=(desc,x={})=>ics(['UID:'+(x.uid||'ag035')+'\r\nCATEGORIES:ACTION-FICTIVE\r\nDTSTART:20261125T093000\r\nDTEND:20261125T103000\r\nSUMMARY:'+(x.titre||'FICTIF Personne')+'\r\nLOCATION:'+(x.lieu||'CMS fictif')+'\r\nDESCRIPTION:'+desc]);
  const lire=(t)=>C.parse(t).events;
  const ancien=C.merge([],lire(ag(objet))).events;
  // 1 réimport avec contacts : même inscription, mise à jour, description complétée
  let r=C.merge(ancien,lire(ag(objet+'\\n'+TEL+'\\n'+MAIL)));assert.equal(r.events.length,1,'AG-035 : pas de seconde inscription');assert.equal(r.added,0);assert.equal(r.updated,1);
  assert(r.events[0].description.includes(TEL)&&r.events[0].description.includes(MAIL),'contacts reportés');
  assert.equal(C.merge(r.events,lire(ag(objet+'\\n'+TEL+'\\n'+MAIL))).unchanged,1,'même fichier : inchangé');
  // 2 contacts déjà présents jamais écrasés ni perdus par un export sans contacts ; un contact absent s'ajoute, un contact présent n'est pas remplacé
  let r2=C.merge(r.events,lire(ag(objet)));assert(r2.events[0].description.includes(TEL)&&r2.events[0].description.includes(MAIL),'contacts conservés');assert.equal(r2.events.length,1);
  let r3=C.merge(r.events,lire(ag(objet+'\\nTéléphone : 07 00 00 00 02')));assert(r3.events[0].description.includes('07 00 00 00 02')&&!r3.events[0].description.includes('06 00 00 00 01'),'valeur de l’export courant');assert(r3.events[0].description.includes(MAIL),'e-mail absent de l’export conservé');
  // 3 un objet différent reste une autre inscription
  assert.equal(C.merge(ancien,lire(ag('Autre objet fictif\\n'+TEL))).events.length,2,'objet différent = autre identité');
  // 4 doublons déjà créés (ancienne règle) : ancienne clé avec contacts dans la description
  const dupliques=ancien.concat(lire(ag(objet+'\\n'+TEL+'\\n'+MAIL)).map(e=>({...e,key:'gdin:'+JSON.stringify(['ag035','ACTION-FICTIVE',e.start,e.end,e.title,e.location,'description:'+e.description])})));
  assert.equal(dupliques.length,2);const d=C.duplicates(dupliques);assert.equal(d.length,1,'un groupe');assert.equal(d[0].remove.length,1);
  assert(d[0].keep.description.includes(TEL),'garde la version avec contacts');assert(!d[0].remove[0].description.includes(TEL),'propose l’ancienne');
  assert.equal(dupliques.length,2,'duplicates() ne retire rien');
  assert.equal(C.duplicates(ancien).length,0,'aucun doublon sans cause');assert.equal(C.duplicates([ancien[0],lire(ag('Autre objet fictif'))[0]]).length,0);
  // 5 à contacts égaux : garde la clé canonique (celle qu'un réimport retrouve)
  const egaux=[{...dupliques[1]},{...lire(ag(objet+'\\n'+TEL+'\\n'+MAIL))[0]}];const d2=C.duplicates(egaux);assert.equal(d2.length,1);assert.equal(d2[0].keep.key,egaux[1].key,'clé canonique gardée');
  // 6 avec ligne « Participant : » l'identité ne change pas
  assert.equal(C.merge(C.merge([],lire(ag('Participant : FICTIF Personne\\n'+objet))).events,lire(ag('Participant : FICTIF Personne\\n'+objet+'\\n'+TEL))).events.length,1);
 }
 /* AG-035, amendement de Codex (R1-R3) : clés de l'ANCIEN parseur, vrai bouton, contacts conservés, ensemble figé. */
 {const objet='Demande de logement social',TEL='Téléphone : 06 00 00 00 01',TEL2='Téléphone : 07 00 00 00 02',MAIL='E-mail : fictif@example.invalid';
  const evt=(desc)=>ics(['UID:r1\r\nCATEGORIES:ACTION-FICTIVE\r\nDTSTART:20261125T093000\r\nDTEND:20261125T103000\r\nSUMMARY:FICTIF Personne\r\nLOCATION:CMS fictif\r\nDESCRIPTION:'+desc]);
  const anc=(desc)=>C.parse(evt(desc)).events.map(e=>({...e,key:'gdin:'+JSON.stringify(['r1','ACTION-FICTIVE',e.start,e.end,e.title,e.location,'description:'+e.description])}))[0];   /* clé de l'ancien parseur : description entière */
  const seedUi=(events)=>{profile='fictif-ui';doc.defaultView.confirm=()=>true;storage.setItem(ui.key,JSON.stringify({version:1,events}));C.render(pane,ui);};
  const stored=()=>JSON.parse(storage.getItem(ui.key)).events;
  const bouton=()=>nodes(pane,n=>n.tagName==='button'&&/^Retirer les \d+ anciennes versions$/.test(n.textContent))[0];
  // R1 : deux imports d'avant le correctif (sans contacts / avec) → nettoyage réel → réimport identique : une seule inscription, rien d'ajouté
  seedUi([anc(objet),anc(objet+'\\n'+TEL+'\\n'+MAIL)]);assert(bouton(),'bandeau présent');await bouton().click();
  assert.equal(stored().length,1,'R1 : une inscription après nettoyage');
  const re=C.merge(stored(),C.parse(evt(objet+'\\n'+TEL+'\\n'+MAIL)).events);assert.equal(re.events.length,1,'R1 : réimport idempotent après nettoyage');assert.equal(re.added,0);assert.equal(re.events[0].key,stored()[0].key,'clé existante non réécrite');
  assert.equal(C.merge(re.events,C.parse(evt(objet+'\\n'+TEL+'\\n'+MAIL)).events).unchanged,1);
  // R2 : téléphone seul / e-mail seul → les deux contacts survivent au vrai clic
  seedUi([anc(objet+'\\n'+TEL),C.parse(evt(objet+'\\n'+MAIL)).events[0]]);await bouton().click();
  assert.equal(stored().length,1);assert(stored()[0].description.includes(TEL)&&stored()[0].description.includes(MAIL),'R2 : téléphone ET e-mail conservés');
  // R2 : valeurs contradictoires → le choix est montré, rien n'est tranché en silence ; la valeur choisie est celle gardée
  seedUi([anc(objet+'\\n'+TEL),C.parse(evt(objet+'\\n'+TEL2)).events[0]]);
  const sels=nodes(pane,n=>n.tagName==='select'&&/^Valeur à garder/.test(n.attrs['aria-label']||''));assert.equal(sels.length,1,'conflit proposé à l’utilisateur');const sel=sels[0];assert.equal(sel.children.length,2,'deux valeurs distinctes montrées');
  sel.value=TEL;await sel.fire('change');await bouton().click();assert(stored()[0].description.includes('06 00 00 00 01')&&!stored()[0].description.includes('07 00 00 00 02'),'valeur choisie (autre que celle de la version gardée) conservée');
  seedUi([anc(objet+'\\n'+TEL),C.parse(evt(objet+'\\n'+TEL2)).events[0]]);await bouton().click();assert.equal(stored().length,1,'sans choix : valeur de la version gardée, aucune perte de groupe');
  // R3 : un autre onglet ajoute un autre groupe entre l'affichage et le clic → rien n'est retiré, aucune écriture
  seedUi([anc(objet),anc(objet+'\\n'+TEL)]);const w0=writes;
  const autre=(d)=>C.parse(ics(['UID:r2\r\nCATEGORIES:ACTION-FICTIVE\r\nDTSTART:20261126T093000\r\nDTEND:20261126T103000\r\nSUMMARY:FICTIF Autre\r\nLOCATION:CMS fictif\r\nDESCRIPTION:'+d])).events.map(e=>({...e,key:'gdin:'+JSON.stringify(['r2','ACTION-FICTIVE',e.start,e.end,e.title,e.location,'description:'+e.description])}))[0];
  const concurrent=[...stored(),autre('Autre objet'),autre('Autre objet\\n'+TEL)];storage.setItem(ui.key,JSON.stringify({version:1,events:concurrent}));
  await bouton().click();assert.equal(writes,w0,'R3 : aucune écriture');assert.equal(stored().length,4,'R3 : rien retiré');assert(pane.textContent.includes('Le calendrier a changé'),'R3 : message clair');
  // R3 : refus de la confirmation → aucune écriture
  seedUi([anc(objet),anc(objet+'\\n'+TEL)]);const w1=writes;doc.defaultView.confirm=()=>false;await bouton().click();doc.defaultView.confirm=()=>true;assert.equal(writes,w1,'refus : sans écriture');assert.equal(stored().length,2);
  // R3 : applyDuplicates refuse un élément figé qui a changé
  const g=C.duplicates([anc(objet),anc(objet+'\\n'+TEL)]);assert.throws(()=>C.applyDuplicates([anc(objet),{...anc(objet+'\\n'+TEL),cancelled:true}],g),/a changé/);
 }
 /* Diagnostic : noms de champs seulement, jamais de valeur. */
 {const mk=(x)=>C.parse(ics(['UID:'+(x.uid||'d1')+'\r\nCATEGORIES:ACTION-D\r\nDTSTART:20261125T093000\r\nDTEND:20261125T103000\r\nSUMMARY:'+(x.titre||'FICTIF Personne')+'\r\nLOCATION:CMS fictif\r\nDESCRIPTION:'+(x.desc||'Objet fictif')])).events[0];
  const d1=C.differences([mk({}),mk({desc:'Objet fictif\\nTéléphone : 06 99 99 99 99'})]);assert.deepEqual(d1,['description (lignes : numéro de téléphone)']);
  const d2=C.differences([mk({}),mk({uid:'d2',titre:'FICTIF Autre'})]);assert(d2.includes('UID')&&d2.includes('titre'));
  const d3=C.differences([mk({}),mk({desc:'Autre ligne fictive 0612345678'})]);assert.deepEqual(d3,['description (lignes : texte libre sans libellé)']);
  assert(!JSON.stringify([d1,d2,d3]).includes('9999')&&!JSON.stringify(d3).includes('0612345678')&&!JSON.stringify(d3).includes('Autre ligne'),'aucune valeur dans le diagnostic');
  assert.deepEqual(C.differences([mk({}),mk({})]),[]);}
 /* Numéro et adresse SEULS sur leur ligne (forme de l'export réel, d'après le diagnostic de l'utilisateur) : même identité, même nettoyage. */
 {const objet='Demande de logement social',P='06 12 34 56 78',M='fictif@example.invalid';
  const e=(d,x={})=>C.parse(ics(['UID:b1\r\nCATEGORIES:ACTION-B\r\nDTSTART:20261125T093000\r\nDTEND:20261125T103000\r\nSUMMARY:FICTIF Personne\r\nLOCATION:CMS fictif\r\nDESCRIPTION:'+d])).events[0];
  const ancien=C.merge([],[e(objet)]).events;
  const r=C.merge(ancien,[e(objet+'\\n'+P+'\\n'+M)]);assert.equal(r.events.length,1,'numéro et adresse seuls : pas de seconde inscription');assert.equal(r.updated,1);assert(r.events[0].description.includes(P)&&r.events[0].description.includes(M));
  assert.deepEqual(C.differences([e(objet),e(objet+'\\n'+P+'\\n'+M)]),['description (lignes : sans libellé, numéro de téléphone, sans libellé, adresse e-mail)']);
  assert(!JSON.stringify(C.differences([e(objet),e(objet+'\\n'+P+'\\n'+M)])).includes('12 34'),'aucune valeur montrée');
  // formes de numéro reconnues / refusées
  assert.equal(C.stripContacts('Objet\n+33 6 12 34 56 78\n0612345678\n06.12.34.56.78'),'Objet');assert.equal(C.stripContacts('Objet\n25/11/2026\n2026\nDossier 0612345678\n123456789'),'Objet\n25/11/2026\n2026\nDossier 0612345678\n123456789','dates, années, numéros dans une phrase : jamais retirés');
  // doublons déjà créés avec lignes sans libellé : groupés, contacts reportés, conflit montré
  const anc=(d)=>({...e(d),key:'gdin:'+JSON.stringify(['b1','ACTION-B',e(d).start,e(d).end,'FICTIF Personne','CMS fictif','description:'+e(d).description])});
  const g=C.duplicates([anc(objet),anc(objet+'\\n'+P+'\\n'+M)]);assert.equal(g.length,1);assert.equal(g[0].conflicts.length,0);
  const g2=C.duplicates([anc(objet+'\\n'+P),anc(objet+'\\nTéléphone : 07 00 00 00 02')]);assert.equal(g2.length,1);assert.equal(g2[0].conflicts.length,1,'numéro seul et numéro libellé de même nature, valeurs différentes : conflit');
  const g3=C.duplicates([anc(objet+'\\n'+P),anc(objet+'\\nTéléphone : 06 12 34 56 78')]);assert.equal(g3[0].conflicts.length,0,'même numéro, formes différentes : pas de conflit');}
 /* Coordonnées du détail : texte seul, lien seulement pour un numéro ou une adresse de forme exacte. */
 {const m=(d)=>({title:'FICTIF Personne',description:d});
  const it=C.contactItems([m('Objet\n06 12 34 56 78\nfictif@example.invalid\nTéléphone : 07.00.00.00.02\nE-mail : autre@example.invalid')]);
  assert.deepEqual(it.map(x=>[x.kind,x.href]),[['tel','tel:0612345678'],['mail','mailto:fictif@example.invalid'],['tel','tel:0700000002'],['mail','mailto:autre@example.invalid']]);
  const h=C.contactItems([m('Téléphone : javascript:alert(1)\nE-mail : <img src=x onerror=alert(1)>')]);assert.equal(h.length,2);assert(h.every(x=>x.href===''),'valeur hostile : jamais de lien');
  assert.equal(C.contactItems([m('Objet seul')]).length,0);}
 console.log('Calendrier GDIN : 10 inscriptions fictives → 1 atelier, UID réutilisés, actions/lieux/activités, réimport multiple, recherche/filtres, durée nulle, horaires Paris/UTC/été, stockage/profils/pannes et parcours sûrs OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
