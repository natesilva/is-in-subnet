import { expect, suite, test } from "vitest";
import { Ipv4Address } from "../ipv4-address.ts";

suite("Ipv4Address", () => {
  suite("constructor", () => {
    test("creates instance with valid IPv4 address", () => {
      const ip = new Ipv4Address("192.168.1.1");
      expect(ip).toBeInstanceOf(Ipv4Address);
      expect(ip.ip).toBe("192.168.1.1");
      expect(ip.toString()).toBe("192.168.1.1");
    });

    test.for<string>([
      "0.0.0.0",
      "255.255.255.255",
      "127.0.0.1",
      "10.0.0.1",
      "172.16.0.1",
      "192.168.0.1",
      "8.8.8.8",
      "1.1.1.1",
      "203.0.113.1",
      "198.51.100.1",
    ])("creates instance for valid IPv4 address: %s", (ipAddress) => {
      const ip = new Ipv4Address(ipAddress);
      expect(ip.ip).toBe(ipAddress);
      expect(ip.toString()).toBe(ipAddress);
    });

    test.for<string>([
      "256.0.0.1", // octet > 255
      "192.168.1.256", // last octet > 255
      "999.999.999.999", // all octets > 255
      "192.168.1", // missing octet
      "192.168.1.1.1", // too many octets
      "192.168.01.1", // leading zero
      "192.168.001.1", // leading zeros
      "192.168.1.01", // leading zero in last octet
      "01.168.1.1", // leading zero in first octet
      "192.168.1.", // trailing dot
      ".192.168.1.1", // leading dot
      "192..168.1.1", // double dot
      "192.168..1.1", // double dot
      "192.168.1..1", // double dot
      "192.168.1.1.", // trailing dot
      "192.168.1.a", // non-numeric character
      "192.168.a.1", // non-numeric character
      "a.168.1.1", // non-numeric character
      "192.168.1.1a", // trailing non-numeric
      "192.168.1.-1", // negative number
      "192.168.-1.1", // negative number
      "-192.168.1.1", // negative number
      "192 168 1 1", // spaces instead of dots
      "192,168,1,1", // commas instead of dots
      "", // empty string
      " ", // whitespace
      "192.168.1.1 ", // trailing whitespace
      " 192.168.1.1", // leading whitespace
      "not-an-ip", // completely invalid
      "192.168.1", // too short
      "192.168.1.1.1.1", // too long
      "300.168.1.1", // first octet > 255
      "192.300.1.1", // second octet > 255
      "192.168.300.1", // third octet > 255
    ])("throws error for invalid IPv4 address: %s", (invalidIp) => {
      expect(() => new Ipv4Address(invalidIp)).toThrow(
        `not a valid IPv4 address: ${invalidIp}`,
      );
    });

    test("throws error for string that is too short", () => {
      expect(() => new Ipv4Address("1.1.1")).toThrow("not a valid IPv4 address: 1.1.1");
    });

    test("throws error for string that is too long", () => {
      const longIp = "192.168.1.1.extra.long.string";
      expect(() => new Ipv4Address(longIp)).toThrow(
        `not a valid IPv4 address: ${longIp}`,
      );
    });
  });

  suite("ip property", () => {
    test("returns the original IP string", () => {
      const ipString = "10.0.0.1";
      const ip = new Ipv4Address(ipString);
      expect(ip.ip).toBe(ipString);
    });

    test("ip property is readonly", () => {
      const ip = new Ipv4Address("192.168.1.1");
      // TypeScript should prevent this, but we can verify the property descriptor
      const descriptor = Object.getOwnPropertyDescriptor(ip, "ip");
      expect(descriptor).toBeUndefined(); // Should be a getter, not a property
    });
  });

  suite("long property", () => {
    test("converts 0.0.0.0 to 0", () => {
      const ip = new Ipv4Address("0.0.0.0");
      expect(ip.long).toBe(0);
    });

    test("converts 255.255.255.255 to 4294967295", () => {
      const ip = new Ipv4Address("255.255.255.255");
      expect(ip.long).toBe(4294967295);
    });

    test("converts 127.0.0.1 to 2130706433", () => {
      const ip = new Ipv4Address("127.0.0.1");
      expect(ip.long).toBe(2130706433);
    });

    test("converts 192.168.1.1 to 3232235777", () => {
      const ip = new Ipv4Address("192.168.1.1");
      expect(ip.long).toBe(3232235777);
    });

    test("converts 10.0.0.1 to 167772161", () => {
      const ip = new Ipv4Address("10.0.0.1");
      expect(ip.long).toBe(167772161);
    });

    test("converts 172.16.0.1 to 2886729729", () => {
      const ip = new Ipv4Address("172.16.0.1");
      expect(ip.long).toBe(2886729729);
    });

    test("converts 8.8.8.8 to 134744072", () => {
      const ip = new Ipv4Address("8.8.8.8");
      expect(ip.long).toBe(134744072);
    });

    test("long property is readonly", () => {
      const ip = new Ipv4Address("192.168.1.1");
      // TypeScript should prevent this, but we can verify the property descriptor
      const descriptor = Object.getOwnPropertyDescriptor(ip, "long");
      expect(descriptor).toBeUndefined(); // Should be a getter, not a property
    });

    test("long value is always unsigned 32-bit integer", () => {
      const testCases = ["0.0.0.0", "127.255.255.255", "128.0.0.0", "255.255.255.255"];

      for (const ipString of testCases) {
        const ip = new Ipv4Address(ipString);
        expect(ip.long).toBeGreaterThanOrEqual(0);
        expect(ip.long).toBeLessThanOrEqual(4294967295);
        expect(Number.isInteger(ip.long)).toBe(true);
      }
    });
  });

  suite("toString method", () => {
    test("returns the original IP string", () => {
      const ipString = "203.0.113.1";
      const ip = new Ipv4Address(ipString);
      expect(ip.toString()).toBe(ipString);
    });

    test("toString matches ip property", () => {
      const ipString = "198.51.100.1";
      const ip = new Ipv4Address(ipString);
      expect(ip.toString()).toBe(ip.ip);
    });
  });

  suite("edge cases", () => {
    test("handles minimum length valid IP", () => {
      const ip = new Ipv4Address("0.0.0.0");
      expect(ip.ip).toBe("0.0.0.0");
      expect(ip.long).toBe(0);
    });

    test("handles maximum length valid IP", () => {
      const ip = new Ipv4Address("255.255.255.255");
      expect(ip.ip).toBe("255.255.255.255");
      expect(ip.long).toBe(4294967295);
    });

    test("rejects IP with length exactly at boundary (too short)", () => {
      expect(() => new Ipv4Address("1.1.1.")).toThrow();
    });

    test("rejects IP with length exactly at boundary (too long)", () => {
      expect(() => new Ipv4Address("192.168.1.1000")).toThrow();
    });

    test("validates each octet independently", () => {
      // Test that validation doesn't stop at first valid octet
      expect(() => new Ipv4Address("192.256.1.1")).toThrow();
      expect(() => new Ipv4Address("192.168.256.1")).toThrow();
      expect(() => new Ipv4Address("192.168.1.256")).toThrow();
    });

    test("rejects leading zeros in any position", () => {
      expect(() => new Ipv4Address("01.1.1.1")).toThrow();
      expect(() => new Ipv4Address("1.01.1.1")).toThrow();
      expect(() => new Ipv4Address("1.1.01.1")).toThrow();
      expect(() => new Ipv4Address("1.1.1.01")).toThrow();
    });

    test("allows single zero in octets", () => {
      const ip = new Ipv4Address("0.0.0.0");
      expect(ip.ip).toBe("0.0.0.0");
    });

    test("correctly counts dots", () => {
      expect(() => new Ipv4Address("192.168.1")).toThrow(); // 2 dots
      expect(() => new Ipv4Address("192.168.1.1.1")).toThrow(); // 4 dots
    });
  });

  suite("immutability", () => {
    test("instance properties cannot be modified", () => {
      const ip = new Ipv4Address("192.168.1.1");

      // Attempt to modify should fail (TypeScript prevents this, but test runtime behavior)
      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        ip.ip = "10.0.0.1";
      }).toThrow();

      expect(() => {
        // @ts-expect-error - Testing runtime immutability
        ip.long = 12345;
      }).toThrow();

      // Original values should remain unchanged
      expect(ip.ip).toBe("192.168.1.1");
      expect(ip.long).toBe(3232235777);
    });
  });

  suite("consistency", () => {
    test("multiple instances with same IP are equivalent", () => {
      const ip1 = new Ipv4Address("192.168.1.1");
      const ip2 = new Ipv4Address("192.168.1.1");

      expect(ip1.ip).toBe(ip2.ip);
      expect(ip1.long).toBe(ip2.long);
      expect(ip1.toString()).toBe(ip2.toString());
    });

    test("different instances are independent", () => {
      const ip1 = new Ipv4Address("192.168.1.1");
      const ip2 = new Ipv4Address("10.0.0.1");

      expect(ip1.ip).not.toBe(ip2.ip);
      expect(ip1.long).not.toBe(ip2.long);
      expect(ip1.toString()).not.toBe(ip2.toString());
    });
  });
});
