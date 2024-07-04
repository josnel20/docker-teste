const express = require('express');
const env = require('dotenv').config();
const app = express();
const whiteLog = require('./whiteLog');

async function enviarDados(urlsDestino, tokenDesti, arquivos) {

    await whiteLog(`[COMUNICA API] - Enviando resposra dos caminhos para apiDestino ${urlsDestino}`);   

    try {
        const response = await fetch(urlsDestino.replace(/,+$/, ''), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': tokenDesti.replace(/,+$/, '')
            },
            body: JSON.stringify(arquivos)
        });

        if (!response.ok) {
            await whiteLog(`[COMUNICA API] - ['erro' => ${response.statusText}, 'status' => ${response.status}]`); 
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        let result;
        try {
            result = await response.json();
        } catch (error) {
            await whiteLog(`[COMUNICA API] - A resposta da api de destino não é um json ['resposta' =>  ${await response.text()}, 'erro' => ${error}]`); 
        }

        await whiteLog(`[COMUNICA API] - sucesso`);   

    } catch (error) {
        await whiteLog(`[COMUNICA API] - Erro ao chamar API de destino: ['urlDestino' => ${urlsDestino.replace(/,+$/, '')}, 'erro' => ${error}]`);
    }

}

module.exports = enviarDados;
