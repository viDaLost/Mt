// --- Игра "Матрёшки" ---

// Путь к svg в твоём репозитории (замени URL на свой репозиторий, если нужно)
const svgBasePath = "svg/";

const BOARD_SIZE = 3;
const PIECE_SIZES = [5, 4, 3, 2, 1];

// Игроки: 1 - чёрный, 2 - фиолетовый
const players = [1, 2];

// Состояние игры
let board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
// Каждая клетка будет объектом: {player: 1|2, size: 1..5}

// У каждого игрока есть по 5 фигурок
let pieceSets = {
  1: [...PIECE_SIZES], // Черные
  2: [...PIECE_SIZES]  // Фиолетовые
};

let currentPlayer = 1;
let selectedSize = null;

// DOM элементы
const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game");
const boardEl = document.getElementById("board");
const playerPiecesEl = document.getElementById("player-pieces");
const opponentPiecesEl = document.getElementById("opponent-pieces");
const statusEl = document.getElementById("status");
const startBtn = document.getElementById("start-btn");
const rulesBtn = document.getElementById("rules-btn");
const langBtn = document.getElementById("lang-btn");
const resetBtn = document.getElementById("reset-btn");
const floatingContainer = document.getElementById("floating-matryoshkas");

// --- Вспомогательные функции ---

function pieceFilename(player, size) {
  const color = player === 1 ? "black" : "purple";
  return `${svgBasePath}${color}_${size}.svg`;
}

// Проверка на победу
function checkWin() {
  // Проверяем все линии 3 в ряд по правилам
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // горизонтали
    [0,3,6],[1,4,7],[2,5,8], // вертикали
    [0,4,8],[2,4,6]          // диагонали
  ];

  for (const line of lines) {
    const cells = line.map(i => board[i]);
    if (cells.every(c => c && c.player === currentPlayer)) {
      return true;
    }
  }
  return false;
}

// Проверка на ничью: если у обоих игроков не осталось фигур
function checkDraw() {
  return pieceSets[1].length === 0 && pieceSets[2].length === 0;
}

// Обновить статус хода
function updateStatus(msg) {
  if (msg) {
    statusEl.textContent = msg;
  } else {
    statusEl.textContent = t("yourTurn") + currentPlayer;
  }
}

// Очистить выбор фигуры
function clearSelection() {
  selectedSize = null;
  document.querySelectorAll(".piece.selected").forEach(el => {
    el.classList.remove("selected");
  });
}

// Отобразить игровое поле
function renderBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;

    if (board[i]) {
      const img = document.createElement("img");
      img.src = pieceFilename(board[i].player, board[i].size);
      img.alt = `Player ${board[i].player} piece size ${board[i].size}`;
      cell.appendChild(img);
    }

    // Обработчик клика по клетке
    cell.onclick = () => {
      if (selectedSize === null) return;
      handleCellClick(i);
    };

    boardEl.appendChild(cell);
  }
}

// Отобразить фигуры игрока
function renderPieces() {
  playerPiecesEl.innerHTML = "";
  opponentPiecesEl.innerHTML = "";

  // Игрок (снизу)
  pieceSets[currentPlayer].slice().sort((a,b) => b - a).forEach(size => {
    const piece = createPieceElement(currentPlayer, size);
    piece.onclick = () => selectPiece(size);
    playerPiecesEl.appendChild(piece);
  });

  // Противник (сверху)
  const opponent = currentPlayer === 1 ? 2 : 1;
  pieceSets[opponent].slice().sort((a,b) => b - a).forEach(size => {
    const piece = createPieceElement(opponent, size);
    opponentPiecesEl.appendChild(piece);
  });
}

function createPieceElement(player, size) {
  const img = document.createElement("img");
  img.src = pieceFilename(player, size);
  img.alt = `Player ${player} piece size ${size}`;
  img.className = "piece";
  img.style.width = (size * 20 + 24) + "px";
  img.style.height = "auto";
  return img;
}

function selectPiece(size) {
  // Если уже выбрали эту же — отменяем выбор
  if (selectedSize === size) {
    clearSelection();
    return;
  }

  selectedSize = size;
  // Подсветить выбранную фигуру
  document.querySelectorAll("#player-pieces .piece").forEach(img => {
    img.classList.remove("selected");
    if (img.src.includes(`_${size}.svg`)) {
      img.classList.add("selected");
    }
  });
}

