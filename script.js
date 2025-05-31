const mainMenu = document.getElementById("main-menu");
const gameScreen = document.getElementById("game-screen");
const btnStart = document.getElementById("btn-start");
const btnRules = document.getElementById("btn-rules");
const modalRules = document.getElementById("modal-rules");
const closeModal = document.querySelector(".close");
const btnLang = document.getElementById("btn-lang");

const boardEl = document.getElementById("board");
const enemyPiecesEl = document.getElementById("enemy-pieces");
const playerPiecesEl = document.getElementById("player-pieces");
const turnInfoEl = document.getElementById("turn-info");

let currentLang = "ru";
let currentPlayerIndex = 0;

const translations = {
  ru: {
    start: "Начать игру",
    rules: "Правила",
    lang: "🇷🇺 / 🇬🇧",
    turn: "Ход игрока:",
    winner: "Победил игрок",
    draw: "Ничья!",
  },
  en: {
    start: "Start Game",
    rules: "Rules",
    lang: "🇬🇧 / 🇷🇺",
    turn: "Player's turn:",
    winner: "Winner",
    draw: "Draw!",
  }
};

// Цвета игроков
const players = ["black", "purple"];

// Размеры матрёшек
let playerPieces = [1, 2, 3, 4, 5]; // игрок использует purple
let enemyPieces = [1, 2, 3, 4, 5];  // бот или второй игрок использует black

let boardState = Array(9).fill(null); // { size, owner }

btnStart.addEventListener("click", () => {
  showGame();
});

btnRules.addEventListener("click", () => {
  modalRules.classList.remove("hidden");
});

closeModal.addEventListener("click", () => {
  modalRules.classList.add("hidden");
});

btnLang.addEventListener("click", () => {
  currentLang = currentLang === "ru" ? "en" : "ru";
  btnLang.textContent = translations[currentLang].lang;
});

function showGame() {
  mainMenu.style.display = "none";
  gameScreen.classList.remove("hidden");
  renderPieces();
  renderBoard();
  updateTurn();
}

async function renderPieces() {
  playerPiecesEl.innerHTML = "";
  enemyPiecesEl.innerHTML = "";

  for (const size of [...enemyPieces].sort((a,b) => b - a)) {
    const svg = await loadSVG(size, players[0]);
    svg.className = "piece";
    svg.dataset.size = size;
    svg.addEventListener("click", () => selectEnemyPiece(size));
    enemyPiecesEl.appendChild(svg.cloneNode(true));
  }

  for (const size of [...playerPieces].sort((a,b) => b - a)) {
    const svg = await loadSVG(size, players[1]);
    svg.className = "piece";
    svg.dataset.size = size;
    svg.addEventListener("click", () => selectPlayerPiece(size));
    playerPiecesEl.appendChild(svg.cloneNode(true));
  }
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("click", () => onCellClick(i));

    if (boardState[i]) {
      const { size, owner } = boardState[i];
      const svg = createSVGElement();
      svg.innerHTML = getSVGContent(owner, size);
      cell.appendChild(svg);
    }

    boardEl.appendChild(cell);
  }
}

async function loadSVG(size, color) {
  const response = await fetch(`svg/${color}_${size}.svg`);
  const text = await response.text();
  const div = document.createElement("div");
  div.innerHTML = text;
  return div.querySelector("svg");
}

function createSVGElement() {
  return document.createElementNS("http://www.w3.org/2000/svg", "svg");
}

function getSVGContent(owner, size) {
  return document.querySelector(`svg[data-owner="${owner}"][data-size="${size}"]`)?.innerHTML || "";
}

function updateTurn() {
  turnInfoEl.textContent = `${translations[currentLang].turn} ${players[currentPlayerIndex] === "black" ? "🖤" : "💜"}`;
}

let selectedSize = null;

function selectPlayerPiece(size) {
  if (currentPlayerIndex !== 1) return;
  highlightSelected(playerPiecesEl, size);
  selectedSize = size;
}

function selectEnemyPiece(size) {
  if (currentPlayerIndex !== 0) return;
  highlightSelected(enemyPiecesEl, size);
  selectedSize = size;
}

function highlightSelected(container, size) {
  Array.from(container.children).forEach(el => {
    el.classList.toggle("selected", el.dataset.size == size);
  });
}

function onCellClick(index) {
  if (!selectedSize) return;

  const cell = boardState[index];
  const isPlayer = currentPlayerIndex === 1;

  if (cell && cell.size >= selectedSize) {
    alert("Нельзя перекрывать такую же или большую матрёшку!");
    return;
  }

  const piecesList = isPlayer ? playerPieces : enemyPieces;

  const pieceIndex = piecesList.indexOf(selectedSize);
  if (pieceIndex === -1) return;

  piecesList.splice(pieceIndex, 1);

  boardState[index] = {
    size: selectedSize,
    owner: currentPlayerIndex
  };

  renderPieces();
  renderBoard();

  if (checkWin(currentPlayerIndex)) {
    setTimeout(() => alert(`${translations[currentLang].winner} ${players[currentPlayerIndex] === "black" ? "🖤" : "💜"}`), 100);
    resetGame();
    return;
  }

  if (playerPieces.length === 0 && enemyPieces.length === 0) {
    setTimeout(() => alert(translations[currentLang].draw), 100);
    resetGame();
    return;
  }

  selectedSize = null;
  currentPlayerIndex = 1 - currentPlayerIndex;
  updateTurn();
}

function checkWin(playerIndex) {
  const lines = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return lines.some(line => {
    return line.every(i => {
      const cell = boardState[i];
      return cell && cell.owner === playerIndex;
    });
  });
}

function resetGame() {
  boardState = Array(9).fill(null);
  playerPieces = [1, 2, 3, 4, 5];
  enemyPieces = [1, 2, 3, 4, 5];
  currentPlayerIndex = 0;
  selectedSize = null;
  renderPieces();
  renderBoard();
  updateTurn();
}
