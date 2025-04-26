import * as util from "../util.js";

export class Ipv4Address {
  readonly #long: number;
  readonly #ip: string;

  constructor(ip: string) {
    if (!util.isIPv4(ip)) {
      throw new Error(`not a valid IPv4 address: ${ip}`);
    }
    this.#ip = ip;
    this.#long = Ipv4Address.toLong(ip);
  }

  get ip() {
    return this.#ip;
  }

  get long() {
    return this.#long;
  }

  toString() {
    return this.#ip;
  }

  protected static toLong(ip: string): number {
    let result = 0;
    let octet = 0;
    let shift = 24;

    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);

      if (char === 46) {
        // '.' character
        result += octet << shift;
        octet = 0;
        shift -= 8;
      } else {
        octet = octet * 10 + (char - 48); // '0' is 48 in ASCII
      }
    }

    // Add the last octet
    result += octet;

    return result >>> 0;
  }
}
