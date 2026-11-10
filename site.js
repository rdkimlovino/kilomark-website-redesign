/* kilomark site script
   ── EDIT THESE BEFORE GOING LIVE ───────────────────────────── */
window.KM_CONFIG = {
  // Your TidyCal booking page for the discovery call
  BOOKING_URL: "https://tidycal.com/kilomark/discovery-call",
  // Optional: GHL / Albato inbound webhook that receives the intake answers as JSON.
  // Leave empty to skip. On WordPress this posts before the booking link appears.
  WEBHOOK_URL: ""
};
/* ─────────────────────────────────────────────────────────── */

(function(){
  // always open a new page at the top
  try{ if('scrollRestoration' in history) history.scrollRestoration='manual'; }catch(e){}
  const toTop=()=>{ if(!location.hash || location.hash==='#book') window.scrollTo({top:0,left:0,behavior:'instant'}); };
  toTop(); window.addEventListener('load',toTop); window.addEventListener('pageshow',toTop);

  // floating CTA + back-to-top
  const fl=document.getElementById('km-float');
  if(fl){
    const onScroll=()=>fl.classList.toggle('show', window.scrollY>480);
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    fl.querySelector('.to-top').addEventListener('click',()=>{
      const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({top:0,behavior:reduce?'auto':'smooth'});
      const skip=document.querySelector('.logo'); if(skip) skip.focus({preventScroll:true});
    });
  }

  // mobile nav + dropdowns
  const toggle=document.querySelector('.menu-toggle'), nav=document.querySelector('.nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const o=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',o)})}
  document.querySelectorAll('.dd > button').forEach(b=>{
    b.addEventListener('click',e=>{const dd=b.parentElement;const o=dd.classList.toggle('open');b.setAttribute('aria-expanded',o);
      document.querySelectorAll('.dd').forEach(x=>{if(x!==dd)x.classList.remove('open')})});
  });
  document.addEventListener('click',e=>{if(!e.target.closest('.dd'))document.querySelectorAll('.dd.open').forEach(x=>x.classList.remove('open'))});

  // copy buttons
  document.querySelectorAll('[data-copy]').forEach(b=>b.addEventListener('click',()=>{
    const t=b.getAttribute('data-copy');
    const done=()=>{const o=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=o,1400)};
    try{navigator.clipboard.writeText(t).then(done,()=>{})}catch(e){}
  }));

  /* ---------------- discovery call intake ---------------- */
  const STEPS=[
    {title:"Tell us about you",note:"Takes about 90 seconds. Then you pick a time.",fields:`
      <div class="two">
        <div class="field"><label for="km-name">Your name</label><input id="km-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="km-role">Your role</label><select id="km-role" name="role"><option>Clinic owner</option><option>Co-owner / partner</option><option>Clinic director / manager</option><option>Other</option></select></div>
        <div class="field"><label for="km-email">Email</label><input id="km-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="km-phone">Phone</label><input id="km-phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field"><label for="km-clinic">Clinic name</label><input id="km-clinic" name="clinic" type="text" autocomplete="organization" required></div>
        <div class="field"><label for="km-site">Clinic website <span class="hint">(if you have one)</span></label><input id="km-site" name="website" type="url" placeholder="https://"></div>
      </div>
      <div class="field"><label for="km-city">City and province</label><input id="km-city" name="city" type="text" placeholder="e.g. Surrey, BC" required></div>`},
    {title:"Your clinic",note:"This helps us prepare the right examples for your call.",fields:`
      <div class="field"><span class="qlabel">Which best describes your clinic?</span><div class="opts one">
        ${opt('radio','clinic_type','Independent clinic (owner-operated)')}
        ${opt('radio','clinic_type','Small group (2–5 locations)')}
        ${opt('radio','clinic_type','Franchise or corporate chain location')}
      </div></div>
      <div class="field"><span class="qlabel">How many therapists work at your clinic?</span><div class="opts">
        ${opt('radio','therapists','Just me')}${opt('radio','therapists','2–3')}${opt('radio','therapists','4–8')}${opt('radio','therapists','9 or more')}
      </div></div>
      <div class="field"><span class="qlabel">Services you offer</span><div class="opts">
        ${opt('checkbox','services','Physiotherapy')}${opt('checkbox','services','Massage therapy')}${opt('checkbox','services','Chiropractic')}${opt('checkbox','services','Pelvic health / niche programs')}
      </div></div>`},
    {title:"Where you're stuck",note:"Pick everything that applies. We'll dig into these on the call.",fields:`
      <div class="field"><span class="qlabel">Your biggest challenges right now</span><div class="opts">
        ${opt('checkbox','challenges','Not enough new patients')}${opt('checkbox','challenges','Not showing up on Google')}
        ${opt('checkbox','challenges','Bookings go up and down')}${opt('checkbox','challenges','Too reliant on referrals')}
        ${opt('checkbox','challenges','Website looks dated or doesn\'t convert')}${opt('checkbox','challenges','No time to manage marketing')}
        ${opt('checkbox','challenges','Burned by a past agency')}${opt('checkbox','challenges','Empty slots in certain hours')}
      </div></div>
      <div class="field"><span class="qlabel">What have you already tried?</span><div class="opts">
        ${opt('checkbox','tried','Google Ads')}${opt('checkbox','tried','SEO / blog posts')}${opt('checkbox','tried','Social media posting')}${opt('checkbox','tried','Facebook / Instagram ads')}
        ${opt('checkbox','tried','Email newsletters')}${opt('checkbox','tried','Another marketing agency')}${opt('checkbox','tried','Doing it ourselves')}${opt('checkbox','tried','Nothing yet')}
      </div></div>`},
    {title:"Goals and budget",note:"No wrong answers. This keeps the call focused on what's realistic.",fields:`
      <div class="field"><span class="qlabel">Monthly budget you could put toward marketing <span class="hint">(agency + ad spend)</span></span><div class="opts">
        ${opt('radio','budget','Under $1,000')}${opt('radio','budget','$1,000 – $2,000')}${opt('radio','budget','$2,000 – $3,500')}${opt('radio','budget','$3,500+')}
      </div></div>
      <div class="field"><span class="qlabel">When do you want to start?</span><div class="opts">
        ${opt('radio','timeline','As soon as possible')}${opt('radio','timeline','In the next 1–3 months')}${opt('radio','timeline','3+ months out')}${opt('radio','timeline','Just exploring')}
      </div></div>
      <div class="field"><label for="km-goal">What would a great next 90 days look like? <span class="hint">(optional)</span></label>
        <textarea id="km-goal" name="goal" placeholder="e.g. 15 more new patients a month, fill our new pelvic health program, rank for physio in Langley"></textarea></div>`}
  ];
  function opt(type,name,label){const id='km-'+name+'-'+label.replace(/[^a-z0-9]+/gi,'-').toLowerCase();
    return `<label class="opt"><input type="${type}" name="${name}" id="${id}" value="${label.replace(/"/g,'&quot;')}"><span>${label}</span></label>`}

  let modal=null, step=0, source='discovery';
  function build(){
    modal=document.createElement('div');modal.className='modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','km-title');
    modal.innerHTML=`<div class="scrim" data-close></div><form class="box" id="km-form" novalidate>
      <div class="top"><div class="row"><div><span class="eyebrow" style="margin-bottom:8px">Book a discovery call</span><h2 id="km-title"></h2></div>
      <button type="button" class="close" data-close aria-label="Close">×</button></div>
      <div class="progress" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="stepnote" id="km-note"></div></div>
      ${STEPS.map((s,i)=>`<div class="body" data-step="${i}" hidden>${s.fields}<p class="err" hidden></p></div>`).join('')}
      <div class="body" data-step="done" hidden>
        <div class="done-mark"></div>
        <h3 style="font-size:26px;font-weight:700;letter-spacing:-.02em">Thanks. Last step: pick a time.</h3>
        <p class="muted">Your answers are in. Choose a 30-minute slot for your discovery call. On the call we'll cover:</p>
        <ul class="list" style="font-size:15px"><li>Your goals and what's getting in the way</li><li>A quick look at what you've tried so far</li><li>Clear next steps, whether or not we work together</li></ul>
        <a class="btn btn-red btn-lg arrow" id="km-book" target="_blank" rel="noopener">Choose my call time</a>
        <p class="small muted">Opens our booking calendar in a new tab. Prefer email? Write to <span class="copy">hello@kilomark.ca</span></p>
      </div>
      <div class="foot"><button type="button" class="btn btn-outline" id="km-back">Back</button><button type="submit" class="btn btn-red arrow" id="km-next">Next</button></div>
    </form>`;
    document.body.appendChild(modal);
    modal.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',close));
    modal.querySelector('#km-back').addEventListener('click',()=>show(step-1));
    modal.querySelector('#km-form').addEventListener('submit',e=>{e.preventDefault();next()});
    modal.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
    modal.querySelector('#km-form').addEventListener('input',saveDraft);
    loadDraft();
  }
  function show(i){
    if(i<0)i=0; step=i;
    modal.querySelectorAll('[data-step]').forEach(el=>el.hidden=String(el.dataset.step)!==String(i));
    const done=i==='done';
    modal.querySelector('#km-title').textContent=done?'You\'re almost booked':STEPS[i].title;
    modal.querySelector('#km-note').textContent=done?'':`Step ${i+1} of 4 · ${STEPS[i].note}`;
    modal.querySelectorAll('.progress i').forEach((b,n)=>b.classList.toggle('on',done||n<=i));
    modal.querySelector('.foot').hidden=done;
    modal.querySelector('#km-back').style.visibility=i===0?'hidden':'visible';
    modal.querySelector('#km-next').textContent=i===3?'See available times':'Next';
    const first=modal.querySelector(`[data-step="${i}"] input, [data-step="${i}"] select, [data-step="${i}"] a`); if(first)setTimeout(()=>first.focus(),30);
    modal.querySelector('.box').scrollTop=0;
  }
  function valid(i){
    const pane=modal.querySelector(`[data-step="${i}"]`), err=pane.querySelector('.err'); let msg='';
    pane.querySelectorAll('input[required]').forEach(inp=>{if(!msg&&!inp.value.trim())msg='Please fill in '+inp.closest('.field').querySelector('label').childNodes[0].textContent.trim().toLowerCase()+'.'});
    const em=pane.querySelector('#km-email'); if(!msg&&em&&!/^\S+@\S+\.\S+$/.test(em.value))msg='Please check your email address — it looks incomplete.';
    if(!msg&&i===1){if(!pane.querySelector('[name=clinic_type]:checked'))msg='Choose the option that best describes your clinic.';else if(!pane.querySelector('[name=therapists]:checked'))msg='Choose how many therapists work at your clinic.'}
    if(!msg&&i===2&&!pane.querySelector('[name=challenges]:checked'))msg='Pick at least one challenge so we can prepare.';
    if(!msg&&i===3){if(!pane.querySelector('[name=budget]:checked'))msg='Choose a budget range. A rough idea is fine.';else if(!pane.querySelector('[name=timeline]:checked'))msg='Choose when you\'d like to start.'}
    err.hidden=!msg; err.textContent=msg; return !msg;
  }
  function data(){
    const f=new FormData(modal.querySelector('#km-form')), o={};
    for(const [k,v] of f.entries()){if(o[k]){o[k]=[].concat(o[k],v)}else o[k]=v}
    return o;
  }
  function fit(d){ // simple lead score for your CRM (0–100)
    let s=0; const b={'Under $1,000':5,'$1,000 – $2,000':20,'$2,000 – $3,500':32,'$3,500+':40}[d.budget]||0;
    const t={'Just me':6,'2–3':14,'4–8':22,'9 or more':25}[d.therapists]||0;
    const c={'Independent clinic (owner-operated)':20,'Small group (2–5 locations)':16,'Franchise or corporate chain location':2}[d.clinic_type]||0;
    const w={'As soon as possible':15,'In the next 1–3 months':11,'3+ months out':5,'Just exploring':2}[d.timeline]||0;
    return Math.min(100,b+t+c+w);
  }
  async function next(){
    if(!valid(step))return;
    if(step<3){show(step+1);return}
    const d=data(); d.source=source; d.fit_score=fit(d); d.page=location.pathname; d.context=window.kmContext||null; d.submitted_at=new Date().toISOString();
    const url=window.KM_CONFIG.WEBHOOK_URL;
    if(url){try{await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})}catch(e){}}
    try{localStorage.removeItem('km-intake')}catch(e){}
    modal.querySelector('#km-book').href=window.KM_CONFIG.BOOKING_URL;
    show('done');
  }
  function saveDraft(){try{localStorage.setItem('km-intake',JSON.stringify(data()))}catch(e){}}
  function loadDraft(){let d;try{d=JSON.parse(localStorage.getItem('km-intake')||'null')}catch(e){}
    if(!d)return; Object.entries(d).forEach(([k,v])=>{[].concat(v).forEach(val=>{
      const els=modal.querySelectorAll(`[name="${k}"]`); els.forEach(el=>{if(el.type==='radio'||el.type==='checkbox'){if(el.value===val)el.checked=true}else el.value=val})})})}
  let lastFocus=null;
  function open(src){if(!modal)build(); source=src||'discovery'; lastFocus=document.activeElement; modal.hidden=false; document.documentElement.style.overflow='hidden'; show(0);
    if(window.kmPrefill){Object.entries(window.kmPrefill).forEach(([k,v])=>{modal.querySelectorAll(`[name="${k}"]`).forEach(el=>{if(el.value===v)el.checked=true})})}}
  function close(){modal.hidden=true;document.documentElement.style.overflow='';if(lastFocus)lastFocus.focus()}
  window.kmOpenBooking=open;
  document.addEventListener('click',e=>{const t=e.target.closest('[data-book]');if(t){e.preventDefault();open(t.getAttribute('data-book'))}});
})();
