import { Ipv6Address } from "./ipv6-address.js";

export class Ipv6Subnet extends Ipv6Address {
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

    super(ip);
    this.#prefixLength = prefixLength;
  }

  toString(): string {
    return `${this.ip}/${this.#prefixLength}`;
  }

  isInSubnet(other: Ipv6Address): boolean {
    if (this.#prefixLength === 0) {
      return true;
    }

    // Compare segment by segment, based on the prefix length.
    for (let i = 0; i < 8; ++i) {
      // Calculate how many bits from the current segment are part of the prefix.
      const bitCount = Math.min(this.#prefixLength - i * 16, 16);

      if (bitCount <= 0) {
        break;
      }

      const subnetSegment = this.segments[i];
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
