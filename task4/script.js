
const phrases = {
    latin: [
        "Pacta sunt servanda",
        "Nota bene",
        "Nulla calamitas sola",
        "Dum Spiro, Spero",
        "Audi vidi sili",
        "Veni, vidi, vici",
        "Cogito, ergo sum",
        "Memento mori"
    ],
    russian: [
        "Договоренности должны соблюдаться",
        "Заметьте хорошо!",
        "Беда не приходит одна",
        "Пока дышу – надеюсь",
        "Слушай смотри и молчи",
        "Пришёл, увидел, победил",
        "Я мыслю, следовательно, существую",
        "Помни о смерти"
    ]
};

const createPhrasesApp = () => {
    const init = () => {
        if (createBtn && recolorBtn) {
            createBtn.addEventListener('click', createClick);
            recolorBtn.addEventListener('click', toggleBoldMode);
        }
    };

    let usedPhrases = new Set();
    let clickCount = 0;
    let boldMode = false;

    const finished = () => usedPhrases.size === phrases.latin.length;

    const createBtn = document.getElementById('createBtn');
    const recolorBtn = document.getElementById('recolorBtn');
    const tableBody = document.querySelector('#phrasesTable tbody');

    const getRandomPhrase = () => {
        if (finished()) return null;

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * phrases.latin.length);
        } while (usedPhrases.has(randomIndex));

        usedPhrases.add(randomIndex);
        clickCount++;

        return {
            latin: phrases.latin[randomIndex],
            russian: phrases.russian[randomIndex],
            index: randomIndex
        };
    };

    const addTableRow = (phrase) => {
        if (clickCount % 2 == 0) {
            rowClass = 'class1';
        } else {
            rowClass = 'class2';
        }
        const row = document.createElement('tr');
        row.className = rowClass;

        const shouldBold = boldMode && (tableBody.children.length % 2 == 1);
        if (shouldBold) {
            row.classList.add('bold-even');
        }

        const latinCell = document.createElement('td');
        latinCell.textContent = phrase.latin;

        const russianCell = document.createElement('td');
        russianCell.textContent = phrase.russian;

        row.appendChild(latinCell);
        row.appendChild(russianCell);
        tableBody.appendChild(row);
    };

    const toggleBoldMode = () => {
        boldMode = !boldMode;
        const rows = tableBody.querySelectorAll('tr');

        for (let i = 0; i < rows.length; i++) {

            if (i % 2 == 1) {
                if (boldMode) {
                    rows[i].classList.add('bold-even');
                } else {
                    rows[i].classList.remove('bold-even');
                }
            }
        }

        recolorBtn.classList.toggle('active', boldMode);
    };

    const createClick = () => {
        if (finished()) {
            alert("Фразы закончились");
            return;
        }

        const phrase = getRandomPhrase();
        if (!phrase) {
            alert("Фразы закончились");
            return;
        }

        addTableRow(phrase);
    };



    return { init };
};

document.addEventListener('DOMContentLoaded', () => {
    const app = createPhrasesApp();
    app.init();
});