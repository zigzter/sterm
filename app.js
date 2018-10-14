const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')({ session });
const methodOverride = require('method-override');
const knex = require('./db/client');
const Game = require('./models/game');
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

app.use(
    methodOverride((req, res) => {
        if (typeof req.body === 'object' && req.body._method) {
            const method = req.body._method;
            delete req.body._method;
            return method;
        }
    }),
);

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

app.get('/dashboard', authenticate, async (req, res) => {
    const publicGames = await Game.findPublicGames();
    res.render('dashboard', { publicGames });
});

app.get('/leaderboard', async (req, res) => {
    const users = await knex('users').orderBy('wins', 'desc');
    res.render('leaderboard', { users });
});

const indexRouter = require('./routes');

app.use('/', indexRouter);

io.on('connection', (socket) => {
    let game;
    socket.on('join-room', (data) => {
        const { roomId } = data;
        socket.join(roomId);
    });
    socket.on('game-init', async (data) => {
        const { roomId, userId } = data;
        const gameData = await Game.fetchGame(roomId);
        game = new Ttt(gameData);
        await game.fetchMoves();
        await game.init();
        if (game.player1 !== userId && !game.player2) {
            game.player2 = userId;
            game.setPlayer2(userId);
        }
        const { player1, player2 } = game;
        if (player2) {
            io.sockets.to(roomId).emit('game-started', { player1, player2 });
        } else {
            io.sockets.to(roomId).emit('waiting');
        }
    });
    socket.on('move', async (moveData) => {
        const { squareId, username, userId, roomId } = moveData;
        const { player1, player2 } = game;
        const validMove = await game.addMove(squareId, userId);
        if (validMove) {
            io.sockets.to(roomId).emit('valid-move', { squareId, moveUser: userId, player1, player2 });
            const winningUser = game.victoryCheck();
            if (winningUser) {
                const { player, moves } = winningUser;
                io.sockets.to(roomId).emit('victory', { player, moves });
                knex('games').where({ room_id: roomId }).update({ winner_id: userId }).then();
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
