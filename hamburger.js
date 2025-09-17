const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
});

hamburger.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  }
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

function getSearchId() {
  const url = location.href;
  
  if (url.includes("/SEARCH")) {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    
    if (id && /^\d{4}$/.test(id)) {
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

if (window.location.pathname === '/SEARCH/') {
  const savedValue = sessionStorage.getItem('searchValueN');
  const val = getSearchId();
  if (savedValue) {
    sBar.value = savedValue;
    sessionStorage.setItem('searchValueN', '');
  }else if (val) {
  sBar.value = `#${val}`;
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
