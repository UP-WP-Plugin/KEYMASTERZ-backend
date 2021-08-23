var express = require('express');
var router = express.Router();
var ethUtil = require('ethereumjs-util');
var Web3 = require('web3');
const app = express();
app.use(express.static('public'));

/* POST user signature. */
router.post('/', (req, res, next) => {
  const { publicAddress, signature } = req.body;
  const msg = Web3.utils.utf8ToHex(`${req.app.locals.data[publicAddress]}`);

  if (!publicAddress) {
    res.status(419).send({ message: 'Address not found!' });
  }
  if (!signature) {
    res.status(420).send({ message: 'Signature not found!' });
  }

  const msgBuffer = ethUtil.toBuffer(msg);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
  const signatureBuffer = ethUtil.toBuffer(signature);
  const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
  const publicKey = ethUtil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s
  );
  const addressBuffer = ethUtil.publicToAddress(publicKey);
  const address = ethUtil.bufferToHex(addressBuffer);

  if (address.toLowerCase() === publicAddress.toLowerCase()) {
    if (address.toLowerCase() === '0x6a0e62776530d9f9b73463f20e34d0f9fe5feed1') {
      res.send({
        verified: true,
        admin: true
      })
    }
    else {
      res.send({
        verified: true,
        admin: false
      });
    }
  }
  else {
    res.status(421).send({ message: `Nonce ${Web3.utils.hexToUtf8(msg)} was not signed by ${publicAddress}` });
  }

});

module.exports = router;
