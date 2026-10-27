(function(){
  var d=document,reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* holiday theme (admin choice or by date) */
  function applyTheme(){
    var t=window.LC?LC.theme():'';if(t)d.documentElement.setAttribute('data-theme',t);else d.documentElement.removeAttribute('data-theme');
    var fx=d.querySelector('.fx');if(fx)fx.remove();
    if(!t||reduce)return;
    fx=d.createElement('div');fx.className='fx';fx.setAttribute('aria-hidden','true');
    var ch=t==='christmas'?['❄','❅','❆']:['🍂','🍁','🍃'],h='';
    for(var i=0;i<16;i++)h+='<span style="left:'+(Math.random()*100).toFixed(1)+'%;animation-duration:'+(9+Math.random()*9).toFixed(1)+'s;animation-delay:-'+(Math.random()*14).toFixed(1)+'s;font-size:'+(14+Math.random()*14).toFixed(0)+'px">'+ch[i%ch.length]+'</span>';
    fx.innerHTML=h;d.body.appendChild(fx);
  }
  applyTheme();d.addEventListener('lc:settings',applyTheme);
  var hdr=d.querySelector('.site-header'),burger=d.querySelector('.burger');
  var hero=d.querySelector('.hero');
  function onScroll(){
    hdr.classList.toggle('solid',hero?scrollY>60:true);
    if(reduce)return;
    d.querySelectorAll('[data-par]').forEach(function(el){
      var r=el.parentElement.getBoundingClientRect();if(r.bottom<-200||r.top>innerHeight+200)return;
      el.style.transform='translate3d(0,'+((r.top+r.height/2-innerHeight/2)*parseFloat(el.dataset.par))+'px,0)';
    });
    d.querySelectorAll('.rail').forEach(function(r){
      var b=r.getBoundingClientRect(),p=1-(b.top+b.height/2)/(innerHeight+b.height);p=Math.max(0,Math.min(1,p));r.style.setProperty('--p',p.toFixed(3));if(r.classList.contains('stop')){var t=Math.min(1,p/(r.classList.contains('early')?.3:.6));r.style.setProperty('--s',(1-Math.pow(1-t,3)).toFixed(3));r.classList.toggle('halt',t>=1)}
    });
  }
  addEventListener('scroll',function(){requestAnimationFrame(onScroll)},{passive:true});onScroll();
  if(hdr&&!d.querySelector('.hero'))hdr.classList.add('solid');
  burger&&burger.addEventListener('click',function(){var o=d.body.classList.toggle('nav-open');burger.setAttribute('aria-expanded',o)});
  d.querySelectorAll('.nav a').forEach(function(a){a.addEventListener('click',function(){d.body.classList.remove('nav-open')})});

  var rvs=[].slice.call(d.querySelectorAll('.rv'));
  function reveal(){rvs=rvs.filter(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight*.92&&r.bottom>0){el.classList.add('in');return false}return true})}
  addEventListener('scroll',reveal,{passive:true});addEventListener('resize',reveal);addEventListener('load',reveal);
  reveal();setTimeout(reveal,150);setTimeout(reveal,700);

  // open now + today's hours (reads hours saved from the admin)
  function paint(){
    if(!window.LC)return;var st=LC.status(),H=LC.hours(),dow=new Date().getDay();
    d.querySelectorAll('.open-badge').forEach(function(b){b.classList.toggle('is-open',st.open);b.querySelector('.txt').textContent=st.text});
    var ul=d.querySelectorAll('.hours');
    ul.forEach(function(u){
      var names=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],order=[1,2,3,4,5,6,0];
      u.innerHTML=order.map(function(i){var h=H[i];return '<li'+(i===dow?' class="today"':'')+'><span>'+names[i]+'</span><span>'+(h.closed?'Closed':LC.fmtT(+h.o.split(':')[0]*60+ +h.o.split(':')[1])+' – '+LC.fmtT(+h.c.split(':')[0]*60+ +h.c.split(':')[1]))+'</span></li>'}).join('');
    });
  }
  paint();setInterval(paint,60000);d.addEventListener('lc:settings',paint);

  // forms (contact): post to Formspree-style endpoint when configured
  var ENDPOINTS={contact:''};
  d.querySelectorAll('form[data-form]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();var m=f.querySelector('.form-msg'),url=ENDPOINTS[f.dataset.form],btn=f.querySelector('button[type=submit]');
      if(!url){m.textContent='This form is not connected to email yet. Please call us at (813) 724-4515.';return}
      if(f.querySelector('[name=_gotcha]').value)return;
      btn.disabled=true;m.textContent='Sending…';
      fetch(url,{method:'POST',body:new FormData(f),headers:{Accept:'application/json'}}).then(function(r){if(!r.ok)throw 0;m.textContent='Thanks! We will get back to you soon.';f.reset()}).catch(function(){m.textContent='Something went wrong. Please call us instead.'}).then(function(){btn.disabled=false});
    });
  });
})();
