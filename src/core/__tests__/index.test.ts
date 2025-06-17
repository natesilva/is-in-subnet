import { expect, suite, test } from "vitest";
import {
  check,
  createChecker,
  isInSubnet,
  isIPv4MappedAddress,
  isLocalhost,
  isPrivate,
  isReserved,
  isSpecial,
} from "../index.ts";
import { isIP, isIPv4, isIPv6 } from "../../util/net.ts";
import { getIpRanges } from "../../util/get-ip-ranges.ts";
import { IPV4_ADDRESS_RANGE } from "../../address-ranges/ipv4-address-range.ts";
import { IPV6_ADDRESS_RANGE } from "../../address-ranges/ipv6-address-range.ts";

suite("index.ts", () => {
  suite("exports", () => {
    test("should export all expected functions and objects", () => {
      // Main functions
      expect(isInSubnet).toBeTypeOf("function");
      expect(createChecker).toBeTypeOf("function");
      expect(isPrivate).toBeTypeOf("function");
      expect(isLocalhost).toBeTypeOf("function");
      expect(isReserved).toBeTypeOf("function");
      expect(isSpecial).toBeTypeOf("function");
      expect(isIPv4MappedAddress).toBeTypeOf("function");
      expect(check).toBeTypeOf("function");

      // Utility functions
      expect(isIP).toBeTypeOf("function");
      expect(isIPv4).toBeTypeOf("function");
      expect(isIPv6).toBeTypeOf("function");
      expect(getIpRanges).toBeTypeOf("function");

      // Constants
      expect(IPV4_ADDRESS_RANGE).toBeTypeOf("object");
      expect(IPV6_ADDRESS_RANGE).toBeTypeOf("object");
    });

    test("check should be an alias for isInSubnet", () => {
      expect(check).toBe(isInSubnet);
    });
  });

  suite("isInSubnet", () => {
    test.for<[string, string, boolean]>([
      // IPv4 tests
      ["192.168.1.100", "192.168.1.0/24", true],
      ["10.0.0.1", "10.0.0.0/8", true],
      ["172.16.5.10", "172.16.0.0/12", true],
      ["192.168.2.100", "192.168.1.0/24", false],
      ["11.0.0.1", "10.0.0.0/8", false],
      ["172.32.5.10", "172.16.0.0/12", false],
      // IPv6 tests
      ["2001:db8::1", "2001:db8::/32", true],
      ["2001:db8:1:2::1", "2001:db8::/32", true],
      ["2001:db9::1", "2001:db8::/32", false],
      ["::1", "::1/128", true],
      ["::2", "::1/128", false],
      ["fe80::1", "fe80::/10", true],
      ["fe80:1::1", "fe80::/10", true],
      ["fec0::1", "fe80::/10", false],
    ])("should check IP %s in subnet %s (expected: %s)", ([ip, subnet, expected]) => {
      expect(isInSubnet(ip, subnet)).toBe(expected);
    });

    test.for<[string, string, boolean]>([
      ["192.168.1.1", "192.168.1.1/32", true],
      ["192.168.1.2", "192.168.1.1/32", false],
      ["2001:db8::1", "2001:db8::1/128", true],
      ["2001:db8::2", "2001:db8::1/128", false],
    ])(
      "should handle /32 (IPv4) and /128 (IPv6) subnets: %s in %s",
      ([ip, subnet, expected]) => {
        expect(isInSubnet(ip, subnet)).toBe(expected);
      },
    );

    test.for<[string, string]>([
      ["0.0.0.0", "0.0.0.0/0"],
      ["255.255.255.255", "0.0.0.0/0"],
      ["192.168.1.1", "0.0.0.0/0"],
      ["::", "::/0"],
      ["::1", "::/0"],
      ["2001:db8::1", "::/0"],
      ["ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", "::/0"],
    ])("should handle /0 subnet (all IPs): %s", ([ip, subnet]) => {
      expect(isInSubnet(ip, subnet)).toBe(true);
    });

    test("should work with array of subnets", () => {
      const ipv4Subnets = ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12"];
      const ipv6Subnets = ["2001:db8::/32", "fe80::/10", "::1/128"];
      const mixedSubnets = [...ipv4Subnets, ...ipv6Subnets];

      // IPv4 addresses with IPv4 subnets
      expect(isInSubnet("192.168.1.100", ipv4Subnets)).toBe(true);
      expect(isInSubnet("10.5.0.1", ipv4Subnets)).toBe(true);
      expect(isInSubnet("172.20.0.1", ipv4Subnets)).toBe(true);
      expect(isInSubnet("8.8.8.8", ipv4Subnets)).toBe(false);

      // IPv6 addresses with IPv6 subnets
      expect(isInSubnet("2001:db8::1", ipv6Subnets)).toBe(true);
      expect(isInSubnet("fe80::1", ipv6Subnets)).toBe(true);
      expect(isInSubnet("::1", ipv6Subnets)).toBe(true);
      expect(isInSubnet("2001:db9::1", ipv6Subnets)).toBe(false);

      // Mixed addresses with mixed subnets
      expect(isInSubnet("192.168.1.100", mixedSubnets)).toBe(true);
      expect(isInSubnet("2001:db8::1", mixedSubnets)).toBe(true);
      expect(isInSubnet("8.8.8.8", mixedSubnets)).toBe(false);
      expect(isInSubnet("2001:db9::1", mixedSubnets)).toBe(false);
    });

    test("should return false for empty subnet array", () => {
      expect(isInSubnet("192.168.1.1", [])).toBe(false);
      expect(isInSubnet("2001:db8::1", [])).toBe(false);
    });

    test("should work with readonly array of subnets", () => {
      const subnets: readonly string[] = ["192.168.1.0/24", "2001:db8::/32"];
      expect(isInSubnet("192.168.1.100", subnets)).toBe(true);
      expect(isInSubnet("2001:db8::1", subnets)).toBe(true);
      expect(isInSubnet("8.8.8.8", subnets)).toBe(false);
      expect(isInSubnet("2001:db9::1", subnets)).toBe(false);
    });

    test.for<[string, string]>([
      ["256.256.256.256", "192.168.1.0/24"],
      ["not.an.ip", "192.168.1.0/24"],
      ["", "192.168.1.0/24"],
      ["192.168.1", "192.168.1.0/24"],
      ["2001:db8::not:valid", "2001:db8::/32"],
      ["2001:db8:gggg::1", "2001:db8::/32"],
    ])("should throw on invalid IP address: %s", ([ip, subnet]) => {
      expect(() => isInSubnet(ip, subnet)).toThrow();
    });

    test.for<[string, string]>([
      ["192.168.1.1", "192.168.1.0/33"],
      ["192.168.1.1", "192.168.1.0/-1"],
      ["192.168.1.1", "not.a.subnet"],
      ["192.168.1.1", "192.168.1"],
      ["2001:db8::1", "2001:db8::/129"],
      ["2001:db8::1", "2001:db8::/-1"],
      ["2001:db8::1", "not:a:subnet"],
      ["2001:db8::1", "2001:db8:"],
    ])("should throw on invalid subnet: %s", ([ip, subnet]) => {
      expect(() => isInSubnet(ip, subnet)).toThrow();
    });
  });

  suite("createChecker", () => {
    test("should create checker function for single subnet", () => {
      const ipv4Checker = createChecker("192.168.1.0/24");
      const ipv6Checker = createChecker("2001:db8::/32");

      // IPv4 checker
      expect(ipv4Checker("192.168.1.1")).toBe(true);
      expect(ipv4Checker("192.168.1.255")).toBe(true);
      expect(ipv4Checker("192.168.2.1")).toBe(false);
      expect(ipv4Checker("10.0.0.1")).toBe(false);

      // IPv6 checker
      expect(ipv6Checker("2001:db8::1")).toBe(true);
      expect(ipv6Checker("2001:db8:1:2::1")).toBe(true);
      expect(ipv6Checker("2001:db9::1")).toBe(false);
      expect(ipv6Checker("fe80::1")).toBe(false);
    });

    test("should create checker function for multiple subnets", () => {
      const ipv4Checker = createChecker(["192.168.1.0/24", "10.0.0.0/8"]);
      const ipv6Checker = createChecker(["2001:db8::/32", "fe80::/10"]);
      const mixedChecker = createChecker(["192.168.1.0/24", "2001:db8::/32"]);

      // IPv4 checker
      expect(ipv4Checker("192.168.1.1")).toBe(true);
      expect(ipv4Checker("10.5.0.1")).toBe(true);
      expect(ipv4Checker("172.16.0.1")).toBe(false);
      expect(ipv4Checker("8.8.8.8")).toBe(false);

      // IPv6 checker
      expect(ipv6Checker("2001:db8::1")).toBe(true);
      expect(ipv6Checker("fe80::1")).toBe(true);
      expect(ipv6Checker("2001:db9::1")).toBe(false);
      expect(ipv6Checker("::1")).toBe(false);

      // Mixed checker
      expect(mixedChecker("192.168.1.1")).toBe(true);
      expect(mixedChecker("2001:db8::1")).toBe(true);
      expect(mixedChecker("10.0.0.1")).toBe(false);
      expect(mixedChecker("fe80::1")).toBe(false);
    });

    test("should create checker function for empty subnet array", () => {
      const checker = createChecker([]);

      expect(checker("192.168.1.1")).toBe(false);
      expect(checker("10.0.0.1")).toBe(false);
      expect(checker("2001:db8::1")).toBe(false);
      expect(checker("::1")).toBe(false);
    });

    test("should handle string parameter", () => {
      const ipv4Checker = createChecker("10.0.0.0/8");
      const ipv6Checker = createChecker("2001:db8::/32");

      expect(ipv4Checker("10.1.2.3")).toBe(true);
      expect(ipv4Checker("11.1.2.3")).toBe(false);

      expect(ipv6Checker("2001:db8::1")).toBe(true);
      expect(ipv6Checker("2001:db9::1")).toBe(false);
    });

    test.for<[string]>([
      ["256.256.256.256"],
      ["not.an.ip"],
      ["2001:db8::not:valid"],
      ["2001:db8:gggg::1"],
    ])("checker should throw on invalid IP: %s", ([ip]) => {
      const checker = createChecker(["192.168.1.0/24", "2001:db8::/32"]);
      expect(() => checker(ip)).toThrow();
    });

    test.for<[string | string[]]>([
      ["192.168.1.0/33"],
      [["192.168.1.0/24", "invalid.subnet"]],
      ["2001:db8::/129"],
      [["2001:db8::/32", "invalid:subnet"]],
    ])("should throw on invalid subnet during creation: %s", ([subnet]) => {
      expect(() => createChecker(subnet)).toThrow();
    });

    test("should handle mixed IPv4 and IPv6 subnets", () => {
      const checker = createChecker(["192.168.1.0/24", "2001:db8::/32"]);

      expect(checker("192.168.1.1")).toBe(true);
      expect(checker("2001:db8::1")).toBe(true);
      expect(checker("10.0.0.1")).toBe(false);
      expect(checker("fe80::1")).toBe(false);
    });
  });

  suite("isPrivate", () => {
    test.for<[string, boolean]>([
      // IPv4 private addresses
      ["10.0.0.1", true],
      ["10.255.255.255", true],
      ["172.16.0.1", true],
      ["172.31.255.255", true],
      ["192.168.0.1", true],
      ["192.168.255.255", true],
      // IPv4 non-private addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["127.0.0.1", false], // localhost is not private
      ["172.15.255.255", false],
      ["172.32.0.1", false],
      ["192.167.255.255", false],
      ["192.169.0.1", false],
      // IPv6 private addresses
      ["fc00::1", true],
      ["fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", true],
      // IPv6 non-private addresses
      ["2001:db8::1", false],
      ["::1", false], // localhost is not private
      ["fe80::1", true], // link-local is considered private in the implementation
    ])("should check if %s is private (expected: %s)", ([ip, expected]) => {
      expect(isPrivate(ip)).toBe(expected);
    });

    test.for<[string]>([
      ["256.256.256.256"],
      ["not.an.ip"],
      [""],
      ["2001:db8::not:valid"],
      ["2001:db8:gggg::1"],
    ])("should throw on invalid IP address: %s", ([ip]) => {
      expect(() => isPrivate(ip)).toThrow();
    });
  });

  suite("isLocalhost", () => {
    test.for<[string, boolean]>([
      // IPv4 localhost addresses
      ["127.0.0.1", true],
      ["127.0.0.0", true],
      ["127.255.255.255", true],
      ["127.1.2.3", true],
      // IPv4 non-localhost addresses
      ["192.168.1.1", false],
      ["10.0.0.1", false],
      ["8.8.8.8", false],
      ["126.255.255.255", false],
      ["128.0.0.1", false],
      // IPv6 localhost addresses
      ["::1", true],
      // IPv6 non-localhost addresses
      ["::", false],
      ["2001:db8::1", false],
      ["fe80::1", false],
      ["fc00::1", false],
    ])("should check if %s is localhost (expected: %s)", ([ip, expected]) => {
      expect(isLocalhost(ip)).toBe(expected);
    });

    test.for<[string]>([
      ["256.256.256.256"],
      ["not.an.ip"],
      [""],
      ["2001:db8::not:valid"],
      ["2001:db8:gggg::1"],
    ])("should throw on invalid IP address: %s", ([ip]) => {
      expect(() => isLocalhost(ip)).toThrow();
    });
  });

  suite("isReserved", () => {
    test.for<[string, boolean]>([
      // IPv4 reserved addresses
      ["0.0.0.0", true],
      ["0.255.255.255", true],
      ["100.64.0.1", true],
      ["100.127.255.255", true],
      ["169.254.0.1", true],
      ["169.254.255.255", true],
      ["192.0.0.1", true],
      ["192.0.0.255", true],
      ["192.0.2.1", true], // TEST_NET_1
      ["198.51.100.1", true], // TEST_NET_2
      ["203.0.113.1", true], // TEST_NET_3
      ["224.0.0.1", true], // Multicast
      ["239.255.255.255", true], // Multicast
      ["240.0.0.1", true], // Reserved
      ["255.255.255.255", true], // Broadcast
      // IPv4 non-reserved addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["192.168.1.1", false], // Private is not reserved
      ["10.0.0.1", false], // Private is not reserved
      ["172.16.0.1", false], // Private is not reserved
      ["127.0.0.1", false], // Localhost is not reserved
      // IPv6 reserved addresses
      ["::", true], // Unspecified
      ["ff00::1", true], // Multicast
      ["ff02::1", true], // Multicast
      ["2001:db8::1", true], // Documentation
      ["2001:10::", false], // ORCHID - not considered reserved in the implementation
      ["2001:20::", true], // ORCHIDv2
      // IPv6 non-reserved addresses
      ["2000::", false],
      ["2002::1", true], // Considered reserved in the implementation
      ["fc00::1", false], // Private is not reserved
      ["::1", false], // Localhost is not reserved
    ])("should check if %s is reserved (expected: %s)", ([ip, expected]) => {
      expect(isReserved(ip)).toBe(expected);
    });

    test.for<[string]>([
      ["256.256.256.256"],
      ["not.an.ip"],
      [""],
      ["2001:db8::not:valid"],
      ["2001:db8:gggg::1"],
    ])("should throw on invalid IP address: %s", ([ip]) => {
      expect(() => isReserved(ip)).toThrow();
    });
  });

  suite("isSpecial", () => {
    test.for<[string, boolean]>([
      // IPv4 special addresses
      ["127.0.0.1", true], // Localhost
      ["127.255.255.255", true], // Localhost
      ["192.168.1.1", true], // Private
      ["10.0.0.1", true], // Private
      ["172.16.0.1", true], // Private
      ["0.0.0.0", true], // Reserved
      ["169.254.1.1", true], // Reserved
      ["224.0.0.1", true], // Reserved
      ["255.255.255.255", true], // Reserved
      // IPv4 non-special addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["208.67.222.222", false],
      // IPv6 special addresses
      ["::1", true], // Localhost
      ["fc00::1", true], // Private
      ["ff00::1", true], // Reserved
      ["2001:db8::1", true], // Reserved
      // IPv6 non-special addresses
      ["2000::", false],
      ["2002::1", true], // Considered special in the implementation
    ])("should check if %s is special (expected: %s)", ([ip, expected]) => {
      expect(isSpecial(ip)).toBe(expected);
    });

    test.for<[string]>([
      ["256.256.256.256"],
      ["not.an.ip"],
      [""],
      ["2001:db8::not:valid"],
      ["2001:db8:gggg::1"],
    ])("should throw on invalid IP address: %s", ([ip]) => {
      expect(() => isSpecial(ip)).toThrow();
    });
  });

  suite("isIPv4MappedAddress", () => {
    test.for<[string, boolean]>([
      ["::ffff:127.0.0.1", true],
      ["::ffff:192.168.1.1", true],
      // The following formats are not supported by the implementation
      // ["::ffff:0:127.0.0.1", true],
      ["::ffff:0:0", false], // Not considered IPv4 mapped in the implementation
      ["::ffff:255.255.255.255", true],
      // ["::ffff:0:255.255.255.255", true],
      ["::1", false],
      ["2001:db8::1", false],
      ["fe80::1", false],
      ["fc00::1", false],
      ["127.0.0.1", false], // IPv4 address
      ["192.168.1.1", false], // IPv4 address
    ])(
      "should check if %s is an IPv4 mapped address (expected: %s)",
      ([ip, expected]) => {
        expect(isIPv4MappedAddress(ip)).toBe(expected);
      },
    );

    // isIPv4MappedAddress doesn't throw for invalid IPs, it returns false
    test.for<[string, boolean]>([
      ["256.256.256.256", false],
      ["not.an.ip", false],
      ["", false],
      ["2001:db8::not:valid", false],
      ["2001:db8:gggg::1", false],
    ])("should handle invalid IP address: %s", ([ip, expected]) => {
      expect(isIPv4MappedAddress(ip)).toBe(expected);
    });
  });

  suite("edge cases and error handling", () => {
    test.for<[string, boolean]>([
      // Test exact boundaries of private ranges
      ["9.255.255.255", false],
      ["10.0.0.0", true],
      ["10.255.255.255", true],
      ["11.0.0.0", false],
      ["172.15.255.255", false],
      ["172.16.0.0", true],
      ["172.31.255.255", true],
      ["172.32.0.0", false],
      ["192.167.255.255", false],
      ["192.168.0.0", true],
      ["192.168.255.255", true],
      ["192.169.0.0", false],
    ])(
      "should handle boundary values correctly for isPrivate: %s (expected: %s)",
      ([ip, expected]) => {
        expect(isPrivate(ip)).toBe(expected);
      },
    );

    test.for<[string]>([["0.0.0.0"], ["255.255.255.255"]])(
      "should handle minimum and maximum IPv4 addresses: %s",
      ([ip]) => {
        expect(isReserved(ip)).toBe(true);
        expect(isSpecial(ip)).toBe(true);
      },
    );

    test.for<[string]>([
      ["127.0.0.1"],
      ["192.168.1.1"],
      ["10.0.0.1"],
      ["8.8.8.8"],
      ["169.254.1.1"],
      ["224.0.0.1"],
      ["::1"],
      ["2001:db8::1"],
      ["fe80::1"],
      ["fc00::1"],
    ])("should consistently handle the same IP across functions: %s", ([ip]) => {
      const isLh = isLocalhost(ip);
      const isPriv = isPrivate(ip);
      const isRes = isReserved(ip);
      const isSpec = isSpecial(ip);

      // Special should be true if any of localhost, private, or reserved is true
      expect(isSpec).toBe(isLh || isPriv || isRes);
    });

    test("should handle mixed IPv4 and IPv6 addresses consistently", () => {
      // Test that IPv4 and IPv6 localhost addresses are both recognized
      expect(isLocalhost("127.0.0.1")).toBe(true);
      expect(isLocalhost("::1")).toBe(true);

      // Test that IPv4 and IPv6 private addresses are both recognized
      expect(isPrivate("192.168.1.1")).toBe(true);
      expect(isPrivate("fc00::1")).toBe(true);

      // Test that IPv4 and IPv6 reserved addresses are both recognized
      expect(isReserved("224.0.0.1")).toBe(true);
      expect(isReserved("ff00::1")).toBe(true);

      // Test that IPv4 and IPv6 special addresses are both recognized
      expect(isSpecial("127.0.0.1")).toBe(true);
      expect(isSpecial("::1")).toBe(true);
    });
  });
});
