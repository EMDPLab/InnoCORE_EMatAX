/** @NotOnlyCurrentDoc */
// All research records live in this bound spreadsheet. No Drive or mail access.
var PORTAL_META = ['request_id', 'request_hash', 'created_at', 'group_code', 'researcher_code', 'contributor_name', 'contributor_email', 'identity_method', 'schema_version'];
var PORTAL_TABS = {datasets:'01_Datasets',materials:'02_Materials',lots:'03_Lots',batches:'04_Batches',specimens:'05_Specimens',process:'06_Process',analysis:'07_Analysis',performance:'08_Performance'};
var PORTAL_PREFIX = {datasets:'DS',materials:'MAT',lots:'LOT',batches:'BAT',specimens:'SP',process:'PRC',analysis:'ANL',performance:'PERF'};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Portal').setTitle('E-MatAX Research Data')
    .addMetaTag('viewport','width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function onOpen() {
  SpreadsheetApp.getUi().createMenu('E-MatAX 관리')
    .addItem('처음 설정 / 양식 확인', 'setupPortal_')
    .addItem('연구자 입력 코드 발급', 'issueResearcher_')
    .addItem('연구자 코드 사용 중지', 'revokeResearcher_').addToUi();
}
function initializePortal() {
  // Initialization is owner-only and is run from the script editor.
  var actual=Session.getActiveUser().getEmail();
  if(!actual || actual!==Session.getEffectiveUser().getEmail()) throw new Error('관리자 계정으로 스크립트 편집기에서 실행하세요.');
  return setupPortal_();
}
function setupPortal_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('연결된 Google Sheets의 관리 메뉴에서 실행하세요.');
  var props=PropertiesService.getScriptProperties();
  var email=Session.getEffectiveUser().getEmail();
  if (props.getProperty('OWNER_EMAIL') && props.getProperty('OWNER_EMAIL')!==email) throw new Error('관리자만 설정할 수 있습니다.');
  props.setProperties({SPREADSHEET_ID:ss.getId(),OWNER_EMAIL:email});
  ss.setSpreadsheetTimeZone('Asia/Seoul');
  Object.keys(PORTAL_TABS).forEach(function(key){
    ensureSheet_(ss,PORTAL_TABS[key],headers_(key));
  });
  var access=ensureSheet_(ss,'_Researchers',['researcher_code','name','email','group_code','group_name','token_hash','active','issued_at']);
  if(access.getLastRow()===1) access.appendRow(['R001','관리자',email,'EMATAX','E-MatAX 관리자','','yes',new Date().toISOString()]);
  var dictionary=ensureSheet_(ss,'00_Field_dictionary',['table','field','label','type','unit','role','required','help','schema_version']);
  var entries=[];
  Object.keys(EMATAX_SCHEMA.tables).forEach(function(key){EMATAX_SCHEMA.tables[key].fields.forEach(function(f){entries.push([key,f.key,f.label,f.type,f.unit||'',f.role||'',f.required?'yes':'no',f.help||'',EMATAX_SCHEMA.version]);});});
  dictionary.getRange(2,1,entries.length,9).setValues(entries);
  var readme=ensureSheet_(ss,'00_Read_me',['항목','안내']);
  var instructions=[
    ['목적','연구데이터 입력 창구. 시트는 관리자 비공개 보관이며 홈페이지 방문자에게 공유하지 않습니다.'],
    ['입력 순서','데이터셋 → 소재 / 원료 lot → 배치 → 시료 → 공정 / 분석 / 성능. 상위 ID를 목록에서 선택합니다.'],
    ['연구자 등록','입력 화면에 관리자 Google 계정으로 연결한 뒤 하단 관리자 패널에서 입력 코드를 발급합니다. 같은 그룹 코드는 같은 참조 목록을 공유합니다. 코드는 연구자에게 별도로 전달하세요.'],
    ['코드 폐기','입력 화면 하단 관리자 패널에서 연구자 코드 사용을 중지합니다. 코드는 재사용하지 않습니다.'],
    ['관리자 접속','관리자 Google 계정에서 입력 코드를 비우고 연결합니다. 브라우저에서 신원이 전달되지 않으면 관리자에게도 입력 코드를 발급할 수 있습니다.'],
    ['데이터 보호','수집 시트 자체를 공개하지 마세요. 공개 범위/엠바고는 기록용 메타데이터이며 자동 공개 기능이 아닙니다.'],
    ['결측','값 있음 / 해당 없음(N/A) / 미측정(-)을 상태로 구분합니다. 숫자 열에는 숫자만 저장하고, 미입력은 제출 전에 수정합니다.'],
    ['표준어휘','어휘집 전문이 제공되지 않았으므로 기본 어휘 매핑 상태는 확인 필요입니다. 관리자가 현행판을 검토해야 표준 매핑을 확정할 수 있습니다.'],
    ['원본 파일','이 단계는 텍스트·수치만 수집합니다. 원본 파일 경로/식별자는 기록하지만 파일 존재 여부나 내용은 검증하지 않습니다.'],
    ['수정','확정 레코드의 ID와 값은 덮어쓰지 않습니다. 오류 발견 시 관리자에게 해당 ID와 정정 내용을 전달하세요.'],
    ['학습 전 검토','역할/가용 시점/측정 조건/배치·시료 ID를 확인하고 상위 단위로 분할하세요. 수집 완료가 학습 적합성 검토 완료를 의미하지 않습니다.'],
    ['버전',EMATAX_SCHEMA.version]
  ];
  readme.getRange(2,1,instructions.length,2).setValues(instructions);readme.setColumnWidth(1,150);readme.setColumnWidth(2,780);readme.getRange(1,1,instructions.length+1,2).setWrap(true);
  ss.setActiveSheet(readme);
  console.log('Setup complete: '+ss.getUrl());
}
function ensureSheet_(ss,name,headers){
  var sh=ss.getSheetByName(name)||ss.insertSheet(name);
  if(sh.getMaxColumns()<headers.length) sh.insertColumnsAfter(sh.getMaxColumns(),headers.length-sh.getMaxColumns());
  if(sh.getLastRow()) {
    var existing=sh.getRange(1,1,1,headers.length).getValues()[0];
    if(JSON.stringify(existing)!==JSON.stringify(headers)) throw new Error(name+': 헤더가 현재 양식과 다릅니다. 기존 자료를 유지한 채 관리자에게 확인하세요.');
  } else sh.getRange(1,1,1,headers.length).setValues([headers]);
  sh.setFrozenRows(1);sh.getRange(1,1,1,headers.length).setBackground('#071f4e').setFontColor('#ffffff').setFontWeight('bold');
  return sh;
}
function headers_(key){return EMATAX_SCHEMA.tables[key].fields.map(function(f){return f.key;}).concat(PORTAL_META);}
function spreadsheet_(){var id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');if(!id)throw new Error('관리자 초기 설정이 필요합니다.');return SpreadsheetApp.openById(id);}
function records_(ss,key){
  var sh=ss.getSheetByName(PORTAL_TABS[key]||key);if(!sh)throw new Error('수집 시트를 찾을 수 없습니다.');
  var values=sh.getDataRange().getValues();var head=values.shift();
  return values.filter(function(row){return row.some(function(v){return v!=='';});}).map(function(row){var obj={};head.forEach(function(k,i){obj[k]=row[i] instanceof Date?row[i].toISOString():row[i];});return obj;});
}
function hash_(value){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value,Utilities.Charset.UTF_8).map(function(b){return ('0'+((b+256)%256).toString(16)).slice(-2);}).join('');}
function actor_(ss,token){
  var users=records_(ss,'_Researchers');var owner=PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  var active=Session.getActiveUser().getEmail();
  var user;
  if(!token && active && active===owner)user=users.find(function(u){return u.email===owner&&u.active==='yes';});
  else if(typeof token==='string' && token.length>=24 && token.length<=200){var digest=hash_(token);user=users.find(function(u){return u.active==='yes'&&u.token_hash===digest;});}
  if(!user) throw new Error('유효한 연구자 입력 코드를 입력하세요. 관리자 Google 계정은 별도 창에서 다시 연결할 수 있습니다.');
  return {code:user.group_code,name:user.group_name,researcherCode:user.researcher_code,authMethod:!token?'google_owner':'researcher_code'};
}
function referenceData_(ss,actor){
  var refs={},counts={};
  Object.keys(PORTAL_TABS).forEach(function(key){
    var records=records_(ss,key).filter(function(r){return r.group_code===actor.code;});counts[key]=records.length;
    if(['datasets','materials','lots','batches','specimens'].indexOf(key)>=0) refs[key]=records.map(function(r){return {id:r.id,label:r.name||r.title||r.material_name||r.batch_name||r.specimen_label||r.lot_name||r.sample_name||r.label||r.id,dataset_id:r.dataset_id||r.id,parent_id:r.parent_id||'',batch_id:r.batch_id||''};});
  });return {references:refs,counts:counts};
}
function connect(payload){
  try{var ss=spreadsheet_();var actor=actor_(ss,payload&&payload.token);return Object.assign({ok:true,group:actor,schemaVersion:EMATAX_SCHEMA.version},referenceData_(ss,actor));}
  catch(e){return {ok:false,error:e.message};}
}
function submitRows(payload){
  var writeAttempted=false;
  var lock=LockService.getScriptLock();
  try{
    if(!payload||typeof payload!=='object')throw new Error('입력 자료가 없습니다.');
    if(!Object.prototype.hasOwnProperty.call(PORTAL_TABS,payload.table))throw new Error('등록되지 않은 표입니다.');
    if(payload.schemaVersion!==EMATAX_SCHEMA.version)throw new Error('양식이 변경되었습니다. 초안을 내려받고 새로고침하세요.');
    if(!/^[a-zA-Z0-9-]{16,80}$/.test(payload.requestId||''))throw new Error('제출 번호가 올바르지 않습니다.');
    if(!Array.isArray(payload.rows)||payload.rows.length<1||payload.rows.length>100)throw new Error('한 번에 1~100행을 제출하세요.');
    if(!payload.contributor||typeof payload.contributor.name!=='string'||!payload.contributor.name.trim()||payload.contributor.name.length>100||!/^\S+@\S+\.\S+$/.test(payload.contributor.email||''))throw new Error('작성자 이름과 이메일을 입력하세요.');
    if(JSON.stringify(payload).length>400000)throw new Error('한 번에 제출할 수 있는 텍스트 용량을 초과했습니다. 행을 나누어 제출하세요.');
    var ss=spreadsheet_();var actor=actor_(ss,payload.token);
    if(payload.table==='datasets') payload.rows.forEach(function(row){row.group=actor.name;});
    var errors=EMATAX_SCHEMA.validateRows(payload.table,payload.rows);
    if(errors.length)return {ok:false,error:'표시된 항목을 수정하세요.',errors:errors};
    if(!lock.tryLock(20000))throw new Error('다른 제출을 저장하고 있습니다. 같은 제출을 다시 시도하세요.');
    var fields=EMATAX_SCHEMA.tables[payload.table].fields;
    var clean=payload.rows.map(function(row){var r={};fields.forEach(function(f){var v=row[f.key];r[f.key]=(v===null||v===undefined)?'':typeof v==='string'?v.trim():v;});return r;});
    var digest=hash_(JSON.stringify({table:payload.table,rows:clean,contributor:payload.contributor,version:payload.schemaVersion}));
    var existing=records_(ss,payload.table);
    var replay=existing.filter(function(r){return r.request_id===payload.requestId;});
    if(replay.length){
      if(replay.length!==clean.length||replay.some(function(r){return r.request_hash!==digest||r.group_code!==actor.code||r.researcher_code!==actor.researcherCode;}))throw new Error('같은 제출 번호의 내용이 다릅니다. 기존 저장 내역을 관리자에게 확인하세요.');
      return {ok:true,ids:replay.map(function(r){return r.id;}),savedAt:replay[0].created_at,count:replay.length,requestId:payload.requestId,replayed:true};
    }
    if(clean.some(function(r){return r.id;}))throw new Error('ID는 저장 시 자동 발급합니다. 기존 ID를 입력하거나 덮어쓸 수 없습니다.');
    var refs=referenceData_(ss,actor).references;
    errors=referenceErrors_(payload.table,clean,refs);
    if(errors.length)return {ok:false,error:'상위 기록을 먼저 등록하고 목록에서 선택하세요.',errors:errors};
    var now=new Date().toISOString();var date=Utilities.formatDate(new Date(),'Asia/Seoul','yyyyMMdd');
    var ids=[];var rows=clean.map(function(row){
      row.id=PORTAL_PREFIX[payload.table]+'-'+actor.researcherCode+'-'+date+'-'+Utilities.getUuid().replace(/-/g,'').slice(0,12).toUpperCase();ids.push(row.id);
      var data=fields.map(function(f){var v=row[f.key];if((f.type==='number'||f.type==='integer')&&v!=='')return Number(v);return safeText_(v);});
      return data.concat([payload.requestId,digest,now,actor.code,actor.researcherCode,safeText_(payload.contributor.name.trim()),safeText_(payload.contributor.email.trim()),actor.authMethod,EMATAX_SCHEMA.version]);
    });
    var sh=ss.getSheetByName(PORTAL_TABS[payload.table]);
    var head=sh.getRange(1,1,1,headers_(payload.table).length).getValues()[0];if(JSON.stringify(head)!==JSON.stringify(headers_(payload.table)))throw new Error('시트 헤더가 변경되어 저장할 수 없습니다. 관리자에게 확인하세요.');
    // One rectangular write includes the receipt metadata, making retries detectable even when the response is lost.
    var next=sh.getLastRow()+1;if(next+rows.length-1>sh.getMaxRows())sh.insertRowsAfter(sh.getMaxRows(),next+rows.length-1-sh.getMaxRows());
    writeAttempted=true;
    sh.getRange(next,1,rows.length,rows[0].length).setValues(rows);SpreadsheetApp.flush();
    var readback=sh.getRange(next,1,rows.length,1).getValues().map(function(r){return r[0];});
    if(JSON.stringify(readback)!==JSON.stringify(ids))throw new Error('저장 결과 확인이 지연되었습니다. 같은 제출을 다시 시도하세요.');
    return {ok:true,ids:ids,savedAt:now,count:rows.length,requestId:payload.requestId,replayed:false};
  }catch(e){return {ok:false,error:e.message,uncertain:writeAttempted};}
  finally{if(lock.hasLock())lock.releaseLock();}
}
function safeText_(value){if(value===null||value===undefined)return '';var s=String(value);return /^[=+@-]/.test(s)?"'"+s:s;}
function referenceErrors_(key,rows,refs){
  var errors=[];var targets={dataset:['datasets'],material:['materials'],lot:['lots'],batch:['batches'],specimen:['specimens'],entity:['materials','lots','batches','specimens']};
  var fields=EMATAX_SCHEMA.tables[key].fields;
  rows.forEach(function(row,i){
    fields.forEach(function(field){
      if(!field.references||!row[field.key])return;
      var candidates=[];(targets[field.references]||[]).forEach(function(t){candidates=candidates.concat(refs[t]||[]);});
      if(!candidates.some(function(r){return r.id===row[field.key];}))errors.push({row:i+1,field:field.key,message:'이 그룹에 등록된 상위 ID를 선택하세요.'});
    });
    if(key==='specimens'&&row.parent_id&&row.batch_id){
      var parent=(refs.specimens||[]).find(function(r){return r.id===row.parent_id;});
      if(parent&&parent.batch_id&&parent.batch_id!==row.batch_id)errors.push({row:i+1,field:'batch_id',message:'상위 시료와 배치가 다릅니다.'});
    }
    if(row.included_ids){
      var ids=String(row.included_ids).split(/[;,\s]+/).filter(Boolean);
      if(new Set(ids).size!==ids.length)errors.push({row:i+1,field:'included_ids',message:'같은 시료 ID가 집계에 중복 포함되어 있습니다.'});
      ids.forEach(function(id){if(!(refs.specimens||[]).some(function(r){return r.id===id;}))errors.push({row:i+1,field:'included_ids',message:'집계에 포함한 시료 ID가 그룹에 등록되어 있지 않습니다: '+id});});
      if(row.replicate_n!==ids.length)errors.push({row:i+1,field:'replicate_n',message:'반복수는 집계에 포함한 개별 시료 ID 수와 같아야 합니다.'});
    }
  });return errors;
}
function assertOwner_(){var p=PropertiesService.getScriptProperties();if(Session.getEffectiveUser().getEmail()!==p.getProperty('OWNER_EMAIL')||!SpreadsheetApp.getActiveSpreadsheet())throw new Error('관리자 시트 메뉴에서 실행하세요.');}
function issueResearcher_(){
  assertOwner_();var ui=SpreadsheetApp.getUi();
  var prompts=[['이름','연구자 이름'],['이메일','연구자 이메일 (본인 확인용 로그인은 아니며 기록용입니다)'],['그룹 코드','예: LAB01. 같은 그룹은 참조 목록을 공유합니다. 영문 대문자와 숫자 2~20자'],['그룹 이름','연구 그룹 또는 연구실 이름']];var answers=[];
  for(var i=0;i<prompts.length;i++){var result=ui.prompt(prompts[i][0],prompts[i][1],ui.ButtonSet.OK_CANCEL);if(result.getSelectedButton()!==ui.Button.OK)return;answers.push(result.getResponseText().trim());}
  if(!answers[0]||!/^\S+@\S+\.\S+$/.test(answers[1])||!/^[A-Z0-9]{2,20}$/.test(answers[2])||!answers[3]){ui.alert('입력 형식이 올바르지 않습니다. 코드를 발급하지 않았습니다.');return;}
  var lock=LockService.getScriptLock();lock.waitLock(20000);var code,token;
  try{var ss=spreadsheet_();var users=records_(ss,'_Researchers');code='R'+String(users.length+1).padStart(3,'0');token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');ss.getSheetByName('_Researchers').appendRow([code,safeText_(answers[0]),safeText_(answers[1]),answers[2],safeText_(answers[3]),hash_(token),'yes',new Date().toISOString()]);}
  finally{lock.releaseLock();}
  ui.alert('입력 코드 발급 완료',code+' · '+answers[0]+'\n\n'+token+'\n\n이 코드는 다시 표시되지 않습니다. 해당 연구자에게 별도로 전달하세요. 코드 소지자가 이 그룹에 입력하고 참조 목록을 볼 수 있습니다.',ui.ButtonSet.OK);
}
function revokeResearcher_(){
  assertOwner_();var ui=SpreadsheetApp.getUi();var result=ui.prompt('연구자 코드 사용 중지','R002 같은 연구자 번호를 입력하세요. 과거 기록은 보존됩니다.',ui.ButtonSet.OK_CANCEL);if(result.getSelectedButton()!==ui.Button.OK)return;
  var code=result.getResponseText().trim();if(code==='R001'){ui.alert('관리자 기본 번호는 중지할 수 없습니다.');return;}
  var lock=LockService.getScriptLock();lock.waitLock(20000);try{var sh=spreadsheet_().getSheetByName('_Researchers');var rows=sh.getDataRange().getValues();var index=rows.findIndex(function(r){return r[0]===code;});if(index<1){ui.alert('등록된 번호가 아닙니다.');return;}sh.getRange(index+1,7).setValue('no');}finally{lock.releaseLock();}ui.alert(code+' 사용을 중지했습니다.');
}

// Owner management also works from the portal, independent of spreadsheet menus.
function ownerActor_(){
  var owner=PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if(!owner||Session.getActiveUser().getEmail()!==owner||Session.getEffectiveUser().getEmail()!==owner)throw new Error('관리자 Google 계정으로 연결해야 합니다.');
  return owner;
}
function listResearchers(){
  try{ownerActor_();return {ok:true,researchers:records_(spreadsheet_(),'_Researchers').map(function(r){return {code:r.researcher_code,name:r.name,email:r.email,group:r.group_code,groupName:r.group_name,active:r.active==='yes'};})};}
  catch(e){return {ok:false,error:e.message};}
}
function issueResearcherAccess(payload){
  var lock=LockService.getScriptLock();
  try{
    ownerActor_();if(!payload||!String(payload.name||'').trim()||!/^\S+@\S+\.\S+$/.test(payload.email||'')||!/^[A-Z0-9]{2,20}$/.test(payload.group||'')||!String(payload.groupName||'').trim())throw new Error('이름·이메일·그룹 코드(영문 대문자/숫자 2~20자)·그룹 이름을 확인하세요.');
    if(!lock.tryLock(20000))throw new Error('잠시 후 다시 시도하세요.');
    var ss=spreadsheet_();var users=records_(ss,'_Researchers');
    if(users.some(function(u){return u.email.toLowerCase()===payload.email.trim().toLowerCase()&&u.active==='yes'&&u.token_hash;}))throw new Error('이 이메일에 사용 중인 입력 코드가 있습니다. 필요하면 기존 코드를 중지한 후 새로 발급하세요.');
    var groupUser=users.find(function(u){return u.group_code===payload.group;});
    var groupName=groupUser?groupUser.group_name:payload.groupName.trim();
    var next=users.reduce(function(max,u){return Math.max(max,Number(String(u.researcher_code).slice(1))||0);},0)+1;
    var code='R'+String(next).padStart(3,'0');var token=Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'');
    ss.getSheetByName('_Researchers').appendRow([code,safeText_(payload.name.trim()),safeText_(payload.email.trim()),payload.group,safeText_(groupName),hash_(token),'yes',new Date().toISOString()]);
    return {ok:true,code:code,token:token,group:payload.group,groupName:groupName};
  }catch(e){return {ok:false,error:e.message};}finally{if(lock.hasLock())lock.releaseLock();}
}
function revokeResearcherAccess(payload){
  var lock=LockService.getScriptLock();
  try{ownerActor_();if(!payload||!/^R\d{3,}$/.test(payload.code||'')||payload.code==='R001')throw new Error('중지할 연구자 번호를 확인하세요. 기본 관리자 번호는 유지합니다.');if(!lock.tryLock(20000))throw new Error('잠시 후 다시 시도하세요.');var sh=spreadsheet_().getSheetByName('_Researchers');var rows=sh.getDataRange().getValues();var index=rows.findIndex(function(r){return r[0]===payload.code;});if(index<1)throw new Error('등록되지 않은 연구자 번호입니다.');sh.getRange(index+1,7).setValue('no');return {ok:true};}
  catch(e){return {ok:false,error:e.message};}finally{if(lock.hasLock())lock.releaseLock();}
}
