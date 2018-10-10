const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')({ session });
const knex = require('./db/client');
const Ttt = require('./games/tictactoe.js');

app.set('view engine', 'ejs');

function authenticate(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}

app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: true }));

// STORING SESSIONS

const pgPool = new pg.Pool({
    user: 'ziggy',
    password: 'yeezy',
    database: 'sterm',
});

app.use(session({
    store: new pgSession({
        pool: pgPool,
    }),
    secret: 'bongo cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 680000000 },
}));

// SET CURRENT USER

app.use(async (req, res, next) => {
    const { userId } = req.session;
    res.locals.currentUser = null;
    if (userId) {
        try {
            const user = await knex('users').where({ id: userId }).first();
            req.currentUser = user;
            res.locals.currentUser = user;
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

// ROUTES

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', authenticate, (req, res) => {
    knex('games').where({ is_public: true }).whereNull('winner_id').then((publicGames) => {
        res.render('dashboard', { publicGames });
    });
});

app.get('/leaderboard', (req, res) => {
    res.render('leaderboard');
});

const gamesRouter = require('./routes/games');
const sessionRouter = require('./routes/sessions');
const userRouter = require('./routes/users');

app.use('/users', userRouter);
app.use('/sessions', sessionRouter);
app.use('/games', authenticate, gamesRouter);

const games = {};

io.on('connection', (socket) => {
    let room;
    let game;
    let gameId;
    socket.on('join-room', (data) => {
        room = data.roomId;
        const { userId, username } = data;
        socket.join(room);
        socket.broadcast.emit('new-user', { userId, username });
    });
    socket.on('start-game', (newGame) => {
        const { playerX, playerO } = newGame;
        game = new Ttt(playerX, playerO);
        games[room] = game;
        io.sockets.to(room).emit('game-started', { playerX, playerO });
        knex('games').where({ room_id: room }).then((gameEntry) => {
            gameId = gameEntry[0].id;
            // [{id: gameId}] = gameEntry;
        });
    });
    socket.on('move', (moveInfo) => {
        game = games[room];
        const { squareId, username, userId } = moveInfo;
        const playerMove = game.addMove(squareId, username);
        const { currentPlayer } = game;
        if (playerMove) {
            knex('moves').insert({
                game_id: gameId,
                user_id: userId,
                move: squareId,
            }).then();
            io.sockets.to(room).emit('valid-move', { squareId, playerMove, currentPlayer });
            const winningUser = game.victoryCheck();
            if (winningUser) {
                const { player, moves } = winningUser;
                io.sockets.to(room).emit('victory', { player, moves });
                knex('games').where({ room_id: room }).update({ winner_id: userId }).then();
                knex('users').where({ id: userId }).increment('wins', 1).then();
            }
        }
    });
    socket.on('new-message', (msgData) => {
        const { msg, username, roomId } = msgData;
        io.sockets.to(roomId).emit('new-message', { msg, username });
    });
});

http.listen(3000, '0.0.0.0');
