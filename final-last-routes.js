/* Shared Final -> Last route and access rules.
   This file only interprets explicit Final/Last links; ordinary middle/applied
   mock-exam links keep their existing meaning. */
(function(root){
  'use strict';

  var FINAL_NODE_BY_ROUND={1:'sep-w1',2:'sep-14',3:'sep-21',4:'sep-28'};
  var LAST_NODE_BY_ROUND={1:'oct-5',2:'oct-12',3:'oct-19',4:'oct-26'};
  var SITE_HOSTS={'hs.gfieldacademy.net':true,'www.hs.gfieldacademy.net':true};

  function roundNumber(value){
    return /^\d+$/.test(String(value||''))?Number(value):0;
  }
  function includesName(list,name){
    return Array.isArray(list)&&(list.indexOf('*')>=0||list.indexOf(name)>=0);
  }
  function assigned(data,name,series,round){
    var node=(series==='last'?LAST_NODE_BY_ROUND:FINAL_NODE_BY_ROUND)[round];
    var attendance=data&&data.attendance&&data.attendance[name];
    return !!(node&&Array.isArray(attendance)&&attendance.indexOf(node)>=0);
  }
  function accessAllowed(data,name,series,round){
    data=data||{};
    name=String(name||'').trim();
    round=Number(round);
    if(name.toLowerCase()==='docssam') return true;
    if(!name||!Array.isArray(data.students)||data.students.indexOf(name)<0) return false;
    if(series==='final'&&round===5){
      return includesName((data.archiveProductAccess||{})['mock-final-5'],name);
    }
    if(series==='final'&&round>=1&&round<=4){
      return assigned(data,name,'final',round)||includesName((data.archiveAccess||{})['파이널 모의고사'],name);
    }
    if(series==='last'&&round>=1&&round<=4){
      return assigned(data,name,'last',round)||includesName((data.archiveAccess||{})['최종 모의고사'],name);
    }
    return false;
  }

  function localUrl(input){
    try{return new URL(String(input||''),root.location&&root.location.href||'https://hs.gfieldacademy.net/');}
    catch(e){return null;}
  }
  function sameSite(url,input){
    if(!url) return false;
    var raw=String(input||'').trim();
    var absolute=/^[a-z][a-z0-9+.-]*:/i.test(raw)||/^\/\//.test(raw);
    if(!absolute) return true;
    if(!/^https?:$/i.test(url.protocol)) return false;
    return !!(SITE_HOSTS[url.hostname]||(root.location&&url.origin===root.location.origin));
  }
  function basename(url){
    return String(url&&url.pathname||'').split('/').pop().toLowerCase();
  }
  function explicitSeries(url,title){
    var set=String(url.searchParams.get('set')||'').toLowerCase();
    if(set==='last') return 'last';
    if(set==='final') return 'final';
    if(set) return '';
    title=String(title||'');
    if(/최종\s*(?:실전\s*)?모의고사|\bLAST\b/i.test(title)) return 'last';
    if(/파이널\s*(?:실전\s*)?모의고사|\bFINAL\b/i.test(title)) return 'final';
    return '';
  }
  function relative(url){
    return String(url.pathname||'').replace(/^\//,'')+url.search+url.hash;
  }
  function keepExtras(source,target,drop){
    source.searchParams.forEach(function(value,key){
      if(drop.indexOf(key)<0&&!target.searchParams.has(key)) target.searchParams.append(key,value);
    });
    target.hash=source.hash;
    return target;
  }
  function target(path,params){
    var url=localUrl(path);
    Object.keys(params||{}).forEach(function(key){
      if(params[key]!=null&&params[key]!=='') url.searchParams.set(key,String(params[key]));
    });
    return url;
  }
  function lastTarget(action,round){
    if(action==='report') return target('last1-result.html',{round:round});
    if(action==='answer-page') return round===1?target('last1-answer.html',{}):target('last-answer.html',{round:round});
    return target('final.html',{set:'last',round:round,go:action||''});
  }
  function finalTarget(action,round){
    if(action==='answer-page') return target('answer.html',{set:'final',round:round});
    return target('final.html',{round:round,go:action||''});
  }

  function normalizeUrl(input,options){
    options=options||{};
    var source=localUrl(input);
    if(!source||!sameSite(source,input)) return String(input||'');
    var page=basename(source),series=explicitSeries(source,options.title),round=roundNumber(source.searchParams.get('round'));
    var mappedSeries=series,mappedRound=round,action='',dest=null;

    /* Old Final 6~9 numbering was actually Last 1~4. */
    if(series==='final'&&round>=6&&round<=9){mappedSeries='last';mappedRound=round-5;}

    if(page==='mock.html'&&mappedSeries){
      if(mappedSeries==='final'&&mappedRound>=1&&mappedRound<=5) dest=finalTarget(source.searchParams.get('go'),mappedRound);
      if(mappedSeries==='last'&&mappedRound>=1&&mappedRound<=4) dest=lastTarget(source.searchParams.get('go'),mappedRound);
    }else if(page==='answer.html'&&mappedSeries){
      if(mappedSeries==='last'&&mappedRound>=1&&mappedRound<=4) dest=lastTarget('answer-page',mappedRound);
      if(mappedSeries==='final'&&mappedRound>=1&&mappedRound<=5&&!source.searchParams.get('set')) dest=finalTarget('answer-page',mappedRound);
    }else if(page==='final.html'){
      if(!mappedSeries&&round>=6&&round<=9){mappedSeries='last';mappedRound=round-5;}
      action=String(source.searchParams.get('go')||'');
      if(mappedSeries==='last'&&mappedRound>=1&&mappedRound<=4){
        dest=action==='report'?lastTarget('report',mappedRound):lastTarget(action,mappedRound);
      }
    }else if(page==='last-answer.html'&&round===1){
      dest=lastTarget('answer-page',1);
    }else if(page==='last1-answer.html'&&round>=2&&round<=4){
      dest=lastTarget('answer-page',round);
    }
    if(!dest) return String(input||'');
    keepExtras(source,dest,['set','round','go']);
    return relative(dest);
  }

  function isKnownHtml(input,options){
    var url=localUrl(input);
    if(!url||!sameSite(url,input)||!/.html$/i.test(basename(url))) return false;
    if(normalizeUrl(input,options)!==String(input||'')) return true;
    var page=basename(url),series=explicitSeries(url,options&&options.title);
    if(['last1-answer.html','last-answer.html','last1-result.html','last1-entry.html'].indexOf(page)>=0) return true;
    return !!(series&&['mock.html','answer.html','final.html','last1-answer.html','last-answer.html','last1-result.html','last1-entry.html'].indexOf(page)>=0);
  }
  function withStudent(input,name){
    var url=localUrl(input);
    name=String(name||'').trim();
    if(!url||!sameSite(url,input)||!name) return String(input||'');
    url.searchParams.set('name',name);
    return relative(url);
  }
  function redirectCurrent(page){
    if(!root.location) return false;
    var current=page+root.location.search+root.location.hash;
    var next=normalizeUrl(current);
    if(next===current) return false;
    root.GFIELD_ROUTE_REDIRECTING=true;
    root.location.replace(next);
    return true;
  }
  function route(series,round,action){
    round=Number(round);
    var url=series==='last'?lastTarget(action,round):finalTarget(action,round);
    return relative(url);
  }

  root.GFIELD_FINAL_LAST_ROUTES={
    finalNodeByRound:FINAL_NODE_BY_ROUND,
    lastNodeByRound:LAST_NODE_BY_ROUND,
    assigned:assigned,
    accessAllowed:accessAllowed,
    normalizeUrl:normalizeUrl,
    isKnownHtml:isKnownHtml,
    withStudent:withStudent,
    redirectCurrent:redirectCurrent,
    route:route
  };
})(window);
