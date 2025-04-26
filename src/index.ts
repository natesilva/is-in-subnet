import { Ipv4Subnet } from "./ipv4/ipv4-subnet.js";
import { IPv4 } from "./ipv4/ipv4.js";
import { IPv6 } from "./ipv6/ipv6.js";
import { Ipv6Subnet } from "./ipv6/ipv6-subnet.js";
import type { CheckFunction } from "./types/checker.js";
import * as util from "./util.js";
import { Ipv6Address } from "./ipv6/ipv6-address.js";
import { Ipv4Address } from "./ipv4/ipv4-address.js";

export { isIP, isIPv4, isIPv6 } from "./util.js";
export { IPv4, IPv6 };

/**
 * Test if the given IP address is contained in the specified subnet.
 * @param address the IPv4 or IPv6 address to check
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if any of the address or subnet(s) are not valid IP addresses, or the CIDR
 *  prefix length is not valid
 */
export function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  return createChecker(subnetOrSubnets)(address);
}

/**
 * Create a function to test if the given IP address is contained in the specified subnet.
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if any of the subnet(s) are not valid IP addresses, or the CIDR
 *  prefix length is not valid
 */
export function createChecker(
  subnetOrSubnets: string | readonly string[],
): CheckFunction {
  const subnetsByVersion = {
    0: new Set<string>(),
    4: new Set<string>(),
    6: new Set<string>(),
  };

  for (const subnet of util.arrayify(subnetOrSubnets)) {
    const ip = subnet.split("/")[0];
    subnetsByVersion[util.isIP(ip)].add(subnet);
  }

  if (subnetsByVersion[0].size !== 0) {
    throw new Error(
      `some subnets are not valid IP addresses: ${[...subnetsByVersion[0]]}`,
    );
  }

  const ipv4Subnets = [...subnetsByVersion[4]].map((s) => new Ipv4Subnet(s));
  const ipv6Subnets = [...subnetsByVersion[6]].map((s) => new Ipv6Subnet(s));

  return (address: string) => {
    if (!util.isIP(address)) {
      throw new Error(`not a valid IPv4 or IPv6 address: ${address}`);
    }

    const ipv6 = util.isIPv6(address) ? new Ipv6Address(address) : undefined;
    const ipv4 = util.isIPv4(address) ? new Ipv4Address(address) : undefined;

    if (ipv6) {
      // for mapped IPv4 addresses, compare against both IPv6 and IPv4 subnets
      if (ipv6.mappedIpv4) {
        return (
          ipv4Subnets.some((subnet) =>
            subnet.isInSubnet(new Ipv4Address(ipv6.mappedIpv4!)),
          ) || ipv6Subnets.some((subnet) => subnet.isInSubnet(ipv6))
        );
      } else {
        return ipv6Subnets.some((subnet) => subnet.isInSubnet(ipv6));
      }
    } else if (ipv4) {
      return ipv4Subnets.some((subnet) => subnet.isInSubnet(ipv4));
    }

    return false;
  };
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(address: string) {
  if (util.isIPv6(address)) {
    const ip = new Ipv6Address(address);
    if (ip.isIpv4Mapped) {
      return IPv4.isPrivate(ip.mappedIpv4!);
    }
    return IPv6.isPrivate(address);
  } else {
    return IPv4.isPrivate(address);
  }
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(address: string) {
  if (util.isIPv6(address)) {
    const ip = new Ipv6Address(address);
    if (ip.isIpv4Mapped) {
      return IPv4.isLocalhost(ip.mappedIpv4!);
    }
    return IPv6.isLocalhost(address);
  } else {
    return IPv4.isLocalhost(address);
  }
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(address: string) {
  if (util.isIPv6(address)) {
    const ip = new Ipv6Address(address);
    if (ip.isIpv4Mapped) {
      return IPv4.isReserved(ip.mappedIpv4!);
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
    const ip = new Ipv6Address(address);
    if (ip.isIpv4Mapped) {
      return IPv4.isSpecial(ip.mappedIpv4!);
    }
    return IPv6.isSpecial(address);
  } else {
    return IPv4.isSpecial(address);
  }
}

export function isIPv4MappedAddress(address: string) {
  if (!util.isIPv6(address)) {
    return false;
  }
  const ip = new Ipv6Address(address);
  return ip.isIpv4Mapped;
}

export const check = isInSubnet;
