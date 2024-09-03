let selectedRectangle;
let dragOffsetY, dragOffsetX;

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

function checkTextF() {
    checkText.forEach(button => {
        button.addEventListener('click', evt => {
            drawLayer();
        });
    })
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
    // console.log(flagOutside);
    if (flagOutside) {
        scaleMax = Math.min((parseInt(canvas.width) / (palletWidthValue + rectWidth) * scale).toFixed(1), (parseInt(canvas.height) / (palletHeightValue + rectHeight) * scale).toFixed(1));
    } else {
        scaleMax = Math.min((parseInt(canvas.width) / (palletWidthValue) * scale).toFixed(1), (parseInt(canvas.height) / palletHeightValue * scale).toFixed(1));
    }


    scaleMax = (palletWidthValue * scaleMax < canvas.width && palletHeightValue * scaleMax < canvas.height) ? scaleMax : scaleMax - 0.1;
    if (scaleMax == 0) {
        alert('Error')
    }
    scale = scaleMax;
    spacingCenterX = float2int((parseInt(canvas.width) - palletWidthValue * scale) / 2);
    spacingCenterY = float2int((parseInt(canvas.height) - palletHeightValue * scale) / 2);
    ctx.setTransform(scale, 0, 0, scale, spacingCenterX, spacingCenterY);
}

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
    layerNum = (start == layerNum) ? start + n : start;
    displayNone();
    let content = checked.nextElementSibling.nextElementSibling;
    content.style.display = 'block';
    // saveQuestion.childNodes[1].childNodes[1].innerHTML = `Вы уверены, что хотите переключить слой? Изменения будут потеряны для ${unsaveLayers.length}: №${unsaveLayers.join(', ')} слоев.`;
    // if (unsaveLayers.length > 1) {
    //     saveQuestion.childNodes[1].childNodes[1].nextElementSibling.innerHTML = 'Сохранить все';
    // }
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

function returnDataRectangles() {
    
    const startIndex = rectanglesClone.findIndex(rect => rect.layer == layerNum);
    const endIndex = rectanglesClone.findLastIndex(rect => rect.layer == layerNum);
    
    for (let i = startIndex; i <= endIndex; i++) {
        rectangles[i] = JSON.parse(JSON.stringify(rectanglesClone[i]));
        
    }
    drawLayer();
    
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
            selectedRectangle = rect;
            dragOffsetX = mousePos.x - rect.x;
            dragOffsetY = mousePos.y - rect.y;
            if (!selectedRectangles.length) {
                selectedRectangles.push(rect);
            }
            if (!selectedRectangles.includes(selectedRectangle)) {
                selectedRectangles = [];
                selectedRectangles.push(rect);
            }

        }

    });

    if (!selectedRectangle) {

        handleMouseDown(evt)

    } else if (evt.button === 2) {
        evt.preventDefault();

        turnRectRight();
    }
    // console.log(selectedRectangles)
});



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
    if (flagOutside) {
        halfSize = 0;

    }
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