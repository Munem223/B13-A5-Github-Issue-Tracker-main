const API_BASE = 'https://phi-lab-server.vercel.app/api/v1/lab';
const DEMO_USER = { username: 'admin', password: 'admin123' };

const state = {
  allIssues: [],
  currentIssues: [],
  currentFilter: 'all',
  currentQuery: ''
};

const loginPage = document.getElementById('loginPage');
const dashboardPage = document.getElementById('dashboardPage');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

function isLoggedIn() {
  return localStorage.getItem('issueTrackerAuth') === 'true';
}

function updateAuthView() {
  const loggedIn = isLoggedIn();
  loginPage.classList.toggle('hidden', loggedIn);
  dashboardPage.classList.toggle('hidden', !loggedIn);

  if (loggedIn) {
    loadIssues();
  }
}

loginForm.addEventListener('submit', event => {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    localStorage.setItem('issueTrackerAuth', 'true');
    loginError.textContent = '';
    updateAuthView();
    return;
  }

  loginError.textContent = 'Invalid username or password.';
});

updateAuthView();