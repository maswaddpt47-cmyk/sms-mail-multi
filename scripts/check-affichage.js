/* Valeurs réellement affichées (AG-013, étape 0) : le chiffre montré à côté de chaque libellé est celui
   du modèle, dans Statistiques et dans le bilan mensuel. Données exclusivement fictives.
   Le bloc des tuiles de Statistiques est extrait tel quel d'index.html et exécuté avec un DOM minimal.
   Exécuter : node scripts/check-affichage.js (INDEX_HTML=<copie> pour vérifier une mutation). */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start);assert(end>start,to);return html.slice(start,end);}

/* DOM minimal : el(tag, attributs, enfants) comme dans l'application, sans navigateur */
function el(tag,attrs,children){
  const node={tag,attrs:attrs||{},children:[],text:'',dataset:{},addEventListener(){},appendChild(c){this.children.push(c);return c;}};
  if(typeof children==='string'||typeof children==='number')node.text=String(children);
  else if(Array.isArray(children))children.forEach(c=>node.appendChild(c));
  return node;
}
const ctx=vm.createContext({Date,el,isAPointer:()=>false,openStatList(){},attachPermanenceTip(){}});
vm.runInContext(section('function toLocalDateStr(d){','\n')+'\n'+section('var DUREE_CRENEAU=60;','function hasConflict(')
  +section('function statsRdvModel(','/* ============================== RENDER: STATS')
  +section('function nombresEnTexte(','function compterNombre(')
  +'\nfunction tuilesStats(rdv,wrap){'+section('/* ── Tableau de bord KPI ── */','\n  /*',)+'}',ctx);

function row(id,date,statut,heure,nom,prenom,extra){return Object.assign({id,date,statut,heure,commune:'A',msgType:'confirmation',nom,prenom,demarche:'Démarche fictive',ts:'01/10/2026 10:00:00'},extra||{});}
/* total, réalisés et personnes volontairement différents : 3 réalisés pour 2 personnes, 6 RDV en octobre, 1 RDV futur */
const history=[
  row('r1','2026-10-01','realise','09:30','FICTIF','Paul'),
  row('r2','2026-10-08','realise','09:30','FICTIF','Paul'),
  row('r3','2026-10-02','realise','10:30','EXEMPLE','Léa',{dateRelance:'2026-10-01'}),
  row('l1','2026-10-03','lapin','11:30','ESSAI','Marc'),
  row('e1','2026-10-06','excuse','09:30','ESSAI','Zoé'),
  row('a1','2026-10-07','en_attente','13:30','ESSAI','Noé'),
  row('f1','2026-11-05','confirme','09:30','FUTUR','Ana'),
  {id:'b1',date:'2026-10-09',heure:'10:30',commune:'A',msgType:'indispo',nom:'Indisponible'}
];
const before=JSON.stringify(history),now=new Date(2026,9,25,12);

/* ── Statistiques : couples chiffre / libellé des tuiles ── */
const rdv=ctx.statsRdvModel(history,[],'all','',now);
const wrap=el('div');ctx.tuilesStats(rdv,wrap);
const band=wrap.children[0]&&wrap.children[0].children.find(c=>/ui-stats-metric-band/.test(c.attrs.class||''));
assert(band,'bande des tuiles introuvable');
const tuiles={};band.children.forEach(t=>{tuiles[t.children[1].children[0].text]=t.children[0].text;});
assert.equal(Object.keys(tuiles).length,8,'les huit tuiles sont rendues');   // garde : le test est bien arrivé aux tuiles
// valeurs attendues recomptées à la main sur les données ci-dessus, indépendamment du modèle
assert.equal(tuiles['RDV réalisés'],'3');
assert.equal(tuiles['RDV sur la période'],'7');
assert.equal(tuiles['Usagers accompagnés'],'2');
assert.equal(tuiles['Places disponibles à venir'],'—');
assert.equal(tuiles['Taux de concrétisation'],'50%');   // 3 créneaux réalisés / 6 créneaux passés attribués
assert.equal(tuiles['Taux de lapin 🐇'],'17%');         // 1 / 6
assert.equal(tuiles['Taux de remplissage'],'17%');      // 6 créneaux / (6 journées × 6 places)
assert.equal(tuiles['Remplissage net'],'11%');          // 4 créneaux non libérés / 36
// et cohérents avec le modèle (raccordement)
assert.equal(tuiles['RDV réalisés'],String(rdv.realised.length));
assert.equal(tuiles['RDV sur la période'],String(rdv.entries.length));
assert.equal(tuiles['Usagers accompagnés'],String(rdv.accompaniedN));

