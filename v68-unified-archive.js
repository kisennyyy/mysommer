/* mysommer V6.8 UNIFIED 档案. Presentation changes only, no automatic data migration. */
(function(){
'use strict';
const archive=document.getElementById('page-archive'),auPage=document.getElementById('page-au-detail'),auView=document.getElementById('v68AuDetail');
if(!archive||!auView)return;
const state={tab:'worlds',sub:'people',legacy:false,returnAu:'',returnScroll:0};
const $=id=>document.getElementById(id);
const text=(v)=>esc(String(v==null?'':v));
const people=['夏以昼','锺起'];
function matchAu(record,au){
 if(!record||!au)return false;
 if(record.auId)return record.auId===au.id;
 return record.au===au.name||(Array.isArray(au.v68Aliases)&&au.v68Aliases.includes(record.au));
}
window.v68MatchesAu=matchAu;
function matchesRecord(record,au){return matchAu(record,au);}
function listFor(bucket,au){return (db[bucket]||[]).filter(x=>matchesRecord(x,au));}
function inferPerson(r){if(people.includes(r.personId))return r.personId;
 const title=String(r.title||r.name||'');return people.find(p=>title.includes(p))||'';
}
function chooseView(tab,sub){
 state.tab=tab==='records'?'records':'worlds';
 state.sub=sub==='other'?'other':'people';
 $('v68WorldPane').hidden=state.tab!=='worlds';
 $('v68RecordPane').hidden=state.tab!=='records';
 $('v68PeoplePane').hidden=state.tab!=='records'||state.sub!=='people';
 $('v68OtherPane').hidden=state.tab!=='records'||state.sub!=='other';
 archive.querySelectorAll('[data-v68-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v68Tab===state.tab)));
 archive.querySelectorAll('[data-v68-sub]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v68Sub===state.sub)));
 archive.querySelectorAll('[data-v68-tab],[data-v68-sub]').forEach(b=>b.tabIndex=b.getAttribute('aria-selected')==='true'?0:-1);
 if(state.tab==='records'&&state.sub==='people')v53RenderCharacterStage();
}
function updateSelectors(){
 for(const key of ['v68WritingAu','v68SettingsAu']){
  const select=$(key);if(!select)continue;
  const old=select.value,signature=db.aus.map(a=>a.id+':'+a.name).join('|');
  if(select.dataset.signature!==signature){
   select.innerHTML='<option value="">全部 AU</option>'+db.aus.map(a=>'<option value="'+text(a.id)+'">'+text(a.name)+'</option>').join('');
   select.dataset.signature=signature;select.value=old;if(select.value!==old)select.value='';
  }
 }
}
function renderArchive(){
 if(!archive)return;
 updateSelectors();
 const aCount=$('v68AuSummary'),sCount=$('v68SettingSummary');
 if(aCount)aCount.textContent=db.aus.length+' 个世界';
 if(sCount)sCount.textContent=db.settings.length+' 份资料';
}
window.v68RenderArchive=renderArchive;
function openArchive(tab,sub,auId,person){
 chooseView(tab,sub);go('archive');
 if(auId&&state.tab==='records'&&state.sub==='other'){
  updateSelectors();const select=$('v68SettingsAu');if(select)select.value=auId;
  renderNotes('settings','settingGrid','settingSearch','settingType');
 }
 if(auId&&people.includes(person)){
  const a=db.aus.find(x=>x.id===auId);
  v53SelectedAu=a?a.name:'';
  v53ActivePerson=person;
  v53RenderCharacterStage();
 }
 renderArchive();
}
window.v68OpenArchive=openArchive;
function entry(item,label,on,subtitle){
 return '<div class="v68-item"><span class="v68-item-body"><strong>'+text(label||item.title||item.name||'未命名')+'</strong>'+
 '<small>'+text(subtitle||item.type||item.role||'')+'</small></span>'+on+'</div>';
}
function actionButton(action,id,label){
 return '<button type="button" data-v68-action="'+action+'" data-v68-id="'+text(id||'')+'">'+text(label)+'</button>';
}
function openWritingForAu(au){
 state.returnAu=au.id;state.returnScroll=window.scrollY;
 const s=$('v68WritingAu');updateSelectors();if(s)s.value=au.id;
 go('writing');
 window.v67RenderWriting?.();
 renderNotes('writing','writingGrid','writingSearch','writingType');
 renderContextBars();
}
function openDreamForAu(au){
 state.returnAu=au.id;state.returnScroll=window.scrollY;
 if(typeof window.v67ShowDreamsForAu==='function')window.v67ShowDreamsForAu(au.name);
 else go('dreams');
 renderContextBars();
}
function openWritingRecord(id,au){
 state.returnAu=au.id;state.returnScroll=window.scrollY;
 renderContextBars();v5ReadWriting('writing',id);
}
function returnToAu(){
 const a=db.aus.find(a=>a.id===state.returnAu);
 if(!a){go('archive');return;}
 const scroll=state.returnScroll;
 v5OpenAu(a.id);
 window.requestAnimationFrame(()=>window.scrollTo({top:scroll,behavior:'instant'}));
 renderContextBars();
}
function clearContext(){state.returnAu='';renderContextBars();}
window.v68ClearArchiveContext=clearContext;
function renderContextBars(){
 const a=db.aus.find(x=>x.id===state.returnAu);
 for(const type of ['writing','dreams']){
  const bar=$('v68Context-'+type);if(!bar)continue;
  bar.hidden=!a;
  if(a){const label=bar.querySelector('span');if(label)label.textContent='从「'+a.name+'」进入';}
 }
}
function renderAuDetail(){
 const au=db.aus.find(a=>a.id===v5CurrentAu);
 if(!au)return;
 auPage.classList.add('v68-unified');
 auPage.classList.toggle('v68-show-old',state.legacy);
 const settings=listFor('settings',au),writing=listFor('writing',au),dreams=listFor('dreams',au);
 const characters=listFor('characters',au);
 const worldCards=settings.map(x=>entry(x,x.title,actionButton('edit-setting',x.id,'查看 / 编辑'),x.type||'资料')).join('');
 const writings=writing.map(x=>entry(x,x.title,actionButton('read-writing',x.id,'阅读 ↗'),x.type||'文稿')).join('');
 const tickets=dreams.map(x=>entry(x,x.title,actionButton('see-dream',x.id,'看梦图 ↗'),v5DreamCategory(x.category))).join('');
 const timelines=(au.v5Timeline||[]).map((x,i)=>
  '<div class="v68-timeline-entry"><small>'+text(x.date||'未注明时间')+'</small><strong>'+text(x.title||'未命名事件')+'</strong><p>'+text(x.note||'')+'</p>'+
  actionButton('timeline-remove',String(i),'删除节点')+'</div>').join('');
 const personCard=(p)=>{
  const profile=(db.v53People||{})[p]||{};
  const n=characters.filter(x=>inferPerson(x)===p).length;
  const portrait=profile.image?'<img src="'+text(profile.image)+'" alt="'+text(p)+'">':'✧';
  return '<button type="button" class="v68-person" data-v68-action="person" data-v68-id="'+text(p)+'"><span class="v68-person-icon">'+portrait+'</span><strong>'+text(p)+'</strong><small>'+n+' 份 AU 人物设定</small></button>';
 };
 auView.innerHTML='<div class="v68-au-detail"><div class="v68-au-hero" id="v68AuHero"><small>✦ AU FILE / '+text(au.status||'世界档案')+'</small><h2>'+text(au.name)+'</h2><p>'+text([au.pair,au.type].filter(Boolean).join(' · '))+'</p></div>'+
 '<div class="v68-au-layout"><div>'+
 '<section class="v68-card"><h3>✦ 世界简介</h3><p>'+text(au.desc||au.mark||'尚未填写世界简介。')+'</p><div class="v68-actions">'+actionButton('edit-au','','编辑 AU 基本资料')+'</div></section>'+
 '<section class="v68-card"><h3>THE TWO OF US · 角色设定</h3><div class="v68-duo">'+people.map(personCard).join('')+'</div></section>'+
 '<section class="v68-card"><h3>❖ 其他设定 · '+settings.length+' 份</h3>'+
 (worldCards||'<div class="v68-empty">这个世界还没有关联的设定。</div>')+
 '<div class="v68-actions">'+actionButton('new-setting','','＋ 添加设定')+actionButton('other-files','','全部其他设定')+'</div></section>'+
 '<section class="v68-card"><h3>✎ 关联文稿 · '+writing.length+' 篇</h3>'+
 (writings||'<div class="v68-empty">尚未关联文稿。</div>')+
 '<div class="v68-actions">'+actionButton('browse-writing','','在独立文稿页浏览')+actionButton('new-writing','','＋ 创建关联文稿')+'</div></section>'+
 '<section class="v68-card"><h3>☾ 关联梦图 · '+dreams.length+' 张</h3>'+
 (tickets||'<div class="v68-empty">尚未关联梦图。</div>')+
 '<div class="v68-actions">'+actionButton('browse-dreams','','在独立梦图页浏览')+actionButton('new-dream','','＋ 添加梦图')+'</div></section>'+
 '</div><div>'+
 '<section class="v68-card"><h3>✧ 世界封面</h3><input type="file" accept="image/*" id="v68AuCoverUpload" aria-label="上传 AU 世界封面"><div class="v68-actions" style="margin-top:10px">'+actionButton('cover-clear','','移除封面')+'</div></section>'+
 '<section class="v68-card"><h3>♡ AU 内部时间线</h3><div class="v68-timeline-list">'+(timelines||'<div class="v68-empty">没有时间节点。</div>')+'</div>'+
 '<div class="form-grid"><div class="field"><label for="v68TimelineDate">时间 / 日期</label><input id="v68TimelineDate" placeholder="可填写虚构纪年"></div>'+
 '<div class="field"><label for="v68TimelineTitle">事件标题</label><input id="v68TimelineTitle" placeholder="事件名称"></div>'+
 '<div class="field full"><label for="v68TimelineNote">事件说明</label><textarea id="v68TimelineNote" rows="3"></textarea></div></div>'+
 '<div class="v68-actions" style="margin-top:12px">'+actionButton('timeline-add','','＋ 添加时间节点')+'</div></section>'+
 '<section class="v68-card"><h3>✧ AU 专属双人衣柜</h3><div id="v68WardrobeRoot">'+v5WardrobeMarkup(au)+'</div></section>'+
 '</div></div></div>'+
 '<button type="button" class="v68-legacy-toggle" id="v68OldLayout" aria-expanded="'+state.legacy+'">'+(state.legacy?'返回新版档案布局':'查看原有 AU 完整工具和历史关联（兼容入口）')+'</button>';
 const hero=$('v68AuHero');if(hero&&au.v5Cover)hero.style.backgroundImage='linear-gradient(0deg,#27133cb5,#27133c50),url('+JSON.stringify(au.v5Cover)+')';
 bindV5Wardrobe(auView,au);
 const upload=$('v68AuCoverUpload');
 if(upload)upload.onchange=async function(){const file=this.files?.[0];if(!file)return;try{au.v5Cover=await compressAppearanceImage(file);persist();renderV5AuDetail();}catch(error){toast(error.message||'封面上传失败');}};
 const old=$('v68OldLayout');if(old)old.onclick=function(){state.legacy=!state.legacy;auPage.classList.toggle('v68-show-old',state.legacy);old.textContent=state.legacy?'返回新版档案布局':'查看原有 AU 完整工具和历史关联（兼容入口）';old.setAttribute('aria-expanded',String(state.legacy));};
}
window.v68RenderAuDetail=renderAuDetail;
auView.addEventListener('click',function(e){
 const btn=e.target.closest('[data-v68-action]');if(!btn)return;
 const au=db.aus.find(a=>a.id===v5CurrentAu);if(!au)return;
 const action=btn.dataset.v68Action,id=btn.dataset.v68Id;
 if(action==='person'){openArchive('records','people',au.id,id);return;}
 if(action==='other-files'){openArchive('records','other',au.id);return;}
 if(action==='edit-au'){editAu(au.id);return;}
 if(action==='edit-setting'){window.editRecord('settings',id);return;}
 if(action==='new-setting'){window.editRecord('settings',null,{title:au.name+' · 新设定',type:'世界观',au:au.name,auId:au.id,content:''});return;}
 if(action==='new-writing'){v5EditWriting(null,{title:'',type:'正文',au:au.name,auId:au.id,content:''});return;}
 if(action==='browse-writing'){openWritingForAu(au);return;}
 if(action==='browse-dreams'){openDreamForAu(au);return;}
 if(action==='read-writing'){openWritingRecord(id,au);return;}
 if(action==='new-dream'){editPhoto('dreams',null);requestAnimationFrame(()=>{const sel=$('v67DreamAssoc');if(sel)sel.value=au.name;});return;}
 if(action==='see-dream'){openDreamForAu(au);window.requestAnimationFrame(()=>window.v67OpenDream?.(id));return;}
 if(action==='cover-clear'){if(!confirm('移除这个 AU 的封面图片？其他内容保持不变。'))return;au.v5Cover='';persist();renderV5AuDetail();return;}
 if(action==='timeline-add'){const title=$('v68TimelineTitle')?.value.trim();if(!title){toast('请填写时间节点标题');return;}au.v5Timeline??=[];au.v5Timeline.push({title,date:$('v68TimelineDate').value.trim(),note:$('v68TimelineNote').value.trim()});persist();renderV5AuDetail();return;}
 if(action==='timeline-remove'){if(!confirm('删除这个时间节点？'))return;au.v5Timeline.splice(Number(id),1);persist();renderV5AuDetail();return;}
});
function insertContextBar(pageId,type){
 const page=$(pageId),bar=document.createElement('div');if(!page)return;
 bar.className='v68-context-return';bar.id='v68Context-'+type;bar.hidden=true;
 bar.innerHTML='<span>从档案进入</span><button type="button">↶ 返回所属 AU</button>';
 page.querySelector('.section-head')?.after(bar);
 bar.querySelector('button').onclick=returnToAu;
}
insertContextBar('page-writing','writing');
insertContextBar('page-dreams','dreams');
const readingBack=$('v5WritingBack');
if(readingBack)readingBack.addEventListener('click',function(e){
 if(!state.returnAu)return;
 e.stopImmediatePropagation();e.preventDefault();returnToAu();
},true);
document.addEventListener('click',function(e){
 const btn=e.target.closest('#nav [data-page],#roomDrawer [data-goto]');
 if(!btn)return;const destination=btn.dataset.page||btn.dataset.goto;
 if(['writing','dreams','archive','home'].includes(destination))clearContext();
},true);
archive.addEventListener('click',function(e){
 let btn=e.target.closest('[data-v68-tab]');if(btn){chooseView(btn.dataset.v68Tab,state.sub);return;}
 btn=e.target.closest('[data-v68-sub]');if(btn){chooseView('records',btn.dataset.v68Sub);return;}
 btn=e.target.closest('#v68CreateAu');if(btn){editAu(null);return;}
});
const writingControls=$('page-writing')?.querySelector('.v67-view-controls');
if(writingControls&&!$('v68WritingAu')){
 const label=document.createElement('label');label.style.cssText='display:flex;align-items:center;gap:6px;color:#806691;font-size:12px;';
 label.innerHTML='所属 AU <select id="v68WritingAu" style="max-width:150px;padding:7px;border:1px solid #d9c7e5;border-radius:9px;background:#fff;color:#6c5285"><option value="">全部 AU</option></select>';
 writingControls.prepend(label);
 label.querySelector('select').addEventListener('change',function(){window.v67RenderWriting?.();renderNotes('writing','writingGrid','writingSearch','writingType');});
}
const auToolbar=$('page-aus')?.querySelector('.toolbar'),auGrid=$('auGrid');
if(auToolbar&&auGrid){$('v68AuMount').appendChild(auToolbar);$('v68AuMount').appendChild(auGrid);}
const settingPane=$('archive-settings');if(settingPane){$('v68SettingsMount').appendChild(settingPane);
 const toolbar=settingPane.querySelector('.toolbar');if(toolbar&&!$('v68SettingsAu')){
  const label=document.createElement('label');label.style.cssText='display:flex;align-items:center;gap:6px;color:#806691;font-size:12px;';
  label.innerHTML='所属 AU <select id="v68SettingsAu" style="max-width:150px;padding:7px;border:1px solid #d9c7e5;border-radius:9px;background:#fff;color:#6c5285"><option value="">全部 AU</option></select>';
  toolbar.prepend(label);label.querySelector('select').addEventListener('change',()=>renderNotes('settings','settingGrid','settingSearch','settingType'));
 }
}
const peopleStage=$('v53CharacterStage');if(peopleStage)$('v68PeopleMount').appendChild(peopleStage);
const characterPane=$('archive-characters');if(characterPane)$('v68LegacyCharactersMount').appendChild(characterPane);
chooseView('worlds','people');renderArchive();renderContextBars();
})();
