const heart = document.createElement('div');
heart.style.width = '100px';
heart.style.height = '100px';
heart.style.backgroundColor = 'red';
heart.style.clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
heart.style.position = 'absolute';
heart.style.top = '50%';
heart.style.left = '50%';
heart.style.transform = 'translate(-50%, -50%)';
heart.style.cursor = 'pointer';
document.body.appendChild(heart);

const message = document.createElement('div');
message.textContent = 'Chit loves you.';
message.style.color = 'white';
message.style.fontSize = '24px';
message.style.textAlign = 'center';
message.style.opacity = '0';
message.style.transition = 'opacity 1s';
document.body.appendChild(message);

document.addEventListener('DOMContentLoaded', function(){
  heart.classList.add('beating');
  const btn = document.getElementById('heartButton');
  let done = false;

  function reveal(){
    if(done) return;
    done = true;
    // stop beating, play dissolve
    heart.classList.remove('beating');
    heart.classList.add('dissolve');

    // after dissolve finishes, hide heart and show message
    heart.addEventListener('animationend', function onEnd(){
      heart.removeEventListener('animationend', onEnd);
      // hide button visually but keep in DOM for accessibility if needed
      btn.style.display = 'none';
      message.classList.add('show');
      message.setAttribute('aria-hidden','false');
      // small focus for screen readers
      message.setAttribute('tabindex','-1');
      message.focus?.();
    }, { once:true });
  }

  // accept both touch and click
  btn.addEventListener('click', reveal, { passive:true });
  btn.addEventListener('touchstart', function handler(e){
    e.preventDefault();
    reveal();
  }, { once:true });

  // also support keyboard
  btn.addEventListener('keyup', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      reveal();
    }
  });
});