/* AG-033 (16/11/2026) : lien orientation → dossier, fonctions pures extraites d'index.html (orientationALier,
   marquerOrientationTraitee, ficheDeOrientation, writeProfileOrientations, statutAffiche). Les parcours complets (Générer,
   copie, panne, fusion) sont dans check-ecritures.js avec le vrai addHistory. Données fictives.
   Exécuter : node scripts/check-orientation-lien.js (INDEX_HTML=<copie> pour une mutation). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start+from.length);assert(end>start,to);return html.slice(start,end);}
function fonction(nom){return section('function '+nom+'(','\nfunction ');}
const CODE=[
  section('var STATUTS=[',"\n"),section('var STATUTS_CONNUS=',"\n"),section("var STATUT_A_VERIFIER=","\n"),fonction('statutAffiche'),
  fonction('orientationALier'),fonction('marquerOrientationTraitee'),fonction('ficheDeOrientation'),fonction('writeProfileOrientations')
].join('\n');
function charger(opts){
  opts=opts||{};const ecrit={},journal={ecritures:0};
  const S={activeProfile:'p1',history:[],orientations:[]};
  const ctx=vm.createContext({S,Object,String,Array,JSON,
    lsSet:(k,v)=>{if(opts.panneOrient&&/orientations/.test(k))return false;ecrit[k]=JSON.stringify(v);journal.ecritures++;return true;},
    pk:k=>'ess-p1-'+k,maybeAutoBackupProfile(){}});
  vm.runInContext(CODE,ctx);return {ctx,S,ecrit,journal};
}
const orientation=(id,extra)=>Object.assign({id,nom:'Fictif',prenom:'Jean',done:false},extra||{});
/* orientationALier : même personne (casse et espaces ignorés), id en texte, sans id → rien */
{const {ctx}=charger();
 assert.equal(ctx.orientationALier({id:'o-1',nom:'Fictif',prenom:'Jean'},{nom:'fictif ',prenom:'JEAN'}),'o-1');
 assert.equal(ctx.orientationALier({id:'o-1',nom:'Fictif',prenom:'Jean'},{nom:'Autre',prenom:'Jean'}),'','nom différent : pas de lien');
 assert.equal(ctx.orientationALier({id:'o-1',nom:'Fictif',prenom:'Jean'},{nom:'Fictif',prenom:'Paul'}),'','prénom différent : pas de lien');
 assert.equal(ctx.orientationALier(null,{nom:'Fictif',prenom:'Jean'}),'');assert.equal(ctx.orientationALier({id:'',nom:'Fictif',prenom:'Jean'},{nom:'Fictif',prenom:'Jean'}),'','sans id : pas de lien');
 assert.equal(ctx.orientationALier({id:7,nom:'Fictif',prenom:'Jean'},{nom:'Fictif',prenom:'Jean'}),'7','id numérique écrit en texte');}
/* marquerOrientationTraitee : écrit done, respecte une panne, ne réécrit pas une orientation déjà traitée ou absente */
{const e=charger();e.S.orientations=[orientation('o-1'),orientation('o-2')];
 assert.equal(e.ctx.marquerOrientationTraitee('o-1'),true);assert.equal(e.S.orientations[0].done,true);assert.equal(e.S.orientations[1].done,false);
 assert.equal(JSON.parse(e.ecrit['ess-p1-orientations'])[0].done,true);assert.equal(e.journal.ecritures,1);}
{const e=charger({panneOrient:true});e.S.orientations=[orientation('o-1')];
 assert.equal(e.ctx.marquerOrientationTraitee('o-1'),false);assert.equal(e.S.orientations[0].done,false,'mémoire inchangée après panne');}
{const e=charger();e.S.orientations=[orientation('o-1',{done:true})];assert.equal(e.ctx.marquerOrientationTraitee('o-1'),true);assert.equal(e.journal.ecritures,0,'déjà traitée : pas de réécriture');
 assert.equal(e.ctx.marquerOrientationTraitee('o-9'),true);assert.equal(e.journal.ecritures,0,'absente : rien à écrire');}
/* ficheDeOrientation : première fiche liée dans l'ordre de S.history (récent d'abord), indisponibilité ignorée, sans id → rien */
{const e=charger();
 const h=[{orientationId:'o-1',msgType:'indispo',date:'2026-11-30'},{orientationId:'o-1',date:'2026-11-25',heure:'10:30',statut:'confirme'},{orientationId:'o-1',date:'2026-11-20',heure:'09:30',statut:'realise'},{date:'2026-11-21'}];
 const f=e.ctx.ficheDeOrientation({id:'o-1'},h);assert.equal(f.date,'2026-11-25','la première de S.history hors indisponibilité');
 assert.equal(e.ctx.ficheDeOrientation({id:'o-2'},h),null);assert.equal(e.ctx.ficheDeOrientation({},h),null);assert.equal(e.ctx.ficheDeOrientation({id:'o-1'},undefined),null);
 assert.equal(e.ctx.statutAffiche(f),'confirme');assert.equal(e.ctx.statutAffiche({orientationId:'o-1',date:'2026-11-25'}),'a_verifier','statut absent : à vérifier');}
console.log('check-orientation-lien : OK');
