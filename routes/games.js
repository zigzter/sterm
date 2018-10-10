const express = require('express');
const bodyParser = require('body-parser');
const knex = require('../db/client')

const router = express();

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/new', (req, res) => {
    res.render('games/new');
});

router.get('/temp', (req, res) => {
    res.render('games/temp');
});

router.post('/', (req, res) => {
    const roomId = Math.random().toString(36).slice(-9);
    const { game } = req.body;
    try {
        knex('games').insert({
            room_id: roomId,
            player1: req.session.userId,
            game_type: game,
        }).then(() => {
            res.redirect(`/games/${ roomId }`);
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/', (req, res) => {
    knex('games').where({ is_public: true }).whereNull('winner_id').then((publicGames) => {
        res.json(publicGames);
    });
});

router.get('/:id', (req, res) => {
    const roomId = req.params.id;
    res.render('games/show', { roomId });
});

router.post('/:id', (req, res) => {
    knex('games').where({ room_id: req.params.id }).update({ is_public: true }).then();
});

module.exports = router;    