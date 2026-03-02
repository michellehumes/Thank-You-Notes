const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ jobs: [], message: 'Jobs route stub' });
});

module.exports = router;
