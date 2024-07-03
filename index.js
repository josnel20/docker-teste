const express = require('express');
const env = require('dotenv').config();
const app = express();
const port = process.env.PORT_API || 3000;
const tokenEnv = process.env.TOKEN_API;
const downloadFiles = require('./downloadFiles');
const whiteLog = require('./whiteLog');

app.use(express.json());

app.get('/', async (req, res) => {
    const msg = 'Área restrita Grupo Capital Consig';
    await whiteLog(`Method: GET - ${msg}`);
    res.status(404).json({ message: msg, status: res.statusCode });
});

app.post('/', async (req, res) => {
    const { urls, nameModule, token } = req.body;

    if (token !== tokenEnv) {
        const error = `Token inválido: ${token}`;
        await whiteLog(`API: - ${error}`);
        res.status(500).json({ message: error, status: res.statusCode });
        return;
    }
    
    try {
        await whiteLog(`Method: POST - urls: [${urls}], Modulo: ${nameModule}`);    
       const arquivos = await downloadFiles(urls, nameModule);
        res.status(200).json({ message: 'Tratativa finalizada com sucesso', arquivos, status: res.statusCode });
    } catch (error) {
        console.error('Erro:', error);
        res.status(500).json({ message: error, status: res.statusCode });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
