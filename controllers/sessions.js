const User = require('../models/user');

module.exports = {
    new(req, res) {
        res.render('sessions/new');
    },
    async create(req, res, next) {
        const { username, password } = req.body;
        try {
            const user = await User.findByUsername(username);
            if (user && user.authenticate(password)) {
                req.session.userId = user.id;
                res.redirect('/dashboard');
            } else {
                res.render('session/new');
            }
        } catch (err) {
            next(err);
        }
    },
    destroy(req, res) {
        req.session.userId = undefined;
        res.redirect('/');
    },
};