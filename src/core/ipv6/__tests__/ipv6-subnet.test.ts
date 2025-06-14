import { expect, suite, test } from "vitest";
import { Ipv6Subnet } from "../ipv6-subnet.ts";
import { Ipv6Address } from "../ipv6-address.ts";
import { Ipv4Address } from "../../ipv4/ipv4-address.ts";

suite("Ipv6Subnet", () => {
  suite("constructor", () => {
    test("creates instance with valid IPv6 subnet", () => {
      const subnet = new Ipv6Subnet("2001:db8::/32");
      expect(subnet).toBeInstanceOf(Ipv6Subnet);
      expect(subnet.toString()).toBe("2001:db8::/32");
    });

    test.for<string>([
      "::/0", // all addresses
      "::1/128", // loopback single host
      "2001:db8::/32", // common documentation prefix
      "2001:db8:85a3::/48", // /48 subnet
      "2001:db8:85a3:8d3::/64", // /64 subnet (common)
      "2001:db8:85a3:8d3:1319::/80", // /80 subnet
      "2001:db8:85a3:8d3:1319:8a2e::/96", // /96 subnet
      "2001:db8:85a3:8d3:1319:8a2e:370::/112", // /112 subnet
      "fe80::/10", // link-local prefix
      "ff00::/8", // multicast prefix
      "::ffff:0:0/96", // IPv4-mapped prefix
      "2001:db8::1/128", // single host with compression
      "fe80::1%lo0/128", // with zone identifier
    ])("creates instance for valid IPv6 subnet: %s", (subnetString) => {
      const subnet = new Ipv6Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });

    test.for<string>([
      "2001:db8::", // missing prefix length
      "/64", // missing IP address
      "2001:db8::/", // missing prefix length after slash
      "2001:db8::/64/extra", // extra parts
      "gggg::/64", // invalid IP address
      "2001:db8::/129", // prefix length too large
      "2001:db8::/-1", // negative prefix length
      "2001:db8::/64.5", // decimal prefix length
      "2001:db8::/abc", // non-numeric prefix length
      "2001:db8::/64.0", // decimal prefix length
      "not-an-ip/64", // completely invalid IP
      "2001:db8::/64/96", // multiple slashes
      "", // empty string
      " ", // whitespace
      "2001:db8:: /64", // space before slash
      "2001:db8::/ 64", // space after slash
      "2001:db8::/64 ", // trailing space
      " 2001:db8::/64", // leading space
      "2001:db8::/064", // leading zero in prefix
      "192.168.1.0/24", // IPv4 subnet
    ])("throws error for invalid IPv6 subnet: %s", (invalidSubnet) => {
      expect(() => new Ipv6Subnet(invalidSubnet)).toThrow();
    });

    test("throws specific error for invalid subnet format", () => {
      expect(() => new Ipv6Subnet("2001:db8::")).toThrow(
        "not a valid IPv6 CIDR subnet: 2001:db8::",
      );
    });

    test("throws specific error for invalid prefix length", () => {
      expect(() => new Ipv6Subnet("2001:db8::/129")).toThrow(
        "not a valid IPv6 prefix length: 129 (from 2001:db8::/129)",
      );
    });

    test("throws specific error for negative prefix length", () => {
      expect(() => new Ipv6Subnet("2001:db8::/-1")).toThrow(
        "not a valid IPv6 prefix length: -1 (from 2001:db8::/-1)",
      );
    });
  });

  suite("toString method", () => {
    test("returns the original subnet string", () => {
      const subnetString = "2001:db8::/32";
      const subnet = new Ipv6Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });

    test.for<string>([
      "::/0",
      "2001:db8::/32",
      "fe80::/10",
      "::1/128",
      "2001:db8:85a3:8d3::/64",
    ])("preserves exact format for subnet: %s", (subnetString) => {
      const subnet = new Ipv6Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });
  });

  suite("isInSubnet method", () => {
    suite("with /64 subnet", () => {
      const subnet = new Ipv6Subnet("2001:db8:85a3:8d3::/64");

      test.for<string>([
        "2001:db8:85a3:8d3::", // network address
        "2001:db8:85a3:8d3::1", // first host
        "2001:db8:85a3:8d3:1234:5678:9abc:def0", // middle host
        "2001:db8:85a3:8d3:ffff:ffff:ffff:ffff", // last host
      ])("returns true for address in subnet: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>([
        "2001:db8:85a3:8d2:ffff:ffff:ffff:ffff", // one subnet below
        "2001:db8:85a3:8d4::", // one subnet above
        "2001:db8:85a3:8d2::",
        "2001:db8:85a3:8d4::1",
        "2001:db8:85a2:8d3::",
        "2001:db8:85a4:8d3::",
        "::1",
        "fe80::1",
      ])("returns false for address outside subnet: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with /0 subnet (all addresses)", () => {
      const subnet = new Ipv6Subnet("::/0");

      test.for<string>([
        "::",
        "::1",
        "2001:db8::1",
        "fe80::1",
        "ff02::1",
        "2001:db8:85a3:8d3:1319:8a2e:370:7344",
        "::ffff:192.168.1.1",
      ])("returns true for any IPv6 address: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });
    });

    suite("with /128 subnet (single host)", () => {
      const subnet = new Ipv6Subnet("2001:db8::1/128");

      test("returns true only for exact address", () => {
        const exactIp = new Ipv6Address("2001:db8::1");
        expect(subnet.isInSubnet(exactIp)).toBe(true);
      });

      test.for<string>([
        "2001:db8::",
        "2001:db8::2",
        "2001:db8:1::1",
        "2001:db7::1",
        "2001:db9::1",
        "::1",
      ])("returns false for other address: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with /32 subnet", () => {
      const subnet = new Ipv6Subnet("2001:db8::/32");

      test.for<string>([
        "2001:db8::",
        "2001:db8::1",
        "2001:db8:ffff:ffff:ffff:ffff:ffff:ffff",
        "2001:db8:1234:5678:9abc:def0:1234:5678",
        "2001:db8:85a3:8d3:1319:8a2e:370:7344",
      ])("returns true for address in 2001:db8::/32 range: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>([
        "2001:db7:ffff:ffff:ffff:ffff:ffff:ffff",
        "2001:db9::",
        "2001:dba::",
        "2000:db8::",
        "2002:db8::",
        "::1",
        "fe80::1",
      ])("returns false for address outside 2001:db8::/32 range: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with /48 subnet", () => {
      const subnet = new Ipv6Subnet("2001:db8:85a3::/48");

      test.for<string>([
        "2001:db8:85a3::", // network
        "2001:db8:85a3::1", // first host
        "2001:db8:85a3:ffff:ffff:ffff:ffff:ffff", // last host
        "2001:db8:85a3:1234:5678:9abc:def0:1234",
      ])("returns true for address in /48 range: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>([
        "2001:db8:85a2:ffff:ffff:ffff:ffff:ffff",
        "2001:db8:85a4::",
        "2001:db8:85a2::",
      ])("returns false for address outside /48 range: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with IPv4-mapped IPv6 subnet", () => {
      const subnet = new Ipv6Subnet("::ffff:0:0/96");

      test.for<string>([
        "::ffff:192.168.1.1",
        "::ffff:10.0.0.1",
        "::ffff:127.0.0.1",
        "::ffff:0.0.0.0",
        "::ffff:255.255.255.255",
      ])("returns true for IPv4-mapped address: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>(["::1", "::", "2001:db8::1", "fe80::1"])(
        "returns false for non-IPv4-mapped address: %s",
        (addr) => {
          const ip = new Ipv6Address(addr);
          expect(subnet.isInSubnet(ip)).toBe(false);
        },
      );
    });

    suite("with IPv4 addresses", () => {
      const subnet = new Ipv6Subnet("2001:db8::/32");

      test.for<string>([
        "192.168.1.1",
        "10.0.0.1",
        "127.0.0.1",
        "0.0.0.0",
        "255.255.255.255",
      ])("returns false for IPv4 address: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });
  });

  suite("edge cases", () => {
    test("handles subnet with non-network address", () => {
      // Even if the IP isn't the network address, it should work
      const subnet = new Ipv6Subnet("2001:db8::1234/64");
      expect(subnet.toString()).toBe("2001:db8::1234/64");

      // Should still match addresses in the same /64 network
      const ip = new Ipv6Address("2001:db8::5678");
      expect(subnet.isInSubnet(ip)).toBe(true);
    });

    test("handles /127 subnet correctly", () => {
      const subnet = new Ipv6Subnet("2001:db8::/127");

      expect(subnet.isInSubnet(new Ipv6Address("2001:db8::"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8::1"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8::2"))).toBe(false);
    });

    test.for<{ subnet: string; inSubnet: string; notInSubnet: string }>([
      {
        subnet: "2001:db8::/16",
        inSubnet: "2001:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        notInSubnet: "2002::",
      },
      {
        subnet: "fe80::/10",
        inSubnet: "febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        notInSubnet: "fec0::",
      },
      {
        subnet: "2001:db8:85a3::/48",
        inSubnet: "2001:db8:85a3:ffff:ffff:ffff:ffff:ffff",
        notInSubnet: "2001:db8:85a4::",
      },
      {
        subnet: "2001:db8:85a3:8d3::/64",
        inSubnet: "2001:db8:85a3:8d3:ffff:ffff:ffff:ffff",
        notInSubnet: "2001:db8:85a3:8d4::",
      },
    ])(
      "handles prefix length correctly for $subnet",
      ({ subnet: subnetStr, inSubnet, notInSubnet }) => {
        const subnet = new Ipv6Subnet(subnetStr);
        expect(subnet.isInSubnet(new Ipv6Address(inSubnet))).toBe(true);
        expect(subnet.isInSubnet(new Ipv6Address(notInSubnet))).toBe(false);
      },
    );

    test("handles loopback subnet", () => {
      const subnet = new Ipv6Subnet("::1/128");

      expect(subnet.isInSubnet(new Ipv6Address("::1"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("::"))).toBe(false);
      expect(subnet.isInSubnet(new Ipv6Address("::2"))).toBe(false);
    });

    test("handles all-zeros subnet", () => {
      const subnet = new Ipv6Subnet("::/128");

      expect(subnet.isInSubnet(new Ipv6Address("::"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("::1"))).toBe(false);
    });
  });

  suite("consistency", () => {
    test("multiple instances with same subnet are equivalent", () => {
      const subnet1 = new Ipv6Subnet("2001:db8::/32");
      const subnet2 = new Ipv6Subnet("2001:db8::/32");

      expect(subnet1.toString()).toBe(subnet2.toString());

      const testIp = new Ipv6Address("2001:db8::1");
      expect(subnet1.isInSubnet(testIp)).toBe(subnet2.isInSubnet(testIp));
    });

    test("different instances are independent", () => {
      const subnet1 = new Ipv6Subnet("2001:db8::/32");
      const subnet2 = new Ipv6Subnet("fe80::/10");

      expect(subnet1.toString()).not.toBe(subnet2.toString());

      const testIp = new Ipv6Address("2001:db8::1");
      expect(subnet1.isInSubnet(testIp)).not.toBe(subnet2.isInSubnet(testIp));
    });
  });

  suite("boundary testing", () => {
    test("tests exact boundaries of /64 subnets", () => {
      const subnet = new Ipv6Subnet("2001:db8:85a3:8d3::/64");

      // Test exact boundaries
      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d2:ffff:ffff:ffff:ffff")),
      ).toBe(false); // just before
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3::"))).toBe(true); // first in range
      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:ffff:ffff:ffff:ffff")),
      ).toBe(true); // last in range
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d4::"))).toBe(false); // just after
    });

    test("tests /80 subnet boundaries", () => {
      const subnet = new Ipv6Subnet("2001:db8:85a3:8d3:1319::/80");

      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1318:ffff:ffff:ffff")),
      ).toBe(false); // just before
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319::"))).toBe(true); // first in range
      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:ffff:ffff:ffff")),
      ).toBe(true); // last in range
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:131a::"))).toBe(false); // just after
    });

    test("tests /96 subnet boundaries", () => {
      const subnet = new Ipv6Subnet("2001:db8:85a3:8d3:1319:8a2e::/96");

      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:8a2d:ffff:ffff")),
      ).toBe(false); // just before
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:8a2e::"))).toBe(
        true,
      ); // first in range
      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:8a2e:ffff:ffff")),
      ).toBe(true); // last in range
      expect(subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:8a2f::"))).toBe(
        false,
      ); // just after
    });
  });

  suite("special IPv6 address types", () => {
    test("handles link-local addresses", () => {
      const subnet = new Ipv6Subnet("fe80::/10");

      expect(subnet.isInSubnet(new Ipv6Address("fe80::1"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("fe80::1%lo0"))).toBe(true);
      expect(
        subnet.isInSubnet(new Ipv6Address("febf:ffff:ffff:ffff:ffff:ffff:ffff:ffff")),
      ).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("fec0::"))).toBe(false);
    });

    test("handles multicast addresses", () => {
      const subnet = new Ipv6Subnet("ff00::/8");

      expect(subnet.isInSubnet(new Ipv6Address("ff02::1"))).toBe(true);
      expect(
        subnet.isInSubnet(new Ipv6Address("ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff")),
      ).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("fe80::1"))).toBe(false);
    });

    test("handles documentation prefix", () => {
      const subnet = new Ipv6Subnet("2001:db8::/32");

      expect(subnet.isInSubnet(new Ipv6Address("2001:db8::1"))).toBe(true);
      expect(
        subnet.isInSubnet(new Ipv6Address("2001:db8:85a3:8d3:1319:8a2e:370:7344")),
      ).toBe(true);
      expect(subnet.isInSubnet(new Ipv6Address("2001:db9::"))).toBe(false);
    });
  });
});
