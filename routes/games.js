const express = require('express');
const router = express();

router.get('/new', (req,res) => {
    res.render('games/new');
});

router.get('/:id', (req,res) => {
    const id = req.params.id;
    res.render('games/show', { id });
});

module.exports = router;