/* kilomark site script
   ── EDIT THESE BEFORE GOING LIVE ───────────────────────────── */
window.KM_CONFIG = {
  // Your TidyCal booking page for the discovery call
  BOOKING_URL: "https://schedule.kilomark.ca/discovery-call",
  // Optional: GHL / Albato inbound webhook that receives the intake answers as JSON.
  // Leave empty to skip. On WordPress this posts before the booking link appears.
  WEBHOOK_URL: "https://h.albato.com/wh/38/1lfvuqt/iqItgrE5uVlLm-XebYnifDmrL7keZWht4d-_taczTyI/",
  // Strategy call (after a discovery call): its own TidyCal page + Albato webhook
  STRATEGY_BOOKING_URL: "https://schedule.kilomark.ca/strategy-call",
  STRATEGY_WEBHOOK_URL: "https://h.albato.com/wh/38/1lfvuqt/9sOIWxChW-HkVhlOdy7884oNx7vmLmy--HSPdq1Q-Uk/",
  FREE_REDESIGN_BOOKING_URL: "https://schedule.kilomark.ca/free-website-redesign-call",
  FREE_REDESIGN_WEBHOOK_URL: "https://h.albato.com/wh/38/1lfvuqt/YbyXz_W8MyO2wa1NFmHMYzGhKDN6jgYVpmOAcH3GqPk/",
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
    {title:"What best describes you?",note:"One tap — that's it for this step.",fields:`
      <div class="field"><span class="qlabel">What best describes you?</span><div class="opts cards">
        ${card('clinic_type','Solo practitioner','Just me')}
        ${card('clinic_type','Independent clinic','One location')}
        ${card('clinic_type','Multi-clinic owner','2–5 locations')}
        ${card('clinic_type','Franchise / clinic group','6+ locations or franchise')}
      </div></div>`},
    {title:"Your clinic",note:"This helps us prepare the right examples for your call.",fields:`
      <div class="field" id="km-therapists-field"><span class="qlabel">How many therapists work at your clinic?</span><div class="opts">
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
        <textarea id="km-goal" name="goal" placeholder="e.g. 15 more new patients a month, fill our new pelvic health program, rank for physio in Langley"></textarea>
        <button type="button" class="skip" data-skip>Skip for now — I'll share it on the call →</button></div>`},
    {title:"Your details",note:"Last one — just so we know who's booking.",fields:`
      <div class="two">
        <div class="field"><label for="km-name">Your name</label><input id="km-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="km-role">Your role</label><select id="km-role" name="role"><option>Clinic owner</option><option>Co-owner / partner</option><option>Clinic director / manager</option><option>Other</option></select></div>
        <div class="field"><label for="km-email">Email</label><input id="km-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="km-phone">Phone</label><input id="km-phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field"><label for="km-clinic">Clinic name</label><input id="km-clinic" name="clinic" type="text" autocomplete="organization" required></div>
        <div class="field"><label for="km-site">Clinic website <span class="hint">(if you have one)</span></label><input id="km-site" name="website" type="url" placeholder="https://"></div>
      </div>
      <div class="field"><label for="km-city">City and province</label><input id="km-city" name="city" type="text" placeholder="e.g. Surrey, BC" required></div>`}
  ];
  /* Free-redesign qualifier intake — the ORIGINAL 4 discovery steps, kept
     exactly as they were. The free-redesign qualifier prefills clinic_type /
     therapists / budget with its own values, so this mode must not change.
     Field ids use the km-f- prefix so they never collide with the discovery
     panes (which reuse the km- ids). */
  const FREE_STEPS=[
    {title:"Tell us about you",note:"Then you pick a time.",fields:`
      <div class="two">
        <div class="field"><label for="km-f-name">Your name</label><input id="km-f-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="km-f-role">Your role</label><select id="km-f-role" name="role"><option>Clinic owner</option><option>Co-owner / partner</option><option>Clinic director / manager</option><option>Other</option></select></div>
        <div class="field"><label for="km-f-email">Email</label><input id="km-f-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="km-f-phone">Phone</label><input id="km-f-phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field"><label for="km-f-clinic">Clinic name</label><input id="km-f-clinic" name="clinic" type="text" autocomplete="organization" required></div>
        <div class="field"><label for="km-f-site">Clinic website <span class="hint">(if you have one)</span></label><input id="km-f-site" name="website" type="url" placeholder="https://"></div>
      </div>
      <div class="field"><label for="km-f-city">City and province</label><input id="km-f-city" name="city" type="text" placeholder="e.g. Surrey, BC" required></div>`},
    {title:"Your clinic",note:"This helps us prepare the right examples for your call.",fields:`
      <div class="field"><span class="qlabel">Which best describes your clinic?</span><div class="opts one">
        ${opt('radio','clinic_type','Independent clinic (owner-operated)','f')}
        ${opt('radio','clinic_type','Small group (2–5 locations)','f')}
        ${opt('radio','clinic_type','Franchise or corporate chain location','f')}
      </div></div>
      <div class="field"><span class="qlabel">How many therapists work at your clinic?</span><div class="opts">
        ${opt('radio','therapists','Just me','f')}${opt('radio','therapists','2–3','f')}${opt('radio','therapists','4–8','f')}${opt('radio','therapists','9 or more','f')}
      </div></div>
      <div class="field"><span class="qlabel">Services you offer</span><div class="opts">
        ${opt('checkbox','services','Physiotherapy','f')}${opt('checkbox','services','Massage therapy','f')}${opt('checkbox','services','Chiropractic','f')}${opt('checkbox','services','Pelvic health / niche programs','f')}
      </div></div>`},
    {title:"Where you're stuck",note:"Pick everything that applies. We'll dig into these on the call.",fields:`
      <div class="field"><span class="qlabel">Your biggest challenges right now</span><div class="opts">
        ${opt('checkbox','challenges','Not enough new patients','f')}${opt('checkbox','challenges','Not showing up on Google','f')}
        ${opt('checkbox','challenges','Bookings go up and down','f')}${opt('checkbox','challenges','Too reliant on referrals','f')}
        ${opt('checkbox','challenges','Website looks dated or doesn\'t convert','f')}${opt('checkbox','challenges','No time to manage marketing','f')}
        ${opt('checkbox','challenges','Burned by a past agency','f')}${opt('checkbox','challenges','Empty slots in certain hours','f')}
      </div></div>
      <div class="field"><span class="qlabel">What have you already tried?</span><div class="opts">
        ${opt('checkbox','tried','Google Ads','f')}${opt('checkbox','tried','SEO / blog posts','f')}${opt('checkbox','tried','Social media posting','f')}${opt('checkbox','tried','Facebook / Instagram ads','f')}
        ${opt('checkbox','tried','Email newsletters','f')}${opt('checkbox','tried','Another marketing agency','f')}${opt('checkbox','tried','Doing it ourselves','f')}${opt('checkbox','tried','Nothing yet','f')}
      </div></div>`},
    {title:"Goals and budget",note:"No wrong answers. This keeps the call focused on what's realistic.",fields:`
      <div class="field"><span class="qlabel">Monthly budget you could put toward marketing <span class="hint">(agency + ad spend)</span></span><div class="opts">
        ${opt('radio','budget','Under $1,000','f')}${opt('radio','budget','$1,000 – $2,000','f')}${opt('radio','budget','$2,000 – $3,500','f')}${opt('radio','budget','$3,500+','f')}
      </div></div>
      <div class="field"><span class="qlabel">When do you want to start?</span><div class="opts">
        ${opt('radio','timeline','As soon as possible','f')}${opt('radio','timeline','In the next 1–3 months','f')}${opt('radio','timeline','3+ months out','f')}${opt('radio','timeline','Just exploring','f')}
      </div></div>
      <div class="field"><label for="km-f-goal">What would a great next 90 days look like? <span class="hint">(optional)</span></label>
        <textarea id="km-f-goal" name="goal" placeholder="e.g. 15 more new patients a month, fill our new pelvic health program, rank for physio in Langley"></textarea>
        <button type="button" class="skip" data-skip>Skip for now — I'll share it on the call →</button></div>`}
  ];
  /* ---------------- strategy call intake (after a discovery call) ---------------- */
  const STRATEGY_STEPS=[
    {title:"Which program?",note:"Pick the program you want to move forward with. You can change it on the call.",fields:`
      <div class="field"><span class="qlabel">Program you want to move forward with</span><div class="opts one">
        <label class="opt"><input type="radio" name="program" value="Foundation"><span>Foundation — <span class="km-price" data-m="$722/mo" data-a="$650/mo">$722/mo</span></span></label>
        <label class="opt"><input type="radio" name="program" value="Essential"><span>Essential — <span class="km-price" data-m="$1,167/mo" data-a="$1,050/mo">$1,167/mo</span></span></label>
        <label class="opt"><input type="radio" name="program" value="Growth"><span>Growth — <span class="km-price" data-m="$1,944/mo" data-a="$1,750/mo">$1,944/mo</span></span></label>
      </div></div>
      <div class="field"><span class="qlabel">Billing</span><div class="opts">
        <label class="opt"><input type="radio" name="billing" value="Monthly"><span>Monthly</span></label>
        <label class="opt"><input type="radio" name="billing" value="Annual"><span>Annual — save 10%, setup fee waived</span></label>
      </div></div>`},
    {title:"Your 90-day plan",note:"This is what we'll map out together on the strategy call.",fields:`
      <div class="field"><label for="km-s-goal">What would a great next 90 days look like? <span class="hint">(optional)</span></label>
        <textarea id="km-s-goal" name="goal" placeholder="e.g. 15 more new patients a month, fill our new pelvic health program"></textarea></div>
      <div class="field"><span class="qlabel">When do you want to start?</span><div class="opts">
        ${opt('radio','timeline','As soon as possible')}${opt('radio','timeline','In the next 1–3 months')}${opt('radio','timeline','3+ months out')}
      </div></div>
      <div class="field"><label for="km-s-notes">Anything from your discovery call we should revisit? <span class="hint">(optional)</span></label>
        <textarea id="km-s-notes" name="notes" placeholder="e.g. questions about the Growth program, start date, ad budget"></textarea></div>`},
    {title:"Your details",note:"So we know who's booking.",fields:`
      <div class="two">
        <div class="field"><label for="km-s-name">Your name</label><input id="km-s-name" name="name" type="text" autocomplete="name" required></div>
        <div class="field"><label for="km-s-email">Email</label><input id="km-s-email" name="email" type="email" autocomplete="email" required></div>
        <div class="field"><label for="km-s-phone">Phone</label><input id="km-s-phone" name="phone" type="tel" autocomplete="tel" required></div>
        <div class="field"><label for="km-s-clinic">Clinic name</label><input id="km-s-clinic" name="clinic" type="text" autocomplete="organization" required></div>
      </div>
      <div class="field"><label for="km-s-city">City and province</label><input id="km-s-city" name="city" type="text" placeholder="e.g. Surrey, BC" required></div>`}
  ];
  function activeSteps(){return source==='strategy'?STRATEGY_STEPS:source==='free-redesign'?FREE_STEPS:STEPS}
  function paneMode(){return source==='strategy'?'strategy':source==='free-redesign'?'free-redesign':'discovery'}
  function updateStrategyPrices(){ // program cards follow the picked billing (monthly vs annual)
    const b=modal.querySelector('[name=billing]:checked');
    const annual=b&&b.value==='Annual';
    modal.querySelectorAll('.km-price').forEach(el=>{el.textContent=annual?el.dataset.a:el.dataset.m});
  }
  function opt(type,name,label,pfx){const id='km-'+(pfx?pfx+'-':'')+name+'-'+label.replace(/[^a-z0-9]+/gi,'-').toLowerCase();
    return `<label class="opt"><input type="${type}" name="${name}" id="${id}" value="${label.replace(/"/g,'&quot;')}"><span>${label}</span></label>`}
  // Big tap cards for the "who are you" step: label + sublabel, one tap each.
  function card(name,value,sub){const id='km-'+name+'-'+value.replace(/[^a-z0-9]+/gi,'-').toLowerCase();
    return `<label class="opt card"><input type="radio" name="${name}" id="${id}" value="${value}"><span><b>${value}</b><small>${sub}</small></span></label>`}

  let modal=null, step=0, source='discovery', maxStep=0, therapistsAuto=false;
  // Short labels for the clickable stepper (discovery: 5 steps, strategy: 3, free-redesign: 4).
  const STEP_SHORT={discovery:['You','Clinic','Stuck','Goals','Details'],strategy:['Program','Plan','Details'],free:['About you','Clinic','Stuck','Goals']};
  const DRAFT_KEY='km-intake', DRAFT_TTL_MS=30*24*3600*1000;
  function build(){
    modal=document.createElement('div');modal.className='modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','km-title');
    modal.innerHTML=`<div class="scrim" data-close></div><form class="box" id="km-form" novalidate>
      <div class="top"><div class="row"><div><span class="eyebrow" id="km-eyebrow" style="margin-bottom:8px">Book a discovery call</span><h2 id="km-title"></h2></div>
      <button type="button" class="close" data-close aria-label="Close">×</button></div>
      <ol class="progress" id="km-steps" aria-label="Form steps"></ol><div class="stepnote" id="km-note"></div></div>
      ${STEPS.map((s,i)=>`<div class="body" data-mode="discovery" data-step="${i}" hidden>${s.fields}<p class="err" aria-live="polite" hidden></p></div>`).join('')}
      ${FREE_STEPS.map((s,i)=>`<div class="body" data-mode="free-redesign" data-step="${i}" hidden>${s.fields}<p class="err" aria-live="polite" hidden></p></div>`).join('')}
      ${STRATEGY_STEPS.map((s,i)=>`<div class="body" data-mode="strategy" data-step="${i}" hidden>${s.fields}<p class="err" aria-live="polite" hidden></p></div>`).join('')}
      <div class="body" data-step="done" hidden>
        <div class="done-mark"></div>
        <h3 id="km-done-title" style="font-size:26px;font-weight:700;letter-spacing:-.02em">Thanks. Last step: pick a time.</h3>
        <p class="muted" id="km-done-sub">Your answers are in. Choose a 30-minute slot for your discovery call. On the call we'll cover:</p>
        <ul class="list" id="km-done-list" style="font-size:15px"><li>Your goals and what's getting in the way</li><li>A quick look at what you've tried so far</li><li>Clear next steps, whether or not we work together</li></ul>
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
    modal.addEventListener('change',e=>{if(e.target.name==='billing')updateStrategyPrices();if(e.target.name==='therapists')therapistsAuto=false;saveDraft();if(e.target.type==='radio'||e.target.type==='checkbox')maybeAutoAdvance()});
    modal.querySelector('#km-form').addEventListener('click',e=>{if(e.target.closest('[data-skip]')){e.preventDefault();next()}});
    loadDraft();
  }
  // Clickable stepper: jump back to any visited step; forward only to the
  // next step, and only if the current step validates. Never skips ahead.
  function renderStepper(){
    const ol=modal.querySelector('#km-steps'); if(!ol) return;
    const steps=activeSteps(), labels=source==='strategy'?STEP_SHORT.strategy:source==='free-redesign'?STEP_SHORT.free:STEP_SHORT.discovery;
    ol.innerHTML='';
    steps.forEach((s,i)=>{
      const li=document.createElement('li');
      const b=document.createElement('button');
      b.type='button'; b.className='step-btn';
      b.innerHTML=`<i></i><span>${labels[i]||s.title}</span>`;
      b.setAttribute('aria-label',`Step ${i+1} of ${steps.length}: ${s.title}`);
      const canGo=(typeof step==='number'&&(i<=maxStep||i===step+1))||step==='done';
      b.disabled=!canGo;
      if(typeof step==='number'&&i===step)b.setAttribute('aria-current','step');
      b.classList.toggle('on',step==='done'||(typeof step==='number'&&i<=step));
      b.classList.toggle('current',typeof step==='number'&&i===step);
      b.addEventListener('click',()=>{
        if(i<=maxStep||step==='done'){show(i);return}
        if(typeof step==='number'&&i===step+1&&valid(step))show(step+1);
      });
      li.appendChild(b); ol.appendChild(li);
    });
  }
  // "Solo practitioner" answers the therapists question for you: pre-fill
  // "Just me" and hide the question. Pick another type and the auto-filled
  // answer is cleared again.
  function applySoloTherapists(){
    const pane=modal.querySelector('[data-step="1"][data-mode="discovery"]'); if(!pane)return;
    const field=pane.querySelector('#km-therapists-field'); if(!field)return;
    const ct=modal.querySelector('[data-step="0"][data-mode="discovery"] [name="clinic_type"]:checked');
    if(ct&&ct.value==='Solo practitioner'){
      const justMe=pane.querySelector('[name="therapists"][value="Just me"]');
      if(justMe)justMe.checked=true;
      therapistsAuto=true; field.hidden=true;
    }else{
      field.hidden=false;
      if(therapistsAuto){const justMe=pane.querySelector('[name="therapists"][value="Just me"]'); if(justMe)justMe.checked=false; therapistsAuto=false;}
    }
  }
  function show(i){
    if(i<0)i=0;
    if(typeof i==='number'&&i>=activeSteps().length)i=activeSteps().length-1; // defensive clamp
    step=i;
    if(typeof i==='number')maxStep=Math.max(maxStep,i);
    if(typeof i==='number'&&paneMode()==='discovery'&&i===1)applySoloTherapists();
    const steps=activeSteps();
    modal.querySelectorAll('[data-step]').forEach(el=>{el.hidden=el.dataset.step==='done'?i!=='done':(el.dataset.mode!==paneMode()||String(el.dataset.step)!==String(i))});
    const done=i==='done';
    modal.querySelector('#km-title').textContent=done?'You\'re almost booked':steps[i].title;
    modal.querySelector('#km-note').textContent=done?'':`Step ${i+1} of ${steps.length} · ~90 seconds · ${steps[i].note}`;
    renderStepper();
    modal.querySelector('.foot').hidden=done;
    modal.querySelector('#km-back').style.visibility=i===0||done?'hidden':'visible';
    modal.querySelector('#km-next').textContent=i===steps.length-1?'See available times':'Next';
    if(typeof i==='number')saveDraft(); // persist the step too, so a close resumes here
    if(done){
      const s=source==='strategy', f=source==='free-redesign';
      modal.querySelector('#km-done-sub').textContent=s?'Your answers are in. Choose a 30-minute slot for your strategy call. On the call we\'ll cover:':f?'Your answers are in. Choose a 30-minute slot for your free website redesign call. On the call we\'ll cover:':'Your answers are in. Choose a 30-minute slot for your discovery call. On the call we\'ll cover:';
      modal.querySelector('#km-done-list').innerHTML=s?'<li>Final review of your selected program</li><li>Your 90-day implementation plan</li><li>Timeline, start date and next steps</li>':f?'<li>Confirm your 10 km area is still open</li><li>Review your qualifier result and redesign scope</li><li>Clear next steps for your free redesign</li>':'<li>Your goals and what\'s getting in the way</li><li>A quick look at what you\'ve tried so far</li><li>Clear next steps, whether or not we work together</li>';
      modal.querySelector('#km-book').textContent=s?'Choose my strategy call time':f?'Choose my free redesign call time':'Choose my call time';
    }
    const first=modal.querySelector(i==='done'?`[data-step="done"] a`:`[data-step="${i}"][data-mode="${paneMode()}"] input, [data-step="${i}"][data-mode="${paneMode()}"] select`); if(first)setTimeout(()=>first.focus(),30);
    modal.querySelector('.box').scrollTop=0;
  }
  function valid(i){
    const pane=modal.querySelector(`[data-step="${i}"][data-mode="${paneMode()}"]`), err=pane.querySelector('.err'); let msg='';
    pane.querySelectorAll('input[required]').forEach(inp=>{if(!msg&&!inp.value.trim())msg='Please fill in '+inp.closest('.field').querySelector('label').childNodes[0].textContent.trim().toLowerCase()+'.'});
    const em=pane.querySelector('input[name=email]'); if(!msg&&em&&!/^\S+@\S+\.\S+$/.test(em.value))msg='Please check your email address — it looks incomplete.';
    if(source==='strategy'){
      if(!msg&&i===0){if(!pane.querySelector('[name=program]:checked'))msg='Choose the program you want to move forward with.';else if(!pane.querySelector('[name=billing]:checked'))msg='Choose monthly or annual billing.'}
      if(!msg&&i===1&&!pane.querySelector('[name=timeline]:checked'))msg='Choose when you\'d like to start.';
    } else if(source==='free-redesign'){
      if(!msg&&i===1){if(!pane.querySelector('[name=clinic_type]:checked'))msg='Choose the option that best describes your clinic.';else if(!pane.querySelector('[name=therapists]:checked'))msg='Choose how many therapists work at your clinic.'}
      if(!msg&&i===2&&!pane.querySelector('[name=challenges]:checked'))msg='Pick at least one challenge so we can prepare.';
      if(!msg&&i===3){if(!pane.querySelector('[name=budget]:checked'))msg='Choose a budget range. A rough idea is fine.';else if(!pane.querySelector('[name=timeline]:checked'))msg='Choose when you\'d like to start.'}
    } else { // discovery, 5 steps — contact details live on the last step
      if(!msg&&i===0&&!pane.querySelector('[name=clinic_type]:checked'))msg='Choose the option that best describes you.';
      if(!msg&&i===1&&!pane.querySelector('[name=therapists]:checked'))msg='Choose how many therapists work at your clinic.';
      if(!msg&&i===2&&!pane.querySelector('[name=challenges]:checked'))msg='Pick at least one challenge so we can prepare.';
      if(!msg&&i===3){if(!pane.querySelector('[name=budget]:checked'))msg='Choose a budget range. A rough idea is fine.';else if(!pane.querySelector('[name=timeline]:checked'))msg='Choose when you\'d like to start.'}
    }
    err.hidden=!msg; err.textContent=msg;
    if(msg){ // move focus to the first thing that needs attention
      const empty=[...pane.querySelectorAll('input[required]')].find(inp=>!inp.value.trim());
      (empty||pane.querySelector('input,select,textarea')).focus();
    }
    return !msg;
  }
  // Auto-advance once every required group on the step is satisfied —
  // radios picked AND at least one box ticked in each required checkbox
  // group. A step never auto-advances while a required checkbox group on
  // it is still empty (the old form whisked users off step 2 before they
  // could tick services). Each new tick restarts the short delay, so
  // ticking several boxes in a row doesn't cut the user off.
  let advTimer=null;
  function maybeAutoAdvance(){
    if(typeof step!=='number')return;
    const pane=modal.querySelector(`[data-step="${step}"][data-mode="${paneMode()}"]`); if(!pane)return;
    let ready=false;
    if(source==='strategy'){
      if(step===0)ready=!!(pane.querySelector('[name=program]:checked')&&pane.querySelector('[name=billing]:checked'));
      else if(step===1)ready=!!pane.querySelector('[name=timeline]:checked');
    }else if(source==='free-redesign'){
      if(step===1)ready=!!(pane.querySelector('[name=clinic_type]:checked')&&pane.querySelector('[name=therapists]:checked')&&pane.querySelector('[name=services]:checked'));
      else if(step===2)ready=!!(pane.querySelector('[name=challenges]:checked')&&pane.querySelector('[name=tried]:checked'));
      else if(step===3)ready=!!(pane.querySelector('[name=budget]:checked')&&pane.querySelector('[name=timeline]:checked'));
    }else{
      if(step===0)ready=!!pane.querySelector('[name=clinic_type]:checked');
      else if(step===1)ready=!!(pane.querySelector('[name=therapists]:checked')&&pane.querySelector('[name=services]:checked'));
      else if(step===2)ready=!!(pane.querySelector('[name=challenges]:checked')&&pane.querySelector('[name=tried]:checked'));
      else if(step===3)ready=!!(pane.querySelector('[name=budget]:checked')&&pane.querySelector('[name=timeline]:checked'));
    }
    if(!ready)return;
    clearTimeout(advTimer);
    const from=step;
    advTimer=setTimeout(()=>{if(step===from&&step<activeSteps().length-1&&valid(step))show(step+1)},380);
  }
  function data(){
    // Read only the ACTIVE mode's panes. The modal holds both the discovery
    // steps and the strategy steps in the DOM, and several field names are
    // shared (name/email/phone/clinic/city/goal/timeline). A plain FormData
    // read would collect both copies and send arrays like ["Kim",""] — the
    // free-redesign Albato flow rendered those blank and GHL rejected them.
    const o={};
    modal.querySelectorAll('#km-form input, #km-form select, #km-form textarea').forEach(el=>{
      if(!el.name||el.disabled)return;
      const pane=el.closest('[data-mode]');
      if(pane&&pane.getAttribute('data-mode')!==paneMode())return;
      if((el.type==='radio'||el.type==='checkbox')&&!el.checked)return;
      const v=el.value;
      if(o[el.name]!==undefined){o[el.name]=[].concat(o[el.name],v)}else o[el.name]=v;
    });
     ['services','challenges','tried'].forEach(k=>{if(o[k]&&!Array.isArray(o[k]))o[k]=[o[k]]});
    return o;
  }
  function fit(d){ // simple lead score for your CRM (0–100)
    if(source==='strategy'){
      const p={'Foundation':50,'Essential':75,'Growth':90}[d.program]||0;
      const w={'As soon as possible':10,'In the next 1–3 months':7,'3+ months out':3}[d.timeline]||0;
      return Math.min(100,p+w);
    }
    let s=0; const b={'Under $1,000':5,'$1,000 – $2,000':20,'$2,000 – $3,500':32,'$3,500+':40}[d.budget]||0;
    const t={'Just me':6,'2–3':14,'4–8':22,'9 or more':25}[d.therapists]||0;
    const c={'Solo practitioner':20,'Independent clinic':20,'Multi-clinic owner':25,'Franchise / clinic group':2,'Independent clinic (owner-operated)':20,'Small group (2–5 locations)':16,'Franchise or corporate chain location':2}[d.clinic_type]||0;
    const w={'As soon as possible':15,'In the next 1–3 months':11,'3+ months out':5,'Just exploring':2}[d.timeline]||0;
    return Math.min(100,b+t+c+w);
  }
  async function next(){
    if(!valid(step))return;
    const steps=activeSteps();
    if(step<steps.length-1){show(step+1);return}
    const d=data(); d.source=source==='free-redesign'?'free-website-redesign':source; d.fit_score=fit(d); d.page=location.pathname; d.context=window.kmContext||null; d.submitted_at=new Date().toISOString();
    const url=source==='strategy'?window.KM_CONFIG.STRATEGY_WEBHOOK_URL:source==='free-redesign'?window.KM_CONFIG.FREE_REDESIGN_WEBHOOK_URL:window.KM_CONFIG.WEBHOOK_URL;
    if(url){try{await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)})}catch(e){}}
    clearDraft(); // submitted — never show the resume pill again for this draft
    modal.querySelector('#km-book').href=source==='strategy'?window.KM_CONFIG.STRATEGY_BOOKING_URL:source==='free-redesign'?window.KM_CONFIG.FREE_REDESIGN_BOOKING_URL:window.KM_CONFIG.BOOKING_URL;
    show('done');
    refreshResumeUI();
  }
  // Draft persistence: answers + current step + furthest step + source mode.
  // Stored under the existing km-intake key. New format is {v:1,source,step,
  // maxStep,updated_at,data:{...}}; old flat {name:...,services:[...]} drafts
  // are still read (treated as a step-0 discovery draft).
  function readDraft(){
    let d; try{d=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null')}catch(e){return null}
    if(!d||typeof d!=='object'||Array.isArray(d))return null;
    if(d.v===1&&d.data){
      if(d.updated_at&&Date.now()-new Date(d.updated_at).getTime()>DRAFT_TTL_MS)return null;
      return d;
    }
    return {v:0,source:'discovery',step:0,maxStep:0,updated_at:null,data:d};
  }
  function draftHasAnswers(d){
    return !!(d&&d.data&&Object.keys(d.data).some(k=>{const v=d.data[k];return Array.isArray(v)?v.length>0:String(v||'').trim()!==''}));
  }
  function clearDraft(){try{localStorage.removeItem(DRAFT_KEY)}catch(e){}}
  function saveDraft(){
    try{
      localStorage.setItem(DRAFT_KEY,JSON.stringify({v:1,source,step:typeof step==='number'?step:0,maxStep,updated_at:new Date().toISOString(),data:data()}));
    }catch(e){}
  }
  function loadDraft(){
    const d=readDraft(); if(!d||!draftHasAnswers(d))return;
    // Scope the restore to the draft's own mode. All three modes live in
    // ONE form, so same-named radios (therapists, timeline, budget …) are a
    // single radio group document-wide: checking a value in every pane
    // leaves only the LAST pane's copy checked and silently drops the
    // answer from the mode the visitor actually used. (Caught by the resume
    // test: therapists was restored into the free-redesign pane instead of
    // the discovery pane, and the submitted payload lost it entirely.)
    const mode=d.source==='strategy'?'strategy':d.source==='free-redesign'?'free-redesign':'discovery';
    Object.entries(d.data).forEach(([k,v])=>{[].concat(v).forEach(val=>{
      const els=modal.querySelectorAll(`[data-mode="${mode}"] [name="${k}"]`); els.forEach(el=>{if(el.type==='radio'||el.type==='checkbox'){if(el.value===val)el.checked=true}else el.value=val})})})}
  // Resume pill + CTA swap. Shown only while an unfinished draft exists.
  let resumeEl=null;
  function ensureResumeEl(){
    if(resumeEl)return resumeEl;
    resumeEl=document.createElement('div'); resumeEl.className='km-resume'; resumeEl.hidden=true;
    resumeEl.innerHTML=`<button type="button" class="km-resume-go"></button><button type="button" class="km-resume-x" aria-label="Hide this reminder">×</button>`;
    resumeEl.querySelector('.km-resume-go').addEventListener('click',()=>{const d=readDraft();if(d)open(d.source||'discovery')});
    resumeEl.querySelector('.km-resume-x').addEventListener('click',()=>{try{sessionStorage.setItem('km-resume-hidden','1')}catch(e){}resumeEl.hidden=true});
    document.body.appendChild(resumeEl); return resumeEl;
  }
  function swapCtas(on){
    document.querySelectorAll('[data-book="discovery"]').forEach(el=>{
      const long=el.querySelector('.cta-long'), short=el.querySelector('.cta-short');
      if(long){
        if(el.dataset.kmOrig===undefined)el.dataset.kmOrig=long.textContent;
        long.textContent=on?'Continue your discovery call':el.dataset.kmOrig;
        if(short){if(el.dataset.kmOrigShort===undefined)el.dataset.kmOrigShort=short.textContent;short.textContent=on?'Continue call':el.dataset.kmOrigShort}
      }else{
        if(el.dataset.kmOrig===undefined)el.dataset.kmOrig=el.textContent;
        el.textContent=on?'Continue your discovery call':el.dataset.kmOrig;
      }
    });
  }
  function refreshResumeUI(){
    const d=readDraft(), has=draftHasAnswers(d), pill=ensureResumeEl();
    if(!has){pill.hidden=true;swapCtas(false);return}
    const steps=d.source==='strategy'?STRATEGY_STEPS:d.source==='free-redesign'?FREE_STEPS:STEPS;
    const s=Math.min(d.step||0,steps.length-1);
    const label=d.source==='strategy'?'Continue your strategy call':d.source==='free-redesign'?'Continue your free redesign call':'Continue your discovery call';
    pill.querySelector('.km-resume-go').textContent=`${label} — you're on step ${s+1} of ${steps.length}`;
    let dismissed=false; try{dismissed=sessionStorage.getItem('km-resume-hidden')==='1'}catch(e){}
    pill.hidden=dismissed;
    swapCtas(d.source==='discovery'); // only discovery CTAs change; strategy/free-redesign resume via the pill
  }
  let lastFocus=null;
  function open(src){if(!modal)build(); source=src||'discovery'; lastFocus=document.activeElement; modal.hidden=false; document.documentElement.style.overflow='hidden';
    modal.querySelector('#km-form').reset(); loadDraft();
    modal.querySelector('#km-eyebrow').textContent=source==='strategy'?'Book a strategy call':source==='free-redesign'?'Book a free website redesign call':'Book a discovery call';
    // Resume where the visitor left off — but only for the same mode, so a
    // discovery draft never leaks into the strategy or free-redesign form.
    let resumeStep=0; maxStep=0;
    const d=readDraft();
    if(d&&(d.source===source||(!d.source&&source==='discovery'))){resumeStep=Math.min(d.step||0,activeSteps().length-1);maxStep=Math.min(d.maxStep||resumeStep,activeSteps().length-1)}
    show(resumeStep);
    if(window.kmPrefill){Object.entries(window.kmPrefill).forEach(([k,v])=>{modal.querySelectorAll(`[data-mode="${paneMode()}"] [name="${k}"]`).forEach(el=>{if(el.type==='radio'||el.type==='checkbox'){if(el.value===v)el.checked=true}else el.value=v})})}
    updateStrategyPrices();
    saveDraft();}
  function close(){modal.hidden=true;document.documentElement.style.overflow='';if(lastFocus)lastFocus.focus();refreshResumeUI()}
  window.kmOpenBooking=open;
  document.addEventListener('click',e=>{const t=e.target.closest('[data-book]');if(t){e.preventDefault();const p=t.getAttribute('data-program'),b=t.getAttribute('data-billing');if(p||b)window.kmPrefill={...(p?{program:p}:{}),...(b?{billing:b}:{})};open(t.getAttribute('data-book'))}});
  refreshResumeUI(); // show the Continue pill on load if a draft is waiting
})();
