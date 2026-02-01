document.addEventListener('DOMContentLoaded', function () {
    // Очищаем поле ввода при загрузке страницы
    document.getElementById('player-name').value = '';

    // Обработка кнопки входа
    document.getElementById('startBtn').addEventListener('click', function () {
        const playerName = document.getElementById('player-name').value.trim();
        const previousPlayerName = localStorage.getItem('playerName');

        if (!playerName) {
            showNotification('Введите имя');
            return;
        }

        // Если имя меняется - сбрасываем счет
        if (previousPlayerName !== playerName) {
            localStorage.setItem('playerScore', '0');
        }

        // Сохраняем имя
        localStorage.setItem('playerName', playerName);

        // Переходим на главную страницу
        window.location.href = 'main.html';
    });

    // Добавляем возможность нажимать Enter для отправки формы
    document.getElementById('player-name').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('startBtn').click();
        }
    });

    function showNotification(message) {
        // Создаем уведомление, если его нет
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