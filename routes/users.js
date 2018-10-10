const express = require('express');
const bcrypt = require('bcrypt');
const knex = require('../db/client');

const router = express();

router.get('/signin', (req, res) => {
    res.render('users/signin');
});

router.get('/new', (req, res) => {
    res.render('users/new');
});

router.get('/vars', (req, res) => {
    const { id, username } = req.currentUser;
    res.json({ userId: id, username });
});

router.post('/', (req,res) => {
    const { username, email, password, passwordConfirmation } = req.body;
    if (password === passwordConfirmation) {
        bcrypt.genSalt(10, async (err, salt) => {
            bcrypt.hash(password, salt, async (err, password_digest) => {
                const [id] = await knex('users').insert({
                    username,
                    email,
                    password_digest,
                }).returning('id');
                req.session.userId = id;
                res.redirect('/dashboard');
            });
        });
    } else {
        res.render('users/new');
    }
});

module.exports = router;
