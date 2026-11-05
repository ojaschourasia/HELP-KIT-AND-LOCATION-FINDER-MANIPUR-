const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdCApFwYJvgd3DqJ4bq-HyW9lANsWJt0yu3jBdDuYn0l6UaixqjFrbf-VXonRxkS8qjS7uy14YFzZ6/pub?gid=0&single=true&output=csv";



let userLoc = null;
let activeSpot = TOURIST_SPOTS[0];
let activeCat = 'hotel';
let searchTerm = '';
async function fetchSpreadsheetData() {
try {
const response = await fetch(SPREADSHEET_CSV_URL);
const csvText = await response.text();
const lines = csvText.split("\n");
const headers = lines[0].split(",");
const result = [];
for (let i = 1; i < lines.length; i++) {
if (!lines[i].trim()) continue;
const currentLine = lines[i].split(",");
const rowObject = {};
headers.forEach((header, index) => {
rowObject[header.trim()] = currentLine[index]?.trim();
});
result.push(rowObject);
}
TOURIST_SPOTS = result;
} catch (e) { console.log(e); }
}
window.addEventListener('DOMContentLoaded', fetchSpreadsheetData);

function haversine(lat1,lon1,lat2,lon2){
  const R=6371;
  const dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}
function fmtKm(km){ return km<1 ? Math.round(km*1000)+' m' : km.toFixed(1)+' km'; }
function mapsViewUrl(p){
  return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(p.n+' '+p.a)+(p.pid?('&query_place_id='+p.pid):'');
}
function mapsDirUrl(p){
  return 'https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng+(p.pid?('&destination_place_id='+p.pid):'')+'&travelmode=driving';
}
function officialWebsiteUrl(p){
  // Use a confirmed official site where we have one; otherwise fall back to a search for it
  // rather than guessing a URL — most small local places (homestays, cafés) genuinely have none.
  if(p.web) return p.web;
  return 'https://www.google.com/search?q='+encodeURIComponent(p.n+' '+p.a+' official website');
}

/* ---- opening hours / holidays (pharmacy, bank, ATM) ---- */
const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
function parseMin(t){ const m=t.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if(!m) return null; let h=+m[1]%12; if(/pm/i.test(m[3])) h+=12; return h*60+(+m[2]); }
function isBankClosedSaturday(d){ return d.getDay()===6 && [2,4].includes(Math.ceil(d.getDate()/7)); } // RBI: 2nd & 4th Saturday
function hoursInfo(p, now){
  now = now || new Date();
  if(!p.hrs) return {label:'Hours not listed', cls:'', rows:null};
  const idx=(now.getDay()+6)%7, today=p.hrs[idx];
  if(p.c==='bank' && isBankClosedSaturday(now)) return {label:'Closed today (2nd/4th Saturday)', cls:'closed', rows:p.hrs};
  if(/closed/i.test(today)) return {label:'Closed today ('+DAY_NAMES[idx]+')', cls:'closed', rows:p.hrs};
  if(/24/.test(today)) return {label:'Open 24 hours today', cls:'open', rows:p.hrs};
  const [a,b]=today.split('–').map(parseMin); const cur=now.getHours()*60+now.getMinutes();
  if(a==null||b==null) return {label:today, cls:'', rows:p.hrs};
  return (cur>=a && cur<b) ? {label:'Open now · until '+today.split('–')[1].trim(), cls:'open', rows:p.hrs}
                           : {label:(cur<a?'Opens at '+today.split('–')[0].trim():'Closed now')+' · today '+today, cls:'closed', rows:p.hrs};
}
function hoursBlock(p){
  if(!['pharmacy','bank','atm'].includes(p.c)) return '';
  const h=hoursInfo(p);
  const rows = h.rows ? DAY_NAMES.map((d,i)=>`<div style="display:flex; justify-content:space-between;"><span>${d}</span><span>${h.rows[i]}</span></div>`).join('') : '<div>Not listed — call to confirm.</div>';
  const q=encodeURIComponent('bank holidays Manipur '+new Date().toLocaleString('en-IN',{month:'long',year:'numeric'}));
  const note = p.c==='bank'
    ? `Closed on Sundays, the 2nd &amp; 4th Saturdays and public holidays. <a href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">Check this month's bank holidays</a>.`
    : p.c==='atm'
    ? 'ATMs can run out of cash or shut on holidays — keep a backup. Hours shown are as listed on Google.'
    : 'Hours are as listed on Google; some shops close on public holidays — call to confirm.';
  return `<div class="hours-box"><span class="badge ${h.cls==='open'?'verified':(h.cls==='closed'?'sponsored':'')}">🕒 ${h.label}</span>
    <details><summary>Hours &amp; holidays</summary><div class="hours-rows">${rows}</div><p>${note}</p></details></div>`;
}
function priceRangeFor(pl){
  const bands = {
    0: {tier:'Budget',      nonAC:[600,1000],  ac:[900,1500]},
    1: {tier:'Budget',      nonAC:[600,1000],  ac:[900,1500]},
    2: {tier:'Mid-range',   nonAC:[1000,1600], ac:[1600,2600]},
    3: {tier:'Comfort',     nonAC:[1800,2600], ac:[2600,4200]},
    4: {tier:'Premium',     nonAC:[3000,4500], ac:[4200,7000]},
  };
  return bands[pl] || bands[0];
}
function fmtRupee(range){ return '₹'+range[0].toLocaleString('en-IN')+'–'+range[1].toLocaleString('en-IN'); }

/* ---- Jugnoo (North-East's Ola/Rapido-style auto app) helpers ---- */
/**
 * A plain https:// link to Jugnoo, built exactly the same way the Google Maps Directions
 * link is: a normal <a href> with no JavaScript in the way. This is a deliberate change from
 * an earlier attempt that used a custom app:// / intent:// link triggered by a button's
 * onclick — those are blocked in a lot of contexts (embedded previews, iframes, some mobile
 * browsers) because they require a very strict "this came directly from a tap" condition that
 * breaks easily. A plain https link doesn't have that problem: it works the same everywhere
 * Directions does.
 *
 * HONESTY NOTE on what this can and can't promise: Jugnoo has not published an official
 * deep-link spec, so there is no confirmed, documented way to hand it a pickup/drop location.
 * This link points at Jugnoo's own real domain with best-effort location parameters attached
 * (pickup_lat/pickup_lng from this page's current location if known, drop_lat/drop_lng/
 * drop_address for the place you tapped) in case their app reads them — if Jugnoo has set up
 * Android App Links / iOS Universal Links for jugnoo.in (the same mechanism that lets a Google
 * Maps link open the Maps app instead of a browser), tapping this may open their app directly
 * and the phone may ask once whether to open it in the app or the browser. If they haven't
 * set that up, or don't read these parameters, it opens their website instead, from where the
 * app can still be downloaded or opened.
 */
