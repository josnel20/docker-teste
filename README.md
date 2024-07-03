# Gerenciador de Downloads em Chunks

Este projeto é um gerenciador de downloads em chunks que utiliza Node.js para baixar arquivos grandes de forma eficiente, dividindo-os em partes menores.

## Instalação

Para usar este projeto, siga os passos abaixo:

1. Clone o repositório:

    ```bash
    git clone https://github.com/josnel20/gerenciador-de-downloads.git
    cd gerenciador-de-downloads
    ```

2. Instale as dependências necessárias:

    ```bash
    npm install
    ```

## Como Usar

Para iniciar o download de arquivos em chunks, execute o seguinte comando:
```bash
node index.js
```

Será liberada a api na porta 3000 (http://localhost:3000), so passar os seguintes parámentos no body e header

header: api-key='s8d7s87d98s7d987sds' -> presente no env
body:
{
  "urls": ["https://code.jquery.com/jquery-3.7.1.js"],
  "nameModule":"js",
  "token":"s8d7s87d98s7d987sds"
}

## Funcionalidades

Tipo de Arquivo Aceito: Este gerenciador aceita arquivos nos formatos XLSX, PDF, js e TXT.
Download em Chunks: Divide o arquivo em partes menores para download mais rápido.
Log: Registra eventos e erros durante o processo de download utilizando o módulo whiteLog.


Autor
José Pison
GitHub: josnel20

