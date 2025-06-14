import { expect, suite, test } from "vitest";
import { SubnetGroup } from "../subnet-group.ts";
import { Ipv4Address } from "../../core/ipv4/ipv4-address.ts";
import { Ipv4Subnet } from "../../core/ipv4/ipv4-subnet.ts";
import { Ipv6Address } from "../../core/ipv6/ipv6-address.ts";
import { Ipv6Subnet } from "../../core/ipv6/ipv6-subnet.ts";

suite("subnet-group", () => {
  test("should create empty subnet group", () => {
    const group = new SubnetGroup();
    const ip = new Ipv4Address("192.168.1.1");

    expect(group.isInSubnet(ip)).toBe(false);
  });

  test("should create subnet group with single IPv4 subnet", () => {
    const subnet = new Ipv4Subnet("192.168.1.0/24");
    const group = new SubnetGroup(subnet);

    const ipInSubnet = new Ipv4Address("192.168.1.100");
    const ipOutsideSubnet = new Ipv4Address("10.0.0.1");

    expect(group.isInSubnet(ipInSubnet)).toBe(true);
    expect(group.isInSubnet(ipOutsideSubnet)).toBe(false);
  });

  test("should create subnet group with single IPv6 subnet", () => {
    const subnet = new Ipv6Subnet("2001:db8::/32");
    const group = new SubnetGroup(subnet);

    const ipInSubnet = new Ipv6Address("2001:db8::1");
    const ipOutsideSubnet = new Ipv6Address("2002:db8::1");

    expect(group.isInSubnet(ipInSubnet)).toBe(true);
    expect(group.isInSubnet(ipOutsideSubnet)).toBe(false);
  });

  test("should create subnet group with multiple IPv4 subnets", () => {
    const subnet1 = new Ipv4Subnet("192.168.1.0/24");
    const subnet2 = new Ipv4Subnet("10.0.0.0/8");
    const group = new SubnetGroup(subnet1, subnet2);

    const ipInSubnet1 = new Ipv4Address("192.168.1.100");
    const ipInSubnet2 = new Ipv4Address("10.5.10.20");
    const ipOutsideSubnets = new Ipv4Address("172.16.0.1");

    expect(group.isInSubnet(ipInSubnet1)).toBe(true);
    expect(group.isInSubnet(ipInSubnet2)).toBe(true);
    expect(group.isInSubnet(ipOutsideSubnets)).toBe(false);
  });

  test("should create subnet group with mixed IPv4 and IPv6 subnets", () => {
    const ipv4Subnet = new Ipv4Subnet("192.168.0.0/16");
    const ipv6Subnet = new Ipv6Subnet("2001:db8::/32");
    const group = new SubnetGroup(ipv4Subnet, ipv6Subnet);

    const ipv4InSubnet = new Ipv4Address("192.168.100.1");
    const ipv6InSubnet = new Ipv6Address("2001:db8:1::1");
    const ipv4OutsideSubnet = new Ipv4Address("10.0.0.1");
    const ipv6OutsideSubnet = new Ipv6Address("2002:db8::1");

    expect(group.isInSubnet(ipv4InSubnet)).toBe(true);
    expect(group.isInSubnet(ipv6InSubnet)).toBe(true);
    expect(group.isInSubnet(ipv4OutsideSubnet)).toBe(false);
    expect(group.isInSubnet(ipv6OutsideSubnet)).toBe(false);
  });

  test("should handle IPv4-mapped IPv6 addresses", () => {
    const ipv4Subnet = new Ipv4Subnet("192.168.1.0/24");
    const group = new SubnetGroup(ipv4Subnet);

    // IPv4-mapped IPv6 address that maps to an IPv4 address in the subnet
    const mappedIpv6 = new Ipv6Address("::ffff:192.168.1.100");
    const regularIpv6 = new Ipv6Address("2001:db8::1");

    expect(group.isInSubnet(mappedIpv6)).toBe(true);
    expect(group.isInSubnet(regularIpv6)).toBe(false);
  });

  test("should handle IPv4-mapped IPv6 addresses not in subnet", () => {
    const ipv4Subnet = new Ipv4Subnet("192.168.1.0/24");
    const group = new SubnetGroup(ipv4Subnet);

    // IPv4-mapped IPv6 address that maps to an IPv4 address outside the subnet
    const mappedIpv6 = new Ipv6Address("::ffff:10.0.0.1");

    expect(group.isInSubnet(mappedIpv6)).toBe(false);
  });

  test("should check all subnets until match is found", () => {
    const subnet1 = new Ipv4Subnet("10.0.0.0/8");
    const subnet2 = new Ipv4Subnet("192.168.0.0/16");
    const subnet3 = new Ipv4Subnet("172.16.0.0/12");
    const group = new SubnetGroup(subnet1, subnet2, subnet3);

    // IP that matches the last subnet
    const ip = new Ipv4Address("172.16.100.1");

    expect(group.isInSubnet(ip)).toBe(true);
  });

  test("should return false when no subnets match", () => {
    const subnet1 = new Ipv4Subnet("10.0.0.0/8");
    const subnet2 = new Ipv4Subnet("192.168.0.0/16");
    const group = new SubnetGroup(subnet1, subnet2);

    const ip = new Ipv4Address("8.8.8.8");

    expect(group.isInSubnet(ip)).toBe(false);
  });

  test("should handle edge case with /0 subnet (matches all)", () => {
    const subnet = new Ipv4Subnet("0.0.0.0/0");
    const group = new SubnetGroup(subnet);

    const ip1 = new Ipv4Address("192.168.1.1");
    const ip2 = new Ipv4Address("8.8.8.8");

    expect(group.isInSubnet(ip1)).toBe(true);
    expect(group.isInSubnet(ip2)).toBe(true);
  });

  test("should handle edge case with /32 subnet (single IP)", () => {
    const subnet = new Ipv4Subnet("192.168.1.100/32");
    const group = new SubnetGroup(subnet);

    const exactIp = new Ipv4Address("192.168.1.100");
    const differentIp = new Ipv4Address("192.168.1.101");

    expect(group.isInSubnet(exactIp)).toBe(true);
    expect(group.isInSubnet(differentIp)).toBe(false);
  });

  test("should handle IPv6 /0 subnet (matches all IPv6)", () => {
    const subnet = new Ipv6Subnet("::/0");
    const group = new SubnetGroup(subnet);

    const ip1 = new Ipv6Address("2001:db8::1");
    const ip2 = new Ipv6Address("::1");
    const ipv4 = new Ipv4Address("192.168.1.1");

    expect(group.isInSubnet(ip1)).toBe(true);
    expect(group.isInSubnet(ip2)).toBe(true);
    expect(group.isInSubnet(ipv4)).toBe(false);
  });

  test("should handle IPv6 /128 subnet (single IP)", () => {
    const subnet = new Ipv6Subnet("2001:db8::1/128");
    const group = new SubnetGroup(subnet);

    const exactIp = new Ipv6Address("2001:db8::1");
    const differentIp = new Ipv6Address("2001:db8::2");

    expect(group.isInSubnet(exactIp)).toBe(true);
    expect(group.isInSubnet(differentIp)).toBe(false);
  });
});
