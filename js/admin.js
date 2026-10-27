(function(){
  var L=window.LC,d=document,esc=L.esc,m2=L.money2,DAY=864e5;
  function $(s,r){return (r||d).querySelector(s)}
  function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
  var tT;function toast(t,bad){var e=$('#toast');e.textContent=t;e.className='toast on'+(bad?' bad':'');clearTimeout(tT);tT=setTimeout(function(){e.className='toast'},2200)}
  function saved(ok){ok?toast('Saved'):toast('Could not save: browser storage is full. Remove some photos.',true);return ok}
  function download(name,type,text){var a=d.createElement('a'),u=URL.createObjectURL(new Blob([text],{type:type}));a.href=u;a.download=name;d.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},500)}
  function csvq(v){return '"'+String(v==null?'':v).replace(/"/g,'""')+'"'}
  function dayStart(t){var x=new Date(t);x.setHours(0,0,0,0);return x.getTime()}

  /* ---------- login ---------- */
  var authed=false;try{authed=sessionStorage.getItem('lc.auth')==='1'}catch(e){}
  function showApp(){$('#login').hidden=true;$('#app').hidden=false;renderAll()}
  $('#loginform').addEventListener('submit',function(e){
    e.preventDefault();var msg=$('#loginmsg');msg.textContent='';
    L.checkPw($('#pw').value).then(function(ok){if(ok){try{sessionStorage.setItem('lc.auth','1')}catch(e){}$('#pw').value='';showApp()}else msg.textContent='That is not the password.'});
  });
  $('#logout').addEventListener('click',function(){try{sessionStorage.removeItem('lc.auth')}catch(e){}location.reload()});
  if(authed)showApp();else $('#login').hidden=false;

  /* ---------- tabs ---------- */
  function tab(n){
    $$('.a-tabs button').forEach(function(b){b.classList.toggle('on',b.dataset.tab===n)});
    $$('.a-pane').forEach(function(p){p.hidden=p.id!=='tab-'+n});
    ({events:renderEvents,photos:renderPhotos,site:renderSite,orders:renderOrders,reports:renderReports,settings:renderSettings,data:renderData,menu:renderMenu})[n]();
    try{history.replaceState(null,'','#'+n)}catch(e){}
  }
  $$('.a-tabs button').forEach(function(b){b.addEventListener('click',function(){tab(b.dataset.tab)})});
  function renderAll(){var h=location.hash.slice(1);tab(['events','photos','site','orders','reports','settings','data'].indexOf(h)>-1?h:'menu');renderBadge()}
  function fillCats(sel,all){sel.innerHTML=(all?'<option value="">All categories</option>':'')+L.cats().map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.name)+'</option>'}).join('')}

  /* ---------- menu ---------- */
  function renderMenu(){
    var all=L.items({all:true}),cs=$('#cat'),cur=cs.value;fillCats(cs,true);cs.value=cur;
    var out=all.filter(function(i){return !i.available}).length,ao=all.filter(function(i){return i.groups&&i.groups.length}).length,est=all.filter(function(i){return i.est}).length;
    $('#stats').innerHTML=[[all.length,'Menu items'],[all.filter(function(i){return i.published!==false}).length,'On the menu'],[out,'Sold out today'],[ao,'With add-ons'],[est,'Prices to confirm']].map(function(s){return '<div class="stat"><b>'+s[0]+'</b><span>'+s[1]+'</span></div>'}).join('');
    var q=$('#q').value.trim().toLowerCase(),c=cs.value;
    var list=all.filter(function(i){return (!c||i.cat===c)&&(!q||(i.name+' '+i.desc).toLowerCase().indexOf(q)>-1)});
    $('#plist').innerHTML=list.length?list.map(function(i){
      var n=(i.groups||[]).length;
      return '<div class="prow'+(i.published===false?' hid':'')+'" data-id="'+esc(i.id)+'"><div class="a-thumb'+(i.images&&i.images[0]?'':' none')+'">'+(i.images&&i.images[0]?'<img src="'+esc(i.images[0])+'" alt="">':'🍳')+'</div>'+
        '<div class="pn">'+esc(i.name)+'<small>'+esc(L.catName(i.cat))+'</small>'+(n?'<span class="chip addon">'+n+' add-on group'+(n>1?'s':'')+'</span>':'')+(i.est||(i.groups||[]).some(function(g){return g.est})?'<span class="chip warn">Confirm prices</span>':'')+(i.featured?'<span class="chip">Featured</span>':'')+'</div>'+
        '<label class="mini f-price">Price $<input type="number" step="0.01" min="0" value="'+i.price+'" data-f="price" aria-label="Price for '+esc(i.name)+'"></label>'+
        '<label class="tg f-av"><input type="checkbox" class="sw" data-f="available"'+(i.available?' checked':'')+' aria-label="Available today: '+esc(i.name)+'"> Available</label>'+
        '<label class="tg f-pub"><input type="checkbox" class="sw" data-f="published"'+(i.published!==false?' checked':'')+' aria-label="Show on menu: '+esc(i.name)+'"> On menu</label>'+
        '<div class="acts"><button class="ib" data-a="edit">Edit</button><button class="ib" data-a="dup">Copy</button><button class="ib del" data-a="del">Delete</button></div></div>';
    }).join(''):'<p class="fine">No items match.</p>';
  }
  $('#q').addEventListener('input',renderMenu);$('#cat').addEventListener('change',renderMenu);
  $('#plist').addEventListener('change',function(e){
    var f=e.target.dataset.f;if(!f)return;var it=L.item(e.target.closest('.prow').dataset.id);if(!it)return;
    if(f==='price'){var v=parseFloat(e.target.value);if(isNaN(v)||v<0){toast('Enter a price',true);renderMenu();return}it.price=Math.round(v*100)/100;it.est=false}else it[f]=e.target.checked;
    if(saved(L.saveItem(it)))renderMenu();
  });
  $('#plist').addEventListener('click',function(e){
    var b=e.target.closest('[data-a]');if(!b)return;var id=b.closest('.prow').dataset.id,it=L.item(id);
    if(b.dataset.a==='edit')openEditor(it);
    if(b.dataset.a==='dup'){var c=JSON.parse(JSON.stringify(it));c.name+=' (copy)';c.id='';c.published=false;if(saved(L.saveItem(c)))renderMenu()}
    if(b.dataset.a==='del'&&confirm('Delete "'+it.name+'"? This cannot be undone.')){L.deleteItem(id);toast('Deleted');renderMenu()}
  });
  $('#addbtn').addEventListener('click',function(){openEditor(null)});

  /* ---------- editor ---------- */
  var ed,photos=[],groups=[],dlg=$('#editor'),form=$('#edform');
  function blankGroup(){return {label:'',type:'single',required:true,max:0,est:false,choices:[]}}
  function openEditor(it){
    ed=it?JSON.parse(JSON.stringify(it)):{id:'',name:'',cat:L.cats()[0].id,price:'',desc:'',images:[],available:true,featured:false,published:true,badge:'',groups:[],est:false};
    $('#edtitle').textContent=it?'Edit item':'Add item';$('#edmsg').textContent='';fillCats(form.elements.cat);
    var f=form.elements;f.name.value=ed.name;f.cat.value=ed.cat;f.price.value=ed.price;f.desc.value=ed.desc||'';f.badge.value=ed.badge||'';
    f.available.checked=!!ed.available;f.published.checked=ed.published!==false;f.featured.checked=!!ed.featured;f.est.checked=!!ed.est;
    photos=(ed.images||[]).slice();groups=JSON.parse(JSON.stringify(ed.groups||[]));renderPhotos();renderGroups();dlg.showModal();f.name.focus();
  }
  $('#edclose').addEventListener('click',function(){dlg.close()});$('#edcancel').addEventListener('click',function(){dlg.close()});
  function renderGroups(){
    $('#groups').innerHTML=groups.map(function(g,i){
      return '<div class="grp-ed" data-i="'+i+'"><div class="hd"><span>Group '+(i+1)+'</span><button type="button" class="ib del" data-g="rm">Remove</button></div>'+
        '<div class="r1"><label class="fld" style="margin:0">Name <small>(Size, Bread, Milk…)</small><input data-gf="label" value="'+esc(g.label)+'" maxlength="30"></label>'+
        '<label class="fld" style="margin:0">Customer can<select data-gf="type"><option value="single"'+(g.type==='single'?' selected':'')+'>Pick one</option><option value="multi"'+(g.type==='multi'?' selected':'')+'>Pick several</option></select></label></div>'+
        '<div class="r2"><label class="chk"><input type="checkbox" data-gf="required"'+(g.required?' checked':'')+(g.type==='multi'?' disabled':'')+'> Required</label>'+
        (g.type==='multi'?'<label class="chk">Max <input type="number" min="0" data-gf="max" value="'+(g.max||0)+'" style="width:70px"> <small>0 = no limit</small></label>':'')+
        '<label class="chk"><input type="checkbox" data-gf="est"'+(g.est?' checked':'')+'> Confirm prices</label></div>'+
        '<label class="fld" style="margin:0">Choices <small>One per line: name, extra price</small><textarea data-gf="choices" placeholder="Oat milk, 0.75&#10;Almond milk, 0.75">'+esc(g.choices.map(function(c){return c.n+(c.p?', '+c.p:', 0')}).join('\n'))+'</textarea></label>'+
        '<small class="h">Extra price is added to the item price. Use 0 for no charge.</small></div>';
    }).join('');
  }
  function syncGroup(el){
    var gi=+el.closest('.grp-ed').dataset.i,g=groups[gi],f=el.dataset.gf;
    if(f==='choices'){g.choices=el.value.split('\n').map(function(l){var p=l.split(/[,|]/);var n=(p[0]||'').trim(),v=parseFloat((p[p.length-1]||'').replace(/[^0-9.\-]/g,''));return n?{n:n,p:p.length>1&&!isNaN(v)?Math.round(v*100)/100:0}:null}).filter(Boolean)}
    else if(f==='required'||f==='est')g[f]=el.checked;
    else if(f==='max')g.max=Math.max(0,parseInt(el.value,10)||0);
    else{g[f]=el.value;if(f==='type'){if(el.value==='multi')g.required=false;renderGroups()}}
  }
  $('#groups').addEventListener('input',function(e){if(e.target.dataset.gf&&e.target.dataset.gf!=='type')syncGroup(e.target)});
  $('#groups').addEventListener('change',function(e){if(e.target.dataset.gf)syncGroup(e.target)});
  $('#groups').addEventListener('click',function(e){var b=e.target.closest('[data-g=rm]');if(!b)return;groups.splice(+b.closest('.grp-ed').dataset.i,1);renderGroups()});
  $('#addgroup').addEventListener('click',function(){groups.push(blankGroup());renderGroups();var t=$$('#groups [data-gf=label]');t[t.length-1].focus()});
  function renderPhotos(){
    $('#photos').innerHTML=photos.map(function(s,i){return '<div class="ph-item" data-i="'+i+'"><img src="'+esc(s)+'" alt="Photo '+(i+1)+'">'+(i?'':'<span class="main">MAIN</span>')+'<div class="ctl"><button type="button" data-p="l"'+(i?'':' disabled')+' aria-label="Move earlier">←</button><button type="button" data-p="x" aria-label="Remove">✕</button><button type="button" data-p="r"'+(i<photos.length-1?'':' disabled')+' aria-label="Move later">→</button></div></div>'}).join('');
  }
  $('#photos').addEventListener('click',function(e){
    var b=e.target.closest('[data-p]');if(!b)return;var i=+b.closest('.ph-item').dataset.i;
    if(b.dataset.p==='x')photos.splice(i,1);if(b.dataset.p==='l'&&i>0)photos.splice(i-1,0,photos.splice(i,1)[0]);if(b.dataset.p==='r'&&i<photos.length-1)photos.splice(i+1,0,photos.splice(i,1)[0]);renderPhotos();
  });
  function shrink(file){return new Promise(function(res,rej){
    if(!/^image\//.test(file.type))return rej(new Error(file.name+' is not an image'));
    var u=URL.createObjectURL(file),im=new Image();
    im.onload=function(){var r=Math.min(1,1200/Math.max(im.naturalWidth,im.naturalHeight)),c=d.createElement('canvas');c.width=Math.round(im.naturalWidth*r);c.height=Math.round(im.naturalHeight*r);var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);res(c.toDataURL('image/jpeg',.82))};
    im.onerror=function(){URL.revokeObjectURL(u);rej(new Error('Could not read '+file.name))};im.src=u})}
  function addFiles(fl){var fs=[].slice.call(fl);if(!fs.length)return;$('#photonote').textContent='Processing…';
    Promise.all(fs.map(function(f){return shrink(f).catch(function(e){$('#edmsg').textContent=e.message;return null})})).then(function(r){r.filter(Boolean).forEach(function(s){photos.push(s)});renderPhotos();$('#photonote').textContent='Photos are resized and compressed automatically.'})}
  var drop=$('#drop'),fin=$('#files');
  drop.addEventListener('click',function(){fin.click()});drop.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();fin.click()}});
  fin.addEventListener('change',function(){addFiles(fin.files);fin.value=''});
  ['dragenter','dragover'].forEach(function(n){drop.addEventListener(n,function(e){e.preventDefault();drop.classList.add('over')})});
  ['dragleave','drop'].forEach(function(n){drop.addEventListener(n,function(e){e.preventDefault();drop.classList.remove('over')})});
  drop.addEventListener('drop',function(e){addFiles(e.dataTransfer.files)});
  $('#urladd').addEventListener('click',function(){var u=$('#urlin').value.trim();if(!/^https?:\/\//i.test(u)&&!/^img\//.test(u)){$('#edmsg').textContent='Enter a full image link starting with https://';return}photos.push(u);$('#urlin').value='';$('#edmsg').textContent='';renderPhotos()});
  form.addEventListener('submit',function(e){
    e.preventDefault();var f=form.elements,msg=$('#edmsg');msg.textContent='';
    var price=parseFloat(f.price.value);if(!f.name.value.trim()){msg.textContent='Give it a name.';return}if(isNaN(price)||price<0){msg.textContent='Enter a price.';return}
    var gs=groups.filter(function(g){return g.label.trim()||g.choices.length});
    for(var i=0;i<gs.length;i++){if(!gs[i].label.trim()){msg.textContent='Give each option group a name.';return}if(!gs[i].choices.length){msg.textContent='Add at least one choice to "'+gs[i].label+'".';return}}
    var it=ed;it.name=f.name.value.trim();it.cat=f.cat.value;it.price=Math.round(price*100)/100;it.desc=f.desc.value.trim();it.badge=f.badge.value.trim();
    it.available=f.available.checked;it.published=f.published.checked;it.featured=f.featured.checked;it.est=f.est.checked;it.images=photos.slice();it.groups=gs;
    if(!L.saveItem(it)){msg.textContent='Browser storage is full. Remove a few photos and try again.';return}
    dlg.close();toast('Saved');renderMenu();
  });

  /* ---------- orders ---------- */
  var FLOW={new:['preparing','Start preparing'],preparing:['ready','Mark ready'],ready:['done','Picked up']};
  function renderBadge(){var n=L.orders().filter(function(o){return o.status==='new'}).length,b=$('#newcount');b.hidden=!n;b.textContent=n}
  function whenTxt(o){return o.asap?'ASAP':new Date(o.pickup).toLocaleString([],{weekday:'short',hour:'numeric',minute:'2-digit'})}
  function renderOrders(){
    renderBadge();var os=L.orders(),f=$('#ofilter').value;if(f==='active')os=os.filter(function(o){return o.status==='new'||o.status==='preparing'||o.status==='ready'});
    var all=L.orders();
    $('#olist').innerHTML=os.length?os.map(function(o){var i=all.indexOf(o);
      var items=o.items.map(function(it){var mods=L.optList(it.opts);return '<div class="oi"><span class="r">'+m2(it.price*it.qty)+'</span><b>'+it.qty+' × '+esc(it.name)+'</b>'+(mods.length?'<span class="mods">'+esc(mods.join(' · '))+'</span>':'')+(it.note?'<span class="note">“'+esc(it.note)+'”</span>':'')+'</div>'}).join('');
      var next=FLOW[o.status];
      return '<article class="ocard '+o.status+'" data-n="'+esc(o.number)+'"><div class="ohead"><div><b class="num">'+esc(o.number)+'</b> · '+esc(o.customer.name)+'<br><span class="when">Pickup: '+esc(whenTxt(o))+'</span></div><span class="ostat '+o.status+'">'+(o.status==='done'?'Picked up':o.status)+'</span></div>'+
        '<div class="obody"><div>'+items+'<dl><dt>Subtotal</dt><dd>'+m2(o.sub)+'</dd><dt>Tax</dt><dd>'+m2(o.tax)+'</dd><dt>Tip</dt><dd>'+m2(o.tip)+'</dd><dt><b>Total</b></dt><dd><b>'+m2(o.total)+'</b></dd></dl></div>'+
        '<div class="ometa"><h4>Customer</h4>'+esc(o.customer.name)+'<br><a href="tel:'+esc(o.customer.phone)+'">'+esc(o.customer.phone)+'</a><br>'+esc(o.customer.email)+'<h4>Payment</h4>'+(o.pay==='card'?'Paid by card (demo)':'Pay at pickup')+(o.note?'<h4>Kitchen note</h4>'+esc(o.note):'')+
        '<div class="oflow">'+(next?'<button class="btn mini" data-o="'+o.status+'">'+next[1]+'</button>':'')+'<button class="ib" data-o="print">Print ticket</button>'+(o.status==='new'||o.status==='preparing'?'<button class="ib del" data-o="cancel">Cancel</button>':'')+'</div>'+(o.demo?'<span class="badge-demo">DEMO ORDER · no payment taken</span>':'')+'</div></div></article>';
    }).join(''):'<p class="fine">No '+(f==='active'?'active ':'')+'orders. Place a demo order on the menu page to see it here.</p>';
  }
  $('#ofilter').addEventListener('change',renderOrders);
  $('#olist').addEventListener('click',function(e){
    var b=e.target.closest('[data-o]');if(!b)return;var card=b.closest('.ocard'),os=L.orders(),o=os.filter(function(x){return x.number===card.dataset.n})[0];if(!o)return;
    var a=b.dataset.o;
    if(a==='print'){card.classList.add('printme');print();card.classList.remove('printme');return}
    if(a==='cancel'){if(!confirm('Cancel order '+o.number+'?'))return;o.status='cancelled'}else o.status=FLOW[a][0];
    L.saveOrders(os);renderOrders();toast('Order '+o.number+' is '+(o.status==='done'?'picked up':o.status))
  });
  $('#csv').addEventListener('click',function(){
    var os=L.orders();if(!os.length){toast('No orders yet',true);return}
    var rows=[['Order','Date','Status','Pickup','Name','Phone','Email','Items','Subtotal','Tax','Tip','Total','Payment']].concat(os.map(function(o){return [o.number,o.date,o.status,whenTxt(o),o.customer.name,o.customer.phone,o.customer.email,o.items.map(function(i){return i.qty+'x '+i.name+(L.optList(i.opts).length?' ('+L.optList(i.opts).join(', ')+')':'')}).join('; '),o.sub,o.tax,o.tip,o.total,o.pay]}));
    download('lutz-orders.csv','text/csv',rows.map(function(r){return r.map(csvq).join(',')}).join('\n'));
  });

  /* ---------- reports ---------- */
  function pct(a,b){if(!b)return a?'new':'';var v=(a-b)/b*100;return (v>=0?'▲ ':'▼ ')+Math.abs(Math.round(v))+'%'}
  function sums(os){var r={rev:0,n:0,units:0,tips:0};os.forEach(function(o){r.rev+=o.total;r.n++;r.tips+=o.tip;r.units+=o.items.reduce(function(a,i){return a+i.qty},0)});r.aov=r.n?r.rev/r.n:0;return r}
  function niceMax(v){if(v<=0)return 10;var p=Math.pow(10,Math.floor(Math.log10(v))),f=v/p;return (f<=1?1:f<=2?2:f<=3?3:f<=4?4:f<=5?5:10)*p}
  function barChart(bk,fmt,aria,tipf){
    var W=760,Ht=230,Lm=46,B=30,T=12,R=8,iw=W-Lm-R,ih=Ht-T-B,mx=niceMax(Math.max.apply(null,bk.map(function(b){return b.v}))),bw=iw/bk.length,g='',every=Math.ceil(bk.length/9);
    for(var k=0;k<=4;k++){var y=T+ih-ih*k/4;g+='<line x1="'+Lm+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="rgba(31,26,21,.14)"/><text x="'+(Lm-8)+'" y="'+(y+4)+'" text-anchor="end">'+fmt(mx*k/4)+'</text>'}
    bk.forEach(function(b,i){var h=ih*b.v/mx,x=Lm+i*bw+bw*.14;g+='<rect x="'+x+'" y="'+(T+ih-h)+'" width="'+(bw*.72)+'" height="'+Math.max(h,b.v?2:0)+'" rx="2" fill="#b3261e"><title>'+esc(tipf(b))+'</title></rect>';if(i%every===0)g+='<text x="'+(x+bw*.36)+'" y="'+(Ht-8)+'" text-anchor="middle">'+esc(b.l)+'</text>'});
    return '<svg class="chart" viewBox="0 0 '+W+' '+Ht+'" role="img" aria-label="'+esc(aria)+'">'+g+'</svg>';
  }
  function hbars(rows,fmt){var mx=Math.max.apply(null,rows.map(function(r){return r.v}).concat([1]));return rows.length?'<div class="hb">'+rows.map(function(r){return '<div class="hbr"><span class="hl">'+esc(r.l)+'</span><span class="hv">'+fmt(r.v)+(r.s?'<small> · '+esc(r.s)+'</small>':'')+'</span><i style="width:'+Math.max(2,r.v/mx*100)+'%"></i></div>'}).join('')+'</div>':'<p class="fine">Nothing yet.</p>'}
  var NAMES=['Jordan Reyes','Sam Whitaker','Casey Ng','Riley Boone','Morgan Tate','Alex Duarte','Jamie Cole','Taylor Pruitt','Drew Calloway','Quinn Harlan','Avery Lowe','Blake Torres'];
  function pick(a){return a[Math.floor(Math.random()*a.length)]}
  function addSample(){
    var its=L.items().filter(function(i){return i.available});if(!its.length){toast('Add menu items first',true);return}
    var s=L.settings(),os=L.orders(),n=os.reduce(function(m,o){return Math.max(m,parseInt(String(o.number).replace(/\D/g,''),10)||1000)},1000),out=[],H=[6,7,7,8,8,8,9,9,10,11,12,13,14];
    for(var i=0;i<70;i++){
      var day=new Date(Date.now()-Math.floor(Math.pow(Math.random(),1.2)*40)*DAY);if(!s.hours[day.getDay()]||s.hours[day.getDay()].closed)continue;
      day.setHours(pick(H),Math.floor(Math.random()*60),0,0);if(day>new Date())continue;
      var items=[],k=1+Math.floor(Math.random()*3);
      for(var j=0;j<k;j++){var it=pick(its),o={};(it.groups||[]).forEach(function(g){var c=g.choices;if(g.type==='multi'){if(Math.random()<.3)o[g.label]=[pick(c).n]}else if(g.required||Math.random()<.25)o[g.label]=pick(c).n});
        items.push({id:it.id,name:it.name,cat:it.cat,opts:o,note:'',qty:Math.random()<.15?2:1,price:L.unit(it,o)})}
      var sub=items.reduce(function(a,x){return a+x.price*x.qty},0),tip=Math.round(sub*pick([0,0,10,15,15,20]))/100,tax=Math.round(sub*s.taxRate)/100,nm=pick(NAMES),old=Date.now()-day>3*3600e3;
      out.push({number:'LC-'+(++n),date:day.toISOString(),status:Math.random()<.04?'cancelled':old?'done':'new',pickup:new Date(+day+20*60000).toISOString(),asap:Math.random()<.7,customer:{name:nm,phone:'(813) 555-0100',email:nm.split(' ')[0].toLowerCase()+'@example.com'},note:'',items:items,sub:sub,tax:tax,tip:tip,total:sub+tax+tip,pay:Math.random()<.5?'card':'store',demo:true,sample:true});
    }
    L.saveOrders(out.concat(os).sort(function(a,b){return new Date(b.date)-new Date(a.date)}));toast('Added '+out.length+' sample orders');renderReports();renderBadge();
  }
  function renderReports(){
    var days=+$('#range').value,all=L.orders(),cut=days?dayStart(Date.now())-(days-1)*DAY:0,body=$('#repbody');
    var live=all.filter(function(o){return o.status!=='cancelled'}),cur=live.filter(function(o){return new Date(o.date)>=cut}),prev=days?live.filter(function(o){var t=+new Date(o.date);return t<cut&&t>=cut-days*DAY}):[];
    if(!all.length){body.innerHTML='<div class="rep-card" style="text-align:center"><p style="margin-bottom:14px">No orders yet, so there is nothing to report. Place a demo order on the menu page, or load sample orders to see how the reports look.</p><button class="btn" id="loadsample" type="button">Load sample orders</button></div>';return}
    var c=sums(cur),p=sums(prev),items={},cat={},addon={},asap=0,card=0;
    cur.forEach(function(o){if(o.asap)asap++;if(o.pay==='card')card++;o.items.forEach(function(i){var r=items[i.id]||(items[i.id]={name:i.name,q:0,rev:0});r.q+=i.qty;r.rev+=i.qty*i.price;cat[i.cat]=(cat[i.cat]||0)+i.qty*i.price;
      var it=L.item(i.id);(it&&it.groups||[]).forEach(function(g){var sel=i.opts&&i.opts[g.label];(Array.isArray(sel)?sel:(sel?[sel]:[])).forEach(function(nm){var ch=g.choices.filter(function(x){return x.n===nm})[0];if(!ch||g.required&&g.type==='single'&&!ch.p&&g.label!=='Add-ons')return;if(!ch.p&&g.required)return;var k=g.label+': '+nm,r2=addon[k]||(addon[k]={q:0,rev:0});r2.q+=i.qty;r2.rev+=i.qty*(ch.p||0)})})})});
    // buckets by day (or week)
    var end=dayStart(Date.now()),first=days?end-(days-1)*DAY:Math.min.apply(null,cur.map(function(o){return dayStart(new Date(o.date))}).concat([end])),span=Math.round((end-first)/DAY)+1,step=span>45?7:1,bk=[];
    for(var t=first;t<=end;t+=step*DAY)bk.push({t:t,v:0,n:0,l:new Date(t).toLocaleDateString([],{month:'short',day:'numeric'})});
    cur.forEach(function(o){var i=Math.min(bk.length-1,Math.floor((dayStart(new Date(o.date))-first)/DAY/step));if(i>=0){bk[i].v+=o.total;bk[i].n++}});
    var hr=[];for(var h=5;h<=15;h++)hr.push({v:0,n:0,l:((h+11)%12+1)+(h>=12?'p':'a')});
    cur.forEach(function(o){var h=new Date(o.date).getHours(),b=hr[Math.max(0,Math.min(hr.length-1,h-5))];b.v+=o.total;b.n++});
    var top=Object.keys(items).map(function(k){return items[k]}).sort(function(a,b){return b.q-a.q}).slice(0,8);
    var ads=Object.keys(addon).map(function(k){return {l:k,q:addon[k].q,v:addon[k].q,rev:addon[k].rev}}).sort(function(a,b){return b.q-a.q}).slice(0,8);
    var addRev=ads.reduce(function(a,x){return a+x.rev},0),hasS=all.some(function(o){return o.sample});
    function tile(l,v,dd){return '<div class="stat"><b>'+v+'</b><span>'+l+'</span>'+(days&&dd?'<em class="'+(dd.charAt(0)==='▼'?'dn':'up')+'">'+dd+' vs prior</em>':'')+'</div>'}
    body.innerHTML=(hasS?'<div class="notice">Includes <b>sample orders</b> for demonstration. <button class="btn ghost mini" id="rmsample" type="button">Remove sample orders</button></div>':'')+
      '<div class="stats">'+tile('Sales',m2(c.rev),pct(c.rev,p.rev))+tile('Orders',c.n,pct(c.n,p.n))+tile('Avg ticket',m2(c.aov),pct(c.aov,p.aov))+tile('Tips',m2(c.tips),pct(c.tips,p.tips))+tile('Items sold',c.units,pct(c.units,p.units))+tile('Pay online',c.n?Math.round(card/c.n*100)+'%':'0%','')+'</div>'+
      '<div class="rep-card"><h3>Sales by '+(step>1?'week':'day')+'</h3>'+(cur.length?barChart(bk,function(v){return '$'+Math.round(v)},'Sales by day',function(b){return b.l+': '+m2(b.v)+' from '+b.n+' orders'}):'<p class="fine">No orders in this range.</p>')+'<p class="fine">Cancelled orders are not counted.</p></div>'+
      '<div class="rep-card"><h3>Busiest hours <small class="fine">when orders come in</small></h3>'+(cur.length?barChart(hr,function(v){return '$'+Math.round(v)},'Sales by hour of day',function(b){return b.l+': '+b.n+' orders, '+m2(b.v)}):'<p class="fine">No orders in this range.</p>')+'</div>'+
      '<div class="rep-grid"><div class="rep-card"><h3>Top sellers</h3>'+hbars(top.map(function(t){return {l:t.name,v:t.q,s:m2(t.rev)}}),function(v){return v+' sold'})+'</div>'+
      '<div class="rep-card"><h3>Add-ons people love</h3>'+hbars(ads.map(function(a){return {l:a.l,v:a.q,s:a.rev?m2(a.rev):''}}),function(v){return v+' times'})+'<p class="fine" style="margin-top:12px">Paid add-ons brought in <b>'+m2(addRev)+'</b> in this range.</p></div></div>'+
      '<div class="rep-grid"><div class="rep-card"><h3>Sales by category</h3>'+hbars(Object.keys(cat).map(function(k){return {l:L.catName(k),v:cat[k]}}).sort(function(a,b){return b.v-a.v}),m2)+'</div>'+
      '<div class="rep-card"><h3>How they order</h3>'+hbars([{l:'ASAP',v:asap},{l:'Scheduled',v:c.n-asap},{l:'Pay at pickup',v:c.n-card},{l:'Paid online (demo)',v:card}],function(v){return v+' orders'})+'</div></div>'+
      (hasS?'':'<p class="fine"><button class="btn ghost mini" id="loadsample" type="button">Load sample orders</button> to preview how a busy month looks.</p>');
  }
  $('#range').addEventListener('change',renderReports);
  $('#repbody').addEventListener('click',function(e){
    if(e.target.id==='loadsample')addSample();
    if(e.target.id==='rmsample'){L.saveOrders(L.orders().filter(function(o){return !o.sample}));toast('Sample orders removed');renderReports();renderBadge()}
  });
  $('#repcsv').addEventListener('click',function(){
    var days=+$('#range').value,cut=days?dayStart(Date.now())-(days-1)*DAY:0,m={};
    L.orders().filter(function(o){return o.status!=='cancelled'&&new Date(o.date)>=cut}).forEach(function(o){o.items.forEach(function(i){var r=m[i.id]||(m[i.id]={n:i.name,q:0,rev:0});r.q+=i.qty;r.rev+=i.qty*i.price})});
    var rows=[['Item','Sold','Sales']].concat(Object.keys(m).map(function(k){return [m[k].n,m[k].q,m[k].rev.toFixed(2)]}));if(rows.length<2){toast('No sales in this range',true);return}
    download('lutz-item-sales.csv','text/csv',rows.map(function(r){return r.map(csvq).join(',')}).join('\n'));
  });

  /* ---------- events ---------- */
  function todayStr(){var t=new Date();return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2)}
  function renderEvents(){
    var TAGS=['Halloween','Fall','Thanksgiving','Music','Holiday','Community','Special'],l=L.events({all:true}),td=todayStr();
    $('#evlist').innerHTML=l.length?l.map(function(e){
      return '<div class="evrow" data-id="'+esc(e.id)+'"><label>Title<input data-f="title" value="'+esc(e.title)+'" maxlength="90"></label>'+
        '<div class="g3"><label>Date<input type="date" data-f="date" value="'+esc(e.date)+'"></label><label>Starts<input type="time" data-f="start" value="'+esc(e.start||'')+'"></label><label>Ends<input type="time" data-f="end" value="'+esc(e.end||'')+'"></label>'+
        '<label>Label<select data-f="tag">'+TAGS.concat(TAGS.indexOf(e.tag)<0&&e.tag?[e.tag]:[]).map(function(t){return '<option'+(t===e.tag?' selected':'')+'>'+esc(t)+'</option>'}).join('')+'</select></label></div>'+
        '<label>Description<textarea rows="3" data-f="desc" maxlength="400">'+esc(e.desc||'')+'</textarea></label>'+
        '<label>Small print <span style="text-transform:none;letter-spacing:0;font-weight:600">(price, ages, what to bring)</span><input data-f="note" value="'+esc(e.note||'')+'" maxlength="90"></label>'+
        '<div class="evt"><label class="chk"><input type="checkbox" data-f="published"'+(e.published?' checked':'')+'> Show on site</label>'+(e.date<td?'<span class="past">Past event · hidden</span>':'')+'<span style="flex:1"></span><button class="btn ghost mini danger" type="button" data-del>Delete</button></div></div>'}).join('')
      :'<p class="fine">No events yet. Click <b>+ Add event</b>.</p>';
  }
  $('#evlist').addEventListener('change',function(e){
    var f=e.target.dataset.f;if(!f)return;var row=e.target.closest('.evrow'),l=L.events({all:true}),ev=l.filter(function(x){return x.id===row.dataset.id})[0];if(!ev)return;
    if(f==='published')ev.published=e.target.checked;else{if(f==='title'&&!e.target.value.trim()){renderEvents();return}ev[f]=e.target.value}
    saved(L.saveEvents(l));if(f==='date')renderEvents();
  });
  $('#evlist').addEventListener('click',function(e){
    if(!e.target.matches('[data-del]'))return;var row=e.target.closest('.evrow'),l=L.events({all:true}),ev=l.filter(function(x){return x.id===row.dataset.id})[0];
    if(!ev||!confirm('Delete "'+ev.title+'"?'))return;saved(L.saveEvents(l.filter(function(x){return x!==ev&&x.id!==ev.id})));renderEvents();
  });
  $('#addev').addEventListener('click',function(){
    var l=L.events({all:true}),t=new Date();t.setDate(t.getDate()+7);
    l.push({id:'ev-'+Date.now().toString(36),title:'New event',date:t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2),start:'10:00',end:'12:00',tag:'Community',note:'',desc:'',published:true});
    saved(L.saveEvents(l));renderEvents();var r=$$('#evlist .evrow');r.length&&r[r.length-1].scrollIntoView({block:'center'});
  });

  /* ---------- photos ---------- */
  function shrink(file){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=1400,k=Math.min(1,m/Math.max(im.width,im.height)),c=d.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.onerror=rej;im.src=r.result};r.onerror=rej;r.readAsDataURL(file)})}
  function renderPhotos(){
    var l=L.gallery();
    $('#photolist').innerHTML=l.length?l.map(function(g,i){return '<div class="phrow" data-id="'+esc(g.id)+'"><img src="'+esc(g.src)+'" alt=""><div><label>Caption<input data-p="cap" value="'+esc(g.cap||'')+'" maxlength="80"></label><div class="phbtn"><button class="ib" data-p="up"'+(i?'':' disabled')+' aria-label="Move up">↑</button><button class="ib" data-p="dn"'+(i<l.length-1?'':' disabled')+' aria-label="Move down">↓</button><button class="btn ghost mini danger" data-p="rm" type="button">Delete</button></div></div></div>'}).join(''):'<p class="fine">No photos yet. Click <b>+ Add photos</b>.</p>';
  }
  $('#photoin').addEventListener('change',function(e){
    var fl=[].slice.call(e.target.files);e.target.value='';if(!fl.length)return;toast('Adding '+fl.length+' photo'+(fl.length>1?'s':'')+'…');
    Promise.all(fl.map(shrink)).then(function(srcs){var l=L.gallery();srcs.forEach(function(src,i){l.push({id:'p'+Date.now().toString(36)+i,src:src,cap:''})});saved(L.saveGallery(l));renderPhotos()}).catch(function(){toast('Could not read that photo',true)});
  });
  $('#photolist').addEventListener('change',function(e){if(e.target.dataset.p!=='cap')return;var l=L.gallery(),id=e.target.closest('.phrow').dataset.id;l.forEach(function(g){if(g.id===id)g.cap=e.target.value});saved(L.saveGallery(l))});
  $('#photolist').addEventListener('click',function(e){
    var b=e.target.closest('[data-p]');if(!b||b.tagName!=='BUTTON')return;var l=L.gallery(),id=b.closest('.phrow').dataset.id,i=l.findIndex(function(g){return g.id===id}),a=b.dataset.p;
    if(a==='up'&&i>0)l.splice(i-1,0,l.splice(i,1)[0]);if(a==='dn'&&i<l.length-1)l.splice(i+1,0,l.splice(i,1)[0]);
    if(a==='rm'){if(!confirm('Delete this photo?'))return;l.splice(i,1)}
    saved(L.saveGallery(l));renderPhotos();
  });

  /* ---------- site (theme, about, rewards) ---------- */
  var TLN={'':'No theme right now','fall':'Fall and Thanksgiving (leaves and a turkey on the train)','christmas':'Christmas (lights and presents on the train)','newyear':'New Year (fireworks)','valentines':"Valentine's Day (hearts)",'july4':'Fourth of July (fireworks and bunting)'};
  function tlRow(x){return '<div class="tlrow"><input data-t="h" placeholder="Title" value="'+esc(x.h||'')+'" maxlength="60"><textarea data-t="t" rows="2" placeholder="What happened" maxlength="240">'+esc(x.t||'')+'</textarea><button type="button" class="ib" data-t="rm" aria-label="Remove milestone">×</button></div>'}
  function renderSite(){
    var s=L.settings(),a=s.about||{},f=$('#siteform').elements;
    f.theme.value=s.theme||'auto';f.loyaltyUrl.value=s.loyaltyUrl||'';f.loyaltyText.value=s.loyaltyText||'';f.aboutTitle.value=a.title||'';f.aboutBody.value=(a.body||[]).join('\n\n');
    $('#tlist').innerHTML=(a.timeline||[]).map(tlRow).join('');
    $('#themenow').textContent='Showing on the site today: '+TLN[L.theme()];
  }
  $('#addtl').addEventListener('click',function(){$('#tlist').insertAdjacentHTML('beforeend',tlRow({}))});
  $('#tlist').addEventListener('click',function(e){if(e.target.dataset.t==='rm')e.target.closest('.tlrow').remove()});
  $('#siteform').addEventListener('submit',function(e){
    e.preventDefault();var f=e.target.elements,s=L.settings();
    s.theme=f.theme.value;s.loyaltyUrl=f.loyaltyUrl.value.trim();s.loyaltyText=f.loyaltyText.value.trim();
    s.about={title:f.aboutTitle.value.trim(),body:f.aboutBody.value.split(/\n\s*\n/).map(function(x){return x.trim()}).filter(Boolean),
      timeline:$$('#tlist .tlrow').map(function(r){return {h:$('[data-t=h]',r).value.trim(),t:$('[data-t=t]',r).value.trim()}}).filter(function(x){return x.h||x.t})};
    if(saved(L.saveSettings(s)))$('#themenow').textContent='Showing on the site today: '+TLN[L.theme()];
  });

  /* ---------- settings ---------- */
  var DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function renderSettings(){
    var s=L.settings(),f=$('#setform').elements;f.accepting.checked=s.accepting;f.prepMin.value=s.prepMin;f.taxRate.value=s.taxRate;f.breakfastEnd.value=s.breakfastEnd||'11:00';f.lunchStart.value=s.lunchStart||'11:00';$$('#lunchdays input').forEach(function(c){c.checked=(s.lunchDays||[1,2,4,5]).indexOf(+c.value)>-1});f.tips.value=s.tips.join(', ');
    $('#hoursed').innerHTML=[1,2,3,4,5,6,0].map(function(i){var h=s.hours[i];return '<div class="hr" data-d="'+i+'"><b>'+DN[i]+'</b><input type="time" data-h="o" value="'+(h.o||'07:00')+'" aria-label="'+DN[i]+' opens"><input type="time" data-h="c" value="'+(h.c||'15:00')+'" aria-label="'+DN[i]+' closes"><label class="chk"><input type="checkbox" data-h="x"'+(h.closed?' checked':'')+'> Closed</label></div>'}).join('');
    renderCats();
  }
  $('#setform').addEventListener('submit',function(e){
    e.preventDefault();var f=e.target.elements,s=L.settings();
    s.accepting=f.accepting.checked;s.prepMin=Math.max(5,parseInt(f.prepMin.value,10)||15);s.taxRate=Math.max(0,parseFloat(f.taxRate.value)||0);s.breakfastEnd=f.breakfastEnd.value||'11:00';s.lunchStart=f.lunchStart.value||'11:00';s.lunchDays=$$('#lunchdays input').filter(function(c){return c.checked}).map(function(c){return +c.value});
    var tips=f.tips.value.split(',').map(function(x){return parseFloat(x)}).filter(function(x){return !isNaN(x)&&x>=0});s.tips=tips.length?tips.slice(0,4):[0,10,15,20];
    $$('#hoursed .hr').forEach(function(r){var i=+r.dataset.d;s.hours[i]={o:$('[data-h=o]',r).value,c:$('[data-h=c]',r).value,closed:$('[data-h=x]',r).checked}});
    saved(L.saveSettings(s));
  });
  function renderCats(){
    var cs=L.cats();$('#catlist').innerHTML=cs.map(function(c,i){var n=L.items({all:true,cat:c.id}).length;return '<div class="catrow" data-i="'+i+'"><input value="'+esc(c.name)+'" data-c="name" aria-label="Category name"><select data-c="menu" aria-label="Served during" title="When can customers order this category?"><option value="all"'+((c.menu||'all')==='all'?' selected':'')+'>All day</option><option value="breakfast"'+(c.menu==='breakfast'?' selected':'')+'>Breakfast time</option><option value="lunch"'+(c.menu==='lunch'?' selected':'')+'>Lunch time</option></select><span class="n">'+n+' item'+(n===1?'':'s')+'</span><button class="ib" data-c="up"'+(i?'':' disabled')+' aria-label="Move up">↑</button><button class="ib" data-c="dn"'+(i<cs.length-1?'':' disabled')+' aria-label="Move down">↓</button><button class="ib del" data-c="rm">Delete</button></div>'}).join('')+'<div class="catrow"><input id="newcat" placeholder="New category name"><button class="btn mini" type="button" id="addcat">Add category</button></div>';
  }
  $('#catlist').addEventListener('change',function(e){if(e.target.dataset.c==='menu'){var cm=L.cats(),j=+e.target.closest('.catrow').dataset.i;cm[j].menu=e.target.value;saved(L.saveCats(cm));return}if(e.target.dataset.c!=='name')return;var cs=L.cats(),i=+e.target.closest('.catrow').dataset.i;if(!e.target.value.trim()){renderCats();return}cs[i].name=e.target.value.trim();saved(L.saveCats(cs))});
  $('#catlist').addEventListener('click',function(e){
    var cs=L.cats();
    if(e.target.id==='addcat'){var n=$('#newcat').value.trim();if(!n)return;var id=L.slug(n);while(cs.some(function(c){return c.id===id}))id+='-2';cs.push({id:id,name:n});saved(L.saveCats(cs));renderCats();return}
    var b=e.target.closest('[data-c]');if(!b||b.tagName!=='BUTTON')return;var i=+b.closest('.catrow').dataset.i,a=b.dataset.c;
    if(a==='up'&&i>0)cs.splice(i-1,0,cs.splice(i,1)[0]);if(a==='dn'&&i<cs.length-1)cs.splice(i+1,0,cs.splice(i,1)[0]);
    if(a==='rm'){if(L.items({all:true,cat:cs[i].id}).length){toast('Move or delete its items first',true);return}if(!confirm('Delete category "'+cs[i].name+'"?'))return;cs.splice(i,1)}
    saved(L.saveCats(cs));renderCats();
  });
  $('#pwform').addEventListener('submit',function(e){e.preventDefault();var f=e.target.elements;if(f.np.value!==f.np2.value){toast('Passwords do not match',true);return}L.hash(f.np.value).then(function(h){L.setPw(h);e.target.reset();toast('Password updated')})});

  /* ---------- data ---------- */
  function renderData(){var kb=L.storageKB();$('#usage').textContent='Browser storage used: '+(kb>1024?(kb/1024).toFixed(1)+' MB':kb+' KB')+' of about 5 MB';$('#usagebar').style.width=Math.min(100,kb/5000*100)+'%'}
  $('#export').addEventListener('click',function(){download('lutz-backup-'+new Date().toISOString().slice(0,10)+'.json','application/json',L.exportAll());$('#datamsg').textContent='Backup downloaded.'});
  $('#import').addEventListener('change',function(e){var fl=e.target.files[0];if(!fl)return;var r=new FileReader();r.onload=function(){try{L.importAll(r.result);$('#datamsg').textContent='Backup restored.';renderData();toast('Restored')}catch(err){$('#datamsg').textContent='That file is not a Lutz backup.'}};r.readAsText(fl);e.target.value=''});
  $('#reset').addEventListener('click',function(){if(confirm('Reset the menu to the original items from the Toast page? Your edits and photos will be removed. Orders are kept.')){L.resetMenu();renderData();$('#datamsg').textContent='Menu reset.'}});
  d.addEventListener('lc:orders',renderBadge);
})();
