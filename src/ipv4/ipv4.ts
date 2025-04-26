import { IP_CATEGORY } from "../ip-category.js";
import { Ipv4Address } from "./ipv4-address.js";
import { Ipv4Subnet } from "./ipv4-subnet.js";
import type { CheckFunction } from "../types/checker.js";
import * as util from "../util.js";

/**
 * Test if the given IPv4 address is contained in the specified subnet.
 * @param address the IPv4 address to check
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  const ip = new Ipv4Address(address);
  const subnets = util.arrayify(subnetOrSubnets).map((subnet) => new Ipv4Subnet(subnet));
  return subnets.some((subnet) => subnet.isInSubnet(ip));
}

/**
 * The functional version, creates a checking function that takes an IPv4 Address and
 * returns whether or not it is contained in (one of) the subnet(s).
 * @param subnet the IPv4 CIDR to test (or an array of them)
 * @throws if the subnet is not a valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function createChecker(subnets: readonly Ipv4Subnet[]): CheckFunction {
  return (address) => {
    const ip = new Ipv4Address(address);
    return subnets.some((subnet) => subnet.isInSubnet(ip));
  };
}

// cache these special subnet checkers
const subnetsCache = new Map<string, readonly Ipv4Subnet[]>();

function createOrGetSubnets(name: string, subnets: readonly string[]) {
  if (!subnetsCache.has(name)) {
    subnetsCache.set(
      name,
      subnets.map((subnet) => new Ipv4Subnet(subnet)),
    );
  }
  return subnetsCache.get(name)!;
}

/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address: string) {
  const ip = new Ipv4Address(address);
  return createOrGetSubnets("private", IP_CATEGORY.PRIVATE.IPV4).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/** Test if the given IP address is a localhost address. */
function isLocalhost(address: string) {
  const ip = new Ipv4Address(address);
  return createOrGetSubnets("localhost", IP_CATEGORY.LOCALHOST.IPV4).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address: string) {
  const ip = new Ipv4Address(address);
  return createOrGetSubnets("reserved", IP_CATEGORY.RESERVED.IPV4).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
function isSpecial(address: string) {
  const ip = new Ipv4Address(address);
  return createOrGetSubnets("special", [
    ...IP_CATEGORY.PRIVATE.IPV4,
    ...IP_CATEGORY.LOCALHOST.IPV4,
    ...IP_CATEGORY.RESERVED.IPV4,
  ]).some((subnet) => subnet.isInSubnet(ip));
}

export const IPv4 = {
  isInSubnet,
  createChecker,
  isPrivate,
  isLocalhost,
  isReserved,
  isSpecial,
};