function jugnooUrl(lat, lng, label){
  const params = [];
  if(userLoc){ params.push(`pickup_lat=${userLoc.lat}`, `pickup_lng=${userLoc.lng}`); }
  if(lat!=null && lng!=null){ params.push(`drop_lat=${lat}`, `drop_lng=${lng}`, `drop_address=${encodeURIComponent(label||'')}`); }
  params.push('utm_source=helpkitmanipur');
  return `https://www.jugnoo.in/?${params.join('&')}`;
}
function categoryIllustration(cat){
  const illos = {
    hotel: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="var(--accent-soft)"/>
      <rect x="30" y="55" width="140" height="45" rx="4" fill="var(--accent)"/>
      <rect x="45" y="65" width="25" height="25" fill="#fff" opacity="0.85"/>
      <rect x="87" y="65" width="25" height="25" fill="#fff" opacity="0.85"/>
      <rect x="130" y="65" width="25" height="25" fill="#fff" opacity="0.85"/>
      <rect x="90" y="90" width="20" height="10" fill="var(--accent-dark)"/>
      <circle cx="170" cy="30" r="14" fill="#ffd166"/>
      <path d="M20 100 L180 100" stroke="var(--accent-dark)" stroke-width="3"/>
    </svg>`,
    restaurant: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="var(--accent-soft)"/>
      <circle cx="100" cy="60" r="34" fill="#fff" stroke="var(--accent)" stroke-width="4"/>
      <circle cx="100" cy="60" r="18" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>
      <rect x="40" y="30" width="4" height="40" fill="var(--accent-dark)"/>
      <rect x="34" y="30" width="4" height="18" fill="var(--accent-dark)"/>
      <rect x="46" y="30" width="4" height="18" fill="var(--accent-dark)"/>
      <path d="M158 30 v18 a6 6 0 0 0 6 6 v16" stroke="var(--accent-dark)" stroke-width="4" fill="none"/>
    </svg>`,
    cafe: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="var(--accent-soft)"/>
      <rect x="70" y="55" width="55" height="40" rx="6" fill="#fff" stroke="var(--accent)" stroke-width="4"/>
      <path d="M125 62 h12 a10 10 0 0 1 0 20 h-12" fill="none" stroke="var(--accent)" stroke-width="4"/>
      <path d="M85 40 q5 -10 0 -18" stroke="var(--accent-dark)" stroke-width="3" fill="none"/>
      <path d="M100 40 q5 -10 0 -18" stroke="var(--accent-dark)" stroke-width="3" fill="none"/>
      <path d="M115 40 q5 -10 0 -18" stroke="var(--accent-dark)" stroke-width="3" fill="none"/>
    </svg>`,
    hospital: `<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="120" fill="var(--accent-soft)"/>
      <rect x="55" y="35" width="90" height="65" rx="4" fill="#fff" stroke="var(--accent)" stroke-width="4"/>
      <rect x="93" y="48" width="14" height="38" fill="var(--accent)"/>
      <rect x="81" y="60" width="38" height="14" fill="var(--accent)"/>
    </svg>`,
  };
  return illos[cat] || illos.hotel;
}
function isEveningNow(){
  const h = new Date().getHours();
  return (h>=17 || h<6);
}

/* ---------- DRAWER NAV + TAB SWITCHING ---------- */
const TAB_IDS = ['tabExplore','tabPlan','tabBus','tabFlights','tabReviews','tabSafety','tabVisitor','tabBusiness'];
const NAV_IDS = {tabExplore:'navExplore', tabPlan:'navPlan', tabBus:'navBus', tabFlights:'navFlights', tabReviews:'navReviews', tabSafety:'navSafety', tabVisitor:'navVisitor', tabBusiness:'navBusiness'};

function showTab(targetId){
  TAB_IDS.forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.style.display = (id===targetId) ? 'block' : 'none';
    const navEl = document.getElementById(NAV_IDS[id]);
    if(navEl) navEl.classList.toggle('active', id===targetId);
  });
  if(targetId==='tabPlan') renderPlan(currentPlan);
  if(targetId==='tabReviews' && !reviewsInitDone) initReviewsSystem();
  if(targetId==='tabBus' && !busRoutesInitDone) initBusRoutes();
  if(targetId==='tabSafety') refreshSafetyNearby();
  closeDrawer();
}

function openDrawer(){
  document.getElementById('drawerMenu').classList.add('open');
  document.getElementById('drawerOverlay').classList.add('open');
}
function closeDrawer(){
  document.getElementById('drawerMenu').classList.remove('open');
  document.getElementById('drawerOverlay').classList.remove('open');
}
document.getElementById('hamburgerBtn').onclick = openDrawer;
document.getElementById('drawerOverlay').onclick = closeDrawer;
document.querySelectorAll('.drawer-item[data-target]').forEach(el=>{
  el.onclick = ()=> showTab(el.getAttribute('data-target'));
});

/* ---------- CUSTOM LOCATION ---------- */
function updateLocIndicator(){
  const el = document.getElementById('locIndicator');
  if(!el) return;
  if(liveTrackingOn) el.textContent = '🟢 Live tracking';
  else el.textContent = userLoc ? 'Location on' : 'Location not set';
}
document.getElementById('customLocBtn').onclick=()=>{
  document.getElementById('customLocPanel').classList.toggle('open');
};
document.getElementById('applyCoordBtn').onclick=()=>{
  const lat=parseFloat(document.getElementById('latInput').value);
  const lng=parseFloat(document.getElementById('lngInput').value);
  const statusEl=document.getElementById('locStatus');
  if(isNaN(lat) || isNaN(lng) || lat<-90 || lat>90 || lng<-180 || lng>180){
    statusEl.textContent='⚠️ Please enter valid latitude (-90 to 90) and longitude (-180 to 180).';
    return;
  }
  userLoc = {lat, lng};
  statusEl.textContent='✅ Custom location set — distances "from you" now shown below.';
  updateLocIndicator();
  renderList();
};
let liveWatchId = null;
let liveTrackingOn = false;
let lastLiveRender = 0;

function stopLiveTracking(){
  if(liveWatchId!=null){ navigator.geolocation.clearWatch(liveWatchId); liveWatchId=null; }
  liveTrackingOn = false;
  document.getElementById('locBtn').textContent = '📍 Use my location';
  updateLocIndicator();
}
function startLiveTracking(){
  const statusEl=document.getElementById('locStatus');
  if(!navigator.geolocation){
    statusEl.textContent="Location isn't supported on this browser.";
    return;
  }
  statusEl.textContent='Requesting permission…';
  liveWatchId = navigator.geolocation.watchPosition(
    pos=>{
      userLoc={lat:pos.coords.latitude, lng:pos.coords.longitude};
      liveTrackingOn = true;
      document.getElementById('locBtn').textContent = '⏹ Stop live tracking';
      statusEl.textContent='🟢 Live tracking on — distances update automatically as you move. Nothing is stored or sent anywhere.';
      updateLocIndicator();
      // Throttle re-renders to at most once every 2s so rapid GPS updates don't hammer the DOM.
      const now = Date.now();
      if(now - lastLiveRender > 2000){
        lastLiveRender = now;
        renderList();
        if(typeof currentPlan !== 'undefined') renderPlan(currentPlan);
        if(typeof refreshSafetyNearby === 'function') refreshSafetyNearby();
      }
    },
    err=>{
      statusEl.textContent = err.code===1
        ? "Location permission not granted. You'll still see distances from the tourist spot."
        : "Couldn't get a live location fix. Try again or use 'Enter location manually'.";
      stopLiveTracking();
    },
    { enableHighAccuracy:true, maximumAge:5000, timeout:10000 }
  );
}
document.getElementById('locBtn').onclick=()=>{
  if(liveTrackingOn){ stopLiveTracking(); document.getElementById('locStatus').textContent='Live tracking stopped.'; }
  else { startLiveTracking(); }
};

/* ---------- SEARCH ---------- */
function runSearch(){
  const val = document.getElementById('searchInput').value.trim().toLowerCase();
  searchTerm = val;
  document.getElementById('searchClearBtn').style.display = val ? 'inline-flex' : 'none';
  renderList();
}
document.getElementById('searchInput').addEventListener('input', runSearch);
document.getElementById('searchInput').addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){ e.preventDefault(); runSearch(); }
});
document.getElementById('searchGoBtn').addEventListener('click', runSearch);
document.getElementById('searchClearBtn').addEventListener('click', ()=>{
  document.getElementById('searchInput').value = '';
  runSearch();
});

/* ---------- EXPLORE TAB RENDER ---------- */
function renderSpots(){
  const row = document.getElementById('spotRow');
  row.innerHTML='';
  TOURIST_SPOTS.forEach(s=>{
    const el=document.createElement('div');
    el.className='spot-chip'+(s.id===activeSpot.id?' active':'');
    el.textContent='📍 '+s.name;
    el.onclick=()=>{ activeSpot=s; renderSpots(); renderList(); };
    row.appendChild(el);
  });
  const spotSafetyKey = reviewKeyForSpot(activeSpot);
  const spotSafetyN = safetyCounts[spotSafetyKey] || 0;
  document.getElementById('spotDesc').innerHTML =
    `<b>${activeSpot.name}</b> — ${activeSpot.desc} <b style="float:right; color:var(--accent-dark)">${activeSpot.fee||''}</b>
     <div class="actions" style="margin-top:8px;"><a class="a-dir" href="${photosUrl({n:activeSpot.name,a:''})}" target="_blank" rel="noopener">📸 Photos of ${activeSpot.name}</a></div>
     ${spotSafetyN>0 ? `<div class="safety-banner" style="margin-top:8px; cursor:pointer;" onclick="goToReviewsFor('${spotSafetyKey}')">⚠️ ${spotSafetyN} recent safety report${spotSafetyN>1?'s':''} here — tap to read</div>` : ''}`;
  document.getElementById('eveningNote').style.display = isEveningNow() ? 'block' : 'none';
  renderStats();
}
function renderStats(){
  const row = document.getElementById('statsRow');
  row.innerHTML='';
  CATEGORIES.filter(c=>c.id!=='washroom').forEach(c=>{
    const nearest = PLACES.filter(p=>p.c===c.id)
      .map(p=>haversine(activeSpot.lat,activeSpot.lng,p.lat,p.lng))
      .sort((a,b)=>a-b)[0];
    const el=document.createElement('div');
    el.className='stat';
    el.innerHTML = `<b>${nearest!=null ? fmtKm(nearest) : '—'}</b><span>${c.icon} nearest ${c.label.toLowerCase()}</span>`;
    row.appendChild(el);
  });
}
function renderCats(){
  const row=document.getElementById('catRow');
  row.innerHTML='';
  CATEGORIES.forEach(c=>{
    const el=document.createElement('div');
    el.className='cat-chip'+(c.id===activeCat?' active':'');
    el.innerHTML=c.icon+' '+c.label;
    el.onclick=()=>{ activeCat=c.id; renderCats(); renderList(); };
    row.appendChild(el);
  });
}
function renderList(){
  const list=document.getElementById('list');
  const washNote=document.getElementById('washroomNote');
  list.innerHTML='';

  if(!searchTerm && activeCat==='washroom'){
    washNote.style.display='block';
    const q = 'public toilet near '+activeSpot.name+' Manipur';
    document.getElementById('washroomSearchLink').href =
      'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
    list.innerHTML = '<div class="empty">Tip: most temples, markets and lake viewpoints in Manipur have a paid or free public toilet at the entrance — ask any shopkeeper nearby, or use the live search above.</div>';
    return;
  }
  washNote.style.display='none';

  let base = searchTerm
    ? PLACES.filter(p=>p.n.toLowerCase().includes(searchTerm) || (p.tag||'').toLowerCase().includes(searchTerm))
    : PLACES.filter(p=>p.c===activeCat);

  let items = base.map(p=>{
    const dSpot = haversine(activeSpot.lat, activeSpot.lng, p.lat, p.lng);
    const dUser = userLoc ? haversine(userLoc.lat, userLoc.lng, p.lat, p.lng) : null;
    return {...p, dSpot, dUser};
  }).sort((a,b)=>((b.sponsored?1:0)-(a.sponsored?1:0)) || (a.dSpot-b.dSpot)); // paid 'Sponsored' listings first, always labelled

  if(items.length===0){
    list.innerHTML='<div class="empty">'+(searchTerm ? 'No matches for "'+searchTerm+'".' : 'No listings yet for this category near '+activeSpot.name+'.')+'</div>';
    return;
  }

  const catIcon = {hotel:'🛏️',hospital:'🏥',police:'🚓',pharmacy:'💊',bank:'🏦',atm:'🏧',cafe:'☕',restaurant:'🍽️'};
  items.forEach((p, idx)=>{
    const card=document.createElement('div');
    card.className='card';
    const priceStr = p.pl ? '₹'.repeat(p.pl) : '';
    const detailId = 'detail-'+idx;
    const placeKey = reviewKeyForPlace(p);
    const placeSafetyN = safetyCounts[placeKey] || 0;
    let priceRow = '';
    if(p.c==='hotel'){
      const pr = priceRangeFor(p.pl);
      priceRow = `<div class="price-row">
          🛌 <b>${pr.tier}</b> approx/night — Non-AC ${fmtRupee(pr.nonAC)} · AC ${fmtRupee(pr.ac)}
          <span class="price-caveat">(estimate — confirm with hotel)</span>
        </div>`;
    }
    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3>${searchTerm ? (catIcon[p.c]||'')+' ' : ''}${p.n}</h3>
          <p class="addr">${p.a}</p>
          <div class="badges">
            ${p.r!=null ? `<span class="badge rating">⭐ ${p.r} (${p.rc})</span>` : `<span class="badge">ℹ️ No public rating yet</span>`}
            ${priceStr ? `<span class="badge">${priceStr}</span>` : ''}
            ${p.verified ? `<span class="badge verified">✔ Verified</span>` : ''}${p.sponsored ? `<span class="badge sponsored">Sponsored</span>` : ''}${p.tag ? `<span class="badge">${p.tag}</span>` : ''}
          </div>
          ${placeSafetyN>0 ? `<div class="safety-banner" style="cursor:pointer; margin-top:4px;" onclick="goToReviewsFor('${placeKey}')">⚠️ ${placeSafetyN} safety report${placeSafetyN>1?'s':''} — tap to read</div>` : ''}
        </div>
        <div class="dist">
          <b>${fmtKm(p.dSpot)}</b>from ${activeSpot.name.split(' ')[0]}
          ${p.dUser!=null ? `<br><b style="margin-top:4px">${fmtKm(p.dUser)}</b>from you` : ''}
        </div>
      </div>
      ${priceRow}
      ${hoursBlock(p)}
      <div class="actions">
        <a class="a-map" href="${mapsViewUrl(p)}" target="_blank" rel="noopener">🗺️ View on Maps</a>
        <a class="a-dir" href="${mapsDirUrl(p)}" target="_blank" rel="noopener">🧭 Directions</a>
        <a class="a-dir" href="${jugnooUrl(p.lat,p.lng,p.n)}" target="_blank" rel="noopener">🛺 Jugnoo</a>
      </div>
      <div class="actions">
        <a class="a-dir" href="${officialWebsiteUrl(p)}" target="_blank" rel="noopener" style="flex:1; text-align:center;">🌐 Official Website</a>
        <button class="a-dir" onclick="togglePreview('photos-${idx}')" style="cursor:pointer;">📸 Photos</button>
      </div>
      ${photosPanel(p,'photos-'+idx)}
      <div class="actions">
        <button class="a-dir" onclick="goToReviewsFor('${placeKey}')" style="cursor:pointer; flex:1;">⭐ Read/write reviews</button>
      </div>
      ${p.ph
        ? `<div class="contact-row">
             <a class="a-call" href="tel:${p.ph.replace(/\s/g,'')}">📞 ${(p.c==='bank'||p.c==='atm') ? (p.hl?'Bank helpline':'Branch counter')+': ' : 'Call '}${p.ph}</a>
             <button class="a-copy" onclick="copyPhone('${p.ph.replace(/\s/g,'')}', this)">Copy</button>
           </div>`
        : `<div class="contact-row muted">☎️ No phone listed for this place —
             <a href="${mapsViewUrl(p)}" target="_blank" rel="noopener">check contact on Maps</a></div>`
      }
    `;
    list.appendChild(card);
  });
}
function copyPhone(num, btn){
  const done=()=>{ const old=btn.textContent; btn.textContent='Copied ✓'; setTimeout(()=>btn.textContent=old,1500); };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(num).then(done).catch(()=>{ btn.textContent='Tap & hold number'; });
  } else {
    btn.textContent='Tap & hold number';
  }
}
function photosUrl(p){ return 'https://www.google.com/search?tbm=isch&q='+encodeURIComponent(p.n+' '+(p.a||'')+' Manipur'); }
function photosPanel(p, id){
  const own = (p.photos&&p.photos.length) ? '<div class="photo-strip">'+p.photos.map(u=>`<img src="${u}" alt="${p.n}" loading="lazy">`).join('')+'</div>' : '';
  return `<div class="preview-box" id="${id}" style="display:none; text-align:left;">
    ${own}
    <p style="margin:0 0 8px;">Real, current photos of <b>${p.n}</b> are on Google. This site doesn't copy other people's photos.</p>
    <div class="actions">
      <a class="a-map" href="${mapsViewUrl(p)}" target="_blank" rel="noopener">📍 Photos on Google Maps</a>
      <a class="a-dir" href="${photosUrl(p)}" target="_blank" rel="noopener">🖼️ Google Images</a>
    </div></div>`;
}
function togglePreview(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = (el.style.display==='none' || !el.style.display) ? 'block' : 'none';
}

