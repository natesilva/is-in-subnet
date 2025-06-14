import { bench, describe } from "vitest";
import { createChecker, isInSubnet } from "../src/index.ts";
import ipv6fixtures from "./fixtures/ipv6.ts";

describe.for(ipv6fixtures)("Performance Benchmarks: IPv6 (%s, %s)", ([ip, subnet]) => {
  const cachedChecker = createChecker(subnet);

  bench("non-cached", () => {
    isInSubnet(ip, subnet);
  });

  bench("cached", () => {
    cachedChecker(ip);
  });
});
