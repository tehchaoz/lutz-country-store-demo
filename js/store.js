/* Lutz Country Store data layer (demo).
   Menu, orders and settings are saved in this browser's localStorage, so edits
   only show on the browser where they were made until a real backend exists.
   Menu items and prices were copied from the public Toast ordering page;
   items marked est:true have prices the owner should confirm. */
(function(){
  var K={items:'lc.items',cats:'lc.cats',settings:'lc.settings',orders:'lc.orders',cart:'lc.cart',pw:'lc.pw',events:'lc.events',gallery:'lc.gallery'};

  var CATS=[
    {id:'breakfast',menu:'breakfast',name:'Breakfast Sandwiches'},{id:'plates',menu:'breakfast',name:'Breakfast Plates'},{id:'sides',menu:'breakfast',name:'Sides and Bread'},
    {id:'soups',menu:'lunch',name:'Soups'},{id:'salads',menu:'lunch',name:'Salads'},{id:'sandwiches',menu:'lunch',name:'Lunch Sandwiches'},
    {id:'burgers',menu:'lunch',name:'Burgers'},{id:'lsides',menu:'lunch',name:'Lunch Sides'},{id:'baked',name:'Baked Goods'},
    {id:'coffee',name:'Coffee'},{id:'special',name:'Specialty Lattes'},{id:'tea',name:'Tea and Lemonade'},
    {id:'cold',name:'Water, Juice and Milk'},{id:'soda',name:'Sodas'}
  ];
  function G(label,type,req,choices,est){return {label:label,type:type,required:!!req,max:0,est:!!est,choices:choices.map(function(c){return {n:c[0],p:c[1]||0}})}}
  function sz(a){return G('Size','single',true,a)}
  var S2=function(p){return sz([['12 oz',0],['16 oz',+p||.7]])};
  var I=[];
  function add(cat,name,price,o){o=o||{};I.push({id:'',name:name,cat:cat,price:price,desc:o.d||'',images:[],available:o.out?false:true,featured:!!o.f,published:true,badge:o.b||'',groups:o.opt?[o.opt]:[],est:!!o.est})}
  // breakfast
  add('breakfast','Breakfast Sandwich Combo with Coffee',9.95,{f:1,b:'Special',est:1,d:'2 scrambled eggs on a flaky, buttery croissant with your choice of smokey bacon or sausage patty. 12 oz drip coffee included in the $9.95 special. Please show your ID at pickup.',opt:G('Meat','single',true,[['Smokey bacon',0],['Sausage patty',0]])});
  add('breakfast','Egg Kisser',9.95,{f:1});add('breakfast','Egg and Cheese Sandwich',9.95);
  add('breakfast','Bread and Meat Sandwich',7.95);add('breakfast','Bread and Cheese Sandwich',5.95);
  // plates
  add('plates','2 Eggs, Meat and Toast Plate',8.95);add('plates','Biscuits and Gravy',10.95);
  add('plates','Pastrami Hash with Eggs',12.95);add('plates','Cuban French Toast',7.95);add('plates','Cuban Pancake',7.95);add('plates','2 Eggs and Toast',7.95);
  // lunch (Toast "Lunch Weekday" menu)
  add('soups','Lutz French Onion',9.5,{d:'Slow sautéed onions cooked to perfection in melted butter, added to our rich homemade veggie stock, layered with toasted bread and topped with melted, bubbly broiled Muenster and Swiss cheeses.'});
  add('soups','New England Clam Chowda’',9.5,{out:1,d:'Tender sea clams in a creamy chowda with potatoes, topped with crispy bacon and parsley.'});
  add('soups','Grandma Blankas’ Chicken Soup',8.95,{d:'Homemade chicken soup the old-fashioned way, with fresh vegetables and chicken to make it a meal!'});
  add('salads','Caesar Salad',10.95,{d:'Fresh crisp romaine tossed in our homemade traditional Caesar dressing, with homemade croutons and freshly shaved parmesan.'});
  add('salads','Mixed Greens',10.95,{d:'Mixed fresh greens with carrots, cucumber, chickpeas and tomato, tossed in our house lemon basil dressing with a touch of local honey.'});
  add('sandwiches','Cuban Sandwich',15.95,{f:1,b:'Fan favorite',d:'Tampa! The originator of the cuban sandwich! Made the traditional way: slow roasted pork, ham, salami and pickles with a mayo mustard sauce, pressed to crisp perfection.'});
  add('sandwiches','Pastrami Sandwich',17.95,{d:'Flown in from Chicago and finished in house with dijon mustard on the bread. No need to add anything else, it is just that tender and delicious. Melted Swiss and toasted bread optional, but also delicious!'});
  add('sandwiches','Tuna',13.95,{d:'Homemade tuna salad with crisp sprouts and sliced cucumbers, served on a kaiser roll.'});
  add('sandwiches','Chicken Chimi',13.95,{d:'Fresh grilled chicken breast with chimichurri and melted muenster cheese.'});
  add('sandwiches','Chicken Salad Sandwich',13.95,{d:'Homemade freshly roasted chicken salad with mayo and pickles, served on toasted white artisan bread brushed with roasted garlic chimichurri.'});
  add('sandwiches','Grilled Cheese',11.95,{d:'Grilled cheese on white artisan bread.'});
  add('sandwiches','BLT',12.95);
  add('sandwiches','Salmon Sandwich',14.95,{out:1});
  add('burgers','Smash Burger',11.95,{f:1,b:'Fan favorite'});
  add('burgers','Rio Max',14.95,{d:'A piece of Lutz history: two fresh quarter pound beef patties smashed, with crisp lettuce, tomato, onion, pickles, melted American and Rio Max secret sauce, served on a butter toasted brioche bun.'});
  add('burgers','Patty’s Patty Melt',14.95);
  add('burgers','Build Your Own Burger',10.95,{d:'Perfectly smashed patty on a butter toasted brioche bun, with only what YOU want on it.'});
  add('lsides','Fries',5.95);add('lsides','Cole Slaw',1.95);add('lsides','Potato Salad',1.95);add('lsides','Cucumber Salad',1.95);
  add('lsides','Side Chicken Salad',2.95);add('lsides','Chicken Salad (Large Side)',5.95,{out:1});
  add('lsides','Hot Smoked Salmon Salad',3.95);add('lsides','Smoked Salmon Side',4.95,{out:1});add('lsides','Side Tuna Salad',3.95);add('lsides','Side Aioli',.75,{out:1});
  add('baked','Blueberry Muffin (Large)',5.25);add('baked','Chocolate Chip Muffin (Large)',5.25);add('baked','Banana Nut Muffin',4.95);
  add('baked','Double Chocolate Muffin',4.95,{out:1});add('baked','French Toast Muffin (Large)',5.25,{out:1});add('baked','Cream Cheese Muffin',4.95,{out:1});
  add('baked','Coffee Cake',4.5);add('baked','Pumpkin Bread',4.25);add('baked','Blondie',3.95);add('baked','Double Chocolate Chip Brownie',3.95);
  add('baked','Vegan Chocolate Chip',3.95);add('baked','Chocolate Chip Cookie',1.95,{out:1});
  add('baked','GF Chocolate Chip',3.25);add('baked','GF Blueberry Muffin',3.75);add('baked','GF Brownie with Nuts',1.25);
  // sides
  add('sides','Golden Hash Browns',4.95);add('sides','Cuban Toast, Pressed',3);add('sides','Cuban Toast, Grilled',3);
  add('sides','Croissant',3.99);add('sides','Biscuit',3.99);add('sides','Rye',2.5);add('sides','White Bread',2.5);add('sides','Wheat',2.5);add('sides','Kaiser',2.5);
  add('sides','Gluten-Free Sourdough (allergy)',2);add('sides','Gluten-Free Sourdough (preference)',2);
  add('sides','Side Eggs',4.99);add('sides','Side Bacon',3.99);add('sides','Sausage Patty',3.99);add('sides','Side Pastrami Hash',10);
  add('sides','Sausage Gravy',5.95,{opt:sz([['Small 6 oz',0],['Large 8 oz',2]])});
  // coffee
  add('coffee','Drip Coffee',2.75,{est:1,opt:sz([['12 oz',0],['16 oz',.5],['20 oz',1]])});
  add('coffee','Combo Coffee',3.75);add('coffee','Latte',5.25,{f:1,est:1,opt:S2(.7)});add('coffee','Mocha',5.25,{est:1,opt:S2(.7)});
  add('coffee','Cappuccino',4.95,{est:1,opt:S2(.7)});add('coffee','Americano',4,{est:1,opt:S2(.6)});add('coffee','Cortado',5.25);
  add('coffee','Cafe Con Leche',4.25,{est:1});add('coffee','Doppio',3.5);add('coffee','Single Shot',1.25);add('coffee','Hot Chocolate',3.5,{est:1,opt:S2(.6)});
  add('special','Pumpkin Latte',6.25,{b:'Seasonal',est:1,opt:S2(.7)});add('special','Lava Cake Latte',6.25,{b:'Seasonal',est:1,opt:S2(.7)});
  add('special','Honey Nut Cheerios Latte',6.25,{b:'Seasonal',est:1,opt:S2(.7)});
  // tea and lemonade
  add('tea','Lemonade',4,{f:1,opt:sz([['12 oz',0],['16 oz',.5],['20 oz',1]])});
  ['Apple Lemonade','Blueberry Lemonade','Hibiscus Lemonade','Lavender Lemonade','Lemonade Berry Blast','Blue Dream Lemonade'].forEach(function(n){add('tea',n,4.75)});
  add('tea','Peach Lemonade',4.75,{out:1});
  add('tea','Iced Tea',4,{est:1,opt:S2(.6)});add('tea','Hot Tea',3.75,{est:1,opt:S2(.5)});add('tea','Spiced Chai Tea',4.95,{est:1});add('tea','Caramel Apple Chai',5.5,{est:1});
  // cold
  add('cold','Bottled Water',1.5);add('cold','Orange Juice (12 oz)',3.99);add('cold','Milk',3.25);add('cold','Apple and Eve Juice',2.5);add('cold','Honest Kids Juice',1.5);
  add('cold','Chocolate Milk Box',2);add('cold','Yoo-hoo Bottle',2.99);add('cold','Yoo-hoo Can',2.5,{out:1});
  add('cold','Coconut Water (11.1 oz)',2.5);add('cold','Coconut Water (33 oz)',5.5);
  // soda
  [['Mexican Coke',3.5],['Sprite Bottle',3.5],['Fanta Bottle',3.5],['Coke Zero',2.99],['Diet Coke',2.99],['Dr Pepper',2.99],['Pepsi',2.99],['Ginger Ale',2.99],['Jarritos',2.5],
   ['Jones Root Beer',3.99],['Jones Cream Soda',3.99],['Jones Orange Cream',3.99],['Jones Green Apple',3.99],['Olipop',3.75],['Mini Olipop',2],
   ['Wild Bill’s Root Beer',3.95],['Wild Bill’s Vanilla Cream',3.95],['Wild Bill’s Black Cherry',3.95],['Wild Bill’s Rocket Pop',3.95],['Ramune Pineapple',3.5]]
   .forEach(function(x){add('soda',x[0],x[1])});

  // Add-ons, modeled on the Toast menu. Prices from real menu items (bacon, sausage, hash browns, extra shot);
  // groups flagged est:true contain prices the owner should confirm in the admin.
  var BREAD=G('Bread','single',true,[['White',0],['Wheat',0],['Rye',0],['Kaiser',0],['Croissant',1.49],['Biscuit',1.49],['Cuban toast, pressed',.5],['Gluten-free sourdough',0]],true);
  var BKADD=G('Add-ons','multi',false,[['Bacon',3.99],['Sausage patty',3.99],['Extra egg',1.5],['Cheese',1],['Golden hash browns',4.95]],true);
  var PLADD=G('Add-ons','multi',false,[['Side bacon',3.99],['Sausage patty',3.99],['Golden hash browns',4.95],['Biscuit',3.99]]);
  var TOAST=G('Toast','single',true,[['White',0],['Wheat',0],['Rye',0],['Kaiser',0],['Cuban toast',0]],true);
  var TEMP=G('Temperature','single',true,[['Hot',0],['Iced',0]]);
  var MILK=G('Milk','single',false,[['Oat milk',.75],['Almond milk',.75]],true);
  var FLAV=G('Flavor','single',false,[['Vanilla',.75],['Caramel',.75],['Hazelnut',.75]],true);
  var SHOT=G('Extras','multi',false,[['Extra shot',1.25]]);
  function by(n){return I.filter(function(x){return x.name===n})[0]}
  function pre(it,gs){it.groups=gs.concat(it.groups)}
  function post(it,gs){it.groups=it.groups.concat(gs)}
  ['Egg Kisser','Egg and Cheese Sandwich','Bread and Meat Sandwich','Bread and Cheese Sandwich'].forEach(function(n){post(by(n),[BREAD,BKADD])});
  post(by('Breakfast Sandwich Combo with Coffee'),[BKADD]);
  post(by('2 Eggs, Meat and Toast Plate'),[G('Meat','single',true,[['Bacon',0],['Sausage patty',0]]),TOAST,PLADD]);
  post(by('2 Eggs and Toast'),[TOAST,PLADD]);
  ['Biscuits and Gravy','Pastrami Hash with Eggs','Cuban French Toast','Cuban Pancake'].forEach(function(n){post(by(n),[PLADD])});
  var LSIDE=G('Add a side','multi',false,[['Fries',5.95],['Cole slaw',1.95],['Potato salad',1.95],['Cucumber salad',1.95]],true);
  var BTOP=G('Toppings','multi',false,[['Cheese',1],['Bacon',3.99],['Fried egg',1.5],['Lettuce',0],['Tomato',0],['Onion',0],['Pickles',0]],true);
  var SPROT=G('Add protein','multi',false,[['Chicken salad',2.95],['Hot smoked salmon salad',3.95],['Tuna salad',3.95]],true);
  ['Cuban Sandwich','Pastrami Sandwich','Tuna','Chicken Chimi','Chicken Salad Sandwich','Grilled Cheese','BLT','Smash Burger','Rio Max','Patty’s Patty Melt'].forEach(function(n){post(by(n),[LSIDE])});
  post(by('Build Your Own Burger'),[BTOP,LSIDE]);
  ['Caesar Salad','Mixed Greens'].forEach(function(n){post(by(n),[SPROT])});
  I.forEach(function(it){
    var n=it.name,hot=/^(Latte|Mocha|Americano|Cafe Con Leche|Spiced Chai Tea|Caramel Apple Chai)$/.test(n)||it.cat==='special';
    if(hot)pre(it,[TEMP]);
    if(/^(Latte|Mocha|Cappuccino|Cafe Con Leche|Hot Chocolate|Spiced Chai Tea|Caramel Apple Chai)$/.test(n)||it.cat==='special')post(it,[MILK]);
    if(/^(Latte|Mocha|Cappuccino|Cafe Con Leche|Hot Chocolate|Spiced Chai Tea|Caramel Apple Chai)$/.test(n)||it.cat==='special')post(it,[FLAV]);
    if(/^(Latte|Mocha|Cappuccino|Americano|Cortado|Cafe Con Leche|Drip Coffee)$/.test(n)||it.cat==='special')post(it,[SHOT]);
  });

  // Sample on-site events (made up for the demo). The owner edits these in Admin > Events.
  var EVENTS=[
    {id:'halloween-costume-party',title:'Spooky Saturday: Costume Parade and Trick-or-Treat',date:'2026-10-31',start:'10:00',end:'12:00',tag:'Halloween',note:'Free · all ages · costumes encouraged',
     desc:'Dress up and parade around the porch under the string lights. Kids get a treat bag, grown-ups get a pumpkin spice latte special, and the best costumes win a free hot chocolate.',published:true},
    {id:'fall-acoustic-morning',title:'Fall Folk Morning: Live Acoustic Music',date:'2026-11-14',start:'09:30',end:'11:30',tag:'Fall',note:'Free · seating on the porch',
     desc:'Local musicians play on the porch while you sip something warm. Try our Caramel Apple Chai and Pumpkin Latte, and grab a seat early.',published:true},
    {id:'pie-and-cider-social',title:'Friendsgiving Pie and Cider Social',date:'2026-11-21',start:'10:00',end:'13:00',tag:'Thanksgiving',note:'Pie by the slice · cider by donation',
     desc:'A cozy neighborhood get-together before Thanksgiving. Homemade pies, warm apple cider and good company. Bring a friend and say hi to the neighbors.',published:true}
  ];

  var GALLERY=[{id:'g1',src:'img/hero.jpg',cap:'The red barn out front'},{id:'g2',src:'img/mural-truck.jpg',cap:'The vintage truck and the good boy'},{id:'g3',src:'img/mural-train.jpg',cap:'The train rolling through the mural'},{id:'g4',src:'img/mural-wide.jpg',cap:'The whole mural at dusk'}];
  var DEF_HOURS=[{o:'07:00',c:'15:00'},{o:'06:15',c:'15:00'},{o:'06:15',c:'15:00'},{closed:true},{o:'06:15',c:'15:00'},{o:'06:15',c:'15:00'},{o:'07:00',c:'15:00'}]; // Sun..Sat
  var SEED_SETTINGS={taxRate:7.5,tips:[0,10,15,20],prepMin:15,accepting:true,hours:DEF_HOURS,breakfastEnd:'11:00',lunchStart:'11:00',lunchDays:[1,2,4,5],
    theme:'auto',loyaltyUrl:'https://toast.app/r/lutz-country-store-19015-us-41/order',loyaltyText:'Join the rewards program with Toast and earn a little something every time you order.',
    about:{title:'Bringing a little country back to Lutz',
      body:['Lutz Country Store and Cafe sits on US-41 in Lutz, Florida, with the idea that a good morning should not be rushed. Breakfast sandwiches, Cuban French toast, biscuits and gravy, hot coffee and cold lemonade, then a weekday lunch of soups, salads, sandwiches and burgers.','The mural out front, a red barn, a vintage truck, a golden retriever and a train rolling through, is a nod to the railroad days of the town. Grab a seat on the porch under the string lights, or order ahead and swing by the window.'],
      timeline:[{h:'The idea',t:'A little country store with a cafe counter, for the neighborhood on US-41.'},{h:'The build',t:'Neighbors watched the barn red store come together, one coat of paint at a time.'},{h:'Doors open',t:'Breakfast, coffee and cold lemonade, with a weekday lunch added to the board.'},{h:'Today',t:'Seasonal events on the porch, a regular crowd, and a counter where everybody knows your order.'}]},
    phone:'(813) 724-4515',address:'19015 US-41, Lutz, FL 33549'};

  function read(k,def){try{var v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){return def}}
  var lastErr=null;
  function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));lastErr=null;return true}catch(e){lastErr=e;return false}}
  function emit(n){document.dispatchEvent(new CustomEvent('lc:'+n))}
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function slug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'item'}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  var money2=function(n){return '$'+(Math.round(n*100)/100).toFixed(2)};
  function seedItems(){var seen={};return I.map(function(x){var it=clone(x),b=slug(x.name),id=b,n=2;while(seen[id])id=b+'-'+n++;seen[id]=1;it.id=id;return it})}
  function hhmm(s){var p=s.split(':');return (+p[0])*60+(+p[1])}
  function fmtT(min){var h=Math.floor(min/60),m=min%60,ap=h>=12?'PM':'AM';return ((h+11)%12+1)+':'+('0'+m).slice(-2)+' '+ap}

  var LC=window.LC={money2:money2,esc:esc,slug:slug,fmtT:fmtT,lastError:function(){return lastErr},
    /* settings */
    settings:function(){var s=Object.assign({},clone(SEED_SETTINGS),read(K.settings,{}));return s},
    saveSettings:function(s){var ok=write(K.settings,s);emit('settings');return ok},
    /* gallery photos */
    gallery:function(){return read(K.gallery,null)||clone(GALLERY)},
    saveGallery:function(l){var ok=write(K.gallery,l);emit('gallery');return ok},
    /* holiday theme: admin choice, or by date when set to auto */
    theme:function(now){var t=LC.settings().theme||'auto';
      if(t!=='auto')return t==='none'?'':t;
      now=now||new Date();var m=now.getMonth()+1,d=now.getDate();
      if(m===10||m===11)return 'fall';if(m===12&&d<=26)return 'christmas';return ''},
    /* events */
    events:function(opts){opts=opts||{};var l=read(K.events,null)||clone(EVENTS);
      if(!opts.all)l=l.filter(function(e){return e.published});
      if(opts.upcoming){var t=new Date(),td=t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2);l=l.filter(function(e){return e.date>=td})}
      return l.sort(function(a,b){return (a.date+(a.start||'')).localeCompare(b.date+(b.start||''))})},
    saveEvents:function(l){var ok=write(K.events,l);emit('events');return ok},
    resetEvents:function(){try{localStorage.removeItem(K.events)}catch(e){}emit('events')},
    /* time-based ordering: breakfast until breakfastEnd, lunch from lunchStart on lunchDays */
    catMenu:function(catId){var c=LC.cats().filter(function(x){return x.id===catId})[0];return (c&&c.menu)||'all'},
    menuAt:function(menu,now){
      now=now||new Date();var s=LC.settings(),m=now.getHours()*60+now.getMinutes(),dow=now.getDay();
      if(menu==='breakfast')return m<hhmm(s.breakfastEnd||'11:00');
      if(menu==='lunch')return (s.lunchDays||[1,2,4,5]).indexOf(dow)>-1&&m>=hhmm(s.lunchStart||'11:00');
      return true},
    menuNote:function(menu){var s=LC.settings(),D=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      if(menu==='breakfast')return 'Breakfast · served until '+fmtT(hhmm(s.breakfastEnd||'11:00'));
      if(menu==='lunch')return 'Lunch · from '+fmtT(hhmm(s.lunchStart||'11:00'))+' · '+(s.lunchDays||[1,2,4,5]).map(function(i){return D[i]}).join(', ');
      return ''},
    /* can the store take an online order right now? */
    orderState:function(now){
      now=now||new Date();var s=LC.settings(),st=LC.status(now),m=now.getHours()*60+now.getMinutes();
      if(!s.accepting)return {ok:false,reason:'paused',text:'Online ordering is paused right now. Give us a call at '+s.phone+'.'};
      if(!st.open)return {ok:false,reason:'closed',text:'We are closed right now. Ordering opens '+st.text.replace('Closed · opens ','')+'.'};
      if(m+s.prepMin>st.closeMin-10)return {ok:false,reason:'late',text:'Online ordering is closed for the rest of today. See you next time we are open!'};
      return {ok:true}},
    /* why an item cannot be ordered right now ('' when it can) */
    itemBlock:function(it,now){
      var o=LC.orderState(now);if(!o.ok)return o.text;
      var mn=LC.catMenu(it.cat);if(LC.menuAt(mn,now))return '';
      var s=LC.settings();return mn==='breakfast'?'Breakfast ended at '+fmtT(hhmm(s.breakfastEnd||'11:00')):(((s.lunchDays||[]).indexOf((now||new Date()).getDay())<0)?'Lunch is not served today':'Lunch starts at '+fmtT(hhmm(s.lunchStart||'11:00')))},
    /* categories */
    cats:function(){return read(K.cats,null)||clone(CATS)},
    saveCats:function(c){var ok=write(K.cats,c);emit('items');return ok},
    catName:function(id){var c=LC.cats().filter(function(x){return x.id===id})[0];return c?c.name:'Other'},
    /* items */
    items:function(opts){
      var l=read(K.items,null)||seedItems();opts=opts||{};
      if(!opts.all)l=l.filter(function(x){return x.published!==false});
      if(opts.cat)l=l.filter(function(x){return x.cat===opts.cat});
      return l;
    },
    item:function(id){return LC.items({all:true}).filter(function(x){return x.id===id})[0]},
    saveItems:function(l){var ok=write(K.items,l);emit('items');return ok},
    saveItem:function(it){
      var l=LC.items({all:true}),i=l.findIndex(function(x){return x.id===it.id});
      if(i<0){var b=slug(it.name),id=b,n=2;while(l.some(function(x){return x.id===id}))id=b+'-'+n++;it.id=id;l.push(it)}else l[i]=it;
      return LC.saveItems(l)?it:null;
    },
    deleteItem:function(id){return LC.saveItems(LC.items({all:true}).filter(function(x){return x.id!==id}))},
    resetMenu:function(){try{localStorage.removeItem(K.items);localStorage.removeItem(K.cats);}catch(e){}emit('items')},
    unit:function(it,opts){ // base price plus every selected add-on
      var p=it.price;opts=opts||{};
      (it.groups||[]).forEach(function(g){
        var sel=opts[g.label],names=Array.isArray(sel)?sel:(sel?[sel]:(g.type==='single'&&g.required&&g.choices[0]?[g.choices[0].n]:[]));
        names.forEach(function(n){var c=g.choices.filter(function(c){return c.n===n})[0];if(c)p+=c.p||0});
      });
      return Math.round(p*100)/100;
    },
    optList:function(opts){var o=[];for(var k in (opts||{})){var v=opts[k];(Array.isArray(v)?v:[v]).forEach(function(x){if(x)o.push(x)})}return o},
    fromPrice:function(it){return it.price},
    /* cart: line={k,id,opts,note,qty} */
    cart:function(){return read(K.cart,[])},
    cartLines:function(){
      return LC.cart().map(function(l){var it=LC.item(l.id);if(!it||it.published===false)return null;var u=LC.unit(it,l.opts);return {l:l,it:it,unit:u,total:u*l.qty}}).filter(Boolean);
    },
    cartCount:function(){return LC.cart().reduce(function(a,l){return a+l.qty},0)},
    addToCart:function(id,opts,note,qty){
      var it=LC.item(id);if(!it||!it.available)return false;
      opts=opts||{};var k=id+'|'+JSON.stringify(opts)+'|'+(note||''),c=LC.cart(),l=c.filter(function(x){return x.k===k})[0];
      qty=Math.max(1,qty||1);if(l)l.qty=Math.min(25,l.qty+qty);else c.push({k:k,id:id,opts:opts,note:note||'',qty:Math.min(25,qty)});
      write(K.cart,c);emit('cart');return true;
    },
    setQty:function(k,q){var c=LC.cart().map(function(l){if(l.k===k)l.qty=Math.min(25,q);return l}).filter(function(l){return l.qty>0});write(K.cart,c);emit('cart')},
    clearCart:function(){write(K.cart,[]);emit('cart')},
    totals:function(tipPct,tipFixed){
      var s=LC.settings(),sub=LC.cartLines().reduce(function(a,l){return a+l.total},0);
      var tax=Math.round(sub*s.taxRate)/100,tip=tipFixed!=null?tipFixed:Math.round(sub*(tipPct||0))/100;
      return {sub:sub,tax:tax,tip:tip,total:sub+tax+tip};
    },
    /* hours */
    hours:function(){return LC.settings().hours},
    status:function(now){
      now=now||new Date();var H=LC.hours(),d=now.getDay(),m=now.getHours()*60+now.getMinutes(),h=H[d];
      var open=h&&!h.closed&&m>=hhmm(h.o)&&m<hhmm(h.c);
      if(open)return {open:true,text:'Open now · until '+fmtT(hhmm(h.c)),closeMin:hhmm(h.c)};
      for(var i=0;i<8;i++){var dd=(d+i)%7,x=H[dd];if(!x||x.closed)continue;
        if(i===0&&m>=hhmm(x.c))continue;if(i===0&&m<hhmm(x.o))return {open:false,text:'Closed · opens today at '+fmtT(hhmm(x.o))};
        if(i>0)return {open:false,text:'Closed · opens '+(i===1?'tomorrow':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dd])+' at '+fmtT(hhmm(x.o))}}
      return {open:false,text:'Closed'};
    },
    /* pickup time slots: returns [{v,label}] first is ASAP when open */
    slots:function(now){
      now=now||new Date();var s=LC.settings(),H=s.hours,out=[],st=LC.status(now),prep=s.prepMin;
      for(var i=0;i<1&&out.length<14;i++){
        var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i),h=H[d.getDay()];if(!h||h.closed)continue;
        var o=hhmm(h.o),c=hhmm(h.c),start=o;
        if(i===0){var nm=now.getHours()*60+now.getMinutes()+prep;start=Math.max(o,Math.ceil(nm/15)*15)}
        for(var m=start;m<=c-10&&out.length<14;m+=15){
          var dt=new Date(d.getFullYear(),d.getMonth(),d.getDate(),Math.floor(m/60),m%60);
          out.push({v:dt.toISOString(),label:(i===0?'Today':i===1?'Tomorrow':dt.toLocaleDateString([], {weekday:'long'}))+' · '+fmtT(m)});
        }
        if(out.length&&i>=0&&out.length>=6)break;
      }
      return out;
    },
    /* orders */
    orders:function(){return read(K.orders,[])},
    saveOrders:function(o){write(K.orders,o);emit('orders')},
    placeOrder:function(info){
      var lines=LC.cartLines();if(!lines.length)return null;
      var t=LC.totals(info.tipPct,info.tipFixed),orders=LC.orders();
      var num='LC-'+(orders.reduce(function(m,o){return Math.max(m,parseInt(String(o.number).replace(/\D/g,''),10)||1000)},1000)+1);
      var o={number:num,date:new Date().toISOString(),status:'new',pickup:info.pickup,asap:!!info.asap,customer:info.customer,note:info.note||'',
        items:lines.map(function(l){return {id:l.it.id,name:l.it.name,cat:l.it.cat,opts:l.l.opts,note:l.l.note,qty:l.l.qty,price:l.unit}}),
        sub:t.sub,tax:t.tax,tip:t.tip,total:t.total,pay:info.pay,demo:true};
      orders.unshift(o);LC.saveOrders(orders);LC.clearCart();return o;
    },
    /* backup */
    exportAll:function(){return JSON.stringify({version:1,exported:new Date().toISOString(),items:LC.items({all:true}),cats:LC.cats(),events:LC.events({all:true}),gallery:LC.gallery(),settings:LC.settings(),orders:LC.orders()},null,2)},
    importAll:function(txt){
      var d=JSON.parse(txt);if(!d||!Array.isArray(d.items))throw new Error('bad');
      write(K.items,d.items);if(d.cats)write(K.cats,d.cats);if(d.events)write(K.events,d.events);if(d.gallery)write(K.gallery,d.gallery);if(d.settings)write(K.settings,d.settings);if(d.orders)write(K.orders,d.orders);
      emit('items');emit('settings');emit('orders');
    },
    storageKB:function(){var n=0;try{for(var k in localStorage)if(k.indexOf('lc.')===0)n+=localStorage[k].length*2}catch(e){}return Math.round(n/1024)},
    /* admin password: demo default 'Coldbrew' until changed in Settings */
    hash:function(s){
      if(!(window.crypto&&crypto.subtle))return Promise.resolve('p:'+btoa(unescape(encodeURIComponent(s))));
      return crypto.subtle.digest('SHA-256',new TextEncoder().encode('lc|'+s)).then(function(b){return [].slice.call(new Uint8Array(b)).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('')});
    },
    checkPw:function(pw){var st=read(K.pw,null);return Promise.all([LC.hash(pw),st?Promise.resolve(st):LC.hash('Coldbrew')]).then(function(r){return r[0]===r[1]})},
    setPw:function(h){write(K.pw,h)}
  };
})();
