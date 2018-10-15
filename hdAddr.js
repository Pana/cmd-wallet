const HDKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet;
const {
    txsByAddress, 
    balanceByAddress, 
    utxoByMulAddress,
    broadTx
} = require('./blockExplorer');
const GAP = 20;
const Satoshi = 100000000;
const wif = require('wif');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');


function HDaddr(seed) {
    let adapter = new FileSync(`${seed}.json`);
    let db = low(adapter);
    db.defaults({ 
        address: [], 
        initialized: false, 
        account: 0,
        balance: 0
    }).write();
    let hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    this.seed = seed;
    this.hdkey = hdkey;
    this.db = db;
}

// 搜索有交易tx 的地址
HDaddr.prototype.initialize = async function () {
    let initialized = this.db.get('initialized').value();

    if (!initialized) {
        let addresses = this.db.get('address')
        // 从头开始搜索, 查找有tx的地址
        let account;
        for(account = 0; account < Infinity; account ++) {
            let noTxCount = 0, empty = false;
            for(let index = 0; index < Infinity; index ++) {
                let path = `m/44'/1'/${account}'/0/${index}`;
                let childKey = this.hdkey.derive(path);
                let address = getAddress(childKey.publicKey);
                let txData = await txsByAddress(address);
                let item = {
                    path,
                    account,
                    index,
                    address,
                };
                if(txData.pagesTotal > 0) {
                    item.hasTx = true;
                } else {
                    noTxCount++;
                    item.hasTx = false;
                }
                addresses.push(item).write();
                if(noTxCount >= GAP) {
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
        this.db.set('initialized', true).write();
        this.db.set('account', account).write();
    } else {
        console.log('TODO: UPDATE');
        // TODO update data, 查找所有没有tx 的地址,检查是否有tx
    }
}

/*
    获取余额, 返回单位为聪
    TODO: 获取余额时需扫描找零地址
*/ 
HDaddr.prototype.getBalance = async function () {
    let balance = 0;
    let address = this.db.get('address').filter({hasTx: true}).value();
    for (let a of address) {
        let b = await balanceByAddress(a.address);
        balance += b;
    }
    this.db.set('balance', balance).write();
    return balance;
}

/**
 * address - 发送地址
 * amount - 发送数额,单位聪
*/ 
HDaddr.prototype.transfer = async function (address, amount) {
    let balance = this.db.get('balance').value();
    amount *= Satoshi;
    if(balance < amount) {
        console.log('余额不足');
        return;
    }
    let addresses = this.db.get('address').filter({hasTx: true}).value();
    let utxos = await utxoByMulAddress(addresses.map(i => i.address));
    let fee = 0.0001 * Satoshi;
    // 查找需要使用的utxo 
    let toUseUtxo = [], total = 0;
    for (let utxo of utxos) {
        let targetAddress = addresses.find(i => i.address === utxo.address);
        let privateKey = this.hdkey.derive(targetAddress.path).privateKey;
        let keyPair = bitcoin.ECPair.fromPrivateKey(privateKey, {network: testnet, compressed: true});
        toUseUtxo.push({
            txid: utxo.txid,
            vout: utxo.vout,
            satoshis: utxo.satoshis,
            address: utxo.address,
            keyPair
        });
        total += utxo.satoshis;
        if(total > amount + fee) break;
    }
    const txb = new bitcoin.TransactionBuilder(testnet);
    txb.setVersion(1);
    for(let i in toUseUtxo) {
        let ut = toUseUtxo[i];
        txb.addInput(ut.txid, ut.vout);
    }
    txb.addOutput(address, amount);
    // 找零逻辑
    if(total > amount + fee) {
        txb.addOutput('mjwRqAeJu7jZL5HeJjjLA3GZ3dNPbcBiWG', total - amount - fee);
    }
    for(let i in toUseUtxo) {
        let ut = toUseUtxo[i];
        txb.sign(~~i, ut.keyPair);
    }
    let hex = txb.build().toHex();
    console.log(hex);
    let result = await broadTx(hex);
    console.log(result);
}

// 获取可用地址
HDaddr.prototype.getAddress = async function (account = 0) {
    let [item] = this.db.get('address').filter({hasTx: false}).take(1).value();
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
        // await hdAddr.initialize();
        // await hdAddr.transfer('mz26TUAuqYMcqEi3Hp5PMcYYCibSpGAEFu', 0.001);
        let b = await hdAddr.getBalance()
        console.log("balance: ", b);
    } catch(e) {
        console.error(e);
    }
})();

/**
 * 1. 何时需要刷新 address 是否有 tx 信息
 */