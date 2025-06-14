import { expect, suite, test } from "vitest";
import * as IPv6 from "../ipv6.ts";

suite("Legacy IPv6 functions", () => {
  suite("isInSubnet", () => {
    test.for<[string, string, boolean]>([
      ["2001:db8::1", "2001:db8::/32", true],
      ["2001:db8:1234:5678::1", "2001:db8::/32", true],
      ["fe80::1", "fe80::/10", true],
      ["::1", "::1/128", true],
      ["2001:db8::1", "2001:db9::/32", false],
      ["2002:db8::1", "2001:db8::/32", false],
      ["fe90::1", "fe80::/10", true],
    ])("should check IP %s in subnet %s (expected: %s)", ([ip, subnet, expected]) => {
      expect(IPv6.isInSubnet(ip, subnet)).toBe(expected);
    });

    test.for<[string, string, boolean]>([
      ["2001:db8::1", "2001:db8::1/128", true],
      ["2001:db8::2", "2001:db8::1/128", false],
    ])("should handle /128 subnet: %s in %s", ([ip, subnet, expected]) => {
      expect(IPv6.isInSubnet(ip, subnet)).toBe(expected);
    });

    test.for<[string, string, boolean]>([
      ["::", "::/128", true],
      ["::1", "::/128", false],
      ["::1", "::1/128", true],
      ["::", "::1/128", false],
    ])(
      "should distinguish unspecified (::) vs loopback (::1): %s in %s",
      ([ip, subnet, expected]) => {
        expect(IPv6.isInSubnet(ip, subnet)).toBe(expected);
      },
    );

    test.for<[string, string]>([
      ["::", "::/0"],
      ["ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", "::/0"],
      ["2001:db8::1", "::/0"],
    ])("should handle /0 subnet (all IPs): %s", ([ip, subnet]) => {
      expect(IPv6.isInSubnet(ip, subnet)).toBe(true);
    });

    test("should work with array of subnets", () => {
      const subnets = ["2001:db8::/32", "fe80::/10", "fc00::/7"];

      expect(IPv6.isInSubnet("2001:db8::1", subnets)).toBe(true);
      expect(IPv6.isInSubnet("fe80::1", subnets)).toBe(true);
      expect(IPv6.isInSubnet("fc00::1", subnets)).toBe(true);
      expect(IPv6.isInSubnet("2001:4860:4860::8888", subnets)).toBe(false);
    });

    test("should return false for empty subnet array", () => {
      expect(IPv6.isInSubnet("2001:db8::1", [])).toBe(false);
    });

    test("should work with readonly array of subnets", () => {
      const subnets: readonly string[] = ["2001:db8::/32", "fe80::/10"];
      expect(IPv6.isInSubnet("2001:db8::1", subnets)).toBe(true);
      expect(IPv6.isInSubnet("2001:4860:4860::8888", subnets)).toBe(false);
    });

    test.for<[string, string]>([
      ["gggg::1", "2001:db8::/32"],
      ["not.an.ipv6", "2001:db8::/32"],
      ["", "2001:db8::/32"],
      ["2001:db8", "2001:db8::/32"],
      ["192.168.1.1", "2001:db8::/32"], // IPv4 in IPv6 context
    ])("should throw on invalid IP address: %s", ([ip, subnet]) => {
      expect(() => IPv6.isInSubnet(ip, subnet)).toThrow();
    });

    test.for<[string, string]>([
      ["2001:db8::1", "2001:db8::/129"],
      ["2001:db8::1", "2001:db8::/-1"],
      ["2001:db8::1", "not.a.subnet"],
      ["2001:db8::1", "2001:db8"],
    ])("should throw on invalid subnet: %s", ([ip, subnet]) => {
      expect(() => IPv6.isInSubnet(ip, subnet)).toThrow();
    });
  });

  suite("createChecker", () => {
    test("should create checker function for single subnet", () => {
      const checker = IPv6.createChecker("2001:db8::/32");

      expect(checker("2001:db8::1")).toBe(true);
      expect(checker("2001:db8:ffff:ffff:ffff:ffff:ffff:ffff")).toBe(true);
      expect(checker("2001:db9::1")).toBe(false);
      expect(checker("fe80::1")).toBe(false);
    });

    test("should create checker function for multiple subnets", () => {
      const checker = IPv6.createChecker(["2001:db8::/32", "fe80::/10"]);

      expect(checker("2001:db8::1")).toBe(true);
      expect(checker("fe80::1")).toBe(true);
      expect(checker("2001:4860:4860::8888")).toBe(false);
      expect(checker("::1")).toBe(false);
    });

    test("should create checker function for empty subnet array", () => {
      const checker = IPv6.createChecker([]);

      expect(checker("2001:db8::1")).toBe(false);
      expect(checker("fe80::1")).toBe(false);
      expect(checker("::1")).toBe(false);
    });

    test("should handle string parameter", () => {
      const checker = IPv6.createChecker("fe80::/10");

      expect(checker("fe80::1")).toBe(true);
      expect(checker("fe90::1")).toBe(true);
    });

    test.for<[string]>([["gggg::1"], ["not.an.ipv6"]])(
      "checker should throw on invalid IP: %s",
      ([ip]) => {
        const checker = IPv6.createChecker("2001:db8::/32");
        expect(() => checker(ip)).toThrow();
      },
    );

    test.for<[string | string[]]>([
      ["2001:db8::/129"],
      [["2001:db8::/32", "invalid.subnet"]],
    ])("should throw on invalid subnet during creation: %s", ([subnet]) => {
      expect(() => IPv6.createChecker(subnet)).toThrow();
    });
  });

  suite("isPrivate", () => {
    test.for<[string, boolean]>([
      // fc00::/7 - Unique Local Addresses
      ["fc00::1", true],
      ["fd00::1", true],
      ["fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", true],
      ["fc12:3456:7890:abcd:ef01:2345:6789:abcd", true],
      // Non-private addresses
      ["2001:db8::1", false],
      ["2001:4860:4860::8888", false],
      ["fe80::1", true], // Link-local is private
      ["::1", false], // Loopback is not private
      ["2002::1", false], // 6to4
      ["fb00::1", false], // Just outside fc00::/7
      ["fe00::1", false], // Just outside fd00::/8
    ])("should check if %s is private (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isPrivate(ip)).toBe(expected);
    });

    test.for<[string]>([["gggg::1"], ["not.an.ipv6"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv6.isPrivate(ip)).toThrow();
      },
    );
  });

  suite("isLocalhost", () => {
    test.for<[string, boolean]>([
      ["::1", true],
      ["0000:0000:0000:0000:0000:0000:0000:0001", true],
      ["2001:db8::1", false],
      ["fe80::1", false],
      ["::", false], // Unspecified address is not localhost
      ["::2", false],
      ["1::1", false],
    ])("should check if %s is localhost (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isLocalhost(ip)).toBe(expected);
    });

    test.for<[string]>([["gggg::1"], ["not.an.ipv6"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv6.isLocalhost(ip)).toThrow();
      },
    );
  });

  suite("isReserved", () => {
    test.for<[string, boolean]>([
      // :: - Unspecified address
      ["::", true],
      // Note: fe80::/10 (Link-local) is classified as private, not reserved
      // ff00::/8 - Multicast
      ["ff00::1", true],
      ["ff02::1", true],
      ["ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", true],
      // 2001:db8::/32 - Documentation
      ["2001:db8::1", true],
      ["2001:db8:ffff:ffff:ffff:ffff:ffff:ffff", true],
      // Non-reserved addresses
      ["2001:4860:4860::8888", false], // Google DNS
      ["2606:4700:4700::1111", false], // Cloudflare DNS
      ["fc00::1", false], // Private (ULA) is not reserved
      ["::1", false], // Localhost is not reserved
      ["2001:db9::1", false], // Just outside documentation range
      ["fe7f:ffff:ffff:ffff:ffff:ffff:ffff:ffff", false], // Just outside link-local
      ["fec0::1", false], // Just outside link-local upper bound
    ])("should check if %s is reserved (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isReserved(ip)).toBe(expected);
    });

    test.for<[string]>([["gggg::1"], ["not.an.ipv6"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv6.isReserved(ip)).toThrow();
      },
    );
  });

  suite("isSpecial", () => {
    test.for<[string, boolean]>([
      // Localhost
      ["::1", true],
      // Private (ULA)
      ["fc00::1", true],
      ["fd00::1", true],
      // Reserved
      ["::", true],
      ["fe80::1", true],
      ["ff00::1", true],
      ["2001:db8::1", true],
      // Public addresses
      ["2001:4860:4860::8888", false],
      ["2606:4700:4700::1111", false],
      ["2001:500:88::200", false],
    ])("should check if %s is special (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isSpecial(ip)).toBe(expected);
    });

    test.for<[string]>([["gggg::1"], ["not.an.ipv6"], [""]])(
      "should throw on invalid IP address: %s",
      ([ip]) => {
        expect(() => IPv6.isSpecial(ip)).toThrow();
      },
    );
  });

  suite("isIPv4MappedAddress", () => {
    test.for<[string, boolean]>([
      // IPv4-mapped IPv6 addresses (::ffff:0:0/96)
      ["::ffff:192.168.1.1", true],
      ["::ffff:10.0.0.1", true],
      ["::ffff:127.0.0.1", true],
      ["::ffff:0.0.0.0", true],
      ["::ffff:255.255.255.255", true],
      ["::ffff:0:c0a8:0101", false], // Hex format is not IPv4-mapped
      // Regular IPv6 addresses
      ["2001:db8::1", false],
      ["fe80::1", false],
      ["::1", false],
      ["::", false],
      ["fc00::1", false],
      // Similar but not IPv4-mapped
      ["1::ffff:192.168.1.1", true], // This actually is IPv4-mapped
    ])("should check if %s is IPv4-mapped (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isIPv4MappedAddress(ip)).toBe(expected);
    });

    test.for<[string]>([
      ["gggg::1"],
      ["not.an.ipv6"],
      [""],
      ["::192.168.1.1"], // IPv4-compatible format throws
      ["::fffe:192.168.1.1"], // Invalid IPv4-mapped format throws
      ["::ffff:0:192.168.1.1"], // Invalid IPv4-mapped format throws
    ])("should throw on invalid IP address: %s", ([ip]) => {
      expect(() => IPv6.isIPv4MappedAddress(ip)).toThrow();
    });
  });

  suite("edge cases and error handling", () => {
    test.for<[string, boolean]>([
      // Test exact boundaries of private ranges (fc00::/7)
      ["fbff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", false],
      ["fc00::", true],
      ["fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff", true],
      ["fe00::", false],
      // Test boundaries of link-local (fe80::/10) - these are private, not reserved
      ["fe7f:ffff:ffff:ffff:ffff:ffff:ffff:ffff", false],
      ["fe80::", true],
      ["febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff", true],
      ["fec0::", false],
    ])("should handle boundary values correctly: %s (expected: %s)", ([ip, expected]) => {
      expect(IPv6.isPrivate(ip)).toBe(expected);
    });

    test.for<[string]>([["::"], ["ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"]])(
      "should handle minimum and maximum IP addresses: %s",
      ([ip]) => {
        const isRes = IPv6.isReserved(ip);
        const isSpec = IPv6.isSpecial(ip);
        expect(isSpec).toBe(true); // Both should be special
        if (ip === "::") {
          expect(isRes).toBe(true); // Unspecified is reserved
        }
      },
    );

    test.for<[string]>([
      ["::1"],
      ["fc00::1"],
      ["fe80::1"],
      ["2001:4860:4860::8888"],
      ["2001:db8::1"],
      ["ff00::1"],
    ])("should consistently handle the same IP across functions: %s", ([ip]) => {
      const isLh = IPv6.isLocalhost(ip);
      const isPriv = IPv6.isPrivate(ip);
      const isRes = IPv6.isReserved(ip);
      const isSpec = IPv6.isSpecial(ip);

      // Special should be true if any of localhost, private, or reserved is true
      expect(isSpec).toBe(isLh || isPriv || isRes);
    });

    test("should handle various IPv6 address formats", () => {
      const addresses = [
        "2001:db8::1",
        "2001:0db8:0000:0000:0000:0000:0000:0001",
        "2001:db8:0:0:0:0:0:1",
        "2001:db8::0001",
      ];

      // All these represent the same address
      addresses.forEach((addr) => {
        expect(IPv6.isInSubnet(addr, "2001:db8::/32")).toBe(true);
      });
    });

    test("should handle compressed zero notation", () => {
      const testCases = [
        ["2001:db8::", "2001:db8:0000:0000:0000:0000:0000:0000"],
        ["::1", "0000:0000:0000:0000:0000:0000:0000:0001"],
        ["::", "0000:0000:0000:0000:0000:0000:0000:0000"],
      ];

      testCases.forEach(([compressed, expanded]) => {
        expect(IPv6.isInSubnet(compressed, "::/0")).toBe(true);
        expect(IPv6.isInSubnet(expanded, "::/0")).toBe(true);
        // They should behave identically
        expect(IPv6.isLocalhost(compressed)).toBe(IPv6.isLocalhost(expanded));
        expect(IPv6.isPrivate(compressed)).toBe(IPv6.isPrivate(expanded));
        expect(IPv6.isReserved(compressed)).toBe(IPv6.isReserved(expanded));
      });
    });
  });
});
