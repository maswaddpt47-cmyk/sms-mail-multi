/* AG-018 (priorité 2, premier lot) : activité par CMS sur 12 mois — définition stabilisée confirmée par Codex (3015f72).
   Application ENTIÈRE chargée, données fictives. Dates passées par le VRAI parseur Excel (feuille XLSX fabriquée, entrées non compressées),
   bornes de la fenêtre et minuit Paris, CMS reconnus / non reconnus / ambigus, tous états, années archivées sans zéro, aucun taux.
   Exécuter : node scripts/check-activite.js (INDEX_HTML=<copie> pour une mutation ; TZ=UTC et TZ=Europe/Paris). */
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
const J=o=>JSON.parse(JSON.stringify(o));
const SECTEURS=['Fumel','Marmande','Villeneuve-Sur-Lot','Agen Montanou',"Saint-Pardoux-d'Isaac"];

/* ── fichier XLSX fictif (zip à entrées non compressées) passé au vrai parseur ── */
function zip(fichiers){
  const parts=[];
  for(const [nom,txt] of Object.entries(fichiers)){
    const data=Buffer.from(txt,'utf8'),n=Buffer.from(nom,'utf8'),h=Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50,0);h.writeUInt16LE(20,4);h.writeUInt16LE(0,8);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(n.length,26);h.writeUInt16LE(0,28);
    parts.push(h,n,data);
  }
  return new Uint8Array(Buffer.concat(parts)).buffer;
}
function classeur(entetes,lignes){
  const ss=[],idx=t=>{let i=ss.indexOf(t);if(i<0){ss.push(t);i=ss.length-1;}return i;},col=i=>String.fromCharCode(65+i);
  const esc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const cellule=(v,ref)=>typeof v==='number'?`<c r="${ref}"><v>${v}</v></c>`:`<c r="${ref}" t="s"><v>${idx(v)}</v></c>`;
  const rows=[entetes,...lignes].map((l,r)=>`<row r="${r+1}">${l.map((v,i)=>cellule(v,col(i)+(r+1))).join('')}</row>`).join('');
  const sheet=`<worksheet><sheetData>${rows}</sheetData></worksheet>`;
  return zip({'xl/sharedStrings.xml':`<sst>${ss.map(t=>`<si><t>${esc(t)}</t></si>`).join('')}</sst>`,'xl/worksheets/sheet1.xml':sheet});
}
const serie=(y,m,d)=>RealDate.UTC(y,m-1,d)/86400000+25569;   // numéro de série Excel d'une date

