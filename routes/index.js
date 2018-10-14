const express = require('express');

const router = express.Router();

const gamesController = require('../controllers/games');
const usersController = require('../controllers/users');
const sessionController = require('../controllers/sessions');

router.get('/games/new', gamesController.new);
router.post('/games', gamesController.create);
router.get('/games', gamesController.index);
router.get('/games/:id', gamesController.show);
router.patch('/games/:id', gamesController.update);

router.get('/users/new', usersController.new);
router.post('/users', usersController.create);
router.get('/users/vars', usersController.vars);

router.get('/sessions/new', sessionController.new);
router.post('/sessions', sessionController.create);
router.delete('/sessions', sessionController.destroy);

module.exports = router;
