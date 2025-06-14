import { bench, describe } from "vitest";
import { createChecker, isInSubnet } from "../src/index.ts";
import ipv4fixtures from "./fixtures/ipv4.ts";
import ipv6fixtures from "./fixtures/ipv6.ts";

describe.for(ipv4fixtures)("Performance Benchmarks: IPv4 (%s, %s)", ([ip, subnet]) => {
  const cachedChecker = createChecker(subnet);

  bench("non-cached", () => {
    isInSubnet(ip, subnet);
  });

  bench("cached", () => {
    cachedChecker(ip);
  });
});

describe.for(ipv6fixtures)("Performance Benchmarks: IPv6 (%s, %s)", ([ip, subnet]) => {
  const cachedChecker = createChecker(subnet);

  bench("non-cached", () => {
    isInSubnet(ip, subnet);
  });

  bench("cached", () => {
    cachedChecker(ip);
  });
});
