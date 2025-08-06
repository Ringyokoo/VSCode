const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const modbusClient = require('./modbusClient.js');
const { exec } = require('child_process');

const app = express();
const port = 3000;
const hostname = 'localhost';

// 1) Определяем базовую папку для статичных файлов:
//    - при разработке: process.cwd() (где вы запускаете `node server.js` из папки проекта)
//    - в собранном exe: path.dirname(process.execPath)
const baseDir = process.pkg
  ? path.dirname(process.execPath)
  : process.cwd();

// 2) JSON-парсер
app.use(bodyParser.json());

// 3) Статика
app.use(express.static(path.join(baseDir, 'public')));

// 4) Фолл-бек на index.html (если надо)
app.get('/', (req, res) => {
  res.sendFile(path.join(baseDir, 'public', 'index.html'));
});

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
        res.json({ success: true, message: 'Данные успешно отправлены в Modbus' });

    } catch (err) {
        console.error('Ошибка при отправке данных:', err.message);
        res.status(500).json({ success: false, message: 'Ошибка при отправке данных в Modbus' });

    }
});

// 6) Запуск
app.listen(port, hostname, () => {
  const url = `http://${hostname}:${port}/`;
  console.log(`Server running at ${url}`);
  if (process.platform === 'win32') exec(`start ${url}`);
  else if (process.platform === 'darwin') exec(`open ${url}`);
  else exec(`xdg-open ${url}`);
}).on('error', err => {
  console.error('Ошибка запуска сервера:', err.message);
  require('readline').createInterface({
    input: process.stdin, output: process.stdout
  }).question('Нажмите Enter для выхода...', () => process.exit(1));
});