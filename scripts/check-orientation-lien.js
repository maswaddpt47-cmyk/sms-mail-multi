/* AG-033 (16/11/2026) : lien orientation → dossier. Vraies fonctions extraites d'index.html (orientationALier,
   marquerOrientationTraitee, ficheDeOrientation, writeProfileOrientations, handleGenerate, statutAffiche) ; addHistory,
   stockage et rendu simulés. Données fictives. Exécuter : node scripts/check-orientation-lien.js (INDEX_HTML=<copie> pour une mutation). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start+from.length);assert(end>start,to);return html.slice(start,end);}
function fonction(nom){return section('function '+nom+'(','\nfunction ');}
const CODE=[
  section('var STATUTS=[',"\n"),section('var STATUTS_CONNUS=',"\n"),section("var STATUT_A_VERIFIER=","\n"),fonction('statutAffiche'),
  fonction('orientationALier'),fonction('marquerOrientationTraitee'),fonction('ficheDeOrientation'),fonction('writeProfileOrientations'),fonction('handleGenerate')
].join('\n');

function charger(opts){
  opts=opts||{};
  const ecrit={},journal={toasts:[],ecritures:0,ajouts:[]};
  const S={activeProfile:'p1',history:[],orientations:[],orientationSource:null,channel:'sms',msgType:'sans_appel',civilite:'M.',prenom:'Jean',nom:'Fictif',telephone:'0600000000',
    selectedDemarche:'',demarcheAutre:'',commune:'Fumel',selectedCMS:'1',date:'2026-11-20',heure:'09:30',dateDemande:'2026-11-16',dateReception:'',receptionSource:null,receptionReprise:''};
  const ctx=vm.createContext({S,Object,String,Array,JSON,
    canGenerate:()=>true,telProblem:()=>'',confirm:()=>true,confirmerCreneau:()=>true,compute:()=>({body:'corps',subject:'',dem:{nom:'Démarche fictive'}}),
    tsParis:()=>'2026-11-16T10:00:00+01:00',receptionAEcrire:()=>({garder:true}),sourceReception:()=>null,
    addHistory:Object.assign(function(item){journal.ajouts.push(item);if(opts.panneFiche)return false;S.history=[item].concat(S.history);return true;},{incoherent:false}),
    MSG_INCOHERENT:'incohérent',showToast:(m,t)=>journal.toasts.push({m,t}),
    lsSet:(k,v)=>{if(opts.panneOrient&&/orientations/.test(k))return false;ecrit[k]=JSON.stringify(v);journal.ecritures++;return true;},
    pk:k=>'ess-p1-'+k,
    maybeAutoBackupProfile(){},renderGenerate(){},renderHistory(){},renderMandat(){},renderAgenda(){},renderOrientations(){},renderTabs(){}
  });
  vm.runInContext(CODE,ctx);
  return {ctx,S,ecrit,journal};
}
const orientation=(id,extra)=>Object.assign({id,nom:'Fictif',prenom:'Jean',done:false,commune:'Fumel',motif:'CAF',date:'2026-11-10'},extra||{});

/* ── A : orientation retenue, même personne → fiche liée, orientation traitée, message de succès ── */
{const e=charger();e.S.orientations=[orientation('o-1')];e.S.orientationSource={id:'o-1',nom:'Fictif',prenom:'Jean'};
 e.ctx.handleGenerate();
 assert.equal(e.S.history.length,1);assert.equal(e.S.history[0].orientationId,'o-1','la fiche porte l’id de l’orientation');
 assert.equal(e.S.orientations[0].done,true,'orientation traitée en mémoire');
 assert.equal(JSON.parse(e.ecrit['ess-p1-orientations'])[0].done,true,'orientation traitée en stockage');
 assert.equal(e.journal.toasts[0].m,'✓ Message généré et enregistré');assert.equal(e.journal.toasts[0].t,undefined);}

