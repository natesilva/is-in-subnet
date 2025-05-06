import { Ipv6Subnet } from "../core/ipv6/ipv6-subnet.js";

/**
 * Special-use IPv6 address ranges
 * RFC 6890: https://www.rfc-editor.org/rfc/rfc6890.html
 */
export const IPV6_ADDRESS_RANGE = Object.freeze({
  /** Loopback address */
  LOOPBACK: new Ipv6Subnet("::1/128"),
  /** Unspecified address */
  UNSPECIFIED: new Ipv6Subnet("::/128"),
  /** IPv4-IPv6 translation */
  IPV4_IPV6_TRANSLATION: new Ipv6Subnet("64:ff9b::/96"),
  /** IPv4-mapped address */
  IPV4_MAPPED: new Ipv6Subnet("::ffff:0:0/96"),
  /** Black hole filtering to mitigate and analyze the effects of DoS attacks */
  DISCARD_ONLY: new Ipv6Subnet("100::/64"),
  /** IETF protocol assignments */
  IETF_PROTOCOL_ASSIGNMENTS: new Ipv6Subnet("2001::/23"),
  /** Teredo tunneling */
  TEREDO: new Ipv6Subnet("2001::/32"),
  /** Benchmark testing */
  BENCHMARKING: new Ipv6Subnet("2001:2::/48"),
  /** Reserved for documentation examples */
  DOCUMENTATION: new Ipv6Subnet("2001:db8::/32"),
  /** 6to4 */
  "6TO4": new Ipv6Subnet("2002::/16"),
  /** Unique local address (ULA) */
  UNIQUE_LOCAL: new Ipv6Subnet("fc00::/7"),
  /** Link-local IPv6 address */
  LINK_SCOPED_UNICAST: new Ipv6Subnet("fe80::/10"),

  /** Multicast: no longer documented in RFC 6890; found in RFC 5156 */
  MULTICAST: new Ipv6Subnet("ff00::/8"),

  /** Overlay Routable Cryptographic Hash Identifiers v2 (ORCHIDv2) (RFC 7343) */
  ORCHIDV2: new Ipv6Subnet("2001:20::/28"),
} as const);
