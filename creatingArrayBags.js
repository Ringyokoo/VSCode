let centerX, centerY, predelX, predelY;
let rectWidth, rectHeight;
let rectangles = [];
let inent;
let arrText = ['↑', '→', '↓', '←'];
let flagAddVert = false;
let flagAddHoriz = false;
let spacingCenterX = 0;
let spacingCenterY = 0;
let rgbColor = ``;

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
    // console.log(flagOutside)
    if (flagOutside) {

        numHorizontal = Math.floor((palletWidth - inent) / (rectWidth + inent)) + 1;
        lengthRect = numHorizontal * (rectWidth * 2 + inent) + inent;
        numVertical = Math.floor((palletHeight - inent) / (rectHeight + inent)) + 1;
        widthRect = numVertical * (rectHeight * 2 + inent) + inent;
    }


    let [dopHoriz, dopVert] = findDopRectangles(palletWidth, palletHeight, lengthRect, widthRect)

    if (numHorizontal > 0 && numVertical > 0) {
        numRectangles = { horizontal: numHorizontal, vertical: numVertical, dopHoriz: dopHoriz, dopVert: dopVert };
    } else {
        return alert('Не подходящие параметры!')
    }
    //---------------------------------------------Сюда добавить ошибку в случае если пакетов задали больше возможного разместить----------------------------------------------------
    return numRectangles;

}
function createBaseMatrix(numRows, numCols, number) {
    return Array(numRows).fill().map(() => Array(numCols).fill(number));
}

let layingSquareHoriz = false;
let layingSquareVert = false;
let countDopHorizHoriz = 0;

function oddLayer(palletWidth, palletHeight) { // сюда всатвка кол-во мешков
    // let matrixRectangles = [];
    centerX = Math.floor(palletWidth / 2);
    centerY = Math.floor(palletHeight / 2);
    let numRectangles = findNumberOfRectangles(palletWidth, palletHeight); // сюда всатвка кол-во мешков
    // console.log(numRectangles.horizontal * numRectangles.vertical);
    // if (countBags && countBags <= numRectangles){
    //     numRectangles = countBags;
    //     console.log('34567890-')
    // }else if(countBags){
    //     alert(`Кол-во мешков больше возможного, максимум = ${numRectangles}`);
    //     countBag.value = numRectangles;
    // }
    // console.log(countBags)

    let matrixRectangles = createBaseMatrix(numRectangles.horizontal, numRectangles.vertical, 1);
    

    let matrixLenght = matrixRectangles.length;
    //Сделать кладку основанную на кол-ве мешков из формы
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

            // Создаем копию массива, чтобы не изменять оригинал
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
    let countInMatrix = 0;
    matrixRectangles.map(cell => cell.map(c => countInMatrix += (c)? 1 : 0)); // сюда блять надооооо
    console.log(countInMatrix);
    getCoord(matrixRectangles);

}