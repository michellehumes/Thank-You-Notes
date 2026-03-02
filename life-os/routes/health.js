const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ health: {}, message: 'Health route stub' });
});

module.exports = router;