/* ---------- 5-DAY PLAN RENDER ---------- */
let currentPlan = ITINERARY;

function renderSpotChecks(){
  const grid = document.getElementById('spotCheckGrid');
  grid.innerHTML='';
  TOURIST_SPOTS.forEach(s=>{
    const id='chk_'+s.id;
    const wrap=document.createElement('label');
    wrap.className='spot-check';
    wrap.innerHTML = `<input type="checkbox" id="${id}" ${NON_TOURIST_IDS.includes(s.id)?'':'checked'} value="${s.id}"> ${s.name}`;
    grid.appendChild(wrap);
  });
}
function orderByProximity(spots){
  if(spots.length<=1) return [...spots];
  let remaining=[...spots];
  let route=[remaining.shift()];
  while(remaining.length){
    const last=route[route.length-1];
    let nearestIdx=0, nearestD=Infinity;
    remaining.forEach((s,i)=>{
      const d=haversine(last.lat,last.lng,s.lat,s.lng);
      if(d<nearestD){nearestD=d; nearestIdx=i;}
    });
    route.push(remaining.splice(nearestIdx,1)[0]);
  }
  return route;
}
function timeForIndex(i, count){
  if(count<=1) return '9:00 AM';
  const startH=8.5, endH=16.5;
  const h = startH + i*((endH-startH)/(count-1));
  let hour = Math.floor(h);
  const min = Math.round((h-hour)*60);
  const ampm = hour>=12 ? 'PM' : 'AM';
  let hr12 = hour%12; if(hr12===0) hr12=12;
  return hr12+':'+String(min).padStart(2,'0')+' '+ampm;
}
function buildCustomPlan(days, spotIds){
  const chosen = TOURIST_SPOTS.filter(s=>spotIds.includes(s.id));
  if(chosen.length===0) return [];
  const route = orderByProximity(chosen);
  const plan=[];
  const perDay = Math.max(1, Math.ceil(route.length/days));
  let idx=0, dayNum=0;
  while(idx < route.length && dayNum < days){
    const chunk = route.slice(idx, idx+perDay);
    idx += perDay; dayNum++;
    plan.push({
      title: chunk.map(s=>s.name.split(' (')[0]).join(' + '),
      stops: chunk.map((s,i)=>({ id:s.id, time:timeForIndex(i, chunk.length), note:s.desc }))
    });
  }
  // If user asked for more days than we had stops for, add relaxed/buffer days
  while(dayNum < days){
    dayNum++;
    const lastSpotId = plan.length ? plan[plan.length-1].stops.slice(-1)[0].id : chosen[0].id;
    plan.push({
      title:'Free / Buffer Day',
      stops:[{ id:lastSpotId, time:'Flexible', note:'No fixed sight today — great day to revisit a favourite spot, rest, or explore local markets and cafés at your own pace.' }]
    });
  }
  return plan;
}
document.getElementById('generatePlanBtn').onclick=()=>{
  const days = Math.max(1, Math.min(10, parseInt(document.getElementById('dayCountInput').value)||5));
  const spotIds = TOURIST_SPOTS.map(s=>s.id).filter(id=>document.getElementById('chk_'+id).checked);
  if(spotIds.length===0){
    alert('Pick at least one place to visit.');
    return;
  }
  currentPlan = buildCustomPlan(days, spotIds);
  renderPlan(currentPlan);
};
document.getElementById('resetPlanBtn').onclick=()=>{
  currentPlan = ITINERARY;
  document.getElementById('dayCountInput').value = 5;
  TOURIST_SPOTS.forEach(s=>document.getElementById('chk_'+s.id).checked=!NON_TOURIST_IDS.includes(s.id));
  renderPlan(currentPlan);
};

