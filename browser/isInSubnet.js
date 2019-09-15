(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var IPv4 = require("./ipv4");
exports.IPv4 = IPv4;
var IPv6 = require("./ipv6");
exports.IPv6 = IPv6;
var util = require("./util");
/**
 * Test if the given IP address is contained in the specified subnet.
 * @param address the IPv4 or IPv6 address to check
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(address, subnetOrSubnets) {
    if (!Array.isArray(subnetOrSubnets)) {
        return isInSubnet(address, [subnetOrSubnets]);
    }
    // for mapped IPv4 addresses, compare against both IPv6 and IPv4 subnets
    if (util.isIPv6(address) && IPv6.isIPv4MappedAddress(address)) {
        return (IPv6.isInSubnet(address, subnetOrSubnets.filter(function (subnet) { return util.isIPv6(subnet.split('/')[0]); })) ||
            IPv4.isInSubnet(IPv6.extractMappedIpv4(address), subnetOrSubnets.filter(function (subnet) { return util.isIPv4(subnet.split('/')[0]); })));
    }
    if (util.isIPv6(address)) {
        return IPv6.isInSubnet(address, subnetOrSubnets.filter(function (subnet) { return util.isIPv6(subnet.split('/')[0]); }));
    }
    else {
        return IPv4.isInSubnet(address, subnetOrSubnets.filter(function (subnet) { return util.isIPv4(subnet.split('/')[0]); }));
    }
}
exports.isInSubnet = isInSubnet;
/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address) {
    if (util.isIPv6(address)) {
        if (IPv6.isIPv4MappedAddress(address)) {
            return IPv4.isPrivate(IPv6.extractMappedIpv4(address));
        }
        return IPv6.isPrivate(address);
    }
    else {
        return IPv4.isPrivate(address);
    }
}
exports.isPrivate = isPrivate;
/** Test if the given IP address is a localhost address. */
function isLocalhost(address) {
    if (util.isIPv6(address)) {
        if (IPv6.isIPv4MappedAddress(address)) {
            return IPv4.isLocalhost(IPv6.extractMappedIpv4(address));
        }
        return IPv6.isLocalhost(address);
    }
    else {
        return IPv4.isLocalhost(address);
    }
}
exports.isLocalhost = isLocalhost;
/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
function isIPv4MappedAddress(address) {
    if (util.isIPv6(address)) {
        return IPv6.isIPv4MappedAddress(address);
    }
    else {
        return false;
    }
}
exports.isIPv4MappedAddress = isIPv4MappedAddress;
/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address) {
    if (util.isIPv6(address)) {
        if (IPv6.isIPv4MappedAddress(address)) {
            return IPv4.isReserved(IPv6.extractMappedIpv4(address));
        }
        return IPv6.isReserved(address);
    }
    else {
        return IPv4.isReserved(address);
    }
}
exports.isReserved = isReserved;
/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
function isSpecial(address) {
    if (util.isIPv6(address)) {
        if (IPv6.isIPv4MappedAddress(address)) {
            return IPv4.isSpecial(IPv6.extractMappedIpv4(address));
        }
        return IPv6.isSpecial(address);
    }
    else {
        return IPv4.isSpecial(address);
    }
}
exports.isSpecial = isSpecial;

},{"./ipv4":2,"./ipv6":3,"./util":4}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
/**
 * Given an IPv4 address, convert it to a 32-bit long integer.
 * @param ip the IPv4 address to expand
 * @throws if the string is not a valid IPv4 address
 */
