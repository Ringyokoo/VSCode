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

let flagSameLayer = false;
let flagReplaceBaseMatrix = 0;
let flagRemoveDops = 0;
let matrixRectangles2 = [];
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

    const palletWidth = parseInt(document.getElementById('palletWidth').value);
    const palletHeight = parseInt(document.getElementById('palletHeight').value);
    const gapXAxis = float2int((float2int(palletWidth / 2) - maxX) / 2);
    const gapYAxis = float2int((float2int(palletHeight / 2) - maxY) / 2);

    arr.forEach(rect => {
        rect.x += gapXAxis;
        rect.y += gapYAxis;
        rect.xAuto += gapXAxis;
        rect.yAuto += gapYAxis;
    });
}
function removeEmptyOrZeroMatrices(arr) {
    return arr.filter(subArray =>
        subArray.length > 0 && subArray.some(value => value !== 0)
    );
}
// Основная функция
function getCoord(arr) {
    let coordinateX = 0;
    let coordinateY = 0;
    let arr1Layer = [];
    let text = arrText[2];

    //Изменение матрицы, возможно надо делать не тут, но пока пусть лежит
    let countInMatrix1 = 0;
    let countInMatrix2 = 0;
    arr.map(cell => cell.forEach(c => {
        countInMatrix1 += (c == 1) ? 1 : 0;
        countInMatrix2 += (c == 2) ? 1 : 0;
    }));


    // if (countBags < countInMatrix1 + countInMatrix2 && countBags !== null) {

    //     arr.map((cell, index1) => {
    //         for (let index2 = cell.length - 1; index2 >= 0; index2--) {
    //             if (cell[index2] == 2 && countInMatrix1 + countInMatrix2 > countBags) {
    //                 arr[index1].splice(index2, 1);
    //                 countInMatrix2--;
    //                 for(let i = index1; i < arr.length; i++){
    //                     if(arr[i][index2] == 0){
    //                         arr[i].splice(index2, 1)
    //                     }
    //                 }
    //             }
    //         }
    //     });

    //     arr.map((cell, index1) => {
    //         for (let index2 = cell.length - 1; index2 >= 0; index2--) {
    //             if (cell[index2] == 1 && countInMatrix1 + countInMatrix2 > countBags) {
    //                 arr[index1].splice(index2, 1);
    //                 countInMatrix1--;
    //             }
    //         }
    //     });


    // }


    // ввеерх Изменение матрицы, возможно надо делать не тут, но пока пусть лежит. Надо исправлять тут, так как матрица изначально формируется исходя из размеров

    for (let i = 0; i < arr.length; i++) {
        if (!arr1Layer?.at(-1)?.isLastlayer) {
            rgbColor = `rgba(${getRandomInt(255)}, ${getRandomInt(255)}, ${getRandomInt(255)}, 0.5)`;
        }

        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === 0) continue;

            text = determineText(arr, i, j, arrText);
            // console.log(i, j, arr1Layer.length)
            coordinateX = calculateCoordinate(arr1Layer, i, j, rectWidth, true, flagAddVert);
            coordinateY = calculateCoordinate(arr1Layer, i, j, rectHeight, false, flagAddHoriz);
            // console.log(coordinateX, coordinateY,arr1Layer);

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
            // console.log(item);
            arr1Layer.push(item);
            // console.log("arr1Layer:", JSON.parse(JSON.stringify(arr1Layer)));

            if (arr[i][j] === 2) {
                changeWidthHeight();
            }
        }
    }

    // if (countBags < arr1Layer.length) {
    //     arr1Layer.splice(countBags, arr1Layer.length - countBags); //Убирать допы, так как они ебать мешают, но не тут, так как тут уже из готового делается. Работа с матрицами получается.
    // }
    if (countBags > arr1Layer.length && level == 1) {
        alert('Ко-во мешков на слой больше возможного, поставьте <= ' + arr1Layer.length);
        countBag.value = arr1Layer.length;
        // -----------------------Прервать выполнение--------------------------------
    } else if (countBags == 0) { //????????????????????????????????????????????????
        countBag.value = arr1Layer.length;
    }

    if (flagAddVert) {
        updateElementPositions(arr1Layer, 'width', 'row', 'x');
    }
    if (flagAddHoriz) {
        updateElementPositions(arr1Layer, 'height', 'column', 'y');
    }
    
    centering(arr1Layer); //Переделать для 3 штук, чтобы оно перестраивалось

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


    let numH2 = Math.floor((palletWidth - inent) / (rectHeight + inent));
    let lR2 = numH2 * (rectHeight + inent) + inent;
    let numV2 = Math.floor((palletHeight - inent) / (rectWidth + inent));
    let wR2 = numV2 * (rectWidth + inent) + inent;

    matrixRectangles2 = createBaseMatrix(numH2, numV2, 1);
    //DRY





    if (flagOutside) {

        numHorizontal = Math.floor((palletWidth - inent) / (rectWidth + inent)) + 1;
        lengthRect = numHorizontal * (rectWidth * 2 + inent) + inent;
        numVertical = Math.floor((palletHeight - inent) / (rectHeight + inent)) + 1;
        widthRect = numVertical * (rectHeight * 2 + inent) + inent;


        numH2 = Math.floor((palletWidth - inent) / (rectHeight + inent)) + 1;
        lR2 = numH2 * (rectHeight * 2 + inent) + inent;
        numV2 = Math.floor((palletHeight - inent) / (rectWidth + inent)) + 1;
        wR2 = numV2 * (rectWidth * 2 + inent) + inent;

        matrixRectangles2 = createBaseMatrix(numH2, numV2, 1);
    }

    let [dopHoriz, dopVert] = findDopRectangles(palletWidth, palletHeight, lengthRect, widthRect)
    changeWidthHeight();
    let [dopHoriz2, dopVert2] = findDopRectangles(palletWidth, palletHeight, lR2, wR2)
    changeWidthHeight();

    let countRecWithDop = numHorizontal * numVertical + dopHoriz?.horizontal * dopHoriz?.vertical + dopVert?.horizontal * dopVert?.vertical;
    let countRecWithDop2 = numH2 * numV2 + dopHoriz2?.horizontal * dopHoriz2?.vertical + dopVert2?.horizontal * dopVert2?.vertical;
    
    if (countRecWithDop < countRecWithDop2 && (!countBags || countBags > countRecWithDop2 && countBags > countRecWithDop)) {
        changeNum()
        flagSameLayer = true;
    }


    if (countBags) {
        // console.log(Number(countBags), dopHoriz2?.horizontal * dopHoriz2?.vertical + dopVert2?.horizontal * dopVert2?.vertical, numH2 * numV2)
        //----------------------------Удаление блоков дополнительных-------------------------------------------------------
        if (Number(countBags) == countRecWithDop2 && Number(countBags) != countRecWithDop2) { // Если заданное кол-во блоков соотвествует измененному состоянию
            console.log(1111);
            flagSameLayer = true;
            changeNum()
        } else if (Number(countBags) == numH2 * numV2) { // Если заданное кол-во блоков соотвествует измененному состоянию без доп блоков
            console.log(22222);
            flagSameLayer = true;
            changeNum();
            dopVert2.horizontal = dopVert2.vertical = dopHoriz2.horizontal = dopHoriz2.vertical = 0;
        } else if (Number(countBags) == countRecWithDop2 - dopHoriz2?.horizontal * dopHoriz2?.vertical && dopHoriz2?.horizontal * dopHoriz2?.vertical != 0) {
            console.log(3333);
            flagSameLayer = true;
            changeNum();
            dopHoriz2.horizontal = dopHoriz2.vertical = 0;
        } else if (Number(countBags) == countRecWithDop2 - dopVert2?.horizontal * dopVert2?.vertical && dopVert2?.horizontal * dopVert2?.vertical != 0) {
            console.log(4444);
            flagSameLayer = true;
            changeNum();
            dopVert2.horizontal = dopVert2.vertical = 0;
            //----------------------Изначальное положение----------------------------------------------------
        } else if (Number(countBags) == numHorizontal * numVertical) {
            console.log(55555);
            dopVert.horizontal = dopVert.vertical = dopHoriz.horizontal = dopHoriz.vertical = 0;
        } else if (Number(countBags) == countRecWithDop - dopHoriz?.horizontal * dopHoriz?.vertical) {
            console.log(66666);
            console.log(countRecWithDop, dopHoriz, dopVert, numHorizontal * numVertical);
            dopHoriz.horizontal = dopHoriz.vertical = 0;
        } else if (Number(countBags) == countRecWithDop - dopVert?.horizontal * dopVert?.vertical) {
            console.log(77777);
            dopVert.horizontal = dopVert.vertical = 0;
            //-----------Когда те условия не подходят надо удалять блоки без допов или наоборот только допы----------------------------
        } else if (numHorizontal * numVertical > countBags) {
            console.log(88888);
            flagReplaceBaseMatrix = numHorizontal * numVertical - countBags;
            dopVert.horizontal = dopVert.vertical = dopHoriz.horizontal = dopHoriz.vertical = 0;
        } else if (numH2 * numV2 > countBags) {
            console.log(99999);
            flagReplaceBaseMatrix = numH2 * numV2 - countBags;
            flagSameLayer = true;
            changeNum();
            dopVert2.horizontal = dopVert2.vertical = dopHoriz2.horizontal = dopHoriz2.vertical = 0;
        } else if ((countRecWithDop - countBags) > 0 && (countRecWithDop2 - countBags) > 0 && (countRecWithDop - countBags) > (countRecWithDop2 - countBags)) {
            console.log(101010);
            flagRemoveDops = countRecWithDop2 - countBags;
            flagSameLayer = true;
            changeNum();
        } else if ((countRecWithDop - countBags) > 0 && (countRecWithDop2 - countBags) > 0 && (countRecWithDop - countBags) <= (countRecWithDop2 - countBags)) {
            console.log('11 11 11');
            flagRemoveDops = countRecWithDop - countBags;
        }
        // } else if ((countRecWithDop - countBags) > 0 && (countRecWithDop2 - countBags) > 0 && (countRecWithDop - countBags) == (countRecWithDop2 - countBags)) {
        //     if (countRecWithDop - numHorizontal * numVertical >= countRecWithDop2 - numH2 * numV2) {
        //         flagRemoveDops = countRecWithDop2 - countBags;
        //         flagSameLayer = true;
        //         changeNum();
        //     }else{
        //         flagRemoveDops = countRecWithDop - countBags;
        //     }
        // }
    }

    function changeNum() {
        countRecWithDop = countRecWithDop2;
        numHorizontal = numH2;
        numVertical = numV2;
        lengthRect = lR2;
        widthRect = wR2;
        [dopHoriz, dopVert] = [dopHoriz2, dopVert2]
        changeWidthHeight();
        // matrixRectangles2 = createBaseMatrix(numH2, numV2, 1);
    }

    if (numHorizontal > 0 && numVertical > 0) {
        numRectangles = { horizontal: numHorizontal, vertical: numVertical, dopHoriz: dopHoriz, dopVert: dopVert };
    } else {
        return alert('Не подходящие параметры!')
    }
    //----------------------Сюда добавить ошибку в случае если пакетов задали больше возможного разместить----------------------------------------------------
    return numRectangles;

}
function createBaseMatrix(numRows, numCols, number) {
    return Array(numRows).fill().map(() => Array(numCols).fill(number));
}


