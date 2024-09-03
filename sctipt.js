"use strict";
const form = document.getElementById('canvasForm');

let level = 1;
let layerNum = 0;

canvas.width = document.documentElement.clientWidth / 3 * 2 - 50;
canvas.height = document.documentElement.clientHeight - 20;

function gettingDataForm() {
    inent = Number(document.getElementById('inentM').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
    rectHeight = parseInt(document.getElementById('rectHeight').value);
    rectWidth = parseInt(document.getElementById('rectWidth').value);
}


let scale = 1;
let scaleMax = 1;
let rectanglesClone = [];
let flagOutside = false;
let countBags = 0;
form.addEventListener('submit', function (event) {
    event.preventDefault();
    flagOutside = document.querySelector('#permission').checked;
    countBags = document.querySelector("#countBag").value;
    // console.log(countBags)
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



function createReturnOriginal() {
    const returnOriginal = document.createElement('button');
    returnOriginal.type = 'button';
    returnOriginal.classList.add('returnOriginal');
    returnOriginal.onclick = returnDataRectangles;
    returnOriginal.title = 'Вернуть исходный вид';
    returnOriginal.innerHTML = 'В исходный вид';
    return returnOriginal;
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
    // const plusButton = createPlus();
    const returnOriginal = createReturnOriginal();
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

    // div.appendChild(plusButton);
    div.appendChild(returnOriginal);
    div.appendChild(rotateButton);
    div.appendChild(containerLayerLabel);
    div.appendChild(p);
    div.appendChild(containerLabel);
    return div;
}


const tab = document.querySelector('.tab');

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
                // saveQuestion.style.display = 'flex'; //Cюда сохраняшку
                // saveConfirm.focus()
                // updateDataRectangles();
                switchLayer();
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


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


//Отключение контекстного меню
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});


// Инициализация при загрузке
form.dispatchEvent(new Event('submit'));