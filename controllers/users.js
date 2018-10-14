const User = require('../models/user');

module.exports = {
    new(req, res) {
        res.render('users/new');
    },
    vars(req, res) {
        const { id, username } = req.currentUser;
        res.json({ userId: id, username });
    },
    async create(req, res, next) {
        const { username, email, password, passwordConfirmation } = req.body;
        if (password === passwordConfirmation) {
            try {
                const user = new User({ username, email, password });
                await user.save();
                req.session.userId = user.id
                res.redirect('/dashboard');
            } catch (err) {
                next(err);
            }
        } else {
            res.render('users/new');
        }
    },
};
