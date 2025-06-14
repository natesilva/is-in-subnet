import { expect, suite, test } from "vitest";
import { getIpRanges } from "../get-ip-ranges.ts";
import { Ipv4Address } from "../../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../../core/ipv6/ipv6-address.ts";

suite("getIpRanges tests", () => {
  suite("IPv4 addresses", () => {
    test.for<[string, string[]]>([
      ["127.0.0.1", ["LOOPBACK"]],
      ["127.255.255.254", ["LOOPBACK"]],
      ["192.168.1.1", ["PRIVATE_IP"]],
      ["10.0.0.1", ["PRIVATE_IP"]],
      ["172.16.0.1", ["PRIVATE_IP"]],
      ["169.254.1.1", ["LINK_LOCAL"]],
      ["224.0.0.1", ["MULTICAST"]],
      ["0.0.0.0", ["BROADCAST_THIS"]],
      ["255.255.255.255", ["LIMITED_BROADCAST", "RESERVED_1"]],
      ["8.8.8.8", []], // Public IP, no special ranges
      ["1.1.1.1", []], // Public IP, no special ranges
    ])("should return correct ranges for IPv4 address %s", ([ip, expected]) => {
      expect(getIpRanges(ip)).toEqual(expect.arrayContaining(expected));
      expect(getIpRanges(ip)).toHaveLength(expected.length);
    });

    test("should work with Ipv4Address objects", () => {
      const addr = new Ipv4Address("192.168.1.1");
      expect(getIpRanges(addr)).toEqual(expect.arrayContaining(["PRIVATE_IP"]));
    });
  });

  suite("IPv6 addresses", () => {
    test.for<[string, string[]]>([
      ["::1", ["LOOPBACK"]],
      ["fe80::1", ["LINK_SCOPED_UNICAST"]],
      ["fc00::1", ["UNIQUE_LOCAL"]],
      ["fd00::1", ["UNIQUE_LOCAL"]],
      ["ff00::1", ["MULTICAST"]],
      ["::", ["UNSPECIFIED"]],
      ["2001:db8::1", ["DOCUMENTATION"]],
      ["2001:4860:4860::8888", []], // Public IP, no special ranges
      ["2606:4700:4700::1111", []], // Public IP, no special ranges
    ])("should return correct ranges for IPv6 address %s", ([ip, expected]) => {
      expect(getIpRanges(ip)).toEqual(expect.arrayContaining(expected));
      expect(getIpRanges(ip)).toHaveLength(expected.length);
    });

    test("should work with Ipv6Address objects", () => {
      const addr = new Ipv6Address("::1");
      expect(getIpRanges(addr)).toEqual(expect.arrayContaining(["LOOPBACK"]));
    });
  });

  suite("IPv4-mapped IPv6 addresses", () => {
    test.for<[string, string[]]>([
      ["::ffff:127.0.0.1", ["IPV4_MAPPED", "LOOPBACK"]],
      ["::ffff:192.168.1.1", ["IPV4_MAPPED", "PRIVATE_IP"]],
      ["::ffff:8.8.8.8", ["IPV4_MAPPED"]],
    ])("should return ranges for IPv4-mapped IPv6 address %s", ([ip, expected]) => {
      const ranges = getIpRanges(ip);
      expected.forEach((range) => {
        expect(ranges).toContain(range);
      });
    });

    test("should check both IPv6 and IPv4 ranges for mapped addresses", () => {
      const ranges = getIpRanges("::ffff:192.168.1.1");
      expect(ranges).toContain("IPV4_MAPPED"); // IPv6 range
      expect(ranges).toContain("PRIVATE_IP"); // IPv4 range
    });
  });

  suite("Edge cases", () => {
    test("should handle addresses that belong to multiple ranges", () => {
      // Some addresses might belong to multiple overlapping ranges
      const ranges = getIpRanges("127.0.0.1");
      expect(Array.isArray(ranges)).toBe(true);
      expect(ranges.length).toBeGreaterThanOrEqual(1);
    });

    test("should return empty array for public addresses", () => {
      expect(getIpRanges("8.8.8.8")).toEqual([]);
      expect(getIpRanges("2001:4860:4860::8888")).toEqual([]);
    });

    test("should throw on invalid IP addresses", () => {
      expect(() => getIpRanges("not.an.ip")).toThrow();
      expect(() => getIpRanges("256.256.256.256")).toThrow();
      expect(() => getIpRanges("")).toThrow();
    });
  });

  suite("Return type consistency", () => {
    test("should always return an array", () => {
      const testIps = ["127.0.0.1", "::1", "8.8.8.8", "192.168.1.1", "fe80::1"];

      testIps.forEach((ip) => {
        const result = getIpRanges(ip);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test("should return strings in the array", () => {
      const ranges = getIpRanges("127.0.0.1");
      ranges.forEach((range) => {
        expect(typeof range).toBe("string");
      });
    });
  });
});
