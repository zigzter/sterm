const User = require('../models/user');
const Game = require('../models/game');

module.exports = {
    index(req, res) {
        res.render('index');
    },
    async dashboard(req, res) {
        const publicGames = await Game.findPublicGames();
        const users = await User.getUsers();
        res.render('dashboard', { publicGames, users });
    },
};
