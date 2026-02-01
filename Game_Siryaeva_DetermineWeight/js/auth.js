document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('player-name').value = '';

    document.getElementById('startBtn').addEventListener('click', function () {
        const playerName = document.getElementById('player-name').value.trim();
        const previousPlayerName = localStorage.getItem('playerName');

        if (!playerName) {
            showNotification('Введите имя');
            return;
        }

        if (previousPlayerName !== playerName) {
            localStorage.setItem('playerScore', '0');
        }

        localStorage.setItem('playerName', playerName);

        window.location.href = 'main.html';
    });

    document.getElementById('player-name').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('startBtn').click();
        }
    });

    function showNotification(message) {
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.className = 'notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
});