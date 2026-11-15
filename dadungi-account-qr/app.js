'use strict';
const installArea = document.getElementById('install-area');
const installButton = document.getElementById('install-button');
const help = document.getElementById('install-help');
const cacheNote = document.getElementById('cache-note');
const standalone = window.matchMedia('(display-mode: standalone)');
let installPrompt = null;

function updateDisplayMode() {
  installArea.hidden = standalone.matches || window.navigator.standalone === true;
}
updateDisplayMode();
if (standalone.addEventListener) standalone.addEventListener('change', updateDisplayMode);

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installArea.hidden = true;
  if (help.open) help.close();
});

function showHelp() {
  if (typeof help.showModal === 'function') help.showModal();
  else help.setAttribute('open', '');
}
function closeHelp() {
  if (typeof help.close === 'function') help.close();
  else help.removeAttribute('open');
}
installButton.addEventListener('click', async () => {
  if (!installPrompt) { showHelp(); return; }
  const prompt = installPrompt;
  installPrompt = null;
  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome !== 'accepted') showHelp();
  } catch { showHelp(); }
});
document.getElementById('close-help').addEventListener('click', closeHelp);
document.getElementById('done-help').addEventListener('click', closeHelp);
help.addEventListener('click', event => { if (event.target === help) {
  const rect = help.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeHelp();
}});
if (/Android/i.test(navigator.userAgent)) {
  const android = document.getElementById('android-help');
  help.insertBefore(android, document.getElementById('iphone-help'));
}

if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', async () => {
    try {
      await navigator.serviceWorker.register('./sw.js', {scope: './'});
      await navigator.serviceWorker.ready;
      cacheNote.textContent = '이 기기에 QR 저장 완료 · 오프라인에서도 열 수 있어요';
    } catch {
      cacheNote.textContent = '오프라인 저장이 안 됐어요. 인터넷 연결 후 다시 열어 주세요.';
    }
  });
}
