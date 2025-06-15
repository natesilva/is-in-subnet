/**
 * This module is included for legacy compatibility with the undocumented, but
 * previously-exported, IPv6 class.
 *
 * @deprecated Use the main functions from the base module.
 * @module
 * @category Deprecated
 */

import { IP_CATEGORY } from "../address-ranges/ip-category.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "../core/ipv6/ipv6-subnet.ts";
import { arrayify } from "../util/arrayify.ts";

//
// Legacy compatibility with the undocumented, but previously-exported, IPv6 class.
// Use the IP-version-agnostic versions in ../index.ts instead.
//

export function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  const ip = new Ipv6Address(address);
  const subnets = arrayify(subnetOrSubnets).map((subnet) => new Ipv6Subnet(subnet));
  return subnets.some((subnet) => subnet.isInSubnet(ip));
}

export function createChecker(
  subnetOrSubnets: string | string[],
): (address: string) => boolean {
  const subnets = arrayify(subnetOrSubnets).map((subnet) => new Ipv6Subnet(subnet));
  return (address: string): boolean => {
    const ip = new Ipv6Address(address);
    return subnets.some((subnet) => subnet.isInSubnet(ip));
  };
}

export function isPrivate(input: string): boolean {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.PRIVATE_V6.isInSubnet(address);
}

export function isLocalhost(input: string): boolean {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.LOCALHOST_V6.isInSubnet(address);
}

export function isReserved(input: string): boolean {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.RESERVED_V6.isInSubnet(address);
}

export function isSpecial(input: string): boolean {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.SPECIAL_V6.isInSubnet(address);
}

export function isIPv4MappedAddress(input: string): boolean {
  const address = new Ipv6Address(input);
  return address.isIpv4Mapped;
}