(async()=>{
  /* ── (A) dates via le vrai parseur ── */
  {const c=charger();
   const buf=classeur(['Nom & prénom bénéficiaire','Structure','Date de la demande','Motif','Etat de la demande'],[
     ['DUPONT Anne','Centre Médico-Social de Fumel',serie(2026,10,12),'Motif fictif','En cours'],
     ['MARTIN Paul','CMS Marmande','12/10/2026','Motif fictif','En cours'],
     ['DURAND Lea','Villeneuve-Sur-Lot','2026-10-12','Motif fictif','Annulée'],
     ['PETIT Jo','Fumel','31/02/2026','Motif fictif',''],
     ['ROUX Max','Fumel','inconnue','Motif fictif',''],
     ['LEROY Eva','Fumel','46307','Motif fictif','']]);   // chiffres saisis en TEXTE : pas un numéro de série
   const r=J(await c.parseXlsxOrientationsAsync(buf));
   assert.deepEqual(r.map(x=>x.date),['2026-10-12','2026-10-12','2026-10-12','','',''],'dates lues strictement');
   assert.deepEqual(r.map(x=>x.dateBrute),['','','','31/02/2026','inconnue','46307'],'texte d\'origine conservé à part, jamais converti');
   const sans=await c.parseXlsxOrientationsAsync(classeur(['Nom','Structure','Date d\'envoi'],[['ABEL Ana','Fumel',serie(2026,10,1)]]));
   assert.equal(sans.sansColonneDate,true,'colonne « Date de la demande » absente signalée');assert.equal(sans[0].date,'','aucun repli sur une autre colonne « date »');
   assert.deepEqual(J(c.lireDateOrientation('2026-02-29',false)),{date:'',brute:'2026-02-29'},'date impossible');
   assert.deepEqual(J(c.lireDateOrientation('1/3/2026',false)),{date:'2026-03-01',brute:''},'jour/mois sur un chiffre');
   assert.deepEqual(J(c.lireDateOrientation(serie(2026,12,31)+0.75,true)),{date:'2026-12-31',brute:''},'heure dans la série ignorée');
   // aller jusqu'au stockage : confirmOrientImport conserve dateBrute
   c.S.orientImportRows=r.map(x=>Object.assign({},x,{include:true,targetProfile:'p1'}));c.confirmOrientImport();
   assert.equal(c.S.orientations.length,6);assert.equal(c.S.orientations.filter(o=>o.dateBrute).length,3);}
  console.log('(A) Dates par le vrai parseur Excel : série, texte français et ISO, date impossible, texte libre, colonne absente OK.');

  /* ── fenêtre, CMS, tous états, anomalies ── */
  {const c=charger('2027-01-15T10:00:00Z');
   const o=(date,structure,extra)=>Object.assign({nom:'FICTIF',commune:structure,date:date,etat:'',done:false},extra);
   const orientations=[o('2026-02-01','Centre Médico-Social de Fumel'),o('2026-01-31','Fumel'),o('2027-01-15','CMS Marmande'),o('2027-01-16','Fumel'),
     o('2026-06-10','CMS Marmande et Fumel'),o('2026-06-11','Mairie fictive'),o('2026-06-12',''),o('','Fumel',{dateBrute:'inconnue'}),o('1900-01-11','Fumel'),
     o('2026-07-01','Fumel',{etat:'Annulée',done:true}),o('2026-07-02',"Centre Médico-Social de Saint Pardoux d'Isaac")];
   const f=(date,statut,commune,extra)=>Object.assign({channel:'sms',msgType:'confirmation',nom:'FICTIF',date:date,heure:'09:30',statut:statut,commune:commune},extra);
   const history=[f('2026-02-01','realise','Fumel'),f('2026-01-31','realise','Fumel'),f('2027-01-15','realise','Marmande'),f('2027-01-16','realise','Fumel'),
     f('2026-05-05','lapin','Fumel'),f('2026-05-06','realise',''),f('2026-05-07','realise','Paris fictif'),f('2026-05-08','realise','Fumel',{msgType:'indispo'}),f('2026-05-09','realise','fumel ')];
   const r=J(c.activiteParCms(orientations,history,{},'2027-01-15',SECTEURS));
   assert.equal(r.fenetre.du,'2026-02-01');assert.equal(r.fenetre.au,'2027-01-15');assert.equal(r.fenetre.mois.length,12);assert.equal(r.fenetre.mois[0],'2026-02');
   assert.equal(r.demandes.Fumel['2026-02'],1,'1er jour de M−11 inclus');assert.equal(r.demandes.Marmande['2027-01'],1,'jour courant inclus');
   assert.equal(Object.values(r.demandes.Fumel).reduce((a,b)=>a+b,0),2,'veille de la fenêtre et lendemain exclus ; état Annulée et « traitée » comptés');
   assert.equal(r.demandes["Saint-Pardoux-d'Isaac"]['2026-07'],1,'Structure rapprochée par mots');
   assert.deepEqual(r.anomalies,{dateInconnue:1,dateImprobable:1,cmsNonReconnu:2,cmsAmbigu:1,rdvSansCms:1,rdvHorsListe:1},'anomalies comptées à part (1900-01-11 = date improbable)');
   assert.equal(r.demandes.Fumel['2026-06'],0,'CMS ambigu jamais attribué au premier trouvé');
   assert.deepEqual(r.orientations,{presentes:11,avant:1,apres:1},'orientations présentes et hors période comptées');
   assert.equal(r.rdv.Fumel['2026-02'],1);assert.equal(r.rdv.Marmande['2027-01'],1);assert.equal(r.rdv.Fumel['2026-05'],1,'« fumel␣ » regroupé (cmsKey) ; Lapin et blocage exclus');
   assert.equal(Object.values(r.rdv.Fumel).reduce((a,b)=>a+b,0),2,'RDV hors fenêtre exclus');}
  console.log('Fenêtre (bornes incluses/exclues), CMS reconnus / non reconnus / ambigus, tous états, anomalies OK.');

  /* ── minuit Paris et passage d'année ── */
  {const c=charger('2026-12-31T23:30:00Z');   // 01/01/2027 00:30 à Paris
   const f=J(c.fenetreActivite(c.jourParis()));
   assert.equal(f.au,'2027-01-01');assert.equal(f.du,'2026-02-01');assert.equal(f.mois[11],'2027-01');assert.equal(f.mois[0],'2026-02');
   const c2=charger('2026-12-31T22:30:00Z');   // 31/12/2026 23:30 à Paris
   const f2=J(c2.fenetreActivite(c2.jourParis()));assert.equal(f2.au,'2026-12-31');assert.equal(f2.du,'2026-01-01');assert.equal(f2.mois[11],'2026-12');}
  console.log('Minuit Paris et décembre / janvier OK.');

  /* ── années archivées : couverture partielle, jamais de zéro, note tous CMS séparée ── */
  {const c=charger('2027-01-15T10:00:00Z');
   c.S.history=[{id:'f-1',channel:'sms',msgType:'confirmation',nom:'ARCH',prenom:'A',commune:'Fumel',date:'2026-03-10',heure:'09:30',statut:'realise',ts:'01/03/2026 10:00:00'}];
   const arc=c.computeYearArchive(2026);assert.equal(c.lectureArchive(arc),'ag017-v1');
   const vivantes=[{msgType:'confirmation',commune:'Fumel',date:'2026-03-11',heure:'10:30',statut:'realise'},{msgType:'confirmation',commune:'Fumel',date:'2027-01-05',heure:'10:30',statut:'realise'}];
   const r=J(c.activiteParCms([],vivantes,{2026:arc},'2027-01-15',SECTEURS));
   assert.equal(Object.keys(r.archives).length,11,'les 11 mois de 2026 de la fenêtre sont partiels');
   assert.equal(r.archives['2026-03'].realisesTousCms,1,'note tous CMS de l\'archive');assert.equal(r.rdv.Fumel['2026-03'],0,'fiche vivante d\'une année archivée non ajoutée');
   assert.equal(r.rdv.Fumel['2027-01'],1);
   const r2=J(c.activiteParCms([],[],{2026:{year:2026,total:3}},'2027-01-15',SECTEURS));assert.equal(r2.archives['2026-03'].realisesTousCms,null,'ancienne archive : indisponible, pas zéro');
   const src=code.slice(code.indexOf('function carteActiviteParCms('),code.indexOf('/* ============================== AG-019'));
   assert(src.includes("'—'")&&src.includes('(partiel)')&&src.includes('indisponible'),'affichage : tiret et mentions partielles, jamais zéro');
   assert(!/%|\/\s*demandes|taux/i.test(src.replace(/comme un taux/,'')),'aucun taux entre les deux séries');
   assert(src.includes('Total (CMS reconnus seulement)')&&src.includes('Couverture non certifiée'),'libellés de couverture');
   assert(/wrap\.appendChild\(carteActiviteParCms\(\)\)/.test(code),'carte branchée dans Statistiques');}
  console.log('Années archivées (partiel, note séparée, jamais zéro), aucun taux, libellés OK.');
})().catch(e=>{console.error(e);process.exit(1);});

