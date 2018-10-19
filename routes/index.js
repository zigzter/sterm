const express = require('express');

const router = express.Router();

const homeController = require('../controllers/home');
const gamesController = require('../controllers/games');
const usersController = require('../controllers/users');
const sessionController = require('../controllers/sessions');

function auth(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/');
    }
}

router.get('/', homeController.index);
router.get('/dashboard', homeController.dashboard);

router.get('/games/new', auth, gamesController.new);
router.post('/games', auth, gamesController.create);
router.get('/games', auth, gamesController.index);
router.get('/games/:id', auth, gamesController.show);
router.patch('/games/:id', auth, gamesController.update);

router.get('/users/new', usersController.new);
router.post('/users', usersController.create);
router.get('/users/vars', usersController.vars);

router.get('/sessions/new', sessionController.new);
router.post('/sessions', sessionController.create);
router.delete('/sessions', sessionController.destroy);

module.exports = router;
