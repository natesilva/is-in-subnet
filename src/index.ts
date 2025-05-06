import { IP_CATEGORY } from "./address-ranges/ip-category.ts";
import { Ipv4Subnet } from "./core/ipv4/ipv4-subnet.js";
import { Ipv6Address } from "./core/ipv6/ipv6-address.js";
import { Ipv6Subnet } from "./core/ipv6/ipv6-subnet.js";
import * as IPv4 from "./legacy/ipv4.js";
import * as IPv6 from "./legacy/ipv6.js";
import { arrayify } from "./util/arrayify.ts";
import { getIpRanges } from "./util/get-ip-ranges.js";
import { makeIpAddress } from "./util/make-ip-address.ts";
import * as net from "./util/net.ts";
import { SubnetGroup } from "./util/subnet-group.ts";

export { isIP, isIPv4, isIPv6 } from "./util/net.ts";
export { getIpRanges, IPv4, IPv6 };

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
 * Create a function to test if the given IP address is contained in the specified subnet
 * or subnets.
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if any of the subnet(s) are not valid IP addresses, or the CIDR
 *  prefix length is not valid
 */
export function createChecker(subnetOrSubnets: string | readonly string[]) {
  const subnetsByVersion = {
    0: new Set<string>(),
    4: new Set<string>(),
    6: new Set<string>(),
  };

  for (const subnet of arrayify(subnetOrSubnets)) {
    const ip = subnet.split("/")[0];
    subnetsByVersion[net.isIP(ip)].add(subnet);
  }

  if (subnetsByVersion[0].size !== 0) {
    throw new Error(
      `some subnets are not valid IP addresses: ${[...subnetsByVersion[0]]}`,
    );
  }

  const ipv4Subnets = [...subnetsByVersion[4]].map((s) => new Ipv4Subnet(s));
  const ipv6Subnets = [...subnetsByVersion[6]].map((s) => new Ipv6Subnet(s));

  const subnetGroup = new SubnetGroup(...ipv4Subnets, ...ipv6Subnets);

  return (input: string) => {
    const address = makeIpAddress(input);

    if (subnetGroup.isInSubnet(address)) {
      return true;
    }

    if (address instanceof Ipv6Address && address.isIpv4Mapped) {
      // for mapped IPv4 addresses, compare against the IPv4 subnets too
      return subnetGroup.isInSubnet(address.mappedIpv4);
    }

    return false;
  };
}

/** Test if the given IP address is a private/internal IP address. */
export function isPrivate(input: string) {
  const address = makeIpAddress(input);
  return IP_CATEGORY.PRIVATE.isInSubnet(address);
}

/** Test if the given IP address is a localhost address. */
export function isLocalhost(input: string) {
  const address = makeIpAddress(input);
  return IP_CATEGORY.LOCALHOST.isInSubnet(address);
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
export function isReserved(input: string) {
  const address = makeIpAddress(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export function isSpecial(input: string) {
  const address = makeIpAddress(input);
  return IP_CATEGORY.SPECIAL.isInSubnet(address);
}

export function isIPv4MappedAddress(address: string) {
  if (!net.isIPv6(address)) {
    return false;
  }
  const ip = new Ipv6Address(address);
  return ip.isIpv4Mapped;
}

export const check = isInSubnet;
