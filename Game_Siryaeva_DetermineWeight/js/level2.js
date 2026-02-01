// Все фигуры с их значениями
const shapes = [
    { name: 'Маленький треугольник', value: 1, type: 'triangle', size: 'small' },
    { name: 'Маленький круг', value: 2, type: 'circle', size: 'small' },
    { name: 'Большой треугольник', value: 3, type: 'triangle', size: 'large' },
    { name: 'Маленький квадрат', value: 4, type: 'square', size: 'small' },
    { name: 'Большой круг', value: 5, type: 'circle', size: 'large' },
    { name: 'Большой квадрат', value: 6, type: 'square', size: 'large' }
];

// Фигуры для первого уровня (все кроме 1 и 6)
const level1Shapes = shapes.filter(s => s.value !== 1 && s.value !== 6);

let currentLevel = 0;
let currentShapes = [];
let correctAnswer = 0;
let timer = null;
let timeLeft = 0;
let score = 0;
let gameOver = false;

// Начать игру
function startGame() {
    currentLevel = 0;
    score = 0;
    gameOver = false;
    nextLevel();
}

// Следующий уровень
function nextLevel() {
    currentLevel++;

    if (currentLevel > 4) {
        endGame();
        return;
    }

    // Выбираем фигуры
    const availableShapes = currentLevel === 1 ? level1Shapes : shapes;
    currentShapes = getRandomShapes(availableShapes, currentLevel);

    // Вычисляем правильный ответ
    correctAnswer = currentShapes.reduce((sum, shape) => sum + shape.value, 0);

    // Таймер
    timeLeft = [35, 30, 25, 20][currentLevel - 1];

    // Показать игру
    showGame();
    startTimer();
}

// Получить случайные фигуры
function getRandomShapes(availableShapes, count) {
    const shuffled = [...availableShapes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Показать игру
function showGame() {
    const container = document.getElementById('gameContainer');

    container.innerHTML = `
        <div class="sublevel-info">Подуровень ${currentLevel} из 4</div>
        <div class="timer" id="timer">${timeLeft} сек</div>
        
        <div class="equation-container">
            <div class="equation">
                ${renderShapes(currentShapes)}
                <span class="equals">=</span>
                <input type="number" 
                       id="answerInput" 
                       class="answer-input" 
                       placeholder="X"
                       onkeypress="handleEnter(event)"
                       autofocus>
            </div>
        </div>
        
        <div style="text-align: center; color: #3498db; margin: 5px 0;">
            Нажмите Enter для ответа
        </div>
        
        <!-- Шкала весов -->
        <div class="weight-scale">
            <div class="scale-label">Значения фигур по возрастанию:</div>
            <div style="display: flex; align-items: center; gap: 3px; flex-wrap: wrap; justify-content: center;">
                ${renderWeightScale()}
            </div>
        </div>
        
        <div class="game-stats">
            <div class="stat-item">
                <div class="stat-value">${score}</div>
                <div class="stat-label">Очки в игре</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getTotalScore()}</div>
                <div class="stat-label">Общий счет</div>
            </div>
        </div>
        
        <div id="result" style="margin: 10px 0; text-align: center; font-size: 1.3rem; min-height: 30px;"></div>
    `;
}

// Отрисовать фигуры
function renderShapes(shapesArray) {
    return shapesArray.map((shape, i) => `
        <div class="shape ${shape.size} ${shape.type}"></div>
        ${i < shapesArray.length - 1 ? '<span class="operator">+</span>' : ''}
    `).join('');
}

// Отрисовать шкалу весов с числами внутри крайних фигур
function renderWeightScale() {
    const sorted = [...shapes].sort((a, b) => a.value - b.value);

    let html = '';
    for (let i = 0; i < sorted.length; i++) {
        const shape = sorted[i];

        html += `
            <div class="weight-item">
                <div class="shape ${shape.size} ${shape.type}">
                    ${i === 0 ? `<div class="shape-number">${shape.value}</div>` : ''}
                    ${i === sorted.length - 1 ? `<div class="shape-number">${shape.value}</div>` : ''}
                </div>
            </div>
        `;

        // Добавляем знак < между фигурами (кроме последней)
        if (i < sorted.length - 1) {
            html += `<div class="weight-sign">&lt;</div>`;
        }
    }

    return html;
}

// Обработка нажатия Enter
function handleEnter(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
}

// Проверить ответ
function checkAnswer() {
    if (gameOver) return;

    const input = document.getElementById('answerInput');
    const answer = parseInt(input.value);

    if (!answer) {
        showMessage('Введите число!', 'error');
        return;
    }

    clearInterval(timer);

    const isCorrect = answer === correctAnswer;
    const points = isCorrect ? 15 : -5;
    score += points;

    updateTotalScore(points);

    const resultDiv = document.getElementById('result');
    if (isCorrect) {
        resultDiv.innerHTML = `<span style="color: #2ecc71">Правильно! +15 баллов</span>`;
    } else {
        resultDiv.innerHTML = `<span style="color: #e74c3c">Неправильно! -5 баллов</span>`;
    }

    setTimeout(() => {
        if (!gameOver) nextLevel();
    }, 2000);
}

// Запустить таймер
function startTimer() {
    const timerEl = document.getElementById('timer');
    if (!timerEl) return;

    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `${timeLeft} сек`;

        if (timeLeft <= 0) {
            clearInterval(timer);

            if (!gameOver) {
                score -= 5;
                updateTotalScore(-5);

                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = `<span style="color: #e74c3c"> Время вышло! -5 баллов</span>`;

                setTimeout(() => {
                    if (!gameOver) nextLevel();
                }, 2000);
            }
        }
    }, 1000);
}

// Завершить игру
function endGame() {
    gameOver = true;
    clearInterval(timer);

    const container = document.getElementById('gameContainer');
    container.innerHTML = `
        <h2 style="text-align: center; margin: 10px 0;">Игра завершена!</h2>
        <div class="result-message correct" style="text-align: center; margin: 10px 0;">
            Вы набрали ${score} баллов
        </div>
        <div class="game-stats">
            <div class="stat-item">
                <div class="stat-value">${score}</div>
                <div class="stat-label">Очки в игре</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${getTotalScore()}</div>
                <div class="stat-label">Общий счет</div>
            </div>
        </div>
        <div style="text-align: center; margin: 20px 0;">
            <button onclick="startGame()" class="btn">
                Играть еще раз
            </button>
        </div>
    `;

}

// Вспомогательные функции
function getTotalScore() {
    return parseInt(localStorage.getItem('playerScore')) || 0;
}

function updateTotalScore(points) {
    let total = getTotalScore();
    total += points;
    if (total < 0) total = 0;
    localStorage.setItem('playerScore', total);
}

function showMessage(text, type) {
    const note = document.getElementById('notification');
    note.textContent = text;
    note.style.background = type === 'error' ? '#e74c3c' : '#27ae60';
    note.style.display = 'block';
    setTimeout(() => note.style.display = 'none', 2000);
}

// Начать при загрузке
document.addEventListener('DOMContentLoaded', startGame);
window.handleEnter = handleEnter;