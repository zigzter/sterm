const express = require('express');
const ttt = require('./games/tictactoe');
const app = express();

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

app.listen(3000);