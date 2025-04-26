/**
 * Special-use IPv6 address ranges
 * RFC 6890: https://www.rfc-editor.org/rfc/rfc6890.html
 */
export const IPV6_ADDRESS_RANGE = Object.freeze({
  /** Loopback address */
  LOOPBACK: ["::1/128"],
  /** Unspecified address */
  UNSPECIFIED: ["::/128"],
  /** IPv4-IPv6 translation */
  IPV4_IPV6_TRANSLATION: ["64:ff9b::/96"],
  /** IPv4-mapped address */
  IPV4_MAPPED: ["::ffff:0:0/96"],
  /** Black hole filtering to mitigate and analyze the effects of DoS attacks */
  DISCARD_ONLY: ["100::/64"],
  /** IETF protocol assignments */
  IETF_PROTOCOL_ASSIGNMENTS: ["2001::/23"],
  /** Teredo tunneling */
  TEREDO: ["2001::/32"],
  /** Benchmark testing */
  BENCHMARKING: ["2001:2::/48"],
  /** Reserved for documentation examples */
  DOCUMENTATION: ["2001:db8::/32"],
  /** 6to4 */
  "6TO4": ["2002::/16"],
  /** Unique local address (ULA) */
  UNIQUE_LOCAL: ["fc00::/7"],
  /** Link-local IPv6 address */
  LINK_SCOPED_UNICAST: ["fe80::/10"],

  /** Multicast: no longer documented in RFC 6890; found in RFC 5156 */
  MULTICAST: ["ff00::/8"],

  /** Overlay Routable Cryptographic Hash Identifiers v2 (ORCHIDv2) (RFC 7343) */
  ORCHIDV2: ["2001:20::/28"],
} as const);
