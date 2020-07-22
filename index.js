const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, getRoomUsers, userLeave } = require('./utils/users');

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

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'welcome to chat!'));

        // Broadcast when user connects
        socket.broadcast
            .to(user.room)
            .emit('message',
                formatMessage(botName, `${user.username} has joined the chat`));

        // Send users and rooms info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        // Listen for chat message
        socket.on('chatMessage', (msg) => {
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message', formatMessage(`${user.username}`, msg));
        });
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io
                .to(user.room)
                .emit('message',
                    formatMessage(botName, `${user.username} has left the chat`));

            // Send users and rooms info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }

    });

});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server is running on ${PORT}`));