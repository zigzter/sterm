const express = require('express');
const router = express();

router.get('/new', (req,res) => {
    res.render('games/new');
});

router.get('/:id', (req,res) => {
    res.render('games/show');
});

module.exports = router;