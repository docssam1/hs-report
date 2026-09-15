(function(root){
  'use strict';
  function clean(value){return String(value==null?'':value).trim();}
  function allows(list,name){return Array.isArray(list)&&(list.indexOf('*')>=0||list.indexOf(name)>=0);}
  function roundOf(book){
    var match=clean(book&&book.title).match(/(\d+)\s*회/);
    return match?Number(match[1]):0;
  }
  function isOnline(data,name){return !!(data&&data.studentTypes&&data.studentTypes[name]==='online');}
  function rounds(data,name,model){
    data=data||{};name=clean(name);model=model||{};
    var all=Object.keys(model.rounds||{}).filter(function(round){return /^\d+$/.test(round);}).sort(function(a,b){return Number(a)-Number(b);});
    if(!name||!isOnline(data,name))return all;
    var allowed={};
    var folderAllowed=allows((data.archiveAccess||{})['중급 모의고사'],name);
    (data.books||[]).forEach(function(book){
      if(!book||book.folder!=='중급 모의고사')return;
      var round=roundOf(book);if(!round)return;
      if(book.accessKey){if(allows((data.archiveProductAccess||{})[book.accessKey],name))allowed[String(round)]=true;}
      else if(folderAllowed)allowed[String(round)]=true;
    });
    Object.keys(data.archiveProductAccess||{}).forEach(function(key){
      var match=/^mock-mid-(\d+)$/.exec(key);
      if(match&&allows(data.archiveProductAccess[key],name))allowed[String(Number(match[1]))]=true;
    });
    return all.filter(function(round){return allowed[round]===true;});
  }
  function allowsRound(data,name,round,model){return rounds(data,name,model).indexOf(String(Number(round)))>=0;}
  root.GFIELD_MIDDLE_ACCESS=Object.freeze({version:'1.0.0',isOnline:isOnline,roundOf:roundOf,rounds:rounds,allowsRound:allowsRound});
})(window);
