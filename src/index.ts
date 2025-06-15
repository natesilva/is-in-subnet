/**
 * A library for checking if an IPv4 or IPv6 address is contained in a given CIDR subnet.
 *
 * - Accurately handles both IPv4 and IPv6 addresses.
 * - Thorough tests.
 * - Fast and efficient: hundreds of thousands of checks per second on low-end hardware.
 *
 * @example Basic usage
 * ```ts
 * import { isInSubnet } from "is-in-subnet";
 *
 * isInSubnet("192.168.1.1", "192.168.1.0/24"); // true
 * isInSubnet("2001:db8::1", "2001:db8::/32"); // true
 * isInSubnet("10.5.0.1", "10.4.5.0/16"); // false
 * ```
 *
 * @example Test multiple subnets at once
 * ```ts
 * import { isInSubnet } from "is-in-subnet";
 *
 * // Returns true if the address is contained in any of the subnets
 * isInSubnet("10.5.0.1", ["10.4.5.0/16", "192.168.1.0/24"]); // true
 * // You can mix IPv4 and IPv6
 * isInSubnet("2001:db8::1", ["2001:db8::/32", "172.16.1.0/12"]); // true
 * ```
 *
 * @example Create a fast, reusable subnet check function
 * ```ts
 * import { createChecker } from "is-in-subnet";
 *
 * // When you need to check many addresses against the same subnets,
 * // it is more efficient to create a checker function.
 * // This avoids the overhead of parsing the subnets each time.
 * // The checker can be used multiple times.
 * const checker = createChecker(["10.4.5.0/16", "192.168.1.0/24"]);
 * console.log(checker("10.5.0.1")); // true
 * ```
 *
 * @example Test for special types of addresses
 * ```ts
 * import { isPrivate, isLocalhost } from "is-in-subnet";
 *
 * isPrivate("127.0.0.1", "127.0.0.0/8"); // true
 * isLocalhost("::1", "::1/128"); // true
 * ```
 *
 * @module
 */

import { IP_CATEGORY } from "./address-ranges/ip-category.ts";
import { Ipv4Subnet } from "./core/ipv4/ipv4-subnet.ts";
import { Ipv6Address } from "./core/ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "./core/ipv6/ipv6-subnet.ts";
import { arrayify } from "./util/arrayify.ts";
import { getIpRanges } from "./util/get-ip-ranges.ts";
import { makeIpAddress } from "./util/make-ip-address.ts";
import * as net from "./util/net.ts";
import { SubnetGroup } from "./util/subnet-group.ts";

export { IPV4_ADDRESS_RANGE, IPV6_ADDRESS_RANGE } from "./address-ranges/index.ts";
export * as IPv4 from "./legacy/ipv4.ts";
export * as IPv6 from "./legacy/ipv6.ts";
export { isIP, isIPv4, isIPv6 } from "./util/net.ts";
export { getIpRanges };

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
 * import { isInSubnet } from "is-in-subnet";
 *
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
 * {@include ./address-ranges/__docs__/IP_CATEGORIES.md#private}
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
 * {@include ./address-ranges/__docs__/IP_CATEGORIES.md#localhost}
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
 * {@include ./address-ranges/__docs__/IP_CATEGORIES.md#reserved}
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
