const fs = require('fs');
const path = require('path');

async function logNavegacao(texto = "") {
    try {
        const dataAtual = new Date();
        const timestamp = dataAtual.toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const date = dataAtual.toISOString().split('T')[0];
        const logDir = path.join(__dirname, 'storage', 'logs');

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logFile = path.join(logDir, `log_${date}.txt`);
        const data = `[${timestamp}] ${texto}`;

        fs.appendFile(logFile, data + '\n', (erro) => {
            if (erro) {
                console.error('[ARQUIVO DE LOG] - Erro ao escrever no arquivo:', erro);
            }
        });

        console.log(data);
    } catch (error) {
        console.error('[ARQUIVO DE LOG] - Erro ao registrar navegação', error);
    }
}

module.exports = logNavegacao;