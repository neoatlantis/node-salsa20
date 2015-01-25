/*
 * Example Usage of Salsa20
 *
 */

function toHEX(ab){
    var ary = Uint8Array(ab);
    var ret = '';
    for(var i=0; i<ary.length; i++){
        if(ary[i] < 16)
            ret += '0' + (ary[i]).toString(16);
        else
            ret += (ary[i]).toString(16);
    }
    return ret;
}

var salsa20 = require('./salsa20.js');

var cipher = new salsa20(20);

var key = new Uint8Array([
    1, 2, 3, 4, 5, 6, 7, 8,
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116,
    117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132,
]).buffer;


cipher.key(key);

var size = 1024 * 1024 * 1;
var plaintextBlock = new Uint8Array(size).buffer;
var begin = new Date().getTime();
var f = cipher.encrypt(plaintextBlock);
var end = new Date().getTime();

console.log('Speed: ', size / ((end - begin) / 1000), 'bytes / second');
