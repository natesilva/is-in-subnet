"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
const ava_1 = require("ava");
const ipv4Tests = [
    ['10.5.0.1', '0.0.0.0/0', true],
    ['10.5.0.1', '11.0.0.0/8', false],
    ['10.5.0.1', '10.0.0.0/8', true],
    ['10.5.0.1', '10.0.0.1/8', true],
    ['10.5.0.1', '10.0.0.10/8', true],
    ['10.5.0.1', '10.5.5.0/16', true],
    ['10.5.0.1', '10.4.5.0/16', false],
    ['10.5.0.1', '10.4.5.0/15', true],
    ['10.5.0.1', '10.5.0.2/32', false],
    ['10.5.0.1', '10.5.0.1/32', true]
];
const ipv6Tests = [
    ['2001:db8:f53a::1', '::/0', true],
    ['2001:db8:f53a::1', '2001:db8:f53a::1:1/64', true],
    ['2001:db8:f53a::1', '2001:db8:f53b::1:1/48', false],
    ['2001:db8:f53a::1', '2001:db8:f531::1:1/44', true],
    ['2001:db8:f53a::1', '2001:db8:f500::1/40', true],
    ['2001:db8:f53a::1', '2001:db8:f500::1%z/40', true],
    ['2001:db8:f53a::1', '2001:db9:f500::1/40', false],
    ['2001:db8:f53a::1', '2001:db9:f500::1%z/40', false],
    ['2001:db8:f53a:0:0:0:0:1', '2001:db8:f500:0:0:0:0:1%z/40', true]
];
ava_1.default('ipv4 subnet membership (one-at-a-time)', (t) => __awaiter(this, void 0, void 0, function* () {
    ipv4Tests.forEach(([ip, subnet, expected]) => {
        t.is(index_1.isInSubnet(ip, subnet), expected);
    });
}));
ava_1.default('ipv4 subnet membership (array)', (t) => __awaiter(this, void 0, void 0, function* () {
    const ip = ipv4Tests[0][0];
    const inSubnets = ipv4Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    t.is(index_1.isInSubnet(ip, inSubnets), true);
    const notInSubnets = ipv4Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.is(index_1.isInSubnet(ip, notInSubnets), false);
}));
ava_1.default('ipv6 subnet membership (one-at-a-time)', (t) => __awaiter(this, void 0, void 0, function* () {
    ipv6Tests.forEach(([ip, subnet, expected]) => {
        t.is(index_1.isInSubnet(ip, subnet), expected);
    });
}));
ava_1.default('ipv6 subnet membership (array)', (t) => __awaiter(this, void 0, void 0, function* () {
    const ip = ipv6Tests[0][0];
    const inSubnets = ipv6Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    t.is(index_1.isInSubnet(ip, inSubnets), true);
    const notInSubnets = ipv6Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.is(index_1.isInSubnet(ip, notInSubnets), false);
}));
ava_1.default('private addresses', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(index_1.isPrivate('192.168.0.1'), true);
    t.is(index_1.isPrivate('fe80::5555:1111:2222:7777%utun2'), true);
}));
ava_1.default('localhost addresses', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(index_1.isLocalhost('127.0.0.1'), true);
    t.is(index_1.isLocalhost('::1'), true);
}));
ava_1.default('IPv4 mapped addresses', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(index_1.isIPv4MappedAddress('8.8.8.8'), false);
    t.is(index_1.isIPv4MappedAddress('::ffff:8.8.8.8'), true);
}));
ava_1.default('reserved addresses', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(index_1.isReserved('169.254.100.200'), true);
    t.is(index_1.isReserved('2001:db8:f53a::1'), true);
}));
ava_1.default('special addresses', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(index_1.isSpecial('127.0.0.1'), true);
    t.is(index_1.isSpecial('::'), true);
}));
ava_1.default.serial('should be able to test 100,000 ipv4 addresses in less than 5 seconds', (t) => __awaiter(this, void 0, void 0, function* () {
    const start = process.hrtime();
    // approximately 100K test runs
    let testCount = Math.floor(100000 / ipv4Tests.length);
    for (let index = 0; index < testCount; ++index) {
        ipv4Tests.forEach(([ip, subnet, expected]) => {
            t.is(index_1.isInSubnet(ip, subnet), expected);
        });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 5);
}));
ava_1.default.serial('should be able to test 100,000 ipv6 addresses in less than 5 seconds', (t) => __awaiter(this, void 0, void 0, function* () {
    const start = process.hrtime();
    // approximately 100K test runs
    let testCount = Math.floor(100000 / ipv6Tests.length);
    for (let index = 0; index < testCount; ++index) {
        ipv6Tests.forEach(([ip, subnet, expected]) => {
            t.is(index_1.isInSubnet(ip, subnet), expected);
        });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 5);
}));
//# sourceMappingURL=index.js.map