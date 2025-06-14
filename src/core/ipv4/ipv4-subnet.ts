import type { IpAddress } from "../interfaces/ip-address.ts";
import type { Subnet } from "../interfaces/subnet.ts";
import { Ipv4Address } from "./ipv4-address.ts";

export class Ipv4Subnet implements Subnet {
  readonly #subnetIp: Ipv4Address;
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

    this.#subnetIp = new Ipv4Address(ip);
    this.#prefixLength = prefixLength;
    this.#subnetPrefix = this.#subnetIp.long >> (32 - this.#prefixLength);
  }

  toString(): string {
    return `${this.#subnetIp}/${this.#prefixLength}`;
  }

  isInSubnet(other: IpAddress): boolean {
    if (!(other instanceof Ipv4Address)) {
      return false;
    }

    if (this.#prefixLength === 0) {
      return true;
    }

    const addressPrefix = other.long >> (32 - this.#prefixLength);
    return this.#subnetPrefix === addressPrefix;
  }
}
