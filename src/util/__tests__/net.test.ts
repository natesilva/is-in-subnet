import { expect, suite, test } from "vitest";
import * as net from "../net.ts";

suite("net", () => {
  suite("isIPv6", () => {
    test.for<{ name: string; value: string | { toString: () => string } }>([
      { name: "all zeros", value: "0000:0000:0000:0000:0000:0000:0000:0000" },
      { name: "standard format", value: "1050:0:0:0:5:600:300c:326b" },
      { name: "compressed with embedded IPv4", value: "2001:252:0:1::2008:6" },
      { name: "compressed start", value: "2001::" },
      { name: "compressed middle", value: "2001:dead::" },
      { name: "compressed end", value: "2001:dead:beef:1::" },
      { name: "compressed with suffix", value: "2001:dead:beef:1::2008:6" },
      { name: "compressed end alt", value: "2001:dead:beef::" },
      { name: "loopback compressed", value: "::" },
      { name: "localhost", value: "::1" },
      { name: "embedded IPv4 1", value: "::2001:252:1:1.1.1.1" },
      { name: "embedded IPv4 2", value: "::2001:252:1:2008:6" },
      { name: "embedded IPv4 3", value: "::2001:252:1:255.255.255.255" },
      { name: "all f's", value: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff" },
      { name: "deprecated format", value: "::192:168:0:1" }, // deprecated format but allowed by Node's net.isIPv6
      { name: "mapped IPv4", value: "::ffff:127.0.0.1" }, // mapped IPv4
      {
        name: "object with toString",
        value: { toString: () => "::2001:252:1:255.255.255.255" },
      },
    ])("should recognize valid ipv6 addresses ($name)", ({ value }) => {
      // `as any` so we can test values convertible to string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIPv6(value as any)).toBe(true);
    });

    // We specifically want to test with invalid input types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test.for<{ name: string; value: any }>([
      { name: "double compression", value: "1200::AB00:1234::2552:7777:1313" }, // uses :: twice
      { name: "invalid hex char O", value: "1200:0000:AB00:1234:O000:2552:7777:1313" }, // contains an O instead of 0
      { name: "invalid hex char g", value: "1050:0:0:0:5:600:300g:326b" }, // g is an invalid hex digit
      { name: "IPv4 address", value: "127.0.0.1" },
      { name: "domain name", value: "example.com" },
      { name: "IPv4 with hex", value: "192.168.FE.1" }, // hex digits are not allowed in IPv4 addresses
      { name: "malformed IPv4", value: "192.168.1:.1" },
      { name: "empty string", value: "" },
      { name: "null value", value: null },
      { name: "number", value: 123 },
      { name: "boolean", value: true },
      { name: "empty object", value: {} },
      { name: "object toString IPv4", value: { toString: () => "127.0.0.1" } },
      { name: "object toString invalid", value: { toString: () => "bla" } },
      { name: "IPv4 octal-like last", value: "8.8.8.08" }, // IPv4, last segment is octal-like
      { name: "IPv4 octal-like first", value: "0127.0.0.1" }, // IPv4, first segment is octal-like
      { name: "mapped IPv4 octal-like", value: "::ffff:0127.0.0.1" }, // mapped IPv4, first segment is octal-like
    ])("should not recognize invalid ipv6 addresses ($name)", ({ value }) => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIPv6(value as any)).toBe(false);
    });

    test("should return false if no address is provided", () => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((net.isIPv6 as any)()).toBe(false);
    });
  });

  suite("isIPv4", () => {
    test.for<{ name: string; value: string | { toString: () => string } }>([
      { name: "all zeros", value: "0.0.0.0" },
      { name: "all 255s", value: "255.255.255.255" },
      { name: "private network", value: "192.168.1.100" },
      { name: "localhost", value: "127.0.0.1" },
      { name: "object with toString", value: { toString: () => "127.0.0.1" } },
    ])("should recognize valid ipv4 addresses ($name)", ({ value }) => {
      // `as any` so we can test values convertible to string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIPv4(value as any)).toBe(true);
    });

    // We specifically want to test with invalid input types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test.for<{ name: string; value: any }>([
      { name: "IPv6 address", value: "2001:0db8:aaaa:0001::0200" }, // IPv6
      { name: "out of range octet", value: "192.168.256.1" }, // third octet out-of-range
      { name: "domain name", value: "example.com" },
      { name: "empty string", value: "" },
      { name: "null value", value: null },
      { name: "number", value: 123 },
      { name: "boolean", value: true },
      { name: "empty object", value: {} },
      {
        name: "object toString IPv6",
        value: { toString: () => "::2001:252:1:255.255.255.255" },
      },
      { name: "object toString invalid", value: { toString: () => "bla" } },
      { name: "IPv6 format", value: "2001:252:0:1::2008:6" },
      { name: "octal-like last", value: "8.8.8.08" }, // last segment is octal-like
      { name: "octal-like first", value: "0127.0.0.1" }, // first segment is octal-like
    ])("should not recognize invalid ipv4 addresses ($name)", ({ value }) => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIPv4(value as any)).toBe(false);
    });

    test("should return false if no address is provided", () => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((net.isIPv4 as any)()).toBe(false);
    });
  });

  suite("isIP", () => {
    test.for<{
      name: string;
      input: string | { toString: () => string };
      expected: number;
    }>([
      { name: "IPv4 localhost", input: "127.0.0.1", expected: 4 },
      {
        name: "IPv6 all zeros",
        input: "0000:0000:0000:0000:0000:0000:0000:0000",
        expected: 6,
      },
      { name: "IPv6 standard", input: "1050:0:0:0:5:600:300c:326b", expected: 6 },
      { name: "IPv6 compressed 1", input: "2001:252:0:1::2008:6", expected: 6 },
      { name: "IPv6 compressed 2", input: "2001:dead:beef:1::2008:6", expected: 6 },
      { name: "IPv6 compressed start", input: "2001::", expected: 6 },
      { name: "IPv6 compressed middle", input: "2001:dead::", expected: 6 },
      { name: "IPv6 compressed end", input: "2001:dead:beef::", expected: 6 },
      { name: "IPv6 compressed end alt", input: "2001:dead:beef:1::", expected: 6 },
      {
        name: "IPv6 all f's",
        input: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
        expected: 6,
      },
      { name: "IPv6 embedded 1", input: "::2001:252:1:2008:6", expected: 6 },
      { name: "IPv6 embedded 2", input: "::2001:252:1:1.1.1.1", expected: 6 },
      { name: "IPv6 embedded 3", input: "::2001:252:1:255.255.255.255", expected: 6 },
      { name: "IPv6 localhost", input: "::1", expected: 6 },
      { name: "IPv6 loopback", input: "::", expected: 6 },
      {
        name: "object IPv6",
        input: { toString: () => "::2001:252:1:255.255.255.255" },
        expected: 6,
      },
      { name: "object IPv4", input: { toString: () => "127.0.0.1" }, expected: 4 },
    ])("should recognize valid addresses ($name)", ({ input, expected }) => {
      // `as any` so we can test values convertible to string
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIP(input as any)).toBe(expected);
    });

    // We specifically want to test with invalid input types.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test.for<{ name: string; value: any }>([
      { name: "invalid IPv4", value: "x127.0.0.1" },
      { name: "domain name", value: "example.com" },
      {
        name: "too many IPv6 segments",
        value: "0000:0000:0000:0000:0000:0000:0000:0000::0000",
      },
      { name: "IPv6 with trailing colon", value: ":2001:252:0:1::2008:6:" },
      { name: "IPv6 with leading colon", value: ":2001:252:0:1::2008:6" },
      { name: "IPv6 with trailing colon alt", value: "2001:252:0:1::2008:6:" },
      { name: "IPv6 double compression", value: "2001:252::1::2008:6" },
      { name: "IPv6 too long", value: "::2001:252:1:255.255.255.255.76" },
      { name: "IPv6 invalid suffix", value: "::anything" },
      {
        name: "IPv6 segment too large",
        value: "0000:0000:0000:0000:0000:0000:12345:0000",
      },
      { name: "single zero", value: "0" },
      { name: "empty string", value: "" },
      { name: "null value", value: null },
      { name: "number", value: 123 },
      { name: "boolean", value: true },
      { name: "empty object", value: {} },
      { name: "object invalid", value: { toString: () => "bla" } },
    ])("should not recognize invalid addresses ($name)", ({ value }) => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(net.isIP(value as any)).toBe(0);
    });

    test("should return 0 if no address is provided", () => {
      // `as any` so we can test non-string values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((net.isIP as any)()).toBe(0);
    });
  });
});
