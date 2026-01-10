
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

// overlay dynamically create
const overlay = document.createElement('div');
overlay.id = 'nav-overlay';
document.body.appendChild(overlay);

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  overlay.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);

hamburger.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

overlay.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  overlay.classList.remove('active');
});


/* =======================
   SEARCH BAR LOGIC
======================= */

const sBar = document.querySelector('.s_bar input');
const sBtn = document.querySelector('.s_bar button');

function runSearch() {
  if (!sBar.value.trim()) return;

  const value = sBar.value.trim();
  const words = value.split(/\s+/);

  sessionStorage.setItem('searchValueN', value);
  sessionStorage.setItem('searchValueA', JSON.stringify(words));

  sBar.value = '';
  window.location.href = '/SEARCH';
}

sBtn.addEventListener('click', runSearch);

sBar.addEventListener('keydown', e => {
  if (e.key === 'Enter') runSearch();
});


/* =======================
   URL ID PARSER (FIXED)
======================= */

function getSearchId() {
  const url = new URL(window.location.href);

  // /SEARCH and /SEARCH/ normalize
  const path = url.pathname.replace(/\/$/, '');

  if (path === '/SEARCH') {
    const id = url.searchParams.get('id');
    if (id && /^\d{4}$/.test(id)) {
      return id;
    }
  }
  return null;
}


/* =======================
   PAGE LOAD HANDLING
======================= */

window.onload = () => {
  const savedText = sessionStorage.getItem('searchValueN');
  const searchId = getSearchId();

  // search text restore
  if (savedText && window.location.pathname.startsWith('/SEARCH')) {
    sBar.value = savedText;
    sessionStorage.removeItem('searchValueN');
  }

  // id based search
  if (searchId) {
    sessionStorage.setItem(
      'searchValueA',
      JSON.stringify([searchId]) // always array
    );
  }
};


/* =======================
   FOOTER / CONTACT INFO
======================= */

const contactNumber = '+8801872605055';
const contactMail = 'officialelectronicsstore@gmail.com';

const contact = [
  'Narayanganj, Dhaka, Bangladesh',
  contactNumber,
  contactMail
];

const links = [
  'https://www.facebook.com/officialelectronicsstore',
  'https://www.instagram.com/officialelectronicsstore',
  'https://youtube.com/@officialelectronicsstore',
  'https://wa.me/8801872605055',
  '/',
  '/404',
  '/404',
  'https://www.google.com/maps?q=23.6818337,90.4797731',
  'tel:' + contactNumber,
  'mailto:' + contactMail
];

document.querySelectorAll('.addI').forEach((el, i) => {
  el.textContent = contact[i];
});

document.querySelectorAll('.link').forEach((el, i) => {
  el.href = links[i];
});
