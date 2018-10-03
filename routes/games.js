const express = require('express');
const bodyParser = require('body-parser');
const router = express();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/new', (req,res) => {
    res.render('games/new');
});

router.post('/', (req,res) => {
    const roomId = Math.random().toString(36).slice(-9);
    const { game } = req.body;
    res.redirect(`/games/${roomId}`);
});

router.get('/:id', (req,res) => {
    const id = req.params.id;
    res.render('games/show', { id });
});

module.exports = router;    