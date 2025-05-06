import type { IpAddress } from "./ip-address.ts";

/**
 * A range of IPv4 and/or IPv6 addresses for which membership can be tested.
 * For example, a subnet, or a group of subnets.
 */
export interface Subnet {
  toString(): string;
  isInSubnet(input: IpAddress): boolean;
}
