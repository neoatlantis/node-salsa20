/* Check input as an array: ArrayBuffer, Uint8Array or Buffer in NodeJS.
 *
 * Returns an ArrayBuffer, for ease of conversion between Uint8Array and
 * Uint32Array. */

const buffer = require("buffer");

function isArrayBuffer(v){
    return toString.apply(v) === '[object ArrayBuffer]';
};

function isUint8Array(v){
    return toString.apply(v) === '[object Uint8Array]';
}

module.exports = function(input){
    if(!(
        isArrayBuffer(input) ||
        isUint8Array(input) ||
        buffer.Buffer.isBuffer(input)
    )) {
        throw Error("node-salsa20: Requires an input of ArrayBuffer, Uint8Array or Buffer.");
    }
    return new Uint8Array(buffer.Buffer.from(input)).buffer;
}