function handleCellClick(index) {
  const cell = board[index];

  if (cell && cell.player === currentPlayer) {
    updateStatus("Нельзя перекрывать свои матрёшки");
    return;
  }

  if (cell && cell.size >= selectedSize) {
    updateStatus("Можно перекрыть только меньшую матрёшку соперника");
    return;
  }

  // Ставим матрёшку
  board[index] = {
    player: currentPlayer,
    size: selectedSize
  };

  // Убираем из набора игрока
  const idx = pieceSets[currentPlayer].indexOf(selectedSize);
  if (idx !== -1) pieceSets[currentPlayer].splice(idx, 1);

  clearSelection();

  renderBoard();
  renderPieces();

  // Проверка победы
  if (checkWin()) {
    updateStatus(t("win").replace("{n}", currentPlayer));
    endGame();
    saveGameState();
    return;
  }

  // Проверка ничьи
  if (checkDraw()) {
    updateStatus(t("draw"));
    endGame();
    saveGameState();
    return;
  }

  // Меняем игрока
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  updateStatus();
  saveGameState();
}

function startGame() {
  mainMenu.style.display = "none";
  gameScreen.style.display = "block";

  // Инициализация
  board = Array(BOARD_SIZE * BOARD_SIZE).fill(null);
  pieceSets = {
    1: [...PIECE_SIZES],
    2: [...PIECE_SIZES]
  };
  currentPlayer = 1;
  selectedSize = null;

  renderBoard();
  renderPieces();
  updateStatus();

  saveGameState();
}

function endGame() {
  // Блокируем поле — можно отключить обработчики
  boardEl.querySelectorAll(".cell").forEach(cell => {
    cell.onclick = null;
  });
  clearSelection();
}

function saveGameState() {
  localStorage.setItem("gameState", JSON.stringify({
    board,
    currentPlayer,
    pieceSets,
    lang: currentLang
  }));
}

function loadGameState() {
  const saved = localStorage.getItem("gameState");
  if (!saved) return false;
  try {
    const data = JSON.parse(saved);
    if (!data.board || !data.pieceSets || !data.currentPlayer) return false;
    board = data.board;
    pieceSets = data.pieceSets;
    currentPlayer = data.currentPlayer;
    if (data.lang) currentLang = data.lang;

    loadLanguage(currentLang).then(() => {
      mainMenu.style.display = "none";
      gameScreen.style.display = "block";
      renderBoard();
      renderPieces();
      updateStatus();
    });
    return true;
  } catch {
    return false;
  }
}

// --- Плавающие матрёшки на главном экране ---

function createFloatingMatryoshkas() {
  const count = 8;
  floatingContainer.innerHTML = "";

  for(let i=0; i<count; i++) {
    const size = 1 + Math.floor(Math.random()*5);
    const player = i % 2 === 0 ? 1 : 2;
    const img = document.createElement("img");
    img.src = pieceFilename(player, size);
    img.className = "floating-piece";
    img.style.left = (i * 50 + Math.random()*20) + "px";
    img.style.width = (size*20 + 24) + "px";
    img.style.animationDuration = (6 + Math.random()*4) + "s";
    img.style.animationDelay = (-Math.random()*6) + "s";
    floatingContainer.appendChild(img);
  }
}

// --- Обработчики кнопок ---

startBtn.onclick = () => {
  startGame();
};
langBtn.onclick = () => {
  toggleLanguage();
};
resetBtn.onclick = () => {
  localStorage.removeItem("gameState");
  startGame();
};
rulesBtn.onclick = () => {
  alert((translations.rulesContent || []).join("\n\n"));
};

// При загрузке страницы
window.onload = () => {
  createFloatingMatryoshkas();
  loadLanguage(currentLang).then(() => {
    // Попытка загрузить сохранённую игру
    if (!loadGameState()) {
      mainMenu.style.display = "block";
      gameScreen.style.display = "none";
    }
  });
};

// Сохраняем состояние при каждом клике на доске или выборе фигуры через saveGameState()
