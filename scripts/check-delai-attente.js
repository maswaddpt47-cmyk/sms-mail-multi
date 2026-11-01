/* Vérification du délai d'attente (AG-019 modèle, AG-021 listes et masquage), données exclusivement fictives.
   Exécuter : node scripts/check-delai-attente.js   (aussi TZ=Europe/Paris) */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start);assert(end>start,to);return html.slice(start,end);}
const ctx=vm.createContext({Date});
vm.runInContext([
  section('function preparationDayUTC(value){','function preparationParisDay('),
  section('function joursCivilsEntre(','\n'),
  section('function cmsKey(','\n'),
  section('function usagerKey(','\n'),
  section('function medianeNombres(','\n'),
  section('function delaiAttenteParCms(','/* AG-021 : listes locales'),
].join('\n'),ctx);
const card=section('function carteDelaiAttente(','/* ============================== AG-020');

function row(id,commune,nom,date,rec,extra={}){
  const h={id,commune,nom,prenom:'Exemple',date,msgType:'confirmation',statut:'realise',...extra};
  if(rec!==undefined)h.dateReception=rec;   /* absente si undefined */
  return h;
}
const entries=[
  row('A1','Marmande','FICTIF Alpha','2026-10-10','2026-10-01'),     /* 9 j */
  row('A2','Marmande','FICTIF Bravo','2026-10-05','2026-09-25'),     /* 10 j, RDV le 05/10 */
  row('A3','Marmande','FICTIF Charlie','2026-10-20','2026-10-18'),   /* 2 j */
  row('A4','Marmande','FICTIF Delta','2026-10-12'),                  /* exclu : pas de réception saisie */
  row('A5','Marmande','FICTIF Echo','2026-10-28','2026-10-30'),      /* exclu : réception postérieure au RDV */
  row('A6','Fumel','FICTIF Foxtrot','2026-10-11','2026-10-01'),      /* 10 j, RDV le 11/10 : égalité avec A2 */
  row('A7','Marmande','FICTIF Golf','2026-10-14','xx'),              /* exclu : réception illisible = absente */
  row('A8','Marmande','FICTIF Hotel','2026-10-15','2026-10-01',{msgType:'indispo'}),   /* hors population */
  row('A9','Marmande','FICTIF India','2026-02-30','2026-02-01'),      /* date de RDV inexistante : hors population */
];
const before=JSON.stringify(entries);
const r=ctx.delaiAttenteParCms(entries);

// Effectifs (inchangés par AG-021).
assert.equal(r.global.mesurables,4);assert.equal(r.global.sansReception,2);assert.equal(r.global.incoherente,1);
assert.equal(r.parCms[ctx.cmsKey('Marmande')].mesurables,3);assert.equal(r.parCms[ctx.cmsKey('Fumel')].mesurables,1);
// La médiane reste calculée dans le modèle (non affichée) : [2, 9, 10, 10] -> 9.5.
assert.equal(r.global.mediane,9.5);

// Liste des fiches mesurables : délai croissant, égalité départagée par date du RDV.
const m=JSON.parse(JSON.stringify(r.liste.mesures));
assert.deepEqual(m.map(x=>x.personne),['Exemple FICTIF Charlie','Exemple FICTIF Alpha','Exemple FICTIF Bravo','Exemple FICTIF Foxtrot']);
assert.deepEqual(m.map(x=>x.d),[2,9,10,10]);
assert.deepEqual(m.map(x=>x.rdv),['2026-10-20','2026-10-10','2026-10-05','2026-10-11']);
assert.equal(m[0].rec,'2026-10-18');
assert.equal(m.every((x,i)=>i===0||m[i-1].d<=x.d),true);

// Fiches exclues, chacune avec son motif exact ; la fiche sans réception n'utilise jamais la date du message.
const x=JSON.parse(JSON.stringify(r.liste.exclus));
assert.equal(x.length,3);
assert.deepEqual(x.filter(e=>e.motif==='sans_reception').map(e=>e.personne),['Exemple FICTIF Delta','Exemple FICTIF Golf']);
assert.deepEqual(x.filter(e=>e.motif==='apres_rdv').map(e=>[e.personne,e.rec,e.rdv]),[['Exemple FICTIF Echo','2026-10-30','2026-10-28']]);

// Les listes respectent exactement l'effectif affiché.
assert.equal(m.length,r.global.mesurables);
assert.equal(x.length,r.global.sansReception+r.global.incoherente);
assert.equal(r.parCms[ctx.cmsKey('Marmande')].sansReception,2);

// Premiers RDV : même diagnostic qu'avant (effectifs seulement affichés).
assert.equal(r.parCms[ctx.cmsKey('Marmande')].nPremiers+r.parCms[ctx.cmsKey('Marmande')].suivis,3);

// Entrée non modifiée, calcul reproductible.
assert.equal(JSON.stringify(entries),before);
assert.equal(JSON.stringify(ctx.delaiAttenteParCms(entries)),JSON.stringify(r));

// Affichage : aucune médiane rendue dans la carte (effectifs seulement).
assert.equal(/\.mediane\b|medianePremiers|medianeNombres/.test(card),false,'médiane encore affichée');
assert.ok(card.includes('Couverture insuffisamment établie pour interpréter le délai d’attente'),'mention absente');
assert.ok(/openDelaiList\(/.test(card),'listes non reliées');

console.log('Délai d’attente : effectifs, listes triées, motifs d’exclusion et masquage de la médiane conformes.');
