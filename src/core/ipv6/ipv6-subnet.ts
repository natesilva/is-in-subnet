import type { IpAddress } from "../interfaces/ip-address.ts";
import type { Subnet } from "../interfaces/subnet.ts";
import { Ipv6Address } from "./ipv6-address.ts";

export class Ipv6Subnet implements Subnet {
  readonly #subnetIp: Ipv6Address;
  readonly #prefixLength: number;
  readonly #subnetPrefix: bigint;

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
    this.#subnetPrefix = this.#subnetIp.bigint >> BigInt(128 - this.#prefixLength);
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

    const addressPrefix = other.bigint >> BigInt(128 - this.#prefixLength);
    return this.#subnetPrefix === addressPrefix;
  }
}
