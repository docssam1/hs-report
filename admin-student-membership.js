(function(root){
  'use strict';
  // Save membership and its permission-history boundary against the latest SHA.
  // Never publish other unsaved form edits.
  async function persist(options){
    var name=options.student,type=options.type,token=options.token,auth=root.GFIELD_AUTH;
    if(['resident','online','withdrawn','graduated'].indexOf(type)<0)throw new Error('회원 상태를 확인해 주세요.');
    if(!token)throw new Error('회원 상태를 저장하려면 GitHub 토큰이 필요합니다.');
    if(!auth)throw new Error('관리자 로그인을 확인해 주세요.');
    var url='https://api.github.com/repos/'+options.repo+'/contents/'+options.path;
    var headers={Authorization:'token '+token,Accept:'application/vnd.github+json'};
    var response=await fetch(url+'?ref='+encodeURIComponent(options.branch),{headers:headers,cache:'no-store'});
    if(!response.ok)throw new Error('회원 상태를 읽지 못했습니다 ('+response.status+').');
    var file=await response.json();
    var source=new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),function(c){return c.charCodeAt(0)}));
    var match=/window\.GFIELD_DATA\s*=\s*(\{[\s\S]*\});?\s*$/.exec(source);
    if(!match)throw new Error('회원 데이터 형식을 확인해 주세요.');
    var latest=JSON.parse(match[1]);
    if(!Array.isArray(latest.students)||latest.students.indexOf(name)<0)throw new Error('먼저 학생 등록을 저장해 주세요.');
    var oldType=(latest.studentTypes||{})[name]||'resident';
    var resetAccess=(type==='graduated'&&oldType!=='graduated')||(oldType==='graduated'&&!Object.prototype.hasOwnProperty.call(latest.studentAccessProfiles||{},name));
    if(resetAccess){
      if(!root.GFIELD_STUDENT_ACCESS)throw new Error('복귀 권한 도구를 불러오지 못했습니다. 새로고침해 주세요.');
      root.GFIELD_STUDENT_ACCESS.reset(latest,name);
    }
    var status=await auth.functionCall('hs-approval-admin',{action:'list'},'admin');
    var account=(status.accounts||[]).find(function(a){return a.student===name});
    var active=type!=='withdrawn'&&type!=='graduated',changed=!!account&&account.active!==active;
    try{
      if(changed)await auth.functionCall('hs-approval-admin',{action:'setAccess',student:name,active:active},'admin');
      latest.studentTypes=latest.studentTypes||{};
      if(type==='resident')delete latest.studentTypes[name];else latest.studentTypes[name]=type;
      var content=source.slice(0,match.index)+'window.GFIELD_DATA = '+JSON.stringify(latest,null,2)+';\n';
      response=await fetch(url,{method:'PUT',headers:Object.assign({'Content-Type':'application/json'},headers),body:JSON.stringify({
        message:'Update student membership via admin console',branch:options.branch,sha:file.sha,
        content:btoa(unescape(encodeURIComponent(content)))
      })});
      if(!response.ok)throw new Error(response.status===409?'다른 저장과 겹쳤습니다. 새로고침 후 다시 시도해 주세요.':'회원 상태 저장 실패 ('+response.status+').');
      return {type:type,accountUpdated:changed,accessProfile:(latest.studentAccessProfiles||{})[name],accessHistory:(latest.studentAccessHistory||{})[name]};
    }catch(error){
      if(changed){
        try{await auth.functionCall('hs-approval-admin',{action:'setAccess',student:name,active:account.active},'admin');}
        catch(rollback){throw new Error(error.message+' 서버 접속 상태 복원도 실패했습니다. 승인번호 관리에서 접속 허용을 확인해 주세요.');}
      }
      throw error;
    }
  }
  root.GFIELD_STUDENT_MEMBERSHIP=Object.freeze({persist:persist});
})(window);
