var express = require('express');
var router = express.Router();

/* POST user nonce. */
router.post('/', (req, res, next) => {
  const { publicAddress } = req.body;
  const nonce = Math.floor(Math.random() * 1000000000);

  if (!publicAddress) {
    res.status(418).send({ message: 'User address not found!' });
  }
  else {
    req.app.locals.data[publicAddress] = nonce;
  }

  res.send({
    nonce
  });
});

module.exports = router;
