document.addEventListener('DOMContentLoaded', function () {
    const workArea = document.getElementById('workArea');
    const successMessage = document.getElementById('successMessage');

    const shapesConfig = [
        { id: 'house-square', type: 'house-square', name: 'Квадрат (дом)', rotation: 315, x: 50, y: 50 },
        { id: 'house-roof', type: 'house-roof', name: 'Треугольник (крыша)', rotation: 315, x: 200, y: 50 },
        { id: 'house-window', type: 'house-window', name: 'Окно', rotation: 315, x: 150, y: 150 },
        { id: 'tree-bottom', type: 'tree-bottom', name: 'Большой треугольник', rotation: 180, x: 350, y: 50 },
        { id: 'tree-middle', type: 'tree-middle', name: 'Средний треугольник', rotation: 90, x: 50, y: 250 },
        { id: 'tree-top', type: 'tree-top', name: 'Маленький треугольник', rotation: 315, x: 200, y: 250 },
        { id: 'tree-trunk', type: 'tree-trunk', name: 'Ствол', rotation: 315, x: 350, y: 250 }
    ];

    let draggedShape = null;
    let offsetX = 0, offsetY = 0;

    shapesConfig.forEach(config => {
        createShape(config);
    });

    function createShape(config) {
        const shape = document.createElement('div');
        shape.className = `shape ${config.type}`;
        shape.id = config.id;
        shape.dataset.rotation = config.rotation;
        shape.dataset.type = config.type;
        shape.dataset.name = config.name;

        shape.style.left = config.x + 'px';
        shape.style.top = config.y + 'px';
        shape.style.transform = `rotate(${config.rotation}deg)`;

        shape.addEventListener('mousedown', function (e) {
            if (e.button === 0) {
                startDrag.call(this, e);
            }
        });

        shape.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            rotateShape(this, 45);
            return false;
        });

        workArea.appendChild(shape);
    }

    function rotateShape(shape, angle) {
        let currentRotation = parseInt(shape.dataset.rotation) || 0;
        currentRotation += angle;

        if (currentRotation >= 360) {
            currentRotation = 0;
        }

        if (currentRotation < 0) {
            currentRotation = 360 + currentRotation;
        }

        shape.style.transform = `rotate(${currentRotation}deg)`;
        shape.dataset.rotation = currentRotation;

        checkShapesAssem();
    }

    function shapesClose(element1, element2, maxDistance = 50) {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        const center1X = rect1.left + rect1.width / 2;
        const center1Y = rect1.top + rect1.height / 2;
        const center2X = rect2.left + rect2.width / 2;
        const center2Y = rect2.top + rect2.height / 2;

        const dx = center1X - center2X;
        const dy = center1Y - center2Y;

        return (dx * dx + dy * dy) <= (maxDistance * maxDistance);
    }

    function checkShapesAssem() {
        const houseSquare = document.getElementById('house-square');
        const houseRoof = document.getElementById('house-roof');
        const houseWindow = document.getElementById('house-window');
        const treeBottom = document.getElementById('tree-bottom');
        const treeMiddle = document.getElementById('tree-middle');
        const treeTop = document.getElementById('tree-top');
        const treeTrunk = document.getElementById('tree-trunk');

        if (!houseSquare || !houseRoof || !houseWindow || !treeBottom || !treeMiddle || !treeTop || !treeTrunk) return;

        const roofClose_house = shapesClose(houseSquare, houseRoof, 95);
        const windowClose_house = shapesClose(houseSquare, houseWindow, 20);

        const topClose_middle = shapesClose(treeTop, treeMiddle, 50);
        const middleClose_bottom = shapesClose(treeMiddle, treeBottom, 100);
        const bottomClose_trunk = shapesClose(treeBottom, treeTrunk, 80);

        const roofCorrect = checkRotationAngle(houseRoof, 0);
        const houseSquareCorrect = checkSquareRotationAngle(houseSquare, 0);
        const windowCorrect = checkSquareRotationAngle(houseWindow, 0);
        const treeBottomCorrect = checkRotationAngle(treeBottom, 0);
        const treeMiddleCorrect = checkRotationAngle(treeMiddle, 0);
        const treeTopCorrect = checkRotationAngle(treeTop, 0);
        const treeTrunkCorrect = checkRotationAngle(treeTrunk, 0);


        if (roofClose_house && windowClose_house && roofCorrect && houseSquareCorrect &&
            windowCorrect && treeBottomCorrect && treeMiddleCorrect &&
            treeTopCorrect && treeTrunkCorrect &&
            topClose_middle && middleClose_bottom && bottomClose_trunk) {
            successMessage.style.display = 'block';
        } else {
            successMessage.style.display = 'none';
        }
    }

    function checkRotationAngle(shape, targetAngle, tolerance = 5) {
        if (!shape) return false;

        let currentRotation = parseInt(shape.dataset.rotation) || 0;
        currentRotation = ((currentRotation % 360) + 360) % 360;

        let diff = Math.abs(currentRotation - targetAngle);
        diff = Math.min(diff, 360 - diff);

        return diff <= tolerance;
    }

    function checkSquareRotationAngle(shape, tolerance = 5) {
        if (!shape) {
            return false;
        }

        let currentRotation = parseInt(shape.dataset.rotation) || 0;
        currentRotation = ((currentRotation % 360) + 360) % 360;

        const remainder = currentRotation % 90;
        const diffFromZero = Math.min(remainder, 90 - remainder);

        return diffFromZero <= tolerance;
    }

    function startDrag(e) {
        e.preventDefault();
        e.stopPropagation();
        draggedShape = this;

        const rect = this.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        draggedShape.style.zIndex = '1000';

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    }

    function drag(e) {
        if (!draggedShape) return;

        const workAreaRect = workArea.getBoundingClientRect();
        const x = e.clientX - workAreaRect.left - offsetX;
        const y = e.clientY - workAreaRect.top - offsetY;

        const maxX = workAreaRect.width - draggedShape.offsetWidth;
        const maxY = workAreaRect.height - draggedShape.offsetHeight;

        draggedShape.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
        draggedShape.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
    }

    function stopDrag() {
        if (!draggedShape) return;

        if (draggedShape.classList.contains('tree-trunk')) {
            draggedShape.style.zIndex = '25';
        } else if (draggedShape.classList.contains('tree-top')) {
            draggedShape.style.zIndex = '32';
        } else if (draggedShape.classList.contains('tree-middle')) {
            draggedShape.style.zIndex = '31';
        } else if (draggedShape.classList.contains('tree-bottom')) {
            draggedShape.style.zIndex = '30';
        } else if (draggedShape.classList.contains('house-window')) {
            draggedShape.style.zIndex = '35';
        } else {
            draggedShape.style.zIndex = '20';
        }

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDrag);

        checkShapesAssem();
        draggedShape = null;
    }

    workArea.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });
});