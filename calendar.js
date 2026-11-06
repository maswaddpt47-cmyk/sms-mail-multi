/* Calendrier ICS autonome : événements locaux par profil, sans écriture dans les dossiers ni les statistiques. */
(function(root,factory){var api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CalendarICS=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var ZONE='Europe/Paris',LIMIT=5000,states=Object.create(null),formatters=Object.create(null),dayRanges=new Map();
  function dayAdd(day,n){var d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
  function validDay(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;var d=new Date(s+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===s;}
  function parts(t,zone){zone=zone||ZONE;var out={},f=formatters[zone]||(formatters[zone]=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}));f.formatToParts(new Date(t)).forEach(function(p){out[p.type]=p.value;});return out;}
  function parisDay(t){var p=parts(t);return p.year+'-'+p.month+'-'+p.day;}
  function localInstant(day,time,zone){
    var p=day.split('-').map(Number),q=time.split(':').map(Number),base=Date.UTC(p[0],p[1]-1,p[2],q[0],q[1],q[2]||0),found=[];
    [-36,0,36].forEach(function(h){var t=base+h*3600000,r=parts(t,zone),offset=Date.UTC(+r.year,+r.month-1,+r.day,+r.hour,+r.minute,+r.second)-t,candidate=base-offset,c=parts(candidate,zone);
      if(c.year+'-'+c.month+'-'+c.day===day&&+c.hour===q[0]&&+c.minute===q[1]&&+c.second===(q[2]||0)&&found.indexOf(candidate)<0)found.push(candidate);});
    return found.length?Math.min.apply(null,found):null; // Heure d'automne ambiguë : première occurrence ; heure inexistante : refusée.
  }
  function dateValue(prop){
    if(!prop)return null;var v=prop.value,m=/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(v);if(!m)return null;
    var day=m[1]+'-'+m[2]+'-'+m[3];if(!validDay(day))return null;
    if(!m[4])return {allDay:true,day:day};
    if(+m[4]>23||+m[5]>59||+(m[6]||0)>59)return null;
    var aliases={'Romance Standard Time':ZONE,'W. Europe Standard Time':'Europe/Berlin','GMT Standard Time':'Europe/London','UTC':'UTC'},zone=prop.params.TZID||ZONE;
    zone=aliases[zone]||zone;var t;
    try{t=m[7]?Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+(m[6]||0)):localInstant(day,m[4]+':'+m[5]+':'+(m[6]||'00'),zone);}catch(e){return null;}
    return t===null?null:{allDay:false,instant:new Date(t).toISOString()};
  }
  function unescapeText(s){return String(s||'').replace(/\\([nN,;\\])/g,function(_,c){return /n/i.test(c)?'\n':c;});}
  function property(line){var quoted=false,cut=-1;for(var i=0;i<line.length;i++){if(line[i]==='"')quoted=!quoted;if(line[i]===':'&&!quoted){cut=i;break;}}if(cut<0)return null;
    var left=line.slice(0,cut).split(';'),p={name:left.shift().toUpperCase(),params:{},value:line.slice(cut+1)};
    left.forEach(function(x){var i=x.indexOf('=');if(i>0)p.params[x.slice(0,i).toUpperCase()]=x.slice(i+1).replace(/^"|"$/g,'');});return p;}
  function parse(text){
    if(typeof text!=='string'||text.length>5*1024*1024)throw new Error('Fichier trop volumineux (5 Mo maximum).');
    text=text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').replace(/\n[ \t]/g,'');
    var lines=text.split('\n');if(!lines.some(function(l){return l.trim()==='BEGIN:VCALENDAR';})||!lines.some(function(l){return l.trim()==='END:VCALENDAR';}))throw new Error('Ce fichier ne contient pas de calendrier ICS complet.');
    var events=[],warnings={dates:0,recurrences:0,participants:0},ev=null,nested=0,total=0;
    lines.forEach(function(line){
      if(line==='BEGIN:VEVENT'){if(ev)throw new Error('Événement ICS mal fermé.');ev={};nested=0;total++;if(total>LIMIT)throw new Error('5 000 événements maximum par fichier.');return;}
      if(!ev)return;
      if(line==='END:VEVENT'){
        if(ev.RRULE||ev['RECURRENCE-ID']||ev.RDATE||ev.EXDATE){warnings.recurrences++;ev=null;return;}
        var a=dateValue(ev.DTSTART),b=dateValue(ev.DTEND),duration=ev.DURATION&&/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(ev.DURATION.value);
        if(!a||ev.DTEND&&!b||b&&a.allDay!==b.allDay||ev.DURATION&&!duration){warnings.dates++;ev=null;return;}
        var seconds=duration?(+(duration[1]||0)*7*86400+ +(duration[2]||0)*86400+ +(duration[3]||0)*3600+ +(duration[4]||0)*60+ +(duration[5]||0)):0;
        if(a.allDay&&seconds%86400){warnings.dates++;ev=null;return;}
        var start=a.allDay?a.day:a.instant,end=b?(b.allDay?b.day:b.instant):a.allDay?dayAdd(a.day,duration?seconds/86400:1):new Date(Date.parse(a.instant)+seconds*1000).toISOString();
        if(end<start||a.allDay&&end===start){warnings.dates++;ev=null;return;}
        var title=unescapeText(ev.SUMMARY&&ev.SUMMARY.value).slice(0,500)||'Sans titre',location=unescapeText(ev.LOCATION&&ev.LOCATION.value).slice(0,2000),uid=ev.UID&&ev.UID.value;
        // UID désigne une demande GDIN : jamais une séance. Conserver aussi les
        // différentes inscriptions portant le même UID au même créneau.
        var action=unescapeText(ev.CATEGORIES&&ev.CATEGORIES.value).trim().slice(0,500);
        events.push({key:'gdin:'+JSON.stringify([uid||'',action,start,end,title,location]),title:title,location:location,description:unescapeText(ev.DESCRIPTION&&ev.DESCRIPTION.value).slice(0,20000),start:start,end:end,allDay:a.allDay,cancelled:!!(ev.STATUS&&ev.STATUS.value.toUpperCase()==='CANCELLED')});
        ev=null;return;
      }
      if(line.indexOf('BEGIN:')===0){nested++;return;}if(line.indexOf('END:')===0){nested--;return;}if(nested)return;
      var p=property(line);if(p){if(p.name==='ATTENDEE'||p.name==='ORGANIZER'){warnings.participants++;return;}ev[p.name]=p;}
    });
    if(ev)throw new Error('Un événement ICS est incomplet.');if(!total)throw new Error('Aucun événement VEVENT dans ce calendrier.');
    return {events:events,warnings:warnings,total:total};
  }
  function isEvent(e){return e&&typeof e.key==='string'&&typeof e.title==='string'&&typeof e.location==='string'&&typeof e.description==='string'&&typeof e.allDay==='boolean'&&typeof e.cancelled==='boolean'&&typeof e.start==='string'&&typeof e.end==='string'&&(e.allDay?validDay(e.start)&&validDay(e.end)&&e.end>e.start:/^\d{4}-\d{2}-\d{2}T.*Z$/.test(e.start)&&Number.isFinite(Date.parse(e.start))&&Number.isFinite(Date.parse(e.end))&&e.end>=e.start);}
  function metadata(e){
    var id=[];if(e.key.indexOf('gdin:')===0){try{var value=JSON.parse(e.key.slice(5));if(Array.isArray(value))id=value;}catch(err){}}
    var desc=e.description||'',activity='',participant='';
    desc.split('\n').forEach(function(line){var m=/^\s*(?:action|nom de l.action|intitulé(?: de l.action)?|activité|atelier)\s*:\s*(.+)$/i.exec(line);if(m&&!activity)activity=m[1].trim();
      m=/^\s*(?:participant|bénéficiaire|usager)\s*:\s*(.+)$/i.exec(line);if(m&&!participant)participant=m[1].trim();});
    return {uid:typeof id[0]==='string'?id[0]:e.key.indexOf('uid:')===0?e.key.slice(4):'',action:typeof id[1]==='string'?id[1]:'',activity:activity,participant:participant};
  }
  function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').replace(/\s+/g,' ').trim();}
  function sessions(events,group){
    var map=new Map();events.forEach(function(e){var m=metadata(e),k=group!==false&&m.action?'session:'+JSON.stringify([m.action,e.start,e.end,e.allDay,norm(e.location),norm(m.activity)]):e.key;
      if(!map.has(k))map.set(k,Object.assign({},e,{key:k,members:[],action:m.action,activity:m.activity}));map.get(k).members.push(e);});
    return Array.from(map.values()).map(function(e){e.collective=e.members.length>1;e.cancelled=e.members.every(function(m){return m.cancelled;});e.zeroDuration=!e.allDay&&e.start===e.end;
      if(e.collective)e.title=e.activity||'Action '+e.action;
      e.participants=e.members.map(function(m){var meta=metadata(m);return {name:meta.participant||m.title,cancelled:m.cancelled,key:m.key};});return e;});
  }
  function select(events,filters){filters=filters||{};var q=norm(filters.query);return events.filter(function(e){
    return (!filters.action||e.action===filters.action)&&(!filters.location||e.location===filters.location)&&(!filters.type||(filters.type==='collective'?e.collective:filters.type==='individual'?!e.collective:filters.type==='zero'?e.zeroDuration:filters.type==='cancelled'?e.cancelled:true))&&(!q||norm([e.title,e.action,e.location].concat((e.members||[e]).map(function(m){return m.title+' '+m.description;})).join(' ')).includes(q));});}
  function merge(existing,incoming){var map=new Map(),added=0,updated=0,unchanged=0;
    // Ancienne identité UID : remplacement seulement sur correspondance exacte,
    // jamais sur le seul UID d'une demande (plusieurs séances possibles).
    existing.forEach(function(e){var legacy=e.key.indexOf('uid:')===0||e.key.indexOf('event:')===0,match=legacy&&incoming.find(function(n){return metadata(n).uid===(e.key.indexOf('uid:')===0?e.key.slice(4):'')&&n.start===e.start&&n.end===e.end&&n.title===e.title&&n.location===e.location;});map.set(match?match.key:e.key,e);});var unique=new Map();incoming.forEach(function(e){unique.set(e.key,e);});
    unique.forEach(function(e,k){if(!map.has(k))added++;else if(JSON.stringify(map.get(k))===JSON.stringify(e))unchanged++;else updated++;map.set(k,e);});
    if(map.size>LIMIT)throw new Error('Le calendrier local est limité à 5 000 événements.');return {events:Array.from(map.values()),added:added,updated:updated,unchanged:unchanged};}
  function load(storage,key){var raw=storage.getItem(key);if(raw===null)return {events:[],raw:null};var data=JSON.parse(raw);if(!data||data.version!==1||!Array.isArray(data.events)||data.events.length>LIMIT||!data.events.every(isEvent))throw new Error('Calendrier local illisible : aucune donnée ne sera remplacée.');return {events:data.events,raw:raw};}
  function save(ctx,events,raw){if(ctx.currentProfile()!==ctx.profileId)throw new Error('Le profil a changé : recommencez depuis le bon profil.');if(ctx.storage.getItem(ctx.key)!==raw)throw new Error('Calendrier modifié dans un autre onglet : recommencez votre import.');ctx.noteVersion(ctx.key,raw);if(!ctx.write(ctx.key,{version:1,events:events}))throw new Error('Enregistrement non confirmé. Rouvrez le calendrier avant de réessayer.');}
  function overlaps(e,day){if(e.allDay)return e.start<=day&&e.end>day;var r=dayRanges.get(day);if(!r){if(dayRanges.size>128)dayRanges.clear();r=[localInstant(day,'00:00:00',ZONE),localInstant(dayAdd(day,1),'00:00:00',ZONE)];dayRanges.set(day,r);}var s=Date.parse(e.start),f=Date.parse(e.end);return s<r[1]&&(f>r[0]||f===s&&s>=r[0]);}
  function bounds(date,view){if(view==='day')return [date,dayAdd(date,1)];var d=new Date(date+'T12:00:00Z');if(view==='week'){var first=dayAdd(date,-((d.getUTCDay()+6)%7));return [first,dayAdd(first,7)];}var month=date.slice(0,7)+'-01',m=new Date(month+'T12:00:00Z');var first=dayAdd(month,-((m.getUTCDay()+6)%7));return [first,dayAdd(first,42)];}
  function positions(events,day){var a=events.filter(function(e){return !e.allDay&&overlaps(e,day);}).map(function(e){var p=parts(e.start),q=parts(e.end),start=parisDay(e.start)<day?0:+p.hour*60+ +p.minute,end=parisDay(e.end)>day?1440:+q.hour*60+ +q.minute;return {event:e,start:start,end:Math.max(start+24,end),column:0,columns:1};}).sort(function(a,b){return a.start-b.start||b.end-a.end;});
    var group=[],active=[],max=0;function finish(){group.forEach(function(x){x.columns=max;});group=[];max=0;}
    a.forEach(function(x){active=active.filter(function(y){return y.end>x.start;});if(!active.length&&group.length)finish();var used=active.map(function(y){return y.column;}),i=0;while(used.indexOf(i)>=0)i++;x.column=i;active.push(x);group.push(x);max=Math.max(max,i+1);});finish();return a;}
  function rdvs(history){return (history||[]).filter(function(h){return h.msgType!=='indispo'&&validDay(h.date);}).map(function(h,i){var start=/^\d{2}:\d{2}$/.test(h.heure||'')?localInstant(h.date,h.heure+':00',ZONE):null;return {key:'rdv:'+i,title:[h.prenom,h.nom].filter(Boolean).join(' ')||'Rendez-vous',description:h.demarche||'',location:h.commune||'',start:start===null?h.date:new Date(start).toISOString(),end:start===null?dayAdd(h.date,1):new Date(start+3600000).toISOString(),allDay:start===null,unknownTime:start===null,cancelled:h.statut==='annule',source:'rdv'};});}
  function render(pane,ctx){
    if(!ctx.profileId)return;ctx.key='ess-'+ctx.profileId+'-calendar-ics-v1';
    var doc=pane.ownerDocument,win=doc.defaultView||{},today=parisDay(Date.now()),st=states[ctx.profileId]||(states[ctx.profileId]={date:today,view:win.innerWidth<760?'day':'week',group:true,query:'',action:'',location:'',type:'',preview:null,message:''});
    function node(tag,attrs,text){var n=doc.createElement(tag);Object.keys(attrs||{}).forEach(function(k){if(k==='class')n.className=attrs[k];else if(k==='onclick')n.addEventListener('click',attrs[k]);else n.setAttribute(k,attrs[k]);});if(text!==undefined)n.textContent=text;return n;}
    function button(text,fn,cls){return node('button',{type:'button',class:cls||'ics-button',onclick:fn},text);}
    function rerender(){if(ctx.currentProfile()===ctx.profileId)render(pane,ctx);}
    function fmt(day,opt){return new Intl.DateTimeFormat('fr-FR',Object.assign({timeZone:'UTC'},opt)).format(new Date(day+'T12:00:00Z'));}
    function time(e){return e.unknownTime?'Heure à préciser':e.allDay?'Toute la journée':new Intl.DateTimeFormat('fr-FR',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'}).format(new Date(e.start));}
    var data,error='';try{data=load(ctx.storage,ctx.key);}catch(e){data={events:[],raw:null};error='Calendrier local indisponible ou illisible. Aucun import ne remplacera les données. Rouvrez la page pour réessayer.';}
    pane.replaceChildren();var root=node('section',{class:'ics-calendar','aria-label':'Calendrier'});pane.appendChild(root);
    var toolbar=node('div',{class:'ics-toolbar'});root.appendChild(toolbar);
    toolbar.appendChild(button('Aujourd’hui',function(){st.date=today;rerender();}));
    function move(n){if(st.view==='month'){var d=new Date(st.date.slice(0,7)+'-01T12:00:00Z');d.setUTCMonth(d.getUTCMonth()+n);st.date=d.toISOString().slice(0,10);}else st.date=dayAdd(st.date,n*(st.view==='week'?7:1));rerender();}
    toolbar.appendChild(button('‹',function(){move(-1);},'ics-button ics-arrow'));toolbar.lastChild.setAttribute('aria-label','Période précédente');toolbar.appendChild(button('›',function(){move(1);},'ics-button ics-arrow'));toolbar.lastChild.setAttribute('aria-label','Période suivante');
    var period=bounds(st.date,st.view),heading=st.view==='day'?fmt(st.date,{weekday:'long',day:'numeric',month:'long',year:'numeric'}):st.view==='week'?fmt(period[0],{day:'numeric',month:'short'})+' – '+fmt(dayAdd(period[1],-1),{day:'numeric',month:'short',year:'numeric'}):fmt(st.date,{month:'long',year:'numeric'});
    var title=node('h2',{'aria-live':'polite'},heading);toolbar.appendChild(title);
    var tabs=node('div',{class:'ics-view-tabs','aria-label':'Vue du calendrier'});[['day','Jour'],['week','Semaine'],['month','Mois']].forEach(function(v){var b=button(v[1],function(){st.view=v[0];rerender();});b.setAttribute('aria-pressed',String(st.view===v[0]));tabs.appendChild(b);});toolbar.appendChild(tabs);
    var file=node('input',{type:'file',accept:'.ics,text/calendar',multiple:'multiple',class:'ics-file','aria-label':'Choisir un ou plusieurs fichiers ICS'});root.appendChild(file);
    var imp=button('Importer des ICS',function(){file.click();},'ics-button ics-import');if(error)imp.disabled=true;toolbar.appendChild(imp);
    var options=node('div',{class:'ics-options'});root.appendChild(options);
    var dl=node('label',{},'Aller au '),di=node('input',{type:'date',value:st.date,'aria-label':'Date du calendrier'});dl.appendChild(di);options.appendChild(dl);di.addEventListener('change',function(){if(validDay(di.value)){st.date=di.value;rerender();}});
    var gl=node('label',{class:'ics-source'}),gi=node('input',{type:'checkbox','aria-label':'Regrouper les inscriptions'});gi.checked=st.group;gi.addEventListener('change',function(){st.group=gi.checked;rerender();});gl.appendChild(gi);gl.appendChild(doc.createTextNode('Regrouper les inscriptions'));options.appendChild(gl);
    root.appendChild(node('p',{class:'ics-help'},'Calendrier GDIN autonome · heure de Paris. Les horaires sans fuseau sont conservés tels qu’écrits dans l’ICS. Inscriptions regroupées par action, début, fin, lieu et intitulé d’activité lorsqu’il est renseigné.'));
    if(error)root.appendChild(node('p',{class:'ics-alert',role:'alert'},error));
    if(st.message)root.appendChild(node('p',{class:'ics-status',role:'status'},st.message));
    file.addEventListener('change',async function(){var files=Array.from(file.files||[]);if(!files.length)return;var token={};st.readToken=token;st.preview=null;st.message='Lecture des fichiers…';rerender();
      try{if(files.length>30||files.reduce(function(n,f){return n+f.size;},0)>15*1024*1024)throw new Error('30 fichiers et 15 Mo maximum par import.');
        var combined={events:[],warnings:{dates:0,recurrences:0,participants:0},total:0,files:files.length};
        for(var i=0;i<files.length;i++){var f=files[i];if(f.size>5*1024*1024)throw new Error('Fichier trop volumineux (5 Mo maximum par fichier).');var text=await f.text();
          if(ctx.currentProfile()!==ctx.profileId){if(ctx.notify)ctx.notify('Profil changé pendant la lecture du calendrier : rien n’a été importé.','warn');return;}if(st.readToken!==token)return;
          var parsed=parse(text);combined.events=combined.events.concat(parsed.events);combined.total+=parsed.total;Object.keys(combined.warnings).forEach(function(k){combined.warnings[k]+=parsed.warnings[k];});
          if(combined.events.length>LIMIT)throw new Error('5 000 inscriptions maximum par import.');}
        st.preview=combined;st.message='';
      }catch(e){if(st.readToken!==token)return;st.preview=null;st.message=e.message;}rerender();});
    if(st.preview){var pre=st.preview,preview=node('section',{class:'ics-preview','aria-label':'Aperçu de l’import'}),merged;
      try{merged=merge(data.events,pre.events);}catch(e){st.message=e.message;}
      preview.appendChild(node('h3',{},'Vérifier l’import'));preview.appendChild(node('p',{},merged?pre.files+' fichier(s) · '+merged.added+' nouvelles inscriptions · '+merged.updated+' mises à jour · '+merged.unchanged+' déjà présentes':'Import trop volumineux.'));
      var imported=sessions(merge([],pre.events).events,st.group),zero=imported.filter(function(e){return e.zeroDuration;}).length;
      preview.appendChild(node('p',{},pre.total+' lignes ICS lues → '+imported.length+' événements après dédoublonnage et regroupement, dont '+imported.filter(function(e){return e.collective;}).length+' collectifs.'));
      if(zero)preview.appendChild(node('p',{class:'ics-alert'},zero+' événement(s) à durée nulle : horaires identiques ou heure de fin absente. Aucune durée réelle inventée.'));
      if(pre.warnings.dates)preview.appendChild(node('p',{class:'ics-alert'},pre.warnings.dates+' événements ignorés : date, durée ou fuseau non reconnu.'));
      if(pre.warnings.recurrences)preview.appendChild(node('p',{class:'ics-alert'},pre.warnings.recurrences+' événements récurrents ignorés : cette première version importe les événements simples, sans développer les répétitions.'));
      preview.appendChild(node('p',{class:'ics-help'},'Vérifiez le regroupement après import. Titres et descriptions originaux sont conservés dans le détail ; les noms des inscriptions y restent visibles. Contacts ATTENDEE/ORGANIZER, liens et pièces jointes ne sont pas exploités. Aucun ajout tant que vous ne validez pas. Un fichier invalide annule tout l’aperçu.'));
      var apply=button('Ajouter au calendrier',function(){try{var current=load(ctx.storage,ctx.key),m=merge(current.events,pre.events);save(ctx,m.events,current.raw);st.preview=null;st.message=m.added+' ajoutés · '+m.updated+' mis à jour · '+m.unchanged+' déjà présents.';if(pre.events.length)st.date=pre.events.map(function(e){return e.allDay?e.start:parisDay(e.start);}).sort()[0];}catch(e){st.message=e.message;}rerender();},'ics-button ics-import');apply.disabled=!!error||!merged||!pre.events.length;preview.appendChild(apply);preview.appendChild(button('Annuler',function(){st.preview=null;rerender();}));root.appendChild(preview);
    }
    var all=sessions(data.events,st.group),filters=node('div',{class:'ics-filters','aria-label':'Recherche et filtres'});root.appendChild(filters);
    var sl=node('label',{},'Rechercher'),search=node('input',{type:'search',value:st.query,placeholder:'Activité, participant, action, lieu…','aria-label':'Rechercher dans le calendrier'});sl.appendChild(search);filters.appendChild(sl);
    search.addEventListener('input',function(){st.query=search.value;var start=search.selectionStart;rerender();var fresh=pane.querySelector&&pane.querySelector('input[type="search"]');if(fresh){fresh.focus();if(start!==null)fresh.setSelectionRange(start,start);}});
    function filter(label,key,choices){var l=node('label',{},label),s=node('select',{'aria-label':label});choices.forEach(function(c){var o=node('option',{value:c[0]},c[1]);s.appendChild(o);});s.value=st[key];s.addEventListener('change',function(){st[key]=s.value;rerender();});l.appendChild(s);filters.appendChild(l);}
    filter('Action','action',[['','Toutes les actions']].concat(Array.from(new Set(all.map(function(e){return e.action;}).filter(Boolean))).sort().map(function(a){return [a,'Action '+a];})));
    filter('Lieu','location',[['','Tous les lieux']].concat(Array.from(new Set(all.map(function(e){return e.location;}).filter(Boolean))).sort().map(function(a){return [a,a];})));
    filter('Événements','type',[['','Tous'],['collective','Collectifs'],['individual','Inscriptions seules'],['zero','Durée nulle'],['cancelled','Annulés']]);
    filters.appendChild(button('Réinitialiser les filtres',function(){st.query='';st.action='';st.location='';st.type='';rerender();}));
    var events=select(all,st),range=bounds(st.date,st.view),days=[];for(var d=range[0];d<range[1];d=dayAdd(d,1))days.push(d);
    var inPeriod=events.filter(function(e){return days.some(function(day){return overlaps(e,day);});});root.appendChild(node('p',{class:'ics-results',role:'status'},inPeriod.length+' événement(s) dans la période affichée · '+events.length+' correspondant aux filtres dans tous les imports'));
    if(events.length&&!inPeriod.length)root.appendChild(button('Voir le premier résultat',function(){var first=events.slice().sort(function(a,b){return a.start.localeCompare(b.start);})[0];st.date=first.allDay?first.start:parisDay(first.start);rerender();}));
    if(data.events.some(function(e){return e.key.indexOf('uid:')===0;}))root.appendChild(node('p',{class:'ics-alert'},'Ancien import présent : réimportez les ICS originaux pour récupérer les inscriptions que l’ancien rapprochement par UID avait pu écraser. Aucune ligne ancienne sans correspondance exacte n’est effacée.'));
    function detail(e){
      var dialog=node('dialog',{class:'ics-dialog','aria-label':'Détail de l’événement'}),h=node('h3',{},e.title);dialog.appendChild(h);
      dialog.appendChild(node('p',{},(e.cancelled?'Événement annulé · ':'')+(e.collective?'Atelier collectif · '+e.members.length+' inscriptions':'Rendez-vous importé')+(e.action?' · Action '+e.action:'')));
      dialog.appendChild(node('p',{},e.allDay?fmt(e.start,{dateStyle:'full'})+' — '+fmt(dayAdd(e.end,-1),{dateStyle:'full'}):new Intl.DateTimeFormat('fr-FR',{timeZone:ZONE,dateStyle:'full',timeStyle:'short'}).format(new Date(e.start))+' → '+new Intl.DateTimeFormat('fr-FR',{timeZone:ZONE,dateStyle:'full',timeStyle:'short'}).format(new Date(e.end))));
      if(e.zeroDuration)dialog.appendChild(node('p',{class:'ics-alert'},'Durée nulle : début et fin identiques, ou fin absente de l’ICS. Le petit bloc dans la grille est seulement un repère visuel.'));
      if(e.location)dialog.appendChild(node('p',{class:'ics-location'},e.location));
      if(e.collective){dialog.appendChild(node('h4',{},'Participants / inscriptions ('+e.members.length+')'));var list=node('ul',{class:'ics-participants'});e.participants.forEach(function(p){list.appendChild(node('li',{},p.name+(p.cancelled?' — inscription annulée':'')));});dialog.appendChild(list);}
      e.members.forEach(function(m){var original=node('details',{class:'ics-original'});original.appendChild(node('summary',{},'Inscription originale : '+m.title));var meta=metadata(m);if(meta.uid)original.appendChild(node('p',{},'Demande (UID) : '+meta.uid));original.appendChild(node('pre',{class:'ics-description'},m.description||'Aucune description dans le fichier.'));dialog.appendChild(original);});
      var close=button('Fermer',function(){dialog.close();dialog.remove();});dialog.appendChild(close);
      dialog.appendChild(button('Retirer cet événement importé',function(){if(!win.confirm('Retirer cet événement et ses '+e.members.length+' inscription(s) du calendrier local ? Le fichier ICS d’origine n’est pas modifié.'))return;try{var current=load(ctx.storage,ctx.key),keys=new Set(e.members.map(function(m){return m.key;}));save(ctx,current.events.filter(function(x){return !keys.has(x.key);}),current.raw);dialog.close();dialog.remove();st.message='Événement retiré du calendrier local.';rerender();}catch(err){st.message=err.message;dialog.close();dialog.remove();rerender();}}));
      dialog.addEventListener('close',function(){dialog.remove();});root.appendChild(dialog);dialog.showModal();close.focus();
    }
    function chip(e,cls){var end=e.allDay?'':new Intl.DateTimeFormat('fr-FR',{timeZone:ZONE,hour:'2-digit',minute:'2-digit'}).format(new Date(e.end));var label=(e.cancelled?'Annulé · ':'')+time(e)+(end?'–'+end:'')+' '+e.title+(e.collective?' · '+e.members.length+' inscriptions':'')+(e.zeroDuration?' · ⚠ Durée nulle':'');var b=button(label,function(){detail(e);},'ics-event '+(e.collective?'ics-collective ':'')+(e.zeroDuration?'ics-zero ':'')+(e.cancelled?'ics-cancelled ':'')+(cls||''));b.title=label+(e.location?' — '+e.location:'');b.setAttribute('aria-label',b.title);return b;}
    if(st.view!=='day')root.appendChild(node('p',{class:'ics-mobile-help'},'Sur téléphone, faites glisser le calendrier horizontalement pour voir les autres jours.'));
    var sc=node('div',{class:'ics-scroll',tabindex:'0','aria-label':st.view==='month'?'Calendrier mensuel':'Calendrier horaire, défilement horizontal et vertical'});root.appendChild(sc);
    if(st.view==='month'){
      var month=node('div',{class:'ics-month'});['Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.','Dim.'].forEach(function(n){month.appendChild(node('div',{class:'ics-month-heading'},n));});
      days.forEach(function(day){var cell=node('div',{class:'ics-month-day'+(day.slice(0,7)!==st.date.slice(0,7)?' ics-other-month':'')+(day===today?' ics-today':'')}),label=button(String(+day.slice(8)),function(){st.date=day;st.view='day';rerender();},'ics-day-number');label.setAttribute('aria-label',fmt(day,{dateStyle:'full'}));cell.appendChild(label);var on=events.filter(function(e){return overlaps(e,day);}).sort(function(a,b){return a.start.localeCompare(b.start);});on.slice(0,3).forEach(function(e){cell.appendChild(chip(e));});if(on.length>3)cell.appendChild(button('+'+(on.length-3)+' autres',function(){st.date=day;st.view='day';rerender();}));month.appendChild(cell);});sc.appendChild(month);
    }else{
      var timeline=node('div',{class:'ics-timeline'+(st.view==='day'?' ics-one-day':'')});timeline.style.setProperty('--days',days.length);var head=node('div',{class:'ics-time-head'});head.appendChild(node('span',{class:'ics-zone'},'Paris'));
      days.forEach(function(day){head.appendChild(node('div',{class:'ics-time-heading'+(day===today?' ics-today':'')},fmt(day,{weekday:'short',day:'numeric',month:'short'})));});timeline.appendChild(head);
      var allday=node('div',{class:'ics-all-day'});allday.appendChild(node('span',{},'Journée'));days.forEach(function(day){var col=node('div');events.filter(function(e){return e.allDay&&overlaps(e,day);}).forEach(function(e){col.appendChild(chip(e));});allday.appendChild(col);});timeline.appendChild(allday);
      var placed=days.map(function(day){return positions(events,day);}),first=7,last=20;placed.forEach(function(ps){ps.forEach(function(p){first=Math.min(first,Math.floor(p.start/60));last=Math.max(last,Math.min(24,Math.ceil(p.end/60)));});});
      var body=node('div',{class:'ics-time-body'}),hours=node('div',{class:'ics-hours'});for(var hr=first;hr<last;hr++)hours.appendChild(node('span',{},('0'+hr).slice(-2)+':00'));body.appendChild(hours);
      days.forEach(function(day,i){var col=node('div',{class:'ics-time-day'+(day===today?' ics-today':'')});col.style.height=(last-first)*60+'px';placed[i].forEach(function(p){var e=chip(p.event,'ics-positioned');e.style.top=(p.start-first*60)+'px';e.style.height=Math.max(24,Math.min(p.end,last*60)-p.start)+'px';e.style.left='calc('+100*p.column/p.columns+'% + 3px)';e.style.width='calc('+100/p.columns+'% - 6px)';col.appendChild(e);});body.appendChild(col);});timeline.appendChild(body);sc.appendChild(timeline);
    }
    if(!inPeriod.length)root.appendChild(node('p',{class:'ics-empty'},'Aucun événement dans cette période avec ces filtres. Importez un ICS, réinitialisez les filtres ou choisissez une autre date.'));
    root.appendChild(node('p',{class:'ics-help'},'Les imports restent uniquement dans ce navigateur et ce profil. Ils ne sont pas inclus dans les sauvegardes de l’application : conservez les fichiers ICS originaux. Le réimport de la même inscription ne crée pas de doublon. Un changement de créneau ou de titre est conservé comme une nouvelle inscription : retirez l’ancienne après contrôle. Les absences d’un export ne suppriment rien.'));
  }
  return {parse:parse,dateValue:dateValue,merge:merge,load:load,save:save,overlaps:overlaps,bounds:bounds,positions:positions,rdvs:rdvs,render:render,localInstant:localInstant,parisDay:parisDay,metadata:metadata,sessions:sessions,select:select};
});
