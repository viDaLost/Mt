// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }

    const menu = document.getElementById('main-menu');
    const gameBoard = document.getElementById('game-board');
    const startButton = document.getElementById('start-game');
    const showRulesButton = document.getElementById('show-rules');
    const changeLangButton = document.getElementById('change-lang');
    const rulesModal = document.getElementById('rules-modal');
    const closeModal = document.querySelector('.close');
    
    // Элементы игры
    const cells = document.querySelectorAll('[data-cell]');
    const opponentPieces = document.getElementById('opponent-pieces');
    const playerPieces = document.getElementById('player-pieces');
    const currentPlayerInfo = document.getElementById('current-player');
    const statusMessage = document.getElementById('status-message');
    const restartButton = document.getElementById('restart-game');

    let selectedPiece = null;
    let currentPlayer = 'player';
    let playerTurn = true;
    let gameActive = true;
    let piecesRemaining = 10;
    
    // Игровое состояние
    const gameState = Array(9).fill(null);
    const playerPiecesState = [5,4,3,2,1];
    const opponentPiecesState = [5,4,3,2,1];

    // Переводы
    const translations = {
        ru: {
            rulesTitle: "Правила игры",
            rulesText: `"Матрёшки" — это улучшенная версия крестиков-ноликов на поле 3x3. У каждого из двух игроков есть по 5 фигур в виде матрёшек разного размера (от самой маленькой до самой большой).`,
            start: "Начать игру",
            rules: "Правила",
            lang: "EN/RU",
            playerTurn: "Ход: Игрок",
            opponentTurn: "Ход: Соперник",
            victory: "Победа!",
            draw: "Ничья!",
            restart: "Начать заново"
        },
        en: {
            rulesTitle: "Game Rules",
            rulesText: `"Matryoshka" is an enhanced version of tic-tac-toe on a 3x3 board. Each of the two players has 5 figures in the form of matryoshka dolls of different sizes (from the smallest to the largest).`,
            start: "Start Game",
            rules: "Rules",
            lang: "RU/EN",
            playerTurn: "Turn: Player",
            opponentTurn: "Turn: Opponent",
            victory: "Victory!",
            draw: "Draw!",
            restart: "Restart Game"
        }
    };
    let currentLang = 'ru';

    // Инициализация
    init();

    function init() {
        setupEventListeners();
        updateTranslations();
        renderPieces();
    }

    function setupEventListeners() {
        startButton.addEventListener('click', startGame);
        showRulesButton.addEventListener('click', () => rulesModal.style.display = 'block');
        closeModal.addEventListener('click', () => rulesModal.style.display = 'none');
        changeLangButton.addEventListener('click', () => {
            currentLang = currentLang === 'ru' ? 'en' : 'ru';
            updateTranslations();
        });
        restartButton.addEventListener('click', restartGame);

        cells.forEach(cell => {
            cell.addEventListener('click', handleCellClick);
        });
    }

    function updateTranslations() {
        const t = translations[currentLang];
        startButton.textContent = t.start;
        showRulesButton.textContent = t.rules;
        changeLangButton.textContent = t.lang;
        document.getElementById('rules-title').textContent = t.rulesTitle;
        document.getElementById('rules-text').textContent = t.rulesText;
        statusMessage.textContent = '';
    }

    function startGame() {
        menu.classList.remove('active');
        gameBoard.classList.remove('hidden');
        menu.style.display = 'none';
        gameBoard.style.display = 'flex';
        currentPlayer = 'player';
        playerTurn = true;
        gameActive = true;
        piecesRemaining = 10;
        gameState.fill(null);
        playerPiecesState.splice(0, playerPiecesState.length, 5,4,3,2,1);
        opponentPiecesState.splice(0, opponentPiecesState.length, 5,4,3,2,1);
        selectedPiece = null;
        statusMessage.textContent = '';
        restartButton.classList.add('hidden');
        currentPlayerInfo.textContent = translations[currentLang].playerTurn + ' 1';
        renderPieces();
        clearBoard();
    }

    function restartGame() {
        startGame();
    }

    function clearBoard() {
        cells.forEach(cell => {
            cell.innerHTML = '';
        });
    }

    function renderPieces() {
        opponentPieces.innerHTML = '';
        playerPieces.innerHTML = '';

        // Оппонент
        opponentPiecesState.forEach(size => {
            const img = document.createElement('img');
            img.src = `svg/purple_${size}.svg`;
            img.className = 'piece';
            img.dataset.size = size;
            opponentPieces.appendChild(img);
        });

        // Игрок
        playerPiecesState.forEach(size => {
            const img = document.createElement('img');
            img.src = `svg/black_${size}.svg`;
            img.className = 'piece';
            img.dataset.size = size;
            img.addEventListener('click', () => selectPiece(img, size));
            playerPieces.appendChild(img);
        });
    }

    function selectPiece(pieceElement, size) {
        if (!playerTurn || !gameActive) return;

        // Если уже выбрана та же фигура - отмена выбора
        if (selectedPiece === pieceElement) {
            pieceElement.classList.remove('selected');
            selectedPiece = null;
            return;
        }

        // Снять выделение с предыдущей
        if (selectedPiece) {
            selectedPiece.classList.remove('selected');
        }

        // Выбрать новую
        selectedPiece = pieceElement;
        selectedPiece.classList.add('selected');
    }

    function handleCellClick(e) {
        if (!playerTurn || !gameActive || !selectedPiece) return;

        const cell = e.currentTarget;
        const index = parseInt(cell.dataset.index) || Array.from(cells).indexOf(cell);
        
        // Проверить, можно ли разместить фигуру
        const currentSize = parseInt(selectedPiece.dataset.size);
        const cellContent = cell.querySelector('.piece');
        
        let cellSize = 0;
        if (cellContent) {
            cellSize = parseInt(cellContent.dataset.size);
        }

        if (cellSize >= currentSize) {
            // Нельзя ставить на такую же или большую
            return;
        }

        // Удалить фигуру из списка игрока
        const sizeIndex = playerPiecesState.indexOf(currentSize);
        if (sizeIndex > -1) {
            playerPiecesState.splice(sizeIndex, 1);
        }

        // Удалить старую фигуру с ячейки, если есть
        if (cellContent) {
            cell.removeChild(cellContent);
        }

        // Создать новую фигуру
        const newPiece = selectedPiece.cloneNode(true);
        newPiece.classList.remove('selected');
        newPiece.style.maxWidth = '90%';
        newPiece.style.height = 'auto';
        newPiece.dataset.size = currentSize;
        cell.appendChild(newPiece);
        
        // Обновить состояние
        gameState[index] = { player: true, size: currentSize };
        piecesRemaining--;
        selectedPiece.remove();
        selectedPiece = null;
        renderPieces();
        
        // Проверить победу
        if (checkWin(index, true)) {
            endGame(true);
            return;
        }

        // Проверить ничью
        if (piecesRemaining === 0) {
            endGame(false);
            return;
        }

        // Переключить ход
        currentPlayer = 'opponent';
        playerTurn = false;
        currentPlayerInfo.textContent = translations[currentLang].opponentTurn;
        
        // Ход компьютера (простой AI)
        setTimeout(makeAIMove, 500);
    }

    function makeAIMove() {
        if (!gameActive) return;

        // Простой AI: выбирает первую доступную клетку
        const availableCells = Array.from(cells).filter((cell, i) => !gameState[i]);
        if (availableCells.length === 0) return;

        // Выбрать случайную клетку
        const randomIndex = Math.floor(Math.random() * availableCells.length);
        const cell = availableCells[randomIndex];
        const index = Array.from(cells).indexOf(cell);

        // Выбрать случайную доступную фигуру
        const availableSizes = opponentPiecesState.filter(size => {
            const cellContent = cell.querySelector('.piece');
            let cellSize = 0;
            if (cellContent) {
                cellSize = parseInt(cellContent.dataset.size);
            }
            return cellSize < size;
        });

        if (availableSizes.length === 0) {
            // Нет доступных фигур - пропуск хода
            playerTurn = true;
            currentPlayerInfo.textContent = translations[currentLang].playerTurn + ' 1';
            return;
        }

        const selectedSize = availableSizes[0]; // В реальной игре можно улучшить выбор
        const sizeIndex = opponentPiecesState.indexOf(selectedSize);
        if (sizeIndex > -1) {
            opponentPiecesState.splice(sizeIndex, 1);
        }

        // Удалить старую фигуру с ячейки, если есть
        const cellContent = cell.querySelector('.piece');
        if (cellContent) {
            cell.removeChild(cellContent);
        }

        // Создать новую фигуру
        const newPiece = document.createElement('img');
        newPiece.src = `svg/purple_${selectedSize}.svg`;
        newPiece.className = 'piece';
        newPiece.dataset.size = selectedSize;
        newPiece.style.maxWidth = '90%';
        newPiece.style.height = 'auto';
        cell.appendChild(newPiece);
        
        // Обновить состояние
        gameState[index] = { player: false, size: selectedSize };
        piecesRemaining--;
        
        // Перерисовать фигуры
        renderPieces();
        
        // Проверить победу
        if (checkWin(index, false)) {
            endGame(false);
            return;
        }

        // Проверить ничью
        if (piecesRemaining === 0) {
            endGame(false);
            return;
        }

        // Переключить ход
        currentPlayer = 'player';
        playerTurn = true;
        currentPlayerInfo.textContent = translations[currentLang].playerTurn + ' 1';
    }

    function checkWin(index, isPlayer) {
        const winPatterns = [
            [0,1,2], [3,4,5], [6,7,8], // Rows
            [0,3,6], [1,4,7], [2,5,8], // Columns
            [0,4,8], [2,4,6]           // Diagonals
        ];

        return winPatterns.some(pattern => {
            return pattern.every(i => {
                return gameState[i] && gameState[i].player === isPlayer;
            });
        });
    }

    function endGame(isPlayerWin) {
        gameActive = false;
        if (isPlayerWin) {
            statusMessage.textContent = translations[currentLang].victory;
        } else if (piecesRemaining === 0) {
            statusMessage.textContent = translations[currentLang].draw;
        } else {
            statusMessage.textContent = translations[currentLang].victory + ' Соперник';
        }
        restartButton.classList.remove('hidden');
    }
});
