
function loadRatingData() {
    const savedRating = localStorage.getItem('gameRating');
    return savedRating ? JSON.parse(savedRating) : [];
}

function saveRatingData(ratingData) {
    localStorage.setItem('gameRating', JSON.stringify(ratingData));
}

document.addEventListener('DOMContentLoaded', function () {
    const playerScore = parseInt(localStorage.getItem('playerScore')) || 0;
    document.getElementById('yourScore').textContent = playerScore;

    updateRating();
});

function updateRating() {
    let ratingData = loadRatingData();

    const currentPlayer = localStorage.getItem('playerName');
    const currentScore = parseInt(localStorage.getItem('playerScore')) || 0;

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

    const validPlayers = ratingData.filter(player => player.score > 0);

    const sortedRating = validPlayers.sort((a, b) => b.score - a.score);

    displayRating(sortedRating, currentPlayer);
}

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