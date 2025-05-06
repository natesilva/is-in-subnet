import { expect, suite, test } from "vitest";
import { Ipv4Address } from "../src/core/ipv4/ipv4-address.js";
import { Ipv4Subnet } from "../src/core/ipv4/ipv4-subnet.js";
import * as IPv4 from "../src/legacy/ipv4.js";
import ipv4fixtures from "./fixtures/ipv4.js";

suite("IPv4 tests", () => {
  test.for(ipv4fixtures)(
    "should check ipv4 subnet membership (one-at-a-time) (%s, %s)",
    ([ip, subnet, expected]) => {
      expect(IPv4.isInSubnet(ip, subnet)).toBe(expected);
    },
  );

  test("should check ipv4 subnet membership (array)", () => {
    const uniqueIps = new Set<string>(ipv4fixtures.map((f) => f[0]));

    uniqueIps.forEach((ip) => {
      const inSubnets = ipv4fixtures.filter((t) => t[0] === ip && t[2]).map((t) => t[1]);
      if (inSubnets.length) {
        expect(IPv4.isInSubnet(ip, inSubnets)).toBe(true);
      }

      const notInSubnets = ipv4fixtures
        .filter((t) => t[0] === ip && !t[2])
        .map((t) => t[1]);
      expect(IPv4.isInSubnet(ip, notInSubnets)).toBe(false);
    });
  });

  test("should handle an empty subnet array", () => {
    const ip = ipv4fixtures[0][0];
    expect(IPv4.isInSubnet(ip, [])).toBe(false);
  });

  test.for([
    ["10.5.0.1", "10.5.0.1"],
    ["10.5.0.1", "0.0.0.0/-1"],
    ["10.5.0.1", "0.0.0.0/33"],
    // first segment of subnet is octal-like, should throw
    ["10.5.0.1", "010.0.0.0/8"],
  ])("should throw on invalid subnets (%s, %s)", ([ip, subnet]) => {
    expect(() => IPv4.isInSubnet(ip, subnet)).toThrow();
  });

  test.for([
    ["256.5.0.1", "0.0.0.0/0"],
    ["::1", "0.0.0.0/0"],
    ["10.5.0.1", "2001:db8:f53a::1:1/64"],
    ["10.5.0.1", "1.2.3"],
  ])("should throw on invalid ipv4 (%s, %s)", ([ip, subnet]) => {
    expect(() => IPv4.isInSubnet(ip, subnet)).toThrow();
  });

  test.for<[string, boolean]>([
    ["127.0.0.1", true],
    ["127.99.88.77", true],
    ["192.168.0.1", false],
  ])("should handle ipv4 localhost", ([ip, expected]) => {
    expect(IPv4.isLocalhost(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["127.0.0.1", false],
    ["192.168.0.1", true],
    ["10.11.12.13", true],
    ["172.16.0.1", true],
  ])("should handle ipv4 private (%s)", ([ip, expected]) => {
    expect(IPv4.isPrivate(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["127.0.0.1", false],
    ["169.254.100.200", true],
    ["0.0.0.0", true],
    ["255.255.255.255", true],
  ])("should handle ipv4 reserved (%s)", ([ip, expected]) => {
    expect(IPv4.isReserved(ip)).toBe(expected);
  });

  test.for<[string, boolean]>([
    ["127.0.0.1", true],
    ["192.168.0.1", true],
    ["169.254.100.200", true],
    ["8.8.8.8", false],
  ])("should handle ipv4 special (%s)", ([ip, expected]) => {
    expect(IPv4.isSpecial(ip)).toBe(expected);
  });

  test.for(["not.an.ip", "256.256.256.256", ""])(
    "Ipv4Address constructor throws on invalid IP (%s)",
    ([ip]) => {
      expect(() => new Ipv4Address(ip)).toThrow();
    },
  );

  test.for([
    ["0.0.0.0/0", "1.2.3.4"],
    ["0.0.0.0/0", "255.255.255.255"],
    ["99.88.77.66/0", "192.168.0.1"],
  ])("Ipv4Subnet isInSubnet returns true for /0 prefix (%s, %s)", ([cidr, ip]) => {
    const subnet = new Ipv4Subnet(cidr);
    const addr = new Ipv4Address(ip);
    expect(subnet.isInSubnet(addr)).toBe(true);
  });

  test.for(["192.168.1.1/24", "0.0.0.0/0", "192.168.1.1/32"])(
    "Ipv4Subnet string representation (%s)",
    (cidr) => {
      const subnet = new Ipv4Subnet(cidr);
      expect(subnet.toString()).toBe(cidr);
    },
  );

  test.for([
    "192.168.1.1",
    "10.0.0.1",
    "172.16.0.1",
    "127.0.0.1",
    "8.8.8.8",
    "255.255.255.255",
    "0.0.0.0",
  ])("Ipv4Address string representation (%s)", (ip) => {
    const addr = new Ipv4Address(ip);
    expect(addr.toString()).toBe(ip);
  });
});
