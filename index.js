const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Bot';

// Run when Cliente connects

io.on('connection', socket => {
    // 
    socket.on('joinRoom', ({ username, room }) => {

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'welcome to chat!'));

        // Broadcast when user connects
        socket.broadcast.emit('message', formatMessage(botName, 'A user has joined the chat'));

    });

    // Listen for chat message
    socket.on('chatMessage', (msg) => {
        io.emit('message', formatMessage('USER', msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(botName, 'A user has left the chat'));
    });

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on ${PORT}`));