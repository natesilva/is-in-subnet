import type { IpAddress } from "../interfaces/ip-address.ts";
import type { Subnet } from "../interfaces/subnet.ts";
import { Ipv6Address } from "./ipv6-address.ts";

export class Ipv6Subnet implements Subnet {
  readonly #subnetIp: Ipv6Address;
  readonly #prefixLength: number;

  constructor(subnet: string) {
    const [ip, prefixLengthString] = subnet.split("/");
    const prefixLength = parseInt(prefixLengthString, 10);

    if (!ip || !Number.isInteger(prefixLength)) {
      throw new Error(`not a valid IPv6 CIDR subnet: ${subnet}`);
    }

    if (prefixLength < 0 || prefixLength > 128) {
      throw new Error(`not a valid IPv6 prefix length: ${prefixLength} (from ${subnet})`);
    }

    this.#subnetIp = new Ipv6Address(ip);
    this.#prefixLength = prefixLength;
  }

  toString(): string {
    return `${this.#subnetIp}/${this.#prefixLength}`;
  }

  isInSubnet(other: IpAddress): boolean {
    if (!(other instanceof Ipv6Address)) {
      return false;
    }

    if (this.#prefixLength === 0) {
      return true;
    }

    if (this.#prefixLength === 128) {
      // Exact match - compare all segments directly
      return this.#subnetIp.segments.every((seg, i) => seg === other.segments[i]);
    }

    // Compare segment by segment, based on the prefix length.
    for (let i = 0; i < 8; ++i) {
      // Calculate how many bits from the current segment are part of the prefix.
      const bitCount = Math.min(this.#prefixLength - i * 16, 16);

      if (bitCount <= 0) {
        break;
      }

      const subnetSegment = this.#subnetIp.segments[i];
      const addressSegment = other.segments[i];

      const shiftAmount = 16 - bitCount;

      const subnetPrefix = subnetSegment >> shiftAmount;
      const addressPrefix = addressSegment >> shiftAmount;

      if (subnetPrefix !== addressPrefix) {
        return false;
      }
    }

    return true;
  }
}
