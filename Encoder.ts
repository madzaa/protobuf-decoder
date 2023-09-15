import {readFileSync} from 'fs';
import {run} from "node:test";

function readFile(path: string) {
    return readFileSync(path).readBigUInt64BE(0);
}

function encode(uint64: bigint) {
    const byteArray = new Array<number>();
    const BIGINT_SIXTEEN_BYTES = 0x7fn;



    while (uint64 > 0) {
        const result = uint64 & BIGINT_SIXTEEN_BYTES;
        uint64 > BIGINT_SIXTEEN_BYTES ?
            byteArray.push(Number(result | BIGINT_SIXTEEN_BYTES)) : byteArray.push(Number(result));
        uint64 >>= 7n;
    }
    return Buffer.from(byteArray);
}

function decode(varint: Buffer) {
    let integer = 0n;
    for (let varn of varint.reverse()) {
        integer <<= 7n;
        integer |= BigInt((varn & 0x7f));
    }
    return integer;
}

const varint = {
    oneFifty: './varint/150.uint64',
    one: './varint/1.uint64',
    max: './varint/maxint.uint64'
}

function runTests() {

    const testCases = [
        {
            name: '1.uint64',
            value: varint.one,
            expected: Buffer.from([0x01])
        },
        {
            name: '150.uint64',
            value: varint.oneFifty,
            expected: Buffer.from([0x96, 0x01])
        },
        {
            name: 'maxint.uint64',
            value: varint.max,
            expected: Buffer.from([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x01])
        },
    ];

    for (const testCase of testCases) {
        console.assert(decode(encode(readFile(testCase.value))) == readFile(testCase.value));
    }

    for (const testCase of testCases) {
        console.assert((encode(readFile(testCase.value))).equals(testCase.expected));
    }
}

runTests()