import ipv4fixtures from "../test/fixtures/ipv4.ts";
import { IPv4 } from "./index.ts";
import { strict as assert } from "node:assert";

const checkerCache = new Map<string, (ip: string) => boolean>();

// approximately 100K test runs
const cycleCount = Math.floor(100_000 / ipv4fixtures.length);

// cache the repeatedly used checkers.
const checkers = ipv4fixtures.map(([, subnet]) => {
  let checker = checkerCache.get(subnet);
  if (!checker) {
    checker = IPv4.createChecker(subnet);
    checkerCache.set(subnet, checker);
  }
  return checker;
});

const start = performance.now();
for (let index = 0; index < cycleCount; ++index) {
  ipv4fixtures.forEach(([ip, , expected], i) => {
    assert.equal(checkers[i](ip), expected);
  });
}
const elapsed = performance.now() - start;
assert.equal(elapsed < 4000, true);

const friendlyElapsed = elapsed / 1000;
const average = Math.floor((cycleCount * ipv4fixtures.length) / friendlyElapsed);
console.debug(
  `average IPv4 performance was ${average.toLocaleString()} per second (cached checker)`,
);
