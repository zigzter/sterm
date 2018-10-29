const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const helmet = require('helmet');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const cookieSession = require('cookie-session');
const formHelpers = require('./helpers/form');

const Game = require('./models/game');
const User = require('./models/user');
const Ttt = require('./games/tictactoe');
const C4 = require('./games/connect4');

// APP CONFIG =======================================================

app.set('view engine', 'ejs');

app.enable('trust proxy'); // Enable for Heroku

app.use(helmet());
app.use(helmet.xssFilter());
app.use(express.static('public'));
app.locals.errors = [];
Object.assign(app.locals, formHelpers);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride((req) => {
    if (typeof req.body === 'object' && req.body._method) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

// STORING SESSIONS =================================================

const sessionMiddleware = cookieSession({
    name: 'session',
    keys: ['super secret', 'things and stuff'],
    maxAge: 24 * 60 * 60 * 1000,
});

app.use(sessionMiddleware);

// FLASHES ==========================================================

app.use(flash());

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    next();
});

// SET CURRENT USER =================================================

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

// ROUTES ===========================================================

const indexRouter = require('./routes');

app.use('/', indexRouter);

// SOCKETS ==========================================================

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
    let game;
    const users = [];
    socket.on('join-room', (data) => {
        const { roomId } = data;
        socket.join(roomId);
        Object.values(io.of('/').connected).map((user) => {
            users.push(user.currentUser.username);
        });
        io.sockets.to(roomId).emit('new-user', { users });
    });
    socket.on('game-init', async (data) => {
        const { roomId, userId } = data;
        const gameData = await Game.fetch(roomId);
        if (gameData.game_type === 'tictactoe') {
            game = new Ttt(gameData);
        } else if (gameData.game_type === 'connect4') {
            game = new C4(gameData);
        }
        await game.fetchMoves();
        if (game.player1 !== userId && !game.player2) {
            game.player2 = userId;
            await game.setPlayer2(userId);
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
                    await Game.setWinner(roomId, userId);
                    await Game.update(roomId, 'complete');
                    await User.addWin(userId);
                } else {
                    await Game.update(roomId, 'draw');
                }
            }
        }
    });
    socket.on('new-message', (msgData) => {
        const { msg, username, roomId } = msgData;
        io.sockets.to(roomId).emit('new-message', { msg, username });
    });
    socket.on('private-message', (msgData) => {
        const { recip, pmMessage, author } = msgData;
        const [targetSocket] = Object.values(io.of('/').connected).filter((user) => {
            return user.currentUser.username === recip;
        });
        if (!targetSocket) {
            socket.emit('no-user');
        } else if (targetSocket && pmMessage) {
            const socketId = targetSocket.conn.id;
            io.sockets.to(`${ socketId }`).emit('private-message', { pmMessage, author });
        }
    });
    socket.on('disconnect', () => {
        const { username } = socket.currentUser;
        io.sockets.to('global').emit('user-left', { discUser: username });
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Listening on port ${ PORT }`);
});
