const express = require('express');
const app = express();
const http = require('http').Server(app);
const Ttt = require('./games/tictactoe.js');
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
        let playerX, playerO;
        if(!playerX){
            playerX = socket.id;
            console.log(playerX)
        } else if(!playerO){
            playerO = socket.id;
        }
        const game = new Ttt(playerX, playerO);
        socket.join(room);
        // console.log(`user connected to room ${room}, id: ${socket.id}`);
        socket.on('move', moveInfo => {
            const move = moveInfo.squareId;
            const id = moveInfo.playerId;
            const playerMove = game.addMove(move, id);
            if(playerMove){
                io.sockets.to(room).emit('valid-move', {move, playerMove});
                const victory = game.victoryCheck();
                if(victory){
                    io.sockets.to(room).emit('victory', victory);
                }
            } else {
                io.sockets.to(room).emit('invalid-move', {move, playerMove});
            }
        });
    });
});


http.listen(3000);