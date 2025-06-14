import type { IpAddress } from "../interfaces/ip-address.ts";
import type { Subnet } from "../interfaces/subnet.ts";
import { Ipv4Address } from "./ipv4-address.ts";

export class Ipv4Subnet implements Subnet {
  readonly #subnetIp: Ipv4Address;
  readonly #prefixLength: number;
  readonly #subnetPrefix: number;

  constructor(subnet: string) {
    const parts = subnet.split("/");

    // Must have exactly 2 parts: IP and prefix length
    if (parts.length !== 2) {
      throw new Error(`not a valid IPv4 subnet: ${subnet}`);
    }

    const [ip, prefixLengthString] = parts;

    // IP part cannot be empty
    if (!ip || ip.trim() !== ip) {
      throw new Error(`not a valid IPv4 subnet: ${subnet}`);
    }

    // Prefix length string cannot be empty or contain whitespace
    if (!prefixLengthString || prefixLengthString.trim() !== prefixLengthString) {
      throw new Error(`not a valid IPv4 subnet: ${subnet}`);
    }

    // Parse prefix length - must be a valid integer without leading zeros (except "0")
    if (prefixLengthString !== "0" && prefixLengthString.startsWith("0")) {
      throw new Error(`not a valid IPv4 subnet: ${subnet}`);
    }

    const prefixLength = parseInt(prefixLengthString, 10);

    if (
      !Number.isInteger(prefixLength) ||
      prefixLength.toString() !== prefixLengthString
    ) {
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
