const { body, validationResult } = require('express-validator/check');
const knex = require('../db/client');
const User = require('../models/user');

const validateUser = [
    body('username').not().isEmpty()
        .withMessage('Username must be present')
        .custom(async (username) => {
            if (await knex('users').where({ username }).first()) {
                throw new Error('Username is taken');
            }
        }),
    body('email').not().isEmpty().withMessage('Email must be present')
        .custom(async (email) => {
            if (await knex('users').where({ email }).first()) {
                throw new Error('Email is already in use')
            }
        }),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('passwordConfirmation').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must match');
        } else {
            return true;
        }
    }),
];

module.exports = {
    new(req, res) {
        res.render('users/new', { user: {} });
    },
    vars(req, res) {
        const { id, username } = req.currentUser;
        res.json({ userId: id, username });
    },
    create: [
        validateUser,
        async (req, res, next) => {
            const { username, email, password } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.render('users/new', {
                    user: { username, email },
                    errors: errors.array(),
                });
            }
            try {
                const user = new User({ username, email, password });
                await user.save();
                req.session.userId = user.id;
                res.redirect('/dashboard');
            } catch (err) {
                next(err);
            }
        },
    ],
};
