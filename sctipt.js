"use strict";
const form = document.getElementById('canvasForm');
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let selectedRectangle;

let centerX, centerY, predelX, predelY;
let rectWidth, rectHeight;
let rectangles = [];
let inent;
let level = 1;
let layerNum = 0;
let arrText = ['↑', '→', '↓', '←'];
let dragOffsetY, dragOffsetX;
let rgbColor = ``;
let flagAddVert = false;
let flagAddHoriz = false;
let spacingCenterX = 0;
let spacingCenterY = 0;

canvas.width = document.documentElement.clientWidth / 3 * 2 - 50;
canvas.height = document.documentElement.clientHeight - 20;

function float2int(value) {
    return value | 0; // Побитывая операция
}
function filterAndSortElements(arr, widthProp, sortProp) {
    return arr
        .filter(item => item.width !== widthProp)
        .sort((a, b) => a[sortProp] - b[sortProp]);
}

function calculateSpacing(lastElement, element, widthOrHeightProp, positionProp, startIndex, endIndex) {
    const totalGap = lastElement[positionProp] + float2int(lastElement[widthOrHeightProp] / 2)
        - (element[positionProp] + float2int(element[widthOrHeightProp] / 2));
    return (endIndex - startIndex) ? float2int(totalGap / (endIndex - startIndex)) : float2int(totalGap / 2);
}

function updateElementPositions(arr1Layer, widthOrHeightProp, rowOrColumnProp, positionProp) {
    // Найдите последний элемент с нужной шириной
    const normalLastRec = arr1Layer.findLast(item => item.width === rectWidth);

    // Отфильтруйте и отсортируйте элементы
    const filteredAndSortedElements = filterAndSortElements(arr1Layer, rectWidth, rowOrColumnProp);
    // console.log(filteredAndSortedElements)

    if (filteredAndSortedElements.length === 0) return; // Если нет элементов для обработки

    let currentRowOrColumnValue = filteredAndSortedElements[0][rowOrColumnProp];
    let startIndexOfCurrentGroup = 0;

    // Обработайте элементы по группам
    for (let i = 0; i < filteredAndSortedElements.length; i++) {
        if (filteredAndSortedElements[i + 1]?.[rowOrColumnProp] !== currentRowOrColumnValue) {
            let currentGroup;
            let spacing = calculateSpacing(normalLastRec, filteredAndSortedElements[i], widthOrHeightProp, positionProp, startIndexOfCurrentGroup, i);
            if (filteredAndSortedElements.length == 1) {
                currentGroup = filteredAndSortedElements.slice(0, 1);

            } else if (spacing > 0) {
                currentGroup = filteredAndSortedElements.slice(startIndexOfCurrentGroup + 1, i + 1);
            }



            currentGroup?.forEach((item, index) => {
                const arrIndex = arr1Layer.indexOf(item);
                arr1Layer[arrIndex][positionProp] += spacing * (index + 1);
                arr1Layer[arrIndex][positionProp + 'Auto'] = arr1Layer[arrIndex][positionProp];
            });


            startIndexOfCurrentGroup = i + 1;
            currentRowOrColumnValue = filteredAndSortedElements[i + 1]?.[rowOrColumnProp];
        }
    }


}

// Универсальная функция для вычисления координат
function calculateCoordinate(arr1Layer, i, j, rectSize, isVertical, flagAdd) {
    const center = isVertical ? centerX : centerY;
    const rectProp = isVertical ? 'width' : 'height';
    const coordProp = isVertical ? 'x' : 'y';

    if ((isVertical && i === 0) || (!isVertical && j === 0)) {
        return float2int(-(center - rectSize / 2));
    }

    let rightIndex = arr1Layer.findIndex(item =>
        (flagAdd ? item[isVertical ? 'column' : 'row'] === (isVertical ? i - 1 : j - 1) && item[rectProp] === rectSize : item[isVertical ? 'column' : 'row'] === (isVertical ? i - 1 : j - 1))
    );

    if ((layingSquareVert || layingSquareHoriz) && j != 0) {
        rightIndex = arr1Layer.findLastIndex(item => item[isVertical ? 'column' : 'row'] === (isVertical ? i - 1 : j - 1));
    }


    if (layingSquareHoriz && i == countDopHorizHoriz + 1) {
        let rightIndexX = 1;
        if (isVertical) {
            let rightItemX = arr1Layer[rightIndexX];
            if (!rightItemX) return 0;

            if (rightItemX[rectProp] > rectSize) {
                return rightItemX[coordProp] + rightItemX[rectProp] - Math.floor((rightItemX[rectProp] - rectSize) / 2);
            } else if (rightItemX[rectProp] < rectSize) {
                return rightItemX[coordProp] + rightItemX[rectProp] + Math.floor((rectSize - rightItemX[rectProp]) / 2);
            } else {
                return rightItemX[coordProp] + rightItemX[rectProp];
            }
        }

    }


    const rightItem = arr1Layer[rightIndex];
    if (!rightItem) return 0;

    if (rightItem[rectProp] > rectSize) {
        return rightItem[coordProp] + rightItem[rectProp] - Math.floor((rightItem[rectProp] - rectSize) / 2);
    } else if (rightItem[rectProp] < rectSize) {
        return rightItem[coordProp] + rightItem[rectProp] + Math.floor((rectSize - rightItem[rectProp]) / 2);
    } else {
        return rightItem[coordProp] + rightItem[rectProp];
    }
}

// Функция для обновления текста на основе условий
function determineText(arr, i, j, arrText) {
    if (arr[i][j] === 2) {
        changeWidthHeight();

    }
    return (parseInt(document.getElementById('rectWidth').value) != rectWidth) ?
        (i === 0) ? arrText[1] : arrText[3] :
        (j === 0) ? arrText[2] : arrText[0];
}

function centering(arr) {
    let maxX = -Infinity;
    let maxY = -Infinity;

    arr.forEach(item => {
        let itemX = item.x + float2int(item.width / 2) + inent
        let itemY = item.y + float2int(item.height / 2) + inent
        if (itemY > maxY) {
            maxY = itemY;
        }
        if (itemX > maxX) {
            maxX = itemX;
        }
    });

    const gapXAxis = float2int((float2int(palletWidth.value / 2) - maxX) / 2);
    const gapYAxis = float2int((float2int(palletHeight.value / 2) - maxY) / 2);

    arr.forEach(rect => {
        rect.x += gapXAxis;
        rect.y += gapYAxis;
        rect.xAuto += gapXAxis;
        rect.yAuto += gapYAxis;
    });
}

