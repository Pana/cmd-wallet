const EventEmitter = require('events');

/*
    1. 一次只能接受一个消息
    2. receive 方法接受消息
    3. emit data 方法传出消息
*/ 
class Receiver extends EventEmitter {
    constructor() {
        super();
        this.data = [];
        this.totalLen = 0;
        this.currentLen = 0;
    }
    receive (buf) {
        // 接受数据, 判断数据是否结束, 如果结束触发事件, 将数据传递出去, 如果未结束就合并数据
        if (isBeginMsg(buf)) {
            let _msgLen = msgLen(buf);
            this.totalLen = _msgLen;
            this.currentLen = 55;
            this.data = buf.slice(9);
            this.msgId = buf[4];
            if (_msgLen < 55) {
                this.emit('data', buf.slice(9, 9 + _msgLen));
                this.clear();
            }
        } else {
            if (this.currentLen + 63 < this.totalLen) {
                this.currentLen += 63;
                this.data = Buffer.concat([this.data, buf.slice(1)]);
            } else {
                let _data = Buffer.concat([this.data, buf.slice(1, 1 + this.totalLen - this.currentLen)]);
                if(this.msgId === 0x1E) {  // address 截取
                    _data = _data.slice(0, 34);
                }
                if(this.msgId === 0x15) {
                    _data = parseHashSig(_data);
                }
                if(this.msgId === 0x0C) {
                    _data = parsePublicKey(_data);
                }
                this.emit('data', _data);
                this.clear();
            }
        }
    }
    clear () {
        this.data = [];
        this.totalLen = 0;
        this.currentLen = 0;
        this.msgId = 0;
    }
}

function isBeginMsg (buf) {
    if (buf[0] == 0x3f && buf[1] == 0x23 && buf[2] == 0x23) {
        return true;
    }
    return false;
}

function msgLen (buf) {
    if (isBeginMsg(buf)) {
        return buf[8] + buf[7]*256;
    } else {
        // msg 不包含长度信息
        return 0;
    }
}

function parseHashSig(buf) {
    let data = {
        hasRequestType: buf.slice(0, 4),
        requestType: buf.slice(4, 8),
        hasDetail: buf.slice(8, 12),
        details: buf.slice(12, 82),
        sigSize: buf.slice(112, 116),
        sig: buf.slice(116, 116 + buf[112])
    };
    // console.log(data.sig.toString('hex'));
    return data;
}


function parsePublicKey (buf) {
    return {
        depth: buf.slice(0, 4),
        fingerPrint: buf.slice(4, 8),
        chidNum: buf.slice(8, 12),
        chainCodeSize: buf.slice(12, 16),
        chainCode: buf.slice(16, 48),
        hasPrivateKey: buf.slice(48, 52),
        privateKey: buf.slice(52, 87),
        hasPublicKey: buf.slice(88, 92),
        publicKeySize: buf.slice(92, 96),
        publicKey: buf.slice(96, 129),
        // 中间还有三位
        hasXpub: buf.slice(132, 136),
        xpub: buf.slice(136, 140)
    };
}


module.exports = Receiver;