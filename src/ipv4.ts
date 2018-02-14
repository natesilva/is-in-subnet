import * as net from 'net';
import { IpAddressError } from './error';

/**
 * Given an IPv4 address, convert it to a 32-bit long integer.
 * @param ip the IPv4 address to expand
 * @throws if the string is not a valid IPv4 address
 */
function ipv4ToLong(ip) {
  if (!net.isIPv4(ip)) {
    throw new IpAddressError(`not a valid IPv4 address: ${ip}`);
  }

  return (
    ip.split('.').reduce(function(ipInt, octet) {
      return (ipInt << 8) + parseInt(octet, 10);
    }, 0) >>> 0
  );
}

/**
 * Test if the given IPv4 address is contained in the specified subnet.
 * @param address the IPv4 address to check
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function isInSubnet(address: string, subnetOrSubnets: string | string[]) {
  if (Array.isArray(subnetOrSubnets)) {
    return subnetOrSubnets.some(subnet => isInSubnet(address, subnet));
  }

  const subnet = subnetOrSubnets;

  const [subnetAddress, prefixLengthString] = subnet.split('/');
  if (!subnetAddress || !Number.isInteger(parseInt(prefixLengthString, 10))) {
    throw new IpAddressError(`not a valid IPv4 subnet: ${subnet}`);
  }

  const prefixLength = parseInt(prefixLengthString, 10);
  if (prefixLength < 0 || prefixLength > 32) {
    throw new IpAddressError(
      `not a valid IPv4 prefix length: ${prefixLength} (from ${subnet})`
    );
  }

  const maskLong = parseInt('1'.repeat(prefixLength) + '0'.repeat(32 - prefixLength), 2);
  const mask = ipv4ToLong(subnetAddress) & maskLong;

  const long = ipv4ToLong(address);

  return (long & maskLong) === mask;
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(address: string) {
  return isInSubnet(address, ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']);
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(address: string) {
  return isInSubnet(address, '127.0.0.0/8');
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(address: string) {
  return isInSubnet(address, [
    '0.0.0.0/8', // broadcast "this"
    '100.64.0.0/10', // carrier-grade NAT
    '169.254.0.0/16', // DHCP fallback
    '192.0.0.0/24', // IANA Special Purpose Address Registry
    '192.0.2.0/24', // TEST-NET-1 for documentation examples
    '192.88.99.0/24', // deprecated 6to4 anycast relays
    '198.18.0.0/15', // for testing inter-network comms between two subnets
    '198.51.100.0/24', // TEST-NET-2 for documentation examples
    '203.0.113.0/24', // TEST-NET-3 for documentation examples
    '224.0.0.0/4', // multicast
    '240.0.0.0/4', // reserved unspecified
    '255.255.255.255/32' // limited broadcast address
  ]);
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export function isSpecial(address: string) {
  return isPrivate(address) || isLocalhost(address) || isReserved(address);
}
