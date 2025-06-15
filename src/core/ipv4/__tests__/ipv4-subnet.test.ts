import { expect, suite, test } from "vitest";
import { Ipv4Subnet } from "../ipv4-subnet.ts";
import { Ipv4Address } from "../ipv4-address.ts";
import { Ipv6Address } from "../../ipv6/ipv6-address.ts";
import ipv4fixtures from "../__fixtures__/ipv4.ts";

suite("Ipv4Subnet", () => {
  suite("constructor", () => {
    test("creates instance with valid IPv4 subnet", () => {
      const subnet = new Ipv4Subnet("192.168.1.0/24");
      expect(subnet).toBeInstanceOf(Ipv4Subnet);
      expect(subnet.toString()).toBe("192.168.1.0/24");
    });

    test.for<string>([
      "0.0.0.0/0", // all addresses
      "127.0.0.0/8", // class A
      "192.168.0.0/16", // class B
      "192.168.1.0/24", // class C
      "192.168.1.128/25", // half of class C
      "192.168.1.192/26", // quarter of class C
      "192.168.1.240/28", // /28 subnet
      "192.168.1.252/30", // /30 subnet (4 addresses)
      "192.168.1.254/31", // /31 subnet (2 addresses)
      "192.168.1.255/32", // single host
      "10.0.0.0/8", // private class A
      "172.16.0.0/12", // private class B
      "255.255.255.255/32", // broadcast as single host
    ])("creates instance for valid IPv4 subnet: %s", (subnetString) => {
      const subnet = new Ipv4Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });

    test.for<string>([
      "192.168.1.0", // missing prefix length
      "/24", // missing IP address

      "192.168.1.256/24", // invalid IP address
      "192.168.1.0/33", // prefix length too large
      "192.168.1.0/-1", // negative prefix length
      "192.168.1.0/24.5", // decimal prefix length
      "192.168.1.0/abc", // non-numeric prefix length

      "not-an-ip/24", // completely invalid IP

      "", // empty string
      " ", // whitespace
      "192.168.1.0 /24", // space before slash

      " 192.168.1.0/24", // leading space
      "192.168.01.0/24", // leading zero in IP
      "192.168.1.0/01", // leading zero in prefix
      "192.168.1.0/000", // multiple leading zeros in prefix
      "192.168.1.0/ ", // trailing space in prefix
      "192.168.1.0/  ", // prefix with just spaces
    ])("throws error for invalid IPv4 subnet: %s", (invalidSubnet) => {
      expect(() => new Ipv4Subnet(invalidSubnet)).toThrow();
    });

    test("throws specific error for invalid subnet format", () => {
      expect(() => new Ipv4Subnet("192.168.1.0")).toThrow(
        "not a valid IPv4 subnet: 192.168.1.0",
      );
    });

    test("throws specific error for invalid prefix length", () => {
      expect(() => new Ipv4Subnet("192.168.1.0/33")).toThrow(
        "not a valid IPv4 prefix length: 33 (from 192.168.1.0/33)",
      );
    });

    test("throws specific error for negative prefix length", () => {
      expect(() => new Ipv4Subnet("192.168.1.0/-1")).toThrow(
        "not a valid IPv4 prefix length: -1 (from 192.168.1.0/-1)",
      );
    });
  });

  suite("toString method", () => {
    test("returns the original subnet string", () => {
      const subnetString = "10.0.0.0/8";
      const subnet = new Ipv4Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });

    test.for<string>([
      "0.0.0.0/0",
      "192.168.1.0/24",
      "172.16.0.0/12",
      "10.0.0.0/8",
      "192.168.1.255/32",
    ])("preserves exact format for subnet: %s", (subnetString) => {
      const subnet = new Ipv4Subnet(subnetString);
      expect(subnet.toString()).toBe(subnetString);
    });
  });

  suite("isInSubnet method", () => {
    suite("with /24 subnet", () => {
      const subnet = new Ipv4Subnet("192.168.1.0/24");

      test.for<string>([
        "192.168.1.0", // network address
        "192.168.1.1", // first host
        "192.168.1.100", // middle host
        "192.168.1.254", // last host
        "192.168.1.255", // broadcast address
      ])("returns true for address in subnet: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>([
        "192.168.0.255", // one below network
        "192.168.2.0", // one above broadcast
        "192.168.0.1",
        "192.168.2.1",
        "10.0.0.1",
        "172.16.0.1",
        "8.8.8.8",
      ])("returns false for address outside subnet: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with /0 subnet (all addresses)", () => {
      const subnet = new Ipv4Subnet("0.0.0.0/0");

      test.for<string>([
        "0.0.0.0",
        "127.0.0.1",
        "192.168.1.1",
        "10.0.0.1",
        "172.16.0.1",
        "8.8.8.8",
        "255.255.255.255",
      ])("returns true for any IPv4 address: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });
    });

    suite("with /32 subnet (single host)", () => {
      const subnet = new Ipv4Subnet("192.168.1.100/32");

      test("returns true only for exact address", () => {
        const exactIp = new Ipv4Address("192.168.1.100");
        expect(subnet.isInSubnet(exactIp)).toBe(true);
      });

      test.for<string>([
        "192.168.1.99",
        "192.168.1.101",
        "192.168.1.0",
        "192.168.1.255",
        "192.168.0.100",
        "192.168.2.100",
      ])("returns false for other address: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });

    suite("with /8 subnet", () => {
      const subnet = new Ipv4Subnet("10.0.0.0/8");

      test.for<string>([
        "10.0.0.0",
        "10.0.0.1",
        "10.255.255.255",
        "10.1.2.3",
        "10.100.200.50",
      ])("returns true for address in 10.x.x.x range: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>(["9.255.255.255", "11.0.0.0", "192.168.1.1", "172.16.0.1"])(
        "returns false for address outside 10.x.x.x range: %s",
        (addr) => {
          const ip = new Ipv4Address(addr);
          expect(subnet.isInSubnet(ip)).toBe(false);
        },
      );
    });

    suite("with /30 subnet (4 addresses)", () => {
      const subnet = new Ipv4Subnet("192.168.1.252/30");

      test.for<string>([
        "192.168.1.252", // network
        "192.168.1.253", // first host
        "192.168.1.254", // second host
        "192.168.1.255", // broadcast
      ])("returns true for address in /30 range: %s", (addr) => {
        const ip = new Ipv4Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(true);
      });

      test.for<string>(["192.168.1.251", "192.168.2.0", "192.168.1.0"])(
        "returns false for address outside /30 range: %s",
        (addr) => {
          const ip = new Ipv4Address(addr);
          expect(subnet.isInSubnet(ip)).toBe(false);
        },
      );
    });

    suite("with IPv6 addresses", () => {
      const subnet = new Ipv4Subnet("192.168.1.0/24");

      test.for<string>([
        "::1",
        "::",
        "2001:db8::1",
        "fe80::1",
        "::ffff:192.168.1.1", // IPv4-mapped IPv6
      ])("returns false for IPv6 address: %s", (addr) => {
        const ip = new Ipv6Address(addr);
        expect(subnet.isInSubnet(ip)).toBe(false);
      });
    });
  });

  suite("edge cases", () => {
    test("handles subnet with non-network address", () => {
      // Even if the IP isn't the network address, it should work
      const subnet = new Ipv4Subnet("192.168.1.100/24");
      expect(subnet.toString()).toBe("192.168.1.100/24");

      // Should still match addresses in the same /24 network
      const ip = new Ipv4Address("192.168.1.50");
      expect(subnet.isInSubnet(ip)).toBe(true);
    });

    test("handles /31 subnet correctly", () => {
      const subnet = new Ipv4Subnet("192.168.1.0/31");

      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.0"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.1"))).toBe(true);
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.2"))).toBe(false);
    });

    test.for<{ subnet: string; inSubnet: string; notInSubnet: string }>([
      {
        subnet: "192.168.0.0/16",
        inSubnet: "192.168.255.255",
        notInSubnet: "192.169.0.0",
      },
      {
        subnet: "172.16.0.0/12",
        inSubnet: "172.31.255.255",
        notInSubnet: "172.32.0.0",
      },
      { subnet: "10.0.0.0/8", inSubnet: "10.255.255.255", notInSubnet: "11.0.0.0" },
      {
        subnet: "192.168.1.128/25",
        inSubnet: "192.168.1.255",
        notInSubnet: "192.168.1.127",
      },
    ])(
      "handles prefix length correctly for $subnet",
      ({ subnet: subnetStr, inSubnet, notInSubnet }) => {
        const subnet = new Ipv4Subnet(subnetStr);
        expect(subnet.isInSubnet(new Ipv4Address(inSubnet))).toBe(true);
        expect(subnet.isInSubnet(new Ipv4Address(notInSubnet))).toBe(false);
      },
    );
  });

  suite("consistency", () => {
    test("multiple instances with same subnet are equivalent", () => {
      const subnet1 = new Ipv4Subnet("192.168.1.0/24");
      const subnet2 = new Ipv4Subnet("192.168.1.0/24");

      expect(subnet1.toString()).toBe(subnet2.toString());

      const testIp = new Ipv4Address("192.168.1.100");
      expect(subnet1.isInSubnet(testIp)).toBe(subnet2.isInSubnet(testIp));
    });

    test("different instances are independent", () => {
      const subnet1 = new Ipv4Subnet("192.168.1.0/24");
      const subnet2 = new Ipv4Subnet("10.0.0.0/8");

      expect(subnet1.toString()).not.toBe(subnet2.toString());

      const testIp = new Ipv4Address("192.168.1.100");
      expect(subnet1.isInSubnet(testIp)).not.toBe(subnet2.isInSubnet(testIp));
    });
  });

  suite("boundary testing", () => {
    test("tests exact boundaries of subnets", () => {
      const subnet = new Ipv4Subnet("192.168.1.0/24");

      // Test exact boundaries
      expect(subnet.isInSubnet(new Ipv4Address("192.168.0.255"))).toBe(false); // just before
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.0"))).toBe(true); // first in range
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.255"))).toBe(true); // last in range
      expect(subnet.isInSubnet(new Ipv4Address("192.168.2.0"))).toBe(false); // just after
    });

    test("tests /25 subnet boundaries", () => {
      const subnet = new Ipv4Subnet("192.168.1.128/25");

      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.127"))).toBe(false); // just before
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.128"))).toBe(true); // first in range
      expect(subnet.isInSubnet(new Ipv4Address("192.168.1.255"))).toBe(true); // last in range
      expect(subnet.isInSubnet(new Ipv4Address("192.168.2.0"))).toBe(false); // just after
    });
  });

  suite("fixture-based tests", () => {
    test.for(ipv4fixtures)(
      "isInSubnet(%s, %s) should be %s",
      ([ip, subnet, expected]) => {
        const ipObj = new Ipv4Address(ip);
        const subnetObj = new Ipv4Subnet(subnet);
        expect(subnetObj.isInSubnet(ipObj)).toBe(expected);
      },
    );
  });
});
