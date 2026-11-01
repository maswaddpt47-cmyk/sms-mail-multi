/* Parcours AG-022 dans la vraie appli (Chromium), données exclusivement fictives semées avant le chargement :
   Historique, Agenda, Générer, listes du délai d'attente, panne de stockage, filtre CMS, 390 px.
   Hors déploiement (Playwright). Exécuter : node scripts/parcours-reception.js   (INDEX_HTML=<copie> pour une mutation) */
const {chromium}=require('playwright'),path=require('node:path');
const URL='file://'+path.resolve(process.env.INDEX_HTML||path.join(__dirname,'../index.html'));
const out=[];const ok=(c,m)=>{out.push((c?'OK   ':'ÉCHEC ')+m);};
function jour(n){const d=new Date(Date.now()-n*86400000);return d.toLocaleDateString('sv-SE',{timeZone:'Europe/Paris'});}
/* AG-023 : une « reprise à confirmer » a une date du message après le 22/10/2026 ; fixée pour ne pas dépendre du jour d'exécution */
const apres=d=>d>'2026-10-22'?d:'2026-10-23';
const rec=(id,o)=>Object.assign({id,nom:'FICTIF '+id,prenom:'Exemple',commune:'Marmande',msgType:'confirmation',statut:'realise',channel:'sms',demarche:'Démarche fictive',body:'Message fictif '+id,ts:new Date(Date.now()-40*86400000).toISOString()},o);
const H=[
  rec('R1',{date:jour(5),heure:'09:30',dateDemande:apres(jour(20)),premierePreparationAt:new Date(Date.now()-19*86400000).toISOString()}),
  rec('R2',{date:jour(6),heure:'10:30',dateDemande:apres(jour(21))}),
  rec('V1',{date:jour(7),heure:'09:30',dateReception:'',dateDemande:apres(jour(22))}),
  rec('I1',{date:jour(8),heure:'09:30',dateReception:'xx'}),
  rec('P1',{date:jour(9),heure:'09:30',dateReception:jour(2)}),
  rec('M1',{date:jour(4),heure:'09:30',dateReception:jour(15)}),
  rec('F1',{date:jour(5),heure:'09:30',dateDemande:apres(jour(25)),commune:'Fumel'}),
];
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:820}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.addInitScript(h=>{if(!sessionStorage.getItem('seme')){localStorage.clear();localStorage.setItem('ess-active-profile','michel');localStorage.setItem('ess-michel-history',h);sessionStorage.setItem('seme','1');}},JSON.stringify(H));
  await p.goto(URL,{waitUntil:'load'});await p.waitForTimeout(500);
  const stock=id=>p.evaluate(id=>JSON.parse(localStorage.getItem('ess-michel-history')).find(h=>h.id===id),id);
  const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const bande=async()=>{await p.evaluate(()=>window.dispatchEvent(new Event('beforeprint')));await p.waitForTimeout(1000);return p.evaluate(()=>[...document.querySelectorAll('.ui-delai-attente .ui-stats-metric-band:not(.ui-delai-mediane) .ui-stats-metric')].map(x=>x.querySelector('.ui-stats-metric-label').textContent+'='+x.querySelector('.ui-stats-number').textContent).join(' '));};
  async function stats(period,cms){await p.evaluate(([a,c])=>{S.statsPeriod=a;S.statsCMS=c;S.activeTab='stats';showActivePane();renderTabs();renderStats();},[period,cms]);await p.waitForTimeout(200);return bande();}

  // A. Statistiques : quatre catégories, filtres
  let bd=await stats('1m','');ok(bd==='Mesurables=1 À confirmer=3 Absente ou invalide=2 Après le RDV=1','tous CMS : '+bd);
  bd=await stats('1m','Marmande');ok(bd==='Mesurables=1 À confirmer=2 Absente ou invalide=2 Après le RDV=1','Marmande : '+bd);
  const txt=await p.evaluate(()=>document.querySelector('.ui-delai-attente').innerText);
  const med=await p.evaluate(()=>{var t=document.querySelector('.ui-delai-attente .ui-delai-mediane');return t?t.innerText.replace(/\s+/g,' ').trim():'';});
  ok(med==='11 j Médiane, sur 1 fiche mesurable'&&!txt.includes('Couverture insuffisamment')&&!/moyenne/i.test(txt),'médiane affichée (AG-021 tranché ; M1 : réception J-15, RDV J-4 = 11 j), aucune moyenne : '+med);
  const lar=await p.evaluate(()=>{var c=document.querySelector('.ui-delai-attente'),sc=c.querySelector('.ui-stats-scroll');return [document.documentElement.scrollWidth-document.documentElement.clientWidth,c.scrollWidth-c.clientWidth,sc?sc.scrollWidth-sc.clientWidth:-1];});
  ok(lar[0]<=0&&lar[1]<=0,'390 px : carte sans débordement (page '+lar[0]+', carte '+lar[1]+', tableau défilant '+lar[2]+')');

  // B. Historique : R1 marqué, Modifier sans préremplir, enregistrement sans rapport
  await p.evaluate(()=>{S.activeTab='history';showActivePane();renderTabs();renderHistory();});await p.waitForTimeout(200);
  const carteR1=p.locator('article.ui-record-row',{hasText:'FICTIF R1'}).first();
  ok(await carteR1.locator('text=Réception à confirmer').count()===1,'Historique : pastille « Réception à confirmer »');
  ok(await p.locator('article.ui-record-row',{hasText:'FICTIF M1'}).first().locator('text=Réception à confirmer').count()===0,'Historique : pas de pastille sur une réception enregistrée');
  await carteR1.locator('button',{hasText:'Modifier'}).click();
  const champ=p.locator('input[id^="ui-record-reception-"]');
  ok(await champ.inputValue()==='','Historique : champ Réception non prérempli');
  ok((await p.locator('.ui-record-editor .ui-reception-reprise').innerText()).includes('à confirmer'),'Historique : mention de l’ancienne date');
  await p.locator('textarea[id^="ui-record-notes-"]').fill('note sans rapport');
  await p.locator('button',{hasText:'Enregistrer les modifications'}).click();await p.waitForTimeout(150);
  let s=await stock('R1');ok(!own(s,'dateReception')&&s.notes==='note sans rapport','Historique : notes enregistrées, réception non confirmée');

  // C. Agenda : affichage et Modifier sans/avec confirmation
  async function ouvrirRdv(id){await p.evaluate(id=>{var h=S.history.find(x=>x.id===id);S.activeTab='agenda';showActivePane();S.modal='agenda-rdv';S.agendaRdv={slot:{heure:h.heure,taken:h},day:{dateStr:h.date,perm:{commune:h.commune}}};renderModal();},id);await p.waitForTimeout(150);}
  await ouvrirRdv('R1');
  ok((await p.evaluate(()=>document.getElementById('ag-rdv-followup').textContent)).includes('ancienne date du message, à confirmer'),'Agenda : « à confirmer » dans le suivi');
  await p.locator('#ag-rdv-edit').click();await p.waitForTimeout(100);
  ok(await p.locator('#ag-rdv-edit-dateReception input, input#ag-rdv-edit-dateReception').first().inputValue()==='','Agenda : champ Réception non prérempli');
  await p.locator('#ag-rdv-edit-notes textarea, textarea#ag-rdv-edit-notes').first().fill('note agenda');
  await p.locator('#ag-rdv-save').click();await p.waitForTimeout(150);
  s=await stock('R1');ok(!own(s,'dateReception')&&s.notes==='note agenda','Agenda : modification sans rapport, réception non confirmée');
  await ouvrirRdv('R1');await p.locator('#ag-rdv-edit').click();await p.waitForTimeout(100);
  await p.locator('#ag-rdv-confirm-reception').click();await p.waitForTimeout(100);await p.locator('#ag-rdv-save').click();await p.waitForTimeout(150);
  s=await stock('R1');ok(s.dateReception===s.dateDemande&&s.premierePreparationAt===H[0].premierePreparationAt,'Agenda : confirmation explicite enregistrée, première préparation intacte');
  await p.evaluate(()=>{S.modal=null;renderModal();});

  // D. Générer : dossier ouvert depuis l'Historique, copie sans confirmation
  await p.evaluate(()=>{var h=S.history.find(x=>x.id==='R2');openHistInGen(h);});await p.waitForTimeout(150);
  ok(await p.locator('#message-date-reception').inputValue()==='','Générer : réception non préremplie');
  ok(await p.locator('.ui-reception-reprise').count()===1,'Générer : mention « à confirmer » et bouton');
  const copie=await p.evaluate(()=>{var c=S.cmsList.find(x=>cmsKey(x.nom)==='marmande');if(c)S.selectedCMS=String(c.id);if(S.demarches&&S.demarches[0])S.selectedDemarche=String(S.demarches[0].id);regen();var r=enregistrerCopie('Message fictif R2 bis');return r.ok&&!!compute().dem&&!!c;});
  s=await stock('R2');ok(copie&&!own(s,'dateReception')&&s.body==='Message fictif R2 bis','Générer : copie enregistrée, reprise toujours à confirmer');
  // D bis. Amendement de Codex (R1/R2) : « Générer » sur une reprise, copie sur une réception invalide, champ non touché
  const gen=await p.evaluate(()=>{var h=S.history.find(x=>x.id==='F1');openHistInGen(h);var c=S.cmsList.find(x=>cmsKey(x.nom)==='fumel');if(c)S.selectedCMS=String(c.id);if(S.demarches&&S.demarches[0])S.selectedDemarche=String(S.demarches[0].id);S.civilite=S.civilite||'Madame';regen();
    var n=S.history.length,pret=canGenerate();handleGenerate();return pret&&!!c&&S.history.length===n&&S.history.find(x=>x.id==='F1').body!=='Message fictif F1';});
  s=await stock('F1');ok(gen&&!own(s,'dateReception'),'R1 : « Générer » sans toucher la réception, reprise toujours à confirmer');
  const cpI=await p.evaluate(()=>{var h=S.history.find(x=>x.id==='I1');openHistInGen(h);var c=S.cmsList.find(x=>cmsKey(x.nom)==='marmande');if(c)S.selectedCMS=String(c.id);if(S.demarches&&S.demarches[0])S.selectedDemarche=String(S.demarches[0].id);regen();return enregistrerCopie('Message fictif I1 bis').ok;});
  s=await stock('I1');ok(cpI&&s.dateReception==='xx'&&s.body==='Message fictif I1 bis','R2 : copie sur réception invalide, valeur brute conservée');

  // E. Liste « À confirmer » : confirmation, reclassement, recalcul
  bd=await stats('1m','Marmande');ok(bd==='Mesurables=2 À confirmer=1 Absente ou invalide=2 Après le RDV=1','après Agenda : '+bd);
  await p.locator('.ui-delai-attente .ui-stats-metric',{hasText:'À confirmer'}).click();await p.waitForTimeout(150);
  ok(await p.locator('[role=dialog] tbody tr').count()===1,'liste À confirmer : 1 fiche (R2)');
  await p.locator('[role=dialog] button',{hasText:'Confirmer le'}).click();await p.waitForTimeout(250);
  ok(await p.locator('[role=dialog] tbody tr').count()===0,'liste recalculée : 0 fiche');
  s=await stock('R2');ok(s.dateReception===s.dateDemande&&!own(s,'premierePreparationAt'),'R2 confirmée, aucune première préparation inventée');
  await p.evaluate(()=>{S.modal=null;renderModal();});bd=await bande();
  ok(bd==='Mesurables=3 À confirmer=0 Absente ou invalide=2 Après le RDV=1','effectifs recalculés : '+bd);

  // F. Échec d'enregistrement depuis la liste « Absente ou invalide »
  await p.locator('.ui-delai-attente .ui-stats-metric',{hasText:'Absente ou invalide'}).click();await p.waitForTimeout(150);
  const avant=await p.evaluate(()=>localStorage.getItem('ess-michel-history'));
  await p.evaluate(()=>{window._setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='ess-michel-history')throw new Error('QuotaExceededError');return window._setItem.call(this,k,v);};});
  const ligne=p.locator('[role=dialog] tbody tr',{hasText:'FICTIF V1'});
  await ligne.locator('input[type=date]').fill(jour(12));await ligne.locator('button',{hasText:'Enregistrer cette date'}).click();await p.waitForTimeout(250);
  await p.evaluate(()=>{Storage.prototype.setItem=window._setItem;});
  ok(await p.evaluate(()=>localStorage.getItem('ess-michel-history'))===avant,'panne : stockage inchangé');
  ok(await p.locator('[role=dialog] tbody tr').count()===2,'panne : liste inchangée (2 fiches)');
  await p.evaluate(()=>{S.modal=null;renderModal();});bd=await stats('1m','Marmande');
  ok(bd==='Mesurables=3 À confirmer=0 Absente ou invalide=2 Après le RDV=1','panne : effectifs inchangés '+bd);

  // G. Filtre CMS d'une ligne du tableau : Fumel
  bd=await stats('1m','');
  await p.locator('.ui-delai-attente tbody tr',{hasText:'Fumel'}).locator('button').nth(1).click();await p.waitForTimeout(150);
  const rows=await p.locator('[role=dialog] tbody tr').allInnerTexts();ok(rows.length===1&&rows[0].includes('FICTIF F1'),'ligne Fumel « À confirmer » : F1 seule');
  await p.evaluate(()=>{S.modal=null;renderModal();});
  // H. AG-023 : réception saisie avant le 22/10 dans l'ancien champ → mesurable, préremplie, marquée ; rien d'écrit
  await p.evaluate(d=>{S.history.unshift({id:'A1',nom:'FICTIF A1',prenom:'Exemple',commune:'Marmande',msgType:'confirmation',statut:'realise',channel:'sms',demarche:'Démarche fictive',body:'Message fictif A1',date:d,heure:'14:30',dateDemande:'2026-10-10'});lsSet(pk('history'),S.history);},jour(3));
  bd=await stats('1m','Marmande');ok(bd==='Mesurables=4 À confirmer=0 Absente ou invalide=2 Après le RDV=1','AG-023 : fiche d\'avant le 22/10 mesurable : '+bd);
  const noteA=await p.evaluate(()=>document.querySelector('.ui-delai-attente').innerText);ok(noteA.includes('Dont 1 réception saisie avant le 22/10/2026'),'AG-023 : nombre écrit sous la médiane');
  await p.locator('.ui-delai-attente .ui-stats-metric-band:not(.ui-delai-mediane) .ui-stats-metric',{hasText:'Mesurables'}).click();await p.waitForTimeout(150);
  ok((await p.locator('[role=dialog] tbody tr',{hasText:'FICTIF A1'}).innerText()).includes('10/10/2026 (avant le 22/10)'),'AG-023 : liste des mesurables, origine marquée');
  await p.evaluate(()=>{S.modal=null;renderModal();S.activeTab='history';showActivePane();renderTabs();renderHistory();});await p.waitForTimeout(150);
  const carteA1=p.locator('article.ui-record-row',{hasText:'FICTIF A1'}).first();
  ok(await carteA1.locator('text=Réception à confirmer').count()===0,'AG-023 : pas de pastille « à confirmer »');
  await carteA1.locator('button',{hasText:'Modifier'}).click();await p.waitForTimeout(100);
  ok(await p.locator('input[id^="ui-record-reception-"]').inputValue()==='2026-10-10','AG-023 : Historique, réception préremplie');
  await p.locator('article.ui-record-row',{hasText:'FICTIF A1'}).first().locator('button',{hasText:'Enregistrer'}).click();await p.waitForTimeout(150);
  ok(!own(await stock('A1'),'dateReception'),'AG-023 : enregistrement sans modification, rien écrit');
  await p.evaluate(()=>{S.activeTab='stats';showActivePane();renderTabs();renderStats();});await p.waitForTimeout(150);
  const debord=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(debord<=0,'390 px : aucun débordement de page ('+debord+')');
  ok(errs.length===0,'erreurs JS : '+(errs.join(' | ')||'aucune'));
  console.log(out.join('\n'));await b.close();
  process.exit(out.some(l=>l.startsWith('ÉCHEC'))?1:0);
})().catch(e=>{console.log(out.join('\n'));console.error('ARRÊT',e.message.split('\n')[0]);process.exit(2);});
