(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.isInSubnet = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
exports.check = isInSubnet;

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

},{}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJidWlsZC9zcmMvaW5kZXguanMiLCJidWlsZC9zcmMvaXB2NC5qcyIsImJ1aWxkL3NyYy9pcHY2LmpzIiwiYnVpbGQvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG52YXIgSVB2NCA9IHJlcXVpcmUoXCIuL2lwdjRcIik7XG5leHBvcnRzLklQdjQgPSBJUHY0O1xudmFyIElQdjYgPSByZXF1aXJlKFwiLi9pcHY2XCIpO1xuZXhwb3J0cy5JUHY2ID0gSVB2NjtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbi8qKlxuICogVGVzdCBpZiB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyBpcyBjb250YWluZWQgaW4gdGhlIHNwZWNpZmllZCBzdWJuZXQuXG4gKiBAcGFyYW0gYWRkcmVzcyB0aGUgSVB2NCBvciBJUHY2IGFkZHJlc3MgdG8gY2hlY2tcbiAqIEBwYXJhbSBzdWJuZXQgdGhlIElQdjQgb3IgSVB2NiBDSURSIHRvIHRlc3QgKG9yIGFuIGFycmF5IG9mIHRoZW0pXG4gKiBAdGhyb3dzIGlmIHRoZSBhZGRyZXNzIG9yIHN1Ym5ldCBhcmUgbm90IHZhbGlkIElQIGFkZHJlc3Nlcywgb3IgdGhlIENJRFIgcHJlZml4IGxlbmd0aFxuICogIGlzIG5vdCB2YWxpZFxuICovXG5mdW5jdGlvbiBpc0luU3VibmV0KGFkZHJlc3MsIHN1Ym5ldE9yU3VibmV0cykge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShzdWJuZXRPclN1Ym5ldHMpKSB7XG4gICAgICAgIHJldHVybiBpc0luU3VibmV0KGFkZHJlc3MsIFtzdWJuZXRPclN1Ym5ldHNdKTtcbiAgICB9XG4gICAgLy8gZm9yIG1hcHBlZCBJUHY0IGFkZHJlc3NlcywgY29tcGFyZSBhZ2FpbnN0IGJvdGggSVB2NiBhbmQgSVB2NCBzdWJuZXRzXG4gICAgaWYgKHV0aWwuaXNJUHY2KGFkZHJlc3MpICYmIElQdjYuaXNJUHY0TWFwcGVkQWRkcmVzcyhhZGRyZXNzKSkge1xuICAgICAgICByZXR1cm4gKElQdjYuaXNJblN1Ym5ldChhZGRyZXNzLCBzdWJuZXRPclN1Ym5ldHMuZmlsdGVyKGZ1bmN0aW9uIChzdWJuZXQpIHsgcmV0dXJuIHV0aWwuaXNJUHY2KHN1Ym5ldC5zcGxpdCgnLycpWzBdKTsgfSkpIHx8XG4gICAgICAgICAgICBJUHY0LmlzSW5TdWJuZXQoSVB2Ni5leHRyYWN0TWFwcGVkSXB2NChhZGRyZXNzKSwgc3VibmV0T3JTdWJuZXRzLmZpbHRlcihmdW5jdGlvbiAoc3VibmV0KSB7IHJldHVybiB1dGlsLmlzSVB2NChzdWJuZXQuc3BsaXQoJy8nKVswXSk7IH0pKSk7XG4gICAgfVxuICAgIGlmICh1dGlsLmlzSVB2NihhZGRyZXNzKSkge1xuICAgICAgICByZXR1cm4gSVB2Ni5pc0luU3VibmV0KGFkZHJlc3MsIHN1Ym5ldE9yU3VibmV0cy5maWx0ZXIoZnVuY3Rpb24gKHN1Ym5ldCkgeyByZXR1cm4gdXRpbC5pc0lQdjYoc3VibmV0LnNwbGl0KCcvJylbMF0pOyB9KSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gSVB2NC5pc0luU3VibmV0KGFkZHJlc3MsIHN1Ym5ldE9yU3VibmV0cy5maWx0ZXIoZnVuY3Rpb24gKHN1Ym5ldCkgeyByZXR1cm4gdXRpbC5pc0lQdjQoc3VibmV0LnNwbGl0KCcvJylbMF0pOyB9KSk7XG4gICAgfVxufVxuZXhwb3J0cy5pc0luU3VibmV0ID0gaXNJblN1Ym5ldDtcbi8qKiBUZXN0IGlmIHRoZSBnaXZlbiBJUCBhZGRyZXNzIGlzIGEgcHJpdmF0ZS9pbnRlcm5hbCBJUCBhZGRyZXNzLiAqL1xuZnVuY3Rpb24gaXNQcml2YXRlKGFkZHJlc3MpIHtcbiAgICBpZiAodXRpbC5pc0lQdjYoYWRkcmVzcykpIHtcbiAgICAgICAgaWYgKElQdjYuaXNJUHY0TWFwcGVkQWRkcmVzcyhhZGRyZXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuIElQdjQuaXNQcml2YXRlKElQdjYuZXh0cmFjdE1hcHBlZElwdjQoYWRkcmVzcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBJUHY2LmlzUHJpdmF0ZShhZGRyZXNzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBJUHY0LmlzUHJpdmF0ZShhZGRyZXNzKTtcbiAgICB9XG59XG5leHBvcnRzLmlzUHJpdmF0ZSA9IGlzUHJpdmF0ZTtcbi8qKiBUZXN0IGlmIHRoZSBnaXZlbiBJUCBhZGRyZXNzIGlzIGEgbG9jYWxob3N0IGFkZHJlc3MuICovXG5mdW5jdGlvbiBpc0xvY2FsaG9zdChhZGRyZXNzKSB7XG4gICAgaWYgKHV0aWwuaXNJUHY2KGFkZHJlc3MpKSB7XG4gICAgICAgIGlmIChJUHY2LmlzSVB2NE1hcHBlZEFkZHJlc3MoYWRkcmVzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBJUHY0LmlzTG9jYWxob3N0KElQdjYuZXh0cmFjdE1hcHBlZElwdjQoYWRkcmVzcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBJUHY2LmlzTG9jYWxob3N0KGFkZHJlc3MpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIElQdjQuaXNMb2NhbGhvc3QoYWRkcmVzcyk7XG4gICAgfVxufVxuZXhwb3J0cy5pc0xvY2FsaG9zdCA9IGlzTG9jYWxob3N0O1xuLyoqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYW4gSVB2NCBhZGRyZXNzIG1hcHBlZCBvbnRvIElQdjYgKi9cbmZ1bmN0aW9uIGlzSVB2NE1hcHBlZEFkZHJlc3MoYWRkcmVzcykge1xuICAgIGlmICh1dGlsLmlzSVB2NihhZGRyZXNzKSkge1xuICAgICAgICByZXR1cm4gSVB2Ni5pc0lQdjRNYXBwZWRBZGRyZXNzKGFkZHJlc3MpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbmV4cG9ydHMuaXNJUHY0TWFwcGVkQWRkcmVzcyA9IGlzSVB2NE1hcHBlZEFkZHJlc3M7XG4vKiogVGVzdCBpZiB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyBpcyBpbiBhIGtub3duIHJlc2VydmVkIHJhbmdlIGFuZCBub3QgYSBub3JtYWwgaG9zdCBJUCAqL1xuZnVuY3Rpb24gaXNSZXNlcnZlZChhZGRyZXNzKSB7XG4gICAgaWYgKHV0aWwuaXNJUHY2KGFkZHJlc3MpKSB7XG4gICAgICAgIGlmIChJUHY2LmlzSVB2NE1hcHBlZEFkZHJlc3MoYWRkcmVzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBJUHY0LmlzUmVzZXJ2ZWQoSVB2Ni5leHRyYWN0TWFwcGVkSXB2NChhZGRyZXNzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIElQdjYuaXNSZXNlcnZlZChhZGRyZXNzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBJUHY0LmlzUmVzZXJ2ZWQoYWRkcmVzcyk7XG4gICAgfVxufVxuZXhwb3J0cy5pc1Jlc2VydmVkID0gaXNSZXNlcnZlZDtcbi8qKlxuICogVGVzdCBpZiB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyBpcyBhIHNwZWNpYWwgYWRkcmVzcyBvZiBhbnkga2luZCAocHJpdmF0ZSwgcmVzZXJ2ZWQsXG4gKiBsb2NhbGhvc3QpXG4gKi9cbmZ1bmN0aW9uIGlzU3BlY2lhbChhZGRyZXNzKSB7XG4gICAgaWYgKHV0aWwuaXNJUHY2KGFkZHJlc3MpKSB7XG4gICAgICAgIGlmIChJUHY2LmlzSVB2NE1hcHBlZEFkZHJlc3MoYWRkcmVzcykpIHtcbiAgICAgICAgICAgIHJldHVybiBJUHY0LmlzU3BlY2lhbChJUHY2LmV4dHJhY3RNYXBwZWRJcHY0KGFkZHJlc3MpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSVB2Ni5pc1NwZWNpYWwoYWRkcmVzcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gSVB2NC5pc1NwZWNpYWwoYWRkcmVzcyk7XG4gICAgfVxufVxuZXhwb3J0cy5pc1NwZWNpYWwgPSBpc1NwZWNpYWw7XG5leHBvcnRzLmNoZWNrID0gaXNJblN1Ym5ldDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCIsIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuLyoqXG4gKiBHaXZlbiBhbiBJUHY0IGFkZHJlc3MsIGNvbnZlcnQgaXQgdG8gYSAzMi1iaXQgbG9uZyBpbnRlZ2VyLlxuICogQHBhcmFtIGlwIHRoZSBJUHY0IGFkZHJlc3MgdG8gZXhwYW5kXG4gKiBAdGhyb3dzIGlmIHRoZSBzdHJpbmcgaXMgbm90IGEgdmFsaWQgSVB2NCBhZGRyZXNzXG4gKi9cbmZ1bmN0aW9uIGlwdjRUb0xvbmcoaXApIHtcbiAgICBpZiAoIXV0aWwuaXNJUHY0KGlwKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSB2YWxpZCBJUHY0IGFkZHJlc3M6IFwiICsgaXApO1xuICAgIH1cbiAgICB2YXIgb2N0ZXRzID0gaXAuc3BsaXQoJy4nKTtcbiAgICByZXR1cm4gKCgocGFyc2VJbnQob2N0ZXRzWzBdLCAxMCkgPDwgMjQpICtcbiAgICAgICAgKHBhcnNlSW50KG9jdGV0c1sxXSwgMTApIDw8IDE2KSArXG4gICAgICAgIChwYXJzZUludChvY3RldHNbMl0sIDEwKSA8PCA4KSArXG4gICAgICAgIHBhcnNlSW50KG9jdGV0c1szXSwgMTApKSA+Pj5cbiAgICAgICAgMCk7XG59XG4vKipcbiAqIFRlc3QgaWYgdGhlIGdpdmVuIElQdjQgYWRkcmVzcyBpcyBjb250YWluZWQgaW4gdGhlIHNwZWNpZmllZCBzdWJuZXQuXG4gKiBAcGFyYW0gYWRkcmVzcyB0aGUgSVB2NCBhZGRyZXNzIHRvIGNoZWNrXG4gKiBAcGFyYW0gc3VibmV0IHRoZSBJUHY0IENJRFIgdG8gdGVzdCAob3IgYW4gYXJyYXkgb2YgdGhlbSlcbiAqIEB0aHJvd3MgaWYgdGhlIGFkZHJlc3Mgb3Igc3VibmV0IGFyZSBub3QgdmFsaWQgSVAgYWRkcmVzc2VzLCBvciB0aGUgQ0lEUiBwcmVmaXggbGVuZ3RoXG4gKiAgaXMgbm90IHZhbGlkXG4gKi9cbmZ1bmN0aW9uIGlzSW5TdWJuZXQoYWRkcmVzcywgc3VibmV0T3JTdWJuZXRzKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoc3VibmV0T3JTdWJuZXRzKSkge1xuICAgICAgICByZXR1cm4gc3VibmV0T3JTdWJuZXRzLnNvbWUoZnVuY3Rpb24gKHN1Ym5ldCkgeyByZXR1cm4gaXNJblN1Ym5ldChhZGRyZXNzLCBzdWJuZXQpOyB9KTtcbiAgICB9XG4gICAgdmFyIHN1Ym5ldCA9IHN1Ym5ldE9yU3VibmV0cztcbiAgICB2YXIgX2EgPSBzdWJuZXQuc3BsaXQoJy8nKSwgc3VibmV0QWRkcmVzcyA9IF9hWzBdLCBwcmVmaXhMZW5ndGhTdHJpbmcgPSBfYVsxXTtcbiAgICB2YXIgcHJlZml4TGVuZ3RoID0gcGFyc2VJbnQocHJlZml4TGVuZ3RoU3RyaW5nLCAxMCk7XG4gICAgaWYgKCFzdWJuZXRBZGRyZXNzIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHByZWZpeExlbmd0aCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IGEgdmFsaWQgSVB2NCBzdWJuZXQ6IFwiICsgc3VibmV0KTtcbiAgICB9XG4gICAgaWYgKHByZWZpeExlbmd0aCA8IDAgfHwgcHJlZml4TGVuZ3RoID4gMzIpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IGEgdmFsaWQgSVB2NCBwcmVmaXggbGVuZ3RoOiBcIiArIHByZWZpeExlbmd0aCArIFwiIChmcm9tIFwiICsgc3VibmV0ICsgXCIpXCIpO1xuICAgIH1cbiAgICAvLyB0aGUgbmV4dCB0d28gbGluZXMgdGhyb3cgaWYgdGhlIGFkZHJlc3NlcyBhcmUgbm90IHZhbGlkIElQdjQgYWRkcmVzc2VzXG4gICAgdmFyIHN1Ym5ldExvbmcgPSBpcHY0VG9Mb25nKHN1Ym5ldEFkZHJlc3MpO1xuICAgIHZhciBhZGRyZXNzTG9uZyA9IGlwdjRUb0xvbmcoYWRkcmVzcyk7XG4gICAgaWYgKHByZWZpeExlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIHN1Ym5ldFByZWZpeCA9IHN1Ym5ldExvbmcgPj4gKDMyIC0gcHJlZml4TGVuZ3RoKTtcbiAgICB2YXIgYWRkcmVzc1ByZWZpeCA9IGFkZHJlc3NMb25nID4+ICgzMiAtIHByZWZpeExlbmd0aCk7XG4gICAgcmV0dXJuIHN1Ym5ldFByZWZpeCA9PT0gYWRkcmVzc1ByZWZpeDtcbn1cbmV4cG9ydHMuaXNJblN1Ym5ldCA9IGlzSW5TdWJuZXQ7XG4vKiogVGVzdCBpZiB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyBpcyBhIHByaXZhdGUvaW50ZXJuYWwgSVAgYWRkcmVzcy4gKi9cbmZ1bmN0aW9uIGlzUHJpdmF0ZShhZGRyZXNzKSB7XG4gICAgcmV0dXJuIGlzSW5TdWJuZXQoYWRkcmVzcywgWycxMC4wLjAuMC84JywgJzE3Mi4xNi4wLjAvMTInLCAnMTkyLjE2OC4wLjAvMTYnXSk7XG59XG5leHBvcnRzLmlzUHJpdmF0ZSA9IGlzUHJpdmF0ZTtcbi8qKiBUZXN0IGlmIHRoZSBnaXZlbiBJUCBhZGRyZXNzIGlzIGEgbG9jYWxob3N0IGFkZHJlc3MuICovXG5mdW5jdGlvbiBpc0xvY2FsaG9zdChhZGRyZXNzKSB7XG4gICAgcmV0dXJuIGlzSW5TdWJuZXQoYWRkcmVzcywgJzEyNy4wLjAuMC84Jyk7XG59XG5leHBvcnRzLmlzTG9jYWxob3N0ID0gaXNMb2NhbGhvc3Q7XG4vKiogVGVzdCBpZiB0aGUgZ2l2ZW4gSVAgYWRkcmVzcyBpcyBpbiBhIGtub3duIHJlc2VydmVkIHJhbmdlIGFuZCBub3QgYSBub3JtYWwgaG9zdCBJUCAqL1xuZnVuY3Rpb24gaXNSZXNlcnZlZChhZGRyZXNzKSB7XG4gICAgcmV0dXJuIGlzSW5TdWJuZXQoYWRkcmVzcywgW1xuICAgICAgICAnMC4wLjAuMC84JyxcbiAgICAgICAgJzEwMC42NC4wLjAvMTAnLFxuICAgICAgICAnMTY5LjI1NC4wLjAvMTYnLFxuICAgICAgICAnMTkyLjAuMC4wLzI0JyxcbiAgICAgICAgJzE5Mi4wLjIuMC8yNCcsXG4gICAgICAgICcxOTIuODguOTkuMC8yNCcsXG4gICAgICAgICcxOTguMTguMC4wLzE1JyxcbiAgICAgICAgJzE5OC41MS4xMDAuMC8yNCcsXG4gICAgICAgICcyMDMuMC4xMTMuMC8yNCcsXG4gICAgICAgICcyMjQuMC4wLjAvNCcsXG4gICAgICAgICcyNDAuMC4wLjAvNCcsXG4gICAgICAgICcyNTUuMjU1LjI1NS4yNTUvMzInIC8vIGxpbWl0ZWQgYnJvYWRjYXN0IGFkZHJlc3NcbiAgICBdKTtcbn1cbmV4cG9ydHMuaXNSZXNlcnZlZCA9IGlzUmVzZXJ2ZWQ7XG4vKipcbiAqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYSBzcGVjaWFsIGFkZHJlc3Mgb2YgYW55IGtpbmQgKHByaXZhdGUsIHJlc2VydmVkLFxuICogbG9jYWxob3N0KVxuICovXG5mdW5jdGlvbiBpc1NwZWNpYWwoYWRkcmVzcykge1xuICAgIHJldHVybiBpc1ByaXZhdGUoYWRkcmVzcykgfHwgaXNMb2NhbGhvc3QoYWRkcmVzcykgfHwgaXNSZXNlcnZlZChhZGRyZXNzKTtcbn1cbmV4cG9ydHMuaXNTcGVjaWFsID0gaXNTcGVjaWFsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXB2NC5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKTtcbi8vIE5vdGU6IFByb2ZpbGluZyBzaG93cyB0aGF0IG9uIHJlY2VudCB2ZXJzaW9ucyBvZiBOb2RlLCBzdHJpbmcuc3BsaXQoUmVnRXhwKSBpcyBmYXN0ZXJcbi8vIHRoYW4gc3RyaW5nLnNwbGl0KHN0cmluZykuXG52YXIgZG90ID0gL1xcLi87XG52YXIgbWFwcGVkSXB2NCA9IC9eKC4rOmZmZmY6KShcXGR7MSwzfVxcLlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfSkoPzolLispPyQvO1xudmFyIGNvbG9uID0gLzovO1xudmFyIGRvdWJsZUNvbG9uID0gLzo6Lztcbi8qKlxuICogR2l2ZW4gYSBtYXBwZWQgSVB2NCBhZGRyZXNzIChlLmcuIDo6ZmZmZjoyMDMuMC4xMTMuMzggb3Igc2ltaWxhciksIGNvbnZlcnQgaXQgdG8gdGhlXG4gKiBlcXVpdmFsZW50IHN0YW5kYXJkIElQdjYgYWRkcmVzcy5cbiAqIEBwYXJhbSBpcCB0aGUgSVB2NC10by1JUHY2IG1hcHBlZCBhZGRyZXNzXG4gKi9cbmZ1bmN0aW9uIG1hcHBlZElwdjRUb0lwdjYoaXApIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGlwLm1hdGNoKG1hcHBlZElwdjQpO1xuICAgIGlmICghbWF0Y2hlcyB8fCAhdXRpbC5pc0lQdjQobWF0Y2hlc1syXSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwibm90IGEgbWFwcGVkIElQdjQgYWRkcmVzczogXCIgKyBpcCk7XG4gICAgfVxuICAgIC8vIG1hcHBlZCBJUHY0IGFkZHJlc3NcbiAgICB2YXIgcHJlZml4ID0gbWF0Y2hlc1sxXTtcbiAgICB2YXIgaXB2NCA9IG1hdGNoZXNbMl07XG4gICAgdmFyIHBhcnRzID0gaXB2NC5zcGxpdChkb3QpLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4gcGFyc2VJbnQoeCwgMTApOyB9KTtcbiAgICB2YXIgc2VnbWVudDcgPSAoKHBhcnRzWzBdIDw8IDgpICsgcGFydHNbMV0pLnRvU3RyaW5nKDE2KTtcbiAgICB2YXIgc2VnbWVudDggPSAoKHBhcnRzWzJdIDw8IDgpICsgcGFydHNbM10pLnRvU3RyaW5nKDE2KTtcbiAgICByZXR1cm4gXCJcIiArIHByZWZpeCArIHNlZ21lbnQ3ICsgXCI6XCIgKyBzZWdtZW50ODtcbn1cbi8qKlxuICogR2l2ZW4gYSBtYXBwZWQgSVB2NCBhZGRyZXNzLCByZXR1cm4gdGhlIGJhcmUgSVB2NCBlcXVpdmFsZW50LlxuICovXG5mdW5jdGlvbiBleHRyYWN0TWFwcGVkSXB2NChpcCkge1xuICAgIHZhciBtYXRjaGVzID0gaXAubWF0Y2gobWFwcGVkSXB2NCk7XG4gICAgaWYgKCFtYXRjaGVzIHx8ICF1dGlsLmlzSVB2NChtYXRjaGVzWzJdKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSBtYXBwZWQgSVB2NCBhZGRyZXNzOiBcIiArIGlwKTtcbiAgICB9XG4gICAgcmV0dXJuIG1hdGNoZXNbMl07XG59XG5leHBvcnRzLmV4dHJhY3RNYXBwZWRJcHY0ID0gZXh0cmFjdE1hcHBlZElwdjQ7XG4vKipcbiAqIEdpdmVuIGFuIElQIGFkZHJlc3MgdGhhdCBtYXkgaGF2ZSBkb3VibGUtY29sb25zLCBleHBhbmQgYWxsIHNlZ21lbnRzIGFuZCByZXR1cm4gdGhlbVxuICogYXMgYW4gYXJyYXkgb2YgOCBzZWdtZW50cyAoMTYtYml0IHdvcmRzKS4gQXMgYSBwZWZvcm1hbmNlIGVuaGFuY2VtZW50IChpbmRpY2F0ZWQgYnlcbiAqIHByb2ZpbGluZyksIGZvciBhbnkgc2VnbWVudCB0aGF0IHdhcyBtaXNzaW5nIGJ1dCBzaG91bGQgYmUgYSAnMCcsIHJldHVybnMgdW5kZWZpbmVkLlxuICogQHBhcmFtIGlwIHRoZSBJUHY2IGFkZHJlc3MgdG8gZXhwYW5kXG4gKiBAdGhyb3dzIGlmIHRoZSBzdHJpbmcgaXMgbm90IGEgdmFsaWQgSVB2NiBhZGRyZXNzXG4gKi9cbmZ1bmN0aW9uIGdldElwdjZTZWdtZW50cyhpcCkge1xuICAgIGlmICghdXRpbC5pc0lQdjYoaXApKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIm5vdCBhIHZhbGlkIElQdjYgYWRkcmVzczogXCIgKyBpcCk7XG4gICAgfVxuICAgIGlmIChkb3QudGVzdChpcCkpIHtcbiAgICAgICAgcmV0dXJuIGdldElwdjZTZWdtZW50cyhtYXBwZWRJcHY0VG9JcHY2KGlwKSk7XG4gICAgfVxuICAgIC8vIGJyZWFrIGl0IGludG8gYW4gYXJyYXksIGluY2x1ZGluZyBtaXNzaW5nIFwiOjpcIiBzZWdtZW50c1xuICAgIHZhciBfYSA9IGlwLnNwbGl0KGRvdWJsZUNvbG9uKSwgYmVmb3JlQ2h1bmsgPSBfYVswXSwgYWZ0ZXJDaHVuayA9IF9hWzFdO1xuICAgIHZhciBiZWZvcmVQYXJ0cyA9IChiZWZvcmVDaHVuayAmJiBiZWZvcmVDaHVuay5zcGxpdChjb2xvbikpIHx8IFtdO1xuICAgIHZhciBhZnRlclBhcnRzID0gKGFmdGVyQ2h1bmsgJiYgYWZ0ZXJDaHVuay5zcGxpdChjb2xvbikpIHx8IFtdO1xuICAgIHZhciBtaXNzaW5nU2VnbWVudHMgPSBuZXcgQXJyYXkoOCAtIChiZWZvcmVQYXJ0cy5sZW5ndGggKyBhZnRlclBhcnRzLmxlbmd0aCkpO1xuICAgIHJldHVybiBiZWZvcmVQYXJ0cy5jb25jYXQobWlzc2luZ1NlZ21lbnRzLCBhZnRlclBhcnRzKTtcbn1cbi8qKlxuICogVGVzdCBpZiB0aGUgZ2l2ZW4gSVB2NiBhZGRyZXNzIGlzIGNvbnRhaW5lZCBpbiB0aGUgc3BlY2lmaWVkIHN1Ym5ldC5cbiAqIEBwYXJhbSBhZGRyZXNzIHRoZSBJUHY2IGFkZHJlc3MgdG8gY2hlY2tcbiAqIEBwYXJhbSBzdWJuZXQgdGhlIElQdjYgQ0lEUiB0byB0ZXN0IChvciBhbiBhcnJheSBvZiB0aGVtKVxuICogQHRocm93cyBpZiB0aGUgYWRkcmVzcyBvciBzdWJuZXQgYXJlIG5vdCB2YWxpZCBJUCBhZGRyZXNzZXMsIG9yIHRoZSBDSURSIHByZWZpeCBsZW5ndGhcbiAqICBpcyBub3QgdmFsaWRcbiAqL1xuZnVuY3Rpb24gaXNJblN1Ym5ldChhZGRyZXNzLCBzdWJuZXRPclN1Ym5ldHMpIHtcbiAgICBpZiAoQXJyYXkuaXNBcnJheShzdWJuZXRPclN1Ym5ldHMpKSB7XG4gICAgICAgIHJldHVybiBzdWJuZXRPclN1Ym5ldHMuc29tZShmdW5jdGlvbiAoc3VibmV0KSB7IHJldHVybiBpc0luU3VibmV0KGFkZHJlc3MsIHN1Ym5ldCk7IH0pO1xuICAgIH1cbiAgICB2YXIgc3VibmV0ID0gc3VibmV0T3JTdWJuZXRzO1xuICAgIHZhciBfYSA9IHN1Ym5ldC5zcGxpdCgnLycpLCBzdWJuZXRBZGRyZXNzID0gX2FbMF0sIHByZWZpeExlbmd0aFN0cmluZyA9IF9hWzFdO1xuICAgIHZhciBwcmVmaXhMZW5ndGggPSBwYXJzZUludChwcmVmaXhMZW5ndGhTdHJpbmcsIDEwKTtcbiAgICBpZiAoIXN1Ym5ldEFkZHJlc3MgfHwgIU51bWJlci5pc0ludGVnZXIocHJlZml4TGVuZ3RoKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSB2YWxpZCBJUHY2IENJRFIgc3VibmV0OiBcIiArIHN1Ym5ldCk7XG4gICAgfVxuICAgIGlmIChwcmVmaXhMZW5ndGggPCAwIHx8IHByZWZpeExlbmd0aCA+IDEyOCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJub3QgYSB2YWxpZCBJUHY2IHByZWZpeCBsZW5ndGg6IFwiICsgcHJlZml4TGVuZ3RoICsgXCIgKGZyb20gXCIgKyBzdWJuZXQgKyBcIilcIik7XG4gICAgfVxuICAgIC8vIHRoZSBuZXh0IHR3byBsaW5lcyB0aHJvdyBpZiB0aGUgYWRkcmVzc2VzIGFyZSBub3QgdmFsaWQgSVB2NiBhZGRyZXNzZXNcbiAgICB2YXIgYWRkcmVzc1NlZ21lbnRzID0gZ2V0SXB2NlNlZ21lbnRzKGFkZHJlc3MpO1xuICAgIHZhciBzdWJuZXRTZWdtZW50cyA9IGdldElwdjZTZWdtZW50cyhzdWJuZXRBZGRyZXNzKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7ICsraSkge1xuICAgICAgICB2YXIgYml0Q291bnQgPSBNYXRoLm1pbihwcmVmaXhMZW5ndGggLSBpICogMTYsIDE2KTtcbiAgICAgICAgaWYgKGJpdENvdW50IDw9IDApIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdWJuZXRQcmVmaXggPSAoKHN1Ym5ldFNlZ21lbnRzW2ldICYmIHBhcnNlSW50KHN1Ym5ldFNlZ21lbnRzW2ldLCAxNikpIHx8IDApID4+ICgxNiAtIGJpdENvdW50KTtcbiAgICAgICAgdmFyIGFkZHJlc3NQcmVmaXggPSAoKGFkZHJlc3NTZWdtZW50c1tpXSAmJiBwYXJzZUludChhZGRyZXNzU2VnbWVudHNbaV0sIDE2KSkgfHwgMCkgPj4gKDE2IC0gYml0Q291bnQpO1xuICAgICAgICBpZiAoc3VibmV0UHJlZml4ICE9PSBhZGRyZXNzUHJlZml4KSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5leHBvcnRzLmlzSW5TdWJuZXQgPSBpc0luU3VibmV0O1xuLyoqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYSBwcml2YXRlL2ludGVybmFsIElQIGFkZHJlc3MuICovXG5mdW5jdGlvbiBpc1ByaXZhdGUoYWRkcmVzcykge1xuICAgIHJldHVybiBpc0luU3VibmV0KGFkZHJlc3MsIFtcbiAgICAgICAgJ2ZlODA6Oi8xMCcsXG4gICAgICAgICdmYzAwOjovNycgLy8gdW5pcXVlIGxvY2FsIGFkZHJlc3NcbiAgICBdKTtcbn1cbmV4cG9ydHMuaXNQcml2YXRlID0gaXNQcml2YXRlO1xuLyoqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYSBsb2NhbGhvc3QgYWRkcmVzcy4gKi9cbmZ1bmN0aW9uIGlzTG9jYWxob3N0KGFkZHJlc3MpIHtcbiAgICByZXR1cm4gaXNJblN1Ym5ldChhZGRyZXNzLCAnOjoxLzEyOCcpO1xufVxuZXhwb3J0cy5pc0xvY2FsaG9zdCA9IGlzTG9jYWxob3N0O1xuLyoqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYW4gSVB2NCBhZGRyZXNzIG1hcHBlZCBvbnRvIElQdjYgKi9cbmZ1bmN0aW9uIGlzSVB2NE1hcHBlZEFkZHJlc3MoYWRkcmVzcykge1xuICAgIGlmIChpc0luU3VibmV0KGFkZHJlc3MsICc6OmZmZmY6MDowLzk2JykpIHtcbiAgICAgICAgdmFyIG1hdGNoZXMgPSBhZGRyZXNzLm1hdGNoKG1hcHBlZElwdjQpO1xuICAgICAgICByZXR1cm4gQm9vbGVhbihtYXRjaGVzICYmIHV0aWwuaXNJUHY0KG1hdGNoZXNbMl0pKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZXhwb3J0cy5pc0lQdjRNYXBwZWRBZGRyZXNzID0gaXNJUHY0TWFwcGVkQWRkcmVzcztcbi8qKiBUZXN0IGlmIHRoZSBnaXZlbiBJUCBhZGRyZXNzIGlzIGluIGEga25vd24gcmVzZXJ2ZWQgcmFuZ2UgYW5kIG5vdCBhIG5vcm1hbCBob3N0IElQICovXG5mdW5jdGlvbiBpc1Jlc2VydmVkKGFkZHJlc3MpIHtcbiAgICByZXR1cm4gaXNJblN1Ym5ldChhZGRyZXNzLCBbXG4gICAgICAgICc6Oi8xMjgnLFxuICAgICAgICAnNjQ6ZmY5Yjo6Lzk2JyxcbiAgICAgICAgJzEwMDo6LzY0JyxcbiAgICAgICAgJzIwMDE6Oi8zMicsXG4gICAgICAgICcyMDAxOjEwOjovMjgnLFxuICAgICAgICAnMjAwMToyMDo6LzI4JyxcbiAgICAgICAgJzIwMDE6ZGI4OjovMzInLFxuICAgICAgICAnMjAwMjo6LzE2JyxcbiAgICAgICAgJ2ZmMDA6Oi84JyAvLyBtdWx0aWNhc3RcbiAgICBdKTtcbn1cbmV4cG9ydHMuaXNSZXNlcnZlZCA9IGlzUmVzZXJ2ZWQ7XG4vKipcbiAqIFRlc3QgaWYgdGhlIGdpdmVuIElQIGFkZHJlc3MgaXMgYSBzcGVjaWFsIGFkZHJlc3Mgb2YgYW55IGtpbmQgKHByaXZhdGUsIHJlc2VydmVkLFxuICogbG9jYWxob3N0KVxuICovXG5mdW5jdGlvbiBpc1NwZWNpYWwoYWRkcmVzcykge1xuICAgIHJldHVybiBpc1ByaXZhdGUoYWRkcmVzcykgfHwgaXNMb2NhbGhvc3QoYWRkcmVzcykgfHwgaXNSZXNlcnZlZChhZGRyZXNzKTtcbn1cbmV4cG9ydHMuaXNTcGVjaWFsID0gaXNTcGVjaWFsO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aXB2Ni5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbi8vIFJlZ0V4cCBmb3IgdGVzdGluZyBpZiBhIHN0cmluZyByZXByZXNlbnRzIGFuIElQdjQgYWRkcmVzc1xudmFyIHY0U2VnID0gJyg/OlswLTldfFsxLTldWzAtOV18MVswLTldWzAtOV18MlswLTRdWzAtOV18MjVbMC01XSknO1xudmFyIHY0U3RyID0gXCIoXCIgKyB2NFNlZyArIFwiWy5dKXszfVwiICsgdjRTZWc7XG52YXIgSVB2NFJlZyA9IG5ldyBSZWdFeHAoXCJeXCIgKyB2NFN0ciArIFwiJFwiKTtcbi8vIFJlZ0V4cCBmb3IgdGVzdGluZyBpZiBhIHN0cmluZyByZXByZXNlbnRzIGFuIElQdjYgYWRkcmVzc1xudmFyIHY2U2VnID0gJyg/OlswLTlhLWZBLUZdezEsNH0pJztcbnZhciBJUHY2UmVnID0gbmV3IFJlZ0V4cCgnXignICtcbiAgICAoXCIoPzpcIiArIHY2U2VnICsgXCI6KXs3fSg/OlwiICsgdjZTZWcgKyBcInw6KXxcIikgK1xuICAgIChcIig/OlwiICsgdjZTZWcgKyBcIjopezZ9KD86XCIgKyB2NFN0ciArIFwifDpcIiArIHY2U2VnICsgXCJ8Oil8XCIpICtcbiAgICAoXCIoPzpcIiArIHY2U2VnICsgXCI6KXs1fSg/OjpcIiArIHY0U3RyICsgXCJ8KDpcIiArIHY2U2VnICsgXCIpezEsMn18Oil8XCIpICtcbiAgICAoXCIoPzpcIiArIHY2U2VnICsgXCI6KXs0fSg/Oig6XCIgKyB2NlNlZyArIFwiKXswLDF9OlwiICsgdjRTdHIgKyBcInwoOlwiICsgdjZTZWcgKyBcIil7MSwzfXw6KXxcIikgK1xuICAgIChcIig/OlwiICsgdjZTZWcgKyBcIjopezN9KD86KDpcIiArIHY2U2VnICsgXCIpezAsMn06XCIgKyB2NFN0ciArIFwifCg6XCIgKyB2NlNlZyArIFwiKXsxLDR9fDopfFwiKSArXG4gICAgKFwiKD86XCIgKyB2NlNlZyArIFwiOil7Mn0oPzooOlwiICsgdjZTZWcgKyBcIil7MCwzfTpcIiArIHY0U3RyICsgXCJ8KDpcIiArIHY2U2VnICsgXCIpezEsNX18Oil8XCIpICtcbiAgICAoXCIoPzpcIiArIHY2U2VnICsgXCI6KXsxfSg/Oig6XCIgKyB2NlNlZyArIFwiKXswLDR9OlwiICsgdjRTdHIgKyBcInwoOlwiICsgdjZTZWcgKyBcIil7MSw2fXw6KXxcIikgK1xuICAgIChcIig/OjooKD86OlwiICsgdjZTZWcgKyBcIil7MCw1fTpcIiArIHY0U3RyICsgXCJ8KD86OlwiICsgdjZTZWcgKyBcIil7MSw3fXw6KSlcIikgK1xuICAgICcpKCVbMC05YS16QS1aXXsxLH0pPyQnKTtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgcmVwcmVzZW50cyBhbiBJUHY0IGFkZHJlc3MuIE1hdGNoZXMgTm9kZS5qcyBuZXQuaXNJUHY0XG4gKiBmdW5jdGlvbmFsaXR5LlxuICovXG5mdW5jdGlvbiBpc0lQdjQocykge1xuICAgIHJldHVybiBJUHY0UmVnLnRlc3Qocyk7XG59XG5leHBvcnRzLmlzSVB2NCA9IGlzSVB2NDtcbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzdHJpbmcgcmVwcmVzZW50cyBhbiBJUHY2IGFkZHJlc3MuIE1hdGNoZXMgTm9kZS5qcyBuZXQuaXNJUHY2XG4gKiBmdW5jdGlvbmFsaXR5LlxuICovXG5mdW5jdGlvbiBpc0lQdjYocykge1xuICAgIHJldHVybiBJUHY2UmVnLnRlc3Qocyk7XG59XG5leHBvcnRzLmlzSVB2NiA9IGlzSVB2Njtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWwuanMubWFwIl19
