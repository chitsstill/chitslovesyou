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

heart.addEventListener('click', () => {
    heart.style.transition = 'opacity 1s';
    heart.style.opacity = '0';
    message.style.opacity = '1';
});