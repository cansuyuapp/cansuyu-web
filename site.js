const VIEWS = ['anasayfa', 'uygulama', 'ciftlik', 'oyunlar', 'iletisim', 'indir'];
const viewElements = new Map([...document.querySelectorAll('[data-view]')].map(element => [element.dataset.view, element]));
const navLinks = [...document.querySelectorAll('[data-nav]')];
const menu = document.getElementById('mobile-nav');
const menuButton = document.getElementById('menu-toggle');
const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const normalizeView = hash => VIEWS.includes(hash.replace(/^#/, '')) ? hash.slice(1) : 'anasayfa';
function closeMenu() {
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Menüyü aç');
}
function showView(active = normalizeView(location.hash)) {
  viewElements.forEach((element, key) => { element.hidden = key !== active; });
  navLinks.forEach(link => {
    const selected = link.dataset.nav === active;
    link.classList.toggle('active', selected);
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.title = active === 'anasayfa' ? 'Can Suyu · Çalıştıkça dünya renklenir' :
    (viewElements.get(active).querySelector('h2')?.textContent.replace(/\s+/g, ' ').trim() || 'Can Suyu') + ' · Can Suyu';
  closeMenu();
  if (active !== 'uygulama') stopFocus();
  window.scrollTo(0, 0);
}
menuButton.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
// Show the selected section while keeping the browser address clean.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = link.getAttribute('href').slice(1);
    if (target === 'icerik') {
      event.preventDefault();
      document.getElementById('icerik').focus();
    } else if (VIEWS.includes(target)) {
      event.preventDefault();
      showView(target);
    }
  });
});
window.addEventListener('hashchange', () => {
  showView(normalizeView(location.hash));
  history.replaceState(null, '', location.pathname + location.search);
});

