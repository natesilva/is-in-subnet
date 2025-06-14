import type { IpAddress } from "../core/interfaces/ip-address.ts";
import type { Subnet } from "../core/interfaces/subnet.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";

/**
 * An aggregate subnet group. Checks if an IP address is in any of the subnets that make
 * up this group.
 */
export class SubnetGroup implements Subnet {
  readonly #ranges: Subnet[];

  constructor(...ranges: Subnet[]) {
    this.#ranges = ranges;
  }

  isInSubnet(input: IpAddress): boolean {
    if (this.#ranges.some((range) => range.isInSubnet(input))) {
      return true;
    }

    if (input instanceof Ipv6Address && input.isIpv4Mapped) {
      return this.isInSubnet(input.mappedIpv4);
    }

    return false;
  }
}
