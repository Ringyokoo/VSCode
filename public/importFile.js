const input = document.getElementById('mbsInput');

input.addEventListener('click', () => {
    input.value = '';
    // input.nextElementSibling.innerHTML = 'Файл не выбран';
});

input.addEventListener('change', async function (e) {
    const file = e.target.files[0];
    const nextElement = this.nextElementSibling;
    if (!file) return;

    // nextElement.innerHTML = file.name;
    showNotification('Выбран файл: ' + file.name, 'success', 5000);
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt')) {
        const text = await file.text();
        parseTextToData(text); // ⬅️ вызываем TXT парсер
    } else if (fileName.endsWith('.mbs')) {
        const arrayBuffer = await file.arrayBuffer();
        parseMbs(arrayBuffer); // ⬅️ вызываем MBS парсер
    } else {
        showNotification("Неподдерживаемый формат файла", 'error', 5000);
    }
});
function parseMbs(arrayBuffer) {
    cleanCanvas();
    const buf = new DataView(arrayBuffer);
    const base = 600046;
    const widthPalet = buf.getUint16(base, true);
    const heightPalet = buf.getUint16(base + 2, true);
    const heightTotal = buf.getUint16(base + 4, true);
    const nPakOnLayer = buf.getUint16(base + 6, true);
    const nLayers = buf.getUint16(base + 8, true);
    const heightPak = buf.getUint16(base + 12, true);
    const widthPak = buf.getUint16(base + 14, true);

    const rectBase = 600244;
    const palett = [];
    const arrText = ['↑', '→', '↓', '←'];

    for (let layerM = 1; layerM <= nLayers; layerM++) {
        const layerOffset = rectBase + (layerM - 1) * 100 * 2;
        const rgbColor = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`;
        for (let i = 0; i < nPakOnLayer; i++) {
            const offset = layerOffset + i * 8;
            const x = buf.getInt16(offset, true);
            const y = -buf.getInt16(offset + 2, true);
            const layerNum = buf.getInt16(offset + 4, true);
            const angle = buf.getInt16(offset + 6, true);

            let width = widthPak;
            let height = heightPak;
            let widthAuto = width;
            let heightAuto = height;

            if (angle == 90 || angle == 270) {
                [width, height] = [height, width];
                [widthAuto, heightAuto] = [heightAuto, widthAuto];
            }

            const text = arrText[Math.floor(angle / 90)];
            palett.push({
                x, y, layer: layerNum, isLastLayer: i === nPakOnLayer - 1,
                color: rgbColor, text, width, height,
                xAuto: x, yAuto: y,
                widthAuto, heightAuto,
                textAuto: text,
                colorAuto: rgbColor
            });
        }
    }

    document.getElementById('palletWidth').value = widthPalet;
    document.getElementById('palletHeight').value = heightPalet;
    document.getElementById('rectWidth').value = widthPak;
    document.getElementById('rectHeight').value = heightPak;
    document.getElementById('minLayer').value = nLayers;
    document.getElementById('countBag').value = nPakOnLayer;

    rectangles = palett;
    rectanglesClone = [...palett.map(obj => JSON.parse(JSON.stringify(obj)))];
    palletWidth = widthPalet;
    palletHeight = heightPalet;
    scale = 1;

    for (const rect of rectangles) {
        if (Math.floor(palletWidth / 2) - Math.floor(rect.width / 2) < Math.abs(rect.x)
            || Math.floor(palletHeight / 2) - Math.floor(rect.height / 2) < Math.abs(rect.y)) {
            flagOutside = true;
            document.querySelector('#permission').checked = true;
        }
    }

    initialScale();

    while (tab.lastElementChild) tab.removeChild(tab.lastElementChild);

    cleanCanvas();

    const layer = parseInt(document.getElementById('minLayer').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
    rectHeight = parseInt(document.getElementById('rectHeight').value);
    centerX = Math.floor(palletWidth / 2);
    centerY = Math.floor(palletHeight / 2);

    if (palletWidth && palletHeight && rectWidth && rectHeight && layer) {
        document.body.focus();
        createButton(layer);
        layerNum = layer;
        drawLayer();
    }

    acc = document.getElementsByClassName("accordion");
    colorPickers = document.querySelectorAll('.color_picker');
    checkText = document.querySelectorAll('.checkText');
    checkTextF();
    setColorPiker();
    rotateButtons = document.querySelectorAll('.rotate');
    rotateButtonsF();

    if (!acc[1].className.includes('active')) acc[1].click();
}


function parseTextToData(text) {
    cleanCanvas();
    const lines = text.split('\n').map(line => line.trim());

    function findValue(prefix) {
        const line = lines.find(l => l.startsWith(prefix));

        if (!line) {
            showNotification(`Не найдена строка: ${prefix}`, "error", 5000);
            return null;
        }
        return line.replace(prefix, '').trim();
    }

    document.getElementById('palletWidth').value = +findValue('Ширина паллета:');
    document.getElementById('palletHeight').value = +findValue('Длина паллета:');
    document.getElementById('rectWidth').value = +findValue('Ширина мешка:');
    document.getElementById('rectHeight').value = +findValue('Длина мешка:');
    document.getElementById('minLayer').value = +findValue('Количество слоев:');
    document.getElementById('countBag').value = +findValue('Кол-во мешков на слой:');
    document.getElementById('inentM').value = +findValue('Минимальный промежуток:');
    // console.log('Разрешить выход за границу паллета:', findValue('Разрешить выход за границу паллета:'))
    if (findValue('Разрешить выход за границу паллета:') == 'true') {
        flagOutside = true;
        document.querySelector('#permission').checked = true;
    }
    // permission.checked = findValue('Разрешить выход за границу паллета:') === 'true';

    // Считываем прямоугольники
    rectangles = [];
    const arrText = ['↑', '→', '↓', '←'];
    const angleMap = { '0°': 0, '90°': 1, '180°': 2, '270°': 3 };
    let comLayer = 1;
    let rgbColor = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`;
    if (!lines.length) {
        console.log('Файл пуст');
    }
    let flagRec = false;
    for (let i = 0; i < lines.length; i++) {

        if (lines[i].startsWith('Прямоугольник')) {
            flagRec = true;
            // currentIndex++; // Пропускаем "Прямоугольник N:"
            const x = +lines[i + 1].replace('Координата X:', '').trim();
            const y = -parseFloat(lines[i + 2].replace('Координата Y:', '').trim()); // Было -rect.y при сохранении
            let width = +findValue('Ширина мешка:');
            let height = +findValue('Длина мешка:');
            let widthAuto = width;
            let heightAuto = height;
            const angleStr = lines[i + 3].replace('Угол:', '').trim();
            const angleIndex = angleMap[angleStr] ?? 0;
            if (angleIndex == 1 || angleIndex == 3) {
                [width, height] = [height, width];
                [widthAuto, heightAuto] = [heightAuto, widthAuto];
            }
            const layer = +lines[i + 4].replace('Слой:', '').trim();
            if (comLayer != layer) {
                rgbColor = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`;
                comLayer = layer;
            }
            const rect = {
                x: x,
                y: y,
                layer: layer,
                isLastLayer: false,
                color: rgbColor,
                width: width,
                height: height,
                xAuto: x, yAuto: y,
                widthAuto, heightAuto,
                text: arrText[angleIndex],
                textAuto: arrText[angleIndex],
                colorAuto: rgbColor
            };
            rectangles.push(rect);
        }

    }
    if (!flagRec) {
        showNotification('Файл не содержит прямоугольников', "error", 5000);
    }

    rectanglesClone = [...rectangles.map(obj => JSON.parse(JSON.stringify(obj)))];

    palletWidth = document.getElementById('palletWidth').value;
    palletHeight = document.getElementById('palletHeight').value;
    scale = 1;

    initialScale();

    while (tab.lastElementChild) tab.removeChild(tab.lastElementChild);

    cleanCanvas();

    const layer = parseInt(document.getElementById('minLayer').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
    rectHeight = parseInt(document.getElementById('rectHeight').value);
    centerX = Math.floor(palletWidth / 2);
    centerY = Math.floor(palletHeight / 2);

    if (palletWidth && palletHeight && rectWidth && rectHeight && layer) {
        document.body.focus();
        createButton(layer);
        layerNum = layer;
        drawLayer();
    }

    acc = document.getElementsByClassName("accordion");
    colorPickers = document.querySelectorAll('.color_picker');
    checkText = document.querySelectorAll('.checkText');
    checkTextF();
    setColorPiker();
    rotateButtons = document.querySelectorAll('.rotate');
    rotateButtonsF();

    if (!acc[1].className.includes('active')) acc[1].click();
    // Теперь можно, например, обновить UI
    // console.log('Загружено прямоугольников:', rectangles);
}