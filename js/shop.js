/* Storefront: menu, item picker, cart drawer, demo checkout. Needs store.js. */
(function(){
  var L=window.LC,d=document,esc=L.esc,m2=L.money2;
  function $(s,r){return (r||d).querySelector(s)}
  function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
  var bag='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
  var barn='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M6 28 L16 12 H48 L58 28 V58 H6Z" fill="#b3261e"/><path d="M6 28 L16 12 H48 L58 28" fill="none" stroke="#f7eed9" stroke-width="3" stroke-linejoin="round"/><rect x="20" y="30" width="24" height="28" fill="none" stroke="#f7eed9" stroke-width="3"/><path d="M20 30 L44 58 M44 30 L20 58" stroke="#f7eed9" stroke-width="3"/><rect x="28" y="17" width="8" height="7" fill="#f7eed9"/></svg>';
  function fromTxt(it){return (it.groups||[]).some(function(g){return g.type==='single'&&g.required&&g.choices.some(function(c){return c.p>0})})?'<small style="font-size:.7em;opacity:.7">from </small>':''}

  /* ---------- toast ---------- */
  var tt;function toast(html){var t=$('#toast');if(!t){t=d.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');d.body.appendChild(t)}t.innerHTML=html;t.classList.add('on');clearTimeout(tt);tt=setTimeout(function(){t.classList.remove('on')},2400)}

  /* ---------- cart ---------- */
  function mountCart(){
    var wrap=$('.site-header .wrap');
    if(wrap&&!$('.cart-btn')){
      var b=d.createElement('button');b.className='cart-btn';b.type='button';b.setAttribute('aria-label','Open your order');
      b.innerHTML=bag+'<span class="cart-count" aria-hidden="true">0</span>';
      var bu=$('.burger',wrap);wrap.insertBefore(b,bu||null);b.addEventListener('click',openCart);
    }
    if(!$('#cart')){
      var ov=d.createElement('div');ov.className='drawer-ov';
      var a=d.createElement('aside');a.className='drawer';a.id='cart';a.setAttribute('role','dialog');a.setAttribute('aria-label','Your order');
      a.innerHTML='<div class="drawer-head"><h2>Your order</h2><button class="x" type="button" aria-label="Close order">×</button></div><div class="drawer-body" id="cartbody"></div><div class="drawer-foot" id="cartfoot"></div>';
      d.body.appendChild(ov);d.body.appendChild(a);
      ov.addEventListener('click',closeCart);$('.x',a).addEventListener('click',closeCart);
      d.addEventListener('keydown',function(e){if(e.key==='Escape')closeCart()});
      a.addEventListener('click',function(e){
        var t=e.target.closest('[data-q]');if(!t)return;var k=t.dataset.k,cur=L.cart().filter(function(l){return l.k===k})[0];if(!cur)return;
        L.setQty(k,t.dataset.q==='rm'?0:cur.qty+(t.dataset.q==='+'?1:-1));
      });
    }
  }
  function openCart(){d.body.classList.add('cart-open');var x=$('#cart .x');x&&x.focus()}
  function closeCart(){d.body.classList.remove('cart-open')}
  function optTxt(l){var o=L.optList(l.l.opts);if(l.l.note)o.push('“'+l.l.note+'”');return o.join(' · ')}
  function renderCart(){
    var n=L.cartCount();$$('.cart-count').forEach(function(c){c.textContent=n;c.classList.toggle('on',n>0)});
    var body=$('#cartbody'),foot=$('#cartfoot');if(!body)return;var lines=L.cartLines();
    if(!lines.length){body.innerHTML='<div class="empty">'+barn+'<p>Your order is empty.</p><a class="btn mini" href="menu.html">See the menu</a></div>';foot.innerHTML='';return}
    body.innerHTML=lines.map(function(l){var k=esc(l.l.k);
      return '<div class="line"><div><span class="nm">'+esc(l.it.name)+'</span>'+(optTxt(l)?'<span class="opt">'+esc(optTxt(l))+'</span>':'')+'</div><span class="lp">'+m2(l.total)+'</span>'+
        '<div class="row2"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-" data-k="'+k+'" aria-label="Fewer">−</button><span>'+l.l.qty+'</span><button type="button" data-q="+" data-k="'+k+'" aria-label="More">+</button></div><button class="rm" type="button" data-q="rm" data-k="'+k+'">Remove</button></div></div>'}).join('');
    var t=L.totals();
    foot.innerHTML='<div class="sub"><span>Subtotal</span><b>'+m2(t.sub)+'</b></div><p class="fine">Tax and tip are added at checkout. Pickup only.</p>'+(L.orderState().ok?'<a class="btn block" href="checkout.html">Checkout</a>':'<p class="form-msg err" style="margin:0 0 10px">'+esc(L.orderState().text)+'</p><span class="btn block" style="opacity:.45;pointer-events:none">Checkout unavailable</span>')+'<p class="fine demo">Demo kitchen. No real payments are taken.</p>';
  }

  /* ---------- item picker ---------- */
  var dlg,cur;
  function mountDialog(){
    if(dlg)return;dlg=d.createElement('dialog');dlg.className='opt';dlg.setAttribute('aria-labelledby','omt');
    dlg.innerHTML='<form method="dialog" id="omform"><div class="om-head"><h2 id="omt"></h2><button class="x" type="button" id="omx" aria-label="Close">×</button></div><div class="om-body" id="ombody"></div>'+
      '<div class="om-foot"><div class="qty"><button type="button" data-s="-" aria-label="Fewer">−</button><span id="omq">1</span><button type="button" data-s="+" aria-label="More">+</button></div><button class="btn" type="submit" id="omadd">Add</button></div></form>';
    d.body.appendChild(dlg);
    $('#omx').addEventListener('click',function(){dlg.close()});
    dlg.addEventListener('click',function(e){if(e.target===dlg)dlg.close()});
    $$('[data-s]',dlg).forEach(function(b){b.addEventListener('click',function(){var q=+$('#omq').textContent+(b.dataset.s==='+'?1:-1);$('#omq').textContent=Math.max(1,Math.min(25,q));upd()})});
    dlg.addEventListener('change',function(e){limit(e.target);upd()});
    $('#omform').addEventListener('submit',function(e){
      e.preventDefault();var o=picked(),q=+$('#omq').textContent,note=$('#omnote').value.trim();
      if(L.addToCart(cur.id,o,note,q)){dlg.close();renderCart();toast('Added <b>'+esc(cur.name)+'</b> · <a href="#cart" data-open>View order</a>')}
    });
    dlg.addEventListener('close',function(){d.body.classList.remove('modal-open')});
  }
  function picked(){
    var o={};(cur.groups||[]).forEach(function(g,i){
      var v=$$('input[name=g'+i+']:checked',dlg).map(function(x){return x.value}).filter(Boolean);
      if(g.type==='multi'){if(v.length)o[g.label]=v}else if(v[0])o[g.label]=v[0];
    });return o;
  }
  function limit(t){ // cap multi-select groups that set a maximum
    if(!t||t.type!=='checkbox')return;var i=+t.name.slice(1),g=cur.groups[i];if(!g||!g.max)return;
    var all=$$('input[name=g'+i+']',dlg),n=all.filter(function(x){return x.checked}).length;
    all.forEach(function(x){if(!x.checked)x.disabled=n>=g.max});
  }
  function upd(){if(cur)$('#omadd').textContent='Add to order · '+m2(L.unit(cur,picked())*(+$('#omq').textContent))}
  function openItem(id){
    var it=L.item(id);if(!it||!it.available)return;cur=it;mountDialog();$('#omt').textContent=it.name;
    var gs=(it.groups||[]).map(function(g,i){
      var multi=g.type==='multi',hint=g.required?'Required':(multi?'Optional'+(g.max?' · pick up to '+g.max:' · pick any'):'Optional');
      var rows=(!multi&&!g.required?'<label class="ch"><span><input type="radio" name="g'+i+'" value="" checked>No thanks</span></label>':'')+
        g.choices.map(function(c,j){return '<label class="ch"><span><input type="'+(multi?'checkbox':'radio')+'" name="g'+i+'" value="'+esc(c.n)+'"'+(!multi&&g.required&&!j?' checked':'')+'>'+esc(c.n)+'</span><span class="p">'+(c.p?'+'+m2(c.p):(g.required&&i===0&&!j?m2(it.price):'Included'))+'</span></label>'}).join('');
      return '<fieldset class="grp"><legend>'+esc(g.label)+' <em>'+hint+'</em></legend>'+rows+'</fieldset>';
    }).join('');
    $('#ombody').innerHTML=(it.images&&it.images[0]?'<img src="'+esc(it.images[0])+'" alt="'+esc(it.name)+'" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:8px;border:2px solid var(--ink);margin-bottom:14px">':'')+
      (it.desc?'<p class="d">'+esc(it.desc)+'</p>':'')+gs+
      '<label class="fld">Special instructions <small>(optional)</small><textarea id="omnote" maxlength="140" rows="2" placeholder="Allergies, extra crispy, no onions…"></textarea></label>';
    $('#omq').textContent='1';upd();d.body.classList.add('modal-open');dlg.showModal();
  }
  d.addEventListener('click',function(e){
    var a=e.target.closest('[data-open]');if(a){e.preventDefault();openCart();return}
    var b=e.target.closest('[data-add]');if(!b)return;
    var it=L.item(b.dataset.add);if(!it)return;
    var bl=L.itemBlock(it);if(bl){toast(esc(bl));return}
    if(it.groups&&it.groups.length){openItem(it.id)}
    else if(L.addToCart(it.id,{},'',1)){renderCart();toast('Added <b>'+esc(it.name)+'</b> · <a href="#cart" data-open>View order</a>')}
  });
  d.addEventListener('click',function(e){var c=e.target.closest('[data-custom]');if(c){e.preventDefault();var ci=L.item(c.dataset.custom),bl=ci&&L.itemBlock(ci);if(bl){toast(esc(bl));return}openItem(c.dataset.custom)}});

  /* ---------- menu page ---------- */
  var ORDER_URL='https://order.toasttab.com/online/lutz-country-store-19015-us-41';
  function row(it){
    var thumb=it.images&&it.images[0],soldout=!it.available;
    return '<div class="mi'+(thumb?' thumb':'')+(soldout?' out':'')+'">'+(thumb?'<div class="im"><img src="'+esc(thumb)+'" alt="" loading="lazy"></div>':'')+
      '<div><h3>'+esc(it.name)+(it.badge?'<span class="tg">'+esc(it.badge)+'</span>':'')+'</h3>'+(it.desc?'<p>'+esc(it.desc)+'</p>':'')+'</div>'+
      '<div class="buy"><span class="price">'+fromTxt(it)+m2(it.price)+'</span>'+(soldout?'<span class="soldtxt">Sold out today</span>':'<a class="addb" href="'+ORDER_URL+'" target="_blank" rel="noopener" aria-label="Order '+esc(it.name)+' on Toast">+</a>')+'</div></div>';
  }
  function renderMenu(){
    var root=$('#menu-root');if(!root)return;
    var q=($('#mq')&&$('#mq').value||'').trim().toLowerCase(),html='',nav='';
    L.cats().forEach(function(c){
      var its=L.items({cat:c.id}).filter(function(i){return !q||(i.name+' '+i.desc).toLowerCase().indexOf(q)>-1});
      if(!its.length)return;
      var mn=L.menuNote(c.menu||'all')||c.note||'';
      html+='<section class="mcat" id="c-'+esc(c.id)+'"><h2>'+esc(c.name)+'</h2>'+(mn?'<p class="cnote">'+esc(mn)+'</p>':'')+'<div class="mlist">'+its.map(row).join('')+'</div></section>';
      nav+='<a href="#c-'+esc(c.id)+'">'+esc(c.name)+'</a>';
    });
    root.innerHTML=html||'<div class="empty">'+barn+'<p>Nothing matches “'+esc(q)+'”.</p></div>';
    var cn=$('#catnav');if(cn){cn.innerHTML='<div class="wrap">'+nav+'</div><button type="button" class="cnb prev" aria-label="Scroll categories left" hidden>‹</button><button type="button" class="cnb next" aria-label="Scroll categories right">›</button>';navArrows(cn)}
    var st=L.status(),cl=$('#closednote');if(cl){cl.hidden=true}
    spy();
  }
  function navArrows(cn){
    var w=$('.wrap',cn),pv=$('.prev',cn),nx=$('.next',cn);
    function upd(){var max=w.scrollWidth-w.clientWidth;pv.hidden=w.scrollLeft<4;nx.hidden=max<4||w.scrollLeft>max-4}
    pv.onclick=function(){w.scrollBy({left:-w.clientWidth*.7,behavior:'smooth'})};
    nx.onclick=function(){w.scrollBy({left:w.clientWidth*.7,behavior:'smooth'})};
    w.addEventListener('scroll',upd,{passive:true});
    w.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)<Math.abs(e.deltaY)&&w.scrollWidth>w.clientWidth){var max=w.scrollWidth-w.clientWidth,n=w.scrollLeft+e.deltaY;if((e.deltaY>0&&w.scrollLeft<max)||(e.deltaY<0&&w.scrollLeft>0)){w.scrollLeft=Math.max(0,Math.min(max,n));e.preventDefault()}}},{passive:false});
    upd();setTimeout(upd,300);addEventListener('resize',upd);
  }
  var lastCat=null;
  function spy(){
    var cn=$('#catnav');if(!cn)return;var cs=$$('.mcat'),pos=scrollY+170,cur=null;
    cs.forEach(function(s){if(s.offsetTop<=pos)cur=s.id});
    $$('a',cn).forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+cur)});
    // slide only the chip bar sideways (never scrollIntoView: it fights page scrolling with a sticky bar)
    if(cur&&cur!==lastCat){lastCat=cur;var w=$('.wrap',cn),a=$('a.on',cn);
      if(w&&a)w.scrollTo({left:a.offsetLeft-(w.clientWidth-a.offsetWidth)/2,behavior:'smooth'})}
  }
  if($('#mq'))$('#mq').addEventListener('input',renderMenu);
  addEventListener('scroll',function(){requestAnimationFrame(spy)},{passive:true});

  /* ---------- events ---------- */
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function t12(v){if(!v)return '';var p=v.split(':'),h=+p[0];return ((h+11)%12+1)+(+p[1]?':'+p[1]:'')+(h>=12?' PM':' AM')}
  function renderEvents(){
    var el=$('[data-events]');if(!el)return;
    var l=L.events({upcoming:true});
    el.innerHTML=l.length?l.map(function(e,i){var p=e.date.split('-'),dt=new Date(+p[0],+p[1]-1,+p[2]);
      return '<article class="event rv'+(i?' d'+Math.min(i,3):'')+'"><div class="edate"><span class="m">'+MON[dt.getMonth()]+'</span><span class="d">'+dt.getDate()+'</span><span class="w">'+DOW[dt.getDay()].slice(0,3)+'</span></div>'+
        '<div class="ebody">'+(e.tag?'<span class="etag">'+esc(e.tag)+'</span>':'')+'<h3>'+esc(e.title)+'</h3>'+
        '<p class="etime">'+DOW[dt.getDay()]+' · '+t12(e.start)+(e.end?' – '+t12(e.end):'')+'</p>'+(e.desc?'<p>'+esc(e.desc)+'</p>':'')+(e.note?'<p class="enote">'+esc(e.note)+'</p>':'')+'</div></article>'}).join('')
      :'<p class="noev">No events on the calendar right now. Check back soon, or follow along when we post the next one.</p>';
    $$('.rv',el).forEach(function(x){x.classList.add('in')});
  }
  document.addEventListener('lc:events',renderEvents);

  /* ---------- gallery, about, loyalty ---------- */
  function renderGallery(){
    $$('[data-gallery]').forEach(function(el){
      var l=L.gallery(),n=+el.dataset.limit;if(n)l=l.slice(0,n);
      el.innerHTML=l.length?l.map(function(g,i){return '<figure class="gi rv in" style="--i:'+i+'"><button type="button" data-lb="'+esc(g.id)+'" aria-label="Open photo'+(g.cap?': '+esc(g.cap):'')+'"><img src="'+esc(g.src)+'" alt="'+esc(g.cap||'Photo of Lutz Country Store and Cafe')+'" loading="lazy"></button>'+(g.cap?'<figcaption>'+esc(g.cap)+'</figcaption>':'')+'</figure>'}).join(''):'<p class="noev">Photos coming soon.</p>';
    });
  }
  d.addEventListener('click',function(e){
    var b=e.target.closest('[data-lb]');if(!b)return;var g=L.gallery().filter(function(x){return x.id===b.dataset.lb})[0];if(!g)return;
    var lb=$('#lightbox');if(!lb){lb=d.createElement('dialog');lb.id='lightbox';lb.className='lightbox';lb.innerHTML='<button type="button" class="x" aria-label="Close photo">×</button><img alt=""><p></p>';d.body.appendChild(lb);lb.addEventListener('click',function(ev){if(ev.target!==$('img',lb))lb.close()})}
    $('img',lb).src=g.src;$('img',lb).alt=g.cap||'';$('p',lb).textContent=g.cap||'';lb.showModal();
  });
  function renderAbout(){
    var s=L.settings(),a=s.about||{};
    var t=$('[data-about-title]');if(t)t.textContent=a.title||'';
    var bd=$('[data-about-body]');if(bd)bd.innerHTML=(a.body||[]).map(function(p,i){return '<p class="rv in d'+Math.min(i,3)+'">'+esc(p)+'</p>'}).join('')+'<div class="hero-cta"><a class="btn" href="menu.html">See the menu</a><a class="btn ghost dark" href="visit.html">Hours and directions</a></div>';
    var tl=$('[data-timeline]');if(tl)tl.innerHTML=(a.timeline||[]).map(function(x,i){return '<li class="rv in"><span class="dot"></span><h3>'+esc(x.h)+'</h3><p>'+esc(x.t)+'</p></li>'}).join('');
    $$('[data-loyalty]').forEach(function(l){l.href=s.loyaltyUrl||'#'});
    $$('[data-loyalty-text]').forEach(function(l){l.textContent=s.loyaltyText||''});
  }
  document.addEventListener('lc:gallery',renderGallery);document.addEventListener('lc:settings',renderAbout);

  /* ---------- home featured ---------- */
  function renderFeatured(){
    var el=$('[data-featured]');if(!el)return;
    var l=L.items().filter(function(i){return i.featured&&i.available});l=l.filter(function(i){return !L.itemBlock(i)}).concat(l.filter(function(i){return L.itemBlock(i)})).slice(0,4);if(!l.length)l=L.items().filter(function(i){return i.available}).slice(0,4);
    el.innerHTML=l.map(function(it,i){
      return '<article class="dish rv'+(i?' d'+Math.min(i,3):'')+'">'+(it.badge?'<span class="badge">'+esc(it.badge)+'</span>':'')+(it.images&&it.images[0]?'<div class="photo"><img src="'+esc(it.images[0])+'" alt="'+esc(it.name)+'" loading="lazy"></div>':'')+
        '<span class="cat">'+esc(L.catName(it.cat))+'</span><h3>'+esc(it.name)+'</h3>'+(it.desc?'<p>'+esc(it.desc.length>100?it.desc.slice(0,97)+'…':it.desc)+'</p>':'<p></p>')+
        '<div class="row"><span class="price">'+fromTxt(it)+m2(it.price)+'</span>'+(L.itemBlock(it)?'<span class="soldtxt">Not available now</span>':'<button class="btn mini" type="button" data-add="'+esc(it.id)+'">Add</button>')+'</div></article>'}).join('');
  }

  /* ---------- checkout ---------- */
  function renderCheckout(){
    var root=$('#checkout-root');if(!root)return;var s=L.settings(),lines=L.cartLines();
    if(!lines.length){root.innerHTML='<div class="empty">'+barn+'<p>Your order is empty.</p><a class="btn" href="menu.html">See the menu</a></div>';return}
    if(!s.accepting){root.innerHTML='<div class="empty">'+barn+'<h2>Online ordering is paused</h2><p>We are not taking online orders right now. Give us a call at <a href="tel:8137244515"><b>'+esc(s.phone)+'</b></a>.</p></div>';return}
    var os=L.orderState();
    if(!os.ok){root.innerHTML='<div class="empty">'+barn+'<h2>We cannot take your order right now</h2><p>'+esc(os.text)+'</p><a class="btn" href="menu.html">Back to the menu</a></div>';return}
    var slots=L.slots(),st=L.status(),asapOk=true;
    root.innerHTML='<div class="demo-banner"><b>Demo checkout.</b> No real payment is taken and no food is being made. Use test card <code>4242 4242 4242 4242</code>, any future date, any 3 digits, or choose pay at pickup.</div>'+
    '<div class="co"><form id="coform" class="co-form" novalidate>'+
     '<section><h2>Who is picking up?</h2><div class="two"><label class="fld">Name<input name="name" required autocomplete="name"></label><label class="fld">Phone<input name="phone" type="tel" required autocomplete="tel"></label></div><label class="fld">Email <small>(for your receipt)</small><input name="email" type="email" required autocomplete="email"></label></section>'+
     '<section><h2>Pickup time</h2><p class="fine">Pickup at '+esc(s.address)+'. '+(asapOk?'ASAP orders are usually ready in about '+s.prepMin+'–'+(s.prepMin+5)+' minutes.':'')+'</p>'+
      '<label class="fld">When<select name="when">'+(asapOk?'<option value="asap">ASAP (about '+s.prepMin+'–'+(s.prepMin+5)+' min)</option>':'')+slots.map(function(x){return '<option value="'+esc(x.v)+'">'+esc(x.label)+'</option>'}).join('')+'</select></label>'+
      '<label class="fld">Note for the kitchen <small>(optional)</small><textarea name="note" rows="2"></textarea></label></section>'+
     '<section><h2>Tip</h2><div class="tips" id="tips">'+s.tips.map(function(p,i){return '<label><input type="radio" name="tip" value="'+p+'"'+(p===(s.tips[2]||0)?' checked':'')+'>'+(p?p+'%':'None')+'<small id="tp'+i+'"></small></label>'}).join('')+'<label><input type="radio" name="tip" value="custom">Other</label></div><label class="fld" id="customtip" hidden style="margin-top:12px">Tip amount ($)<input name="customtip" type="number" min="0" step="0.5" value="2"></label></section>'+
     '<section><h2>Payment <small class="fine" style="font-weight:600">Demo</small></h2><div class="choice"><label><input type="radio" name="pay" value="store" checked><span><b>Pay at pickup</b><small>Cash or card at the counter</small></span></label><label><input type="radio" name="pay" value="card"><span><b>Pay now with card</b><small>Demo only: test card works</small></span></label></div>'+
      '<div id="cardbox" hidden><label class="fld">Card number<input name="cc" inputmode="numeric" autocomplete="off" placeholder="4242 4242 4242 4242" maxlength="19"></label><div class="three"><label class="fld">Name on card<input name="ccname" autocomplete="off"></label><label class="fld">Expiry<input name="exp" inputmode="numeric" placeholder="MM/YY" maxlength="5" autocomplete="off"></label><label class="fld">CVC<input name="cvc" inputmode="numeric" maxlength="4" autocomplete="off"></label></div><p class="fine">Card details are never stored or sent anywhere.</p></div></section>'+
     '<p class="form-msg err" id="comsg" role="alert"></p><button class="btn block" type="submit" id="paybtn">Place demo order</button></form><aside class="co-sum" id="cosum"></aside></div>';
    var f=$('#coform');
    function tipVal(){var v=f.elements['tip'].value;return v==='custom'?{fixed:Math.max(0,parseFloat(f.elements['customtip'].value)||0)}:{pct:+v}}
    function sum(){
      var tv=tipVal(),t=L.totals(tv.pct,tv.fixed);
      $$('#tips small').forEach(function(sm,i){sm.textContent=m2(Math.round(t.sub*s.tips[i])/100)});
      $('#cosum').innerHTML='<h2>Your order</h2>'+lines.map(function(l){return '<div class="sl"><div>'+l.l.qty+' × '+esc(l.it.name)+(optTxt(l)?'<small>'+esc(optTxt(l))+'</small>':'')+'</div><b>'+m2(l.total)+'</b></div>'}).join('')+
        '<dl><dt>Subtotal</dt><dd>'+m2(t.sub)+'</dd><dt>Tax ('+s.taxRate+'%)</dt><dd>'+m2(t.tax)+'</dd><dt>Tip</dt><dd>'+m2(t.tip)+'</dd></dl><div class="tot"><span>Total</span><b>'+m2(t.total)+'</b></div><p class="fine" style="margin-top:12px"><a href="menu.html" style="text-decoration:underline">Add more items</a></p>';
    }
    f.addEventListener('change',function(){$('#customtip').hidden=f.elements['tip'].value!=='custom';$('#cardbox').hidden=f.elements['pay'].value!=='card';sum()});
    f.elements['customtip'].addEventListener('input',sum);sum();
    f.elements['cc'].addEventListener('input',function(){this.value=this.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()});
    f.elements['exp'].addEventListener('input',function(){var v=this.value.replace(/\D/g,'').slice(0,4);this.value=v.length>2?v.slice(0,2)+'/'+v.slice(2):v});
    f.elements['cvc'].addEventListener('input',function(){this.value=this.value.replace(/\D/g,'')});
    f.addEventListener('submit',function(e){
      e.preventDefault();var msg=$('#comsg');msg.textContent='';
      var els=f.elements;
      if(!els['name'].value.trim()||!els['phone'].value.trim()||!/.+@.+\..+/.test(els['email'].value)){msg.textContent='Please add your name, phone and a valid email.';return}
      var pay=els['pay'].value;
      if(pay==='card'){
        var cc=els['cc'].value.replace(/\s/g,''),ex=els['exp'].value.match(/^(\d\d)\/(\d\d)$/);
        if(cc!=='4242424242424242'){msg.textContent=cc==='4000000000000002'?'Declined (demo test card). Try 4242 4242 4242 4242.':'This is a demo. Use test card 4242 4242 4242 4242 or pay at pickup.';return}
        var now=new Date(),yy=ex&&+ex[2]+2000,mm=ex&&+ex[1];
        if(!ex||mm<1||mm>12||yy*12+mm<now.getFullYear()*12+now.getMonth()+1){msg.textContent='Enter a future expiry date like 12/34.';return}
        if(!/^\d{3,4}$/.test(els['cvc'].value)){msg.textContent='Enter the 3 digit security code.';return}
      }
      var w=els['when'].value,asap=w==='asap';
      var pt=asap?new Date(Date.now()+s.prepMin*60000):new Date(w),bad=lines.filter(function(l){return !L.menuAt(L.catMenu(l.it.cat),pt)||!l.it.available}).map(function(l){return l.it.name});
      if(bad.length){msg.textContent=bad.join(', ')+(bad.length>1?' are':' is')+' not available at that pickup time ('+L.menuNote(L.catMenu(L.item(lines.filter(function(l){return l.it.name===bad[0]})[0].it.id).cat)).split(' · ')[0]+' menu). Remove '+(bad.length>1?'them':'it')+' or pick another time.';return}
      var tv=tipVal(),btn=$('#paybtn');btn.disabled=true;btn.textContent='Sending to the kitchen…';
      setTimeout(function(){
        var pickup=asap?new Date(Date.now()+s.prepMin*60000).toISOString():w;
        var o=L.placeOrder({pickup:pickup,asap:asap,tipPct:tv.pct,tipFixed:tv.fixed,pay:pay,note:els['note'].value,customer:{name:els['name'].value.trim(),phone:els['phone'].value.trim(),email:els['email'].value.trim()}});
        renderCart();confirmView(o);
      },1000);
    });
  }
  function confirmView(o){
    var root=$('#checkout-root');scrollTo({top:0,behavior:'smooth'});var s=L.settings();
    var when=o.asap?'ASAP, about '+s.prepMin+'–'+(s.prepMin+5)+' minutes':new Date(o.pickup).toLocaleString([],{weekday:'long',hour:'numeric',minute:'2-digit'});
    root.innerHTML='<div class="confirm">'+barn+'<p class="eyebrow">Demo order placed</p><h2>Thanks, '+esc(o.customer.name.split(' ')[0])+'!</h2><p>Order <b>'+esc(o.number)+'</b>. A receipt would go to '+esc(o.customer.email)+'.</p>'+
      '<p class="bigtime">Pickup: '+esc(when)+'</p><p>'+esc(s.address)+'</p>'+
      '<div class="receipt">'+o.items.map(function(i){var ot=L.optList(i.opts);return '<div class="sl"><div>'+i.qty+' × '+esc(i.name)+(ot.length?'<small>'+esc(ot.join(' · '))+'</small>':'')+'</div><b>'+m2(i.price*i.qty)+'</b></div>'}).join('')+
      '<dl><dt>Subtotal</dt><dd>'+m2(o.sub)+'</dd><dt>Tax</dt><dd>'+m2(o.tax)+'</dd><dt>Tip</dt><dd>'+m2(o.tip)+'</dd></dl><div class="tot"><span>'+(o.pay==='card'?'Paid':'Pay at pickup')+'</span><b>'+m2(o.total)+'</b></div></div>'+
      '<p class="fine">This was a demo. No payment was taken and nothing is being cooked.</p><div class="hero-cta" style="justify-content:center"><a class="btn" href="index.html">Back home</a><button class="btn ghost" type="button" onclick="print()">Print receipt</button></div></div>';
  }

  /* ---------- boot ---------- */
  var sig0=null;
  function sig(){var o=L.orderState();return [o.ok,L.menuAt('breakfast'),L.menuAt('lunch')].join()}
  setInterval(function(){var g=sig();if(sig0!==null&&g!==sig0){renderMenu();renderFeatured();renderCart()}sig0=g},30000);sig0=sig();
  renderMenu();renderFeatured();renderEvents();renderGallery();renderAbout();renderCheckout();renderCart();
  ['cart','items','settings'].forEach(function(n){d.addEventListener('lc:'+n,renderCart)});
  addEventListener('storage',function(){renderCart();renderMenu();renderFeatured();renderEvents();renderGallery();renderAbout()});
  if(location.hash==='#cart')openCart();
})();
