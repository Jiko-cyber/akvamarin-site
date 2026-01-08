const latinPhrases = [
    "Pacta sunt servanda",
    "Nota bene",
    "Nulla calamitas sola",
    "Dum Spiro, Spero",
    "Audi vidi sili",
    "Veni, vidi, vici",
    "Cogito, ergo sum",
    "Memento mori"
];

const russianTranslations = [
    "Договоренности должны соблюдаться",
    "Заметьте хорошо!",
    "Беда не приходит одна",
    "Пока дышу – надеюсь",
    "Слушай смотри и молчи",
    "Пришёл, увидел, победил",
    "Я мыслю, следовательно, существую",
    "Помни о смерти"
];

class PhrasesManager {
    constructor(latinPhrases, russianTranslations) {
        this.latinPhrases = latinPhrases;
        this.russianTranslations = russianTranslations;
        this.usedPhrases = new Set();
        this.clickCount = 0;
        this.isFinished = false;
        this.isBoldMode = false;
    }

    getRandomUnusedPhrase() {
        if (this.usedPhrases.size === this.latinPhrases.length) {
            this.isFinished = true;
            return null;
        }

        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.latinPhrases.length);
        } while (this.usedPhrases.has(randomIndex));

        this.usedPhrases.add(randomIndex);
        this.clickCount++;

        return {
            latin: this.latinPhrases[randomIndex],
            russian: this.russianTranslations[randomIndex],
            index: randomIndex
        };
    }

    getRowClass() {
        if (this.clickCount % 2 === 0) {
            return 'class1';
        } else {
            return 'class2';
        }
    }

    allPhrasesUsed() {
        return this.isFinished;
    }

    toggleBoldMode() {
        this.isBoldMode = !this.isBoldMode;
        return this.isBoldMode;
    }

    getBoldMode() {
        return this.isBoldMode;
    }
}

class UIManager {
    constructor() {
        this.createBtn = document.getElementById('createBtn');
        this.recolorBtn = document.getElementById('recolorBtn');
        this.tableBody = document.querySelector('#phrasesTable tbody');
    }

    addNewRow(phrase, rowClass, isBoldMode) {
        const newRow = document.createElement('tr');
        newRow.className = rowClass;

        const dataRowsCount = this.tableBody.children.length;

        if (isBoldMode && dataRowsCount % 2 === 1) {
            newRow.classList.add('bold-even');
        }

        const latinCell = document.createElement('td');
        latinCell.textContent = phrase.latin;

        const russianCell = document.createElement('td');
        russianCell.textContent = phrase.russian;

        newRow.appendChild(latinCell);
        newRow.appendChild(russianCell);

        this.tableBody.appendChild(newRow);
    }

    toggleBoldEvenRows(isBoldMode) {
        const rows = this.tableBody.querySelectorAll('tr');

        rows.forEach((row, index) => {
            if (index % 2 === 1) {
                if (isBoldMode) {
                    row.classList.add('bold-even');
                } else {
                    row.classList.remove('bold-even');
                }
            }
        });
    }

    updateRecolorButton(isBoldMode) {
        if (isBoldMode) {
            this.recolorBtn.classList.add('active');
        } else {
            this.recolorBtn.classList.remove('active');
        }
    }

    showAlert(message) {
        alert(message);
    }
}

function initApp() {
    const phrasesManager = new PhrasesManager(latinPhrases, russianTranslations);
    const uiManager = new UIManager();

    function addNewRow() {
        if (phrasesManager.allPhrasesUsed()) {
            uiManager.showAlert("Фразы закончились");
            return;
        }

        const phrase = phrasesManager.getRandomUnusedPhrase();

        if (phrase === null) {
            uiManager.showAlert("Фразы закончились");
            return;
        }

        const rowClass = phrasesManager.getRowClass();
        const isBoldMode = phrasesManager.getBoldMode();
        uiManager.addNewRow(phrase, rowClass, isBoldMode);
    }

    function recolorEvenRows() {
        const isBoldMode = phrasesManager.toggleBoldMode();
        uiManager.toggleBoldEvenRows(isBoldMode);
        uiManager.updateRecolorButton(isBoldMode);
    }

    uiManager.createBtn.addEventListener('click', addNewRow);
    uiManager.recolorBtn.addEventListener('click', recolorEvenRows);
}

document.addEventListener('DOMContentLoaded', initApp);