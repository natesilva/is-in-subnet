import type { IpAddress } from "../core/interfaces/ip-address.ts";
import type { Subnet } from "../core/interfaces/subnet.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";

/**
 * An aggregate subnet group. Checks if an IP address is in any of the subnets that make
 * up this group.
 */
export class SubnetGroup implements Subnet {
  readonly #ranges: Subnet[];
  readonly #id: symbol;

  constructor(...ranges: Subnet[]) {
    this.#ranges = ranges;
    this.#id = Symbol("SubnetGroup");
  }

  toString(): string {
    throw new Error("Method not implemented.");
  }

  isInSubnet(input: IpAddress): boolean {
    if (input instanceof Ipv6Address && input.isIpv4Mapped) {
      return this._isInSubnet(input) || this._isInSubnet(input.mappedIpv4);
    }
    return this._isInSubnet(input);
  }

  _isInSubnet(input: IpAddress, visited: Set<symbol> = new Set()): boolean {
    // If this group has already been visited, stop to prevent infinite recursion
    if (visited.has(this.#id)) {
      return false;
    }

    // Add this group to the visited set
    visited.add(this.#id);

    // Check each range, passing along the visited set
    for (const range of this.#ranges) {
      if (range instanceof SubnetGroup) {
        // If the range is another SubnetGroup, pass the visited set
        if (range._isInSubnet(input, visited)) {
          return true;
        }
      } else if (range.isInSubnet(input)) {
        return true;
      }
    }

    return false;
  }
}
