const STORAGE_KEYS = {
  leaderboard: 'novedraw.leaderboard',
  retryCount: 'novedraw.retryCount',
};

const PRIZES = [
  { name: '大獎 - 立牌（雙馬尾）', chance: 1, type: 'grand' },
  { name: '大獎 - 立牌（長髮）', chance: 1, type: 'grand' },
  { name: '再來一次', chance: 10, type: 'retry' },
  { name: '哈哈 沒抽到', chance: 88, type: 'normal' },
];

const state = {
  leaderboard: loadLeaderboard(),
  retryCount: loadRetryCount(),
  isDrawing: false,
};

const elements = {
  username: document.getElementById('username'),
  leaderboardList: document.getElementById('leaderboardList'),
  leaderboardEmpty: document.getElementById('leaderboardEmpty'),
  retryCount: document.getElementById('retryCount'),
  resultsContainer: document.getElementById('resultsContainer'),
  resultsPlaceholder: document.getElementById('resultsPlaceholder'),
  probabilityList: document.getElementById('probabilityList'),
  drawOnceButton: document.getElementById('drawOnceButton'),
  drawTenButton: document.getElementById('drawTenButton'),
  resetLeaderboardButton: document.getElementById('resetLeaderboardButton'),
  resetRetryButton: document.getElementById('resetRetryButton'),
  clearResultsButton: document.getElementById('clearResultsButton'),
};

initialize();

function initialize() {
  renderProbabilityList();
  renderLeaderboard();
  renderRetryCount();
  bindEvents();
}

function bindEvents() {
  elements.drawOnceButton.addEventListener('click', () => drawPrize(1));
  elements.drawTenButton.addEventListener('click', () => drawPrize(10));
  elements.resetLeaderboardButton.addEventListener('click', resetLeaderboard);
  elements.resetRetryButton.addEventListener('click', resetRetryCounter);
  elements.clearResultsButton.addEventListener('click', clearResults);
  elements.username.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      drawPrize(1);
    }
  });
}

async function drawPrize(times) {
  const username = elements.username.value.trim();
  if (!username) {
    window.alert('請輸入您的名稱！');
    elements.username.focus();
    return;
  }

  if (state.isDrawing) {
    return;
  }

  state.isDrawing = true;
  setButtonsDisabled(true);
  clearResults();

  for (let index = 0; index < times; index += 1) {
    const prize = getPrize();
    const resultCard = buildResultCard({
      username,
      drawNumber: index + 1,
      prize,
    });

    elements.resultsContainer.appendChild(resultCard);
    elements.resultsPlaceholder.hidden = true;

    requestAnimationFrame(() => {
      resultCard.classList.add('is-visible');
    });

    if (prize.type === 'grand') {
      addGrandPrizeRecord(username, prize.name);
    }

    if (prize.type === 'retry') {
      state.retryCount += 1;
      saveRetryCount();
      renderRetryCount();
    }

    await delay(times === 1 ? 0 : 180);
  }

  state.isDrawing = false;
  setButtonsDisabled(false);
}

function getPrize() {
  const totalChance = PRIZES.reduce((sum, prize) => sum + prize.chance, 0);
  const randomValue = Math.random() * totalChance;
  let cumulative = 0;

  for (const prize of PRIZES) {
    cumulative += prize.chance;
    if (randomValue < cumulative) {
      return prize;
    }
  }

  return PRIZES[PRIZES.length - 1];
}

function buildResultCard({ username, drawNumber, prize }) {
  const card = document.createElement('article');
  card.className = `result-card ${getResultModifierClass(prize.type)}`.trim();

  const meta = document.createElement('div');
  meta.className = 'result-card__meta';
  meta.innerHTML = `<span>${escapeHtml(username)}</span><span>第 ${drawNumber} 抽</span>`;

  const prizeText = document.createElement('div');
  prizeText.className = 'result-card__prize';
  prizeText.textContent = prize.name;

  card.appendChild(meta);
  card.appendChild(prizeText);
  return card;
}

function getResultModifierClass(type) {
  if (type === 'grand') return 'result-card--grand';
  if (type === 'retry') return 'result-card--retry';
  return '';
}

function addGrandPrizeRecord(username, prizeName) {
  const timestamp = new Date().toLocaleString('zh-Hant', {
    hour12: false,
  });

  state.leaderboard.unshift({
    username,
    prizeName,
    timestamp,
  });

  saveLeaderboard();
  renderLeaderboard();
}

function renderLeaderboard() {
  elements.leaderboardList.innerHTML = '';

  if (state.leaderboard.length === 0) {
    elements.leaderboardEmpty.hidden = false;
    return;
  }

  elements.leaderboardEmpty.hidden = true;

  state.leaderboard.forEach((record) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${escapeHtml(record.username)}</strong><br>
      ${escapeHtml(record.prizeName)}<br>
      <span>${escapeHtml(record.timestamp)}</span>
    `;
    elements.leaderboardList.appendChild(item);
  });
}

function renderRetryCount() {
  elements.retryCount.textContent = String(state.retryCount);
}

function renderProbabilityList() {
  elements.probabilityList.innerHTML = '';

  PRIZES.forEach((prize) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${escapeHtml(prize.name)}</strong><span>${prize.chance}%</span>`;
    elements.probabilityList.appendChild(item);
  });
}

function resetLeaderboard() {
  state.leaderboard = [];
  saveLeaderboard();
  renderLeaderboard();
}

function resetRetryCounter() {
  state.retryCount = 0;
  saveRetryCount();
  renderRetryCount();
}

function clearResults() {
  elements.resultsContainer.innerHTML = '';
  elements.resultsPlaceholder.hidden = false;
}

function setButtonsDisabled(isDisabled) {
  elements.drawOnceButton.disabled = isDisabled;
  elements.drawTenButton.disabled = isDisabled;
}

function loadLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.leaderboard);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeaderboard() {
  localStorage.setItem(STORAGE_KEYS.leaderboard, JSON.stringify(state.leaderboard));
}

function loadRetryCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.retryCount);
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function saveRetryCount() {
  localStorage.setItem(STORAGE_KEYS.retryCount, String(state.retryCount));
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
