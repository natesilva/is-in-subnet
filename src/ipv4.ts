import * as util from './util';
import ipRange from './ipRange';

/**
 * Given an IPv4 address, convert it to a 32-bit long integer.
 * @param ip the IPv4 address to expand
 * @throws if the string is not a valid IPv4 address
 */
function ipv4ToLong(ip: string) {
  if (!util.isIPv4(ip)) {
    throw new Error(`not a valid IPv4 address: ${ip}`);
  }
  const octets = ip.split('.');
  return (
    ((parseInt(octets[0], 10) << 24) +
      (parseInt(octets[1], 10) << 16) +
      (parseInt(octets[2], 10) << 8) +
      parseInt(octets[3], 10)) >>>
    0
  );
}

/**
 * Test if the given IPv4 address is contained in the specified subnet.
 * @param address the IPv4 address to check
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function isInSubnet(address: string, subnetOrSubnets: string | string[]): boolean {
  return createChecker(subnetOrSubnets)(address);
}

/**
 * The functional version, creates a checking function that takes an IPv4 Address and
 * returns whether or not it is contained in (one of) the subnet(s).
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the subnet is not a valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function createChecker(
  subnetOrSubnets: string | string[]
): (address: string) => boolean {
  if (Array.isArray(subnetOrSubnets)) {
    const checks = subnetOrSubnets.map(subnet => createLongChecker(subnet));
    return address => {
      const addressLong = ipv4ToLong(address);
      return checks.some(check => check(addressLong));
    };
  }
  const check = createLongChecker(subnetOrSubnets);
  return address => {
    const addressLong = ipv4ToLong(address);
    return check(addressLong);
  };
}

// this is the most optimised checker.
function createLongChecker(subnet: string): (addressLong: number) => boolean {
  const [subnetAddress, prefixLengthString] = subnet.split('/');
  const prefixLength = parseInt(prefixLengthString, 10);
  if (!subnetAddress || !Number.isInteger(prefixLength)) {
    throw new Error(`not a valid IPv4 subnet: ${subnet}`);
  }

  if (prefixLength < 0 || prefixLength > 32) {
    throw new Error(`not a valid IPv4 prefix length: ${prefixLength} (from ${subnet})`);
  }

  const subnetLong = ipv4ToLong(subnetAddress);
  return addressLong => {
    if (prefixLength === 0) {
      return true;
    }
    const subnetPrefix = subnetLong >> (32 - prefixLength);
    const addressPrefix = addressLong >> (32 - prefixLength);

    return subnetPrefix === addressPrefix;
  };
}

// cache these special subnet checkers
const specialNetsCache: Record<string, (address: string) => boolean> = {};
function getSpecialChecker(
  kind: 'private' | 'localhost' | 'reserved' | 'special'
): (address: string) => boolean {
  if (kind in specialNetsCache === false) {
    const subnets =
      kind === 'special'
        ? [...ipRange.private.ipv4, ...ipRange.localhost.ipv4, ...ipRange.reserved.ipv4]
        : ipRange[kind].ipv4;
    specialNetsCache[kind] = createChecker(subnets);
  }
  return specialNetsCache[kind];
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(address: string) {
  return getSpecialChecker('private')(address);
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(address: string) {
  return getSpecialChecker('localhost')(address);
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(address: string) {
  return getSpecialChecker('reserved')(address);
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export function isSpecial(address: string) {
  return getSpecialChecker('special')(address);
}
