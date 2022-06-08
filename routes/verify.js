var express = require('express');
var router = express.Router();
var ethUtil = require('ethereumjs-util');
var Web3 = require('web3');
var web3 = new Web3('https://rpc.l14.lukso.network');
var LSP0ERC725Account = require('@lukso/lsp-smart-contracts/artifacts/LSP0ERC725Account.json');

const getControllers = async (UPAddress) => {
  const UPContract = new web3.eth.Contract(LSP0ERC725Account.abi, UPAddress);
  const keyBase = "0xdf30dba06db6a30e65354d9a64c60986";
  const key = ["0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3"];
  const [res] = await UPContract.methods["getData(bytes32[])"](key).call();
  const controllerAddresses = [];
  for (var i = 0; i < web3.utils.hexToNumber(res); i++) {
    var keyIndex = web3.utils.numberToHex(i).substring(2);
    while (keyIndex.length < 32) {
      keyIndex = '0' + keyIndex;
    }
    const fullKey = keyBase + keyIndex;
    const [res] = await UPContract.methods["getData(bytes32[])"]([fullKey]).call();
    controllerAddresses.push(res);
    console.log(res);
  }
  return(controllerAddresses);
}

const checkControllers = (UPControllers, signerAddress) => {
  for (var i = 0; i < UPControllers.length; i++) {
    if (UPControllers[i].toLowerCase() === signerAddress.toLowerCase()) {
      return true;
    }
  }
  return false;
}

/* POST user signature. */
router.post('/', async (req, res, next) => {
  const { publicAddress, signature } = req.body;
  const msg = Web3.utils.utf8ToHex(`${req.app.locals.data[publicAddress]}`);
  
  const UPControllers = await getControllers(publicAddress);

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

  if (checkControllers(UPControllers, address)) {
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
    res.status(421).send({ 
      message: `Nonce ${Web3.utils.hexToUtf8(msg)} was not signed by a ${publicAddress} controller.`
    });
  }

});

module.exports = router;
