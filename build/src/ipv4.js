"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const error_1 = require("./error");
/**
 * Given an IPv4 address, convert it to a 32-bit long integer.
 * @param ip the IPv4 address to expand
 * @throws if the string is not a valid IPv4 address
 */
function ipv4ToLong(ip) {
    if (!net.isIPv4(ip)) {
        throw new error_1.IpAddressError(`not a valid IPv4 address: ${ip}`);
    }
    return (ip.split('.').reduce(function (ipInt, octet) {
        return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0);
}
/**
 * Test if the given IPv4 address is contained in the specified subnet.
 * @param address the IPv4 address to check
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(address, subnetOrSubnets) {
    if (Array.isArray(subnetOrSubnets)) {
        return subnetOrSubnets.some(subnet => isInSubnet(address, subnet));
    }
    const subnet = subnetOrSubnets;
    const [subnetAddress, prefixLengthString] = subnet.split('/');
    if (!subnetAddress || !Number.isInteger(parseInt(prefixLengthString, 10))) {
        throw new error_1.IpAddressError(`not a valid IPv4 subnet: ${subnet}`);
    }
    const prefixLength = parseInt(prefixLengthString, 10);
    if (prefixLength < 0 || prefixLength > 32) {
        throw new error_1.IpAddressError(`not a valid IPv4 prefix length: ${prefixLength} (from ${subnet})`);
    }
    const maskLong = parseInt('1'.repeat(prefixLength) + '0'.repeat(32 - prefixLength), 2);
    const mask = ipv4ToLong(subnetAddress) & maskLong;
    const long = ipv4ToLong(address);
    return (long & maskLong) === mask;
}
exports.isInSubnet = isInSubnet;
/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address) {
    return isInSubnet(address, ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']);
}
exports.isPrivate = isPrivate;
/** Test if the given IP address is a localhost address. */
function isLocalhost(address) {
    return isInSubnet(address, '127.0.0.0/8');
}
exports.isLocalhost = isLocalhost;
/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address) {
    return isInSubnet(address, [
        '0.0.0.0/8',
        '100.64.0.0/10',
        '169.254.0.0/16',
        '192.0.0.0/24',
        '192.0.2.0/24',
        '192.88.99.0/24',
        '198.18.0.0/15',
        '198.51.100.0/24',
        '203.0.113.0/24',
        '224.0.0.0/4',
        '240.0.0.0/4',
        '255.255.255.255/32' // limited broadcast address
    ]);
}
exports.isReserved = isReserved;
/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
function isSpecial(address) {
    return isPrivate(address) || isLocalhost(address) || isReserved(address);
}
exports.isSpecial = isSpecial;
//# sourceMappingURL=ipv4.js.map