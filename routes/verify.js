var express = require('express');
var router = express.Router();
var ethUtil = require('ethereumjs-util');

/* POST user signature. */
router.post('/', (req, res, next) => {
  const { publicAddress, signature } = req.body;
  const msg = req.app.locals.data[publicAddress];

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

  if(address.toLowerCase() === publicAddress.toLowerCase()) {
    res.send({
      approve: `Nonce ${msg} was signed with the address ${publicAddress}`
    });
  }
  else {
    res.status(421).send({ message: `Nonce ${msg} was not signed by ${publicAddress}` });
  }

});

module.exports = router;
