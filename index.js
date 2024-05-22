
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));

});


server.on('connection', (socket) => {
    console.log('Funcionou!!');
    
 
});
server.on('disconect',(socket)=>{
    console.log('Disconect');
})

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});
