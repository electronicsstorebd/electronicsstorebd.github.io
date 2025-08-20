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

sBtn.addEventListener('click', runSearch);

sBar.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    runSearch();
  }
});

if (window.location.pathname === '/SEARCH/') {
  const savedValue = sessionStorage.getItem('searchValueN');
  if (savedValue) {
    sBar.value = savedValue;
    sessionStorage.setItem('searchValueN', '');
  }
}
