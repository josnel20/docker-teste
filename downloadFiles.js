const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const whiteLog = require('./whiteLog');
const async = require('async');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { defaultProvider } = require('@aws-sdk/credential-provider-node');
const { Client } = require('@elastic/elasticsearch');

const s3Client = new S3Client({ region: 'us-east-1' });

async function typeAccept(link) {
    const types = ['xlsx', 'pdf', 'txt', 'js'];
    const parsedUrl = new URL(link);
    const extension = parsedUrl.pathname.split('.').pop();
    return types.includes(extension);
}

async function chmodPath(nameModule, link) {
    const dataAtual = new Date();
    const date = dataAtual.toISOString().split('T')[0];
    const parsedUrl = new URL(link);
    const extension = parsedUrl.pathname.split('.').pop();

    const baseDir = path.join(__dirname, 'storage', nameModule);
    const outputDir = nameModule !== 'orbital' 
        ? path.join(baseDir, extension, date)
        : path.join(baseDir, date);

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    return outputDir;
}

async function downloadChunk(url, start, end, outputFilePath) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios({
                url: url,
                method: 'GET',
                responseType: 'stream',
                headers: {
                    'Range': `bytes=${start}-${end}`,
                    'Connection': 'keep-alive'
                }
            });
    
            const writer = fs.createWriteStream(outputFilePath, { flags: 'a' });
    
            response.data.pipe(writer);
    
            writer.on('finish', () => {
                console.log(`Parte do arquivo baixada: ${outputFilePath}`);
                resolve();
            });
    
            writer.on('error', (err) => {
                console.error(`Erro ao escrever parte do arquivo: ${outputFilePath}`, err);
                reject(err);
            });
    
        } catch (error) {
            await whiteLog(`API: - Erro ao baixar parte: ${url}, Motivo: ${error}`);
            reject(error);
        }
    });
}

async function downloadFileInChunks(url, caminho, chunkSize = 10 * 1024 * 1024) {
    try {
        const parsedUrl = new URL(url);
        const fileName = parsedUrl.pathname.split('/').pop();
        const nameFile = fileName.split('.').slice(0, -1).join('.');
        
        const headResponse = await axios.head(url);
        const totalSize = parseInt(headResponse.headers['content-length'], 10);

        let chunkNumber = 1;
        let start = 0;
        let filePaths = [];

        while (start < totalSize) {
            const end = Math.min(start + chunkSize - 1, totalSize - 1);
            const outputFilePath = path.join(caminho, `${nameFile}_${chunkNumber}.txt`);
            
            if (fs.existsSync(outputFilePath)) {
                await whiteLog(`Já existe ${outputFilePath}, pulando para o próximo...`);
                start = end + 1;
                continue;
            }
            
            await downloadChunk(url, start, end, outputFilePath);
            await whiteLog(`Download ok ${outputFilePath}`);
            filePaths.push(outputFilePath);
            
            start = end + 1;
            chunkNumber++;
        }
        
        return filePaths;

    } catch (error) {
        await whiteLog(`Erro ao baixar o arquivo: ${url}, Motivo: ${error}`);
        console.error(`Erro ao baixar o arquivo: ${url}, Motivo:`, error);
        throw error;
    }
}

async function downloadFiles(urls, nameModule, concurrency = 5) {
    const results = new Set(); 

    const downloadQueue = async.queue(async (url, callback) => {
        if (nameModule !== 'orbital' && !await typeAccept(url)) {
            await whiteLog(`API: - Tipo de arquivo: não aceito, em desenvolvimento`);
            return callback();
        }
        
        const caminho = await chmodPath(nameModule, url);
        await whiteLog(`API: - Iniciando Download do arquivo ${url}, do modulo ${nameModule}`);

        try {
            const filePaths = await downloadFileInChunks(url, caminho);

            filePaths.forEach(filePath => {
                if (!results.has(filePath)) {
                    results.add(filePath);
                }
            });

        } catch (errorDownload) {
            await whiteLog(`API: - Erro ao baixar o arquivo ${url}, do modulo ${nameModule}, motivo: ${errorDownload}`);
        }

        await whiteLog(`API: - Processamenteo bem sucedido`);

        callback();
    }, concurrency);

    urls.forEach(url => {
        downloadQueue.push(url);
    });

    await downloadQueue.drain();
    console.log('Execução Concluida.');

    const uniqueResults = Array.from(results).filter(filePath => fs.existsSync(filePath));
    return uniqueResults;
}

module.exports = downloadFiles;
