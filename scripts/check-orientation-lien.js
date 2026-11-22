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
/* 22/11/2026 : ouvrir la vraie fiche liée depuis sa puce, en relisant le lien dans le contexte du rendu.
   Données fictives ; aucune écriture n'est nécessaire pour ouvrir la fenêtre. */
{
 const S={activeProfile:'p1',generation:1,orientations:[orientation('o-1')],history:[{id:'fiche-1',orientationId:'o-1',date:'2026-11-25',heure:'10:30',commune:'CMS fictif',statut:'confirme',notes:'Note fictive'}],permanences:[]};
 const calls={modal:0,refresh:0,refus:0,toasts:[]};
 const c=vm.createContext({S,Object,String,Array,Date,
   contexteIntact:x=>x&&x.profil===S.activeProfile&&x.gen===S.generation,
   refusContexte:()=>calls.refus++,readProfileHistory:pid=>{assert.equal(pid,'p1');return S.history;},
   estLibere:statut=>['lapin','excuse','annule','pas_de_retour'].includes(statut),
   renderModal:()=>calls.modal++,renderOrientations:()=>calls.refresh++,showToast:message=>calls.toasts.push(message)});
 vm.runInContext(fonction('ficheDeOrientation')+fonction('ouvrirRdvOrientation'),c);
 const source={id:'o-1',contexte:{profil:'p1',gen:1}};
 // Le contenu a changé depuis le rendu de la puce : ouvrir la version courante avec son identifiant.
 S.history=[{...S.history[0],date:'2026-11-26',heure:'11:30',statut:'lapin',notes:'Note fictive corrigée'}];
 const avant=JSON.stringify({history:S.history,orientations:S.orientations,permanences:S.permanences});
 assert.equal(c.ouvrirRdvOrientation(source),true);assert.equal(S.modal,'agenda-rdv');assert.equal(calls.modal,1);
 assert.equal(S.agendaRdv.slot.taken.id,'fiche-1');assert.equal(S.agendaRdv.slot.taken._profile,'p1');
 assert.equal(S.agendaRdv.slot.taken.notes,'Note fictive corrigée');assert.equal(S.agendaRdv.slot.freeAgain,true);
 assert.equal(S.agendaRdv.day.dateStr,'2026-11-26');assert.equal(S.agendaRdv.slot.heure,'11:30');assert.equal(S.agendaRdv.day.profile,'p1');
 assert.equal(JSON.stringify({history:S.history,orientations:S.orientations,permanences:S.permanences}),avant,'ouverture en lecture seule');
 // Fiche supprimée ou lien absent : une fiche homonyme n'est jamais choisie à sa place.
 S.modal=null;S.history=[{id:'homonyme',nom:'Fictif',prenom:'Jean',date:'2026-11-26',heure:'11:30'}];
 assert.equal(c.ouvrirRdvOrientation(source),false);assert.equal(S.modal,null);assert.equal(calls.modal,1);assert.equal(calls.refresh,1);
 S.history=[{id:'fiche-1',orientationId:'o-1',date:'2026-11-26',heure:'11:30'}];S.orientations=[];
 assert.equal(c.ouvrirRdvOrientation(source),false);assert.equal(calls.modal,1,'orientation supprimée : pas de lien ancien rouvert');
 // Changement de profil puis retour : la génération du contexte empêche un ancien bouton de rouvrir une fiche.
 S.orientations=[orientation('o-1')];S.generation=2;
 assert.equal(c.ouvrirRdvOrientation(source),false);assert.equal(calls.refus,1);assert.equal(calls.modal,1);
 S.generation=1;S.activeProfile='p2';assert.equal(c.ouvrirRdvOrientation(source),false);assert.equal(calls.refus,2);
 const card=section('    var ficheLiee=ficheDeOrientation(o,S.history);','    if(o.date)badges.appendChild');
 assert.match(card,/sourceRdv=\{id:String\(o.id\),contexte:contexteFige\(\)\}/);
 assert.match(card,/el\('button',\{type:'button',class:'ui-record-chip ui-record-chip-muted ui-record-chip-link'/);
 assert.match(card,/onClick:function\(\)\{ouvrirRdvOrientation\(sourceRdv\);\}/);
 assert.match(html,/\.ui-record-chip-link:focus-visible\{outline:2px solid var\(--ui-accent\)/);
 const modal=section('function renderModal(){','  S._lastModal=S.modal;');
 assert.match(modal,/S\._lastModal==='agenda-rdv'&&S\.activeTab==='orientations'[\s\S]*renderOrientations\(\)/,'fermeture : statut et notes reflétés dans Orientations');
}
console.log('check-orientation-lien : OK');
