import { bench, describe } from "vitest";
import { isIPv4, isIPv6, isIP } from "../src/util/net.ts";

const validIPv4 = [
  "127.0.0.1",
  "192.168.1.1",
  "8.8.8.8",
  "255.255.255.255",
  "0.0.0.0",
  "10.0.0.1",
];

const invalidIPv4 = [
  "256.0.0.1",
  "192.168.1",
  "abc.def.ghi.jkl",
  "1234.0.0.1",
  "01.02.03.04", // leading zeroes not allowed
  "",
];

const validIPv6 = [
  "::1",
  "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
  "fe80::1ff:fe23:4567:890a",
  "2001:db8::2:1",
  "::ffff:192.0.2.128",
  "0:0:0:0:0:0:0:1",
];

const invalidIPv6 = ["2001:::1", "::g", "12345::", "::ffff:256.0.0.1", ":::", ""];

const mixed = [
  ...validIPv4,
  ...invalidIPv4,
  ...validIPv6,
  ...invalidIPv6,
  "not.an.ip",
  "123.456.789.0",
  "::ffff:300.1.1.1",
];

describe("net.ts utility function benchmarks", () => {
  bench("isIPv4 - valid", () => {
    for (const ip of validIPv4) {
      isIPv4(ip);
    }
  });

  bench("isIPv4 - invalid", () => {
    for (const ip of invalidIPv4) {
      isIPv4(ip);
    }
  });

  bench("isIPv6 - valid", () => {
    for (const ip of validIPv6) {
      isIPv6(ip);
    }
  });

  bench("isIPv6 - invalid", () => {
    for (const ip of invalidIPv6) {
      isIPv6(ip);
    }
  });

  bench("isIP - mixed", () => {
    for (const ip of mixed) {
      isIP(ip);
    }
  });
});
