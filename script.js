const board = document.getElementById("board");
const currentPlayerEl = document.getElementById("current-player");
const availablePiecesEl = document.getElementById("available-pieces");
const rulesBtn = document.getElementById("rules-btn");
const closeModal = document.getElementById("close-modal");
const modal = document.getElementById("modal");

let currentLang = "ru";
const translations = {
  ru: {
    title: "Матрёшки",
    rulesTitle: "Правила",
    playerTurn: "Ход игрока: ",
    piecesLeft: "Оставшиеся фигурки: ",
    winner: "Победитель: ",
    draw: "Ничья!",
  },
  en: {
    title: "Matrёshki",
    rulesTitle: "Rules",
    playerTurn: "Player's turn: ",
    piecesLeft: "Available pieces: ",
    winner: "Winner: ",
    draw: "Draw!",
  },
};

// Игровое состояние
let gameState = {
  players: ["🖤", "💜"],
  currentPlayerIndex: 0,
  piecesUsed: { "🖤": [], "💜": [] },
  board: Array(9).fill(null), // { symbol, size }
};

function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", onCellClick);
    board.appendChild(cell);
  }
}

async function updateUI() {
  // Обновляем доску
  for (let i = 0; i < 9; i++) {
    const cell = board.children[i];
    cell.innerHTML = "";
    if (gameState.board[i]) {
      const piece = gameState.board[i];
      const svg = await loadSVG(piece.size, piece.symbol === "🖤" ? "black" : "purple");
      cell.appendChild(svg);
    }
  }

  // Текущий игрок
  const player = gameState.players[gameState.currentPlayerIndex];
  currentPlayerEl.textContent = `${translations[currentLang].playerTurn}${player}`;

  // Доступные фигурки
  availablePiecesEl.innerHTML = `<strong>${translations[currentLang].piecesLeft}</strong> `;
  const usedSizes = new Set(gameState.piecesUsed[player]);
  for (let size = 1; size <= 5; size++) {
    if (!usedSizes.has(size)) {
      const svg = await loadSVG(size, player === "🖤" ? "black" : "purple");
      svg.style.height = "24px";
      availablePiecesEl.appendChild(svg.cloneNode(true));
    }
  }
}

async function loadSVG(size, color) {
  const response = await fetch(`svg/${color}_${size}.svg`);
  const text = await response.text();
  const wrapper = document.createElement("div");
  wrapper.innerHTML = text;
  const svg = wrapper.querySelector("svg");
  if (svg) {
    svg.classList.add("matryoshka");
    return svg;
  }
  return document.createTextNode("SVG ошибка");
}

async function onCellClick(e) {
  const cellIndex = parseInt(e.currentTarget.dataset.index);
  const player = gameState.players[gameState.currentPlayerIndex];
  const usedSizes = new Set(gameState.piecesUsed[player]);

  // Выбор размера
  const availableSizes = [1,2,3,4,5].filter(s => !usedSizes.has(s));
  if (availableSizes.length === 0) return;

  const chosenSizeStr = prompt(`${translations[currentLang].piecesLeft} ${availableSizes.join(", ")}. Введите размер:`);
  const chosenSize = parseInt(chosenSizeStr);

  if (!chosenSize || !availableSizes.includes(chosenSize)) {
    alert("Неверный размер.");
    return;
  }

  const targetCell = gameState.board[cellIndex];

  // Проверяем условия установки
  if (targetCell && targetCell.size >= chosenSize) {
    alert("Нельзя ставить на такую же или большую матрёшку!");
    return;
  }

  // Устанавливаем новую матрёшку
  gameState.board[cellIndex] = {
    symbol: player,
    size: chosenSize,
  };
  gameState.piecesUsed[player].push(chosenSize);

  checkWin(player);

  // Меняем игрока
  gameState.currentPlayerIndex = 1 - gameState.currentPlayerIndex;
  updateUI();
}

function checkWin(playerSymbol) {
  const winLines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (let line of winLines) {
    const [a,b,c] = line;
    if (
      gameState.board[a] && gameState.board[b] && gameState.board[c] &&
      gameState.board[a].symbol === playerSymbol &&
      gameState.board[b].symbol === playerSymbol &&
      gameState.board[c].symbol === playerSymbol
    ) {
      setTimeout(() => alert(`${translations[currentLang].winner}${playerSymbol}`), 100);
      resetGame();
      return;
    }
  }

  if (gameState.board.every(cell => cell !== null)) {
    setTimeout(() => alert(translations[currentLang].draw), 100);
    resetGame();
  }
}

function resetGame() {
  gameState = {
    players: ["🖤", "💜"],
    currentPlayerIndex: 0,
    piecesUsed: { "🖤": [], "💜": [] },
    board: Array(9).fill(null),
  };
  updateUI();
}

// Переключатель языка
document.getElementById("lang-select").addEventListener("change", (e) => {
  currentLang = e.target.value;
  document.getElementById("game-title").textContent = translations[currentLang].title;
  document.getElementById("rules-title").textContent = translations[currentLang].rulesTitle;
  updateUI();
});

// Модальное окно
rulesBtn.addEventListener("click", () => modal.classList.remove("hidden"));
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// Инициализация
createBoard();
updateUI();
