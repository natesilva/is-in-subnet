import { bench, describe } from "vitest";
import { createChecker, isInSubnet } from "../../../index.ts";
import ipv4fixtures from "../__fixtures__/ipv4.ts";

describe.for(ipv4fixtures)("Performance Benchmarks: IPv4 (%s, %s)", ([ip, subnet]) => {
  const cachedChecker = createChecker(subnet);

  bench("non-cached", () => {
    isInSubnet(ip, subnet);
  });

  bench("cached", () => {
    cachedChecker(ip);
  });
});
