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
const IPv4 = require("../src/ipv4");
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
ava_1.default('ipv4 subnet membership (one-at-a-time)', (t) => __awaiter(this, void 0, void 0, function* () {
    ipv4Tests.forEach(([ip, subnet, expected]) => {
        t.is(IPv4.isInSubnet(ip, subnet), expected);
    });
}));
ava_1.default('ipv4 subnet membership (array)', (t) => __awaiter(this, void 0, void 0, function* () {
    const ip = ipv4Tests[0][0];
    const inSubnets = ipv4Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    t.is(IPv4.isInSubnet(ip, inSubnets), true);
    const notInSubnets = ipv4Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.is(IPv4.isInSubnet(ip, notInSubnets), false);
}));
ava_1.default('invalid subnets', (t) => __awaiter(this, void 0, void 0, function* () {
    t.throws(() => IPv4.isInSubnet('10.5.0.1', '10.5.0.1'));
    t.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/-1'));
    t.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/33'));
}));
ava_1.default('invalid ipv4', (t) => __awaiter(this, void 0, void 0, function* () {
    t.throws(() => IPv4.isInSubnet('256.5.0.1', '0.0.0.0/0'));
    t.throws(() => IPv4.isInSubnet('::1', '0.0.0.0/0'));
    t.throws(() => IPv4.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
    t.throws(() => IPv4.isInSubnet('10.5.0.1', '1.2.3'));
}));
ava_1.default('ipv4 localhost', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv4.isLocalhost('127.0.0.1'), true);
    t.is(IPv4.isLocalhost('127.99.88.77'), true);
    t.is(IPv4.isLocalhost('192.168.0.1'), false);
}));
ava_1.default('ipv4 private', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv4.isPrivate('127.0.0.1'), false);
    t.is(IPv4.isPrivate('192.168.0.1'), true);
    t.is(IPv4.isPrivate('10.11.12.13'), true);
    t.is(IPv4.isPrivate('172.16.0.1'), true);
}));
ava_1.default('ipv4 reserved', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv4.isReserved('127.0.0.1'), false);
    t.is(IPv4.isReserved('169.254.100.200'), true);
    t.is(IPv4.isReserved('0.0.0.0'), true);
    t.is(IPv4.isReserved('255.255.255.255'), true);
}));
ava_1.default('ipv4 special', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv4.isSpecial('127.0.0.1'), true);
    t.is(IPv4.isSpecial('192.168.0.1'), true);
    t.is(IPv4.isSpecial('169.254.100.200'), true);
    t.is(IPv4.isSpecial('8.8.8.8'), false);
}));
//# sourceMappingURL=ipv4.js.map