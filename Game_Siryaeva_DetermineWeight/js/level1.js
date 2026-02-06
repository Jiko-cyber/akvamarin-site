//массив животных
const animals = [
    { name: "Кошка", weight: 5 },
    { name: "Лев", weight: 190 },
    { name: "Слон", weight: 5000 },
    { name: "Мышь", weight: 0.03 },
    { name: "Синий кит", weight: 150000 },
    { name: "Жук", weight: 0.001 },
    { name: "Медведь", weight: 300 },
    { name: "Собака", weight: 15 },
    { name: "Заяц", weight: 3 },
    { name: "Волк", weight: 50 }
];
//время для уровней
const levelTimers = [30, 20, 15, 10];
//вопросы
const questionTypes = [
    {
        text: "Какое животное тяжелее?",
        checkAnswer: (animal1, animal2) => animal1.weight > animal2.weight ? 0 : 1,
        message: (animal) => `${animal.name} тяжелее.`
    },
    {
        text: "Какое животное легче?",
        checkAnswer: (animal1, animal2) => animal1.weight < animal2.weight ? 0 : 1,
        message: (animal) => `${animal.name} легче.`
    }
];

let currentSublevel = 0;
let gameAnimals = [];
let currentQuestion = null;
let timer = null;
let timeLeft = 0;
let gameScore = 0;
let selectedAnimal = null;
let gameCompleted = false;
let answerSubmitted = false;


function startWeightGame() {
    currentSublevel = 0;
    gameCompleted = false;
    answerSubmitted = false;
    startNextSublevel();
}

//запуск следующего подуровня
function startNextSublevel() {
    currentSublevel++;
    answerSubmitted = false;
    selectedAnimal = null;

    if (currentSublevel > 4) {
        finishGame();
        return;
    }

    gameAnimals = [...animals].sort(() => 0.5 - Math.random()).slice(0, 2);
    currentQuestion = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    timeLeft = levelTimers[currentSublevel - 1];
    renderGame();
    startTimer();
}
//отрисовка игрового процесса
function renderGame() {
    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <div class="sublevel-info">Подуровень ${currentSublevel} из 4</div>
        <div class="game-question">${currentQuestion.text}</div>
        <div class="timer" id="timer">${timeLeft} сек</div>
        
        <div class="animals-container">
            ${gameAnimals.map((animal, index) => `
                <div class="animal-circle" id="animal-${index}" onmouseenter="handleAnimalHover(${index})">
                    ${animal.name}
                </div>
            `).join('')}
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
        
        <div id="selectionStatus" style="margin: 20px 0; font-size: 1.3rem; min-height: 30px;">
            Наведите курсор на ответ
        </div>
    `;
}
//получение общего счета
function getTotalScore() {
    return parseInt(localStorage.getItem('playerScore')) || 0;
}

//обработчик наведения мыши 
function handleAnimalHover(index) {
    if (answerSubmitted || gameCompleted || selectedAnimal !== null) return;

    selectedAnimal = index;
    const animalCircle = document.getElementById(`animal-${index}`);
    if (animalCircle) animalCircle.classList.add('selected');

    const statusElement = document.getElementById('selectionStatus');
    if (statusElement) {
        statusElement.textContent = `Выбрано: ${gameAnimals[index].name}`;
        statusElement.style.color = '#2ecc71';
    }

    setTimeout(() => {
        if (!answerSubmitted && selectedAnimal === index) submitAnswer();
    }, 1000);
}

//функция отправки ответа
function submitAnswer() {
    if (answerSubmitted || gameCompleted || selectedAnimal === null) return;

    answerSubmitted = true;
    clearInterval(timer);

    const correctAnimalIndex = currentQuestion.checkAnswer(gameAnimals[0], gameAnimals[1]);
    const isCorrect = selectedAnimal === correctAnimalIndex;
    const points = isCorrect ? 10 : -5;

    gameScore += points;
    updateTotalScore(points);

    const statusElement = document.getElementById('selectionStatus');
    if (statusElement) {
        statusElement.textContent = isCorrect ? 'Правильно! +10 баллов' : 'Неправильно! -5 баллов';
        statusElement.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
    }

    document.getElementById('currentGameScore').textContent = gameScore;
    document.getElementById('totalScore').textContent = getTotalScore();

    setTimeout(() => startNextSublevel(), 2000);
}
//обновление общего счета
function updateTotalScore(points) {
    let totalScore = getTotalScore();
    totalScore += points;
    localStorage.setItem('playerScore', totalScore);
}
//запуск таймера
function startTimer() {
    const timerElement = document.getElementById('timer');
    if (!timerElement) return;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `${timeLeft} сек`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            if (!answerSubmitted && !gameCompleted) {
                answerSubmitted = true;
                gameScore -= 5;
                updateTotalScore(-5);

                const correctAnimalIndex = currentQuestion.checkAnswer(gameAnimals[0], gameAnimals[1]);

                const statusElement = document.getElementById('selectionStatus');
                if (statusElement) {
                    statusElement.textContent = 'Время вышло!';
                    statusElement.style.color = '#e74c3c';
                }

                document.getElementById('currentGameScore').textContent = gameScore;
                document.getElementById('totalScore').textContent = getTotalScore();

                setTimeout(() => {
                    if (!gameCompleted) startNextSublevel();
                }, 2000);
            }
        }
    }, 1000);
}
//функция завершения игры
function finishGame() {
    gameCompleted = true;
    clearInterval(timer);

    const gameContainer = document.getElementById('gameContainer');
    gameContainer.innerHTML = `
        <h2>Игра завершена!</h2>
        <div class="result-message correct">
            Вы набрали ${gameScore} баллов!
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
        
        <button onclick="location.reload()" class="btn" ">
            Играть еще раз
        </button>
    `;


    setTimeout(() => notification.style.display = 'none', 3000);
}

window.handleAnimalHover = handleAnimalHover;
document.addEventListener('DOMContentLoaded', function () {
    gameScore = 0;
    startWeightGame();
});
