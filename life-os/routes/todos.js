const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ todos: [], message: 'Todos route stub' });
});

module.exports = router;
