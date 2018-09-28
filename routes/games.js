const express = require('express');
const router = express();
const bodyParser = require('body-parser')

router.use(bodyParser.json());

router.get('/new', (req,res) => {
    res.render('games/new');
});

router.post('/moves', (req,res) => {
    res.send(req.body);
});

router.get('/moves', (req,res) => {
    res.json();
});

router.get('/:id', (req,res) => {
    const id = req.params.id;
    res.render('games/show', { id });
});


module.exports = router;