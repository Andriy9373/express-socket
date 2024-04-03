const express = require('express');
const http = require('http');
const path = require('path');
const socket = require('socket.io');
const app = express();

const server = http.Server(app);
const io = socket(server);

const users = [];

io.on('connection', (socket) => {
    socket.on('login', (data) => {
        const found = users.find(user => user === data);

        if (!found) {
            users.push(data);
            socket.nickname = data;
            io.sockets.emit('login', { status: 'OK' });
            io.sockets.emit('users', { users });
        }
        else {
            io.sockets.emit('login', { status: 'FAILED' }); 
        }
    });

    socket.on('message', (data) => {
        io.sockets.emit('new message', {
            message: data,
            user: socket.nickname,
            time: new Date(),
        });
    });

    socket.on('disconnect', (data) => {
        for (let i = 0; i < users.length; i++) {
            if (users[i] === socket.nickname) {
                users.splice(i, 1);
                break;
            }
        }
        io.sockets.emit('users', { users });
    })
})

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

server.listen(5000, () => {
    console.log('app is running');
})