/* Audit d'une sauvegarde (AG-013, étape 1, 31/10/2026) — lecture seule, rien n'est corrigé ni enregistré.
   Recompte les chiffres du bilan par mois et par CMS SANS réutiliser le code de l'application (recomptage
   indépendant), et liste les fiches anormales. Le rapport ne contient ni nom, ni prénom, ni téléphone, ni
   message : une fiche est désignée par son rang dans l'historique, sa date, son heure et son CMS.
   Utilisable dans le navigateur (audit.html) et sous Node (scripts/check-audit.js). */
(function(racine){
  'use strict';
  var STATUTS=['en_attente','confirme','realise','excuse','annule','lapin','pas_de_retour'];
  var LIBERES={lapin:1,excuse:1,annule:1,pas_de_retour:1};
  var TYPES=['proposition','confirmation','sans_appel','relance','rappel_veille','lapin','rdv','indispo'];
  var CANAUX=['sms','mail'];
  var MISE_EN_LIGNE_TS_RELANCE='2026-10-26';   /* avant : « Pas de retour » posait une date de relance d'office */

  function cle(c){return String(c||'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toLowerCase();}
  function personne(h){var n=String(h.nom||'').trim().toLowerCase(),p=String(h.prenom||'').trim().toLowerCase();return n||p?n+'|'+p:'';}
  function dateReelle(s){
    var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||''));if(!m)return false;
    var d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));
    return d.getUTCFullYear()===+m[1]&&d.getUTCMonth()===+m[2]-1&&d.getUTCDate()===+m[3];
  }
  function heureValide(s){return /^([01]\d|2[0-3]):[0-5]\d$/.test(String(s||''));}
  function formatTs(ts){
    var s=String(ts||'');
    if(!s)return 'absent';
    if(/^\d{2}\/\d{2}\/\d{4}/.test(s))return 'français';
    if(/^\d{4}-\d{2}-\d{2}T/.test(s))return 'ISO';
    return 'autre';
  }
  function jourParis(d){
    var p=new Intl.DateTimeFormat('fr-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);
    function v(t){return p.find(function(x){return x.type===t;}).value;}
    return v('year')+'-'+v('month')+'-'+v('day');
  }

  function auditer(donnees,options){
    options=options||{};
    var maintenant=options.maintenant||new Date(),aujourdhui=jourParis(maintenant);
    if(!donnees||typeof donnees!=='object')throw new Error('Le fichier ne contient pas une sauvegarde lisible.');
    if(!Array.isArray(donnees.history))throw new Error('La sauvegarde ne contient pas d\'historique (« history »).');
    var historique=donnees.history,catalogue=Array.isArray(donnees.cmsList)?donnees.cmsList:[];
    var nomsCatalogue=Object.create(null),parId=Object.create(null);
    var rangCatalogue=Object.create(null);
    catalogue.forEach(function(c,n){if(c&&c.nom&&!rangCatalogue[cle(c.nom)]){nomsCatalogue[cle(c.nom)]=c.nom;rangCatalogue[cle(c.nom)]='CMS n°'+(n+1);}if(c&&c.id!=null)parId[String(c.id)]=c;});
    var anomalies=[],formats={'français':0,ISO:0,autre:0,absent:0},ecritures=Object.create(null);
    /* Sorties partageables (amendements Codex du 31/10) : aucune valeur venant du fichier n'est recopiée, catalogue compris.
       Une date ou une heure n'apparaît que si elle a la forme attendue ; un CMS sous un numéro neutre : « CMS n°k » (rang dans
       Configuration → CMS), sinon « CMS hors catalogue n°X ». */
    var horsCatalogue=Object.create(null),nbHors=0;
    function libelleCms(commune){
      var k=cle(commune);if(!k)return '';
      if(Object.prototype.hasOwnProperty.call(rangCatalogue,k))return rangCatalogue[k];
      if(!horsCatalogue[k])horsCatalogue[k]='CMS hors catalogue n°'+(++nbHors);
      return horsCatalogue[k];
    }
    function signaler(type,gravite,i,h,detail){
      anomalies.push({type:type,gravite:gravite,rang:i+1,date:dateReelle(h.date)?String(h.date):(h.date?'(date illisible)':''),
        heure:heureValide(h.heure)?String(h.heure):'',cms:libelleCms(h.commune),detail:detail||''});
    }
    var creneaux=Object.create(null);
    historique.forEach(function(h,i){
      if(!h||typeof h!=='object'){anomalies.push({type:'Fiche illisible',gravite:'erreur',rang:i+1,date:'',heure:'',cms:'',detail:''});return;}
      var blocage=h.msgType==='indispo';
      if(!h.date)signaler('Date absente','erreur',i,h);
      else if(!dateReelle(h.date))signaler('Date impossible ou mal écrite','erreur',i,h);
      if(h.msgType!=null&&TYPES.indexOf(h.msgType)===-1)signaler('Type de message inconnu','attention',i,h);
      if(blocage)return;
      if(!h.heure)signaler('Heure absente','info',i,h,'comptée dans les nombres, exclue des taux par créneau');
      else if(!heureValide(h.heure))signaler('Heure mal écrite','attention',i,h);
      if(h.statut==null||h.statut==='')signaler('Statut vide','attention',i,h,'compté « en attente »');
      else if(STATUTS.indexOf(h.statut)===-1)signaler('Statut inconnu','attention',i,h,'compté « en attente »');
      if(h.channel!=null&&CANAUX.indexOf(h.channel)===-1)signaler('Canal inconnu','attention',i,h);
      if(!String(h.commune||'').trim())signaler('CMS vide','attention',i,h,'compté seulement dans « Tous les CMS »');
      else{
        var k=cle(h.commune);
        (ecritures[k]=ecritures[k]||Object.create(null))[String(h.commune)]=1;
        if(catalogue.length&&!Object.prototype.hasOwnProperty.call(nomsCatalogue,k))signaler('CMS absent du catalogue','attention',i,h);
      }
      if(h.selectedCMS!=null&&h.selectedCMS!==''&&catalogue.length){
        var c=parId[String(h.selectedCMS)];
        if(!c)signaler('Référence CMS inconnue','attention',i,h,'selectedCMS sans correspondance');
        else if(cle(c.nom)!==cle(h.commune))signaler('Référence CMS et nom différents','attention',i,h,'la référence désigne '+(libelleCms(c.nom)||'un CMS sans nom'));
      }
      formats[formatTs(h.ts)]++;
      ['dateDemande','dateReception','dateRelance'].forEach(function(champ){
        if(h[champ]&&!dateReelle(h[champ]))signaler('Date mal écrite ('+champ+')','attention',i,h);
      });
      if(h.dateRelance&&h.statut==='pas_de_retour'&&String(h.dateRelance)<MISE_EN_LIGNE_TS_RELANCE)
        signaler('Relance de provenance incertaine','info',i,h,'date de relance antérieure au 26/10 sur une fiche « Pas de retour »');
      if(dateReelle(h.date)&&heureValide(h.heure)&&String(h.commune||'').trim()){
        var kc=h.date+'|'+cle(h.commune)+'|'+h.heure;(creneaux[kc]=creneaux[kc]||[]).push(i);
      }
    });
    Object.keys(ecritures).forEach(function(k){
      var v=Object.keys(ecritures[k]);
      if(v.length>1)anomalies.push({type:'Même CMS écrit de plusieurs façons',gravite:'attention',rang:null,date:'',heure:'',cms:libelleCms(v[0]),detail:v.length+' écritures différentes ; les statistiques les regroupent, d\'autres écrans les distinguent'});
    });
    var reattributions=0;
    Object.keys(creneaux).forEach(function(kc){
      var rangs=creneaux[kc];if(rangs.length<2)return;
      var parPersonne=Object.create(null);
      rangs.forEach(function(i){var p=personne(historique[i]);(parPersonne[p]=parPersonne[p]||[]).push(i);});
      Object.keys(parPersonne).forEach(function(p){
        if(p&&parPersonne[p].length>1)parPersonne[p].forEach(function(i){signaler('Doublon probable (même personne, même créneau)','attention',i,historique[i],parPersonne[p].length+' fiches');});
      });
      var actives=rangs.filter(function(i){return !Object.prototype.hasOwnProperty.call(LIBERES,historique[i].statut);});
      var personnesActives=Object.create(null);actives.forEach(function(i){personnesActives[personne(historique[i])]=1;});
      if(Object.keys(personnesActives).length>1)actives.forEach(function(i){signaler('Deux RDV actifs sur un créneau','attention',i,historique[i],actives.length+' fiches non libérées');});
      else if(Object.keys(parPersonne).length>1)reattributions++;
    });

    /* Recomptage indépendant, par mois du RDV et par CMS (clé normalisée), mêmes règles que les définitions
       (docs/indicateurs.md) mais écrit sans le code de l'application. */
    var recompte=Object.create(null);
    function ligne(mois,cms,libelle){var k=mois+'|'+cms;return recompte[k]||(recompte[k]={mois:mois,cms:cms,libelle:libelle,fiches:0,realisees:0,personnes:Object.create(null),statuts:{},relances:0,demarches:Object.create(null)});}
    historique.forEach(function(h){
      if(!h||typeof h!=='object'||h.msgType==='indispo'||!/^\d{4}-\d{2}-\d{2}$/.test(String(h.date||'')))return;
      if(h.date>aujourdhui)return;   /* le bilan ne compte rien après le jour courant */
      var mois=h.date.slice(0,7),statut=STATUTS.indexOf(h.statut)!==-1?h.statut:'en_attente';
      [ligne(mois,'','(tous)'),String(h.commune||'').trim()?ligne(mois,cle(h.commune),libelleCms(h.commune)):null].forEach(function(l){
        if(!l)return;
        l.fiches++;l.statuts[statut]=(l.statuts[statut]||0)+1;
        if(h.statut==='realise'){l.realisees++;var p=personne(h);if(p)l.personnes[p]=1;if(h.demarche)l.demarches[h.demarche]=(l.demarches[h.demarche]||0)+1;}
        if(h.msgType==='relance'||h.dateRelance)l.relances++;
      });
    });
    var lignes=Object.keys(recompte).sort().map(function(k){var l=recompte[k];var sortie={mois:l.mois,libelle:l.libelle,fiches:l.fiches,realisees:l.realisees,personnes:Object.keys(l.personnes).length,statuts:l.statuts,relances:l.relances};
      /* clé brute du CMS et noms de démarches : saisies du fichier, gardées pour la comparaison mais non énumérables (jamais copiées) */
      Object.defineProperty(sortie,'cms',{value:l.cms});Object.defineProperty(sortie,'demarches',{value:l.demarches});
      return sortie;});

    var parType=Object.create(null);anomalies.forEach(function(a){parType[a.type]=(parType[a.type]||0)+1;});
    return {
      fiches:historique.length,
      blocages:historique.filter(function(h){return h&&h.msgType==='indispo';}).length,
      formatsTs:formats,reattributions:reattributions,
      anomalies:anomalies,parType:parType,recomptage:lignes,aujourdhui:aujourdhui
    };
  }

  /* Comparaison « affiché / recompté / écart » : `bilan(mois, cms)` renvoie le résultat de monthlyReportData de
     l'application (fourni par l'appelant) ; le CMS de l'application est son nom d'origine. Un bilan absent ou une valeur
     manquante est « non comparé », jamais compté comme zéro (amendement Codex du 31/10). Les démarches sont désignées par leur
     rang, pas par leur nom (saisie libre possible). */
  var NON_COUVERT='taux par créneau, remplissage et places de Statistiques, préparation et délai, messages par mois et par type, heatmap, archives annuelles';
  function comparer(resultat,bilan,nomsCms){
    var ecarts=[];
    function ajouter(l,indicateur,affiche,recompte){
      var comparable=typeof affiche==='number'&&isFinite(affiche);
      ecarts.push({mois:l.mois,cms:l.libelle,indicateur:indicateur,affiche:comparable?affiche:'absent',recompte:recompte,
        ecart:comparable?affiche-recompte:null,statut:!comparable?'non comparé':affiche===recompte?'ok':'écart'});
    }
    resultat.recomptage.forEach(function(l){
      var d=null;try{d=bilan(l.mois,l.cms?(nomsCms[l.cms]||l.cms):'');}catch(e){d=null;}
      if(!d||typeof d!=='object'){ajouter(l,'Bilan entier (non produit par l\'application)',undefined,l.fiches);return;}
      ajouter(l,'Rendez-vous',d.entries,l.fiches);ajouter(l,'Réalisés',d.realised,l.realisees);
      ajouter(l,'Personnes accompagnées',d.accompanied,l.personnes);ajouter(l,'Relances renseignées',d.followup&&d.followup.recorded,l.relances);
      var bs=d.byStatut&&typeof d.byStatut==='object'?d.byStatut:null;
      STATUTS.forEach(function(s){ajouter(l,'Statut '+s,bs&&Object.prototype.hasOwnProperty.call(bs,s)?bs[s]:undefined,l.statuts[s]||0);});   /* l'application fournit les sept compteurs : un absent n'est pas un zéro */
      var top=Array.isArray(d.demarches)?d.demarches:null,noms=Object.keys(l.demarches);
      if(!top){ajouter(l,'Démarches',undefined,noms.length);return;}
      var vus=Object.create(null);
      top.forEach(function(x,k){vus[x&&x.nom]=1;ajouter(l,'Démarche n°'+(k+1),x&&x.n,Object.prototype.hasOwnProperty.call(l.demarches,x&&x.nom)?l.demarches[x.nom]:0);});
      ajouter(l,'Autres démarches (total)',d.otherDemarchesN,noms.filter(function(n){return !vus[n];}).reduce(function(s,n){return s+l.demarches[n];},0));
      ajouter(l,'Démarches distinctes',typeof d.otherDemarches==='number'?top.length+d.otherDemarches:undefined,noms.length);
    });
    return ecarts;
  }

  function rapportTexte(r,ecarts){
    var t=['Audit de sauvegarde — sms-mail-multi — jour courant '+r.aujourdhui,'(rapport anonymisé : aucun nom, prénom, téléphone ni message)','',
      'Fiches : '+r.fiches+' (dont '+r.blocages+' blocages)'+(r.fiches?'':' — ATTENTION : sauvegarde vide, rien n\'a été audité'),'Format de la date de génération (ts) : '+Object.keys(r.formatsTs).map(function(k){return k+' '+r.formatsTs[k];}).join(', '),
      'Créneaux réattribués (place libérée puis reprise, cas normal) : '+r.reattributions,'','Anomalies par type :'];
    var types=Object.keys(r.parType).sort();
    if(!types.length)t.push('  aucune');types.forEach(function(k){t.push('  '+k+' : '+r.parType[k]);});
    if(ecarts){
      var ecartsVrais=ecarts.filter(function(e){return e.statut==='écart';}),nonCompares=ecarts.filter(function(e){return e.statut==='non comparé';});
      t.push('','Comparaison affiché / recompté : '+ecarts.length+' valeurs, '+ecartsVrais.length+' écart(s), '+nonCompares.length+' non comparée(s)');
      ecartsVrais.concat(nonCompares).forEach(function(e){t.push('  ['+e.statut+'] '+e.mois+' · '+e.cms+' · '+e.indicateur+' : affiché '+e.affiche+', recompté '+e.recompte);});
      t.push('Non couvert par la comparaison : '+NON_COUVERT+'.');
    }
    t.push('','Détail des anomalies (rang dans l\'historique · date · heure · CMS) :');
    r.anomalies.forEach(function(a){t.push('  ['+a.gravite+'] '+a.type+(a.rang?' · fiche '+a.rang:'')+(a.date?' · '+a.date:'')+(a.heure?' '+a.heure:'')+(a.cms?' · '+a.cms:'')+(a.detail?' — '+a.detail:''));});
    return t.join('\n');
  }

  var api={auditer:auditer,comparer:comparer,rapportTexte:rapportTexte,cle:cle,NON_COUVERT:NON_COUVERT};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else racine.AuditSauvegarde=api;
})(this);
