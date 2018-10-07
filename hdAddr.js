const HDKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet;
const {txsByAddress, balanceByAddress} = require('./blockExplorer');
const GAP = 20;

function HDaddr(seed) {
    // let seed = 'ebe8c27fc19e73a070ac9565d10e728f800c828a40d31dc3babfab12686b14c1b54d5a82051b1d393570e9e08ad470281ba674eaf36dc990bb7dfae1c6c8d8f4'
    let hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    this.seed = seed;
    this.hdkey = hdkey;
    this.txAddress = [];
    this.emptyAddress = [];
}

// 搜索有交易tx 的地址
HDaddr.prototype.initialize = async function () {
    for(let account = 0; account < Infinity; account ++) {
        let noTxCount = 0, empty = false;
        for(let index = 0; index < Infinity; index ++) {
            let path = `m/44'/1'/${account}'/0/${index}`;
            let childKey = this.hdkey.derive(path);
            let address = getAddress(childKey.publicKey);
            let txData = await txsByAddress(address);
            if(txData.pagesTotal > 0) {
                this.txAddress.push({
                    path,
                    address
                });
                // console.log('has txs');
            } else {
                noTxCount++;
                this.emptyAddress.push({
                    path,
                    address
                });
                // console.log('no txs');
            }
            if(noTxCount >= GAP) {
                // console.log(index);
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
}

// 获取余额
HDaddr.prototype.getBalance = async function () {
    let balance = 0;
    for (let a of this.txAddress) {
        let b = await balanceByAddress(a.address);
        balance += b;
    }
    return balance;
}

// 获取可用地址
HDaddr.prototype.getAddress = async function (account = 0) {
    if(this.emptyAddress.length === 0) {
        // TODO 生成20个地址
    }
    let item = this.emptyAddress.unshift();
    return item;
}

function getAddress (pubkey) {
    const { address } = bitcoin.payments.p2pkh({ pubkey: pubkey, network: testnet });
    return address;
}

;(async () => {
    try {
        let seed = 'ebe8c27fc19e73a070ac9565d10e728f800c828a40d31dc3babfab12686b14c1b54d5a82051b1d393570e9e08ad470281ba674eaf36dc990bb7dfae1c6c8d8f4';
        let hdAddr = new HDaddr(seed);
        await hdAddr.initialize();
        let b = await hdAddr.getBalance();
        console.log("balance: ", b);
    } catch(e) {
        console.error(e);
    }
})();