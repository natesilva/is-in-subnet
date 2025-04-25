import { expect } from "vitest";
import { suite, test } from "vitest";
import * as IPv4 from "../src/ipv4";
import ipv4fixtures from "./fixtures/ipv4";

suite("IPv4 tests", () => {
  test("should check ipv4 subnet membership (one-at-a-time)", () => {
    ipv4fixtures.forEach(([ip, subnet, expected]) => {
      expect(IPv4.isInSubnet(ip, subnet)).toBe(expected);
    });
  });

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

  test("should throw on invalid subnets", () => {
    expect(() => IPv4.isInSubnet("10.5.0.1", "10.5.0.1")).toThrow();
    expect(() => IPv4.isInSubnet("10.5.0.1", "0.0.0.0/-1")).toThrow();
    expect(() => IPv4.isInSubnet("10.5.0.1", "0.0.0.0/33")).toThrow();
    // first segment of subnet is octal-like, should throw
    expect(() => IPv4.isInSubnet("10.5.0.1", "010.0.0.0/8")).toThrow();
  });

  test("should throw on invalid ipv4", () => {
    expect(() => IPv4.isInSubnet("256.5.0.1", "0.0.0.0/0")).toThrow();
    expect(() => IPv4.isInSubnet("::1", "0.0.0.0/0")).toThrow();
    expect(() => IPv4.isInSubnet("10.5.0.1", "2001:db8:f53a::1:1/64")).toThrow();
    expect(() => IPv4.isInSubnet("10.5.0.1", "1.2.3")).toThrow();
  });

  test("should handle ipv4 localhost", () => {
    expect(IPv4.isLocalhost("127.0.0.1")).toBe(true);
    expect(IPv4.isLocalhost("127.99.88.77")).toBe(true);
    expect(IPv4.isLocalhost("192.168.0.1")).toBe(false);
  });

  test("should handle ipv4 private", () => {
    expect(IPv4.isPrivate("127.0.0.1")).toBe(false);
    expect(IPv4.isPrivate("192.168.0.1")).toBe(true);
    expect(IPv4.isPrivate("10.11.12.13")).toBe(true);
    expect(IPv4.isPrivate("172.16.0.1")).toBe(true);
  });

  test("should handle ipv4 reserved", () => {
    expect(IPv4.isReserved("127.0.0.1")).toBe(false);
    expect(IPv4.isReserved("169.254.100.200")).toBe(true);
    expect(IPv4.isReserved("0.0.0.0")).toBe(true);
    expect(IPv4.isReserved("255.255.255.255")).toBe(true);
  });

  test("should handle ipv4 special", () => {
    expect(IPv4.isSpecial("127.0.0.1")).toBe(true);
    expect(IPv4.isSpecial("192.168.0.1")).toBe(true);
    expect(IPv4.isSpecial("169.254.100.200")).toBe(true);
    expect(IPv4.isSpecial("8.8.8.8")).toBe(false);
  });
});
