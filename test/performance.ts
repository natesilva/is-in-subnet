import { strict as assert } from "node:assert";
import { performance } from "node:perf_hooks";
import { beforeEach, suite, test } from "vitest";
import { IPv4, IPv6, createChecker } from "../src/index.js";
import ipv4fixtures from "./fixtures/ipv4.js";
import ipv6fixtures from "./fixtures/ipv6.js";

// ***************************************************************************************
//
// Speed tests: We’re actually way faster than this, but this is a good low-end target. It
// also means the tests will pass on old/slow hardware and resource-constrained systems.
//
// Note that Node.js’s assert is much faster than Vitest’s expect, so we use assert here
// as we want to measure the performance of the library, not the test framework.
//
// ***************************************************************************************

suite("performance", () => {
  // we keep this cache outside the tests, as it should be global
  // but we reset it each time.
  let checkerCache: Map<string, ReturnType<typeof createChecker>>;
  beforeEach(() => {
    checkerCache = new Map();
  });

  test("should be able to test 100,000 ipv4 addresses in less than 4 seconds", () => {
    // approximately 100K test runs
    const cycleCount = Math.floor(100_000 / ipv4fixtures.length);

    const start = performance.now();
    for (let index = 0; index < cycleCount; ++index) {
      ipv4fixtures.forEach(([ip, subnet, expected]) => {
        assert.strictEqual(IPv4.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = performance.now() - start;
    assert.strictEqual(elapsed < 4000, true);

    const friendlyElapsed = elapsed / 1000;
    const average = Math.floor((cycleCount * ipv4fixtures.length) / friendlyElapsed);
    console.log(`average IPv4 performance was ${average.toLocaleString()} per second`);
  });

  test("should be able to test 100,000 ipv6 addresses in less than 4 seconds", () => {
    // approximately 100K test runs
    const cycleCount = Math.floor(100_000 / ipv6fixtures.length);

    const start = performance.now();
    for (let index = 0; index < cycleCount; ++index) {
      ipv6fixtures.forEach(([ip, subnet, expected]) => {
        assert.strictEqual(IPv6.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = performance.now() - start;
    assert.strictEqual(elapsed < 4000, true);

    const friendlyElapsed = elapsed / 1000;
    const average = Math.floor((cycleCount * ipv6fixtures.length) / friendlyElapsed);
    console.log(`average IPv6 performance was ${average.toLocaleString()} per second`);
  });

  test("should be able to test 100,000 ipv4 addresses in less than 4 seconds using `createChecker`", () => {
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
        assert.strictEqual(checkers[i](ip), expected);
      });
    }
    const elapsed = performance.now() - start;
    assert.strictEqual(elapsed < 4000, true);

    const friendlyElapsed = elapsed / 1000;
    const average = Math.floor((cycleCount * ipv4fixtures.length) / friendlyElapsed);
    console.log(
      `average IPv4 performance was ${average.toLocaleString()} per second (cached checker)`,
    );
  });

  test("should be able to test 100,000 ipv6 addresses in less than 4 seconds using `createChecker`", () => {
    // approximately 100K test runs
    const cycleCount = Math.floor(100_000 / ipv6fixtures.length);

    // cache the repeatedly used checkers.
    const checkers = ipv6fixtures.map(([, subnet]) => {
      let checker = checkerCache.get(subnet);
      if (!checker) {
        checker = IPv6.createChecker(subnet);
        checkerCache.set(subnet, checker);
      }
      return checker;
    });

    const start = performance.now();
    for (let index = 0; index < cycleCount; ++index) {
      ipv6fixtures.forEach(([ip, , expected], i) => {
        assert.strictEqual(checkers[i](ip), expected);
      });
    }
    const elapsed = performance.now() - start;
    assert.strictEqual(elapsed < 4000, true);

    const friendlyElapsed = elapsed / 1000;
    const average = Math.floor((cycleCount * ipv6fixtures.length) / friendlyElapsed);
    console.log(
      `average IPv6 performance was ${average.toLocaleString()} per second (cached checker)`,
    );
  });
});
