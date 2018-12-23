var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('', (req, res) => {
  res.send(JSON.stringify([
    {
      code: '1',
      area: '川崎',
      category: '人口',
      word: '人口',
      value: '30,000',
      unit: '人'
    },
    {
      code: '2',
      area: '川崎',
      category: '人口',
      word: '人口',
      value: '30,000',
      unit: '人'
    }
  ]));
});
router.post('/', (req, res) => {
  res.send(JSON.stringify({
    message: 'success.'
  }));
});

module.exports = router;
