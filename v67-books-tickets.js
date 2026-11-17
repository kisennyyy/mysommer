/* mysommer V6.7: presentation only. The original writing, photos and cloud records stay intact. */
(function(){
 'use strict';
 var writeGrid=document.getElementById('writingGrid'),dreamGrid=document.getElementById('dreamGallery');
 if(!writeGrid||!dreamGrid)return;
 var writingPage=document.getElementById('page-writing'),dreamPage=document.getElementById('page-dreams');
 var bookState={selected:'',mode:'shelf'};
 var filmState={opened:false,mode:'roll'};
 function safe(v){return esc(String(v==null?'':v));}
 function color(v,fallback){return /^#[0-9a-f]{6}$/i.test(v||'')?v:fallback;}
 function coverSrc(v){return /^data:image\/(?:png|jpeg|webp|gif);base64,/i.test(v||'')?v:'';}
 function coverOf(item){
  var c=item.v67Book||{};
  return {title:c.title||item.title||'未命名文稿',subtitle:c.subtitle||'',icon:c.icon||'✧',cover:color(c.cover,'#655079'),spine:color(c.spine,'#49355c'),height:Math.max(145,Math.min(264,Number(c.height)||195)),intro:c.intro||'',image:coverSrc(c.image)};
 }
 function filteredWriting(){
  var query=(document.getElementById('writingSearch').value||'').toLowerCase();
  var type=document.getElementById('writingType').value||'';
  return db.writing.filter(function(item){
   return (!type||item.type===type)&&[item.title,item.name,item.au,item.type,item.content,item.role].join(' ').toLowerCase().includes(query);
  });
 }
 var writeControls=document.createElement('div');
 writeControls.className='v67-view-controls';
 writeControls.innerHTML='<button type="button" data-v67-write-mode="shelf" aria-pressed="true">▤ 立体书展</button><button type="button" data-v67-write-mode="list" aria-pressed="false">☷ 原列表</button>';
 writeGrid.parentNode.insertBefore(writeControls,writeGrid);
 var writeStage=document.createElement('div');
 writeStage.className='v67-writing-area';writeStage.id='v67WritingStage';
 writeGrid.parentNode.insertBefore(writeStage,writeGrid);
 writingPage.classList.add('v67-ready');
 function renderWriting(){
  if(!writingPage||!writeStage)return;
  var list=filteredWriting(),selected=list.find(function(item){return item.id===bookState.selected;});
  if(bookState.selected&&!selected)bookState.selected='';
  writingPage.classList.toggle('v67-list',bookState.mode==='list');
  writeControls.querySelectorAll('[data-v67-write-mode]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.v67WriteMode===bookState.mode));});
  if(bookState.selected&&selected){
   var c=coverOf(selected),text=c.intro||String(selected.content||'').slice(0,150)||'尚未添加作品简介。';
   var image=c.image?'<img class="v67-book-cover-img" src="'+safe(c.image)+'" alt="自定义封面">':'';
   writeStage.innerHTML='<div class="v67-feature"><button type="button" class="v67-feature-return" data-v67-book-back>← BACK TO SHELF</button>'+
    '<div class="v67-feature-layout"><div class="v67-book-stage"><div class="v67-book-object" style="--v67-cover:'+c.cover+';--v67-spine:'+c.spine+'"><div class="v67-book-face">'+image+
    '<span class="v67-book-mini">MYSOMMER / NO. '+String(list.indexOf(selected)+1).padStart(2,'0')+'</span><span class="v67-book-icon">'+safe(c.icon)+'</span><span class="v67-book-title">'+safe(c.title)+'</span><span class="v67-book-mini">'+safe(c.subtitle||'ARCHIVED STORIES')+'</span></div></div></div>'+
    '<div class="v67-feature-meta"><span class="v67-feature-label">SELECTED MANUSCRIPT · '+safe(selected.type||'正文')+'</span><h3>'+safe(c.title)+'</h3>'+
    '<p>'+safe(text)+'</p><p>所属 AU：'+safe(selected.au||'未关联')+' · '+String(Array.isArray(selected.v52Chapters)?selected.v52Chapters.length:1)+' 章</p>'+
    '<div class="v67-feature-actions"><button type="button" data-v67-book-read="'+safe(selected.id)+'">OPEN & READ ↗</button>'+
    '<button type="button" class="v67-feature-secondary" data-v67-book-cover="'+safe(selected.id)+'">封面自定义</button>'+
    '<button type="button" class="v67-feature-secondary" data-v67-book-edit="'+safe(selected.id)+'">编辑正文</button></div></div></div></div>';
  }else{
   var volumes=list.map(function(item,index){
    var c=coverOf(item);
    return '<button class="v67-volume" type="button" data-v67-book-select="'+safe(item.id)+'" style="height:'+c.height+'px;--v67-spine:'+c.spine+'" title="'+safe(c.title)+'"><span class="v67-volume-title">'+safe(c.title)+'</span><span class="v67-volume-no">'+String(index+1).padStart(2,'0')+'</span></button>';
   }).join('');
   writeStage.innerHTML='<div class="v67-shelf"><div class="v67-shelf-label">THE MANUSCRIPT COLLECTION</div><h3>OUR STORIES</h3><p class="v67-shelf-sub">滑动书架，轻触书脊选中作品</p>'+
    (list.length?'<div class="v67-shelf-row">'+volumes+'</div><div class="v67-shelf-base"></div><div class="v67-shelf-foot">'+String(list.length).padStart(2,'0')+' VOLUMES · PRIVATE LIBRARY</div>':
    '<div class="v67-empty">目前没有符合条件的文稿。可以清除筛选，或点击上方「＋ 新建文稿」。</div>')+'</div>';
  }
 }
 window.v67RenderWriting=renderWriting;
 writeControls.addEventListener('click',function(e){
  var btn=e.target.closest('[data-v67-write-mode]');if(!btn)return;
  bookState.mode=btn.dataset.v67WriteMode;bookState.selected='';renderWriting();
 });
 writeStage.addEventListener('click',function(e){
  var btn=e.target.closest('button');if(!btn)return;
  if(btn.hasAttribute('data-v67-book-select')){bookState.selected=btn.dataset.v67BookSelect;renderWriting();return;}
  if(btn.hasAttribute('data-v67-book-back')){bookState.selected='';renderWriting();return;}
  if(btn.hasAttribute('data-v67-book-read')){v5ReadWriting('writing',btn.dataset.v67BookRead);return;}
  if(btn.hasAttribute('data-v67-book-edit')){v5EditWriting(btn.dataset.v67BookEdit);return;}
  if(btn.hasAttribute('data-v67-book-cover')){showCoverEditor(btn.dataset.v67BookCover);return;}
 });
 function showCoverEditor(id){
  var item=db.writing.find(function(x){return x.id===id;});if(!item)return;
  var c=coverOf(item),overlay=document.createElement('div');overlay.className='v67-cover-overlay';
  overlay.innerHTML='<div class="v67-cover-dialog" role="dialog" aria-modal="true" aria-label="自定义书本封面"><h3>✦ 自定义作品封面</h3>'+
   '<p>这里只修改展示外观，文稿标题、章节、正文与历史版本完全保留。</p><div class="v67-cover-form">'+
   '<label class="v67-full">封面显示标题<input id="v67Title" maxlength="140" value="'+safe(c.title)+'"></label>'+
   '<label class="v67-full">副标题 / 系列<input id="v67Subtitle" maxlength="140" value="'+safe(c.subtitle)+'"></label>'+
   '<label>封面主色<input id="v67CoverColor" type="color" value="'+c.cover+'"></label>'+
   '<label>书脊颜色<input id="v67SpineColor" type="color" value="'+c.spine+'"></label>'+
   '<label>封面符号<input id="v67Icon" maxlength="12" value="'+safe(c.icon)+'"></label>'+
   '<label>书脊高度（145～264）<input id="v67Height" type="number" min="145" max="264" value="'+c.height+'"></label>'+
   '<label class="v67-full">作品介绍<textarea id="v67Intro" rows="3">'+safe(c.intro)+'</textarea></label>'+
   '<label class="v67-full">上传专属封面图片（可选）<input id="v67CoverUpload" type="file" accept="image/*"></label></div>'+
   '<div class="v67-modal-actions"><button type="button" id="v67CoverSave" class="v67-primary">保存封面外观</button>'+
   '<button type="button" id="v67CoverClearImage">移除封面图片</button><button type="button" id="v67CoverCancel">取消</button></div></div>';
  document.body.appendChild(overlay);
  var get=function(id){return overlay.querySelector('#'+id);},removeImage=false;
  get('v67CoverCancel').onclick=function(){overlay.remove();};
  overlay.addEventListener('click',function(e){if(e.target===overlay)overlay.remove();});
  get('v67CoverClearImage').onclick=function(){removeImage=true;get('v67CoverUpload').value='';toast('保存后将移除自定义封面图片');};
  get('v67CoverSave').onclick=async function(){
   var button=this;button.disabled=true;
   try{
    var file=get('v67CoverUpload').files[0],image=removeImage?'':c.image;
    if(file){if(file.size>12*1024*1024)throw Error('图片大小超过 12MB');image=await v52CompressImage(file);}
    item.v67Book={title:get('v67Title').value.trim(),subtitle:get('v67Subtitle').value.trim(),icon:get('v67Icon').value.trim(),cover:get('v67CoverColor').value,spine:get('v67SpineColor').value,height:Math.max(145,Math.min(264,Number(get('v67Height').value)||195)),intro:get('v67Intro').value.trim(),image:image};
    persist();overlay.remove();renderAll();toast('封面外观已保存');
   }catch(error){toast('封面保存失败：'+(error.message||error));button.disabled=false;}
  };
 }
 var dreamControls=document.createElement('div');
 dreamControls.className='v67-view-controls';
 dreamControls.innerHTML='<label style="display:flex;align-items:center;gap:6px;color:#806691;font-size:12px">所属 AU <select id="v67DreamAu" style="max-width:138px;padding:7px;border:1px solid #d9c7e5;border-radius:9px;background:#fff;color:#6c5285"><option value="">全部 AU</option></select></label>'+
  '<button type="button" data-v67-dream-mode="roll" aria-pressed="true">◉ 连续票卷</button><button type="button" data-v67-dream-mode="grid" aria-pressed="false">▦ 原网格</button>';
 dreamGrid.parentNode.insertBefore(dreamControls,dreamGrid);
 var filmStage=document.createElement('div');filmStage.className='v67-film-stage';filmStage.id='v67FilmStage';
 dreamGrid.parentNode.insertBefore(filmStage,dreamGrid);dreamPage.classList.add('v67-ready');
 function matchesDream(item){
  var q=(document.getElementById('dreamSearch').value||'').toLowerCase(),type=document.getElementById('dreamCategory').value||'',au=document.getElementById('v67DreamAu').value||'';
  return (!type||v5DreamCategory(item.category)===type)&&(!au||item.au===au||item.auId===(db.aus.find(function(a){return a.name===au;})||{}).id)&&
   [item.title,item.category,item.status,item.note,item.series,item.tags,item.au].join(' ').toLowerCase().includes(q);
 }
 function updateAuChoices(){
  var select=document.getElementById('v67DreamAu'),old=select.value;
  var aus=[...new Set(db.aus.map(function(a){return a.name;}).concat(db.dreams.map(function(x){return x.au;})).filter(Boolean))];
  var signature=aus.join('\x1f');
  if(select.dataset.signature===signature)return;
  select.innerHTML='<option value="">全部 AU</option>'+aus.map(function(name){return '<option value="'+safe(name)+'">'+safe(name)+'</option>';}).join('');
  select.dataset.signature=signature;
  select.value=old;if(select.value!==old)select.value='';
 }
 function renderDream(){
  updateAuChoices();
  dreamPage.classList.toggle('v67-grid',filmState.mode==='grid');
  dreamControls.querySelectorAll('[data-v67-dream-mode]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.v67DreamMode===filmState.mode));});
  var list=db.dreams.filter(matchesDream),open=filmState.opened;
  filmStage.classList.toggle('v67-film-open',open);
  var cards=list.map(function(item,i){
   var pic=item.image?'<img loading="lazy" src="'+safe(item.image)+'" alt="'+safe(item.title)+'">':'<span class="v67-ticket-placeholder">☽</span>';
   return '<button type="button" class="v67-ticket" data-v67-ticket="'+safe(item.id)+'"><small>✧ DREAM TICKET / '+String(i+1).padStart(3,'0')+'</small>'+pic+
    '<strong>'+safe(item.title||'未命名梦图')+'</strong><small>'+safe(v5DreamCategory(item.category))+' · '+safe(item.date||'NO DATE')+'</small></button>';
  }).join('');
  filmStage.innerHTML='<div class="v67-film-eyebrow">LITTLE MEMORIES · THE DREAM ROLL</div>'+
   '<div class="v67-film-machine"><button class="v67-spool" type="button" aria-expanded="'+String(open)+'" aria-label="'+(open?'点击收起连续票卷':'点击展开连续票卷')+'">'+
   '<span class="v67-spool-body"></span><span class="v67-spool-bottom"></span><span class="v67-spool-cap"></span><span class="v67-spool-hole"></span><span class="v67-spool-label">DREAM</span></button>'+
   (open?'<div class="v67-ticket-scroll" tabindex="0" aria-label="左右滑动连续梦图票卷"><div class="v67-ticket-track">'+cards+'</div></div>':'')+'</div>'+
   (open&&!list.length?'<div class="v67-film-empty">这一卷没有符合条件的梦图。可清除筛选或添加新图片。</div>':'')+
   '<p class="v67-film-hint">'+(open?'左右滑动同一条票带，点击单张梦图查看大图。点击左侧卷轴收回。':'直接点击立体卷轴，展开整卷梦图收藏')+'</p>'+
   '<div class="v67-film-meta">✧ '+String(list.length)+' DREAM TICKETS · 紫色电影票珍藏 ✧</div>';
 }
 window.v67RenderDream=renderDream;
 window.v67ShowDreamsForAu=function(au){
  filmState.mode='roll';filmState.opened=true;
  var selector=document.getElementById('v67DreamAu');updateAuChoices();selector.value=au||'';
  renderPhotos('dreams','dreamGallery','dreamSearch','dreamCategory');
  go('dreams');
 };
 dreamControls.addEventListener('click',function(e){
  var button=e.target.closest('[data-v67-dream-mode]');if(!button)return;
  filmState.mode=button.dataset.v67DreamMode;renderDream();
 });
 document.getElementById('v67DreamAu').addEventListener('change',function(){renderPhotos('dreams','dreamGallery','dreamSearch','dreamCategory');});
 filmStage.addEventListener('click',function(e){
  if(e.target.closest('.v67-spool')){filmState.opened=!filmState.opened;renderDream();return;}
  var button=e.target.closest('[data-v67-ticket]');if(button)showDreamDetail(button.dataset.v67Ticket);
 });
 function showDreamDetail(id){
  var item=db.dreams.find(function(x){return x.id===id;});if(!item)return;
  var dialog=document.createElement('div');dialog.className='v67-dream-overlay';
  dialog.innerHTML='<div class="v67-dream-dialog" role="dialog" aria-modal="true" aria-label="梦图详情"><div class="v67-modal-actions" style="justify-content:space-between;margin:0">'+
   '<span style="font-size:11px;letter-spacing:.15em;color:#9273a9">✧ DREAM TICKET · 票券详情</span><button type="button" data-v67-close>✕ 关闭</button></div>'+
   '<h3>'+safe(item.title||'未命名梦图')+'</h3>'+(item.image?'<img class="v67-dream-large" alt="完整梦图">':'<div class="v67-empty">这条记录没有图片</div>')+
   '<p class="v67-dream-meta">分类：'+safe(v5DreamCategory(item.category))+'<br>日期：'+safe(item.date||'未填写')+'<br>所属 AU：'+safe(item.au||'未关联')+
   '<br>标签：'+safe(item.tags||'未填写')+'</p><p class="v67-dream-note">'+safe(item.note||'')+'</p>'+
   '<div class="v67-modal-actions"><button class="v67-primary" type="button" data-v67-edit>编辑梦图</button>'+
   (item.image?'<button type="button" data-v67-zoom>查看大图</button>':'')+
   (item.au&&db.aus.some(function(a){return a.name===item.au||a.id===item.auId;})?'<button type="button" data-v67-open-au>打开所属 AU</button>':'')+
   '<button type="button" data-v67-delete>删除记录</button></div></div>';
  document.body.appendChild(dialog);
  var img=dialog.querySelector('img.v67-dream-large');if(img)img.src=item.image;
  function close(){dialog.remove();document.removeEventListener('keydown',onKey);}
  function onKey(e){if(e.key==='Escape')close();}
  document.addEventListener('keydown',onKey);
  dialog.addEventListener('click',function(e){
   if(e.target===dialog||e.target.closest('[data-v67-close]')){close();return;}
   if(e.target.closest('[data-v67-edit]')){close();editPhoto('dreams',id);return;}
   if(e.target.closest('[data-v67-zoom]')){v5ViewDream(id);return;}
   if(e.target.closest('[data-v67-delete]')){close();deleteItem('dreams',id);return;}
   if(e.target.closest('[data-v67-open-au]')){var au=db.aus.find(function(a){return a.id===item.auId||a.name===item.au;});if(au){close();v5OpenAu(au.id);}return;}
  });
 }
 renderWriting();renderDream();
})();
