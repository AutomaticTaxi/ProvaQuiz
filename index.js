const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);

let perguntas = [];
let pontos_jogador = {};


fs.readFile(join(__dirname, 'perguntas.json'), 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    perguntas = JSON.parse(data);
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Um usuário conectou-se');
    pontos_jogador[socket.id] = 0;

    const enviarPergunta = () => {
        const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
        socket.emit('pergunta', pergunta);
    };

    enviarPergunta();

    socket.on('resposta', (data) => {
        const { pergunta, resposta } = data;
        const perguntacorreta = perguntas.find(q => q.pergunta === pergunta);
        if (perguntacorreta && perguntacorreta.resposta === resposta) {
            pontos_jogador[socket.id] += 1;
            socket.emit('result', { correct: true });
        } else {
            socket.emit('result', { correct: false });
        }

        socket.emit('pontos_jogador', { pontos_jogador: pontos_jogador[socket.id] });


        enviarPergunta();
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectou-se');
        delete pontos_jogador[socket.id];
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