function removeLastNOnesRowByRow(matrix, n) {
    // Создаём глубокую копию матрицы
    const newMatrix = matrix.map(row => [...row]);
    const numRows = newMatrix.length;
    const numCols = newMatrix[0].length;
    let remaining = n;

    // Идём по столбцам справа налево
    for (let col = numCols - 1; col >= 0 && remaining > 0; col--) {
        // Идём по строкам сверху вниз
        for (let row = numRows - 1; row >= 0 && remaining > 0; row--) {
            if (newMatrix[row][col] === 1) {
                newMatrix[row][col] = 0;
                remaining--;
            }
        }
    }

    return newMatrix;
}

function recomposeMatrix(matrix) {
    let matrixRow = matrix.length;
    let matrixCol = matrix[0].length;
    // let countCell = matrixCol * matrixRow;
    let multiplier = 0;
    // console.log(Math.max(matrixCol, matrixRow) < countBags ? Math.max(matrixCol, matrixRow) : countBags - 1)
    for (let i = (Math.max(matrixCol, matrixRow) < countBags ? Math.max(matrixCol, matrixRow) : countBags - 1); i > 0; i--) {
        if (countBags % i == 0) {
            multiplier = i;
            break;
        }
    }
    let multiplier2 = parseInt(countBags / multiplier);
    // console.log(countBags, multiplier, multiplier2, matrixRow, matrixCol)
    if (Math.max(matrixCol, matrixRow) >= Math.max(multiplier, multiplier2) && Math.min(matrixCol, matrixRow) >= Math.min(multiplier, multiplier2)) {
        if (Math.max(matrixCol, matrixRow) == matrixRow) {
            matrixRow = Math.max(multiplier, multiplier2);
            matrixCol = Math.min(multiplier, multiplier2);
        } else {
            matrixRow = Math.min(multiplier, multiplier2);
            matrixCol = Math.max(multiplier, multiplier2);
        }
        return createBaseMatrix(matrixRow, matrixCol, 1);
    }

    return matrix;
}

