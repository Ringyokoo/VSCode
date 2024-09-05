const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

function drawLayer() {
    let startLayer = -1;
    let endLayer = -1;
    cleanCanvas();
    for (var i = 0; i < rectangles.length; i++) {
        rectangles[i].isLastlayer = false;
        if (rectanglesClone[i]) {
            rectanglesClone[i].isLastlayer = false;
        }
        // rectanglesClone[i].isLastlayer = false;

        if (rectangles[i].layer == layerNum && startLayer == -1) {
            startLayer = i;
        }
        if (rectangles[i].layer == layerNum + 1 && endLayer == -1) {
            endLayer = i;
        }
    }

    for (let i = startLayer; i < ((endLayer == -1) ? rectangles.length : endLayer); i++) {
        rectangles[i].isLastlayer = true;
        if (rectanglesClone[i]) {
            rectanglesClone[i].isLastlayer = true;
        }

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

function drawNumbers(rect) {
    ctx.font = `${15 / scale}px arial`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    if (rect.isLastlayer) {
        //     ctx.fillStyle = rect.color;
        // } else {
        ctx.fillStyle = 'black'
        // }

        let text = 'x: ' + (rect.x).toString() + '\n y: ' + (-rect.y).toString() + '\n';
        if (rect.text == arrText[0]) {
            text += ' Угол 0°';
        } else if (rect.text == arrText[1]) {
            text += ' Угол 90°'
        } else if (rect.text == arrText[2]) {
            text += ' Угол 180°'
        } else {
            text += ' Угол 270°'
        }

        text += '\n№ ' + (rectangles.filter(rectangle => rectangle.layer == layerNum).indexOf(rect) + 1);

        const lines = text.split('\n');

        lines.forEach((line, index) => {
            ctx.fillText(line, centerX + rect.x, centerY + rect.y + ((index - 1) * 16 / scale));
        });

    }
}
// checkText = document.querySelectorAll('.checkText');
// 
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

function cleanCanvas() {
    const palletWidth = parseInt(document.getElementById('palletWidth').value);
    const palletHeight = parseInt(document.getElementById('palletHeight').value);
    ctx.clearRect(-spacingCenterX / scale, -spacingCenterY / scale, Math.max(canvas.width, palletWidth) + spacingCenterX / scale * 2, Math.max(canvas.height, palletHeight) + spacingCenterY / scale * 2);
}