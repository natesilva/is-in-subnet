import { IP_CATEGORY } from "../address-ranges/ip-category.ts";
import * as util from "../util.ts";
import { Ipv4Address } from "../ipv4/ipv4-address.ts";
import { Ipv4Subnet } from "../ipv4/ipv4-subnet.ts";

//
// Legacy compatibility with the undocumented, but previously-exported, IPv4 class.
// Use the IP-version-agnostic versions in ../index.ts instead.
//

export function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  const ip = new Ipv4Address(address);
  const subnets = util.arrayify(subnetOrSubnets).map((subnet) => new Ipv4Subnet(subnet));
  return subnets.some((subnet) => subnet.isInSubnet(ip));
}

export function createChecker(subnetOrSubnets: string | string[]) {
  const subnets = util.arrayify(subnetOrSubnets).map((subnet) => new Ipv4Subnet(subnet));
  return (address: string) => {
    const ip = new Ipv4Address(address);
    return subnets.some((subnet) => subnet.isInSubnet(ip));
  };
}

export function isPrivate(input: string) {
  const address = new Ipv4Address(input);
  return IP_CATEGORY.PRIVATE.isInSubnet(address);
}

export function isLocalhost(input: string) {
  const address = new Ipv4Address(input);
  return IP_CATEGORY.LOCALHOST.isInSubnet(address);
}

export function isReserved(input: string) {
  const address = new Ipv4Address(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}

export function isSpecial(input: string) {
  const address = new Ipv4Address(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}
