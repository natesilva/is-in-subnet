import * as assert from 'assert';
import { describe, it } from 'mocha';
import { IPv4, IPv6 } from '../src/index';
import ipv4fixtures from './fixtures/ipv4';
import ipv6fixtures from './fixtures/ipv6';

// ***************************************************************************************
//
// Speed tests: We’re actually way faster than this, but this is a good low-end target. It
// also means the tests will pass on old/slow hardware and resource-constrained systems.
//
// ***************************************************************************************

describe('performance', function() {
  // tests in this suite can take a moment, don’t warn about that
  this.slow(4000);

  it('should be able to test 100,000 ipv4 addresses in less than 4 seconds', () => {
    // approximately 100K test runs
    const cycleCount = Math.floor(100_000 / ipv4fixtures.length);

    const start = process.hrtime();
    for (let index = 0; index < cycleCount; ++index) {
      ipv4fixtures.forEach(([ip, subnet, expected]) => {
        assert.strictEqual(IPv4.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    assert.strictEqual(elapsed[0] < 4, true);

    const friendlyElapsed = elapsed[0] + elapsed[1] / 1_000_000_000;
    const average = Math.floor((cycleCount * ipv4fixtures.length) / friendlyElapsed);
    console.log(`average IPv4 performance was ${average.toLocaleString()} per second`);
  });

  it('should be able to test 100,000 ipv6 addresses in less than 4 seconds', () => {
    // approximately 100K test runs
    const cycleCount = Math.floor(100_000 / ipv6fixtures.length);

    const start = process.hrtime();
    for (let index = 0; index < cycleCount; ++index) {
      ipv6fixtures.forEach(([ip, subnet, expected]) => {
        assert.strictEqual(IPv6.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    assert.strictEqual(elapsed[0] < 4, true);

    const friendlyElapsed = elapsed[0] + elapsed[1] / 1_000_000_000;
    const average = Math.floor((cycleCount * ipv6fixtures.length) / friendlyElapsed);
    console.log(`average IPv6 performance was ${average.toLocaleString()} per second`);
  });
});
