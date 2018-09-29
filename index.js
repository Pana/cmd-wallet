#!/usr/bin/env node

const program = require('commander');
const fs = require('fs');
const FileName = 'mnemonicRc';
const bip39 = require('bip39');
const level = require("level");
const db = level("./levelDB");
const HDKey = require('hdkey');

 // output absorb joke mobile jazz sadness pioneer coffee destroy brisk auction truth
program
  .version('0.1.0')
  .option('-p, --peppers', 'Add peppers')
  .option('-P, --pineapple', 'Add pineapple')
  .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble');


program.command("zhujici")
    .action(async function(dir, cmd) {
        let mnemonic = await levelGet('mnemonic');
        if (!mnemonic) {
            mnemonic = bip39.generateMnemonic();
            await db.put('mnemonic', mnemonic);
        }
        console.log(mnemonic);
    });

// 获取主公钥
program.command('masterKey')
    .action(async function () {
        let mnemonic = await levelGet('mnemonic');
        let seed = bip39.mnemonicToSeed(mnemonic);
        console.log('seed', seed.toString('hex'));
        let hdkey = HDKey.fromMasterSeed(seed);
        // console.log(hdkey.privateExtendedKey);
        console.log(hdkey.publicExtendedKey);
        // console.log(hdkey.privateKey.toString('hex'));
        console.log(hdkey.publicKey.toString('hex'));
    });

// 获取余额
program.command('getBalance')
    .action(async function () {

    });

// 获取收款地址: 获取当前未使用的地址
program.command('getAddress')  
    .action(async function () {
        
    });

// 发送交易: 地址，金额
program.command('sendTx')
    .action(async function () {
        
    });
  

  
program.parse(process.argv);
 
/* console.log('you ordered a pizza with:');
if (program.peppers) console.log('  - peppers');
if (program.pineapple) console.log('  - pineapple');
if (program.bbqSauce) console.log('  - bbq');
console.log('  - %s cheese', program.cheese); */


async function levelGet(key) {
    let value;
    try {
        value = await db.get(key);
    } catch(e) {

    }
    return value;
}