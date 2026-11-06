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
assert.deepEqual(C.bounds('2026-11-06','week'),['2026-11-02','2026-11-09']);assert.deepEqual(C.bounds('2026-11-06','month'),['2026-10-26','2026-12-07']);
const unsupported=C.parse(ics([event('repeat','RRULE:FREQ=WEEKLY'),event('exception','RECURRENCE-ID:20261106T093000'),'UID:bad\r\nDTSTART:20260230T093000', 'UID:gap\r\nDTSTART;TZID=Europe/Paris:20260329T023000', 'UID:unknown\r\nDTSTART;TZID=Fuseau/Inconnu:20261106T090000']));
assert.equal(unsupported.events.length,0);assert.equal(unsupported.warnings.recurrences,2);assert.equal(unsupported.warnings.dates,3);
assert.equal(C.parse(ics(['UID:duration\r\nDTSTART:20261106T090000\r\nDURATION:PT90M'])).events[0].end,'2026-11-06T09:30:00.000Z');
assert(C.parse(ics([event('cancel','STATUS:CANCELLED')])).events[0].cancelled);
assert.throws(()=>C.parse('pas un calendrier'));assert.throws(()=>C.parse('BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:20261106T090000\nEND:VCALENDAR'));
const merge=C.merge(p.events,p.events);assert.equal(merge.added,0);assert.equal(merge.unchanged,2);assert.equal(merge.events.length,2);
const changed={...p.events[0],title:'Réunion fictive déplacée'};const m=C.merge(p.events,[changed]);assert.equal(m.updated,1);assert.equal(m.events.length,2);assert.equal(m.events[0].title,changed.title);
assert.equal(C.merge([],p.events.concat(p.events)).events.length,2,'doublons du fichier');
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
 setAttribute(k,v){this.attrs[k]=String(v);}getAttribute(k){return this.attrs[k];}appendChild(n){n.parentNode=this;this.children.push(n);return n;}replaceChildren(){this.children=[];this._text='';}
 addEventListener(k,f){(this.listeners[k]||(this.listeners[k]=[])).push(f);}async fire(k){for(const f of this.listeners[k]||[])await f({target:this});}click(){if(!this.disabled)return this.fire('click');}get lastChild(){return this.children[this.children.length-1];}focus(){}showModal(){this.open=true;}close(){this.open=false;this.fire('close');}remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(n=>n!==this);}
}
const doc={defaultView:{innerWidth:390,confirm:()=>true},createElement(t){return new N(t,doc);},createTextNode(t){const n=new N('#text',doc);n.textContent=t;return n;}};
function nodes(n,f){return (f(n)?[n]:[]).concat(...n.children.map(c=>nodes(c,f)));}const pane=doc.createElement('div');
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
 await byText('Semaine').click();assert(nodes(pane,n=>(n.className||'').includes('ics-timeline')).length);await byText('Mois').click();assert.equal(nodes(pane,n=>(n.className||'').split(' ').includes('ics-month-day')).length,42);
 C.render(pane,ui);const again=nodes(pane,n=>n.tagName==='input'&&n.attrs.type==='file')[0];again.files=[{size:200,text:async()=>ics([event('ui','SUMMARY:<img src=x onerror=alert(1)>')])}];await again.fire('change');await byText('Ajouter au calendrier').click();assert.equal(C.load(storage,'ess-fictif-ui-calendar-ics-v1').events.length,1);
 assert.equal(JSON.stringify(hist),histBefore,'historique métier inchangé');profile='autre';C.render(pane,{...ui,profileId:'autre'});assert(!pane.textContent.includes('<img'),'cloisonnement des profils');
 console.log('Calendrier ICS : formats, Paris/UTC/été, journées, récurrences signalées, doublons, stockage/profils/pannes, chevauchements et parcours import/rendu sûrs OK.');
})().catch(e=>{console.error(e);process.exitCode=1;});
