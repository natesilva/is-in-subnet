import { Ipv4Subnet } from "../core/ipv4/ipv4-subnet.ts";
import { SubnetGroup } from "../util/subnet-group.ts";

/**
 * Special-use IPv4 address ranges
 * RFC 6890: https://www.rfc-editor.org/rfc/rfc6890.html
 */
export const IPV4_ADDRESS_RANGE: Readonly<Record<string, Ipv4Subnet | SubnetGroup>> = {
  /** "This host on this network" */
  BROADCAST_THIS: new Ipv4Subnet("0.0.0.0/8"),
  /** Loopback (localhost) */
  LOOPBACK: new Ipv4Subnet("127.0.0.0/8"),
  /** Private-use */
  PRIVATE_IP: new SubnetGroup(
    new Ipv4Subnet("10.0.0.0/8"),
    new Ipv4Subnet("172.16.0.0/12"),
    new Ipv4Subnet("192.168.0.0/16"),
  ),
  /** Shared Address Space, commonly used for Carrier Grade NAT */
  CARRIER_GRADE_NAT: new Ipv4Subnet("100.64.0.0/10"),
  /** Link-local, DHCP fallback */
  LINK_LOCAL: new Ipv4Subnet("169.254.0.0/16"),
  /** IETF protocol assignments */
  IETF_PROTOCOL_ASSIGNMENTS: new Ipv4Subnet("192.0.0.0/24"),
  /** Dual-Stack Lite broadband deployments (RFC 6333) */
  DS_LITE: new Ipv4Subnet("192.0.0.0/29"),
  /** Reserved for documentation examples */
  TEST_NET_1: new Ipv4Subnet("192.0.2.0/24"),
  /** Reserved for documentation examples */
  TEST_NET_2: new Ipv4Subnet("198.51.100.0/24"),
  /** Reserved for documentation examples */
  TEST_NET_3: new Ipv4Subnet("203.0.113.0/24"),
  /** 6to4 Relay Anycast */
  "6TO4_RELAY_ANYCAST": new Ipv4Subnet("192.88.99.0/24"),
  /** Network Interconnect Device Benchmark Testing */
  BENCHMARKING: new Ipv4Subnet("198.18.0.0/15"),
  /** Reserved */
  RESERVED_1: new Ipv4Subnet("240.0.0.0/4"),
  /** Limited broadcast */
  LIMITED_BROADCAST: new Ipv4Subnet("255.255.255.255/32"),

  /** Multicast: no longer documented in RFC 6890; found in RFC 5735 */
  MULTICAST: new Ipv4Subnet("224.0.0.0/4"),
};
