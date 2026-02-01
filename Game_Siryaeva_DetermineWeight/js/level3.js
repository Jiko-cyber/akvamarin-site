const sublevels = [
    {
        id: 1,
        name: "Простой баланс",
        streams: 1,
        min: 1,
        max: 9,
        step: 1,
        speed: 1.4,
        interval: 2000,
        timeLimit: 40,
        points: 25
    },
    {
        id: 2,
        name: "Средний баланс",
        streams: 2,
        min: 10,
        max: 90,
        step: 10,
        speed: 1.3,
        interval: 1800,
        timeLimit: 50,
        points: 35
    },
    {
        id: 3,
        name: "Сложный баланс",
        streams: 2,
        min: 100,
        max: 900,
        step: 100,
        speed: 1.2,
        interval: 1600,
        timeLimit: 60,
        points: 50
    }
];

let currentSublevel = 0;
let gameScore = 0;
let gameRunning = false;
let spawnTimers = [];
let leftWeight = 0;
let rightWeight = 0;
let tableItems = [];
let gameTimer = null;
let timeLeft = 0;
let leftWeights = [];
let rightWeights = [];

const TABLE_LIMIT = 5;
const MAX_WEIGHTS_PER_BOWL = 6;

document.addEventListener('DOMContentLoaded', function () {
    gameScore = 0;
    startNextSublevel();
});

function startNextSublevel() {
    currentSublevel++;
    if (currentSublevel > sublevels.length) {
        finishGame();
        return;
    }

    const sublevel = sublevels[currentSublevel - 1];
    gameRunning = false;
    timeLeft = sublevel.timeLimit;
    leftWeight = 0;
    rightWeight = 0;
    leftWeights = [];
    rightWeights = [];
    tableItems = [];
    spawnTimers.forEach(t => clearInterval(t));
    spawnTimers = [];
    clearInterval(gameTimer);

    renderGame(sublevel);
    setTimeout(() => startLevel(sublevel), 1000);
}

function renderGame(sublevel) {
    document.getElementById('gameContainer').innerHTML = `
        <div class="sublevel-info">Подуровень ${currentSublevel} из 3: ${sublevel.name}</div>
        <div class="timer" id="timer">${timeLeft} сек</div>
        <div id="game">
            <div id="success">Баланс настроен!</div>
            <div id="left" class="scale">
                Левая чаша(<span id="leftValue">0</span>) <span id="leftCount">[0/${MAX_WEIGHTS_PER_BOWL}]</span>
                <div class="pile" id="leftPile"></div>
            </div>
            <div id="right" class="scale">
                Правая чаша (<span id="rightValue">0</span>) <span id="rightCount">[0/${MAX_WEIGHTS_PER_BOWL}]</span>
                <div class="pile" id="rightPile"></div>
            </div>
            <div id="table">
                <div class="table-label">Стол (макс. ${TABLE_LIMIT} гирь)</div>
            </div>
        </div>
        <div class="game-stats">
            <div class="stat-item">
                <div class="stat-value" id="currentGameScore">${gameScore}</div>
                <div class="stat-label">Очки в игре</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" id="totalScore">${getTotalScore()}</div>
                <div class="stat-label">Общий счет</div>
            </div>
        </div>
        <div id="result" style="margin: 15px 0; text-align: center; font-size: 1.3rem; min-height: 35px;"></div>
    `;
}

function startLevel(sublevel) {
    if (gameRunning) return;
    gameRunning = true;
    document.getElementById('success').style.display = 'none';
    startGameTimer(sublevel);

    for (let i = 0; i < sublevel.streams; i++) {
        spawnTimers.push(setInterval(() => spawnWeight(i, sublevel), sublevel.interval));
    }
}

function spawnWeight(stream, cfg) {
    if (!gameRunning) return;
    const steps = Math.floor((cfg.max - cfg.min) / cfg.step);
    const value = cfg.min + cfg.step * Math.floor(Math.random() * (steps + 1));
    const el = document.createElement('div');
    el.className = 'weight';
    el.innerText = value;
    el.dataset.value = value;
    el.dataset.id = Date.now() + Math.random();
    el.onTable = false;
    el.inBowl = false;

    const game = document.getElementById('game');
    const center = game.clientWidth / 2;
    const spacing = 150;
    const startX = center - ((cfg.streams - 1) * spacing) / 2;
    el.style.left = (startX + stream * spacing - 22) + 'px';
    el.style.top = '-45px';
    game.appendChild(el);
    startFalling(el, cfg.speed);
    makeDraggable(el, cfg.speed);
}