function removeDopRectangles(matrix, n) {
    // Собираем все позиции двоек в обратном порядке (снизу вверх, справа налево)
    const positions = [];
    // console.log('matrix', matrix)
    // Сначала проходим по всей матрице и собираем все позиции, где есть 2
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] == 2) {
                positions.push([i, j]);
            }
        }
    }

    // console.log('positions', positions)
    const count = Math.min(n, positions.length);
    // Меняем последние n (или меньше, если 2 меньше) элементов на 0
    for (let k = 0; k < count; k++) {
        const [i, j] = positions[positions.length - 1 - k]; // Берём с конца
        matrix[i][j] = 0;
    }

    return matrix;
}


function removeZeroColumns(matrix) {
    if (matrix.length === 0) return []; // Если матрица пустая, возвращаем пустую

    const rows = matrix.length;
    const cols = matrix[0].length;
    const columnsToRemove = new Set(); // Здесь будем хранить индексы столбцов для удаления

    // Проверяем каждый столбец
    for (let col = 0; col < cols; col++) {
        let isAllZeros = true;

        // Проверяем все элементы в столбце
        for (let row = 0; row < rows; row++) {
            if (matrix[row][col] !== 0) {
                isAllZeros = false;
                break; // Если найден ненулевой элемент, выходим из цикла
            }
        }

        if (isAllZeros) {
            columnsToRemove.add(col); // Запоминаем столбец для удаления
        }
    }

    // Если нечего удалять, возвращаем исходную матрицу
    if (columnsToRemove.size === 0) return matrix;

    // Создаём новую матрицу без удалённых столбцов
    const result = [];
    for (let row = 0; row < rows; row++) {
        const newRow = [];
        for (let col = 0; col < cols; col++) {
            if (!columnsToRemove.has(col)) {
                newRow.push(matrix[row][col]); // Добавляем только нужные столбцы
            }
        }
        result.push(newRow);
    }

    return result;
}
let layingSquareHoriz = false;
let layingSquareVert = false;
let countDopHorizHoriz = 0;

