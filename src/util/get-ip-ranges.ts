import { IPV4_ADDRESS_RANGE } from "../address-ranges/ipv4-address-range.ts";
import { IPV6_ADDRESS_RANGE } from "../address-ranges/ipv6-address-range.ts";
import type { IpAddress } from "../core/interfaces/ip-address.ts";
import { Ipv4Address } from "../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";
import { makeIpAddress } from "./make-ip-address.ts";

/**
 * Returns all IPv4 or IPv6 address ranges that a given IP address falls into.
 * @param address The IP address to check (string or IpAddress object)
 * @returns An array of range names that the address belongs to
 */
export function getIpRanges(input: string | IpAddress) {
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
    if (ipAddress.isIpv4Mapped && ipAddress.mappedIpv4) {
      const ipv4Address = new Ipv4Address(ipAddress.mappedIpv4);
      for (const [rangeName, subnet] of Object.entries(IPV4_ADDRESS_RANGE)) {
        if (subnet.isInSubnet(ipv4Address)) {
          matchedRanges.push(rangeName);
        }
      }
    }
  }

  return matchedRanges;
}
