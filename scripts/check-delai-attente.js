/* Vérification du délai d'attente (AG-019 modèle, AG-021 listes et masquage), données exclusivement fictives.
   Exécuter : node scripts/check-delai-attente.js   (aussi TZ=Europe/Paris) */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const start=html.indexOf(from);assert(start>=0,from);const end=html.indexOf(to,start);assert(end>start,to);return html.slice(start,end);}
const ctx=vm.createContext({Date});
vm.runInContext([
  section('function preparationDayUTC(value){','function preparationParisDay('),
  section('function etatReception(','/* valeur de départ'),
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
  row('B1','Marmande','FICTIF Juliet','2026-10-16',undefined,{dateDemande:'2026-10-02'}),   /* AG-022 : ancienne date reprise, à confirmer */
];
const before=JSON.stringify(entries);
const r=ctx.delaiAttenteParCms(entries);

// Effectifs (inchangés par AG-021).
assert.equal(r.global.mesurables,4);assert.equal(r.global.sansReception,2);assert.equal(r.global.incoherente,1);assert.equal(r.global.reprise,1);
assert.equal(r.parCms[ctx.cmsKey('Marmande')].mesurables,3);assert.equal(r.parCms[ctx.cmsKey('Fumel')].mesurables,1);
// Médiane du modèle : [2, 9, 10, 10] -> 9.5 (affichée depuis le 01/11/2026, AG-021 tranché).
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
assert.equal(x.length,4);
assert.deepEqual(x.filter(e=>e.motif==='sans_reception').map(e=>e.personne),['Exemple FICTIF Delta','Exemple FICTIF Golf']);
assert.deepEqual(x.filter(e=>e.motif==='apres_rdv').map(e=>[e.personne,e.rec,e.rdv]),[['Exemple FICTIF Echo','2026-10-30','2026-10-28']]);

// Les listes respectent exactement l'effectif affiché.
assert.equal(m.length,r.global.mesurables);
assert.equal(x.length,r.global.reprise+r.global.sansReception+r.global.incoherente);
assert.deepEqual(x.filter(e=>e.motif==='reprise').map(e=>[e.personne,e.rec]),[['Exemple FICTIF Juliet','2026-10-02']]);
assert.equal(r.parCms[ctx.cmsKey('Marmande')].sansReception,2);

// Premiers RDV : même diagnostic qu'avant (effectifs seulement affichés).
assert.equal(r.parCms[ctx.cmsKey('Marmande')].nPremiers+r.parCms[ctx.cmsKey('Marmande')].suivis,3);

// Entrée non modifiée, calcul reproductible.
assert.equal(JSON.stringify(entries),before);
assert.equal(JSON.stringify(ctx.delaiAttenteParCms(entries)),JSON.stringify(r));

// Affichage (AG-021 tranché le 01/11/2026 : médiane réaffichée). Rendu réel de carteDelaiAttente avec un el() minimal.
function noeud(tag,attrs,kids){const n={tag,attrs:attrs||{},kids:[]};n.appendChild=c=>{n.kids.push(c);return c;};
  if(kids!=null)(Array.isArray(kids)?kids:[kids]).forEach(c=>n.kids.push(c));return n;}
function texte(n){return typeof n==='string'?n:n.kids.map(texte).join('|');}
function trouver(n,f,acc=[]){if(typeof n!=='string'){if(f(n))acc.push(n);n.kids.forEach(c=>trouver(c,f,acc));}return acc;}
const rc=vm.createContext({Date,Math,el:noeud,openDelaiList(){}});
vm.runInContext([section('function preparationDayUTC(value){','function preparationParisDay('),section('function etatReception(','/* valeur de départ'),
  section('function joursCivilsEntre(','\n'),section('function cmsKey(','\n'),section('function usagerKey(','\n'),section('function medianeNombres(','\n'),
  section('function delaiAttenteParCms(','/* AG-021 : listes locales'),card].join('\n'),rc);
const rendu=rc.carteDelaiAttente(entries,'');
const tuile=trouver(rendu,n=>(n.attrs.class||'').includes('ui-delai-mediane'))[0];
assert.ok(tuile,'tuile de la médiane absente');
assert.equal(texte(tuile),'9,5 j|Médiane, sur 4 fiches mesurables','médiane globale [2, 9, 10, 10]');
const lignes=trouver(rendu,n=>n.tag==='tr').map(tr=>tr.kids.map(texte));
assert.deepEqual(lignes[0].slice(0,2),['CMS','Médiane'],'en-tête');
assert.deepEqual(lignes.find(l=>l[0]==='Marmande').slice(1,3),['9 j','3'],'Marmande : médiane de [9, 10, 2] sur 3 mesurables');
assert.deepEqual(lignes.find(l=>l[0]==='Fumel').slice(1,3),['10 j','1'],'Fumel : une seule fiche');
const tout=texte(rendu);
assert.equal(tout.includes('Couverture insuffisamment établie'),false,'ancienne mention du masquage');
assert.equal(/masquée/.test(tout),false,'texte « masquée » restant');
const jf=v=>(Math.round(v*10)/10).toLocaleString('fr-FR')+' j';
assert.ok(tout.includes('Ensemble : '+jf(r.global.medianePremiers)+' sur '+r.global.nPremiers+' premiers RDV'),'diagnostic premiers RDV, ensemble');
assert.ok(tout.includes('Marmande '+jf(r.parCms[ctx.cmsKey('Marmande')].medianePremiers)+' sur '),'médiane des premiers RDV de Marmande');
assert.equal(/moyenne/i.test(tout),false,'aucune moyenne');
// Avec un RDV de suivi (même personne, même réception) : médiane de toutes les mesurables ≠ médiane des premiers RDV.
const avecSuivi=entries.concat([row('S1','Marmande','FICTIF Alpha','2026-10-30','2026-10-01')]);   /* 29 j, suivi d'Alpha */
const rs=ctx.delaiAttenteParCms(avecSuivi);assert.equal(rs.global.mediane,10);assert.equal(rs.global.medianePremiers,9.5);
const rendu2=rc.carteDelaiAttente(avecSuivi,''),t2=texte(rendu2);
assert.equal(texte(trouver(rendu2,n=>(n.attrs.class||'').includes('ui-delai-mediane'))[0]),'10 j|Médiane, sur 5 fiches mesurables','tuile = toutes les mesurables');
assert.deepEqual(trouver(rendu2,n=>n.tag==='tr').map(tr=>tr.kids.map(texte)).find(l=>l[0]==='Marmande').slice(1,3),['9,5 j','4'],'colonne Marmande = toutes ses mesurables');
assert.ok(t2.includes('Marmande 9 j sur 3 premiers, 1 suivi écarté'),'premiers RDV de Marmande');
assert.ok(t2.includes('Ensemble : 9,5 j sur 4 premiers RDV'),'premiers RDV, ensemble');
// Aucune fiche mesurable : « — », jamais 0 j.
const vide=texte(rc.carteDelaiAttente([row('Z1','Fumel','FICTIF Zoulou','2026-10-10')],''));
assert.ok(vide.includes('—|Médiane, sur 0 fiche mesurable'),'sans mesurable : tiret');assert.equal(/\b0 j\b/.test(vide),false);
assert.ok(/openDelaiList\(/.test(card),'listes non reliées');

console.log('Délai d’attente : effectifs, listes triées, motifs d’exclusion et médiane affichée (globale, par CMS, premiers RDV) conformes.');
