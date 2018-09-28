const express = require('express');
const app = express();
const http = require('http').Server(app);
const ttt = require('./games/tictactoe.js')
const io = require('socket.io')(http);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/dashboard', (req,res) => {
    res.render('dashboard');
});

app.get('/leaderboard', (req,res) => {
    res.render('leaderboard');
});

const userRouter = require('./routes/users');
app.use('/users', userRouter);

const gamesRouter = require('./routes/games');
app.use('/games', gamesRouter);

io.sockets.on('connection', socket => {
    socket.on('join-room', room => {
        socket.join(room);
        console.log(`user connected to room ${room}`);
        socket.on('move', move => {
            socket.broadcast.to(room).emit('move', move);
        });
    });
});


http.listen(3000);