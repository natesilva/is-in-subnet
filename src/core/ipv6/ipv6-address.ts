import * as net from "../../util/net.js";
import type { IpAddress } from "../interfaces/ip-address.ts";
import { Ipv4Address } from "../ipv4/ipv4-address.js";

const REGEXP_DOT = /\./;
const REGEXP_MAPPED_IPV4 = /^(.+:ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:%.+)?$/;

export class Ipv6Address implements IpAddress {
  readonly #ip: string;
  readonly #mappedIpv4: string | undefined;
  readonly #bigint: bigint;
  #mappedIpv4Address: Ipv4Address | undefined;

  constructor(ip: string) {
    if (!net.isIPv6(ip)) {
      throw new Error(`not a valid IPv6 address: ${ip}`);
    }

    this.#ip = ip;

    const mappedMatches = ip.match(REGEXP_MAPPED_IPV4);
    if (mappedMatches) {
      // Handle IPv4-mapped IPv6 addresses
      this.#mappedIpv4 = mappedMatches[2];
      this.#bigint = Ipv6Address.#parseMappedIpv4ToBigInt(mappedMatches);
    } else if (ip.match(REGEXP_DOT)) {
      // Obsolete IPv4-mapped IPv6 address format
      throw new Error(`not a valid IPv6 address: ${ip}`);
    } else {
      // Handle standard IPv6 addresses
      this.#mappedIpv4 = undefined;
      this.#bigint = Ipv6Address.#parseStandardToBigInt(this.#ip);
    }
  }

  get ip(): string {
    return this.#ip;
  }

  get bigint(): bigint {
    return this.#bigint;
  }

  toString(): string {
    return this.#ip;
  }

  get isIpv4Mapped(): boolean {
    return Boolean(this.#mappedIpv4);
  }

  get mappedIpv4(): Ipv4Address {
    if (!this.#mappedIpv4) {
      throw new Error(`not an IPv4-mapped IPv6 address: ${this.#ip}`);
    }
    if (!this.#mappedIpv4Address) {
      this.#mappedIpv4Address = new Ipv4Address(this.#mappedIpv4);
    }
    return this.#mappedIpv4Address;
  }

  /**
   * Parses a standard (non-IPv4-mapped) IPv6 address string directly to a bigint.
   */
  static #parseStandardToBigInt(ip: string): bigint {
    // Split on '::' to find omitted zeros
    const [left, right] = ip.split("::");
    const leftSegs = left ? left.split(":").filter(Boolean) : [];
    const rightSegs = right ? right.split(":").filter(Boolean) : [];
    const totalSegs = leftSegs.length + rightSegs.length;
    const missing = 8 - totalSegs;

    let result = 0n;
    for (const seg of leftSegs) {
      result = (result << 16n) + BigInt(parseInt(seg, 16));
    }
    for (let i = 0; i < missing; ++i) {
      result = result << 16n;
    }
    for (const seg of rightSegs) {
      result = (result << 16n) + BigInt(parseInt(seg, 16));
    }
    return result;
  }

  /**
   * Parses an IPv4-mapped IPv6 address string directly to a bigint.
   * Example: ::ffff:192.168.1.1
   */
  static #parseMappedIpv4ToBigInt(mappedParts: RegExpMatchArray): bigint {
    const ipv6Part = mappedParts[1].slice(0, -1); // Remove trailing ':'
    const ipv4Part = mappedParts[2].split(".").map(Number);

    // Parse the first 6 segments (should be ::ffff)
    let result = 0n;
    // The mapped prefix may be abbreviated
    const [left, right] = ipv6Part.split("::");
    const leftSegs = left ? left.split(":").filter(Boolean) : [];
    const rightSegs = right ? right.split(":").filter(Boolean) : [];
    const totalSegs = leftSegs.length + rightSegs.length;
    const missing = 6 - totalSegs;
    for (const seg of leftSegs) {
      result = (result << 16n) + BigInt(parseInt(seg, 16));
    }
    for (let i = 0; i < missing; ++i) {
      result = result << 16n;
    }
    for (const seg of rightSegs) {
      result = (result << 16n) + BigInt(parseInt(seg, 16));
    }
    // Append IPv4 as last 32 bits
    result = (result << 8n) + BigInt(ipv4Part[0]);
    result = (result << 8n) + BigInt(ipv4Part[1]);
    result = (result << 8n) + BigInt(ipv4Part[2]);
    result = (result << 8n) + BigInt(ipv4Part[3]);
    return result;
  }
}