/* ── AG-019 : délai d'attente par CMS ── */
{const c=charger('2027-01-15T10:00:00Z');
 const f=(o)=>Object.assign({msgType:'confirmation',statut:'realise',commune:'Fumel',heure:'09:30'},o);
 const r=J(c.delaiAttenteParCms([f({date:'2026-10-20',dateReception:'2026-10-10'}),f({date:'2026-10-31',dateReception:'2026-10-01'}),f({date:'2026-11-02',dateReception:'2026-10-31'}),
   f({date:'2026-10-20',dateDemande:'2026-10-01'}),f({date:'2026-10-20',dateReception:''}),f({date:'2026-10-20',dateReception:'2026-10-25'}),f({date:'2026-10-20',dateReception:'2026-10-20',commune:'fumel '}),
   f({date:'2026-10-20',dateReception:'2026-10-14',commune:'Marmande',statut:'lapin'}),f({date:'2026-10-20',dateReception:'2026-10-01',msgType:'indispo'})]));
 assert.equal(r.parCms.fumel.mesurables,4);assert.equal(r.parCms.fumel.mediane,6,'médiane de 0, 2, 10, 30 = 6');
 assert.equal(r.parCms.fumel.sansReception,2,'ancien dateDemande et réception vide : non mesurables, jamais repris');
 assert.equal(r.parCms.fumel.incoherente,1,'réception après le RDV');assert.equal(r.parCms.marmande.mediane,6,'tous les RDV de la période (Lapin compris)');
 assert.equal(r.global.mesurables,5);assert.equal(r.global.mediane,6);
 assert.equal(c.medianeNombres([3,1,2]),2);assert.equal(c.medianeNombres([]),null);
 assert(/wrap\.appendChild\(carteDelaiAttente\(rdv\.entries\)\)/.test(code),'carte branchée sur les RDV filtrés de la page');}
