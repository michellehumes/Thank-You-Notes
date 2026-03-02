const express = require('express');
const router = express.Router();

router.get('/status', (req, res) => {
  res.json({ services: [], message: 'Sync route stub' });
});

module.exports = router;
