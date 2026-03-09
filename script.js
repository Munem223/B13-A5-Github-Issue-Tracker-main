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

const issuesContainer = document.getElementById('issuesContainer');
const loader = document.getElementById('loader');
const emptyState = document.getElementById('emptyState');
const issueCount = document.getElementById('issueCount');
const panelText = document.getElementById('panelText');
const openCount = document.getElementById('openCount');
const closedCount = document.getElementById('closedCount');

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function setLoading(show) {
  loader.classList.toggle('hidden', !show);
  if (show) {
    issuesContainer.innerHTML = '';
    emptyState.classList.add('hidden');
  }
}

function updateStats(sourceList = state.allIssues, visibleList = state.currentIssues) {
  const openIssues = sourceList.filter(issue => issue.status === 'open').length;
  const closedIssues = sourceList.filter(issue => issue.status === 'closed').length;

  openCount.textContent = openIssues;
  closedCount.textContent = closedIssues;
  issueCount.textContent = visibleList.length;

  if (state.currentQuery.trim()) {
    panelText.textContent = `Search results for "${state.currentQuery.trim()}"`;
    return;
  }

  if (state.currentFilter === 'all') {
    panelText.textContent = 'Showing all available issues';
  } else {
    panelText.textContent = `Showing ${state.currentFilter} issues only`;
  }
}

function createIssueCard(issue) {
  const labels = issue.labels?.length
    ? `<div class="label-badges">${issue.labels.map(label => `<span class="badge">${label}</span>`).join('')}</div>`
    : '<span class="meta-value">No label</span>';

  return `
    <article class="issue-card ${issue.status}" data-id="${issue.id}">
      <h4>${issue.title}</h4>
      <p>${issue.description}</p>
      <div class="meta-list">
        <div class="meta-row">
          <span class="meta-label">Status</span>
          <span class="meta-value">${issue.status}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Author</span>
          <span class="meta-value">${issue.author || 'Unknown'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Priority</span>
          <span class="meta-value">${issue.priority || 'N/A'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Label</span>
          ${labels}
        </div>
        <div class="meta-row">
          <span class="meta-label">Created</span>
          <span class="meta-value">${formatDate(issue.createdAt)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderIssues(issues) {
  state.currentIssues = issues;
  updateStats(state.allIssues, issues);

  if (!issues.length) {
    issuesContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  issuesContainer.innerHTML = issues.map(createIssueCard).join('');
}

function getFilteredIssues(issues, filter) {
  if (filter === 'all') return issues;
  return issues.filter(issue => issue.status === filter);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load data');
  }
  return response.json();
}

async function loadIssues() {
  try {
    setLoading(true);
    const result = await fetchJson(`${API_BASE}/issues`);
    state.allIssues = result.data || [];
    const filtered = getFilteredIssues(state.allIssues, state.currentFilter);
    renderIssues(filtered);
  } catch (error) {
    emptyState.classList.remove('hidden');
    emptyState.innerHTML = `<h3>Something went wrong</h3><p>${error.message}</p>`;
  } finally {
    setLoading(false);
  }
}

updateAuthView();