function spotById(id){ return TOURIST_SPOTS.find(s=>s.id===id); }
function nearestHotels(lat,lng,n){
  return PLACES.filter(p=>p.c==='hotel')
    .map(p=>({...p, d:haversine(lat,lng,p.lat,p.lng)}))
    .sort((a,b)=>a.d-b.d)
    .slice(0,n);
}
function renderPlan(plan){
  plan = plan || currentPlan;
  const wrap=document.getElementById('planList');
  wrap.innerHTML='';
  if(plan.length===0){
    wrap.innerHTML='<div class="empty">No plan yet — pick some places above and tap Generate.</div>';
    return;
  }
  plan.forEach((day, idx)=>{
    const lastStop = spotById(day.stops[day.stops.length-1].id);
    const hotels = nearestHotels(lastStop.lat, lastStop.lng, 3);
    const card=document.createElement('div');
    card.className='day-card';
    card.innerHTML = `
      <div class="day-head">
        <div class="day-num">${idx+1}</div>
        <div>
          <h2>${day.title}</h2>
          <span>Day ${idx+1} of ${plan.length}</span>
        </div>
      </div>
      ${day.stops.map((st,si)=>{
        const spot=spotById(st.id);
        let segmentRow = '';
        if(si>0){
          const prevSpot = spotById(day.stops[si-1].id);
          const segKm = haversine(prevSpot.lat, prevSpot.lng, spot.lat, spot.lng);
          segmentRow = `<div class="travel-segment">↳ ${fmtKm(segKm)} from ${prevSpot.name.split(' ')[0]}
            <a class="a-copy" href="${jugnooUrl(spot.lat,spot.lng,spot.name)}" target="_blank" rel="noopener" style="margin-left:6px; text-decoration:none;">🛺 Open Jugnoo</a>
          </div>`;
        }
        return `${segmentRow}<div class="stop">
          <div class="stop-time">${st.time}</div>
          <div class="stop-body">
            <h4>${spot.name}</h4>
            <p>${st.note}</p>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving" target="_blank" rel="noopener">🧭 Directions →</a>
          </div>
        </div>`;
      }).join('')}
      <div class="night-box">
        <div class="nb-head">🌙 Sky turning dark? Night stay near ${lastStop.name.split(' ')[0]}</div>
        ${hotels.map(h=>{
          const pr = priceRangeFor(h.pl);
          return `
          <div class="night-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
            <div style="display:flex; justify-content:space-between; width:100%;">
              <span>${h.n} <span style="color:var(--muted)">(${fmtKm(h.d)} away, ⭐${h.r})</span></span>
            </div>
            <div style="font-size:0.76rem; color:var(--muted);">💰 Non-AC ${fmtRupee(pr.nonAC)} · AC ${fmtRupee(pr.ac)} <i>(est./night)</i></div>
            <div style="display:flex; gap:10px;">
              ${h.ph ? `<a href="tel:${h.ph.replace(/\s/g,'')}">📞 ${h.ph}</a>` : `<a href="${mapsViewUrl(h)}" target="_blank" rel="noopener">Contact on Maps</a>`}
              <a href="${mapsDirUrl(h)}" target="_blank" rel="noopener">Directions</a>
              <a href="${jugnooUrl(h.lat,h.lng,h.n)}" target="_blank" rel="noopener">🛺 Open Jugnoo</a>
            </div>
          </div>
        `;}).join('')}
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* ================= COMPULSORY SIGN-IN GATE ================= */
let gatePassed = false;
let gateAuthorName = '';
let gateAuthorId = null; // set only when a real signed-in account was silently detected

function showGate(pass){
  document.getElementById('signInGatePanel').style.display = pass ? 'none' : 'block';
  document.getElementById('signedInBadge').style.display = pass ? 'block' : 'none';
  document.getElementById('reviewFormPanel').style.display = pass ? 'block' : 'none';
  document.getElementById('feedbackFormPanel').style.display = pass ? 'block' : 'none';
  if(pass){ document.getElementById('signedInName').textContent = gateAuthorName || 'you'; }
  // keep the "List your business" gate in step with the same sign-in
  const bg=document.getElementById('bzGatePanel'); if(bg){
    bg.style.display = pass ? 'none' : 'block';
    document.getElementById('bzSignedIn').style.display = pass ? 'block' : 'none';
    document.getElementById('bizFormWrap').style.display = pass ? 'block' : 'none';
    if(pass) document.getElementById('bzSignedName').textContent = gateAuthorName || 'you';
  }
}

document.getElementById('signInGoogleBtn').onclick = async ()=>{
  // Try a silent account check first (no visible branding either way).
  try{
    if(window.claude && typeof window.claude.use === 'function'){
      const u = await window.claude.use('user');
      if(u){
        const me = await u.me();
        if(me && me.id && me.name){
          gateAuthorId = me.id;
          gateAuthorName = me.name;
          gatePassed = true;
          showGate(true);
          return;
        }
      }
    }
  }catch(e){ /* fall through to manual form below */ }
  document.getElementById('mobileSignInForm').style.display = 'none';
  document.getElementById('googleSignInForm').style.display = 'block';
};

document.getElementById('googleContinueBtn').onclick = ()=>{
  const name = document.getElementById('googleNameInput').value.trim();
  const email = document.getElementById('googleEmailInput').value.trim();
  const msgEl = document.getElementById('googleGateMsg');
  if(name.length<2){ msgEl.textContent='⚠️ Please enter your name.'; return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ msgEl.textContent='⚠️ Please enter a valid email address.'; return; }
  gateAuthorName = name;
  gateAuthorId = null;
  gatePassed = true;
  msgEl.textContent = '';
  showGate(true);
};

document.getElementById('signInMobileBtn').onclick = ()=>{
  document.getElementById('googleSignInForm').style.display = 'none';
  document.getElementById('mobileSignInForm').style.display = 'block';
};

document.getElementById('mobileContinueBtn').onclick = ()=>{
  const name = document.getElementById('gateNameInput').value.trim();
  const mobile = document.getElementById('gateMobileInput').value.trim().replace(/\D/g,'');
  const msgEl = document.getElementById('mobileGateMsg');
  if(name.length<2){ msgEl.textContent='⚠️ Please enter your name.'; return; }
  if(!/^\d{10}$/.test(mobile)){ msgEl.textContent='⚠️ Please enter a valid 10-digit mobile number.'; return; }
  gateAuthorName = name;
  gateAuthorId = null;
  gatePassed = true;
  msgEl.textContent = '';
  showGate(true);
};

document.getElementById('gateSignOutBtn').onclick = ()=>{
  gatePassed = false; gateAuthorName=''; gateAuthorId=null;
  document.getElementById('googleSignInForm').style.display='none';
  document.getElementById('mobileSignInForm').style.display='none';
  document.getElementById('googleNameInput').value='';
  document.getElementById('googleEmailInput').value='';
  document.getElementById('gateNameInput').value='';
  document.getElementById('gateMobileInput').value='';
  ['bzGoogleForm','bzMobileForm'].forEach(i=>{const e=document.getElementById(i); if(e) e.style.display='none';});
  ['bzGName','bzGEmail','bzMName','bzMNum'].forEach(i=>{const e=document.getElementById(i); if(e) e.value='';});
  showGate(false);
};

/* ---- Sign-in for "List your business" (shares the same signed-in state as reviews) ---- */
document.getElementById('bzGoogleBtn').onclick = async ()=>{
  try{
    if(window.claude && typeof window.claude.use==='function'){
      const u = await window.claude.use('user'); if(u){ const me = await u.me();
        if(me && me.id && me.name){ gateAuthorId=me.id; gateAuthorName=me.name; gatePassed=true; showGate(true); return; } }
    }
  }catch(e){}
  document.getElementById('bzMobileForm').style.display='none';
  document.getElementById('bzGoogleForm').style.display='block';
};
document.getElementById('bzMobileBtn').onclick = ()=>{
  document.getElementById('bzGoogleForm').style.display='none';
  document.getElementById('bzMobileForm').style.display='block';
};
document.getElementById('bzGContinue').onclick = ()=>{
  const name=document.getElementById('bzGName').value.trim(), email=document.getElementById('bzGEmail').value.trim();
  const m=document.getElementById('bzGateMsg');
  if(name.length<2){ m.textContent='⚠️ Please enter your name.'; return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ m.textContent='⚠️ Please enter a valid email address.'; return; }
  gateAuthorName=name; gateAuthorId=null; gatePassed=true; m.textContent=''; showGate(true);
};
document.getElementById('bzMContinue').onclick = ()=>{
  const name=document.getElementById('bzMName').value.trim(), num=document.getElementById('bzMNum').value.replace(/\D/g,'');
  const m=document.getElementById('bzGateMsg');
  if(name.length<2){ m.textContent='⚠️ Please enter your name.'; return; }
  if(!/^\d{10}$/.test(num)){ m.textContent='⚠️ Please enter a valid 10-digit mobile number.'; return; }
  gateAuthorName=name; gateAuthorId=null; gatePassed=true; m.textContent=''; showGate(true);
};
document.getElementById('bzSignOut').onclick = ()=>document.getElementById('gateSignOutBtn').onclick();

/* ================= BUS ROUTES TAB LOGIC ================= */
let busRoutesInitDone = false;

function fmtHours(h){
  const whole = Math.floor(h);
  const mins = Math.round((h-whole)*60);
  return mins>0 ? `${whole}h ${mins}m` : `${whole}h`;
}
function busStatusFor(departTimeStr){
  const [hh,mm] = departTimeStr.split(':').map(Number);
  const now = new Date();
  const depart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
  const diffMin = (depart - now) / 60000;
  if(diffMin < -15) return {label:'Departed', cls:'status-departed'};
  if(diffMin <= 30) return {label:'Boarding soon', cls:'status-soon'};
  return {label:'Scheduled', cls:'status-scheduled'};
}
const IMPHAL_ISBT = {lat:24.8237, lng:93.9468}; // approx. Khuman Lampak bus-stand area, used as a waiting-point reference

function nextBusOnRoute(buses, afterDepart){
  const [hh,mm] = afterDepart.split(':').map(Number);
  const afterMinutes = hh*60+mm;
  return buses
    .filter(b=>{
      const [bh,bm] = b.depart.split(':').map(Number);
      return (bh*60+bm) > afterMinutes;
    })
    .sort((a,b)=>a.depart.localeCompare(b.depart))[0] || null;
}
function nearbyWaitSpots(){
  const origin = userLoc || IMPHAL_ISBT;
  return PLACES.filter(p=>p.c==='cafe' || p.c==='hotel')
    .map(p=>({...p, d:haversine(origin.lat, origin.lng, p.lat, p.lng)}))
    .sort((a,b)=>a.d-b.d)
    .slice(0,3);
}
function missedBusPanel(to, missedBus){
  const buses = BUS_ROUTES[to] || [];
  const next = nextBusOnRoute(buses, missedBus.depart);
  const waitSpots = nearbyWaitSpots();
  return `
    <div class="night-box" style="margin-top:10px;">
      <div class="nb-head">🕒 Missed the ${missedBus.depart} ${missedBus.op}? Here's what's next</div>
      ${next
        ? `<div style="font-size:0.85rem; margin-bottom:10px;">
             <b>${next.op}</b> (${next.type}) departs <b>${next.depart}</b> — ${fmtHours(next.hours)} on the road,
             ₹${next.fare[0]}–${next.fare[1]}.
           </div>`
        : `<div style="font-size:0.85rem; margin-bottom:10px; color:var(--muted);">
             No later listed departure on this route for today — check the Manipur State Transport counter at
             Imphal ISBT for an unlisted late service, or a private operator office in Paona Bazar / Thangal
             Bazar for a same-day seat or shared taxi.
           </div>`
      }
      <div style="font-size:0.8rem; font-weight:700; margin:8px 0 6px;">☕ Nearby to wait it out${userLoc ? '' : ' (near the Imphal bus-stand area)'}:</div>
      ${waitSpots.map(p=>`
        <div class="night-item">
          <span>${p.c==='cafe'?'☕':'🛏️'} ${p.n} <span style="color:var(--muted)">(${fmtKm(p.d)})</span></span>
          <a href="${mapsDirUrl(p)}" target="_blank" rel="noopener">Directions</a>
        </div>
      `).join('')}
    </div>
  `;
}
function renderBusResults(){
  const to = document.getElementById('busTo').value;
  const wrap = document.getElementById('busResults');
  const buses = BUS_ROUTES[to] || [];
  wrap.innerHTML = `
    <div style="font-size:0.78rem; color:var(--muted); margin:14px 2px 6px;">
      Showing buses for today. Times are local and may run late in hill-road weather.
    </div>
    <h3 style="font-size:1rem; margin:10px 2px;">Imphal → ${to.split(',')[0]}</h3>
  `;
  if(buses.length===0){
    wrap.innerHTML += '<div class="empty">No listed operators on this route yet — check with a local travel agent in Imphal.</div>';
    return;
  }
  buses.forEach((b,idx)=>{
    const st = busStatusFor(b.depart);
    const panelId = 'missed-'+to.replace(/[^a-z0-9]/gi,'')+'-'+idx;
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-top">
        <div>
          <h3 style="font-size:1rem;">${b.op}</h3>
          <p class="addr">${b.type}</p>
        </div>
        <span class="badge ${st.cls}">${st.label}</span>
      </div>
      <div class="badges">
        <span class="badge">${b.depart} departs</span>
        <span class="badge">${fmtHours(b.hours)} on the road</span>
        <span class="badge">₹${b.fare[0]}–${b.fare[1]}</span>
      </div>
      ${st.label==='Departed' ? `<button class="a-dir" style="margin-top:10px; width:100%; cursor:pointer;" onclick="toggleMissedPanel('${panelId}')">Missed it?</button>` : ''}
      ${st.label==='Departed' ? `<div id="${panelId}" style="display:none;">${missedBusPanel(to, b)}</div>` : ''}
    `;
    wrap.appendChild(card);
  });
}
function toggleMissedPanel(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.style.display = (el.style.display==='none' || !el.style.display) ? 'block' : 'none';
}
function initBusRoutes(){
  busRoutesInitDone = true;
  const toSelect = document.getElementById('busTo');
  toSelect.innerHTML = Object.keys(BUS_ROUTES).map(d=>`<option value="${d}">${d}</option>`).join('');
  renderBusResults();
  document.getElementById('busSearchBtn').onclick = renderBusResults;
  renderFlights();
}
function renderFlights(){
  const wrap = document.getElementById('flightsList');
  if(!wrap || wrap.dataset.rendered) return;
  wrap.dataset.rendered = '1';
  FLIGHTS.forEach(f=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeft = '4px solid var(--accent)';
    card.innerHTML = `
      <h3>${f.name}</h3>
      <p class="addr">${f.blurb}</p>
      <a class="a-map" href="${f.url}" target="_blank" rel="noopener" style="display:block; margin-top:10px; text-align:center;">Open official site ↗</a>
    `;
    wrap.appendChild(card);
  });
}

