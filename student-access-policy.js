(function(root){
  'use strict';
  // A returned graduate has a new permission scope. Original records stay intact.
  function restricted(data,name){return Object.prototype.hasOwnProperty.call(data.studentAccessProfiles||{},name);}
  function profile(data,name){return (data.studentAccessProfiles||{})[name]||{};}
  function allows(data,name,kind,key,legacy){
    if(!restricted(data,name))return !!legacy;
    var list=profile(data,name)[kind];
    return Array.isArray(list)&&list.indexOf(String(key))>=0;
  }
  function grant(data,name,kind,key,on){
    if(!restricted(data,name))return false;
    var p=profile(data,name),list=Array.isArray(p[kind])?p[kind]:[];
    p[kind]=list.filter(function(value){return value!==String(key);});
    if(on)p[kind].push(String(key));
    return true;
  }
  function attendance(data,name){
    var list=restricted(data,name)?profile(data,name).attendance:(data.attendance||{})[name];
    return Array.isArray(list)?list:[];
  }
  function special(data,name){return restricted(data,name)?profile(data,name).special===true:(data.specialStudents||[]).indexOf(name)>=0;}
  // BASIC and CORE share the concept-library approval; legacy product lists stay untouched.
  function inheritedFolder(key){return key==='concept-basic'||key==='concept-core'?'개념 교재':'';}
  function textbookKey(book){return String(book.title||'')+'\n'+String(book.url||'');}
  function textbook(data,name,book,legacy){
    var folder=inheritedFolder(book&&book.accessKey);
    if(folder){var access=(data.archiveAccess||{})[folder];return allows(data,name,'folders',folder,Array.isArray(access)&&(access.indexOf('*')>=0||access.indexOf(name)>=0));}
    if(!restricted(data,name))return !!legacy;
    if(book.accessKey)return allows(data,name,'products',book.accessKey,false);
    if(allows(data,name,'textbooks',textbookKey(book),false))return true;
    if(Array.isArray(book.access))return false;
    // Ordinary weekly books follow newly approved attendance, not historical attendance.
    return Object.keys(data.content||{}).some(function(id){
      return id!=='special-summer'&&attendance(data,name).indexOf(id)>=0&&
        ((data.content[id]||{}).textbooks||[]).indexOf(book)>=0;
    });
  }
  function appliedRound(data,name,round){
    var book=(data.books||[]).find(function(b){return b&&b.folder==='활용 모의고사'&&new RegExp('활용\\s*모의고사\\s*'+round+'\\s*회').test(String(b.title||''));});
    if(book&&book.accessKey)return allows(data,name,'products',book.accessKey,false);
    if(allows(data,name,'folders','활용 모의고사',false))return true;
    return special(data,name)&&(((data.content||{})['special-summer']||{}).textbooks||[]).some(function(t){
      var match=String(t.title||'').match(/활용\s*모의고사\s*(\d+)\s*회/);
      return match&&Number(match[1])===Number(round)&&textbook(data,name,t,false);
    });
  }
  function reset(data,name){
    function keys(map){return Object.keys(map||{}).filter(function(key){var list=map[key];return Array.isArray(list)&&(list.indexOf('*')>=0||list.indexOf(name)>=0);});}
    var previous=restricted(data,name)?JSON.parse(JSON.stringify(profile(data,name))):{
      attendance:((data.attendance||{})[name]||[]).slice(),special:special(data,name),
      folders:keys(data.archiveAccess),products:keys(data.archiveProductAccess),vip:keys(data.vipAccess)
    };
    data.studentAccessHistory=data.studentAccessHistory||{};
    data.studentAccessHistory[name]=Array.isArray(data.studentAccessHistory[name])?data.studentAccessHistory[name]:[];
    data.studentAccessHistory[name].push({archivedAt:new Date().toISOString(),permissions:previous});
    data.studentAccessProfiles=data.studentAccessProfiles||{};
    data.studentAccessProfiles[name]={startedAt:new Date().toISOString(),attendance:[],special:false,folders:[],products:[],vip:[],textbooks:[]};
  }
  root.GFIELD_STUDENT_ACCESS=Object.freeze({restricted:restricted,allows:allows,grant:grant,attendance:attendance,special:special,inheritedFolder:inheritedFolder,textbookKey:textbookKey,textbook:textbook,appliedRound:appliedRound,reset:reset});
})(window);
