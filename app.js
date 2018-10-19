const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const pg = require('pg');
const session = require('express-session');
const pgSession = require('connect-pg-simple')({ session });
const methodOverride = require('method-override');

const Game = require('./models/game');
const User = require('./models/user');
const Ttt = require('./games/tictactoe');
const C4 = require('./games/connect4');

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

const sessionMiddleware = session({
    store: new pgSession({
        pool: pgPool,
    }),
    secret: 'bongo cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 680000000 },
});

app.use(sessionMiddleware);

// SET CURRENT USER

app.use(async (req, res, next) => {
    const { userId } = req.session;
    res.locals.currentUser = null;
    if (userId) {
        try {
            const user = await User.find(userId);
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
    const users = await User.getUsers();
    res.render('dashboard', { publicGames, users });
});

const indexRouter = require('./routes');

app.use('/', indexRouter);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

io.use(async (socket, next) => {
    const { userId } = socket.request.session;
    if (userId) {
        socket.currentUser = await User.find(userId);
    }
    next();
});

io.on('connection', (socket) => {
    console.log(`${ socket.currentUser.username } connected`);
    let game;
    socket.on('join-room', (data) => {
        const { roomId } = data;
        socket.join(roomId);
    });
    socket.on('game-init', async (data) => {
        const { roomId, userId } = data;
        const gameData = await Game.fetchGame(roomId);
        if (gameData.game_type === 'tictactoe') {
            game = new Ttt(gameData);
        } else if (gameData.game_type === 'connect4') {
            game = new C4(gameData);
        }
        await game.fetchMoves();
        if (game.player1 !== userId && !game.player2) {
            game.player2 = userId;
            game.setPlayer2(userId);
        }
        const { player1, player2 } = game;
        if (player2 && player2 === userId) {
            const p1username = await User.getUsername(player1);
            const p2username = await User.getUsername(player2);
            io.sockets.to(roomId).emit('game-started', {
                player1, player2, p1username, p2username,
            });
        } else if (!player2) {
            io.sockets.to(roomId).emit('waiting');
        }
    });
    socket.on('move', async (moveData) => {
        const { squareId, userId, roomId } = moveData;
        const { player1, player2 } = game;
        const validMove = await game.addMove(squareId, userId);
        if (validMove) {
            io.sockets.to(roomId).emit('valid-move', {
                squareId, moveUser: userId, player1, player2, validMove,
            });
            const winningUser = await game.victoryCheck();
            if (winningUser) {
                const { player, moves } = winningUser;
                io.sockets.to(roomId).emit('game-over', { player, moves });
                if (player !== 'draw') {
                    Game.setWinner(roomId, userId);
                    User.addWin(userId);
                } else {
                    Game.setWinner(roomId, 12);
                }
            }
        }
    });
    socket.on('new-message', (msgData) => {
        const { msg, username, roomId } = msgData;
        io.sockets.to(roomId).emit('new-message', { msg, username });
    });
});

http.listen(3000);