/* ── B : nom changé après le préremplissage → aucun lien, orientation intacte (casse et espaces ignorés sinon) ── */
{const e=charger();e.S.orientations=[orientation('o-1')];e.S.orientationSource={id:'o-1',nom:'Fictif',prenom:'Jean'};e.S.nom='Autre';
 e.ctx.handleGenerate();
 assert.equal('orientationId' in e.S.history[0],false,'pas de champ ajouté');assert.equal(e.S.orientations[0].done,false);assert.equal(e.ecrit['ess-p1-orientations'],undefined,'rien d’écrit côté orientations');}
{const e=charger();e.S.orientations=[orientation('o-1')];e.S.orientationSource={id:'o-1',nom:'fictif ',prenom:'JEAN'};
 e.ctx.handleGenerate();assert.equal(e.S.history[0].orientationId,'o-1','comparaison sans casse ni espaces');}

/* ── C : formulaire sans orientation (saisie directe, fiche rouverte) → aucun champ ── */
{const e=charger();e.S.orientations=[orientation('o-1')];
 e.ctx.handleGenerate();assert.equal('orientationId' in e.S.history[0],false);assert.equal(e.S.orientations[0].done,false);}
{const e=charger();assert.equal(e.ctx.orientationALier({id:'',nom:'Fictif',prenom:'Jean'},{nom:'Fictif',prenom:'Jean'}),'','orientation sans id : pas de lien');
 assert.equal(e.ctx.orientationALier({id:7,nom:'Fictif',prenom:'Jean'},{nom:'Fictif',prenom:'Jean'}),'7','id numérique écrit en texte');}

/* ── D : panne de stockage sur les orientations → fiche enregistrée et liée, orientation non traitée, avertissement ── */
{const e=charger({panneOrient:true});e.S.orientations=[orientation('o-1')];e.S.orientationSource={id:'o-1',nom:'Fictif',prenom:'Jean'};
 e.ctx.handleGenerate();
 assert.equal(e.S.history[0].orientationId,'o-1');assert.equal(e.S.orientations[0].done,false,'mémoire réalignée : non traitée');
 assert.equal(e.journal.toasts[0].t,'warn');assert.match(e.journal.toasts[0].m,/marquez-la à la main/);}

/* ── E : fiche non enregistrée → orientation jamais touchée ── */
{const e=charger({panneFiche:true});e.S.orientations=[orientation('o-1')];e.S.orientationSource={id:'o-1',nom:'Fictif',prenom:'Jean'};
 e.ctx.handleGenerate();
 assert.equal(e.S.history.length,0);assert.equal(e.S.orientations[0].done,false);assert.equal(e.journal.ecritures,0,'aucune écriture');assert.equal(e.journal.toasts[0].t,'err');}

/* ── F : orientation absente ou déjà traitée → rien à écrire, succès ── */
{const e=charger();e.S.orientations=[orientation('o-9')];e.S.orientationSource={id:'o-1',nom:'Fictif',prenom:'Jean'};
 e.ctx.handleGenerate();assert.equal(e.S.history[0].orientationId,'o-1','lien écrit même si l’orientation n’est plus sur l’appareil');assert.equal(e.journal.ecritures,0);assert.equal(e.journal.toasts[0].t,undefined);}
{const e=charger();e.S.orientations=[orientation('o-1',{done:true})];
 assert.equal(e.ctx.marquerOrientationTraitee('o-1'),true);assert.equal(e.journal.ecritures,0,'déjà traitée : pas de réécriture');}

/* ── G : carte — fiche liée la plus récente, indispo ignorée, sans id → rien ── */
{const e=charger();
 const h=[{orientationId:'o-1',msgType:'indispo',date:'2026-11-30'},{orientationId:'o-1',date:'2026-11-25',heure:'10:30',statut:'confirme'},{orientationId:'o-1',date:'2026-11-20',heure:'09:30',statut:'realise'},{date:'2026-11-21'}];
 const f=e.ctx.ficheDeOrientation({id:'o-1'},h);assert.equal(f.date,'2026-11-25','la plus récente (ordre de S.history), hors indisponibilité');
 assert.equal(e.ctx.ficheDeOrientation({id:'o-2'},h),null);assert.equal(e.ctx.ficheDeOrientation({},h),null);assert.equal(e.ctx.ficheDeOrientation({id:'o-1'},undefined),null);
 assert.equal(e.ctx.statutAffiche(f),'confirme');assert.equal(e.ctx.statutAffiche({orientationId:'o-1',date:'2026-11-25'}),'a_verifier','statut absent : à vérifier');}

console.log('check-orientation-lien : OK');
