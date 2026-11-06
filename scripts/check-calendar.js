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
 assert.equal(C.STAGES.length,8);assert.deepEqual(C.STAGES.find(s=>s.id==='accompagnement'),{id:'accompagnement',label:'Accompagnement',keys:['accompagnement','demarche','demarches','logement','caf','ants','anef','carsat','inpi'],bg:'#9999FF',border:'#6363FE',text:'#000000'});}
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
const hist=[{date:'2026-11-06',heure:'09:30',nom:'FICTIF',prenom:'Exemple',commune:'Lieu fictif',msgType:'confirmation'}],histBefore=JSON.stringify(hist);assert.equal(C.rdvs(hist).length,1);assert.equal(JSON.stringify(hist),histBefore);
assert.equal(C.rdvs([{...hist[0],heure:''}])[0].unknownTime,true,'RDV sans heure conservé, heure à préciser');
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
 const multi=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];assert(multi.attrs.multiple);multi.files=[{size:2000,text:async()=>ics(Array.from({length:5},(_,i)=>workshop(i+1)))},{size:2000,text:async()=>ics(Array.from({length:6},(_,i)=>workshop(i+5)))}];await multi.fire('change');assert(pane.textContent.includes('1 événements après'));assert(pane.textContent.includes('1 lignes strictement identiques fusionnées dans cet import.'));await byText('Ajouter au calendrier').click();
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
 console.log('Calendrier GDIN : 10 inscriptions fictives → 1 atelier, UID réutilisés, actions/lieux/activités, réimport multiple, recherche/filtres, durée nulle, horaires Paris/UTC/été, stockage/profils/pannes et parcours sûrs OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
