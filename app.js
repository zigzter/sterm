const express = require('express');
const app = express();
const http = require('http').Server(app);
const Ttt = require('./games/tictactoe.js');
const io = require('socket.io')(http);
const knex = require('./db/client');

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req,res) => {
    res.render('index');
});

app.get('/dashboard', (req,res) => {
    knex('games').where({ is_public: true }).then(publicGames => {
        res.render('dashboard', { publicGames });
    });
});

app.get('/leaderboard', (req,res) => {
    res.render('leaderboard');
});

const userRouter = require('./routes/users');
app.use('/users', userRouter);

const gamesRouter = require('./routes/games');
app.use('/games', gamesRouter);

const games = {};

io.on('connection', socket => {
    let room, game;
    socket.on('join-room', roomId => {
        room = roomId;
        socket.join(room);
        socket.broadcast.emit('new-user', socket.id);
    });
    socket.on('start-game', newGame => {
        const { playerX, playerO } = newGame;
        game = new Ttt(playerX, playerO);
        games[room] = game;
        io.sockets.to(room).emit('game-started', { playerX, playerO });
    });
    socket.on('move', moveInfo => {
        game = games[room];
        const { squareId, playerId } = moveInfo;
        const playerMove = game.addMove(squareId, playerId);
        if(playerMove){
            io.sockets.to(room).emit('valid-move', {squareId, playerMove});
            const winningUser = game.victoryCheck();
            if(winningUser){
                io.sockets.to(room).emit('victory', winningUser);
            }
        } else {
            io.sockets.to(room).emit('invalid-move', {squareId, playerMove});
        }
    });
    socket.on('new-message', msgData => {
        const { msg, playerId } = msgData;
        io.sockets.to(room).emit('new-message', { msg, playerId });
    });
});

http.listen(3000);