function startFalling(el, speed) {
    let y = el.offsetTop;
    clearInterval(el.fallTimer);
    el.fallTimer = setInterval(() => {
        if (!el.dragging && !el.onTable && !el.inBowl) {
            y += speed;
            el.style.top = y + 'px';
            if (y > 550) {
                clearInterval(el.fallTimer);
                el.remove();
            }
        }
    }, 16);
}

function makeDraggable(el, speed) {
    let ox, oy;
    const game = document.getElementById('game');
    const gameRect = game.getBoundingClientRect();

    el.addEventListener('mousedown', e => {
        if (!gameRunning) return;
        el.dragging = true;
        ox = e.clientX - el.getBoundingClientRect().left;
        oy = e.clientY - el.getBoundingClientRect().top;

        if (el.onTable) {
            tableItems = tableItems.filter(w => w.id !== el.dataset.id);
            el.onTable = false;
            el.classList.remove('on-table');
        }

        if (el.inBowl) {
            if (el.bowl === 'left') {
                leftWeight -= +el.dataset.value;
                leftWeights = leftWeights.filter(w => w.id !== el.dataset.id);
            } else if (el.bowl === 'right') {
                rightWeight -= +el.dataset.value;
                rightWeights = rightWeights.filter(w => w.id !== el.dataset.id);
            }
            el.inBowl = false;
            el.classList.remove('in-bowl');
            el.bowl = null;
        }

        clearInterval(el.fallTimer);
        e.preventDefault();
    });

    document.addEventListener('mousemove', e => {
        if (!el.dragging) return;
        const x = e.clientX - gameRect.left - ox;
        const y = e.clientY - gameRect.top - oy;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!el.dragging) return;
        el.dragging = false;

        const elRect = el.getBoundingClientRect();
        const leftScale = document.getElementById('left');
        const rightScale = document.getElementById('right');
        const table = document.getElementById('table');
        let placed = false;

        if (isColliding(elRect, leftScale.getBoundingClientRect())) {
            if (leftWeights.length >= MAX_WEIGHTS_PER_BOWL) {
                alert(`В левой чаше уже максимальное количество гирь (${MAX_WEIGHTS_PER_BOWL})!`);
            } else {
                leftWeight += +el.dataset.value;
                leftWeights.push({ id: el.dataset.id, element: el, value: +el.dataset.value });
                el.inBowl = true;
                el.bowl = 'left';
                el.classList.add('in-bowl');
                placeInBowl(el, leftScale, leftWeights.length - 1);
                clearInterval(el.fallTimer);
                placed = true;
            }
        }
        else if (isColliding(elRect, rightScale.getBoundingClientRect())) {
            if (rightWeights.length >= MAX_WEIGHTS_PER_BOWL) {
                alert(`В правой чаше уже максимальное количество гирь (${MAX_WEIGHTS_PER_BOWL})!`);
            } else {
                rightWeight += +el.dataset.value;
                rightWeights.push({ id: el.dataset.id, element: el, value: +el.dataset.value });
                el.inBowl = true;
                el.bowl = 'right';
                el.classList.add('in-bowl');
                placeInBowl(el, rightScale, rightWeights.length - 1);
                clearInterval(el.fallTimer);
                placed = true;
            }
        }
        else if (isColliding(elRect, table.getBoundingClientRect())) {
            if (tableItems.length >= TABLE_LIMIT) {
                alert(`На столе максимальное количество гирь - (${TABLE_LIMIT})!`);
            } else {
                el.onTable = true;
                el.classList.add('on-table');
                tableItems.push({ id: el.dataset.id, element: el, value: +el.dataset.value });
                clearInterval(el.fallTimer);
                layoutTable();
                placed = true;
            }
        }

        if (!placed) {
            startFalling(el, speed);
        }

        updateDisplay();
        checkWin();
    });
}

