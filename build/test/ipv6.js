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
const IPv6 = require("../src/ipv6");
const ava_1 = require("ava");
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
ava_1.default('ipv6 subnet membership (one-at-a-time)', (t) => __awaiter(this, void 0, void 0, function* () {
    ipv6Tests.forEach(([ip, subnet, expected]) => {
        t.is(IPv6.isInSubnet(ip, subnet), expected);
    });
}));
ava_1.default('ipv6 subnet membership (array)', (t) => __awaiter(this, void 0, void 0, function* () {
    const ip = ipv6Tests[0][0];
    const inSubnets = ipv6Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    t.is(IPv6.isInSubnet(ip, inSubnets), true);
    const notInSubnets = ipv6Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.is(IPv6.isInSubnet(ip, notInSubnets), false);
}));
ava_1.default('invalid subnets', (t) => __awaiter(this, void 0, void 0, function* () {
    t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1'));
    t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/-1'));
    t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/129'));
}));
ava_1.default('invalid ipv6', (t) => __awaiter(this, void 0, void 0, function* () {
    t.throws(() => IPv6.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
}));
ava_1.default('ipv6 localhost', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv6.isLocalhost('::1'), true);
    t.is(IPv6.isLocalhost('::2'), false);
}));
ava_1.default('ipv6 private', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv6.isPrivate('::1'), false);
    t.is(IPv6.isPrivate('fe80::5555:1111:2222:7777%utun2'), true);
    t.is(IPv6.isPrivate('fdc5:3c04:80bf:d9ee::1'), true);
}));
ava_1.default('ipv6 mapped', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv6.isIPv4MappedAddress('::1'), false);
    t.is(IPv6.isIPv4MappedAddress('fe80::5555:1111:2222:7777%utun2'), false);
    t.is(IPv6.isIPv4MappedAddress('::ffff:192.168.0.1'), true);
    // THIS FORMAT IS DEPRECATED AND WE DO NOT SUPPORT IT: SEE RFC5156 SECTION 2.3
    // https://tools.ietf.org/html/rfc5156#section-2.3
    t.throws(() => IPv6.isIPv4MappedAddress('::192.168.0.1'));
}));
ava_1.default('ipv6 reserved', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv6.isReserved('2001:db8:f53a::1'), true);
    t.is(IPv6.isReserved('2001:4860:4860::8888'), false);
    t.is(IPv6.isReserved('::'), true);
}));
ava_1.default('ipv6 special', (t) => __awaiter(this, void 0, void 0, function* () {
    t.is(IPv6.isSpecial('2001:4860:4860::8888'), false);
    t.is(IPv6.isSpecial('::1'), true);
    t.is(IPv6.isSpecial('::ffff:192.168.0.1'), false);
    t.is(IPv6.isSpecial('2001:db8:f53a::1'), true);
}));
//# sourceMappingURL=ipv6.js.map