const tabs = [...document.querySelectorAll('[data-app-tab]')];
function selectTab(tab) {
  for (const candidate of tabs) {
    const selected = candidate === tab;
    candidate.classList.toggle('selected', selected);
    candidate.setAttribute('aria-selected', String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute('aria-controls')).hidden = !selected;
  }
  if (tab.dataset.appTab !== 'focus') stopFocus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const offset = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (offset === undefined && event.key !== 'Home' && event.key !== 'End') return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + offset + tabs.length) % tabs.length;
    selectTab(tabs[next]);
    tabs[next].focus();
  });
});
let focusSeconds = 20;
let focusTimer = null;
const focusTime = document.getElementById('focus-time');
const focusState = document.getElementById('focus-state');
const focusButton = document.getElementById('focus-toggle');
const clock = document.querySelector('.focus-clock');
function renderFocus() {
  focusTime.textContent = '00:' + String(focusSeconds).padStart(2, '0');
  clock.style.setProperty('--angle', String((20 - focusSeconds) * 18) + 'deg');
}
function stopFocus() {
  if (focusTimer) clearInterval(focusTimer);
  focusTimer = null;
  focusButton.textContent = focusSeconds === 0 ? 'Yeniden dene ↻' : 'Denemeyi başlat ▶';
  if (focusSeconds > 0) focusState.textContent = 'Hazır mısın?';
}
focusButton.addEventListener('click', () => {
  if (focusTimer) { stopFocus(); return; }
  if (focusSeconds === 0) focusSeconds = 20;
  renderFocus();
  focusButton.textContent = 'Duraklat ❚❚';
  focusState.textContent = 'Bir nefes, bir adım.';
  focusTimer = setInterval(() => {
    focusSeconds--;
    renderFocus();
    if (focusSeconds === 0) {
      clearInterval(focusTimer);
      focusTimer = null;
      focusState.textContent = 'Harika! Başardın 🎉';
      focusButton.textContent = 'Yeniden dene ↻';
      confetti(35);
    }
  }, 1000);
});
function confetti(count = 25) {
  if (motionReduced) return;
  const layer = document.getElementById('confetti-layer');
  const colors = ['#f3789a','#ffc55d','#a4dc92','#a8c9f5','#bd9def'];
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = (5 + Math.random() * 90) + 'vw';
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = (Math.random() * .35) + 's';
    piece.style.animationDuration = (1.4 + Math.random() * .8) + 's';
    layer.append(piece);
    setTimeout(() => piece.remove(), 2600);
  }
}
const feelings = ['Harikasın! Bugün bir filiz daha 🌱', 'Yavaş da gitsen, ilerliyorsun ☀️', 'Molanın da değeri var 💛'];
let feelingIndex = 0;
document.getElementById('surprise').addEventListener('click', event => {
  event.currentTarget.textContent = feelings[feelingIndex++ % feelings.length];
  confetti(23);
});
let drops = 0;
const waterButton = document.getElementById('water-button');
const tree = document.getElementById('farm-tree');
const drop = document.getElementById('water-drop');
waterButton.addEventListener('click', () => {
  drops++;
  document.getElementById('water-count').textContent = 'Bugün ' + drops + ' damla su verdin. ' + (drops >= 5 ? 'Ağacın çok mutlu! 🍎' : 'İyi ki geldin! 🌼');
  tree.classList.remove('grow');
  drop.classList.remove('fall');
  void tree.offsetWidth;
  tree.classList.add('grow');
  drop.classList.add('fall');
  if (drops % 5 === 0) confetti(25);
});
const icons = ['🍓','🌱','🍊'];
const grid = document.getElementById('memory-grid');
const gameStatus = document.getElementById('game-status');
let deck = [];
let opened = [];
let matched = 0;
let blocked = false;
let mismatchTimer = null;
function resetGame() {
  if (mismatchTimer) clearTimeout(mismatchTimer);
  mismatchTimer = null; opened = []; matched = 0; blocked = false;
  deck = [...icons, ...icons].sort(() => Math.random() - .5);
  grid.replaceChildren();
  deck.forEach((icon, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'memory-card';
    button.setAttribute('aria-label', String(index + 1) + '. kapalı kart');
    button.textContent = '✿';
    button.addEventListener('click', () => flip(index, button));
    grid.append(button);
  });
  gameStatus.textContent = 'Kartları çevirip üç çifti eşleştir!';
}
function flip(index, button) {
  if (blocked || button.classList.contains('flipped') || button.classList.contains('matched')) return;
  button.classList.add('flipped');
  button.innerHTML = '<span>' + deck[index] + '</span>';
  button.setAttribute('aria-label', deck[index] + ' kartı');
  opened.push({ index, button });
  if (opened.length !== 2) return;
  if (deck[opened[0].index] === deck[opened[1].index]) {
    opened.forEach(item => { item.button.classList.add('matched'); item.button.disabled = true; });
    opened = []; matched++;
    gameStatus.textContent = matched === 3 ? 'Üç eşleşme! Bahçenin hafızası sende 🎉' : matched + '/3 çift tamamlandı. Devam!';
    if (matched === 3) confetti(38);
  } else {
    blocked = true;
    mismatchTimer = setTimeout(() => {
      opened.forEach(item => {
        item.button.classList.remove('flipped');
        item.button.textContent = '✿';
        item.button.setAttribute('aria-label', String(item.index + 1) + '. kapalı kart');
      });
      opened = []; blocked = false; mismatchTimer = null;
    }, 750);
  }
}
document.getElementById('game-reset').addEventListener('click', resetGame);
resetGame();
const gallery = document.getElementById('gallery-dialog');
document.querySelectorAll('.gallery-tile').forEach(tile => tile.addEventListener('click', () => {
  const picture = tile.querySelector('img');
  const full = document.getElementById('gallery-full');
  full.src = picture.src;
  full.alt = picture.alt;
  document.getElementById('gallery-caption').textContent = tile.querySelector('strong').textContent;
  gallery.showModal();
}));
document.getElementById('gallery-close').addEventListener('click', () => gallery.close());
gallery.addEventListener('click', event => { if (event.target === gallery) gallery.close(); });
document.getElementById('year').textContent = String(new Date().getFullYear());
showView();
if (location.hash) history.replaceState(null, '', location.pathname + location.search);
