import { IPV4_ADDRESS_RANGE, IPV6_ADDRESS_RANGE } from "../address-ranges/index.ts";
import type { IpAddress } from "../core/interfaces/ip-address.ts";
import { Ipv4Address } from "../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";
import { makeIpAddress } from "./make-ip-address.ts";

/**
 * Returns an array of IPv4 or IPv6 address ranges that a given IP address falls into.
 *
 * @param input The IP address to check (string or IpAddress object).
 * @returns An array of range names that the address belongs to. These come from
 *  {@linkcode IPV4_ADDRESS_RANGE} and {@linkcode IPV6_ADDRESS_RANGE}.
 * @category Address Classification
 *
 * @example Check what special IP ranges an address belongs to.
 * ```ts
 * import { getIpRanges } from "is-in-subnet";
 *
 * console.log(getIpRanges("127.0.0.1")); // ["LOOPBACK"]
 * console.log(getIpRanges("::1")); // ["LOOPBACK"]
 * console.log(getIpRanges("192.168.1.1")); // ["PRIVATE_IP"]
 * console.log(getIpRanges("fdcc:a1f7:bb32::42")); // ["UNIQUE_LOCAL"]
 *
 * // public IP, does not belong to a special range
 * console.log(getIpRanges("8.8.8.8")); // []
 * ```
 */
export function getIpRanges(
  input: string | IpAddress,
): Array<keyof typeof IPV4_ADDRESS_RANGE | keyof typeof IPV6_ADDRESS_RANGE> {
  // Convert string addresses to proper IpAddress objects
  const ipAddress = makeIpAddress(input);

  const matchedRanges: string[] = [];

  // Determine if we're dealing with IPv4 or IPv6
  const isIpv4 = ipAddress instanceof Ipv4Address;
  const isIpv6 = ipAddress instanceof Ipv6Address;

  // Check IPv4 ranges
  if (isIpv4) {
    for (const [rangeName, subnet] of Object.entries(IPV4_ADDRESS_RANGE)) {
      if (subnet.isInSubnet(ipAddress)) {
        matchedRanges.push(rangeName);
      }
    }
  }

  // Check IPv6 ranges
  if (isIpv6) {
    // Check IPv6 ranges
    for (const [rangeName, subnet] of Object.entries(IPV6_ADDRESS_RANGE)) {
      if (subnet.isInSubnet(ipAddress)) {
        matchedRanges.push(rangeName);
      }
    }

    // If this is an IPv4-mapped IPv6 address, also check IPv4 ranges
    if (ipAddress.isIpv4Mapped) {
      for (const [rangeName, subnet] of Object.entries(IPV4_ADDRESS_RANGE)) {
        if (subnet.isInSubnet(ipAddress.mappedIpv4)) {
          matchedRanges.push(rangeName);
        }
      }
    }
  }

  return matchedRanges;
}
