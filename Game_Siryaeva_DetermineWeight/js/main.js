document.addEventListener('DOMContentLoaded', function () {

    updatePlayerInfo();
    checkLevelsUnlock();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('regenerateGame').addEventListener('click', function () {
        if (confirm('Вернуться к началу и ввести новое имя?\nТекущий счет будет сброшен.')) {
            const currentScore = getPlayerScore();
            const currentName = getPlayerName();

            if (currentName && currentScore > 0) {
                savePlayerToRating(currentName, currentScore);
            }

            clearPlayerData();

            window.location.href = 'index.html';
        }
    });

    document.getElementById('addPointsBtn').addEventListener('click', function () {
        addPoints(100);
    });
}

function getPlayerName() {
    return localStorage.getItem('playerName') || '';
}

function getPlayerScore() {
    return parseInt(localStorage.getItem('playerScore')) || 0;
}

function updatePlayerInfo() {
    const playerName = getPlayerName() || 'Игрок';
    const playerScore = getPlayerScore();

    document.getElementById('currentPlayer').textContent = playerName;
    document.getElementById('playerScoreDisplay').textContent = playerScore;
}

function addPoints(points) {
    const currentScore = getPlayerScore();
    const newScore = currentScore + points;
    localStorage.setItem('playerScore', newScore.toString());

    updatePlayerInfo();
    checkLevelsUnlock();
    showNotification(`+${points} очков! Текущий счет: ${newScore}`);
}

function checkLevelsUnlock() {
    const totalScore = getPlayerScore();
    const level2Btn = document.getElementById('level2Btn');
    const level3Btn = document.getElementById('level3Btn');
    const level2Req = document.getElementById('level2Requirement');
    const level3Req = document.getElementById('level3Requirement');

    //уровень 2: требуется 30 очков
    updateLevelAccess(level2Btn, level2Req, totalScore, 30);

    //уровень 3: требуется 60 очков
    updateLevelAccess(level3Btn, level3Req, totalScore, 60);
}

function updateLevelAccess(levelBtn, levelReq, currentScore, requiredScore) {
    if (currentScore >= requiredScore) {
        levelBtn.classList.remove('level-locked');
        levelBtn.style.pointerEvents = 'auto';
        levelBtn.style.cursor = 'pointer';

        const lockIcon = levelBtn.querySelector('.lock-icon');
        if (lockIcon) {
            lockIcon.style.display = 'none';
        }

        levelReq.classList.add('unlocked');
    } else {
        levelBtn.classList.add('level-locked');
        levelBtn.style.pointerEvents = 'none';
        levelBtn.style.cursor = 'not-allowed';

        const lockIcon = levelBtn.querySelector('.lock-icon');
        if (lockIcon) {
            lockIcon.style.display = 'inline';
        }

        levelReq.classList.remove('unlocked');
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;

    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function savePlayerToRating(name, score) {
    let ratingData = [];
    const savedRating = localStorage.getItem('gameRating');
    if (savedRating) {
        ratingData = JSON.parse(savedRating);
    }

    const existingIndex = ratingData.findIndex(p => p.name === name);
    if (existingIndex >= 0) {
        ratingData[existingIndex].score = score;
    } else {
        ratingData.push({ name: name, score: score });
    }

    localStorage.setItem('gameRating', JSON.stringify(ratingData));
}

function clearPlayerData() {
    localStorage.removeItem('playerName');
    localStorage.setItem('playerScore', '0');
}