const rateLimit = require('express-rate-limit');
const User = require('../models/user');

const limiter = rateLimit({
    windowMs: 20 * 60 * 1000,
    max: 5,
});

module.exports = {
    new(req, res) {
        res.render('sessions/new');
    },
    create: [
        // limiter,
        async (req, res, next) => {
            const { username, password } = req.body;
            try {
                const user = await User.findByUsername(username);
                if (user && await user.authenticate(password)) {
                    req.session.userId = user.id;
                    req.flash('success', `Welcome back, ${ user.username }`);
                    res.redirect('/dashboard');
                } else {
                    req.flash('warning', 'Invalid credentials');
                    res.redirect('/sessions/new');
                }
            } catch (err) {
                next(err);
            }
        },
    ],
    destroy(req, res) {
        req.flash('success', 'Logged out!');
        req.session.userId = undefined;
        res.redirect('/');
    },
};
