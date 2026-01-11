const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const savedValue = sessionStorage.getItem('searchValueN');

// overlay ডাইনামিকভাবে তৈরি করা হচ্ছে
const overlay = document.createElement('div');
overlay.id = 'nav-overlay';
document.body.appendChild(overlay); // body-র শেষে যুক্ত হচ্ছে

function toggleMenu() {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  overlay.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);

hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    toggleMenu();
  }
});

// overlay তে ক্লিক করলে সব বন্ধ হবে
overlay.addEventListener('click', () => {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  overlay.classList.remove('active');
});
const sBar = document.querySelector('.s_bar input');
const sBtn = document.querySelector('.s_bar button');

function runSearch() {
  if (!sBar.value) return;
  const sVal = sBar.value;
  const arr = sVal.trim().split(/\s+/);
  
  sessionStorage.setItem("searchValueA", JSON.stringify(arr));
  sessionStorage.setItem('searchValueN', sVal);
  sBar.value = '';
  window.location.href = '/SEARCH';
}
/*
function getSearchId() {
  const url = location.href;
  
  if (url.includes("/SEARCH")) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    
    // শুধু ৪ সংখ্যার হলে valid  
    if (id && /^\d{4}$/.test(id)) {
      return id;
    }
    
  }
  return null;
}
*/
function getSearchId() {
  const url = new URL(window.location.href);
  const path = url.pathname.replace(/\/$/, '');

  if (path.endsWith('/SEARCH')) {
    let id = url.searchParams.get('id');

    if (id && /^\d{4}$/.test(id)) {
      id = "#" + id;
      return id;
    }
  }
  return null;
}

sBtn.addEventListener('click', runSearch);

sBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    runSearch();
  }
});

if (window.location.pathname.startsWith('/SEARCH')) {
  if (savedValue) {
    sBar.value = savedValue;
    sessionStorage.setItem('searchValueN', '');
  }
}

const contactNumber = '+880 1872-605055';
const contactMaill = 'officialelectronicsstore@gmail.com';
const contact = [
  "Narayanganj, Dhaka, Bangladesh",
  contactNumber,
  contactMaill
];
const links = [
  "https://www.facebook.com/officialelectronicsstore",
  "https://www.instagram.com/officialelectronicsstore",
  "https://youtube.com/@officialelectronicsstore",
  "https://wa.me/8801872605055",
  "/",
  "/404",
  "/404",
  "https://www.google.com/maps?q=23.6818337,90.4797731",
  "tel:" + contactNumber,
  "mailto:" + contactMaill
];
document.querySelectorAll('.addI').forEach((e, n) => {
  e.innerHTML = contact[n];
});
document.querySelectorAll('.link').forEach((e, n) => {
  e.href = links[n];
});

const val = getSearchId();

//window.onload = () => {
  if (val && !savedValue) {
    sBar.value = '';
    sessionStorage.setItem("searchValueA", JSON.stringify(val));
  }
//};
