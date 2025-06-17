import { IP_CATEGORY } from "../address-ranges/ip-category.ts";
import { arrayify } from "../util/arrayify.ts";
import { makeIpAddress } from "../util/make-ip-address.ts";
import * as net from "../util/net.ts";
import { SubnetGroup } from "../util/subnet-group.ts";
import { Ipv4Subnet } from "./ipv4/ipv4-subnet.ts";
import { Ipv6Address } from "./ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "./ipv6/ipv6-subnet.ts";

/**
 * Test if the given IP address is contained in a subnet. If an array of subnets is
 * provided, it will return true if the address is contained in any of the subnets.
 *
 * @param address The IPv4 or IPv6 address to check.
 * @param subnetOrSubnets The IPv4 or IPv6 CIDR to test (or an array of them).
 * @throws Will throw an `Error` if any of the address or subnet(s) are not valid IP
 *  addresses, or the CIDR prefix length is not valid.
 * @category General Use
 *
 * @example Basic usage
 * ```ts
 * // Test if the address is contained in a given subnet
 * isInSubnet("2001:db8::1", "2001:db8::/32"); // true
 * isInSubnet("10.5.0.1", "10.4.5.0/16"); // false
 *
 * // Test for membership in any of a list of subnets
 * isInSubnet("10.5.0.1", ["10.4.5.0/16", "192.168.1.0/24"]); // true
 * ```
 */
export function isInSubnet(
  address: string,
  subnetOrSubnets: string | readonly string[],
): boolean {
  return createChecker(subnetOrSubnets)(address);
}

/**
 * Create a function to test if the given IP address is contained in the specified subnet.
 * If an array of subnets is provided, it will return true if the address is contained in
 * any of the subnets.
 *
 * This is an alternative to the {@linkcode isInSubnet} function. Use this if you need to
 * do many or repeated checks. It’s faster than calling {@linkcode isInSubnet} multiple
 * times.
 *
 * @param subnetOrSubnets The IPv4 or IPv6 CIDR to test (or an array of them).
 * @returns Returns a function that takes an IP address as a string and returns `true` if the
 *  address is contained in any of the provided subnets, or `false` otherwise.
 * @throws Will throw an `Error` if any of the subnet(s) are not valid IP addresses, or
 *  the CIDR prefix length is not valid.
 * @category General Use
 *
 * @example Using createChecker to create a re-usable checker function
 * ```ts
 * import { createChecker } from "is-in-subnet";
 *
 * // Once the checker is created, the parsing cost is amortized.
 * // The checker can be used multiple times.
 * const checker = createChecker(["10.4.5.0/16", "192.168.1.0/24"]);
 * console.log(checker("10.5.0.1")); // true
 * ```

 */
export function createChecker(
  subnetOrSubnets: string | readonly string[],
): (input: string) => boolean {
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

  return (input: string): boolean => subnetGroup.isInSubnet(makeIpAddress(input));
}

/**
 * Test if the given IP address is a `PRIVATE` IP address.
 *
 * @param input - The IP address to test.
 * @returns `true` if the IP address is private/internal, false otherwise.
 *
 * {@include ../address-ranges/__docs__/IP_CATEGORIES.md#private}
 *
 * @category Address Classification
 */
export function isPrivate(input: string): boolean {
  const address = makeIpAddress(input);
  return IP_CATEGORY.PRIVATE.isInSubnet(address);
}

/**
 * Test if the given IP address is a `LOCALHOST` address.
 *
 * @param input - The IP address to test.
 * @returns `true` if the IP address is a localhost address, false otherwise.
 *
 * {@include ../address-ranges/__docs__/IP_CATEGORIES.md#localhost}
 *
 * @category Address Classification
 */
export function isLocalhost(input: string): boolean {
  const address = makeIpAddress(input);
  return IP_CATEGORY.LOCALHOST.isInSubnet(address);
}

/**
 * Test if the given IP address is in a known `RESERVED` range and not a normal host IP.
 *
 * @param input - The IP address to test.
 * @returns `true` if the IP address is in a reserved range, false otherwise.
 *
 * {@include ../address-ranges/__docs__/IP_CATEGORIES.md#reserved}
 *
 * @category Address Classification
 */
export function isReserved(input: string): boolean {
  const address = makeIpAddress(input);
  return IP_CATEGORY.RESERVED.isInSubnet(address);
}

/**
 * Test if the given IP address is a special address in one of the following categories:
 *
 * - localhost
 * - private
 * - reserved
 *
 * @param input - The IP address to test.
 * @returns `true` if the IP address is a special address, false otherwise.
 * @category Address Classification
 */
export function isSpecial(input: string): boolean {
  const address = makeIpAddress(input);
  return IP_CATEGORY.SPECIAL.isInSubnet(address);
}

/**
 * Test if an IPv6 address is an IPv4 mapped address. (Example: `::ffff:192.168.1.1`)
 *
 * @param address - The IP address to test.
 * @returns `true` if the IP address is an IPv4 mapped address, false otherwise.
 * @category Address Classification
 */
export function isIPv4MappedAddress(address: string): boolean {
  if (!net.isIPv6(address)) {
    return false;
  }
  const ip = new Ipv6Address(address);
  return ip.isIpv4Mapped;
}

/**
 * This is an alias for the {@linkcode isInSubnet} function. It may be more legible in
 * a browser environment to use `IsInSubnet.check(…)` instead of
 * `IsInSubnet.isInSubnet(…)`.
 * @category In-Browser Use
 */
export const check: typeof isInSubnet = isInSubnet;
