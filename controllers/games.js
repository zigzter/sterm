const Game = require('../models/game');

module.exports = {
    new(req, res) {
        res.render('games/new');
    },
    async create(req, res, next) {
        try {
            const room_id = [...Array(11)].map(() =>(~~(Math.random()*36)).toString(36)).join('');
            const game_type = req.body.gameType;
            const player1 = req.session.userId;
            const game = new Game({ room_id, player1, game_type });
            await game.save();
            res.redirect(`/games/${ room_id }`);
        } catch (err) {
            next(err);
        }
    },
    async index(req, res) {
        const publicGames = await Game.findPublicGames();
        res.json(publicGames);
    },
    async show(req, res, next) {
        try {
            const roomId = req.params.id;
            const { game_type } = await Game.fetch(roomId);
            res.render('games/show', { roomId, game_type });
        } catch (err) {
            next(err);
        }
    },
    async update(req) {
        await Game.setPublic(req.params.id);
    },
};
