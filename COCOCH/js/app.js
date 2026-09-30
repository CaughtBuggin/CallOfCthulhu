// Application entry point and simple hash-based router.
import { renderCharacterList } from './ui/characterList.js';
import { renderCharacterSheet } from './ui/characterSheet.js';

const app = document.getElementById('app');

function navigate(view, id) {
  if (view === 'home') {
    location.hash = '#/';
  } else if (view === 'character' && id) {
    location.hash = '#/character/' + id;
  }
}

function route() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const navHome = document.getElementById('navHome');

  if (parts[0] === 'character' && parts[1]) {
    renderCharacterSheet(app, navigate, parts[1]);
    if (navHome) navHome.classList.remove('active');
  } else {
    renderCharacterList(app, navigate);
    if (navHome) navHome.classList.add('active');
  }
  window.scrollTo(0, 0);
}

document.getElementById('brandHome').addEventListener('click', () => navigate('home'));
document.getElementById('navHome').addEventListener('click', () => navigate('home'));
window.addEventListener('hashchange', route);

route();
