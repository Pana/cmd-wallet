const axios = require('axios');

const MAINNET = 'https://blockexplorer.com';
const TESTNET = "https://testnet.blockexplorer.com";

const axiosInstance = axios.create({
    baseURL: TESTNET,
});


async function txsByAddress (address, page = 1) {
    let result = await axiosInstance(`/api/txs/?address=${address}&page=${page}`);
    if(result.status !== 200) {
        console.log(result);
    }
    return result.data;
}

// 返回单位为聪
async function balanceByAddress (address) {
    let result = await axiosInstance(`/api/addr/${address}/balance`);
    return result.data;
}

async function txsByMulAddress (addresses) {
    let result = await axiosInstance(`/api/addrs/${addresses.join()}/txs?from=0&to=2`);
    return result.data;
}

async function utxoByMulAddress (addresses) {
    let result = await axiosInstance(`/api/addrs/${addresses.join()}/utxo`);
    return result.data;
}

async function broadTx (tx) {
    let result = await axiosInstance.post('/api/tx/send', {
        rawtx: tx
    });
    return result.data;
}


module.exports = {
    axios: axiosInstance,
    txsByAddress,
    balanceByAddress,
    utxoByMulAddress,
    broadTx
};


;(async () => {
    // let result = await axiosInstance('/api/block-index/0');
    // console.log(result.data);

    // result = await axiosInstance('/api/block/000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943');
    // console.log(result.data);
    // let data = await balanceByAddress('mjwRqAeJu7jZL5HeJjjLA3GZ3dNPbcBiWG');
    // console.log(data);
    // console.log(data.txs[0].vout.map(i => console.log(i.scriptPubKey)));
})();