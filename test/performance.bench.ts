import { bench, describe } from "vitest";
import { IPv4, IPv6 } from "../src/index.ts";
import ipv4fixtures from "./fixtures/ipv4.ts";
import ipv6fixtures from "./fixtures/ipv6.ts";

describe("Performance Benchmarks: IPv4", () => {
  const ipv4Fixture = ipv4fixtures[0];
  const ipv4Checker = IPv4.createChecker(ipv4Fixture[1]);

  bench("non-cached", () => {
    IPv4.isInSubnet(ipv4Fixture[0], ipv4Fixture[1]);
  });

  bench("cached", () => {
    ipv4Checker(ipv4Fixture[0]);
  });
});

describe("Performance Benchmarks: IPv6", () => {
  const ipv6Fixture = ipv6fixtures[0];
  const ipv6Checker = IPv6.createChecker(ipv6Fixture[1]);

  bench("non-cached", () => {
    IPv6.isInSubnet(ipv6Fixture[0], ipv6Fixture[1]);
  });

  bench("cached", () => {
    ipv6Checker(ipv6Fixture[0]);
  });
});
