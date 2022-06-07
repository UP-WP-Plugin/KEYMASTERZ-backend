var express = require('express');
var router = express.Router();
var Web3 = require('web3');
var LSP0ERC725Account = require('@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json');

/* POST user nonce. */
router.post('/', (req, res, next) => {
  const { publicAddress } = req.body;
  const nonce = Math.floor(Math.random() * 1000000000);

  if (!publicAddress) {
    res.status(418).send({ message: 'User address not found!' });
  }
  else {
    req.app.locals.data[publicAddress] = {
      nonce,
      UPContract: new Web3.eth.Contract(LSP0ERC725Account.abi, publicAddress)
    };
  }

  res.send({
    nonce
  });
});

module.exports = router;
