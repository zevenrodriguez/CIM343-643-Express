var express = require('express');
var router = express.Router();

// router.get('/', function (req, res) {
//   res.send('root parameter');
// });

router.get('/parameters/:user', function (req, res) {
  res.send('user ');
  console.log(req.params.user);
});

module.exports = router;
