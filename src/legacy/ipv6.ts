import { IP_CATEGORY } from "../address-ranges/ip-category.ts";
import * as util from "../util.ts";
import { Ipv6Address } from "../ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "../ipv6/ipv6-subnet.ts";

//
// Legacy compatibility with the undocumented, but previously-exported, IPv6 class.
// Use the IP-version-agnostic versions in ../index.ts instead.
//

/**
 * Test if the given IPv6 address is contained in the specified subnet.
 * @param address the IPv6 address to check
 * @param subnet the IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  const ip = new Ipv6Address(address);
  const subnets = util.arrayify(subnetOrSubnets).map((subnet) => new Ipv6Subnet(subnet));
  return subnets.some((subnet) => subnet.isInSubnet(ip));
}

/**
 * Create a function to test if a given IPv6 address is contained in the specified subnet.
 * @param subnet the IPv6 CIDR to test (or an array of them)
 * @throws if the subnet(s) are not valid IP addresses, or the CIDR prefix lengths
 *  are not valid
 */
export function createChecker(subnetOrSubnets: string | string[]) {
  const subnets = util.arrayify(subnetOrSubnets).map((subnet) => new Ipv6Subnet(subnet));
  return (address: string) => {
    const ip = new Ipv6Address(address);
    return subnets.some((subnet) => subnet.isInSubnet(ip));
  };
}

export function isPrivate(input: string) {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.PRIVATE.isInSubnet(address);
}

export function isLocalhost(input: string) {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.LOCALHOST.isInSubnet(address);
}

export function isReserved(input: string) {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}

export function isSpecial(input: string) {
  const address = new Ipv6Address(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}