/* ── Bilan mensuel : couples chiffre / libellé ── */
const d=ctx.monthlyReportData(history,'2026-10','',now);
const bilan=ctx.monthlyReportHtml(d,{profil:'Profil fictif',date:'25/10/2026'});
function kpi(label){const m=new RegExp('<span class="bilan-kpi-value">([^<]*)</span><span class="bilan-kpi-label">'+label).exec(bilan);assert(m,'tuile du bilan introuvable : '+label);return m[1];}
assert.equal(kpi('Personnes accompagnées'),'2');
assert.equal(kpi('RDV réalisés'),'3');
const total=/Rendez-vous du mois \(tous statuts\)[\s\S]*?<strong>([^<]*)<\/strong>/.exec(bilan);
assert(total,'total du bilan introuvable');assert.equal(total[1],'6');
const suivi=/RDV avec relance renseignée<\/p><strong>([^<]*)<\/strong>/.exec(bilan);
assert(suivi,'suivi des relances introuvable');assert.equal(suivi[1],'1');
assert.equal(kpi('Personnes accompagnées'),String(d.accompanied));
assert.equal(kpi('RDV réalisés'),String(d.realised));

/* ── AG-014 (B) et (C) : « Statut à vérifier » et RDV sans heure affichés ── */
{
  const h2=history.concat([
    row('v1','2026-10-10',null,'10:30','VIDE','Sam'),row('v2','2026-10-12','bizarre','11:30','INCONNU','Sam'),   // statut absent / inconnu
    row('s1','2026-10-11','realise','','SANS','Heure'),row('s2','2026-10-13','lapin','','SANS','Heure2'),          // deux RDV passés sans heure (CMS A)
    {...row('s3','2026-10-14','realise','','AUTRECMS','B'),commune:'B'},                                         // un RDV passé sans heure (CMS B)
    row('s4','2026-11-20','confirme','','FUTUR','SansHeure')                                                      // sans heure mais à venir : hors population des taux
  ]);
  const avant2=JSON.stringify(h2);
  // bilan : la ligne apparaît avec son nombre, le total la contient, « En attente » ne change pas
  const d2=ctx.monthlyReportData(h2,'2026-10','',now),b2=ctx.monthlyReportHtml(d2,{profil:'Profil fictif',date:'25/10/2026'});
  const ligne=(html,lib)=>{const m=new RegExp('<tr><td>'+lib+'</td><td class="n">(\\d+)</td>').exec(html);return m?Number(m[1]):null;};
  assert.equal(ligne(b2,'Statut à vérifier'),2,'bilan : deux fiches sans statut valide');
  assert.equal(ligne(b2,'En attente'),1,'bilan : « En attente » ne reprend pas les statuts inconnus');
  assert.equal(d2.byStatut.a_verifier,2);assert.equal(Object.values(d2.byStatut).reduce((a,b)=>a+b,0),d2.entries,'bilan : la somme des catégories = le total (rien ne sort des totaux)');
  const somme=['Réalisé','Confirmé','En attente','Excusé','Annulé','Lapin','Pas de retour','Statut à vérifier'].reduce((n,l)=>n+(ligne(b2,l)||0),0);
  assert.equal(somme,d2.entries,'bilan : les lignes affichées totalisent le total affiché');
  assert.equal(ligne(bilan,'Statut à vérifier'),null,'bilan sans statut inconnu : la ligne n\'est pas affichée');
  // Statistiques : note sous les deux taux, population période/CMS/jour courant
  const notes=(m)=>{const w=el('div');ctx.tuilesStats(m,w);const b=w.children[0].children.find(c=>/ui-stats-metric-band/.test(c.attrs.class||''));const o={};
    b.children.forEach(t=>{const nom=t.children[1].children[0].text;const note=t.children.map(c=>c.attrs&&/metric-note/.test(c.attrs.class||'')?(c.children[0]&&c.children[0].text||c.text):null).filter(Boolean).join('');o[nom]=note||'';});return o;};
  const tout=notes(ctx.statsRdvModel(h2,[],'all','',now)),cmsA=notes(ctx.statsRdvModel(h2,[],'all','A',now)),cmsB=notes(ctx.statsRdvModel(h2,[],'all','B',now));
  assert.match(tout['Taux de concrétisation'],/3 RDV sans heure exclus du taux/,'tous CMS : 3 RDV passés sans heure (le RDV à venir n\'est pas compté)');
  assert.match(tout['Taux de lapin 🐇'],/3 RDV sans heure exclus du taux/);
  assert.match(cmsA['Taux de concrétisation'],/2 RDV sans heure exclus du taux/,'CMS A : même population que le taux');
  assert.match(cmsB['Taux de concrétisation'],/1 RDV sans heure exclu du taux/,'singulier');
  assert.doesNotMatch(notes(rdv)['Taux de concrétisation'],/sans heure/,'aucun RDV sans heure : aucune mention');
  // les taux eux-mêmes sont inchangés par l'ajout des fiches sans heure (elles n'ont jamais formé de créneau)
  const sans=ctx.statsRdvModel(h2,[],'all','A',now).slotRates,avecSeulement=ctx.statsRdvModel(h2.filter(h=>h.heure),[],'all','A',now).slotRates;
  assert.equal(sans.total,avecSeulement.total);assert.equal(sans.realised,avecSeulement.realised);assert.equal(sans.lapins,avecSeulement.lapins);assert.equal(sans.sansHeure,2);assert.equal(avecSeulement.sansHeure,0);
  assert.equal(JSON.stringify(h2),avant2,'données non modifiées');
}