console.log('AG-019 délai d\'attente (médiane, mesurables, exclusions, jamais l\'ancienne date du message) OK.');

/* ── AG-020 : RDV sans suite ── */
{const c=charger('2027-01-15T10:00:00Z');
 const f=(date,statut,o)=>Object.assign({msgType:'confirmation',commune:'Fumel',heure:'09:30',date:date,statut:statut},o);
 const r=J(c.rdvSansSuite([f('2027-01-10','lapin'),f('2027-01-10','pas_de_retour'),f('2027-01-14','confirme'),f('2027-01-15','confirme'),f('2027-01-20','confirme'),
   f('2027-01-10','realise'),f('2027-01-10','excuse'),f('2027-01-10','lapin',{msgType:'indispo'}),f('','lapin')],'2027-01-15'));
 assert.equal(r.lapin.length,1);assert.equal(r.pasDeRetour.length,1);
 assert.equal(r.aPointer.length,1,'confirmé passé seulement (aujourd\'hui et futur exclus)');
 assert(/rdvSansSuite\(rdv\.entries,jourParis\(\)\)/.test(code)&&/openStatList\(k\[1\]\+' sur la période',k\[0\]\)/.test(code),'carte branchée sur les RDV filtrés et la liste existante');}
console.log('AG-020 RDV sans suite (lapins, pas de retour, à pointer) OK.');
{const src=code.slice(code.indexOf('function carteActiviteParCms('),code.indexOf('/* ============================== AG-019'));
 assert(/var cmsActifs=r\.cms\.filter\(function\(c\)\{return f\.mois\.some\(function\(m\)\{return r\.demandes\[c\]\[m\]\|\|r\.rdv\[c\]\[m\];\}\);\}\);/.test(src)&&/cmsActifs\.forEach/.test(src),'CMS sans activité masqués, mêmes lignes dans les deux tableaux');}
console.log('Lignes de CMS sans activité masquées OK.');
/* ── délai : premiers RDV (suivis recopiant la réception écartés du diagnostic) ── */
{const c=charger('2027-01-15T10:00:00Z');
 const f=(o)=>Object.assign({msgType:'confirmation',statut:'realise',commune:'Marmande',heure:'09:30',nom:'FICTIF',prenom:'A',dateReception:'2026-10-01'},o);
 const r=J(c.delaiAttenteParCms([f({date:'2026-10-03'}),f({date:'2026-11-20'}),f({date:'2026-12-30'}),f({prenom:'B',date:'2026-10-11',dateReception:'2026-10-05'})]));
 assert.equal(r.parCms.marmande.mediane,(50+6)/2,'médiane principale inchangée (2, 6, 50, 90)');
 assert.equal(r.parCms.marmande.medianePremiers,4,'premiers RDV : 2 et 6');assert.equal(r.parCms.marmande.suivis,2);assert.equal(r.global.suivis,2);}
console.log('Délai : diagnostic des premiers RDV OK.');
