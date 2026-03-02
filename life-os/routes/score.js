const express = require('express');
const router = express.Router();

router.get('/latest', (req, res) => {
  res.json({ score: null, message: 'Score route stub' });
});

module.exports = router;
