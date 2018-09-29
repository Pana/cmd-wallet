const HDKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet;
const {txsByAddress} = require('./blockExplorer');
const GAP = 20;

/*
    address 发现只搜索外部地址, 搜索路径有两层, 一层是 address index, 另外一层是 account
*/ 

;(async function () {
    var seed = 'ebe8c27fc19e73a070ac9565d10e728f800c828a40d31dc3babfab12686b14c1b54d5a82051b1d393570e9e08ad470281ba674eaf36dc990bb7dfae1c6c8d8f4'
    var hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    
    for(let account = 0; account < Infinity; account ++) {
        let noTxCount = 0, empty = false;
        for(let index = 0; index < Infinity; index ++) {
            let path = `m/44'/1'/${account}'/0/${index}`;
            let childKey = hdkey.derive(path);
            let address = getAddress(childKey.publicKey);
            let txData = await txsByAddress(address);
            console.log(path, address);
            if(txData.pagesTotal > 0) {
                console.log('has txs');
            } else {
                noTxCount++;
                // console.log('no txs');
            }
            if(noTxCount >= GAP) {
                console.log(index);
                if(index === GAP - 1) {
                    empty = true;
                }
                break;
            }
        }
        if(empty) {
            break;
        }
    }
    // console.log(hdkey.privateExtendedKey)
    // console.log(hdkey.publicExtendedKey)
    // console.log(hdkey.privateKey);
    // console.log(hdkey.publicKey);
    // console.log(getAddress(hdkey.publicKey));
})();


function getAddress (pubkey) {
    const { address } = bitcoin.payments.p2pkh({ pubkey: pubkey, network: testnet });
    return address;
}

async function discovery (masterKey) {

}