const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const modbusClient = require('./modbusClient.js');


const app = express();
const port = 3000;
const hostname = 'localhost';

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

app.post('/send-modbus', async (req, res) => {
    const data = req.body;

    // Преобразование данных из запроса
    const Palett = {
        SaveToBlock: Number(data.numSaveToBock),
        WidthPalet: Number(data.palletWidth),
        HeightPalet: Number(data.palletHeight),
        nLayers: Number(data.minLayer),
        nPakOnlayer: Number(data.countBag),
        HeightLayer: 1000,  // Фиксированное значение
        HeightPaket: Number(data.rectHeight),
        WidthPaket: Number(data.rectWidth),
        NameBlock: data.NameBlock,
        palett: JSON.parse(data.rectangles),  // Используем массив объектов
        host: data.host,   // Получаем хост
        port: Number(data.port)
    };

    try {
        await modbusClient.writeData(Palett);
        res.send('Data sent');
    } catch (err) {
        console.error('Ошибка при отправке данных:', err.message);
        res.status(500).send('Error sending data');
    }
});

app.listen(port, hostname, async () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    // Динамический импорт библиотеки open
    const open = await import('open');
    // Открыть браузер автоматически
    open.default(`http://${hostname}:${port}`);
});
