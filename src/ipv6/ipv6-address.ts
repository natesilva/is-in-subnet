import * as util from "../util.js";

const REGEXP_DOT = /\./;
const REGEXP_MAPPED_IPV4 = /^(.+:ffff:)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?:%.+)?$/;
const REGEXP_COLON = /:/;

export class Ipv6Address {
  readonly #ip: string;
  readonly #mappedIpv4: string | undefined;
  readonly #segments: Readonly<Uint16Array>;

  constructor(ip: string) {
    if (!util.isIPv6(ip)) {
      throw new Error(`not a valid IPv6 address: ${ip}`);
    }

    // Handle annoying IPv4-mapped IPv6 addresses
    const mappedMatches = ip.match(REGEXP_MAPPED_IPV4);
    if (mappedMatches) {
      const ipv4Part = mappedMatches[2];
      // Note: isIPv6 already checks for valid mapped IPv4
      this.#ip = ip;
      this.#mappedIpv4 = ipv4Part;
      this.#segments = Ipv6Address.parseMappedIpv4Segments(ipv4Part);
    } else if (ip.match(REGEXP_DOT)) {
      // Obsolete IPv4-mapped IPv6 address format
      throw new Error(`not a valid IPv6 address: ${ip}`);
    } else {
      this.#ip = ip;
      this.#mappedIpv4 = undefined;
      this.#segments = Ipv6Address.parseSegments(this.#ip);
    }
  }

  get ip() {
    return this.#ip;
  }

  get segments() {
    return this.#segments;
  }

  toString() {
    return this.#ip;
  }

  get isIpv4Mapped() {
    return Boolean(this.#mappedIpv4);
  }

  get mappedIpv4() {
    return this.#mappedIpv4;
  }

  /**
   * Parses a standard IPv6 string (validated, non-IPv4-mapped) into 8 numeric (16-bit)
   * segments.
   * @param ip
   */
  private static parseSegments(ip: string): Uint16Array {
    const segments = new Uint16Array(8);
    const doubleColonIndex = ip.indexOf("::");

    let beforeParts: string[];
    let afterParts: string[];

    if (doubleColonIndex === -1) {
      // No double colon, full form
      beforeParts = ip.split(REGEXP_COLON);
      afterParts = [];
    } else {
      // Double colon exists, abbreviated form
      const before = ip.substring(0, doubleColonIndex);
      const after = ip.substring(doubleColonIndex + 2);

      beforeParts = before ? before.split(REGEXP_COLON) : [];
      afterParts = after ? after.split(REGEXP_COLON) : [];
    }

    const totalExplicitSegments = beforeParts.length + afterParts.length;
    const missingCount = 8 - totalExplicitSegments;

    for (let i = 0; i < beforeParts.length; i++) {
      const num = parseInt(beforeParts[i], 16);
      segments[i] = num;
    }

    // For 'missing' parts: Uint16Array is already zero-filled by default

    for (let i = 0; i < afterParts.length; i++) {
      const num = parseInt(afterParts[i], 16);
      segments[beforeParts.length + missingCount + i] = num;
    }

    return segments;
  }

  /**
   * Parses an IPv4-mapped IPv6 string (validated and known to be IPv4-mapped) into 8
   * numeric (16-bit) segments.
   * @param ipv4
   */
  private static parseMappedIpv4Segments(ipv4: string): Uint16Array {
    const parts = ipv4.split(REGEXP_DOT).map((part) => parseInt(part, 10));

    const segments = new Uint16Array(8);
    // First 5 segments are 0 (::) - Uint16Array defaults to 0
    // 6th segment is ffff
    segments[5] = 0xffff; // 65535
    // 7th segment from first two IPv4 octets
    segments[6] = (parts[0] << 8) + parts[1];
    // 8th segment from last two IPv4 octets
    segments[7] = (parts[2] << 8) + parts[3];

    return segments;
  }
}