/* ── Compteurs animés : la valeur finale affichée est exactement la valeur calculée ── */
Object.values(tuiles).concat(['1,5','3 / 6 (50 %)','66%']).forEach(t=>{
  assert.equal(ctx.nombresEnTexte(t,1),t,'valeur finale du compteur : '+t);
});
assert.equal(ctx.nombresEnTexte('3 / 6 (50 %)',0),'0 / 0 (0 %)');

/* ── Animation réelle (amendement Codex du 31/10) : compterNombre et animerGraphesStats exécutés tels quels,
   horloge et requestAnimationFrame pilotés ; valeur de départ, mi-parcours, fin et restauration avant impression ── */
let horloge=1000,prochainRaf=1;const rafs=new Map(),ecouteurs={},observateurs=[];
function lancerRafs(){const lot=[...rafs.entries()];rafs.clear();lot.forEach(([,f])=>f());}
function noeud(texte){return {textContent:texte,dataset:{},closest:()=>carte};}
const valeurs=Object.values(tuiles).filter(t=>/\d/.test(t)).concat(['1,5','3 / 6 (50 %)']);
const nombres=valeurs.map(noeud);
const carte={classList:{set:new Set(),add(c){this.set.add(c);},remove(c){this.set.delete(c);}},querySelectorAll:()=>nombres};
const racine={querySelectorAll:()=>[carte]};
const anim=vm.createContext({
  Date:{now:()=>horloge},
  requestAnimationFrame(f){const id=prochainRaf++;rafs.set(id,f);return id;},
  cancelAnimationFrame(id){rafs.delete(id);},
  window:{matchMedia:()=>({matches:false}),innerHeight:800,addEventListener(t,f){ecouteurs[t]=f;},
    IntersectionObserver:class{constructor(cb){this.cb=cb;observateurs.push(this);}observe(){}}},
  document:{querySelectorAll:sel=>/ui-anim-pre/.test(sel)?[carte]:nombres},
  renderStats:function(){}
});
anim.IntersectionObserver=anim.window.IntersectionObserver;
vm.runInContext(section('var STATS_NOMBRES=','function renderStats(){'),anim);
anim.animerGraphesStats(racine);
assert.equal(observateurs.length,1,'l\'animation est bien branchée');   // garde : le chemin animé est réellement parcouru
nombres.forEach((n,i)=>{
  assert.equal(n.dataset.final,valeurs[i],'valeur finale reprise du texte de la tuile');
  assert.equal(n.textContent,anim.nombresEnTexte(valeurs[i],0),'départ à zéro');
});
const visible=v=>observateurs[0].cb([{target:carte,isIntersecting:v,intersectionRatio:v?1:0,intersectionRect:{height:v?500:0}}]);
visible(true);lancerRafs();lancerRafs();               // double requestAnimationFrame avant le départ
horloge+=400;lancerRafs();                              // mi-parcours : ni zéro ni valeur finale pour un nombre > 1
assert(nombres.some((n,i)=>n.textContent!==valeurs[i]),'en cours d\'animation');
horloge+=500;lancerRafs();                              // au-delà de 800 ms
nombres.forEach((n,i)=>assert.equal(n.textContent,valeurs[i],'fin d\'animation : '+valeurs[i]));
assert.equal(rafs.size,0,'animation terminée');
visible(false);                                         // sortie de l'écran : retour à zéro
assert.equal(nombres[0].textContent,anim.nombresEnTexte(valeurs[0],0));
visible(true);lancerRafs();lancerRafs();horloge+=100;lancerRafs();   // impression en pleine animation
assert(ecouteurs.beforeprint,'restauration avant impression branchée');
ecouteurs.beforeprint();
nombres.forEach((n,i)=>assert.equal(n.textContent,valeurs[i],'avant impression : '+valeurs[i]));
assert(!carte.classList.set.has('ui-anim-pre'));

assert.equal(JSON.stringify(history),before,'lecture seule');
console.log('Valeurs affichées : tuiles Statistiques, tuiles et total du bilan, suivi des relances, valeur finale des compteurs OK.');
