/* 22/11/2026 (MD-LIB règle 73) : la sauvegarde GitHub nomme la cause d'un échec (401, 403, 404, réseau) et une erreur
   n'est plus présentée comme « aucune sauvegarde ». Vraies fonctions d'index.html, réponses GitHub simulées, aucune donnée.
   Exécuter : node scripts/check-erreurs-github.js   (INDEX_HTML=<copie> pour une mutation) */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(process.env.INDEX_HTML||path.join(__dirname,'../index.html'),'utf8');
function section(from,to){const s=html.indexOf(from);assert(s>=0,from);const e=html.indexOf(to,s+from.length);assert(e>s,to);return html.slice(s,e);}
const toasts=[];
const ctx=vm.createContext({S:{activeProfile:'p1'},ghBackupDir:()=>'p1',GH_BRANCH:'main',showToast:t=>toasts.push(t),ghContenuSauvegarde:t=>t,doImport:()=>true,ecrireTout:{}});
vm.runInContext([
  section("var GH_REPO=","\n"),section("function ghHeaders(","/* dossier de backup cloisonné"),
  section("function ghEntetesBrut(","\n"),section("function ghListBackups(","/* restaure un fichier backup précis */"),
  section("function ghRestoreFile(","/* lit un fichier de sauvegarde"),section("/* lit un fichier de sauvegarde","/* vérification silencieuse"),
].join('\n'),ctx);
const M=(s)=>ctx.ghMessageErreur(s,'Action');
assert.match(M(401),/jeton refusé/);assert.match(M(403),/droits insuffisants/);assert.match(M(404),/pas accès au dépôt .*-backups/);
assert.match(M(0),/injoignable/);assert.match(M(500),/erreur GitHub 500/);
assert.equal(new Set([401,403,404,0,500].map(M)).size,5,'un message distinct par cause');
const rep=(status,corps)=>Promise.resolve({ok:status>=200&&status<300,status,json:()=>Promise.resolve(corps),text:()=>Promise.resolve('{}')});
/* Deux parcours d'état réels : envoi différé/échec/reprise et réponses concurrentes/profils.
   Le faux réseau reste entièrement local ; seules les clés déjà utilisées peuvent être écrites. */