/* ================= REVIEWS & SAFETY SYSTEM ================= */
let reviewsInitDone = false;
let dbMode = false;
let dbRef = null;
let safetyCounts = {};       // locationKey -> count of safety-flagged reviews
let unsubSafetyAll = null;
let unsubLocationReviews = null;
let currentReviewTarget = null; // {key, label}
let selectedStars = 0;

function slug(str){
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'');
}
function reviewKeyForSpot(s){ return 'spot_'+s.id; }
function reviewKeyForPlace(p){ return 'place_'+slug(p.n); }
const CAT_GROUP_LABEL = {hotel:'Hotels', hospital:'Hospitals', police:'Police Stations', pharmacy:'Pharmacies', bank:'Banks', atm:'ATMs', cafe:'Cafés', restaurant:'Restaurants'};

function buildReviewTargets(){
  const targets = TOURIST_SPOTS.map(s=>({key:reviewKeyForSpot(s), label:s.name, group:'Tourist Spots'}));
  PLACES.forEach(p=>targets.push({key:reviewKeyForPlace(p), label:p.n, group:CAT_GROUP_LABEL[p.c]||'Other'}));
  return targets;
}
const REVIEW_TARGETS = buildReviewTargets();

/* ---- localStorage fallback (used when shared db is unavailable, e.g. self-hosted copies) ---- */
function lsLoadAll(){
  try{ return JSON.parse(localStorage.getItem('hkm_reviews')||'[]'); }catch(e){ return []; }
}
function lsSaveAll(arr){
  try{ localStorage.setItem('hkm_reviews', JSON.stringify(arr)); }catch(e){}
}
function lsAdd(review){
  const all = lsLoadAll();
  review.id = 'local_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
  all.push(review);
  lsSaveAll(all);
  return review;
}
function lsForLocation(key){
  return lsLoadAll().filter(r=>r.locationKey===key).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
}
function lsSafetyCounts(){
  const counts={};
  lsLoadAll().forEach(r=>{ if(r.safety) counts[r.locationKey]=(counts[r.locationKey]||0)+1; });
  return counts;
}
function lsAddFeedback(text){
  try{
    const all = JSON.parse(localStorage.getItem('hkm_site_feedback')||'[]');
    all.push({text, createdAt:new Date().toISOString()});
    localStorage.setItem('hkm_site_feedback', JSON.stringify(all));
  }catch(e){}
}

