import { IP_CATEGORY } from "../ip-category.js";
import * as util from "../util.js";
import { Ipv6Address } from "./ipv6-address.js";
import { Ipv6Subnet } from "./ipv6-subnet.js";

/**
 * Test if the given IPv6 address is contained in the specified subnet.
 * @param address the IPv6 address to check
 * @param subnet the IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
function isInSubnet(
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
function createChecker(subnets: readonly Ipv6Subnet[]) {
  return (address: string) => {
    const ip = new Ipv6Address(address);
    return subnets.some((subnet) => subnet.isInSubnet(ip));
  };
}

// cache these special subnet checkers
const subnetsCache = new Map<string, readonly Ipv6Subnet[]>();

function createOrGetSubnets(name: string, subnets: readonly string[]) {
  if (!subnetsCache.has(name)) {
    subnetsCache.set(
      name,
      subnets.map((subnet) => new Ipv6Subnet(subnet)),
    );
  }
  return subnetsCache.get(name)!;
}

/** Test if the given IP address is a private/internal IP address. */
function isPrivate(address: string) {
  const ip = new Ipv6Address(address);
  return createOrGetSubnets("private", IP_CATEGORY.PRIVATE.IPV6).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/** Test if the given IP address is a localhost address. */
function isLocalhost(address: string) {
  const ip = new Ipv6Address(address);
  return createOrGetSubnets("localhost", IP_CATEGORY.LOCALHOST.IPV6).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
function isIPv4MappedAddress(address: string) {
  const ip = new Ipv6Address(address);
  return (
    ip.isIpv4Mapped &&
    createOrGetSubnets("mapped", ["::ffff:0:0/96"]).some((subnet) =>
      subnet.isInSubnet(ip),
    )
  );
}

/** Test if the given IP address is in a known reserved range and not a normal host IP */
function isReserved(address: string) {
  const ip = new Ipv6Address(address);
  return createOrGetSubnets("reserved", IP_CATEGORY.RESERVED.IPV6).some((subnet) =>
    subnet.isInSubnet(ip),
  );
}

/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
function isSpecial(address: string) {
  const ip = new Ipv6Address(address);
  const subnets = [
    ...IP_CATEGORY.PRIVATE.IPV6,
    ...IP_CATEGORY.LOCALHOST.IPV6,
    ...IP_CATEGORY.RESERVED.IPV6,
  ];
  return createOrGetSubnets("special", subnets).some((subnet) => subnet.isInSubnet(ip));
}

export const IPv6 = {
  isInSubnet,
  createChecker,
  isPrivate,
  isLocalhost,
  isIPv4MappedAddress,
  isReserved,
  isSpecial,
};