function placeInBowl(el, bowl, index) {
    const bowlRect = bowl.getBoundingClientRect();
    const gameRect = document.getElementById('game').getBoundingClientRect();
    const row = Math.floor(index / 3);
    const col = index % 3;
    const startX = bowlRect.left - gameRect.left + 25;
    const startY = bowlRect.top - gameRect.top + 40;
    el.style.left = (startX + col * 60) + 'px';
    el.style.top = (startY + row * 60) + 'px';
}

function layoutTable() {
    const table = document.getElementById('table');
    const game = document.getElementById('game');
    if (!table || !game) return;

    const t = table.getBoundingClientRect();
    const g = game.getBoundingClientRect();

    tableItems.forEach((weight, i) => {
        const el = weight.element;
        const startX = t.left - g.left + 20;
        const startY = t.top - g.top + 30;
        el.style.left = (startX + i * 55) + 'px';
        el.style.top = startY + 'px';
    });
}

function isColliding(rect1, rect2) {
    return !(rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom);
}

function updateDisplay() {
    document.getElementById('leftValue').innerText = leftWeight;
    document.getElementById('rightValue').innerText = rightWeight;
    document.getElementById('leftCount').textContent = `[${leftWeights.length}/${MAX_WEIGHTS_PER_BOWL}]`;
    document.getElementById('rightCount').textContent = `[${rightWeights.length}/${MAX_WEIGHTS_PER_BOWL}]`;
}

function checkWin() {
    if (leftWeight === rightWeight && leftWeight !== 0) {
        gameRunning = false;
        spawnTimers.forEach(t => clearInterval(t));
        spawnTimers = [];
        clearInterval(gameTimer);

        document.getElementById('success').style.display = 'block';
        const sublevel = sublevels[currentSublevel - 1];

        const totalPoints = sublevel.points;

        gameScore += totalPoints;
        updateTotalScore(totalPoints);

        document.getElementById('currentGameScore').textContent = gameScore;

        setTimeout(() => startNextSublevel(), 3000);
    }
}


function startGameTimer(sublevel) {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    gameTimer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft} сек`;

        if (timeLeft <= 10) {
            timerElement.style.color = '#e74c3c';
            timerElement.style.fontWeight = 'bold';
        }

        if (timeLeft <= 0) {
            clearInterval(gameTimer);

            if (gameRunning) {
                gameRunning = false;
                spawnTimers.forEach(t => clearInterval(t));
                spawnTimers = [];

                const penalty = 10;

                gameScore -= penalty;

                updateTotalScore(-penalty);

                const displayScore = Math.max(gameScore, 0);
                document.getElementById('currentGameScore').textContent = displayScore;

                setTimeout(() => {
                    startNextSublevel();
                }, 2000);
            }
        }
    }, 1000);
}

function finishGame() {
    document.getElementById('gameContainer').innerHTML = `
        <h2 style="text-align: center;">Игра завершена!</h2>
        <div class="result-message correct" style="text-align: center;">
            Вы набрали ${gameScore} баллов в этой игре!
        </div>
        <div class="game-stats">
            <div class="stat-item">
                <div class="stat-value">${gameScore}</div>
                <div class="stat-label">Очки в игре</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getTotalScore()}</div>
                <div class="stat-label">Общий счет</div>
            </div>
        </div>
        <div style="text-align: center;">
            <a href="main.html" class="btn btn-back">Вернуться к уровням</a><br>
            <button onclick="location.reload()" class="btn" style="margin-top: 10px; padding: 10px 20px;">
                Играть еще раз
            </button>
        </div>
    `;

    const notification = document.getElementById('notification');
    notification.textContent = `Игра завершена! Вы получили ${gameScore} баллов`;
    notification.style.display = 'block';
    setTimeout(() => notification.style.display = 'none', 3000);
}

function getTotalScore() {
    return parseInt(localStorage.getItem('playerScore')) || 0;
}

function updateTotalScore(points) {
    let total = getTotalScore();
    total += points;
    localStorage.setItem('playerScore', total);

    const displayTotal = Math.max(total, 0);
    document.getElementById('totalScore').textContent = displayTotal;
}