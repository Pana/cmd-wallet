const HDKey = require('hdkey');
const bitcoin = require('bitcoinjs-lib');
const testnet = bitcoin.networks.testnet;
const {txsByAddress, balanceByAddress} = require('./blockExplorer');
const GAP = 20;
const PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-find'));

function HDaddr(seed) {
    let db = new PouchDB(`dbs/${seed}`);
    let hdkey = HDKey.fromMasterSeed(new Buffer(seed, 'hex'));
    this.seed = seed;
    this.hdkey = hdkey;
    this.db = db;
}

// 搜索有交易tx 的地址
HDaddr.prototype.initialize = async function () {
    let id = 'hdInfo';
    let idInfo, notExist = false;
    try {
        idInfo = await this.db.get(id);
    } catch(e) {
        if(e.message === 'missing') {
            notExist = true;
        }
    }

    if (notExist) {
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
                await this.db.post(item);
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
        // create index
        await this.db.createIndex({
            index: {
                fields: ['hasTx']
            }
        });
        await this.db.put({
            _id: 'hdInfo',
            account   // 有 tx 的 account 索引
        });
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
    let {docs: address} = await this.db.find({
        selector: {hasTx: true},
    });
    for (let a of address) {
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