/* ---- initialize: try shared db capability, fall back to localStorage ---- */
async function initReviewsSystem(){
  reviewsInitDone = true;
  try{
    if(window.claude && typeof window.claude.use === 'function'){
      const d = await window.claude.use('db');
      if(d){ dbRef = d; dbMode = true; }
    }
  }catch(e){ dbMode = false; }

  if(dbMode){
    try{
      unsubSafetyAll = dbRef.collection('reviews').where('safety','==',true).onSnapshot(
        snap=>{
          const counts={};
          snap.docs.forEach(doc=>{
            const data = doc.data();
            if(data && data.locationKey) counts[data.locationKey] = (counts[data.locationKey]||0)+1;
          });
          safetyCounts = counts;
          refreshSafetyUI();
        },
        ()=>{ dbMode=false; safetyCounts = lsSafetyCounts(); refreshSafetyUI(); }
      );
    }catch(e){ dbMode = false; }
  }
  if(!dbMode){
    safetyCounts = lsSafetyCounts();
  }
  renderReviewLocationSelect();
  refreshSafetyUI();
  const noteEl = document.getElementById('reviewsStorageNote');
  if(noteEl){
    noteEl.innerHTML = dbMode
      ? '🌍 Reviews and safety reports here are <b>shared</b> — everyone who opens this page sees the same list live, including yours, right after you sign in above to post.'
      : '🔒 Shared reviews aren\'t available in this copy of the page (e.g. a version hosted outside this site\'s own server), so entries are saved privately in <b>your own browser</b> only — they will reappear next time you open this site on this device, but nobody else sees them.';
  }
}

function refreshSafetyUI(){
  renderSpots();
  renderList();
}

