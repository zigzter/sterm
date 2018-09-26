const express = require('express');
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

app.get('/games/new', (req,res) => {
    res.render('games/new');
});

app.get('/games/show', (req,res) => {
    res.render('games/show');
});

app.get('/users/signin', (req,res) => {
    res.render('signin');
});

app.get('/users/signup', (req,res) => {
    res.render('signup');
});

app.listen(3000);