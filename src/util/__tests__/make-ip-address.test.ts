import { expect, suite, test } from "vitest";
import { makeIpAddress } from "../make-ip-address.ts";
import { Ipv4Address } from "../../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../../core/ipv6/ipv6-address.ts";

suite("make-ip-address", () => {
  suite("with string input", () => {
    test("creates Ipv4Address for valid IPv4 string", () => {
      const result = makeIpAddress("192.168.1.1");
      expect(result).toBeInstanceOf(Ipv4Address);
      expect(result.ip).toBe("192.168.1.1");
      expect(result.toString()).toBe("192.168.1.1");
    });

    test.for<string>(["0.0.0.0", "255.255.255.255", "127.0.0.1", "10.0.0.1"])(
      "creates Ipv4Address for edge case IPv4 address: %s",
      (ip) => {
        const result = makeIpAddress(ip);
        expect(result).toBeInstanceOf(Ipv4Address);
        expect(result.ip).toBe(ip);
      },
    );

    test("creates Ipv6Address for valid IPv6 string", () => {
      const result = makeIpAddress("2001:db8::1");
      expect(result).toBeInstanceOf(Ipv6Address);
      expect(result.ip).toBe("2001:db8::1");
      expect(result.toString()).toBe("2001:db8::1");
    });

    test.for<string>([
      "::1",
      "::",
      "2001:db8:85a3::8a2e:370:7334",
      "2001:db8:85a3:0:0:8a2e:370:7334",
      "::ffff:192.168.1.1", // IPv4-mapped IPv6
      "fe80::1%lo0", // with zone identifier
    ])("creates Ipv6Address for IPv6 format: %s", (ip) => {
      const result = makeIpAddress(ip);
      expect(result).toBeInstanceOf(Ipv6Address);
      expect(result.ip).toBe(ip);
    });

    test.for<string>([
      "not-an-ip",
      "192.168.1",
      "192.168.1.256",
      "192.168.1.1.1",
      "999.999.999.999",
      "192.168.01.1", // leading zero
      "gggg::1",
      "2001:db8::1::2", // double ::
      "",
      " ",
      "192.168.1.1 ",
      " 192.168.1.1",
    ])("throws error for invalid IP address: %s", (invalidIp) => {
      expect(() => makeIpAddress(invalidIp)).toThrow(
        `not a valid IPv4 or IPv6 address: ${invalidIp}`,
      );
    });
  });

  suite("with IpAddress object input", () => {
    test("returns the same Ipv4Address object", () => {
      const ipv4 = new Ipv4Address("192.168.1.1");
      const result = makeIpAddress(ipv4);
      expect(result).toBe(ipv4); // Same reference
      expect(result).toBeInstanceOf(Ipv4Address);
      expect(result.ip).toBe("192.168.1.1");
    });

    test("returns the same Ipv6Address object", () => {
      const ipv6 = new Ipv6Address("2001:db8::1");
      const result = makeIpAddress(ipv6);
      expect(result).toBe(ipv6); // Same reference
      expect(result).toBeInstanceOf(Ipv6Address);
      expect(result.ip).toBe("2001:db8::1");
    });
  });

  suite("type consistency", () => {
    test("string and object inputs produce equivalent results", () => {
      const ipv4String = "10.0.0.1";
      const ipv4Object = new Ipv4Address(ipv4String);

      const fromString = makeIpAddress(ipv4String);
      const fromObject = makeIpAddress(ipv4Object);

      expect(fromString.ip).toBe(fromObject.ip);
      expect(fromString.toString()).toBe(fromObject.toString());
      expect(fromString).toBeInstanceOf(Ipv4Address);
      expect(fromObject).toBeInstanceOf(Ipv4Address);
    });

    test("IPv6 string and object inputs produce equivalent results", () => {
      const ipv6String = "::1";
      const ipv6Object = new Ipv6Address(ipv6String);

      const fromString = makeIpAddress(ipv6String);
      const fromObject = makeIpAddress(ipv6Object);

      expect(fromString.ip).toBe(fromObject.ip);
      expect(fromString.toString()).toBe(fromObject.toString());
      expect(fromString).toBeInstanceOf(Ipv6Address);
      expect(fromObject).toBeInstanceOf(Ipv6Address);
    });
  });
});