function ipv4ToLong(ip) {
    if (!util.isIPv4(ip)) {
        throw new Error("not a valid IPv4 address: " + ip);
    }
    var octets = ip.split('.');
    return (((parseInt(octets[0], 10) << 24) +
        (parseInt(octets[1], 10) << 16) +
        (parseInt(octets[2], 10) << 8) +
        parseInt(octets[3], 10)) >>>
        0);
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
        return subnetOrSubnets.some(function (subnet) { return isInSubnet(address, subnet); });
    }
    var subnet = subnetOrSubnets;
    var _a = subnet.split('/'), subnetAddress = _a[0], prefixLengthString = _a[1];
    var prefixLength = parseInt(prefixLengthString, 10);
    if (!subnetAddress || !Number.isInteger(prefixLength)) {
        throw new Error("not a valid IPv4 subnet: " + subnet);
    }
    if (prefixLength < 0 || prefixLength > 32) {
        throw new Error("not a valid IPv4 prefix length: " + prefixLength + " (from " + subnet + ")");
    }
    // the next two lines throw if the addresses are not valid IPv4 addresses
    var subnetLong = ipv4ToLong(subnetAddress);
    var addressLong = ipv4ToLong(address);
    if (prefixLength === 0) {
        return true;
    }
    var subnetPrefix = subnetLong >> (32 - prefixLength);
    var addressPrefix = addressLong >> (32 - prefixLength);
    return subnetPrefix === addressPrefix;
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

},{"./util":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require("./util");
// Note: Profiling shows that on recent versions of Node, string.split(RegExp) is faster
// than string.split(string).
var dot = /\./;
var mappedIpv4 = /^(.+:ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:%.+)?$/;
var colon = /:/;
var doubleColon = /::/;
/**
 * Given a mapped IPv4 address (e.g. ::ffff:203.0.113.38 or similar), convert it to the
 * equivalent standard IPv6 address.
 * @param ip the IPv4-to-IPv6 mapped address
 */
function mappedIpv4ToIpv6(ip) {
    var matches = ip.match(mappedIpv4);
    if (!matches || !util.isIPv4(matches[2])) {
        throw new Error("not a mapped IPv4 address: " + ip);
    }
    // mapped IPv4 address
    var prefix = matches[1];
    var ipv4 = matches[2];
    var parts = ipv4.split(dot).map(function (x) { return parseInt(x, 10); });
    var segment7 = ((parts[0] << 8) + parts[1]).toString(16);
    var segment8 = ((parts[2] << 8) + parts[3]).toString(16);
    return "" + prefix + segment7 + ":" + segment8;
}
/**
 * Given a mapped IPv4 address, return the bare IPv4 equivalent.
 */
function extractMappedIpv4(ip) {
    var matches = ip.match(mappedIpv4);
    if (!matches || !util.isIPv4(matches[2])) {
        throw new Error("not a mapped IPv4 address: " + ip);
    }
    return matches[2];
}
exports.extractMappedIpv4 = extractMappedIpv4;
/**
 * Given an IP address that may have double-colons, expand all segments and return them
 * as an array of 8 segments (16-bit words). As a peformance enhancement (indicated by
 * profiling), for any segment that was missing but should be a '0', returns undefined.
 * @param ip the IPv6 address to expand
 * @throws if the string is not a valid IPv6 address
 */
function getIpv6Segments(ip) {
    if (!util.isIPv6(ip)) {
        throw new Error("not a valid IPv6 address: " + ip);
    }
    if (dot.test(ip)) {
        return getIpv6Segments(mappedIpv4ToIpv6(ip));
    }
    // break it into an array, including missing "::" segments
    var _a = ip.split(doubleColon), beforeChunk = _a[0], afterChunk = _a[1];
    var beforeParts = (beforeChunk && beforeChunk.split(colon)) || [];
    var afterParts = (afterChunk && afterChunk.split(colon)) || [];
    var missingSegments = new Array(8 - (beforeParts.length + afterParts.length));
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
        return subnetOrSubnets.some(function (subnet) { return isInSubnet(address, subnet); });
    }
    var subnet = subnetOrSubnets;
    var _a = subnet.split('/'), subnetAddress = _a[0], prefixLengthString = _a[1];
    var prefixLength = parseInt(prefixLengthString, 10);
    if (!subnetAddress || !Number.isInteger(prefixLength)) {
        throw new Error("not a valid IPv6 CIDR subnet: " + subnet);
    }
    if (prefixLength < 0 || prefixLength > 128) {
        throw new Error("not a valid IPv6 prefix length: " + prefixLength + " (from " + subnet + ")");
    }
    // the next two lines throw if the addresses are not valid IPv6 addresses
    var addressSegments = getIpv6Segments(address);
    var subnetSegments = getIpv6Segments(subnetAddress);
    for (var i = 0; i < 8; ++i) {
        var bitCount = Math.min(prefixLength - i * 16, 16);
        if (bitCount <= 0) {
            break;
        }
        var subnetPrefix = ((subnetSegments[i] && parseInt(subnetSegments[i], 16)) || 0) >> (16 - bitCount);
        var addressPrefix = ((addressSegments[i] && parseInt(addressSegments[i], 16)) || 0) >> (16 - bitCount);
        if (subnetPrefix !== addressPrefix) {
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
    if (isInSubnet(address, '::ffff:0:0/96')) {
        var matches = address.match(mappedIpv4);
        return Boolean(matches && util.isIPv4(matches[2]));
    }
    return false;
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

},{"./util":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// RegExp for testing if a string represents an IPv4 address
var v4Seg = '(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])';
var v4Str = "(" + v4Seg + "[.]){3}" + v4Seg;
var IPv4Reg = new RegExp("^" + v4Str + "$");
// RegExp for testing if a string represents an IPv6 address
var v6Seg = '(?:[0-9a-fA-F]{1,4})';
var IPv6Reg = new RegExp('^(' +
    ("(?:" + v6Seg + ":){7}(?:" + v6Seg + "|:)|") +
    ("(?:" + v6Seg + ":){6}(?:" + v4Str + "|:" + v6Seg + "|:)|") +
    ("(?:" + v6Seg + ":){5}(?::" + v4Str + "|(:" + v6Seg + "){1,2}|:)|") +
    ("(?:" + v6Seg + ":){4}(?:(:" + v6Seg + "){0,1}:" + v4Str + "|(:" + v6Seg + "){1,3}|:)|") +
    ("(?:" + v6Seg + ":){3}(?:(:" + v6Seg + "){0,2}:" + v4Str + "|(:" + v6Seg + "){1,4}|:)|") +
    ("(?:" + v6Seg + ":){2}(?:(:" + v6Seg + "){0,3}:" + v4Str + "|(:" + v6Seg + "){1,5}|:)|") +
    ("(?:" + v6Seg + ":){1}(?:(:" + v6Seg + "){0,4}:" + v4Str + "|(:" + v6Seg + "){1,6}|:)|") +
    ("(?::((?::" + v6Seg + "){0,5}:" + v4Str + "|(?::" + v6Seg + "){1,7}|:))") +
    ')(%[0-9a-zA-Z]{1,})?$');
/**
 * Returns true if the string represents an IPv4 address. Matches Node.js net.isIPv4
 * functionality.
 */
function isIPv4(s) {
    return IPv4Reg.test(s);
}
exports.isIPv4 = isIPv4;
/**
 * Returns true if the string represents an IPv6 address. Matches Node.js net.isIPv6
 * functionality.
 */
function isIPv6(s) {
    return IPv6Reg.test(s);
}
exports.isIPv6 = isIPv6;

},{}]},{},[1]);
