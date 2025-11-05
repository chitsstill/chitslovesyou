// Replace the simple DOM heart with a responsive, interactive heart that beats,
// responds to touch/press, dissolves on click into a message, and emits little particles.

(function(){
  // inject styles
  const css = `
    html,body{height:100%;margin:0;background:#000;font-family:system-ui,-apple-system,Segoe UI,Roboto,"Helvetica Neue",Arial;color:#fff}
    .stage{height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:4vmin;position:relative;overflow:hidden}
    .heart{width:74vmin;max-width:420px;height:auto;color:#e11b3b;fill:currentColor;transform-origin:50% 60%;cursor:pointer;touch-action:none}
    @keyframes beat {0%{transform:scale(1)}12%{transform:scale(1.12)}28%{transform:scale(0.98)}44%{transform:scale(1.06)}60%{transform:scale(1)}100%{transform:scale(1)}}
    .beating{animation:beat 0.9s ease-in-out infinite;filter:drop-shadow(0 10px 20px rgba(225,27,59,0.25))}
    .fast{animation-duration:0.45s !important}
    .dissolve{animation:heart-dissolve 0.8s forwards ease;pointer-events:none}
    @keyframes heart-dissolve {0%{opacity:1;transform:scale(1)}40%{opacity:0.9;transform:scale(1.06) rotate(1deg)}100%{opacity:0;transform:scale(1.6) rotate(6deg);filter:blur(6px)}}
    .message{position:absolute;color:#fff;font-size:10vmin;letter-spacing:0.16rem;opacity:0;transform:translateY(6vh) scale(0.98);transition:opacity .8s ease,transform .8s ease;text-align:center;padding:0 5vw;pointer-events:none;user-select:none}
    .message.show{opacity:1;transform:translateY(0) scale(1)}
    .particle{position:absolute;width:18px;height:18px;color:#ff6b8a;fill:currentColor;pointer-events:none;will-change:transform,opacity}
    @media (max-width:420px){ .message{font-size:12vmin} .heart{width:88vmin} .particle{width:14px;height:14px} }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // prepare stage
  document.body.innerHTML = ''; // clear existing
  const stage = document.createElement('main');
  stage.className = 'stage';
  document.body.appendChild(stage);

  // create accessible button wrapper
  const btn = document.createElement('button');
  btn.setAttribute('aria-label','Show message');
  btn.style.background = 'transparent';
  btn.style.border = 'none';
  btn.style.padding = '0';
  btn.style.margin = '0';
  btn.style.display = 'inline-block';
  btn.style.lineHeight = '0';
  btn.style.touchAction = 'manipulation';
  stage.appendChild(btn);

  // SVG heart
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('viewBox','0 0 32 29.6');
  svg.classList.add('heart','beating');
  svg.innerHTML = '<path d="M23.6 0c-2.9 0-5.4 1.7-6.6 4.1C15.8 1.7 13.3 0 10.4 0 4.7 0 0 4.7 0 10.4 0 18 10.2 23.6 16 29.6c5.8-6 16-11.6 16-19.2C32 4.7 27.3 0 23.6 0z"/>';
  btn.appendChild(svg);

  // message
  const message = document.createElement('div');
  message.className = 'message';
  message.textContent = 'chits loves you';
  message.setAttribute('aria-hidden','true');
  stage.appendChild(message);

  // utilities
  let revealed = false;
  let restoreTimer = null;
  const messages = [
    'chits loves you',
    'chits loves you so much',
    'chits loves you with all my heart',
    'chits loves you forever and always',
    'chits loves you more than words can say ❤️'
  ];
  let msgIndex = 0;

  function vib(ms){ if(navigator.vibrate) navigator.vibrate(ms); }

  // particle generator (scales with intensity)
  function emitParticles(x,y,count=12,scale=1){
    for(let i=0;i<count;i++){
      const p = document.createElement('svg');
      p.className = 'particle';
      p.setAttribute('viewBox','0 0 32 29.6');
      p.innerHTML = '<path d="M23.6 0c-2.9 0-5.4 1.7-6.6 4.1C15.8 1.7 13.3 0 10.4 0 4.7 0 0 4.7 0 10.4 0 18 10.2 23.6 16 29.6c5.8-6 16-11.6 16-19.2C32 4.7 27.3 0 23.6 0z"/>';
      const r = 200 + Math.round(Math.random()*55);
      const g = 30 + Math.round(Math.random()*80);
      const b = 60 + Math.round(Math.random()*80);
      p.style.color = `rgb(${r},${g},${b})`;
      const startX = x - 12 + (Math.random()*24);
      const startY = y - 12 + (Math.random()*24);
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.width = `${Math.max(12, 18*scale * (0.8 + Math.random()*0.8))}px`;
      p.style.height = p.style.width;
      stage.appendChild(p);

      const angle = Math.random()*Math.PI*2;
      const dist = (60 + Math.random()*140) * scale;
      const endX = startX + Math.cos(angle)*dist;
      const endY = startY - Math.abs(Math.sin(angle))* (120 + Math.random()*120) * scale;
      p.style.transition = `transform ${800+Math.random()*600}ms cubic-bezier(.2,.8,.2,1), opacity 900ms linear`;
      requestAnimationFrame(()=>{
        p.style.transform = `translate(${endX-startX}px, ${endY-startY}px) rotate(${Math.random()*360}deg) scale(${0.6+Math.random()*0.9})`;
        p.style.opacity = '0';
      });
      setTimeout(()=>p.remove(), 1800 + Math.random()*600);
    }
  }

  // interactive press: speed up beat while pressed
  function onPointerDown(e){
    if(revealed) return;
    svg.classList.add('fast');
    vib(15);
  }
  function onPointerUp(e){
    if(revealed) return;
    svg.classList.remove('fast');
  }

  // restore heart so it comes back after dissolve + message
  function restoreHeart(){
    if (restoreTimer) {
      clearTimeout(restoreTimer);
      restoreTimer = null;
    }
    // hide message first
    message.classList.remove('show');
    message.setAttribute('aria-hidden','true');

    // small delay to allow hide transition
    setTimeout(()=>{
      btn.style.display = '';
      // briefly pop in
      svg.classList.remove('dissolve');
      svg.classList.add('beating');
      revealed = false;
      // advance to a more heartfelt message up to last one
      msgIndex = Math.min(msgIndex + 1, messages.length - 1);
      // subtle pulse to celebrate returning
      svg.classList.add('fast');
      setTimeout(()=>svg.classList.remove('fast'), 650);
    }, 600);
  }

  // reveal function
  function reveal(){
    if(revealed) return;
    revealed = true;
    if (restoreTimer) { clearTimeout(restoreTimer); restoreTimer = null; }

    vib([40,20,40]);
    // dissolve heart
    svg.classList.remove('beating');
    svg.classList.add('dissolve');

    // compute center for particles
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    // particle intensity increases as messages get more heartfelt
    const intensity = 1 + (msgIndex * 0.4);
    emitParticles(cx, cy, Math.round(12 * intensity), 1 + msgIndex*0.15);

    // set message text for this reveal
    message.textContent = messages[msgIndex] || messages[messages.length - 1];

    svg.addEventListener('animationend', ()=>{
      btn.style.display = 'none';
      message.classList.add('show');
      message.setAttribute('aria-hidden','false');
      message.setAttribute('tabindex','-1');
      message.focus?.();

      // after a short pause, bring the heart back with a more heartfelt message
      // longer pause for later messages
      const pause = 2200 + (msgIndex * 500);
      restoreTimer = setTimeout(() => {
        restoreHeart();
      }, pause);
    }, { once:true });
  }

  // reset on long-press of message (for fun) or double-tap on background
  let lastTap = 0;
  stage.addEventListener('dblclick', ()=>{
    if(!revealed) return;
    // immediate reset
    revealed = false;
    if (restoreTimer) { clearTimeout(restoreTimer); restoreTimer = null; }
    btn.style.display = '';
    svg.classList.remove('dissolve');
    svg.classList.add('beating');
    message.classList.remove('show');
    message.setAttribute('aria-hidden','true');
  });

  // attach events
  btn.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    reveal();
  }, { passive:false });

  // also support keyboard
  btn.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      reveal();
    }
  });

  // initial micro-animation to draw attention after a short delay
  setTimeout(()=>{ if(!revealed) { svg.classList.add('fast'); setTimeout(()=>svg.classList.remove('fast'), 700); } }, 1200);

})();