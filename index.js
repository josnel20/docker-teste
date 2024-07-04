const express = require('express');
const env = require('dotenv').config();
const app = express();
const port = process.env.PORT_API || 3000;
const tokenEnv = process.env.TOKEN_API;
const downloadFiles = require('./downloadFiles');
const whiteLog = require('./whiteLog');
const comunicaApi = require('./comunicaApi');

app.use(express.json());

let msg = 'Área restrita Grupo Capital Consig';

app.get('/', async (req, res) => {
    console.log(msg);
    await whiteLog(`[API Method: GET] - ${msg}`);
    res.status(404).json({ message: msg, status: res.statusCode });
});

app.post('/', async (req, res) => {

    await whiteLog(`[API Method: POST] - ${msg}`);

    const { urls, nameModulo, urlsDestino, tokenDesti, token } = req.body;

    if (token !== tokenEnv) {
        const aviso = `Token inválido - ${token}`;
        console.log(aviso);
        await whiteLog(`[API Method: POST] - Token inválido [${aviso}, 'status' => ${res.statusCode}]`);
        res.status(500).json({ message: aviso, status: res.statusCode });
    }
    
    try {
        await whiteLog(`[API Method: POST] - urls recebidas: ['nameModulo' => : ${nameModulo}, 'urls' => ${urls}]`);    
        const arquivos = await downloadFiles(urls, nameModulo);
        
        try {
            await comunicaApi(urlsDestino, tokenDesti, arquivos);
        } catch (error) {
            const erro = `'erro' => ${error}`;
            console.error(erro);
            await whiteLog(`[API Method: POST] - erro ao enviar resposta na api de destino [${erro}]`); 
            res.status(404).json({ erro: error, status: res.statusCode }); 
            return;
        }

        const statusCode = `'status' => ${res.statusCode}`;
        console.log(statusCode);
        await whiteLog(`[API Method: POST] - tratativa finalizada [${statusCode}]`);  
        res.status(200).json({ message: 'tratativa finalizada',  status: res.statusCode });

    } catch (error) {
        const erro = `'Error', ${error}`;
        console.error(erro);
        await whiteLog(`[API Method: POST] - tratativa finalizada ['status' => ${res.statusCode}, ${erro}]`); 
        res.status(500).json({erro, status: res.statusCode });
        return;
    }
});

app.listen(port, () => {
    const mensage = `[API GERENCIADORA DE ARQUIVOS] - o sistema está rodando ['porta' ${port}]`;
    whiteLog(mensage);
});
