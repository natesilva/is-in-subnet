import { expect, suite, test } from "vitest";
import { Ipv6Address } from "../src/core/ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "../src/core/ipv6/ipv6-subnet.ts";
import * as IPv6 from "../src/legacy/ipv6.ts";
import ipv6fixtures from "./fixtures/ipv6.js";

suite("IPv6 tests", () => {
  test.for(ipv6fixtures)(
    "should check ipv6 subnet membership (one-at-a-time) (%s, %s)",
    ([ip, subnet, expected]) => {
      expect(IPv6.isInSubnet(ip, subnet)).toBe(expected);
    },
  );

  test("should check ipv6 subnet membership (array)", () => {
    const uniqueIps = new Set<string>(ipv6fixtures.map((f) => f[0]));

    uniqueIps.forEach((ip) => {
      const inSubnets = ipv6fixtures.filter((t) => t[0] === ip && t[2]).map((t) => t[1]);
      if (inSubnets.length) {
        expect(IPv6.isInSubnet(ip, inSubnets)).toBe(true);
      }

      const notInSubnets = ipv6fixtures
        .filter((t) => t[0] === ip && !t[2])
        .map((t) => t[1]);
      expect(IPv6.isInSubnet(ip, notInSubnets)).toBe(false);
    });
  });

  test("should handle an empty subnet array", () => {
    const ip = ipv6fixtures[0][0];
    expect(IPv6.isInSubnet(ip, [])).toBe(false);
  });

  test.for([
    ["2001:db8:f53a::1", "2001:db8:f53a::1"],
    ["2001:db8:f53a::1", "2001:db8:f53a::1/-1"],
    ["2001:db8:f53a::1", "2001:db8:f53a::1/129"],
  ])("should throw on invalid subnets (%s, %s)", ([ip, subnet]) => {
    expect(() => IPv6.isInSubnet(ip, subnet)).toThrow();
  });

  test.for([
    ["10.5.0.1", "2001:db8:f53a::1:1/64"],
    ["::ffff:22.33", "2001:db8:f53a::1:1/64"],
    ["::ffff:192.168.0.256", "2001:db8:f53a::1:1/64"],
  ])("should throw on invalid ipv6 (%s, %s)", ([ip, subnet]) => {
    expect(() => IPv6.isInSubnet(ip, subnet)).toThrow();
  });

  test.for<[string, boolean]>([
    ["::1", true],
    ["::2", false],
  ])("should handle ipv6 localhost (%s)", ([ip, expected]) => {
    expect(IPv6.isLocalhost(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["::1", false],
    ["fe80::5555:1111:2222:7777%utun2", true],
    ["fdc5:3c04:80bf:d9ee::1", true],
  ])("should handle ipv6 private (%s)", ([ip, expected]) => {
    expect(IPv6.isPrivate(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["::1", false],
    ["fe80::5555:1111:2222:7777%utun2", false],
    ["::ffff:192.168.0.1", true],
    ["0:0::0:ffff:192.168.0.1", true],
  ])("should handle ipv6 mapped (%s)", ([ip, expected]) => {
    expect(IPv6.isIPv4MappedAddress(ip)).toBe(expected);
  });

  test("should throw on deprecated IPv4-mapped IPv6 format", () => {
    // THIS FORMAT IS DEPRECATED AND WE DO NOT SUPPORT IT: SEE RFC4291 SECTION 2.5.5.1
    // https://tools.ietf.org/html/rfc4291#section-2.5.5.1
    expect(() => IPv6.isIPv4MappedAddress("::192.168.0.1")).toThrow();
  });

  test.for<[string, boolean]>([
    ["2001:db8:f53a::1", true],
    ["2001:4860:4860::8888", false],
    ["::", true],
  ])("should handle ipv6 reserved (%s)", ([ip, expected]) => {
    expect(IPv6.isReserved(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["2001:4860:4860::8888", false],
    ["::1", true],
    ["::ffff:192.168.0.1", false],
    ["2001:db8:f53a::1", true],
  ])("should handle ipv6 special (%s)", ([ip, expected]) => {
    expect(IPv6.isSpecial(ip)).toBe(expected);
  });

  test.for([
    "::ffff:999.999.999.999", // not a valid IPv4
    "::192.168.0.1", // obsolete format and should throw
  ])("Ipv6Address throws on invalid IPv6 (%s)", (ip) => {
    expect(() => new Ipv6Address(ip)).toThrow();
  });

  test("Ipv6Address parses valid mapped IPv4", () => {
    const addr = new Ipv6Address("::ffff:192.168.0.1");
    expect(addr.isIpv4Mapped).toBe(true);
    expect(addr.mappedIpv4.ip).toBe("192.168.0.1");
  });

  test.for([
    ["::/0", "2001:db8::1"],
    ["::/0", "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"],
  ])("Ipv6Subnet isInSubnet returns true for /0 prefix (%s, %s)", ([cidr, ip]) => {
    const subnet = new Ipv6Subnet(cidr);
    const addr = new Ipv6Address(ip);
    expect(subnet.isInSubnet(addr)).toBe(true);
  });

  test.for(["2001:db8::/32", "::/0", "fe80::/10"])(
    "Ipv6Subnet string representation (%s)",
    (cidr) => {
      const subnet = new Ipv6Subnet(cidr);
      expect(subnet.toString()).toBe(cidr);
    },
  );

  test.for([
    "2001:db8::1",
    "::1",
    "fe80::1",
    "::ffff:192.168.0.1",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
  ])("Ipv6Address string representation (%s)", (ip) => {
    const addr = new Ipv6Address(ip);
    expect(addr.toString()).toBe(ip);
  });

  test("Ipv6Address returns the correct string representation", () => {
    const addr = new Ipv6Address("2001:4860:4860::8888");
    expect(addr.ip).toBe("2001:4860:4860::8888");
  });

  test("Ipv6Address mappedIpv4 property throws if mapped IPv4 is invalid", () => {
    const addr = new Ipv6Address("2001:4860:4860::8888");
    expect(() => addr.mappedIpv4).toThrow();
  });

  suite("IPv6 legacy createChecker tests", () => {
    test("createChecker with single subnet", () => {
      const checker = IPv6.createChecker("2001:db8::/32");
      expect(checker("2001:db8::1")).toBe(true);
      expect(checker("2001:db9::1")).toBe(false);
    });

    test("createChecker with multiple subnets", () => {
      const checker = IPv6.createChecker(["2001:db8::/32", "fe80::/10"]);
      expect(checker("2001:db8::1")).toBe(true);
      expect(checker("fe80::1")).toBe(true);
      expect(checker("2001:4860:4860::8888")).toBe(false);
    });

    test("createChecker with empty subnets", () => {
      const checker = IPv6.createChecker([]);
      expect(checker("2001:db8::1")).toBe(false);
    });
  });
});
