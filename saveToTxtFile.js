let saveDialogVisible = false;

document.getElementById('saveToTXTButton').addEventListener('click', function (event) {
    event.stopPropagation();
    if (!saveDialogVisible) {
        showSaveDialog();
        saveDialogVisible = true;
    }
});

function showSaveDialog() {
    const forSaveTxt = document.querySelector(".forSaveTxt");
    forSaveTxt.style.display = 'block';

    // Генерация текста для сохранения
    const textToSave = generateTextToSave();

    // Отображение содержимого файла в элементе <pre>
    document.getElementById('fileContentPreview').textContent = textToSave;

    // Добавление обработчика для кнопки "Сохранить"
    const saveButton = document.getElementById('saveButtonTxt');
    saveButton.onclick = function () {
        saveToFile(textToSave);
    };

    // Добавление обработчика для кнопки "Отмена"
    const cancelButton = document.getElementById('cancelButtonTxt');
    cancelButton.onclick = hideSaveDialog;

    // Добавляем обработчик клика по документу для закрытия окна при клике вне его
    document.addEventListener('click', handleClickOutside);
}

function generateTextToSave() {
    let textToSave =
        `Ширина паллета: ${palletWidth.value}
Длина паллета: ${palletHeight.value}
Ширина мешка: ${rectWidth}
Длина мешка: ${rectHeight}
Минимальный промежуток: ${inentM.value}
Кол-во мешков на слой: ${countBag.value}
Количество слоев: ${minLayer.value}
Разрешить выход за границу паллета: ${permission.checked}`;

    rectangles.forEach((rect, index) => {
        let angle = (rect.text == arrText[0]) ? '0°' :
            (rect.text == arrText[1]) ? '90°' :
                (rect.text == arrText[2]) ? '180°' : '270°';
        textToSave += `
Прямоугольник ${index + 1}:
  Координата X: ${rect.x}
  Координата Y: ${-rect.y}
  Угол: ${angle}
  Слой: ${rect.layer}`;
    });

    return textToSave;
}

function hideSaveDialog() {
    document.querySelector(".forSaveTxt").style.display = 'none';
    document.removeEventListener('click', handleClickOutside);
    saveDialogVisible = false; // Сброс состояния флага

    // Убираем обработчики кликов с кнопок "Сохранить" и "Отмена"
    document.getElementById('saveButtonTxt').onclick = null;
    document.getElementById('cancelButtonTxt').onclick = null;
}

function handleClickOutside(event) {
    const forSaveTxt = document.querySelector(".forSaveTxt");
    const saveToTXTButton = document.getElementById('saveToTXTButton');

    if (!forSaveTxt.contains(event.target) && event.target !== saveToTXTButton) {
        hideSaveDialog();
    }
}

function saveToFile(textToSave) {
    // Получаем название файла от пользователя
    const fileName = document.getElementById('fileNameInput').value.trim() || 'bags_per_pallet.txt';

    // Создаем объект Blob, содержащий текстовые данные
    const blob = new Blob([textToSave], { type: 'text/plain' });

    // Создаем URL для этого объекта Blob
    const url = URL.createObjectURL(blob);

    // Создаем временный элемент <a>, чтобы инициировать загрузку файла
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;  // Имя файла, который будет сохранен
    document.body.appendChild(a);
    a.click();

    // Удаляем временный элемент <a> и освобождаем память, связанную с URL-объектом
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    hideSaveDialog();
}
