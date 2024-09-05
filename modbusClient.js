const ModbusRTU = require('modbus-serial');
const modbusClient = new ModbusRTU();
// const host = '127.0.0.1';
// const port = 502;
let arrText = ['↑', '→', '↓', '←'];

let i = 0;

// async function connect() {
//     try {
//         await modbusClient.connectTCP(host, { port: port });
//         console.log('Подключено к Modbus-серверу');
//     } catch (err) {
//         console.error('Ошибка подключения:', err.message);
//         i++;
//     }
// }

async function writeData(Palett) {
    const host = Palett.host || '127.0.0.1'; // Используем переданный хост или значение по умолчанию
    const port = Palett.port || 502; // Используем переданный порт или значение по умолчанию

    try {
        await modbusClient.connectTCP(host, { port: port });
        console.log('Подключено к Modbus-серверу на', host, port);
        // Дальнейшая логика отправки данных
    } catch (err) {
        console.error('Ошибка подключения:', err.message);
    }

    if (modbusClient.isOpen) {
        let whp = new Array(100).fill(0);
        whp[0] = Palett.SaveToBlock;
        whp[1] = Palett.WidthPalet;
        whp[2] = Palett.HeightPalet;
        whp[3] = Palett.nLayers * Palett.HeightLayer;
        whp[4] = Palett.nPakOnlayer;
        whp[5] = Palett.nLayers;
        whp[6] = 0;
        whp[7] = Palett.HeightPaket;
        whp[8] = Palett.WidthPaket;
        whp[9] = Palett.HeightLayer;

        try {
            
            // Запись регистров
            await modbusClient.writeRegisters(0, whp);

            for (let j = 1; j <= Palett.nLayers; j++) {
                let wh = new Array(100).fill(0);
                let i = 0;

                Palett.palett.forEach(rect => {
                    if (rect.layer == j) {
                        let angle = (rect.text == arrText[0]) ? 0 :
                            (rect.text == arrText[1]) ? 90 :
                                (rect.text == arrText[2]) ? 180 : 270;
                        wh[i++] = Math.abs(rect.x);
                        wh[i++] = Math.abs(rect.y);
                        wh[i++] = rect.layer;
                        wh[i++] = angle;
                    }

                    if (i === 100) return;
                });

                // Запись регистров для каждого слоя
                await modbusClient.writeRegisters(j * 100, wh);
                // console.log(`Данные для слоя ${j + 1} успешно отправлены`, j * 100, wh);
            }

            if (Palett.NameBlock) {
                let ca = Palett.NameBlock.split('').map(c => c.charCodeAt(0));
                let whn = new Array(64).fill(0);
                ca.forEach((char, i) => {
                    whn[i] = char;
                });

                await modbusClient.writeRegisters(4200, whn);
            }

            console.log('Данные отправлены');
        } catch (err) {
            console.error('Ошибка при отправке данных:', err.message);
        } finally {
            modbusClient.close(() => console.log('Соединение закрыто'));
        }
    } else {
        console.log('Подключение к Modbus-серверу не установлено');
    }
}





module.exports = { writeData };
