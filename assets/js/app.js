const STORAGE_KEYS = {
  grandBoard: 'novedraw.grandBoard',
  normalBoard: 'novedraw.normalBoard',
};

const PRIZES = [
  { name: '大獎 - 永BAN', chance: 1, type: 'grand' },
  { name: '普通獎 - 禁止留言600秒', chance: 9, type: 'normalWin' },
  { name: '沒中獎 - 哈哈 雜魚', chance: 45, type: 'lose' },
  { name: '沒中獎 - 真沒用', chance: 45, type: 'lose' },
];

const CHEAT_NAMES = ['達克仔', '達克', '諾芙', 'nove', 'nove.exe'];

const CHEAT_PRIZE = {
  name: '立刻匯款500萬到達克仔戶頭',
  chance: 0,
  type: 'cheat',
};

const state = {
  grandBoard: loadBoard(STORAGE_KEYS.grandBoard),
  normalBoard: loadBoard(STORAGE_KEYS.normalBoard),
  isDrawing: false,
};

const elements = {
  username: document.getElementById('username'),

  grandBoardList: document.getElementById('grandBoardList'),
  grandBoardEmpty: document.getElementById('grandBoardEmpty'),
  resetGrandBoardButton: document.getElementById('resetGrandBoardButton'),

  normalBoardList: document.getElementById('normalBoardList'),
  normalBoardEmpty: document.getElementById('normalBoardEmpty'),
  resetNormalBoardButton: document.getElementById('resetNormalBoardButton'),

  resultsSection: document.getElementById('resultsSection'),
  resultsContainer: document.getElementById('resultsContainer'),
  resultsPlaceholder: document.getElementById('resultsPlaceholder'),
  probabilityList: document.getElementById('probabilityList'),

  drawOnceButton: document.getElementById('drawOnceButton'),
  drawTenButton: document.getElementById('drawTenButton'),
  clearResultsButton: document.getElementById('clearResultsButton'),

  grandModal: document.getElementById('grandModal'),
  grandModalMessage: document.getElementById('grandModalMessage'),
  grandModalCloseButton: document.getElementById('grandModalCloseButton'),
};

initialize();

function initialize() {
  renderProbabilityList();
  renderGrandBoard();
  renderNormalBoard();
  bindEvents();
}

function bindEvents() {
  elements.drawOnceButton.addEventListener('click', () => drawPrize(1));
  elements.drawTenButton.addEventListener('click', () => drawPrize(10));
  elements.clearResultsButton.addEventListener('click', clearResults);

  elements.resetGrandBoardButton.addEventListener('click', resetGrandBoard);
  elements.resetNormalBoardButton.addEventListener('click', resetNormalBoard);

  elements.grandModalCloseButton.addEventListener('click', closeGrandModal);
  elements.grandModal.addEventListener('click', (event) => {
    if (event.target === elements.grandModal || event.target.classList.contains('modal__backdrop')) {
      closeGrandModal();
    }
  });

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

  const isCheatMode = isCheatName(username);
  const drawTimes = isCheatMode ? 1 : times;

  for (let index = 0; index < drawTimes; index += 1) {
    const prize = isCheatMode ? CHEAT_PRIZE : getPrize();

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

    handlePrizeRecord(username, prize);

    await delay(drawTimes === 1 ? 0 : 180);
  }

  scrollToResults();

  state.isDrawing = false;
  setButtonsDisabled(false);
}

function isCheatName(username) {
  const normalizedUsername = username.toLowerCase();
  return CHEAT_NAMES.some((name) => name.toLowerCase() === normalizedUsername);
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

function handlePrizeRecord(username, prize) {
  if (prize.type === 'grand') {
    addBoardRecord({
      boardName: 'grandBoard',
      storageKey: STORAGE_KEYS.grandBoard,
      username,
      prizeName: prize.name,
    });
    renderGrandBoard();
    openGrandModal('永Ban再見');
    return;
  }

  if (prize.type === 'normalWin') {
    addBoardRecord({
      boardName: 'normalBoard',
      storageKey: STORAGE_KEYS.normalBoard,
      username,
      prizeName: prize.name,
    });
    renderNormalBoard();
    return;
  }

  if (prize.type === 'cheat') {
    addBoardRecord({
      boardName: 'grandBoard',
      storageKey: STORAGE_KEYS.grandBoard,
      username,
      prizeName: prize.name,
    });
    renderGrandBoard();
    openGrandModal('立刻匯款500萬到達克仔戶頭');
  }
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
  if (type === 'normalWin') return 'result-card--normal-win';
  if (type === 'cheat') return 'result-card--cheat';
  if (type === 'lose') return 'result-card--lose';
  return '';
}

function addBoardRecord({ boardName, storageKey, username, prizeName }) {
  const timestamp = new Date().toLocaleString('zh-Hant', {
    hour12: false,
  });

  state[boardName].unshift({
    username,
    prizeName,
    timestamp,
  });

  saveBoard(storageKey, state[boardName]);
}

function renderGrandBoard() {
  renderBoard({
    listElement: elements.grandBoardList,
    emptyElement: elements.grandBoardEmpty,
    records: state.grandBoard,
  });
}

function renderNormalBoard() {
  renderBoard({
    listElement: elements.normalBoardList,
    emptyElement: elements.normalBoardEmpty,
    records: state.normalBoard,
  });
}

function renderBoard({ listElement, emptyElement, records }) {
  listElement.innerHTML = '';

  if (records.length === 0) {
    emptyElement.hidden = false;
    return;
  }

  emptyElement.hidden = true;

  records.forEach((record) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <strong>${escapeHtml(record.username)}</strong><br>
      ${escapeHtml(record.prizeName)}<br>
      <span>${escapeHtml(record.timestamp)}</span>
    `;
    listElement.appendChild(item);
  });
}

function renderProbabilityList() {
  elements.probabilityList.innerHTML = '';

  PRIZES.forEach((prize) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${escapeHtml(prize.name)}</strong><span>${prize.chance}%</span>`;
    elements.probabilityList.appendChild(item);
  });
}

function resetGrandBoard() {
  state.grandBoard = [];
  saveBoard(STORAGE_KEYS.grandBoard, state.grandBoard);
  renderGrandBoard();
}

function resetNormalBoard() {
  state.normalBoard = [];
  saveBoard(STORAGE_KEYS.normalBoard, state.normalBoard);
  renderNormalBoard();
}

function clearResults() {
  elements.resultsContainer.innerHTML = '';
  elements.resultsPlaceholder.hidden = false;
}

function setButtonsDisabled(isDisabled) {
  elements.drawOnceButton.disabled = isDisabled;
  elements.drawTenButton.disabled = isDisabled;
}

function scrollToResults() {
  elements.resultsSection.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

function openGrandModal(message) {
  elements.grandModalMessage.textContent = message;
  elements.grandModal.hidden = false;
  document.body.classList.add('modal-open');
}

function closeGrandModal() {
  elements.grandModal.hidden = true;
  document.body.classList.remove('modal-open');
}

function loadBoard(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBoard(storageKey, value) {
  localStorage.setItem(storageKey, JSON.stringify(value));
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