async function verifierEtatSauvegarde(){
  const valeurs=new Map(),timers=[],fins=[],messages=[],nodes={};
  const st={getItem:k=>valeurs.get(k)||null,setItem:(k,v)=>valeurs.set(k,String(v))};
  const c=vm.createContext({Date,Intl,Promise,setTimeout:f=>{timers.push(f);return 1;},localStorage:st,S:{activeProfile:'p1'},
    _ecrituresGroupees:0,_stockageEnEchec:false,_ghLastAutoPushByProfile:{p1:Date.now()},pkFor:(p,k)=>'ess-'+p+'-'+k,
    ghToken:()=>'jeton-fictif',ghNowFile:p=>'backups/'+p+'/fictif.json',ghHeaders:()=>({}),exportDataForProfile:()=>({history:[]}),sauvegardeFiable:()=>true,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),unescape,encodeURIComponent,GH_REPO:'fictif/fictif',GH_BRANCH:'main',showToast:t=>messages.push(t),renderHeader(){},ghCleanOldBackups(){},
    document:{getElementById:id=>nodes[id]||null},getProfile:p=>({nom:p})});
  vm.runInContext(section('function ghMessageErreur(','/* dossier de backup cloisonné')+section('function maybeAutoBackupProfile(','/* pousse un fichier daté')+section('var _couvert={};','/* restaure le backup le plus récent'),c);
  const pause=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
  nodes['gh-backup-status']={getAttribute:()=> 'p1'};for(const k of ['gh-backup-last','gh-backup-state','gh-backup-action'])nodes[k]={textContent:''};
  c.fetch=(_,opts)=>opts&&opts.method==='PUT'?new Promise(resolve=>fins.push(status=>resolve({ok:status===200,status,json:()=>Promise.resolve({message:'fictif'})}))):rep(404,{});
  c.maybeAutoBackupProfile('p1');assert.match(c.ghSauvegardeTexte('p1'),/envoi automatique est prévu/);assert.match(nodes['gh-backup-state'].textContent,/envoi automatique est prévu/);assert.equal(timers.length,1);
  c._ghLastAutoPushByProfile.p1=Date.now()-130000;timers[0]();await pause();assert.match(c.ghSauvegardeTexte('p1'),/Sauvegarde GitHub en cours/);
  fins.shift()(401);await pause();assert.match(c.ghSauvegardeTexte('p1'),/jeton refusé/);assert.equal(messages.length,0,'échec auto discret, conservé dans le panneau');
  assert.match(c.ghDerniereSauvegarde('p1'),/Aucune sauvegarde/);assert.match(c.ghDerniereSauvegarde('p2'),/Aucune sauvegarde/);
  c.githubPush(true,null,'p1');await pause();fins.shift()(200);await pause();assert.equal(c.ghEtatSauvegarde('p1').erreur,'');assert.match(c.ghDerniereSauvegarde('p1'),/Dernière sauvegarde GitHub réussie/);
  c.el=(tag,attrs,texte)=>({tag,attrs:attrs||{},texte,enfants:[],appendChild(x){this.enfants.push(x);return x;}});
  const bloc=c.ghBlocSauvegarde('p1');assert.equal(bloc.attrs['data-profile'],'p1');assert.equal(bloc.enfants[1].attrs.id,'gh-backup-last');assert.match(bloc.enfants[1].texte,/Dernière sauvegarde GitHub réussie/);assert.equal(bloc.enfants[2].attrs.role,'status');
  assert.deepEqual([...valeurs.keys()].sort(),['ess-p1-gh-last-backup','ess-p1-since-export'],'aucune clé ni donnée nouvelle');
  // Le panneau ne reçoit jamais l'état d'un autre profil ; les réponses tardives ne masquent pas un essai plus récent.
  nodes['gh-backup-status']={getAttribute:()=> 'p1'};for(const k of ['gh-backup-last','gh-backup-state','gh-backup-action'])nodes[k]={textContent:''};
  c.githubPush(true,null,'p1');await pause();const ancien=fins.shift();c.githubPush(true,null,'p1');await pause();const recent=fins.shift();recent(403);await pause();ancien(200);await pause();
  assert.match(nodes['gh-backup-state'].textContent,/droits insuffisants/);assert.match(nodes['gh-backup-action'].textContent,/Réessayer/);
  c.S.activeProfile='p2';const avant=nodes['gh-backup-state'].textContent;c.githubPush(true,null,'p2');await pause();fins.shift()(401);await pause();assert.equal(nodes['gh-backup-state'].textContent,avant,'ancien panneau protégé au changement de profil');
  assert.match(c.ghEtatSauvegarde('p2').erreur,/jeton refusé/);assert.match(c.ghEtatSauvegarde('p1').erreur,/droits insuffisants/);
  c.fetch=()=>Promise.reject(new Error('réseau fictif'));c.githubPush(true,null,'p1');await pause();assert.match(c.ghEtatSauvegarde('p1').erreur,/injoignable/);assert.equal(Object.keys(c.ghEtatSauvegarde('p1').envois).length,0);
  c.fetch=(_,opts)=>opts&&opts.method==='PUT'?rep(200,{}):rep(404,{});const ecrire=st.setItem;st.setItem=()=>{throw Error('quota fictif');};c.githubPush(true,null,'p1');await pause();st.setItem=ecrire;
  assert.match(c.ghEtatSauvegarde('p1').erreur,/Copie transmise à GitHub, mais confirmation locale impossible/,'échec local après PUT, pas une erreur réseau');assert.equal(Object.keys(c.ghEtatSauvegarde('p1').envois).length,0);
  c.exportDataForProfile=()=>{throw Error('lecture locale fictive');};c.githubPush(true,null,'p1');assert.match(c.ghEtatSauvegarde('p1').erreur,/préparation locale impossible/);assert.equal(Object.keys(c.ghEtatSauvegarde('p1').envois).length,0);
  c.ghToken=()=>'';assert.match(c.ghSauvegardeTexte('p1'),/jeton GitHub manquant/);
  assert.match(html,/box\.appendChild\(ghBlocSauvegarde\(pidSauvegarde\)\)/,'panneau raccordé à Gestion des données');
  assert.match(html,/sauvegarderBtn\.id='gh-backup-action'/,'bouton existant réutilisé');
}
function liste(reponses){return new Promise(res=>{let i=0;ctx.fetch=()=>{const r=reponses[i++];return r==='reseau'?Promise.reject(new TypeError('x')):r;};ctx.ghListBackups('jeton',(b,e)=>res({b,e,appels:i}));});}
(async()=>{
  let r=await liste([rep(200,[{name:'backup-2026-11-20-1848.json',path:'p1/a'},{name:'backup-2026-11-21-0900.json',path:'p1/b'},{name:'x.txt'}])]);
  assert.equal(r.e,null);assert.deepEqual(r.b.map(x=>x.path),['p1/b','p1/a'],'tri du plus récent');
  r=await liste([rep(401)]);assert.equal(r.e.status,401,'jeton refusé : erreur, pas une liste vide');
  r=await liste([rep(403)]);assert.equal(r.e.status,403);
  r=await liste([rep(404),rep(200,{})]);assert.equal(r.e,null,'404 + dépôt accessible : aucune sauvegarde pour ce profil');assert.equal(r.b.length,0);assert.equal(r.appels,2);
  r=await liste([rep(404),rep(404)]);assert.equal(r.e.status,404,'404 + dépôt inaccessible : erreur d\'accès');
  r=await liste(['reseau']);assert.equal(r.e.status,0,'réseau');
  // restauration d'un fichier : message par cause
  for(const [s,motif] of [[401,/jeton refusé/],[0,/injoignable/]]){
    toasts.length=0;ctx.fetch=()=>s?rep(s):Promise.reject(new TypeError('x'));
    ctx.ghRestoreFile('jeton','p1/b');await new Promise(r=>setTimeout(r,10));
    assert.match(toasts.at(-1),motif,'restauration '+s);
  }
  // version : le gabarit à remplir au déploiement est présent
  assert.match(html,/var APP_VERSION=\{sha:'__APP_SHA__',date:'__APP_DATE__'\};/,'gabarit de version intact (rempli par deploy.yml)');
  await verifierEtatSauvegarde();
  console.log('Erreurs GitHub : un message par cause (401, 403, 404, réseau), erreur jamais confondue avec « aucune sauvegarde », gabarit de version OK.');
})().catch(e=>{console.error(e);process.exit(1);});
