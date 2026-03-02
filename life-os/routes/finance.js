const express = require('express');
const router = express.Router();

router.get('/transactions', (req, res) => {
  res.json({ transactions: [], message: 'Finance route stub' });
});

module.exports = router;
