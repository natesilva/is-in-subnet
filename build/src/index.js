"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const IPv4 = require("./ipv4");
exports.IPv4 = IPv4;
const IPv6 = require("./ipv6");
exports.IPv6 = IPv6;
/**
 * Test if the given IP address is contained in the specified subnet.
 * @param address the IPv4 or IPv6 address to check
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(address, subnetOrSubnets) {
    if (net.isIPv6(address)) {
        return IPv6.isInSubnet(address, subnetOrSubnets);
    }
    else {
        return IPv4.isInSubnet(address, subnetOrSubnets);
    }
}
exports.isInSubnet = isInSubnet;
/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address) {
    if (net.isIPv6(address)) {
        return IPv6.isPrivate(address);
    }
    else {
        return IPv4.isPrivate(address);
    }
}
exports.isPrivate = isPrivate;
/** Test if the given IP address is a localhost address. */
function isLocalhost(address) {
    if (net.isIPv6(address)) {
        return IPv6.isLocalhost(address);
    }
    else {
        return IPv4.isLocalhost(address);
    }
}
exports.isLocalhost = isLocalhost;
/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
function isIPv4MappedAddress(address) {
    if (net.isIPv6(address)) {
        return IPv6.isIPv4MappedAddress(address);
    }
    else {
        return false;
    }
}
exports.isIPv4MappedAddress = isIPv4MappedAddress;
/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address) {
    if (net.isIPv6(address)) {
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
    if (net.isIPv6(address)) {
        return IPv6.isSpecial(address);
    }
    else {
        return IPv4.isSpecial(address);
    }
}
exports.isSpecial = isSpecial;
//# sourceMappingURL=index.js.map