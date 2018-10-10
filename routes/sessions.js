const express = require('express');
const bcrypt = require('bcrypt');
const knex = require('../db/client');

const router = express();

router.get('/new', (req, res) => {
    res.render('sessions/new');
});

router.post('/', async (req, res) => {
    const { username, password } = req.body;
    const user = await knex('users').where({ username }).first();
    bcrypt.compare(password, user.password_digest, (err, resp) => {
        if (resp) {
            req.session.userId = user.id;
            res.redirect('/dashboard');
        } else {
            res.render('sessions/new');
        }
    });
});

router.get('/logout', (req, res) => {
    req.session.userId = null;
    res.redirect('/');
});

module.exports = router;