function renderReviewLocationSelect(){
  const sel = document.getElementById('reviewLocationSelect');
  const groups = {};
  REVIEW_TARGETS.forEach(t=>{ (groups[t.group] = groups[t.group]||[]).push(t); });
  sel.innerHTML = '';
  Object.keys(groups).forEach(g=>{
    const og = document.createElement('optgroup');
    og.label = g;
    groups[g].forEach(t=>{
      const opt = document.createElement('option');
      opt.value = t.key; opt.textContent = t.label;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
  sel.onchange = ()=>{
    const t = REVIEW_TARGETS.find(x=>x.key===sel.value);
    selectReviewTarget(t);
  };
  selectReviewTarget(REVIEW_TARGETS[0]);
  sel.value = REVIEW_TARGETS[0].key;
}

function selectReviewTarget(target){
  currentReviewTarget = target;
  if(unsubLocationReviews){ unsubLocationReviews(); unsubLocationReviews=null; }
  if(dbMode){
    try{
      unsubLocationReviews = dbRef.collection('reviews').where('locationKey','==',target.key).onSnapshot(
        snap=>{
          const list = snap.docs.map(d=>({id:d.id, ...d.data()}));
          list.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
          renderReviewSummary(list);
          renderReviewsList(list);
        },
        ()=>{
          const list = lsForLocation(target.key);
          renderReviewSummary(list);
          renderReviewsList(list);
        }
      );
      return;
    }catch(e){ /* fall through to local */ }
  }
  const list = lsForLocation(target.key);
  renderReviewSummary(list);
  renderReviewsList(list);
}

function renderReviewSummary(list){
  const panel = document.getElementById('reviewSummaryPanel');
  if(list.length===0){ panel.style.display='none'; return; }
  panel.style.display='block';
  const ratings = list.filter(r=>r.rating).map(r=>r.rating);
  const avg = ratings.length ? (ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1) : '—';
  const safetyN = list.filter(r=>r.safety).length;
  panel.innerHTML = `
    <div class="summary-row">
      <b>⭐ ${avg}</b>
      <div style="font-size:0.8rem; color:var(--muted);">${list.length} review(s) for ${currentReviewTarget.label}</div>
    </div>
    ${safetyN>0 ? `<div class="safety-banner">⚠️ ${safetyN} safety report${safetyN>1?'s':''} for this location — see below</div>` : ''}
  `;
}

function renderReviewsList(list){
  const wrap = document.getElementById('reviewsList');
  wrap.innerHTML = '';
  if(list.length===0){
    wrap.innerHTML = `<div class="empty">No reviews yet for ${currentReviewTarget ? currentReviewTarget.label : 'this place'} — be the first to add one.</div>`;
    return;
  }
  list.forEach(r=>{
    const card=document.createElement('div');
    card.className = 'review-card'+(r.safety?' safety':'');
    const d = r.createdAt ? new Date(r.createdAt) : null;
    const dateStr = d ? d.toLocaleDateString() : '';
    card.innerHTML = `
      <div class="rc-meta">
        <span class="review-stars">${'★'.repeat(r.rating||0)}${'☆'.repeat(5-(r.rating||0))}</span>
        <span class="rc-date">${dateStr}</span>
      </div>
      <p style="font-size:0.75rem; color:var(--muted); margin:0 0 4px; font-weight:600;">${(r.authorName||'Traveller').replace(/</g,'&lt;')}</p>
      <p>${(r.text||'').replace(/</g,'&lt;')}</p>
      ${r.safety ? `<span class="rc-flag">⚠️ Flagged as a safety concern</span>` : ''}
    `;
    wrap.appendChild(card);
  });
}

/* Star picker */
document.getElementById('starPicker').querySelectorAll('span').forEach(star=>{
  star.onclick = ()=>{
    selectedStars = parseInt(star.dataset.v);
    document.getElementById('starPicker').querySelectorAll('span').forEach(s=>{
      s.classList.toggle('on', parseInt(s.dataset.v) <= selectedStars);
    });
  };
});

document.getElementById('submitReviewBtn').onclick = async ()=>{
  const msgEl = document.getElementById('reviewMsg');
  if(!gatePassed){ msgEl.textContent='⚠️ Please sign in above first — Google or mobile number.'; return; }
  const text = document.getElementById('reviewText').value.trim();
  const safety = document.getElementById('safetyCheck').checked;
  if(!selectedStars){ msgEl.textContent='⚠️ Please pick a star rating first.'; return; }
  if(safety && text.length<5){ msgEl.textContent='⚠️ Please describe the safety concern briefly so others understand it.'; return; }
  const payload = {
    locationKey: currentReviewTarget.key,
    locationName: currentReviewTarget.label,
    rating: selectedStars,
    text,
    safety,
    authorName: gateAuthorName || 'Traveller',
    authorId: gateAuthorId || null,
    createdAt: new Date().toISOString(),
  };
  msgEl.textContent = 'Posting…';
  if(dbMode){
    try{
      await dbRef.collection('reviews').add(payload);
      msgEl.textContent = '✅ Posted — visible to everyone viewing this page.';
    }catch(e){
      lsAdd(payload);
      selectReviewTarget(currentReviewTarget);
      msgEl.textContent = '✅ Saved on this device (shared posting unavailable right now).';
    }
  } else {
    lsAdd(payload);
    selectReviewTarget(currentReviewTarget);
    msgEl.textContent = '✅ Saved on this device.';
  }
  document.getElementById('reviewText').value='';
  document.getElementById('safetyCheck').checked=false;
  selectedStars=0;
  document.getElementById('starPicker').querySelectorAll('span').forEach(s=>s.classList.remove('on'));
};

document.getElementById('submitSiteFeedbackBtn').onclick = async ()=>{
  const msgEl = document.getElementById('siteFeedbackMsg');
  if(!gatePassed){ msgEl.textContent='⚠️ Please sign in above first — Google or mobile number.'; return; }
  const text = document.getElementById('siteFeedbackText').value.trim();
  if(text.length<3){ msgEl.textContent='⚠️ Please write a little more detail.'; return; }
  msgEl.textContent = 'Sending…';
  if(dbMode){
    try{
      await dbRef.collection('feedback').add({text, authorName: gateAuthorName || 'Traveller', authorId: gateAuthorId || null, createdAt:new Date().toISOString()});
      msgEl.textContent = '✅ Thanks — your feedback was sent.';
    }catch(e){
      lsAddFeedback(text);
      msgEl.textContent = '✅ Saved on this device (shared sending unavailable right now).';
    }
  } else {
    lsAddFeedback(text);
    msgEl.textContent = '✅ Saved on this device.';
  }
  document.getElementById('siteFeedbackText').value='';
};

function goToReviewsFor(key){
  showTab('tabReviews');
  const sel = document.getElementById('reviewLocationSelect');
  sel.value = key;
  const t = REVIEW_TARGETS.find(x=>x.key===key);
  if(t) selectReviewTarget(t);
}

/* ================= SAFETY GUIDE ================= */
const SAFETY_NUMBERS = [
  {label:'Emergency (all services)', num:'112'},
  {label:'Police', num:'100'},
  {label:'Manipur Women Helpline', num:'181'},
  {label:'Ambulance', num:'102'},
  {label:'Fire', num:'101'},
  {label:'Child Helpline', num:'1098'},
];
const SAFETY_TIPS = [
  'Tell a friend, family member, or your hotel/hostel reception where you\'re headed and roughly when you\'ll be back — before you leave, not after.',
  'Share your live location with someone you trust (Google Maps → your profile photo → "Location sharing") for the duration of the trip, especially on rural or unlit roads.',
  'Prefer well-lit main roads over shortcuts, even if they take longer — most of Manipur\'s rural stretches (Loktak, Andro, Sekta, Senapati) have no street lighting at night.',
  'When booking a ride (Jugnoo or otherwise), share the trip details — driver name, vehicle number, route — with your contact before you get in.',
  'Keep your phone charged and know the name of the police station nearest to where you\'re staying, not just the one nearest a tourist spot.',
  'Trust your instinct — if a place or situation feels wrong, it\'s fine to turn back, call someone, or walk into the nearest open shop, hotel, or police post.',
  'For a flagged safety concern at a specific place, check the ⚠️ Reviews & Safety section before you go, and post one yourself if you experience something others should know about.',
];

function renderSafetyCallGrid(){
  const grid = document.getElementById('safetyCallGrid');
  if(!grid) return;
  grid.innerHTML = SAFETY_NUMBERS.map(s=>`
    <a class="safety-call-btn" href="tel:${s.num}">
      <b>📞 ${s.num}</b>
      <span>${s.label}</span>
    </a>
  `).join('');
}
function renderSafetyTips(){
  const list = document.getElementById('safetyTipsList');
  if(!list) return;
  list.innerHTML = SAFETY_TIPS.map(t=>`<li>${t}</li>`).join('');
}
function refreshSafetyNearby(){
  const box = document.getElementById('safetyNearbyBox');
  if(!box) return;
  const origin = userLoc || activeSpot;
  const originLabel = userLoc ? 'your live location' : activeSpot.name;
  const nearestPolice = PLACES.filter(p=>p.c==='police')
    .map(p=>({...p, d:haversine(origin.lat, origin.lng, p.lat, p.lng)}))
    .sort((a,b)=>a.d-b.d)[0];
  const nearestHospital = PLACES.filter(p=>p.c==='hospital')
    .map(p=>({...p, d:haversine(origin.lat, origin.lng, p.lat, p.lng)}))
    .sort((a,b)=>a.d-b.d)[0];
  function row(icon, label, p){
    if(!p) return '';
    return `
      <div class="night-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
        <div style="display:flex; justify-content:space-between; width:100%;">
          <span>${icon} <b>${label}:</b> ${p.n} <span style="color:var(--muted)">(${fmtKm(p.d)})</span></span>
        </div>
        <div style="display:flex; gap:10px;">
          ${p.ph ? `<a href="tel:${p.ph.replace(/\s/g,'')}">📞 ${p.ph}</a>` : `<a href="${mapsViewUrl(p)}" target="_blank" rel="noopener">Contact on Maps</a>`}
          <a href="${mapsDirUrl(p)}" target="_blank" rel="noopener">Directions</a>
        </div>
      </div>
    `;
  }
  box.innerHTML = `
    <div class="night-box" style="margin-top:0;">
      <div class="nb-head">📍 Nearest to ${originLabel}</div>
      ${row('🚓','Police station', nearestPolice)}
      ${row('🏥','Hospital', nearestHospital)}
    </div>
  `;
}

/* ================= VISITOR INFO / SOS / BUSINESS ================= */
const FESTIVALS_2026 = [
  {d:'1 Nov', n:'Chavang Kut (Kuki-Chin harvest festival)'},
  {d:'12 Nov', n:'Ningol Chakouba (families honour married daughters)'},
  {d:'21–30 Nov', n:'Manipur Sangai Festival, Imphal (culture, handloom, food, music)'},
];
// Enquiries are sent from the visitor's own Gmail / email app / WhatsApp to these. Nothing is stored or shown on the site.
const CONTACT_EMAIL = 'ojaschourasia@gmail.com';
const CONTACT_WHATSAPP = '919425705016'; // Ojas Chourasia (country code + number, no +)

function renderFestivals(){
  const el = document.getElementById('festivalList');
  if(el) el.innerHTML = FESTIVALS_2026.map(f=>`<div><b>${f.d}</b> — ${f.n}</div>`).join('');
}

// ---- SOS: build a shareable message with a Google Maps link; user sends it themselves ----
const SOS_KEY = 'hkm_sos_contact';
try{ const saved = localStorage.getItem(SOS_KEY); if(saved) document.getElementById('sosContactInput').value = saved; }catch(e){}
document.getElementById('sosBtn').onclick = ()=>{
  const out = document.getElementById('sosOut');
  const num = document.getElementById('sosContactInput').value.replace(/\D/g,'');
  if(num && !/^\d{10}$/.test(num)){ out.textContent='⚠️ Please enter a 10-digit number, or leave it blank to just copy the message.'; return; }
  try{ if(num) localStorage.setItem(SOS_KEY, num); }catch(e){}
  if(!navigator.geolocation){ out.textContent='Location isn\'t supported on this browser.'; return; }
  out.textContent = 'Getting your location…';
  navigator.geolocation.getCurrentPosition(pos=>{
    userLoc = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    const link = `https://www.google.com/maps?q=${userLoc.lat},${userLoc.lng}`;
    const msg = `I'm sharing my location with you because I want someone to know where I am: ${link}`;
    const wa = `https://wa.me/${num?('91'+num):''}?text=${encodeURIComponent(msg)}`;
    const sms = `sms:${num?('+91'+num):''}?&body=${encodeURIComponent(msg)}`;
    out.innerHTML = `
      <div style="margin-bottom:8px;">Your location: <a href="${link}" target="_blank" rel="noopener">${userLoc.lat.toFixed(5)}, ${userLoc.lng.toFixed(5)}</a></div>
      <div class="actions">
        <a class="a-map" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="a-dir" href="${sms}">SMS</a>
      </div>
      <p style="margin:8px 0 0;">If you are in danger, call <b>112</b> first — this message does not alert anyone by itself.</p>`;
    refreshSafetyNearby();
  }, ()=>{ out.textContent='⚠️ Couldn\'t get your location. Allow location access in your browser and try again.'; },
  {enableHighAccuracy:true, timeout:10000});
};

// ---- Business enquiry: opens the user's own email/WhatsApp; nothing is stored by this site ----
document.getElementById('bizSendBtn').onclick = ()=>{
  const out = document.getElementById('bizOut');
  if(!gatePassed){ out.textContent='⚠️ Please sign in above first.'; return; }
  const name = document.getElementById('bizName').value.trim();
  const phone = document.getElementById('bizPhone').value.trim();
  if(name.length<2 || phone.replace(/\D/g,'').length<10){ out.textContent='⚠️ Please add your business name and a valid phone number.'; return; }
  const body = `Signed in as: ${gateAuthorName}\nBusiness: ${name}\nType: ${document.getElementById('bizCat').value}\nArea: ${document.getElementById('bizArea').value.trim()}\nPhone: ${phone}\nNotes: ${document.getElementById('bizMsg').value.trim()}`;
  const mail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Listing enquiry: '+name)}&body=${encodeURIComponent(body)}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(CONTACT_EMAIL)}&su=${encodeURIComponent('Listing enquiry: '+name)}&body=${encodeURIComponent(body)}`;
  const wa = CONTACT_WHATSAPP ? `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(body)}` : '';
  out.innerHTML = `Enquiry ready — tap one to send it to Ojas (it opens your own app, and you press Send there):<div class="actions" style="margin-top:8px;">
      ${wa?`<a class="a-map" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>`:''}
      <a class="a-dir" href="${gmail}" target="_blank" rel="noopener">Gmail</a>
      <a class="a-dir" href="${mail}">Email app</a></div>
      <p style="margin:8px 0 0;">Nothing is submitted until you press Send in that app. Your details are not stored or shown on this site.</p>`;
};

renderFestivals();
function renderPartners(){
  const el = document.getElementById('partnersList');
  if(!el) return;
  const partners = PLACES.filter(p=>p.verified || p.sponsored);
  el.innerHTML = partners.length ? partners.map(p=>`
    <div class="night-item" style="flex-direction:column; align-items:flex-start; gap:4px;">
      <span><b>${p.n}</b> <span class="badge verified">✔ Verified</span> ${p.sponsored?'<span class="badge sponsored">Sponsored</span>':''}</span>
      <span style="color:var(--muted); font-size:0.78rem;">${p.a}</span>
      <div style="display:flex; gap:10px;">
        ${p.ph ? `<a href="tel:${p.ph.replace(/\s/g,'')}">📞 Call</a>` : ''}
        <a href="${mapsViewUrl(p)}" target="_blank" rel="noopener">View on Maps</a>
      </div>
    </div>`).join('')
    : '<div class="empty" style="padding:10px;">No tie-up partners listed yet — yours could be the first.</div>';
}
renderPartners();

renderSafetyCallGrid();
renderSafetyTips();

renderSpotChecks();
renderSpots();
renderCats();
renderList();

// Offline support: only registers on https or localhost (browsers require this).
if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
  window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/sw.js').catch(()=>{}); });
}
