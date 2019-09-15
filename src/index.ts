import * as IPv4 from './ipv4';
import * as IPv6 from './ipv6';
import * as util from './util';

export { isIP, isIPv4, isIPv6 } from './util';
export { IPv4, IPv6 };

/**
 * Test if the given IP address is contained in the specified subnet.
 * @param address the IPv4 or IPv6 address to check
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function isInSubnet(address: string, subnetOrSubnets: string | string[]): boolean {
  if (!Array.isArray(subnetOrSubnets)) {
    return isInSubnet(address, [subnetOrSubnets]);
  }

  // for mapped IPv4 addresses, compare against both IPv6 and IPv4 subnets
  if (util.isIPv6(address) && IPv6.isIPv4MappedAddress(address)) {
    return (
      IPv6.isInSubnet(
        address,
        subnetOrSubnets.filter(subnet => util.isIPv6(subnet.split('/')[0]))
      ) ||
      IPv4.isInSubnet(
        IPv6.extractMappedIpv4(address),
        subnetOrSubnets.filter(subnet => util.isIPv4(subnet.split('/')[0]))
      )
    );
  }

  if (util.isIPv6(address)) {
    return IPv6.isInSubnet(
      address,
      subnetOrSubnets.filter(subnet => util.isIPv6(subnet.split('/')[0]))
    );
  } else {
    return IPv4.isInSubnet(
      address,
      subnetOrSubnets.filter(subnet => util.isIPv4(subnet.split('/')[0]))
    );
  }
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(address: string) {
  if (util.isIPv6(address)) {
    if (IPv6.isIPv4MappedAddress(address)) {
      return IPv4.isPrivate(IPv6.extractMappedIpv4(address));
    }
    return IPv6.isPrivate(address);
  } else {
    return IPv4.isPrivate(address);
  }
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(address: string) {
  if (util.isIPv6(address)) {
    if (IPv6.isIPv4MappedAddress(address)) {
      return IPv4.isLocalhost(IPv6.extractMappedIpv4(address));
    }
    return IPv6.isLocalhost(address);
  } else {
    return IPv4.isLocalhost(address);
  }
}

/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
export function isIPv4MappedAddress(address: string) {
  if (util.isIPv6(address)) {
    return IPv6.isIPv4MappedAddress(address);
  } else {
    return false;
  }
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(address: string) {
  if (util.isIPv6(address)) {
    if (IPv6.isIPv4MappedAddress(address)) {
      return IPv4.isReserved(IPv6.extractMappedIpv4(address));
    }
    return IPv6.isReserved(address);
  } else {
    return IPv4.isReserved(address);
  }
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export function isSpecial(address: string) {
  if (util.isIPv6(address)) {
    if (IPv6.isIPv4MappedAddress(address)) {
      return IPv4.isSpecial(IPv6.extractMappedIpv4(address));
    }
    return IPv6.isSpecial(address);
  } else {
    return IPv4.isSpecial(address);
  }
}

export const check = isInSubnet;
