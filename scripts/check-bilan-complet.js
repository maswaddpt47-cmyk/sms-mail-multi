/* AG-027 : vrai rapport enrichi, données fictives uniquement. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
const code=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const RealDate=Date;
function charger(iso){
  const FIXE=new RealDate(iso||'2027-01-15T10:00:00Z').getTime();
  class D extends RealDate{constructor(...a){a.length?super(...a):super(FIXE);}static now(){return FIXE;}}
  const m=new Map();
  const localStorage={getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},key:i=>[...m.keys()][i]??null,get length(){return m.size;}};
  const noeud=()=>({style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains(){return false;}},appendChild(){},setAttribute(){},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},removeChild(){},insertBefore(){}});
  const document={addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},getElementById(){return null;},createElement:noeud,createTextNode:noeud,body:noeud(),documentElement:noeud()};
  const window={addEventListener(){},matchMedia(){return {matches:false,addEventListener(){}};},localStorage,location:{href:''},navigator:{}};
  const c=vm.createContext({document,window,localStorage,navigator:{},location:{href:''},setTimeout(){},clearTimeout(){},setInterval(){},console,Intl,Date:D,Math,JSON,Promise,TextDecoder,Uint8Array,URL:{createObjectURL(){return '';}},Blob:function(){}});
  vm.runInContext(code,c);
  Object.assign(c,{showToast(){},renderModal(){},renderAll(){},regen(){},renderHeader(){},renderTabs(){},renderOrientations(){},githubPush(){},maybeAutoBackupProfile(){},ghToken:()=>''});
  vm.runInContext(`S.activeProfile='p1';S.history=[];S.yearlyStats={};S.orientations=[];S.secteurs=['Fumel','Marmande','Villeneuve-Sur-Lot','Agen Montanou',"Saint-Pardoux-d'Isaac"];
    S.cmsList=[{id:1,nom:'Fumel'},{id:2,nom:'Marmande'}];S.demarches=[];`,c);
  return c;
}
const ctx=charger('2026-10-25T12:00:00+01:00');
const row=(id,date,statut,extra={})=>({id,date,heure:'09:30',commune:'A',nom:'SECRET_FICTIF_'+id,prenom:'Test',telephone:'0600000000',notes:'NOTE_INTERDITE',body:'MESSAGE_INTERDIT',msgType:'confirmation',channel:'sms',ts:'2026-10-05T10:00:00+02:00',dateReception:'2026-10-05',statut,...extra});
const history=[
 row('a','2026-10-10','realise'),row('b','2026-10-10','lapin',{heure:'10:30',channel:'mail'}),
 row('c','2026-10-10','annule',{heure:'10:30'}),row('d','2026-10-11','confirme',{heure:''}),
 row('e','2026-11-05','confirme'), // message octobre, RDV novembre
 row('f','2026-10-12','realise',{ts:'2026-09-29T12:00:00+02:00',dateReception:'2026-09-29',commune:'B'}),
 row('g','2026-10-13','pas_de_retour',{msgType:'relance',dateRelance:'2026-10-01'}),
 row('h','2026-10-14','realise',{ts:'illisible',dateReception:''}),
 row('i','2026-10-15','realise',{ts:'2026-10-06T12:00:00+02:00',dateReception:'2026-10-05',channel:'autre'}),
 row('j','2026-10-28','confirme',{ts:'2026-10-28T12:00:00+01:00'}), // mois courant après borne
 row('bloc','2026-10-05',null,{msgType:'indispo'})
];
const now=new Date('2026-10-25T12:00:00+01:00'),perms=[{exceptDate:'2026-10-10',commune:'A',debut:'09:30',fin:'12:30',archived:true},{exceptDate:'2026-11-05',commune:'A',debut:'09:30',fin:'16:30'}];
const context={permanences:perms,orientations:[{date:'2026-10-01',commune:'A'},{date:'illisible',commune:'A'}],secteurs:['A','B'],yearlyStats:{}};
const before=JSON.stringify({history,context});
const d=ctx.monthlyReportComplete(history,'2026-10','',now,context),s=d.stats;
assert.equal(d.entries,8);assert.equal(d.realised,4);
assert.equal(s.fiches.total,7,'message octobre : exclut septembre et date illisible, inclut RDV novembre, exclut message après borne');
assert.equal(s.fiches.canaux.sms,5);assert.equal(s.fiches.canaux.mail,1);assert.equal(s.fiches.canaux.inconnu,1);assert.equal(s.fiches.nonMesurables,1);
assert.equal(s.fiches.personnes,7);assert.equal(s.fiches.byMonth['2026-10'].sms,5);
assert.equal(s.reactivite.n,6);assert.equal(s.reactivite.memeJour,5);assert.equal(s.reactivite.moyenne,0.2);assert.equal(s.reactivite.nExclus,2);assert.equal(s.reactivite.exclus.ts_illisible,1);assert.equal(s.reactivite.exclus.suivi,1);
// Recomptage indépendant des créneaux : six datés d'une heure ; c partage celui de b, d sans heure.
assert.equal(s.rates.total,6);assert.equal(s.rates.realised,4);assert.equal(s.rates.lapins,1);assert.equal(s.rates.sansHeure,1);
assert.equal(s.rates.places,27,'demi-journée A du 10/10 = 3, quatre autres journées = 24');assert.equal(s.rates.joursDemi,1);
assert.equal(s.sansSuite.aPointer,1);assert.equal(s.sansSuite.lapin,1);assert.equal(s.sansSuite.pasDeRetour,1);
assert.equal(s.delai.global.mesurables+s.delai.global.reprise+s.delai.global.sansReception+s.delai.global.incoherente,8);
assert.equal(s.contexte.days.length,1);assert.equal(s.contexte.free,5);assert.equal(s.contexte.activite.anomalies.dateInconnue,1);
assert.equal(s.contexte.heat['2026-10-10'],2,'heatmap : créneaux distincts, pas fiches');
const b=ctx.monthlyReportComplete(history,'2026-10','b',now,context);assert.equal(b.entries,1);assert.equal(b.stats.fiches.total,0,'CMS normalisé et calendrier du message distinct');
const messages=ctx.monthlyReportComplete([row('seul','2026-11-05','confirme')],'2026-10','A',now,context);assert.equal(messages.entries,0);assert.equal(messages.stats.fiches.total,1);assert.equal(messages.empty,false);
assert.equal(ctx.monthlyReportComplete(history,'2026-9','',now,context),null);
const out=ctx.monthlyReportHtml(d,{profil:'Profil fictif',date:'25/10/2026'});
for(const label of ['Taux de concrétisation','Taux de lapin','Taux de remplissage','Remplissage net','Dossiers','SMS','Mails','Canal inconnu','Usagers','Le même jour','Moyenne en jours ouvrés'])assert(out.includes(label),label);
assert.doesNotMatch(out,/<h2>(?:Fiches par mois du message|Répartition par type|Dossiers par CMS|RDV sans suite|Délai d’attente|Contexte au|Activité annuelle|Activité par CMS)/);
assert.doesNotMatch(out,/<th>Exclusion<\/th>|Exclues :/,'tableau Exclusion et récapitulatif retirés du bilan');
assert.equal([...out.matchAll(/<h2>(.*?)<\/h2>/g)].at(-1)[1],'Réactivité','le bilan se termine à la réception, écran et impression');
assert.match(out,/67 %/);assert.match(out,/17 %/);assert.match(out,/22 %/);assert.match(out,/15 %/);assert.match(out,/83 %/);
assert.match(out,/5 \/ 6 dossiers calculables/);assert.match(out,/0,2/);assert.match(out,/1 RDV sans heure exclus/);
assert.doesNotMatch(out,/SECRET_FICTIF|0600000000|NOTE_INTERDITE|MESSAGE_INTERDIT|undefined|NaN|bilan-info/);
assert.match(ctx.monthlyReportHtml(messages,{profil:'P'}),/Dossiers/);
assert.equal(JSON.stringify({history,context}),before,'aucune donnée ni date réécrite');
// D1 (contradiction de Claude sur AG-026) : un RDV importé par ICS (sans message, daté de l'import) n'entre pas dans « Dossiers ».
{const ics={id:'ics',date:'2026-10-22',heure:'11:30',commune:'A',nom:'SECRET_FICTIF_ics',prenom:'',msgType:'rdv',body:'',channel:'sms',ts:'2026-10-20T10:00:00+02:00'};
 const di=ctx.monthlyReportComplete(history.concat([ics]),'2026-10','',now,context);
 assert.equal(di.stats.fiches.total,7,'D1 : dossiers inchangés');assert.equal(di.stats.fiches.canaux.sms,5);assert.equal(di.stats.fiches.sansMessage,1);
 assert.equal(di.stats.reactivite.n,6);assert.equal(di.stats.reactivite.exclus.sans_message,1);assert.equal(di.stats.reactivite.exclus.reception_absente,0,'motif exact');
 const oi=ctx.monthlyReportHtml(di,{profil:'P',date:'25/10/2026'});assert.match(oi,/1 fiche sans message \(RDV importé du calendrier ou du planning\), hors total\./);
 assert.doesNotMatch(oi,/SECRET_FICTIF/);assert.equal(d.stats.fiches.sansMessage,0);assert.doesNotMatch(out,/sans message/,'aucune mention sans import');}
assert.equal(JSON.stringify(ctx.monthlyReportComplete(history,'2026-10','',now,context)),JSON.stringify(d),'idempotence');
assert.match(html,/var bData=monthlyReportComplete\(S.history/,'la fenêtre réelle utilise le modèle complet');
assert.match(html,/printMonthlyReport\(monthlyReportHtml\(bData/,'impression sur le même modèle');
console.log('Bilan complet : inventaire, mois/CMS, calendriers distincts, demi-journée, messages seuls, inconnus, taux, réactivité, contexte, rendu et anonymat OK.');
