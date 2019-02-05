import * as net from 'net';

// Note: Profiling shows that on recent versions of Node, string.split(RegExp) is faster
// than string.split(string).
const dot = /\./;
const mappedIpv4 = /^(.+:ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:%.+)?$/;
const colon = /:/;
const doubleColon = /::/;

/**
 * Given a mapped IPv4 address (e.g. ::ffff:203.0.113.38 or similar), convert it to the
 * equivalent standard IPv6 address.
 * @param ip the IPv4-to-IPv6 mapped address
 */
function mappedIpv4ToIpv6(ip: string) {
  const matches = ip.match(mappedIpv4);

  if (!matches || !net.isIPv4(matches[2])) {
    throw new Error(`not a mapped IPv4 address: ${ip}`);
  }

  // mapped IPv4 address
  const prefix = matches[1];
  const ipv4 = matches[2];

  const parts = ipv4.split(dot).map(x => parseInt(x, 10));

  const segment7 = ((parts[0] << 8) + parts[1]).toString(16);
  const segment8 = ((parts[2] << 8) + parts[3]).toString(16);

  return `${prefix}${segment7}:${segment8}`;
}

/**
 * Given a mapped IPv4 address, return the bare IPv4 equivalent.
 */
export function extractMappedIpv4(ip: string) {
  const matches = ip.match(mappedIpv4);

  if (!matches || !net.isIPv4(matches[2])) {
    throw new Error(`not a mapped IPv4 address: ${ip}`);
  }

  return matches[2];
}

/**
 * Given an IP address that may have double-colons, expand all segments and return them
 * as an array of 8 segments (16-bit words). As a peformance enhancement (indicated by
 * profiling), for any segment that was missing but should be a '0', returns undefined.
 * @param ip the IPv6 address to expand
 * @throws if the string is not a valid IPv6 address
 */
function getIpv6Segments(ip: string): string[] {
  if (!net.isIPv6(ip)) {
    throw new Error(`not a valid IPv6 address: ${ip}`);
  }

  if (dot.test(ip)) {
    return getIpv6Segments(mappedIpv4ToIpv6(ip));
  }

  // break it into an array, including missing "::" segments
  const parts = ip.split(doubleColon);
  const beforeChunk = parts[0];
  const afterChunk = parts[1];

  const beforeParts = (beforeChunk && beforeChunk.split(colon)) || [];
  const afterParts = (afterChunk && afterChunk.split(colon)) || [];
  const missingSegments = new Array<string>(8 - (beforeParts.length + afterParts.length));

  return beforeParts.concat(missingSegments, afterParts);
}

/**
 * Test if the given IPv6 address is contained in the specified subnet.
 * @param address the IPv6 address to check
 * @param subnet the IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function isInSubnet(address: string, subnetOrSubnets: string | string[]): boolean {
  if (Array.isArray(subnetOrSubnets)) {
    return subnetOrSubnets.some(subnet => isInSubnet(address, subnet));
  }

  const subnet = subnetOrSubnets;

  const parts = subnet.split('/');
  const subnetAddress = parts[0];
  const prefixLengthString = parts[1];
  const prefixLength = parseInt(prefixLengthString, 10);

  if (!subnetAddress || !Number.isInteger(prefixLength)) {
    throw new Error(`not a valid IPv6 CIDR subnet: ${subnet}`);
  }

  if (prefixLength < 0 || prefixLength > 128) {
    throw new Error(`not a valid IPv6 prefix length: ${prefixLength} (from ${subnet})`);
  }

  // the next two lines throw if the addresses are not valid IPv6 addresses
  const addressSegments = getIpv6Segments(address);
  const subnetSegments = getIpv6Segments(subnetAddress);

  for (let i = 0; i < 8; ++i) {
    const bitCount = Math.min(prefixLength - i * 16, 16);

    if (bitCount <= 0) {
      break;
    }

    const subnetPrefix =
      ((subnetSegments[i] && parseInt(subnetSegments[i], 16)) || 0) >> (16 - bitCount);

    const addressPrefix =
      ((addressSegments[i] && parseInt(addressSegments[i], 16)) || 0) >> (16 - bitCount);

    if (subnetPrefix !== addressPrefix) {
      return false;
    }
  }

  return true;
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(address: string) {
  return isInSubnet(address, [
    'fe80::/10', // link-local address
    'fc00::/7' // unique local address
  ]);
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(address: string) {
  return isInSubnet(address, '::1/128');
}

/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
export function isIPv4MappedAddress(address: string) {
  return isInSubnet(address, '::ffff:0:0/96');
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(address: string) {
  return isInSubnet(address, [
    '::/128', // unspecified address
    '64:ff9b::/96', // IPv4/IPv6 translation
    '100::/64', // discard prefix
    '2001::/32', // Teredo tunneling
    '2001:10::/28', // deprecated
    '2001:20::/28', // ORCHIDv2
    '2001:db8::/32', // for documentation and examples
    '2002::/16', // 6to4
    'ff00::/8' // multicast
  ]);
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export function isSpecial(address: string) {
  return isPrivate(address) || isLocalhost(address) || isReserved(address);
}