// Основная функция
function getCoord(arr) {
    let coordinateX = 0;
    let coordinateY = 0;
    let arr1Layer = [];
    let text = arrText[2];

    for (let i = 0; i < arr.length; i++) {
        if (!arr1Layer?.at(-1)?.isLastlayer) {
            rgbColor = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`;
        }

        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === 0) continue;

            text = determineText(arr, i, j, arrText);
            coordinateX = calculateCoordinate(arr1Layer, i, j, rectWidth, true, flagAddVert);
            coordinateY = calculateCoordinate(arr1Layer, i, j, rectHeight, false, flagAddHoriz);

            const item = {
                x: coordinateX + inent,
                y: coordinateY + inent,
                width: rectWidth,
                height: rectHeight,
                isLastlayer: true,
                color: rgbColor,
                text: text,
                column: i,
                row: j,
                layer: level,
                xAuto: coordinateX + inent,
                yAuto: coordinateY + inent,
                widthAuto: rectWidth,
                heightAuto: rectHeight,
                textAuto: text,
                colorAuto: rgbColor
            };

            arr1Layer.push(item);

            if (arr[i][j] === 2) {
                changeWidthHeight();
            }
        }
    }

    if (flagAddVert) {
        updateElementPositions(arr1Layer, 'width', 'row', 'x');
    }
    if (flagAddHoriz) {
        updateElementPositions(arr1Layer, 'height', 'column', 'y');
    }

    centering(arr1Layer);

    rectangles.push(...arr1Layer);
    rectanglesClone.push(...arr1Layer.map(obj => JSON.parse(JSON.stringify(obj))));

    flagAddHoriz = false;
    flagAddVert = false;
    layingSquareVert = false;
    layingSquareHoriz = false;
}



function changeWidthHeight() {
    [rectWidth, rectHeight] = [rectHeight, rectWidth];
}

function findDopRectangles(palletWidth, palletHeight, lengthRect, widthRect) {
    let dopHoriz = { horizontal: 0, vertical: 0 };
    let dopVert = { horizontal: 0, vertical: 0 };
    if (lengthRect + rectHeight + inent <= palletWidth) {
        dopHoriz.horizontal++;
        while (lengthRect + (rectHeight + inent) * (dopHoriz.horizontal + 1) <= palletWidth) {
            dopHoriz.horizontal++;
        }
        if (rectWidth + inent + inent <= palletHeight) {
            dopHoriz.vertical++;

            while ((rectWidth + inent) * (dopHoriz.vertical + 1) + inent <= palletHeight) {
                dopHoriz.vertical++;
            }
        } else {
            dopHoriz.horizontal = 0;
        }
    } else if (widthRect + rectWidth + inent <= palletHeight) {
        dopVert.vertical++;
        while (widthRect + (rectWidth + inent) * (dopVert.vertical + 1) <= palletHeight) {
            dopVert.vertical++;
        }
        if (rectHeight + inent + inent <= palletWidth) {
            dopVert.horizontal++;
            while ((rectHeight + inent) * (dopVert.horizontal + 1) + inent <= palletWidth) {
                dopVert.horizontal++;
            }
        } else {
            dopVert.vertical = 0;
        }
    }

    return [dopHoriz, dopVert];
}

function findNumberOfRectangles(palletWidth, palletHeight) {
    // let dopRectangles = {};
    let numRectangles = {};

    let numHorizontal = Math.floor((palletWidth - inent) / (rectWidth + inent));
    let lengthRect = numHorizontal * (rectWidth + inent) + inent;
    let numVertical = Math.floor((palletHeight - inent) / (rectHeight + inent));
    let widthRect = numVertical * (rectHeight + inent) + inent;

    let [dopHoriz, dopVert] = findDopRectangles(palletWidth, palletHeight, lengthRect, widthRect)

    if (numHorizontal > 0 && numVertical > 0) {
        numRectangles = { horizontal: numHorizontal, vertical: numVertical, dopHoriz: dopHoriz, dopVert: dopVert };
    } else {
        return alert('Не подходящие параметры!')
    }

    return numRectangles;

}
function createBaseMatrix(numRows, numCols, number) {
    return Array(numRows).fill().map(() => Array(numCols).fill(number));
}

let layingSquareHoriz = false;
let layingSquareVert = false;
let countDopHorizHoriz = 0;

function oddLayer(palletWidth, palletHeight) {
    // let matrixRectangles = [];
    centerX = Math.floor(palletWidth / 2);
    centerY = Math.floor(palletHeight / 2);
    let numRectangles = findNumberOfRectangles(palletWidth, palletHeight);



    let matrixRectangles = createBaseMatrix(numRectangles.horizontal, numRectangles.vertical, 1);

    let matrixLenght = matrixRectangles.length;
    // Для дополнительных горизонтальных (если одинаковое кол-во столбцов обычных и дополнительных (+1)) распределение по столбцам
    if (numRectangles.dopHoriz.horizontal) {
        //Кладка квадратом
        if (numRectangles.dopHoriz.vertical == 1 && numRectangles.horizontal == 1 && (numRectangles.dopHoriz.horizontal > 2 || numRectangles.vertical > 2) && numRectangles.dopHoriz.horizontal * 4 > numRectangles.vertical - 4) {
            layingSquareHoriz = true;
            countDopHorizHoriz = numRectangles.dopHoriz.horizontal; // поменять название
            // console.log(countDopHorizHoriz)
            const rowsToRemove = numRectangles.vertical - countDopHorizHoriz;
            for (let k = 0; k < rowsToRemove; k++) {
                matrixRectangles.forEach(row => row.pop());
            }
            matrixRectangles[0].unshift(2);

            const additionalRows = createBaseMatrix(countDopHorizHoriz - 1, 1, 2).map(row => {
                // Добавляем нули в каждую строку
                row.push(...Array(countDopHorizHoriz).fill(0));
                return row;
            });

            matrixRectangles.push(...additionalRows);

            matrixRectangles.push(Array(countDopHorizHoriz).fill(1));
            matrixRectangles[matrixRectangles.length - 1].push(0);

            // Создайте копию массива, чтобы не изменять оригинал
            const reversedDopArr = additionalRows.map(arr => [...arr].reverse());
            if (reversedDopArr.length !== 0) {
                matrixRectangles.push(...reversedDopArr);
                matrixRectangles.push(reversedDopArr[0]);
            } else {
                matrixRectangles.push(Array(countDopHorizHoriz).fill(0));
                matrixRectangles.at(-1).push(2);
            }

        }
        else {
            flagAddHoriz = true;
            for (let i = 0; i < numRectangles.dopHoriz.horizontal; i++) {

                let dopArr = Array(numRectangles.dopHoriz.vertical).fill(2);

                if (numRectangles.horizontal > numRectangles.dopHoriz.horizontal) {
                    matrixRectangles.splice((i + 1) + matrixRectangles.length - matrixLenght, 0, dopArr);
                }
                else {
                    matrixRectangles.splice(i + matrixRectangles.length - matrixLenght, 0, dopArr); // numRectangles.dopHoriz.horizontal
                }

            }
        }
    }
    // Для дополнительных вертикальных (если одинаковое кол-во столбцов обычных и дополнительных (+1)) распределение по рядам
    if (numRectangles.dopVert.vertical) {
        //Кладка квадратом
        if (numRectangles.dopVert.horizontal == 1 && numRectangles.vertical == 1 && (numRectangles.dopVert.vertical > 2 || numRectangles.horizontal > 2) && numRectangles.dopVert.vertical * 4 > numRectangles.horizontal - 4) {
            layingSquareVert = true;
            let differenceValues = numRectangles.dopVert.vertical; // поменять название
            let dopArr = Array(differenceValues).fill(2);

            for (let k = 0; k < numRectangles.horizontal - differenceValues; k++) {
                matrixRectangles.pop();
            }

            for (let k = 0; k < matrixRectangles.length; k++) {
                matrixRectangles[k].push(...Array(differenceValues - 1).fill(0));
            }

            matrixRectangles.splice(0, 0, dopArr);

            matrixRectangles = matrixRectangles[0].map((_, colIndex) => matrixRectangles.map(row => row[colIndex]));
            for (let k = 1; k < matrixRectangles.length; k++) {
                matrixRectangles[k].splice(matrixRectangles[k].length - numRectangles.dopVert.horizontal, numRectangles.dopVert.horizontal, ...Array(numRectangles.dopVert.horizontal).fill(2));
            }
            dopArr = matrixRectangles[0].slice().reverse()
            // console.log(matrixRectangles[0].slice().reverse())
            matrixRectangles.splice(matrixRectangles.length, 0, dopArr);

            matrixRectangles = matrixRectangles[0].map((_, colIndex) => matrixRectangles.map(row => row[colIndex]));




        }
        //Кладка по столбцам, рядам
        else {


            flagAddVert = true;
            matrixRectangles = matrixRectangles[0].map((_, colIndex) => matrixRectangles.map(row => row[colIndex]));
            matrixLenght = matrixRectangles.length;
            for (let i = 0; i < numRectangles.dopVert.vertical; i++) {

                let dopArr = Array(numRectangles.dopVert.horizontal).fill(2);
                let dopArr1 = Array(numRectangles.horizontal - numRectangles.dopVert.horizontal).fill(0);

                if (numRectangles.vertical > numRectangles.dopVert.vertical) {
                    matrixRectangles.splice((i + 1) + matrixRectangles.length - matrixLenght, 0, dopArr.concat(dopArr1));
                }
                else {
                    matrixRectangles.splice((i) + matrixRectangles.length - matrixLenght, 0, dopArr.concat(dopArr1));
                }

            }
            // matrixRectangles = [[1, 1, 1, 1, 1, 1, 2]];
            matrixRectangles = matrixRectangles[0].map((_, colIndex) => matrixRectangles.map(row => row[colIndex]));

        }

        // newArr = newArr[0].map((_, colIndex) => newArr.map(row => row[colIndex]));
        // console.log(newArr)
    }
    // console.log(matrixRectangles);
    getCoord(matrixRectangles);

}

function rotateRectangles(rectangles, centerX, centerY) {
    // Создаём новый массив для хранения повернутых прямоугольников
    let rotatedRectangles = rectangles.filter(item => item.layer == layerNum).map(rect => {
        // Вычисляем новые координаты
        let newX = -rect.x;
        let newY = -rect.y;


        // Присваиваем новые значения прямоугольника
        rect.x = newX;
        rect.y = newY;
        rect.text = (rect.text == arrText[0]) ? arrText[2] : (rect.text == arrText[1]) ? arrText[3] : (rect.text == arrText[2]) ? arrText[0] : arrText[1];
    });

    drawLayer();
}
function invertColor(rgbColor) {
    // Извлечение R, G, B из строки
    let [r, g, b] = rgbColor.match(/\d+/g).map(Number);

    // Инвертирование цвета
    let invertedR = 255 - r;
    let invertedG = 255 - g;
    let invertedB = 255 - b;

    // Возвращаем инвертированный цвет
    return `rgba(${invertedR}, ${invertedG}, ${invertedB}, 0.5)`;
}
function checkTextF() {
    checkText.forEach(button => {
        button.addEventListener('click', evt => {
            drawLayer();
        });
    })
}


function plusButtonsF() {
    plusButtons.forEach(button => {
        button.addEventListener('click', evt => {
            let lastRectangleLayerIndex = rectangles.findLastIndex(rect => rect.layer == layerNum);
            let lastRectangleLayer = rectangles[lastRectangleLayerIndex];

            // При добавлении нового прямоугольника возвращать цвет прошлого.
            lastRectangleLayer.color = rectangles[lastRectangleLayerIndex - 1].color;


            const item = {
                x: lastRectangleLayer.x + 10,
                y: lastRectangleLayer.y + 10,
                width: lastRectangleLayer.width,
                height: lastRectangleLayer.height,
                isLastlayer: true,
                color: invertColor(lastRectangleLayer.color),
                text: lastRectangleLayer.text,
                column: lastRectangleLayer.column,
                row: lastRectangleLayer.row,
                layer: lastRectangleLayer.layer,
                xAuto: lastRectangleLayer.x + 10,
                yAuto: lastRectangleLayer.y + 10,
                widthAuto: lastRectangleLayer.widthAuto,
                heightAuto: lastRectangleLayer.heightAuto,
                textAuto: lastRectangleLayer.textAuto,
                colorAuto: lastRectangleLayer.colorAuto
            };

            rectangles.splice(lastRectangleLayerIndex + 1, 0, item);

            drawLayer();
        });
    });
}

function rotateButtonsF() {
    rotateButtons.forEach(button => {
        button.addEventListener('click', evt => {
            rotateRectangles(rectangles, centerX, centerY);
        });
    });
}

function initialScale() {
    let palletWidthValue = parseInt(document.getElementById('palletWidth').value);
    let palletHeightValue = parseInt(document.getElementById('palletHeight').value);
    scaleMax = Math.min((parseInt(canvas.width) / (palletWidthValue) * scale).toFixed(1), (parseInt(canvas.height) / palletHeightValue * scale).toFixed(1));

    scaleMax = (palletWidthValue * scaleMax < canvas.width && palletHeightValue * scaleMax < canvas.height) ? scaleMax : scaleMax - 0.1;
    if (scaleMax == 0) {
        alert('Error')
    }
    scale = scaleMax;
    spacingCenterX = float2int((parseInt(canvas.width) - palletWidthValue * scale) / 2);
    spacingCenterY = float2int((parseInt(canvas.height) - palletHeightValue * scale) / 2);
    ctx.setTransform(scale, 0, 0, scale, spacingCenterX, spacingCenterY);
}

function gettingDataForm() {
    inent = Number(document.getElementById('inentM').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
    rectHeight = parseInt(document.getElementById('rectHeight').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
}



let scale = 1;
let scaleMax = 1;
let rectanglesClone = [];
form.addEventListener('submit', function (event) {
    event.preventDefault();
    rectangles = [];
    rectanglesClone = [];
    level = 1;
    scale = 1;
    initialScale();

    let child = tab.lastElementChild;
    while (child) {
        tab.removeChild(child);
        child = tab.lastElementChild;
    }

    const palletWidth = parseInt(document.getElementById('palletWidth').value);
    const palletHeight = parseInt(document.getElementById('palletHeight').value);
    cleanCanvas();

    let layer = parseInt(document.getElementById('minLayer').value);

    gettingDataForm();
    if (palletWidth && palletHeight && rectWidth && rectHeight && inent && layer) {

        // Показ всех слоев одновременно
        for (let i = 0; i < layer; i++) {
            for (let i = 0; i < rectangles.length; i++) {
                rectangles[i].isLastlayer = false;
            }

            if (level % 2 != 0) {
                changeWidthHeight();
                oddLayer(palletWidth, palletHeight)
                changeWidthHeight();

                level += 1;
            } else {
                oddLayer(palletWidth, palletHeight);
                level += 1;
            }

        }

        createButton(layer);
        layerNum = layer;
        drawLayer();
    }
});

function rgbaStringToHex(rgba) {
    // Извлекаем значения R, G, B, A из строки
    const rgbaValues = rgba.match(/\d+(\.\d+)?/g).map(Number);

    const r = rgbaValues[0];
    const g = rgbaValues[1];
    const b = rgbaValues[2];
    const a = rgbaValues[3];

    // Преобразуем R, G, B в шестнадцатеричный формат
    const red = r.toString(16).padStart(2, '0');
    const green = g.toString(16).padStart(2, '0');
    const blue = b.toString(16).padStart(2, '0');

    // Преобразуем альфа-значение (a) в шестнадцатеричный формат
    const alpha = Math.round(a * 255);

    // Возвращаем цвет в формате #RRGGBBAA
    return `#${red}${green}${blue}`;
}

function getAlpha(rgba) {
    const rgbaValues = rgba.match(/\d+(\.\d+)?/g).map(Number);

    const r = rgbaValues[0];
    const g = rgbaValues[1];
    const b = rgbaValues[2];
    const a = rgbaValues[3];

    const alpha = Math.round(a * 255);
    return alpha;
}
function createPlus() {
    const plusButton = document.createElement('button');
    plusButton.type = 'button';
    plusButton.classList.add('plus');
    plusButton.title = 'Добавить прямоугольник';
    plusButton.innerHTML = '+';
    return plusButton;
}

function createRotate() {
    const rotateButton = document.createElement('button');
    rotateButton.type = 'button';
    rotateButton.classList.add('rotate');
    rotateButton.title = 'Повернуть на 180';
    rotateButton.innerHTML = '↻';
    return rotateButton;
}

function createRepeat(i, quantity) {
    const repeatButton = document.createElement('button');
    repeatButton.type = 'button';
    repeatButton.onclick = repeatLayer;
    repeatButton.classList.add('repeat');
    repeatButton.title = `Начиная с ${i} до ${quantity} каждые N слоев. Если не указаны 'C' и 'До'`;
    repeatButton.innerHTML = 'Повтор слоя каждые';
    return repeatButton;
}

function createNumInput(quantity) {
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = '1';
    numberInput.max = quantity;
    numberInput.placeholder = 'N';
    numberInput.style.width = '40px';
    numberInput.style.height = '30px';
    return numberInput;
}

function createContainerLabel(i, quantity) {
    const repeatButton = createRepeat(i, quantity);
    const numberInput = createNumInput(quantity);
    const fromInput = createNumInput(quantity);
    fromInput.placeholder = "С"
    const toInput = createNumInput(quantity);
    toInput.placeholder = "До"
    const containerLabel = document.createElement('label');
    containerLabel.classList.add('repeatLabel');
    containerLabel.appendChild(repeatButton);
    containerLabel.appendChild(numberInput);
    containerLabel.appendChild(fromInput);
    containerLabel.appendChild(toInput);
    return containerLabel;
}

function createCopyButton() {
    const copyButtonLayer = document.createElement('button');
    copyButtonLayer.type = 'button';
    copyButtonLayer.onclick = copyLayer;
    copyButtonLayer.classList.add('copy');
    copyButtonLayer.innerHTML = 'Копировать слой №';
    return copyButtonLayer;
}


function createLayerLabel(quantity) {
    const copyButtonLayer = createCopyButton();
    const layerInput = createNumInput(quantity);
    const containerLayerLabel = document.createElement('label');
    containerLayerLabel.classList.add('layerLabel');
    containerLayerLabel.appendChild(copyButtonLayer);
    containerLayerLabel.appendChild(layerInput);
    return containerLayerLabel;
}

function createCheckInput() {
    const checkInput = document.createElement('input');
    checkInput.type = 'checkbox';
    checkInput.classList.add('checkText');
    checkInput.setAttribute("checked", "");
    return checkInput;
}

function createCheckLabel() {
    const p = document.createElement('p');
    p.classList.add('deleteTextLowLayer');

    const checkLabel = document.createElement('label');
    checkLabel.innerHTML = "Убрать стрелки с нижних слоев";
    const checkInput = createCheckInput();
    checkLabel.appendChild(checkInput);
    p.appendChild(checkLabel);
    return p;
}

function createDivContent(i, quantity) {
    const plusButton = createPlus();
    const rotateButton = createRotate();

    const containerLabel = createContainerLabel(i, quantity);

    const containerLayerLabel = createLayerLabel(quantity);

    const p = createCheckLabel();

    const div = document.createElement('div');
    div.classList.add('content');
    const rgbaString = rectangles[rectangles.findIndex(rect => rect.layer == i)].color;
    div.innerHTML = `
  <div class="color_wrapper">
    <input class="color_picker" oninput="setColor(this)" type="color" value='${rgbaStringToHex(rgbaString)}' style= "background-color: ${rgbaStringToHex(rgbaString)}">
    <input class="color_picker_alpha" oninput="setColor(this)" type="range" min="0" max="255" step="1" value="${getAlpha(rgbaString)}" />
  </div>`;
    if (i == quantity) {
        div.style.display = 'block';
    }

    div.appendChild(plusButton);
    div.appendChild(rotateButton);
    div.appendChild(containerLayerLabel);
    div.appendChild(p);
    div.appendChild(containerLabel);
    return div;
}


const tab = document.querySelector('.tab');
const saveQuestion = document.getElementById('saveQuestion');
const saveConfirm = document.getElementById('saveConfirm');
const saveCancel = document.getElementById('saveCancel');

let pendingSwitch = null;

function createButton(quantity) {

    for (let i = 1; i <= quantity; i++) {
        const button = document.createElement('input');
        button.setAttribute('type', 'radio');
        button.setAttribute("checked", "");
        button.name = "tab-bth";
        button.id = `tab-bth-${i}`;
        button.classList.add('btn');
        button.addEventListener('click', () => {

            if (hasUnsavedChanges()) {
                pendingSwitch = i; // Запоминаем слой, на который нужно переключиться
                saveQuestion.style.display = 'flex';
                saveConfirm.focus()
            } else {
                layerNum = i;
                selectedRectangles = [];
                selectedRectangle = null
                drawLayer();
            }
            displayNone();
            let content = button.nextElementSibling.nextElementSibling;
            content.style.display = 'block'
        })

        tab.appendChild(button);

        const label = document.createElement('label');
        label.setAttribute("for", `tab-bth-${i}`);
        label.innerHTML = `Слой ${i}`
        tab.appendChild(label);

        const div = createDivContent(i, quantity);

        tab.appendChild(div);
    }

}

function displayNone() {
    let coll = document.getElementsByClassName("btn");
    for (let j = 0; j < coll.length; j++) {
        let content = coll[j].nextElementSibling.nextElementSibling;
        content.style.display = "none";

    }

}

function assignment(whom, who) {
    for (let j = 0; j < whom.length; j++) {
        whom[j].x = who[j].x;
        whom[j].y = who[j].y;
        whom[j].width = who[j].width;
        whom[j].height = who[j].height;
        whom[j].xAuto = who[j].xAuto;
        whom[j].yAuto = who[j].yAuto;
        whom[j].widthAuto = who[j].widthAuto;
        whom[j].heightAuto = who[j].heightAuto;
        whom[j].text = who[j].text;
        whom[j].column = who[j].column;
        whom[j].row = who[j].row;
        whom[j].textAuto = who[j].textAuto;

    }
}

function copyLayer(evt) {
    const n = parseInt(evt.srcElement.nextElementSibling.value);

    let layerThis = rectangles.filter(rect => rect.layer == layerNum);
    let layerOther = rectangles.filter(rect => rect.layer == n);
    if (layerOther.length > layerThis.length) {
        rectangles.splice(rectangles.indexOf(layerOther.at(layerThis.length - layerOther.length)), layerOther.length - layerThis.length);
        layerOther = rectangles.filter(rect => rect.layer == i);

    } else if (layerOther.length < layerThis.length) {
        for (let j = 0; j < layerThis.length - layerOther.length; j++) {
            rectangles.splice(rectangles.indexOf(layerOther[0]), 0, layerOther[0]);
            layerOther = rectangles.filter(rect => rect.layer == i);
        }
    }

    assignment(layerThis, layerOther)
    drawLayer();
}
let unsaveLayers = [];
function repeatLayer(evt) {
    const n = parseInt(evt.srcElement.nextElementSibling.value);
    let start = parseInt(evt.srcElement.nextElementSibling.nextElementSibling.value);
    const end = parseInt(evt.srcElement.nextElementSibling.nextElementSibling.nextElementSibling.value);
    start = (start) ? start : layerNum + n;
    let maxLayer = rectangles.at(-1).layer;
    maxLayer = (end) ? end : maxLayer;
    let layerThis = rectangles.filter(rect => rect.layer == layerNum);
    // let layerBigger = rectangles.filter(rect => rect.layer > layerNum);
    unsaveLayers = [];
    for (let i = start; i <= maxLayer; i += n) {
        unsaveLayers.push(i);
        let layerBigger = rectangles.filter(rect => rect.layer == i);
        if (layerBigger.length > layerThis.length) {
            rectangles.splice(rectangles.indexOf(layerBigger.at(layerThis.length - layerBigger.length)), layerBigger.length - layerThis.length);
            layerBigger = rectangles.filter(rect => rect.layer == i);

        } else if (layerBigger.length < layerThis.length) {
            for (let j = 0; j < layerThis.length - layerBigger.length; j++) {
                rectangles.splice(rectangles.indexOf(layerBigger[0]), 0, layerBigger[0]);
                layerBigger = rectangles.filter(rect => rect.layer == i);
            }
        }
        assignment(layerBigger, layerThis)

    }
    
    let checked = (start == layerNum) ? document.querySelectorAll('.btn')[start + n - 1] : document.querySelectorAll('.btn')[start - 1];
    checked.checked = true;
    layerNum = (start == layerNum) ? start + n: start;
    displayNone();
    let content = checked.nextElementSibling.nextElementSibling;
    content.style.display = 'block';
    saveQuestion.childNodes[1].childNodes[1].innerHTML = `Вы уверены, что хотите переключить слой? Изменения будут потеряны для ${unsaveLayers.length}: №${unsaveLayers.join(', ')} слоев.`;
    if (unsaveLayers.length > 1) {
        saveQuestion.childNodes[1].childNodes[1].nextElementSibling.innerHTML = 'Сохранить все';
    }
    drawLayer();
}

function setColor(el) {
    const colorWrapper = el.closest('.color_wrapper'); // Находим ближайший родитель с классом .color_wrapper
    const colorPicker = colorWrapper.querySelector('.color_picker');
    const colorPickerAlpha = colorWrapper.querySelector('.color_picker_alpha');

    colorWrapper.style.backgroundColor = colorPicker.value +
        (colorPickerAlpha.value == 255 ? "" :
            parseInt(colorPickerAlpha.value).toString(16).padStart(2, "0"));

    changeColor(colorWrapper.style.backgroundColor);
}


function changeColor(color) {
    rectangles.filter(rect => rect.layer == layerNum).forEach(rect => {
        rect.color = color;
        rect.colorAuto = color;
    });
    rectanglesClone.filter(rect => rect.layer == layerNum).forEach(rect => {
        rect.color = color;
        rect.colorAuto = color;
    });
    drawLayer();
}



function switchLayer() {
    if (pendingSwitch !== null) {
        layerNum = pendingSwitch; // Переключаемся на запомненный слой
        drawLayer();
        pendingSwitch = null; // Сбрасываем запомненный слой

    }
}

function hasUnsavedChanges() {
    const startIndex = rectanglesClone.findIndex(rect => rect.layer == layerNum);
    const endIndex = rectanglesClone.findLastIndex(rect => rect.layer == layerNum);
    const startIndexRect = rectangles.findIndex(rect => rect.layer == layerNum);
    const endIndexRect = rectangles.findLastIndex(rect => rect.layer == layerNum);
    for (let i = Math.min(startIndex, startIndexRect); i <= Math.max(endIndex, endIndexRect); i++) {
        if (JSON.stringify(rectangles[i]) !== JSON.stringify(rectanglesClone[i])) {
            return true;
        }
    }
    return false;
}


function updateDataRectangles() {
    if (unsaveLayers.length > 1) {
        for (let i = 0; i < unsaveLayers.length; i++) {
            let num = unsaveLayers[i];
            // layerNum = num
            const startIndex = rectangles.findIndex(rect => rect.layer == num);
            const endIndex = rectangles.findLastIndex(rect => rect.layer == num);
            const startIndexChangeArr = rectanglesClone.findIndex(rect => rect.layer == num);
            const endIndexChangeArr = rectanglesClone.findLastIndex(rect => rect.layer == num);
            // console.log(rectangles[1], rectanglesClone[1])
            if (startIndex != -1 && endIndex != -1) {

                if (endIndexChangeArr > endIndex) {
                    rectanglesClone.splice(endIndex, endIndexChangeArr - endIndex)
                }
                if (endIndexChangeArr < endIndex) {
                    rectanglesClone.splice(startIndexChangeArr, 0, ...JSON.parse(JSON.stringify(rectangles.slice(startIndex, endIndex - endIndexChangeArr))));
                }
                for (let i = startIndex; i <= endIndex; i++) {
                    rectangles[i].color = rectangles[i].colorAuto
                    rectanglesClone[i] = JSON.parse(JSON.stringify(rectangles[i]));
                }

            }
        }
    } else {
        const startIndex = rectangles.findIndex(rect => rect.layer == layerNum);
        const endIndex = rectangles.findLastIndex(rect => rect.layer == layerNum);
        const startIndexChangeArr = rectanglesClone.findIndex(rect => rect.layer == layerNum);
        const endIndexChangeArr = rectanglesClone.findLastIndex(rect => rect.layer == layerNum);
        // console.log(layerNum)
        if (startIndex != -1 && endIndex != -1) {

            if (endIndexChangeArr > endIndex) {
                rectanglesClone.splice(endIndex, endIndexChangeArr - endIndex)
            }
            if (endIndexChangeArr < endIndex) {
                rectanglesClone.splice(startIndexChangeArr, 0, ...JSON.parse(JSON.stringify(rectangles.slice(startIndex, endIndex - endIndexChangeArr))));
            }
            for (let i = startIndex; i <= endIndex; i++) {
                rectangles[i].color = rectangles[i].colorAuto
                rectanglesClone[i] = JSON.parse(JSON.stringify(rectangles[i]));
            }

        }
    }


    saveQuestion.childNodes[1].childNodes[1].nextElementSibling.innerHTML = 'Coхранить';
    saveQuestion.childNodes[1].childNodes[1].innerHTML = `Вы уверены, что хотите переключить слой? Изменения будут потеряны.`;
    unsaveLayers = [];

}

function returnDataRectangles() {
    if (unsaveLayers.length > 1) {
        for (let i = 0; i < unsaveLayers.length; i++) {
            let num = unsaveLayers[i];
            // layerNum = num
            const startIndex = rectanglesClone.findIndex(rect => rect.layer == num);
            const endIndex = rectanglesClone.findLastIndex(rect => rect.layer == num);
            const startIndexChangeArr = rectangles.findIndex(rect => rect.layer == num);
            const endIndexChangeArr = rectangles.findLastIndex(rect => rect.layer == num);
            if (endIndexChangeArr != -1 && startIndexChangeArr != -1) {
                if (endIndexChangeArr > endIndex) {
                    rectangles.splice(endIndex, endIndexChangeArr - endIndex)
                }
                if (endIndexChangeArr < endIndex) {
                    rectangles.splice(startIndexChangeArr, 0, ...JSON.parse(JSON.stringify(rectanglesClone.slice(startIndex, endIndex - endIndexChangeArr))));
                }
            }
            // console.log(rectangles.length, rectanglesClone.length)
            for (let i = startIndex; i <= endIndex; i++) {
                rectangles[i] = JSON.parse(JSON.stringify(rectanglesClone[i]));
            }
        }
    } else {
        const startIndex = rectanglesClone.findIndex(rect => rect.layer == layerNum);
        const endIndex = rectanglesClone.findLastIndex(rect => rect.layer == layerNum);
        const startIndexChangeArr = rectangles.findIndex(rect => rect.layer == layerNum);
        const endIndexChangeArr = rectangles.findLastIndex(rect => rect.layer == layerNum);
        if (endIndexChangeArr != -1 && startIndexChangeArr != -1) {
            if (endIndexChangeArr > endIndex) {
                rectangles.splice(endIndex, endIndexChangeArr - endIndex)
            }
            if (endIndexChangeArr < endIndex) {
                rectangles.splice(startIndexChangeArr, 0, ...JSON.parse(JSON.stringify(rectanglesClone.slice(startIndex, endIndex - endIndexChangeArr))));
            }
        }
        // console.log(rectangles.length, rectanglesClone.length)
        for (let i = startIndex; i <= endIndex; i++) {
            rectangles[i] = JSON.parse(JSON.stringify(rectanglesClone[i]));
        }
    }

    saveQuestion.childNodes[1].childNodes[1].nextElementSibling.innerHTML = 'Coхранить';
    saveQuestion.childNodes[1].childNodes[1].innerHTML = `Вы уверены, что хотите переключить слой? Изменения будут потеряны.`;
    unsaveLayers = [];

}

saveConfirm.addEventListener('click', () => {

    updateDataRectangles();
    saveQuestion.style.display = 'none'; // Закрываем модальное окно
    switchLayer()

});

saveCancel.addEventListener('click', () => {
    returnDataRectangles();
    saveQuestion.style.display = 'none'; // Закрываем модальное окно
    switchLayer()
});

function drawLayer() {
    let startLayer = -1;
    let endLayer = -1;
    cleanCanvas();
    for (var i = 0; i < rectangles.length; i++) {
        rectangles[i].isLastlayer = false;
        rectanglesClone[i].isLastlayer = false;

        if (rectangles[i].layer == layerNum && startLayer == -1) {
            startLayer = i;
        }
        if (rectangles[i].layer == layerNum + 1 && endLayer == -1) {
            endLayer = i;
        }
    }

    for (let i = startLayer; i < ((endLayer == -1) ? rectangles.length : endLayer); i++) {
        rectangles[i].isLastlayer = true;
        rectanglesClone[i].isLastlayer = true;
    }

    rectangles.slice(0, ((endLayer == -1) ? rectangles.length : endLayer)).forEach(drawRectangle);
    drawPallet();

}


function drawPallet() {
    const palletWidth = parseInt(document.getElementById('palletWidth').value);
    const palletHeight = parseInt(document.getElementById('palletHeight').value);
    ctx.strokeRect(0, 0, palletWidth, palletHeight);
}


function drawRectangle(rect) {
    ctx.beginPath();


    ctx.rect(centerX + rect.x - float2int(rect.width / 2), centerY + rect.y - float2int(rect.height / 2), rect.width, rect.height);

    ctx.fillStyle = selectedRectangles.includes(rect) || selectedRectangle == rect ? 'rgba(255, 0, 0, 0.5)' : rect.color;
    ctx.fill();
    if (!rect.isLastlayer) {
        ctx.strokeStyle = rect.color;
    } else {
        ctx.strokeStyle = 'black'
    }
    drawNumbers(rect);
    drawArrow(rect);
    ctx.stroke();
    // ctx.closePath();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


function drawNumbers(rect) {
    ctx.font = `${15 / scale}px arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (rect.isLastlayer) {
        //     ctx.fillStyle = rect.color;
        // } else {
        ctx.fillStyle = 'black'
        // }

        let text = (rect.x).toString() + ', ' + (-rect.y).toString();
        ctx.fillText(text, centerX + rect.x, centerY + rect.y);
    }
}
// checkText = document.querySelectorAll('.checkText');
// console.log(checkText)
function drawArrow(rect) {

    ctx.font = `${24 / scale}px arial`;
    ctx.textBaseline = "middle";
    let bullCheckText = false;
    try {
        bullCheckText = !checkText[rect.layer]?.checked
    } catch (e) {
        console.log('Ошибка ' + e.name + ":" + e.message);
    }

    if (rect.isLastlayer || bullCheckText) {
        //     ctx.fillStyle = rect.color;
        // } else {
        //     ctx.fillStyle = 'black'
        // }
        if (!rect.isLastlayer && bullCheckText) {
            ctx.fillStyle = 'grey'
        }

        let widthPlus = centerX + rect.x - Math.floor(rect.width / 2) + 15 / scale;
        let widthMinus = centerX + rect.x + Math.floor(rect.width / 2) - 15 / scale;
        let heightPlus = rect.y + centerY - Math.floor(rect.height / 2) + 15 / scale;
        let heightMinus = rect.y + centerY + Math.floor(rect.height / 2) - 15 / scale;
        if (rect.text == '↑') {
            ctx.fillText(rect.text, widthPlus, heightPlus);
            ctx.fillText(rect.text, widthMinus, heightPlus);
        } else if (rect.text == '→') {
            ctx.fillText(rect.text, widthMinus, heightPlus);
            ctx.fillText(rect.text, widthMinus, heightMinus);

        } else if (rect.text == '←') {
            ctx.fillText(rect.text, widthPlus, heightPlus);
            ctx.fillText(rect.text, widthPlus, heightMinus);

        } else {
            ctx.fillText(rect.text, widthPlus, heightMinus);
            ctx.fillText(rect.text, widthMinus, heightMinus);

        }
    }


}


function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) / scale - spacingCenterX / scale,
        y: (evt.clientY - rect.top) / scale - spacingCenterY / scale
    };
}

function isInsideRect(mousePos, rect) {
    return mousePos.x > centerX + rect.x - float2int(rect.width / 2) &&
        mousePos.x < centerX + rect.x + float2int(rect.width / 2) &&
        mousePos.y > centerY + rect.y - float2int(rect.height / 2) &&
        mousePos.y < centerY + rect.y + float2int(rect.height / 2);
}

//Отключение контекстного меню
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

const deleteQuestion = document.getElementById('deleteQuestion');
const deleteConfirm = document.getElementById('deleteConfirm');
const deleteCancel = document.getElementById('deleteCancel');

deleteConfirm.addEventListener('click', () => {
    if (selectedRectangles.length == rectangles.filter(rect => rect.layer == layerNum).length) {
        deleteCancel.click();
        return alert('Нельзя удалить слой!');

    }

    selectedRectangles.forEach(selected => {
        let indexDeleted = rectangles.indexOf(selected);
        rectangles.splice(indexDeleted, 1);
    });

    deleteQuestion.style.display = 'none'; // Закрываем модальное окно
    selectedRectangles = [];
    selectedRectangle = null;
    drawLayer();

});

deleteCancel.addEventListener('click', () => {
    deleteQuestion.style.display = 'none'; // Закрываем модальное окно
    selectedRectangle = null;
    selectedRectangles = [];
    drawLayer();
});

function handleMouseDown(e) {
    startX = e.offsetX;
    startY = e.offsetY;
    isSelecting = true;
    selectionBox.style.display = 'block';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = '0px';
    selectionBox.style.height = '0px';
}


canvas.addEventListener('mousedown', function (evt) {
    // selectedRectangles = []
    const mousePos = getMousePos(canvas, evt);
    rectangles.forEach(rect => {
        if (isInsideRect(mousePos, rect) && rect.isLastlayer) {
            //Когда несколько выделяется
            if (selectedRectangles.length) {
                selectedRectangle = rect;
                dragOffsetX = mousePos.x - rect.x;
                dragOffsetY = mousePos.y - rect.y;
                if (!selectedRectangles.includes(selectedRectangle)) {
                    selectedRectangles = []
                }
            }

            //Когда 1 выделен
            if (!selectedRectangles.includes(selectedRectangle)) {
                selectedRectangles.push(rect);
            }
            selectedRectangle = rect;
            dragOffsetX = mousePos.x - rect.x;
            dragOffsetY = mousePos.y - rect.y;
            if (evt.button === 0) {


            } else if (evt.button === 1) {
                evt.preventDefault();

                selectedRectangles.forEach(rect => {
                    let dop = rect.height;
                    rect.height = rect?.width;
                    rect.width = dop;

                    if (arrText.indexOf(rect.text) + 1 < arrText.length) {
                        rect.text = arrText[arrText.indexOf(rect.text) + 1];
                    } else {
                        rect.text = arrText[0];
                    }
                });


                drawLayer();
            } else if (evt.button === 2) {
                deleteRectangle();
            }
        }
    });
    if (!selectedRectangle) {

        handleMouseDown(evt)

    }
    // console.log(selectedRectangles)
});

function deleteRectangle() {
    if (selectedRectangles.length) {
        textDeleted();
        deleteQuestion.style.display = 'flex';
        deleteConfirm.focus()
    }
}

function turnRectRight() {

    selectedRectangles.forEach(rect => {
        let dop = rect.height;
        rect.height = rect?.width;
        rect.width = dop;

        if (arrText.indexOf(rect.text) + 1 < arrText.length) {
            rect.text = arrText[arrText.indexOf(rect.text) + 1];
        } else {
            rect.text = arrText[0];
        }
    });


    drawLayer();
}

function turnRectLeft() {
    selectedRectangles.forEach(rect => {
        let dop = rect.height;
        rect.height = rect?.width;
        rect.width = dop;

        if (arrText.indexOf(rect.text) - 1 > -1) {
            rect.text = arrText[arrText.indexOf(rect.text) - 1];
        } else {
            rect.text = arrText[3];
        }
    });


    drawLayer();
}

function textDeleted() {
    let count = selectedRectangles.length;
    let objectWord;

    if (count === 1) {
        objectWord = 'объект';
    } else if (count >= 2 && count <= 4) {
        objectWord = 'объекта';
    } else {
        objectWord = 'объектов';
    }

    deleteQuestion.childNodes[1].childNodes[1].innerHTML = `Вы уверены, что хотите удалить ${count} ${objectWord}?`;
}

function handleMouseMove(e) {
    if (!isSelecting) return;
    const x = e.offsetX;
    const y = e.offsetY;
    const width = x - startX;
    const height = y - startY;
    selectionBox.style.width = `${Math.abs(width)}px`;
    selectionBox.style.height = `${Math.abs(height)}px`;
    selectionBox.style.left = `${Math.min(startX, x)}px`;
    selectionBox.style.top = `${Math.min(startY, y)}px`;
}

function clampCoordinate(delta, center, halfSize) {
    if (delta > 0) {
        return Math.min(delta, center - halfSize);
    } else {
        return Math.max(delta, -(center - halfSize));
    }
}

canvas.addEventListener('mousemove', function (evt) {
    if (selectedRectangle && evt.which == 1) {
        const mousePos = getMousePos(canvas, evt);
        selectedRectangles = selectedRectangles.filter(rect => rect != selectedRectangle);
        // console.log(selectedRectangle)
        // console.log(selectedRectangles);
        // selectedRectangles.forEach(selectedRectangle => {

        // });
        const halfWidth = float2int(selectedRectangle.width / 2);
        const halfHeight = float2int(selectedRectangle.height / 2);
        const deltaX = mousePos.x - dragOffsetX;
        const deltaY = mousePos.y - dragOffsetY;
        selectedRectangle.x = float2int(clampCoordinate(deltaX, centerX, halfWidth));
        selectedRectangle.y = float2int(clampCoordinate(deltaY, centerY, halfHeight));
        for (let i = 0; i < selectedRectangles.length; i++) {

            selectedRectangles[i].x = float2int(clampCoordinate(mousePos.x - (dragOffsetX + selectedRectangle.xAuto - selectedRectangles[i].xAuto), centerX, selectedRectangles[i].width / 2));
            selectedRectangles[i].y = float2int(clampCoordinate(mousePos.y - (dragOffsetY + selectedRectangle.yAuto - selectedRectangles[i].yAuto), centerY, selectedRectangles[i].height / 2));

        }

        // selectedRectangle.y = mousePos.y - centerY - dragOffsetY;
        drawLayer();
    } else {
        handleMouseMove(evt);
    }

});

canvas.addEventListener('mouseup', function () {
    if (selectedRectangle) {
        selectedRectangle = null;
        selectedRectangles = [];
        drawLayer();
    }
});

function cleanCanvas() {
    const palletWidth = parseInt(document.getElementById('palletWidth').value);
    const palletHeight = parseInt(document.getElementById('palletHeight').value);
    ctx.clearRect(-spacingCenterX / scale, -spacingCenterY / scale, Math.max(canvas.width, palletWidth) + spacingCenterX / scale * 2, Math.max(canvas.height, palletHeight) + spacingCenterY / scale * 2);
}

function setCanvasScale(scale) {

    cleanCanvas();
    spacingCenterX = float2int((parseInt(document.getElementById('myCanvas').width) - parseInt(document.getElementById('palletWidth').value) * scale) / 2);
    spacingCenterY = float2int((parseInt(document.getElementById('myCanvas').height) - parseInt(document.getElementById('palletHeight').value) * scale) / 2);
    // Сбрасываем трансформацию и устанавливаем новый масштаб
    ctx.setTransform(scale, 0, 0, scale, spacingCenterX, spacingCenterY);
    drawLayer(); // Перерисовываем слой после изменения масштаба

}


document.addEventListener('keydown', evt => {
    if (document.activeElement.tagName !== 'INPUT') {
        if (evt.code === 'Minus') {
            scale = Math.max((scale != 0.1) ? 0.2 : 0.1, scale - 0.1); // Ограничиваем масштаб, чтобы не стало меньше 0.1
            setCanvasScale(scale);
        } else if (evt.code === 'Equal') {
            scale = Math.min(scaleMax, scale + 0.1);;
            setCanvasScale(scale);
        } else if (evt.code == 'Delete') {
            deleteRectangle();
        } else if (evt.code == 'ArrowRight') {
            turnRectRight();
        } else if (evt.code == 'ArrowLeft') {
            turnRectLeft();
        }
    }
});

const selectionBox = document.getElementById('selectionBox');
let selectedRectangles = [];
let startX, startY, isSelecting = false;

function isRectIntersect(sx, sy, sw, sh, rect) {
    if (rect.layer != layerNum) {
        return false;
    }

    const sx2 = sx + sw;
    const sy2 = sy + sh;
    const rectX2 = rect.x + rect.width / 2;
    const rectY2 = rect.y + rect.height / 2;
    return !(sx2 < rect.x - rect.width / 2 || sx > rectX2 || sy2 < rect.y - rect.height / 2 || sy > rectY2);
}





function handleMouseUp(e) {
    if (!isSelecting) return;
    isSelecting = false;
    selectionBox.style.display = 'none';
    const x = (Math.min(startX, e.offsetX) / scale - spacingCenterX / scale) - centerX;
    const y = (Math.min(startY, e.offsetY) / scale - spacingCenterY / scale) - centerY;
    const width = Math.abs(e.offsetX - startX) / scale;
    const height = Math.abs(e.offsetY - startY) / scale;

    // Обновляем массив выбранных прямоугольников
    selectedRectangles = rectangles.filter(rect => isRectIntersect(x, y, width, height, rect));
    const filteredRectangles = rectangles.filter(rectangle => rectangle.layer === layerNum);

    // Обновляем свойства для отфильтрованных элементов
    filteredRectangles.forEach(rectangle => {
        rectangle.xAuto = rectangle.x;
        rectangle.yAuto = rectangle.y;
        rectangle.widthAuto = rectangle.width;
        rectangle.heightAuto = rectangle.height;
        rectangle.textAuto = rectangle.text;
        rectangle.color = rectangle.colorAuto;
    });


    drawLayer();
}

function handleDocumentMouseUp(e) {
    if (isSelecting) {
        handleMouseUp(e);
    }
}

// Get modal element
var modal = document.getElementById("controlsModal");

// Get the button that opens the modal
var btn = document.getElementById("infoButton");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


document.addEventListener('mouseup', handleDocumentMouseUp); // Handle mouseup for the entire document

// Инициализация при загрузке
form.dispatchEvent(new Event('submit'));