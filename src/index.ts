/**
 * A library for checking if an IPv4 or IPv6 address is contained in a given CIDR subnet.
 *
 * - Accurately handles both IPv4 and IPv6 addresses.
 * - Thorough tests.
 * - Fast and efficient: hundreds of thousands of checks per second on low-end hardware.
 *
 * @example Basic usage
 * ```ts
 * import { isInSubnet } from "is-in-subnet"; // Node.js
 * // Or, with Deno or Bun:
 * import { isInSubnet } from "@natesilva/is-in-subnet";
 *
 * isInSubnet("192.168.1.1", "192.168.1.0/24"); // true
 * isInSubnet("2001:db8::1", "2001:db8::/32"); // true
 * isInSubnet("10.5.0.1", "10.4.5.0/16"); // false
 * ```
 *
 * @example Test multiple subnets at once
 * ```ts
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

export * from "./core/index.ts";
export { IPV4_ADDRESS_RANGE, IPV6_ADDRESS_RANGE } from "./address-ranges/index.ts";
export { isIP, isIPv4, isIPv6 } from "./util/net.ts";
export { getIpRanges } from "./util/get-ip-ranges.ts";
