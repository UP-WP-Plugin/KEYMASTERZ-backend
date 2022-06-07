var express = require('express');
var router = express.Router();
var debug = require('debug')('app');
var ethUtil = require('ethereumjs-util');
var Web3 = require('web3');
var LSP0ERC725Account = require('@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json');

/* POST user signature. */
router.post('/', async (req, res, next) => {
  const { publicAddress, signature } = req.body;
  const msg = Web3.utils.utf8ToHex(`${req.app.locals.data[publicAddress]}`);
  
  /*const UPContract = new Web3.eth.Contract(LSP0ERC725Account.abi, publicAddress);
  const UPOwner = await UPContract.methods.owner().call();*/
  const UPOwner = await Web3.eth.Contract(LSP0ERC725Account.abi, publicAddress)
  .then(async res => res.methods.owner().call());

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

  if (address.toLowerCase() === UPOwner.toLowerCase()) {
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
    res.status(421).send({ message: `Nonce ${Web3.utils.hexToUtf8(msg)} was not signed by ${publicAddress} or ${UPOwner}` });
  }

});

module.exports = router;
