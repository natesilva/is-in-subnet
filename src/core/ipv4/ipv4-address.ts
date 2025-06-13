import type { IpAddress } from "../interfaces/ip-address.ts";

export class Ipv4Address implements IpAddress {
  readonly #long: number;
  readonly #ip: string;

  constructor(ip: string) {
    const [isValid, longValue] = Ipv4Address.validateAndConvert(ip);
    if (!isValid) {
      throw new Error(`not a valid IPv4 address: ${ip}`);
    }
    this.#ip = ip;
    this.#long = longValue;
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

  protected static validateAndConvert(ip: string): [boolean, number] {
    if (ip.length < 7 || ip.length > 15) return [false, 0];

    let result = 0;
    let octet = 0;
    let shift = 24;
    let dots = 0;
    let isNewOctet = true;

    for (let i = 0; i < ip.length; i++) {
      const char = ip.charCodeAt(i);

      if (char === 46) {
        // '.' character
        if (octet > 255) return [false, 0];
        result += octet << shift;
        octet = 0;
        shift -= 8;
        dots++;
        isNewOctet = true;
      } else if (char >= 48 && char <= 57) {
        // Check for leading zero
        if (
          isNewOctet &&
          char === 48 &&
          i + 1 < ip.length &&
          ip.charCodeAt(i + 1) !== 46
        ) {
          return [false, 0]; // Leading zero detected
        }
        octet = octet * 10 + (char - 48);
        isNewOctet = false;
      } else {
        return [false, 0]; // Invalid character
      }
    }

    // Check the last octet
    if (octet > 255) return [false, 0];
    result += octet;

    return [dots === 3, result >>> 0];
  }
}
