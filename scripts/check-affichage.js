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

/* ── Compteurs animés : la valeur finale affichée est exactement la valeur calculée ── */
Object.values(tuiles).concat(['1,5','3 / 6 (50 %)','66%']).forEach(t=>{
  assert.equal(ctx.nombresEnTexte(t,1),t,'valeur finale du compteur : '+t);
});
assert.equal(ctx.nombresEnTexte('3 / 6 (50 %)',0),'0 / 0 (0 %)');

assert.equal(JSON.stringify(history),before,'lecture seule');
console.log('Valeurs affichées : tuiles Statistiques, tuiles et total du bilan, suivi des relances, valeur finale des compteurs OK.');
