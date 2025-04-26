import { Ipv4Address } from "./ipv4-address.js";

export class Ipv4Subnet extends Ipv4Address {
  readonly #prefixLength: number;
  readonly #subnetPrefix: number;

  constructor(subnet: string) {
    const [ip, prefixLengthString] = subnet.split("/");
    const prefixLength = +prefixLengthString;
    if (!ip || !Number.isInteger(prefixLength)) {
      throw new Error(`not a valid IPv4 subnet: ${subnet}`);
    }

    if (prefixLength < 0 || prefixLength > 32) {
      throw new Error(`not a valid IPv4 prefix length: ${prefixLength} (from ${subnet})`);
    }

    super(ip);
    this.#prefixLength = prefixLength;
    this.#subnetPrefix = this.long >> (32 - this.#prefixLength);
  }

  toString(): string {
    return `${this.ip}/${this.#prefixLength}`;
  }

  isInSubnet(other: Ipv4Address): boolean {
    if (this.#prefixLength === 0) {
      return true;
    }
    const addressPrefix = other.long >> (32 - this.#prefixLength);
    return this.#subnetPrefix === addressPrefix;
  }
}
