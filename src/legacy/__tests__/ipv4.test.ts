import { expect, suite, test } from "vitest";
import * as IPv4 from "../ipv4.ts";

suite("Legacy IPv4 functions", () => {
  suite("isInSubnet", () => {
    test.for<[string, string, boolean]>([
      ["192.168.1.100", "192.168.1.0/24", true],
      ["10.0.0.1", "10.0.0.0/8", true],
      ["172.16.5.10", "172.16.0.0/12", true],
      ["192.168.2.100", "192.168.1.0/24", false],
      ["11.0.0.1", "10.0.0.0/8", false],
      ["172.32.5.10", "172.16.0.0/12", false],
    ])("should check IP %s in subnet %s (expected: %s)", ([ip, subnet, expected]) => {
      expect(IPv4.isInSubnet(ip, subnet)).toBe(expected);
    });

    test.for<[string, string, boolean]>([
      ["192.168.1.1", "192.168.1.1/32", true],
      ["192.168.1.2", "192.168.1.1/32", false],
    ])("should handle /32 subnet: %s in %s", ([ip, subnet, expected]) => {
      expect(IPv4.isInSubnet(ip, subnet)).toBe(expected);
    });

    test.for<[string, string]>([
      ["0.0.0.0", "0.0.0.0/0"],
      ["255.255.255.255", "0.0.0.0/0"],
      ["192.168.1.1", "0.0.0.0/0"],
    ])("should handle /0 subnet (all IPs): %s", ([ip, subnet]) => {
      expect(IPv4.isInSubnet(ip, subnet)).toBe(true);
    });

    test("should work with array of subnets", () => {
      const subnets = ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12"];

      expect(IPv4.isInSubnet("192.168.1.100", subnets)).toBe(true);
      expect(IPv4.isInSubnet("10.5.0.1", subnets)).toBe(true);
      expect(IPv4.isInSubnet("172.20.0.1", subnets)).toBe(true);
      expect(IPv4.isInSubnet("8.8.8.8", subnets)).toBe(false);
    });

    test("should return false for empty subnet array", () => {
      expect(IPv4.isInSubnet("192.168.1.1", [])).toBe(false);
    });

    test("should work with readonly array of subnets", () => {
      const subnets: readonly string[] = ["192.168.1.0/24", "10.0.0.0/8"];
      expect(IPv4.isInSubnet("192.168.1.100", subnets)).toBe(true);
      expect(IPv4.isInSubnet("8.8.8.8", subnets)).toBe(false);
    });

    test.for<[string, string]>([
      ["256.256.256.256", "192.168.1.0/24"],
      ["not.an.ip", "192.168.1.0/24"],
      ["", "192.168.1.0/24"],
      ["192.168.1", "192.168.1.0/24"],
    ])("should throw on invalid IP address: %s", ([ip, subnet]) => {
      expect(() => IPv4.isInSubnet(ip, subnet)).toThrow();
    });

    test.for<[string, string]>([
      ["192.168.1.1", "192.168.1.0/33"],
      ["192.168.1.1", "192.168.1.0/-1"],
      ["192.168.1.1", "not.a.subnet"],
      ["192.168.1.1", "192.168.1"],
    ])("should throw on invalid subnet: %s", ([ip, subnet]) => {
      expect(() => IPv4.isInSubnet(ip, subnet)).toThrow();
    });
  });

  suite("createChecker", () => {
    test("should create checker function for single subnet", () => {
      const checker = IPv4.createChecker("192.168.1.0/24");

      expect(checker("192.168.1.1")).toBe(true);
      expect(checker("192.168.1.255")).toBe(true);
      expect(checker("192.168.2.1")).toBe(false);
      expect(checker("10.0.0.1")).toBe(false);
    });

    test("should create checker function for multiple subnets", () => {
      const checker = IPv4.createChecker(["192.168.1.0/24", "10.0.0.0/8"]);

      expect(checker("192.168.1.1")).toBe(true);
      expect(checker("10.5.0.1")).toBe(true);
      expect(checker("172.16.0.1")).toBe(false);
      expect(checker("8.8.8.8")).toBe(false);
    });

    test("should create checker function for empty subnet array", () => {
      const checker = IPv4.createChecker([]);

      expect(checker("192.168.1.1")).toBe(false);
      expect(checker("10.0.0.1")).toBe(false);
      expect(checker("127.0.0.1")).toBe(false);
    });

    test("should handle string parameter", () => {
      const checker = IPv4.createChecker("10.0.0.0/8");

      expect(checker("10.1.2.3")).toBe(true);
      expect(checker("11.1.2.3")).toBe(false);
    });

    test.for<[string]>([["256.256.256.256"], ["not.an.ip"]])(
      "checker should throw on invalid IP: %s",
      ([ip]) => {
        const checker = IPv4.createChecker("192.168.1.0/24");
        expect(() => checker(ip)).toThrow();
      },
    );

    test.for<[string | string[]]>([
      ["192.168.1.0/33"],
      [["192.168.1.0/24", "invalid.subnet"]],
    ])("should throw on invalid subnet during creation: %s", ([subnet]) => {
      expect(() => IPv4.createChecker(subnet)).toThrow();
    });
  });

  suite("isPrivate", () => {
    test.for<[string, boolean]>([
      // 10.0.0.0/8
      ["10.0.0.1", true],
      ["10.255.255.255", true],
      ["10.123.45.67", true],
      // 172.16.0.0/12
      ["172.16.0.1", true],
      ["172.31.255.255", true],
      ["172.20.1.1", true],
      // 192.168.0.0/16
      ["192.168.0.1", true],
      ["192.168.255.255", true],
      ["192.168.1.100", true],
      // Non-private addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["127.0.0.1", false],
      ["172.15.255.255", false],
      ["172.32.0.1", false],
      ["9.255.255.255", false],
      ["11.0.0.1", false],
      ["192.167.255.255", false],
      ["192.169.0.1", false],
    ])("should check if %s is private (expected: %s)", ([ip, expected]) => {
      expect(IPv4.isPrivate(ip)).toBe(expected);
    });

    test.for<[string]>([["256.256.256.256"], ["not.an.ip"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv4.isPrivate(ip)).toThrow();
      },
    );
  });

  suite("isLocalhost", () => {
    test.for<[string, boolean]>([
      ["127.0.0.1", true],
      ["127.0.0.0", true],
      ["127.255.255.255", true],
      ["127.1.2.3", true],
      ["127.99.88.77", true],
      ["192.168.1.1", false],
      ["10.0.0.1", false],
      ["8.8.8.8", false],
      ["126.255.255.255", false],
      ["128.0.0.1", false],
      ["0.0.0.0", false],
    ])("should check if %s is localhost (expected: %s)", ([ip, expected]) => {
      expect(IPv4.isLocalhost(ip)).toBe(expected);
    });

    test.for<[string]>([["256.256.256.256"], ["not.an.ip"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv4.isLocalhost(ip)).toThrow();
      },
    );
  });

  suite("isReserved", () => {
    test.for<[string, boolean]>([
      // 0.0.0.0/8 - "This host on this network"
      ["0.0.0.0", true],
      ["0.255.255.255", true],
      // 100.64.0.0/10 - Carrier Grade NAT
      ["100.64.0.1", true],
      ["100.127.255.255", true],
      // 169.254.0.0/16 - Link-local
      ["169.254.0.1", true],
      ["169.254.255.255", true],
      // 192.0.0.0/24 - IETF protocol assignments
      ["192.0.0.1", true],
      ["192.0.0.255", true],
      // Test networks
      ["192.0.2.1", true], // TEST_NET_1
      ["198.51.100.1", true], // TEST_NET_2
      ["203.0.113.1", true], // TEST_NET_3
      // Multicast
      ["224.0.0.1", true],
      ["239.255.255.255", true],
      // Reserved
      ["240.0.0.1", true],
      ["254.255.255.255", true],
      // Limited broadcast
      ["255.255.255.255", true],
      // Non-reserved addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["192.168.1.1", false],
      ["10.0.0.1", false],
      ["172.16.0.1", false],
      ["127.0.0.1", false], // localhost is not reserved
    ])("should check if %s is reserved (expected: %s)", ([ip, expected]) => {
      expect(IPv4.isReserved(ip)).toBe(expected);
    });

    test.for<[string]>([["256.256.256.256"], ["not.an.ip"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv4.isReserved(ip)).toThrow();
      },
    );
  });

  suite("isSpecial", () => {
    test.for<[string, boolean]>([
      // Localhost
      ["127.0.0.1", true],
      ["127.255.255.255", true],
      // Private
      ["192.168.1.1", true],
      ["10.0.0.1", true],
      ["172.16.0.1", true],
      // Reserved
      ["0.0.0.0", true],
      ["169.254.1.1", true],
      ["224.0.0.1", true],
      ["255.255.255.255", true],
      // Public addresses
      ["8.8.8.8", false],
      ["1.1.1.1", false],
      ["208.67.222.222", false],
      ["74.125.224.72", false],
    ])("should check if %s is special (expected: %s)", ([ip, expected]) => {
      expect(IPv4.isSpecial(ip)).toBe(expected);
    });

    test.for<[string]>([["256.256.256.256"], ["not.an.ip"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv4.isSpecial(ip)).toThrow();
      },
    );
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
    ])("should handle boundary values correctly: %s (expected: %s)", ([ip, expected]) => {
      expect(IPv4.isPrivate(ip)).toBe(expected);
    });

    test.for<[string]>([["0.0.0.0"], ["255.255.255.255"]])(
      "should handle minimum and maximum IP addresses: %s",
      ([ip]) => {
        expect(IPv4.isReserved(ip)).toBe(true);
        expect(IPv4.isSpecial(ip)).toBe(true);
      },
    );

    test.for<[string]>([
      ["127.0.0.1"],
      ["192.168.1.1"],
      ["10.0.0.1"],
      ["8.8.8.8"],
      ["169.254.1.1"],
      ["224.0.0.1"],
    ])("should consistently handle the same IP across functions: %s", ([ip]) => {
      const isLh = IPv4.isLocalhost(ip);
      const isPriv = IPv4.isPrivate(ip);
      const isRes = IPv4.isReserved(ip);
      const isSpec = IPv4.isSpecial(ip);

      // Special should be true if any of localhost, private, or reserved is true
      expect(isSpec).toBe(isLh || isPriv || isRes);
    });
  });
});
