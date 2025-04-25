import { expect } from "vitest";
import { suite, test } from "vitest";
import {
  isInSubnet,
  isIPv4MappedAddress,
  isLocalhost,
  isPrivate,
  isReserved,
  isSpecial,
} from "../src/index";
import ipv4fixtures from "./fixtures/ipv4";
import ipv6fixtures from "./fixtures/ipv6";

const fixtures = ipv4fixtures.slice().concat(ipv6fixtures);

suite("general tests", () => {
  test("should check subnet membership (one-at-a-time)", () => {
    fixtures.forEach(([ip, subnet, expected]) => {
      expect(isInSubnet(ip, subnet)).toBe(expected);
    });
  });

  test("should check subnet membership (array)", () => {
    const uniqueIps = new Set<string>(fixtures.map((f) => f[0]));

    uniqueIps.forEach((ip) => {
      const inSubnets = fixtures.filter((t) => t[0] === ip && t[2]).map((t) => t[1]);
      if (inSubnets.length) {
        expect(isInSubnet(ip, inSubnets)).toBe(true);
      }

      const notInSubnets = fixtures.filter((t) => t[0] === ip && !t[2]).map((t) => t[1]);
      expect(isInSubnet(ip, notInSubnets)).toBe(false);
    });
  });

  test("should check subnet membership (mixed IPv4 and IPv6 array)", () => {
    const TRUSTED_ADDRESSES = ["127.0.0.1/8", "::1/128", "10.0.0.0/8", "fc00::/7"];
    expect(isInSubnet("127.1.2.3", TRUSTED_ADDRESSES)).toBe(true);
    expect(isInSubnet("10.254.254.254", TRUSTED_ADDRESSES)).toBe(true);
    expect(isInSubnet("1.2.3.4", TRUSTED_ADDRESSES)).toBe(false);

    expect(isInSubnet("::1", TRUSTED_ADDRESSES)).toBe(true);
    expect(isInSubnet("fc00::1", TRUSTED_ADDRESSES)).toBe(true);
    expect(isInSubnet("fe80::5555:1111:2222:7777", TRUSTED_ADDRESSES)).toBe(false);
  });

  test("should recognize ipv4 encapsulated in ipv6", () => {
    expect(isInSubnet("::ffff:172.16.10.10", "172.16.0.0/16")).toBe(true);
    expect(isInSubnet("::ffff:172.16.10.10", "::ffff:172.16.0.0/112")).toBe(true);
    expect(isInSubnet("::ffff:192.168.10.10", "172.16.0.0/16")).toBe(false);
    expect(isInSubnet("::ffff:192.168.10.10", "::ffff:172.16.0.0/112")).toBe(false);
  });

  test("should recognize private addresses", () => {
    expect(isPrivate("192.168.0.1")).toBe(true);
    expect(isPrivate("fe80::5555:1111:2222:7777%utun2")).toBe(true);
    expect(isPrivate("::ffff:192.168.0.1")).toBe(true);
  });

  test("should recognize localhost addresses", () => {
    expect(isLocalhost("127.0.0.1")).toBe(true);
    expect(isLocalhost("::1")).toBe(true);
    expect(isLocalhost("::ffff:127.0.0.1")).toBe(true);
  });

  test("should recognize IPv4 mapped addresses", () => {
    expect(isIPv4MappedAddress("8.8.8.8")).toBe(false);
    expect(isIPv4MappedAddress("::ffff:8.8.8.8")).toBe(true);
  });

  test("should recognize reserved addresses", () => {
    expect(isReserved("169.254.100.200")).toBe(true);
    expect(isReserved("2001:db8:f53a::1")).toBe(true);
    expect(isReserved("::ffff:169.254.100.200")).toBe(true);
  });

  test("should recognize special addresses", () => {
    expect(isSpecial("127.0.0.1")).toBe(true);
    expect(isSpecial("::")).toBe(true);
    expect(isSpecial("::ffff:127.0.0.1")).toBe(true);
  });

  test("should throw on invalid IPs", () => {
    expect(() => isInSubnet("1.2.233333.4", "2001:db8::/32")).toThrow();
    expect(() => isInSubnet("11:22:33:44:55", "2001:db8::/32")).toThrow();
    expect(() => isInSubnet("1.352352352", "0.0.0.0/0")).toThrow();
    expect(() =>
      isInSubnet("11:22:33:44:55:66:77:88:99:1010", "2001:db8:f53a::1:1/64"),
    ).toThrow();
  });

  test("should throw on invalid subnets", () => {
    expect(() => isInSubnet("1.3.3.4", "1.352352352/32")).toThrow();
    expect(() =>
      isInSubnet("::ffff:1.3.3.4", "11:22:33:44:55:66:77:88:99:1010/32"),
    ).toThrow();
    expect(() =>
      isInSubnet(
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
        "11:22:33:44:55:66:77:88:99:1010/32",
      ),
    ).toThrow();
  });
});
