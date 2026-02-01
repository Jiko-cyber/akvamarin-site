// Функции для работы с данными рейтинга
function loadRatingData() {
    const savedRating = localStorage.getItem('gameRating');
    return savedRating ? JSON.parse(savedRating) : [];
}

function saveRatingData(ratingData) {
    localStorage.setItem('gameRating', JSON.stringify(ratingData));
}

// Основная функция инициализации
document.addEventListener('DOMContentLoaded', function () {
    // Показываем текущий счет пользователя
    const playerScore = parseInt(localStorage.getItem('playerScore')) || 0;
    document.getElementById('yourScore').textContent = playerScore;

    // Загружаем и отображаем рейтинг
    updateRating();

    // Обработчик кнопки обновления
    document.getElementById('refreshRating').addEventListener('click', function () {
        updateRating();
        showRefreshNotification();
    });
});

// Функция обновления рейтинга
function updateRating() {
    let ratingData = loadRatingData();

    const currentPlayer = localStorage.getItem('playerName');
    const currentScore = parseInt(localStorage.getItem('playerScore')) || 0;

    // Добавляем/обновляем только если у игрока есть очки
    if (currentPlayer && currentScore >= 0) {
        const existingIndex = ratingData.findIndex(p => p.name === currentPlayer);

        if (existingIndex >= 0) {
            ratingData[existingIndex].score = currentScore;
        } else {
            ratingData.push({
                name: currentPlayer,
                score: currentScore
            });
        }

        saveRatingData(ratingData);
    }

    // Фильтруем только игроков с положительными очками
    const validPlayers = ratingData.filter(player => player.score > 0);

    // Сортируем по убыванию очков
    const sortedRating = validPlayers.sort((a, b) => b.score - a.score);

    displayRating(sortedRating, currentPlayer);
}

// Функция отображения рейтинга
function displayRating(sortedRating, currentPlayer) {
    const ratingList = document.getElementById('ratingList');
    const emptyRating = document.getElementById('emptyRating');

    if (sortedRating.length === 0) {
        ratingList.innerHTML = '';
        emptyRating.style.display = 'block';
    } else {
        emptyRating.style.display = 'none';
        ratingList.innerHTML = '';

        sortedRating.forEach((player, index) => {
            const row = document.createElement('div');
            row.className = `rating-row ${player.name === currentPlayer ? 'current-user' : ''}`;

            // Добавляем класс для анимации при обновлении
            if (player.name === currentPlayer) {
                row.classList.add('highlight');
            }

            row.innerHTML = `
                <div class="rating-name">
                    ${player.name}${player.name === currentPlayer ? ' (Вы)' : ''}
                </div>
                <div class="rating-score">${player.score}</div>
            `;
            ratingList.appendChild(row);
        });
    }
}

// Функция показа уведомления об обновлении
function showRefreshNotification() {
    // Можно добавить визуальную обратную связь
    const refreshBtn = document.getElementById('refreshRating');
    const originalText = refreshBtn.textContent;

    refreshBtn.textContent = '✓ Обновлено!';
    refreshBtn.style.backgroundColor = '#2ecc71';

    setTimeout(() => {
        refreshBtn.textContent = originalText;
        refreshBtn.style.backgroundColor = '';
    }, 1000);
}

// Дополнительная функция для очистки рейтинга (опционально)
function clearRating() {
    if (confirm('Вы уверены, что хотите очистить весь рейтинг?')) {
        localStorage.removeItem('gameRating');
        updateRating();
    }
}