function oddLayer(palletWidth, palletHeight) { // сюда всатвка кол-во мешков
    // let matrixRectangles = [];
    centerX = Math.floor(palletWidth / 2);
    centerY = Math.floor(palletHeight / 2);
    let numRectangles = findNumberOfRectangles(palletWidth, palletHeight); // сюда всатвка кол-во мешков


    // if (countBags && countBags <= numRectangles){
    //     numRectangles = countBags;
    //    
    // }else if(countBags){
    //     alert(`Кол-во мешков больше возможного, максимум = ${numRectangles}`);
    //     countBag.value = numRectangles;
    // }
    // 
    // Сюда добавть кол-во мешков если есть.
    let matrixRectangles = createBaseMatrix(numRectangles.horizontal, numRectangles.vertical, 1);

    if (flagReplaceBaseMatrix) {
        matrixRectangles = removeLastNOnesRowByRow(matrixRectangles, flagReplaceBaseMatrix);
        matrixRectangles2 = removeLastNOnesRowByRow(matrixRectangles2, matrixRectangles2.length * matrixRectangles2[0].length - countBags);
        matrixRectangles = removeEmptyOrZeroMatrices(matrixRectangles);
        matrixRectangles2 = removeEmptyOrZeroMatrices(matrixRectangles2);
        matrixRectangles = recomposeMatrix(matrixRectangles);
        matrixRectangles = removeZeroColumns(matrixRectangles);
        const zeroCount = matrixRectangles.flat().filter(num => num === 0).length;
        const noZeroCount = matrixRectangles.flat().filter(num => num != 0).length;
        matrixRectangles2 = recomposeMatrix(matrixRectangles2);
        matrixRectangles2 = removeZeroColumns(matrixRectangles2);
        const zeroCount2 = matrixRectangles2.flat().filter(num => num === 0).length;
        const noZeroCount2 = matrixRectangles2.flat().filter(num => num != 0).length;
        // console.log('zeroCount ' + zeroCount, 'noZeroCount ' + noZeroCount, matrixRectangles, 'zeroCount2 ' + zeroCount2, 'noZeroCount2 ' + noZeroCount2, matrixRectangles2);
        if (zeroCount2 < zeroCount && noZeroCount2 == noZeroCount) {

            // console.log('matrixRectangles2', matrixRectangles2, matrixRectangles, zeroCount, zeroCount2);
            matrixRectangles = matrixRectangles2;
            changeWidthHeight();
        }
        flagReplaceBaseMatrix = 0;
    }
    // console.log(numRectangles.horizontal, numRectangles.vertical)

    let matrixLenght = matrixRectangles.length;
    //Сделать кладку основанную на кол-ве мешков из формы
    // Для дополнительных горизонтальных (если одинаковое кол-во столбцов обычных и дополнительных (+1)) распределение по столбцам
    if (numRectangles.dopHoriz.horizontal) {
        // console.log(numRectangles)
        //Кладка квадратом !НЕВЕРНО
        if (numRectangles.dopHoriz.vertical == 1 && numRectangles.horizontal == 1 && numRectangles.horizontal + numRectangles.vertical == 4) { //(numRectangles.dopHoriz.horizontal > 2 || numRectangles.vertical > 2) && (numRectangles.dopHoriz.horizontal * 4 > numRectangles.vertical - 4) && (countBags == numRectangles.dopHoriz.horizontal * 4 || !countBags)
            layingSquareHoriz = true;
            countDopHorizHoriz = numRectangles.dopHoriz.horizontal; // поменять название

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
        if (numRectangles.dopVert.horizontal == 1 && numRectangles.vertical == 1 && numRectangles.horizontal + numRectangles.vertical == 4) { // && (numRectangles.dopVert.vertical > 2 || numRectangles.horizontal > 2) && (numRectangles.dopVert.vertical * 4 > numRectangles.horizontal - 4) && (countBags == numRectangles.dopVert.vertical * 4 || !countBags)
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

    }
    if (flagRemoveDops) {
        // console.log('flagRemoveDops', flagRemoveDops)
        matrixRectangles = removeDopRectangles(matrixRectangles, flagRemoveDops);
        matrixRectangles = removeEmptyOrZeroMatrices(matrixRectangles);
    }
    // console.log("Матрица для отрисовки:", matrixRectangles);
    getCoord(matrixRectangles);

}