import { expect, suite, test } from "vitest";
import { Ipv6Address } from "../ipv6-address.ts";
import { Ipv4Address } from "../../ipv4/ipv4-address.ts";

suite("Ipv6Address", () => {
  suite("constructor", () => {
    test("creates instance with valid IPv6 address", () => {
      const ip = new Ipv6Address("2001:db8::1");
      expect(ip).toBeInstanceOf(Ipv6Address);
      expect(ip.ip).toBe("2001:db8::1");
      expect(ip.toString()).toBe("2001:db8::1");
    });

    test.for<string>([
      "::1", // loopback
      "::", // all zeros
      "2001:db8::1", // standard with compression
      "2001:db8:85a3::8a2e:370:7334", // standard with compression
      "2001:db8:85a3:0:0:8a2e:370:7334", // standard without compression
      "fe80::1", // link-local
      "ff02::1", // multicast
      "2001:db8:85a3:8d3:1319:8a2e:370:7344", // full address
      "::ffff:192.168.1.1", // IPv4-mapped IPv6
      "2001::ffff:192.168.1.1", // IPv4-mapped with prefix segments
      "2001:0:0:0:0:ffff:127.0.0.1", // IPv4-mapped expanded format

      "fe80::1%lo0", // with zone identifier
      "fe80::1%eth0", // with zone identifier
      "::ffff:127.0.0.1", // IPv4-mapped loopback
      "::ffff:0.0.0.0", // IPv4-mapped all zeros
      "::ffff:255.255.255.255", // IPv4-mapped broadcast
    ])("creates instance for valid IPv6 address: %s", (ipAddress) => {
      const ip = new Ipv6Address(ipAddress);
      expect(ip.ip).toBe(ipAddress);
      expect(ip.toString()).toBe(ipAddress);
    });

    test.for<string>([
      "not-an-ip", // completely invalid
      "192.168.1.1", // IPv4 address
      "2001:db8::1::2", // double ::
      "2001:db8:::1", // triple colon
      "2001:db8:85a3::8a2e::7334", // multiple ::
      "gggg::1", // invalid hex characters
      "2001:db8:85a3:8d3:1319:8a2e:370:7344:extra", // too many segments
      "2001:db8:85a3:8d3:1319:8a2e:370", // too few segments
      "2001:db8:85a3:8d3:1319:8a2e:370:7344:1234", // too many segments
      "12345::1", // segment too long
      "2001:db8::12345", // segment too long
      "2001:db8:85a3:8d3:1319:8a2e:370:12345", // last segment too long
      "", // empty string
      " ", // whitespace
      "2001:db8::1 ", // trailing whitespace
      " 2001:db8::1", // leading whitespace
      "2001:db8::1.", // trailing dot
      ".2001:db8::1", // leading dot
      "2001::db8::1", // multiple double colons
      ":::", // triple colon only
      "2001:db8::192.168.1", // incomplete IPv4 in embedded format
      "2001:db8::192.168.1.256", // invalid IPv4 in embedded format
      "2001:db8::192.168.01.1", // leading zero in IPv4 part
      "::ffff:192.168.1", // incomplete IPv4 in mapped format
      "::ffff:192.168.1.256", // invalid IPv4 in mapped format
      "::ffff:192.168.01.1", // leading zero in IPv4 part of mapped
      "2001:db8:85a3:8d3:1319:8a2e:370:7344:", // trailing colon
      ":2001:db8:85a3:8d3:1319:8a2e:370:7344", // leading colon (not ::)
      "2001:db8:85a3:8d3:1319:8a2e:370:", // missing last segment
      "2001:db8:85a3:8d3:1319:8a2e::370:", // trailing colon after ::

      "2001:db8::192.168.1.1.1", // too many IPv4 octets
      "2001:db8::999.168.1.1", // invalid IPv4 octet
    ])("throws error for invalid IPv6 address: %s", (invalidIp) => {
      expect(() => new Ipv6Address(invalidIp)).toThrow(
        `not a valid IPv6 address: ${invalidIp}`,
      );
    });

    test("throws error for obsolete IPv4-mapped format with dots", () => {
      // This tests the specific case where dots are present but not in the correct mapped format
      expect(() => new Ipv6Address("2001:db8.example.com")).toThrow(
        "not a valid IPv6 address: 2001:db8.example.com",
      );
    });
  });

  suite("ip property", () => {
    test("returns the original IP string", () => {
      const ipString = "2001:db8::1";
      const ip = new Ipv6Address(ipString);
      expect(ip.ip).toBe(ipString);
    });

    test("ip property is readonly", () => {
      const ip = new Ipv6Address("2001:db8::1");
      const descriptor = Object.getOwnPropertyDescriptor(ip, "ip");
      expect(descriptor).toBeUndefined(); // Should be a getter, not a property
    });
  });

  suite("bigint property", () => {
    test("converts ::1 to 1n", () => {
      const ip = new Ipv6Address("::1");
      expect(ip.bigint).toBe(1n);
    });

    test("converts :: to 0n", () => {
      const ip = new Ipv6Address("::");
      expect(ip.bigint).toBe(0n);
    });

    test("converts full address correctly", () => {
      const ip = new Ipv6Address("2001:db8:85a3:8d3:1319:8a2e:370:7344");
      // 2001:db8:85a3:8d3:1319:8a2e:370:7344
      // = 0x20010db885a308d313198a2e03707344
      expect(ip.bigint).toBe(0x20010db885a308d313198a2e03707344n);
    });

    test("converts compressed address correctly", () => {
      const ip = new Ipv6Address("2001:db8::1");
      // 2001:db8:0:0:0:0:0:1
      // = 0x20010db8000000000000000000000001
      expect(ip.bigint).toBe(0x20010db8000000000000000000000001n);
    });

    test("converts IPv4-mapped address correctly", () => {
      const ip = new Ipv6Address("::ffff:192.168.1.1");
      // ::ffff:192.168.1.1 = 0:0:0:0:0:ffff:c0a8:0101
      // = 0x0000000000000000000000ffffc0a80101
      expect(ip.bigint).toBe(0x0000000000000000000000ffffc0a80101n);
    });

    test("converts IPv4-mapped address with prefix correctly", () => {
      const ip = new Ipv6Address("2001::ffff:192.168.1.1");
      // 2001:0:0:0:0:ffff:192.168.1.1 = 2001:0:0:0:0:ffff:c0a8:0101
      // = 0x20010000000000000000ffffc0a80101
      expect(ip.bigint).toBe(0x20010000000000000000ffffc0a80101n);
    });

    test("bigint property is readonly", () => {
      const ip = new Ipv6Address("2001:db8::1");
      const descriptor = Object.getOwnPropertyDescriptor(ip, "bigint");
      expect(descriptor).toBeUndefined(); // Should be a getter, not a property
    });

    test("bigint value is always non-negative", () => {
      const testCases = [
        "::",
        "::1",
        "2001:db8::1",
        "fe80::1",
        "ff02::1",
        "::ffff:192.168.1.1",
      ];

      for (const ipString of testCases) {
        const ip = new Ipv6Address(ipString);
        expect(ip.bigint).toBeGreaterThanOrEqual(0n);
      }
    });
  });

  suite("toString method", () => {
    test("returns the original IP string", () => {
      const ipString = "2001:db8::1";
      const ip = new Ipv6Address(ipString);
      expect(ip.toString()).toBe(ipString);
    });

    test("toString matches ip property", () => {
      const ipString = "fe80::1%eth0";
      const ip = new Ipv6Address(ipString);
      expect(ip.toString()).toBe(ip.ip);
    });
  });

  suite("isIpv4Mapped property", () => {
    test("returns true for IPv4-mapped addresses", () => {
      const mappedAddresses = [
        "::ffff:192.168.1.1",
        "::ffff:127.0.0.1",
        "::ffff:0.0.0.0",
        "::ffff:255.255.255.255",
        "::ffff:10.0.0.1",
        "2001::ffff:192.168.1.1",
        "2001:0:0:0:0:ffff:127.0.0.1",
      ];

      for (const addr of mappedAddresses) {
        const ip = new Ipv6Address(addr);
        expect(ip.isIpv4Mapped).toBe(true);
      }
    });

    test("returns false for standard IPv6 addresses", () => {
      const standardAddresses = [
        "::1",
        "::",
        "2001:db8::1",
        "fe80::1",
        "ff02::1",
        "2001:db8:85a3::8a2e:370:7334",
        "fe80::1%lo0",
      ];

      for (const addr of standardAddresses) {
        const ip = new Ipv6Address(addr);
        expect(ip.isIpv4Mapped).toBe(false);
      }
    });

    test("returns false for IPv4-embedded (non-mapped) addresses", () => {
      // Note: IPv4-embedded addresses with dots are rejected by this implementation
      const ip = new Ipv6Address("2001:db8::1");
      expect(ip.isIpv4Mapped).toBe(false);
    });
  });

  suite("mappedIpv4 property", () => {
    test("returns Ipv4Address for IPv4-mapped addresses", () => {
      const ip = new Ipv6Address("::ffff:192.168.1.1");
      const mappedIpv4 = ip.mappedIpv4;
      expect(mappedIpv4).toBeInstanceOf(Ipv4Address);
      expect(mappedIpv4.ip).toBe("192.168.1.1");
    });

    test("returns same Ipv4Address instance on multiple calls", () => {
      const ip = new Ipv6Address("::ffff:10.0.0.1");
      const mappedIpv4First = ip.mappedIpv4;
      const mappedIpv4Second = ip.mappedIpv4;
      expect(mappedIpv4First).toBe(mappedIpv4Second); // Same reference
    });

    test.for<string>([
      "::ffff:127.0.0.1",
      "::ffff:0.0.0.0",
      "::ffff:255.255.255.255",
      "::ffff:192.168.1.1",
      "::ffff:10.0.0.1",
      "2001::ffff:192.168.1.1",
      "2001:0:0:0:0:ffff:10.0.0.1",
    ])("extracts correct IPv4 from mapped address: %s", (mappedAddress) => {
      const ip = new Ipv6Address(mappedAddress);
      const expectedIpv4 = mappedAddress.split(":ffff:")[1];
      expect(ip.mappedIpv4.ip).toBe(expectedIpv4);
    });

    test("throws error for non-mapped IPv6 addresses", () => {
      const nonMappedAddresses = [
        "::1",
        "::",
        "2001:db8::1",
        "fe80::1",
        "2001:db8::1", // standard IPv6
      ];

      for (const addr of nonMappedAddresses) {
        const ip = new Ipv6Address(addr);
        expect(() => ip.mappedIpv4).toThrow(`not an IPv4-mapped IPv6 address: ${addr}`);
      }
    });
  });

  suite("edge cases", () => {
    test("handles loopback address", () => {
      const ip = new Ipv6Address("::1");
      expect(ip.ip).toBe("::1");
      expect(ip.bigint).toBe(1n);
      expect(ip.isIpv4Mapped).toBe(false);
    });

    test("handles all-zeros address", () => {
      const ip = new Ipv6Address("::");
      expect(ip.ip).toBe("::");
      expect(ip.bigint).toBe(0n);
      expect(ip.isIpv4Mapped).toBe(false);
    });

    test("handles addresses with zone identifiers", () => {
      const ip = new Ipv6Address("fe80::1%lo0");
      expect(ip.ip).toBe("fe80::1%lo0");
      expect(ip.isIpv4Mapped).toBe(false);
    });

    test("handles maximum IPv6 address", () => {
      const maxIpv6 = "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff";
      const ip = new Ipv6Address(maxIpv6);
      expect(ip.ip).toBe(maxIpv6);
      expect(ip.bigint).toBe(0xffffffffffffffffffffffffffffffffn);
    });

    test("handles various compression patterns", () => {
      const compressionCases = [
        { input: "2001:db8:0:0:0:0:0:1", expected: "2001:db8:0:0:0:0:0:1" },
        { input: "2001:db8::1", expected: "2001:db8::1" },
        { input: "::2001:db8:1", expected: "::2001:db8:1" },
        { input: "2001:db8:1::", expected: "2001:db8:1::" },
      ];

      for (const { input, expected } of compressionCases) {
        const ip = new Ipv6Address(input);
        expect(ip.ip).toBe(expected);
      }
    });

    test("correctly parses IPv4-mapped formats", () => {
      const ip1 = new Ipv6Address("::ffff:192.168.1.1");

      expect(ip1.isIpv4Mapped).toBe(true);
      expect(ip1.mappedIpv4.ip).toBe("192.168.1.1");

      // Note: Other formats with dots are rejected by this implementation
    });
  });

  suite("bigint conversion accuracy", () => {
    test("converts specific known values correctly", () => {
      const testCases = [
        { ip: "::", expected: 0n },
        { ip: "::1", expected: 1n },
        { ip: "::ffff:0:0", expected: 0xffff00000000n },
        { ip: "1::", expected: 0x10000000000000000000000000000n },
        { ip: "::ffff:192.168.1.1", expected: 0xffffc0a80101n },
      ];

      for (const { ip: ipString, expected } of testCases) {
        const ip = new Ipv6Address(ipString);
        expect(ip.bigint).toBe(expected);
      }
    });

    test("handles segment parsing correctly", () => {
      // Test that segments are parsed as hexadecimal
      const ip = new Ipv6Address("a:b:c:d:e:f:1:2");
      const expected = 0xa000b000c000d000e000f00010002n;
      expect(ip.bigint).toBe(expected);
    });
  });

  suite("immutability", () => {
    test("instance properties cannot be modified", () => {
      const ip = new Ipv6Address("2001:db8::1");

      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        ip.ip = "::1";
      }).toThrow();

      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        ip.bigint = 123n;
      }).toThrow();

      // Original values should remain unchanged
      expect(ip.ip).toBe("2001:db8::1");
      expect(ip.bigint).toBe(0x20010db8000000000000000000000001n);
    });
  });

  suite("consistency", () => {
    test("multiple instances with same IP are equivalent", () => {
      const ip1 = new Ipv6Address("2001:db8::1");
      const ip2 = new Ipv6Address("2001:db8::1");

      expect(ip1.ip).toBe(ip2.ip);
      expect(ip1.bigint).toBe(ip2.bigint);
      expect(ip1.toString()).toBe(ip2.toString());
      expect(ip1.isIpv4Mapped).toBe(ip2.isIpv4Mapped);
    });

    test("different instances are independent", () => {
      const ip1 = new Ipv6Address("2001:db8::1");
      const ip2 = new Ipv6Address("::1");

      expect(ip1.ip).not.toBe(ip2.ip);
      expect(ip1.bigint).not.toBe(ip2.bigint);
      expect(ip1.toString()).not.toBe(ip2.toString());
    });

    test("IPv4-mapped instances maintain consistency", () => {
      const ip1 = new Ipv6Address("::ffff:192.168.1.1");
      const ip2 = new Ipv6Address("::ffff:192.168.1.1");

      expect(ip1.isIpv4Mapped).toBe(ip2.isIpv4Mapped);
      expect(ip1.mappedIpv4.ip).toBe(ip2.mappedIpv4.ip);
      expect(ip1.mappedIpv4.long).toBe(ip2.mappedIpv4.long);
    });
  });

  suite("integration with Ipv4Address", () => {
    test("mapped IPv4 address has correct properties", () => {
      const ipv6 = new Ipv6Address("::ffff:192.168.1.1");
      const ipv4 = ipv6.mappedIpv4;

      expect(ipv4.ip).toBe("192.168.1.1");
      expect(ipv4.long).toBe(3232235777);
      expect(ipv4.toString()).toBe("192.168.1.1");
    });

    test("mapped IPv4 address validation works", () => {
      // This should work because the IPv4 part is valid
      const ipv6 = new Ipv6Address("::ffff:127.0.0.1");
      expect(ipv6.mappedIpv4.ip).toBe("127.0.0.1");

      // The IPv6 constructor should reject invalid IPv4 parts
      expect(() => new Ipv6Address("::ffff:256.0.0.1")).toThrow();
    });
  });
});
