"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const error_1 = require("./error");
const hasDot = /\./;
const mappedIpv4 = /(.+):ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})($|%.+)/;
function mappedIpv4ToIpv6(ip) {
    const matches = ip.match(mappedIpv4);
    /* istanbul ignore if */
    if (!matches) {
        throw new Error(`not a mapped IPv4 address: ${ip}`);
    }
    // mapped IPv4 address
    const prefix = matches[1];
    const ipv4 = matches[2];
    const parts = ipv4.split('.').map(x => parseInt(x, 10));
    const segment7 = ((parts[0] << 8) + parts[1]).toString(16);
    const segment8 = ((parts[2] << 8) + parts[3]).toString(16);
    const ipv6Version = `${prefix}:ffff:${segment7}:${segment8}`;
    return getIpv6Segments(ipv6Version);
}
/**
 * Given an IP address that may have double-colons, expand all segments and return them
 * as an array of 8 segments (16-bit words). As a peformance enhancement (indicated by
 * profiling), for any segment that was missing but should be a '0', returns undefined.
 * @param ip the IPv6 address to expand
 * @throws if the string is not a valid IPv6 address
 */
function getIpv6Segments(ip) {
    if (!net.isIPv6(ip)) {
        throw new error_1.IpAddressError(`not a valid IPv6 address: ${ip}`);
    }
    if (hasDot.test(ip)) {
        return mappedIpv4ToIpv6(ip);
    }
    // break it into an array, including missing "::" segments
    const [beforeChunk, afterChunk] = ip.split('::');
    const beforeParts = (beforeChunk && beforeChunk.split(':')) || [];
    const afterParts = (afterChunk && afterChunk.split(':')) || [];
    const missingSegments = new Array(8 - (beforeParts.length + afterParts.length));
    return beforeParts.concat(missingSegments, afterParts);
}
/**
 * Test if the given IPv6 address is contained in the specified subnet.
 * @param address the IPv6 address to check
 * @param subnet the IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(address, subnetOrSubnets) {
    if (Array.isArray(subnetOrSubnets)) {
        return subnetOrSubnets.some(subnet => isInSubnet(address, subnet));
    }
    const subnet = subnetOrSubnets;
    const [subnetAddress, prefixLengthString] = subnet.split('/');
    const prefixLength = parseInt(prefixLengthString, 10);
    if (!subnetAddress || !Number.isInteger(prefixLength)) {
        throw new error_1.IpAddressError(`not a valid IPv6 CIDR subnet: ${subnet}`);
    }
    // the next two lines throw if the addresses are not valid IPv6 addresses
    const addressSegments = getIpv6Segments(address);
    const subnetSegments = getIpv6Segments(subnetAddress);
    if (prefixLength < 0 || prefixLength > 128) {
        throw new error_1.IpAddressError(`not a valid IPv6 prefix length: ${prefixLength} (from ${subnet})`);
    }
    for (let i = 0; i < 8; ++i) {
        const bitCount = Math.min(prefixLength - i * 16, 16);
        if (bitCount <= 0) {
            break;
        }
        const maskPart = parseInt('1'.repeat(bitCount) + '0'.repeat(16 - bitCount), 2);
        if ((((addressSegments[i] && parseInt(addressSegments[i], 16)) || 0) & maskPart) !==
            (((subnetSegments[i] && parseInt(subnetSegments[i], 16)) || 0) & maskPart)) {
            return false;
        }
    }
    return true;
}
exports.isInSubnet = isInSubnet;
/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address) {
    return isInSubnet(address, [
        'fe80::/10',
        'fc00::/7' // unique local address
    ]);
}
exports.isPrivate = isPrivate;
/** Test if the given IP address is a localhost address. */
function isLocalhost(address) {
    return isInSubnet(address, '::1/128');
}
exports.isLocalhost = isLocalhost;
/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
function isIPv4MappedAddress(address) {
    return isInSubnet(address, '::ffff:0:0/96');
}
exports.isIPv4MappedAddress = isIPv4MappedAddress;
/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address) {
    return isInSubnet(address, [
        '::/128',
        '64:ff9b::/96',
        '100::/64',
        '2001::/32',
        '2001:10::/28',
        '2001:20::/28',
        '2001:db8::/32',
        '2002::/16',
        'ff00::/8' // multicast
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
//# sourceMappingURL=ipv6.js.map