const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server);

let perguntas = [];
let jogadores = {};


fs.readFile(join(__dirname, 'perguntas.json'), 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    perguntas = JSON.parse(data);
});


const CarregarPontosdojogador = () => {
    fs.readFile(join(__dirname, 'jogadores.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            jogadores = {};
            return;
        }
        jogadores = JSON.parse(data);
    });
};

const savePlayerScores = () => {
    fs.writeFile(join(__dirname, 'jogadores.json'), JSON.stringify(jogadores, null, 2), 'utf8', (err) => {
        if (err) {
            console.error('Erro ao salvar os dados dos jogadores:', err);
        }
    });
};

CarregarPontosdojogador();

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('Um usuário conectou-se');
    
    socket.on('login', (data) => {
        const { username } = data;
        if (!jogadores[socket.id]) {
            jogadores[socket.id] = { username: username, pontos: 0 };
        } else {
            jogadores[socket.id].username = username;
        }
        enviarPergunta(socket);
        atualizarPlacar();
        savePlayerScores();
    });

    const enviarPergunta = (socket) => {
        const pergunta = perguntas[Math.floor(Math.random() * perguntas.length)];
        socket.emit('pergunta', pergunta);
    };

    socket.on('resposta', (data) => {
        const { pergunta, resposta } = data;
        const perguntacorreta = perguntas.find(q => q.pergunta === pergunta);
        if (perguntacorreta && perguntacorreta.resposta === resposta) {
            jogadores[socket.id].pontos += 1;
            socket.emit('result', { correct: true });
        } else {
            socket.emit('result', { correct: false });
        }

        socket.emit('pontos_jogador', { pontos_jogador: jogadores[socket.id].pontos });
        enviarPergunta(socket);
        atualizarPlacar();
        savePlayerScores();
    });

    socket.on('disconnect', () => {
        console.log('Um usuário desconectou-se');
        delete jogadores[socket.id];
        atualizarPlacar();
        savePlayerScores();
    });

    const atualizarPlacar = () => {
        const Placar = Object.values(jogadores).sort((a, b) => b.pontos - a.pontos);
        io.emit('Placar', Placar);
    };
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
