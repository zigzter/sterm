const Game = require('../models/game');

module.exports = {
    new(req, res) {
        res.render('games/new');
    },
    async create(req, res, next) {
        const room_id = [...Array(11)].map(() =>(~~(Math.random()*36)).toString(36)).join('');
        const game_type = req.body.gameType;
        const player1 = req.session.userId;
        const game = new Game({ room_id, player1, game_type });
        try {
            game.save();
            res.redirect(`/games/${ room_id }`);
        } catch (err) {
            next(err);
        }
    },
    async index(req, res) {
        const publicGames = await Game.findPublicGames();
        res.json(publicGames);
    },
    show(req, res) {
        const roomId = req.params.id;
        res.render('games/show', { roomId });
    },
    async update(req) {
        await Game.setPublic(req.params.id);
    },
};
