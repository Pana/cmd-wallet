
module.exports = {
    // 构造长度64的, 数组元祖为0的空数组
    emptyArray: function () {
        let a = new Array(64);
        a.fill(0);
        return a;
    },

    // string to charCodeArray
    stringCharCodeArray: function (str) {
        let result = new Array(str.length);
        result.fill(0);
        return result.map((ele, i) => str.charCodeAt(i));
    },

    padValue: function (array, length, value) {
        for (let i = array.length; i < length; i++) {
            array.push(value);
        }
        return array;
    },

    hexStringToNumberArray: function (str) {
        let numArray = str.split(' ').map(i => parseInt(i.trim(), 16));
        return this.padValue(numArray, 64, 0);
    },

    getAddressData: function (index = 0) {
        let data = [];
        //
        let beginChar = this.stringCharCodeArray('?##');
        // console.log(beginChar);
        data = data.concat(beginChar);
        // msg id
        data = data.concat([0, 29]);
        // msg size
        data = data.concat([0, 0, 0, 43]);
        // msg content
        data = data.concat([
            1, 0, 0, 0,   // address_n_count
            index, 0, 0, 0, 0, 0, 0, 0, // address_n
            1, 0, 0, 0,
        ]);
        data = data.concat(this.hexStringToNumberArray("74 65 73 74 63 6f 69 6e 00 00 00 00 00 00 00"));
        return this.padValue(data, 64, 0);
    },

    getPublicKeyData: function (index = 0) {
        let data = [];
        //
        let beginChar = this.stringCharCodeArray('?##');
        data = data.concat(beginChar);
        // msg id
        data = data.concat([0, 11]);
        // msg size
        data = data.concat([0, 0, 0, 46]);
        // msg content
        data = data.concat([
            0, 0, 0, 0,   // address_n_count
            0, 0, 0, index, // address_n
            // ....
        ]);
        return this.padValue(data, 64, 0);
    },

    txSign: function (hash, index = 0) {
        let data = [];
        let beginChar = this.stringCharCodeArray('?##');
        data = data.concat(beginChar);
        // msg id
        data = data.concat([0, 22]);
        // msg size
        data = data.concat([0, 0, 0, 48]);
        // msg content
        data = data.concat([0, 0, 0, 1]);
        data = data.concat(hash); // 32 byte hash
        // address count
        data = data.concat([index, 0, 0, 0]);
        // address index
        data = data.concat([
            index, 0, 0, 0,
        ]);
        return this.padValue(data, 64, 0);
    }
};

/*
    TODO
    关于数据的解析:
    返回数据通常分多次发送， 接收到包后需要判断本次传送是否结束，如果结束对数据进行解析， 并把数据传递出来。
    应该需要使用基于事件的数据传递方式
*/

/*
客户端通过发送getaddress的usb 数据包来调用KZERO的getaddress() function.
具体格式如下：
magic_constant[3] = '?##'
msg_id[2] = MESSAGE_TYPE__MessageType_GetAddress = 29
msg_size[4] = 43
msg_data[55] = struct GetAddress的内容,总共43byte，剩下的补0

总共43个byte
struct  GetAddress
{
  size_t 				address_n_count; (4byte)
  uint32_t 			*address_n;     (4byte)
  protobuf_c_boolean	 has_coin_name; (4byte)
  char 				 coin_name[15];  (15byte)
  protobuf_c_boolean	 has_show_display; (4byte)
  protobuf_c_boolean  show_display;     (4byte) 
  protobuf_c_boolean 	 has_script_type;    (4byte)
  InputScriptType      script_type;         (4byte)
};


Example data:
3f 23 23 00 1D 00 00 00 10 09 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60 61 62 63 

*/