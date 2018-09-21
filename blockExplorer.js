const axios = require('axios');

const MAINNET = 'https://blockexplorer.com';
const TESTNET = "https://testnet.blockexplorer.com";

const axiosInstance = axios.create({
    baseURL: TESTNET,
});


async function txsByAddress (address) {
    let result = await axiosInstance(`/api/txs/?address=${address}`);
    return result.data;
}


module.exports = {
    axios: axiosInstance,
    txsByAddress,
};

module.exports = axiosInstance;


;(async () => {
    let result = await axiosInstance('/api/block/0000000000000000079c58e8b5bce4217f7515a74b170049398ed9b8428beb4a');
    console.log(result.data);
})();