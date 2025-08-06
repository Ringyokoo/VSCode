document.getElementById('saveMbsBtn').addEventListener('click', () => {
    const palletData = {
        SaveToBlock: 1, // если нужно
        WidthPalet: parseInt(document.getElementById('palletWidth').value),
        HeightPalet: parseInt(document.getElementById('palletHeight').value),
        nPakOnlayer: parseInt(document.getElementById('countBag').value),
        nLayers: parseInt(document.getElementById('minLayer').value),
        HeightPaket: parseInt(document.getElementById('rectHeight').value),
        WidthPaket: parseInt(document.getElementById('rectWidth').value),
        HeightLayer: 1000, // или другое значение
        palett: rectangles // массив прямоугольников
    };
    saveMBS(palletData);
});
function saveMBS(palletData) {
    const base = 600046;
    const rectBase = 600244;
    const bufferSize = rectBase + palletData.nLayers * 100 * 8;
    const buffer = new ArrayBuffer(bufferSize);
    const view = new DataView(buffer);

    // 1. Запись параметров
    view.setUint16(base, palletData.WidthPalet, true);
    view.setUint16(base + 2, palletData.HeightPalet, true);
    view.setUint16(base + 4, palletData.nLayers * palletData.HeightLayer, true); // heightTotal
    view.setUint16(base + 6, palletData.nPakOnlayer, true);
    view.setUint16(base + 8, palletData.nLayers, true);
    view.setUint16(base + 12, palletData.HeightPaket, true);
    view.setUint16(base + 14, palletData.WidthPaket, true);

    // 2. Запись прямоугольников
    let rectsByLayer = Array.from({ length: palletData.nLayers }, () => []);
    for (const rect of palletData.palett) {
        rectsByLayer[rect.layer - 1].push(rect);
    }

    for (let layer = 0; layer < palletData.nLayers; layer++) {
        const offset = rectBase + layer * 100 * 8;
        const rects = rectsByLayer[layer];
        for (let i = 0; i < rects.length && i < 100; i++) {
            const rect = rects[i];
            const baseOffset = offset + i * 8;
            view.setInt16(baseOffset, rect.x, true);
            view.setInt16(baseOffset + 2, -rect.y, true);
            view.setInt16(baseOffset + 4, rect.layer, true);
            const angle = (rect.text === '↑') ? 0 : (rect.text === '→') ? 90 : (rect.text === '↓') ? 180 : 270;
            view.setInt16(baseOffset + 6, angle, true);
        }
    }

    // 3. Сохранение
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pallet.mbs';
    link.click();
}
