/**
 * Special-use IPv4 address ranges
 * RFC 6890: https://www.rfc-editor.org/rfc/rfc6890.html
 */
export const IPV4_ADDRESS_RANGE = Object.freeze({
  /** "This host on this network" */
  BROADCAST_THIS: ["0.0.0.0/8"],
  /** Loopback (localhost) */
  LOOPBACK: ["127.0.0.0/8"],
  /** Private-use */
  PRIVATE_IP: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
  /** Shared Address Space, commonly used for Carrier Grade NAT */
  CARRIER_GRADE_NAT: ["100.64.0.0/10"],
  /** Link-local, DHCP fallback */
  LINK_LOCAL: ["169.254.0.0/16"],
  /** IETF protocol assignments */
  IETF_PROTOCOL_ASSIGNMENTS: ["192.0.0.0/24"],
  /** Dual-Stack Lite broadband deployments (RFC 6333) */
  DS_LITE: ["192.0.0.0/29"],
  /** Reserved for documentation examples */
  TEST_NET_1: ["192.0.2.0/24"],
  /** Reserved for documentation examples */
  TEST_NET_2: ["198.51.100.0/24"],
  /** Reserved for documentation examples */
  TEST_NET_3: ["203.0.113.0/24"],
  /** 6to4 Relay Anycast */
  "6TO4_RELAY_ANYCAST": ["192.88.99.0/24"],
  /** Network Interconnect Device Benchmark Testing */
  BENCHMARKING: ["198.18.0.0/15"],
  /** Reserved */
  RESERVED_1: ["240.0.0.0/4"],
  /** Limited broadcast */
  LIMITED_BROADCAST: ["255.255.255.255/32"],

  /** Multicast: no longer documented in RFC 6890; found in RFC 5735 */
  MULTICAST: ["224.0.0.0/4"],
} as const);
