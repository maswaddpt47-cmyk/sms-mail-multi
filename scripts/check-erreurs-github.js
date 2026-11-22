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
  console.log('Erreurs GitHub : un message par cause (401, 403, 404, réseau), erreur jamais confondue avec « aucune sauvegarde » OK.');
})().catch(e=>{console.error(e);process.exit(1);});
