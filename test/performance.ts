import * as net from 'net';

import { isInSubnet, IPv4, IPv6 } from '../src/index';

import test from 'ava';

const fixtures: [string, string, boolean][] = [
  ['10.5.0.1', '0.0.0.0/0', true],
  ['10.5.0.1', '11.0.0.0/8', false],
  ['10.5.0.1', '10.0.0.0/8', true],
  ['10.5.0.1', '10.0.0.1/8', true],
  ['10.5.0.1', '10.0.0.10/8', true],
  ['10.5.0.1', '10.5.5.0/16', true],
  ['10.5.0.1', '10.4.5.0/16', false],
  ['10.5.0.1', '10.4.5.0/15', true],
  ['10.5.0.1', '10.5.0.2/32', false],
  ['10.5.0.1', '10.5.0.1/32', true],
  ['2001:db8:f53a::1', '::/0', true],
  ['2001:db8:f53a::1', '2001:db8:f53a::1:1/64', true],
  ['2001:db8:f53a::1', '2001:db8:f53b::1:1/48', false],
  ['2001:db8:f53a::1', '2001:db8:f531::1:1/44', true],
  ['2001:db8:f53a::1', '2001:db8:f500::1/40', true],
  ['2001:db8:f53a::1', '2001:db8:f500::1%z/40', true],
  ['2001:db8:f53a::1', '2001:db9:f500::1/40', false],
  ['2001:db8:f53a::1', '2001:db9:f500::1%z/40', false],
  ['2001:db8:f53a:0:0:0:0:1', '2001:db8:f500:0:0:0:0:1%z/40', true]
];

// ***************************************************************************************
//
// Speed tests: We’re actually way faster than this, but this is a good low-end target. It
// also means the tests will pass on old/slow hardware and resource-constrained systems.
//
// ***************************************************************************************

test.serial(
  'should be able to test 100,000 ipv4 addresses in less than 4 seconds',
  async t => {
    const ipv4Tests = fixtures.filter(f => net.isIPv4(f[0]));
    // approximately 100K test runs
    let cycleCount = Math.floor(100_000 / ipv4Tests.length);

    const start = process.hrtime();
    for (let index = 0; index < cycleCount; ++index) {
      ipv4Tests.forEach(([ip, subnet, expected]) => {
        t.is(IPv4.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 4);

    const friendlyElapsed = elapsed[0] + elapsed[1] / 1_000_000_000;
    const average = Math.floor((cycleCount * ipv4Tests.length) / friendlyElapsed);
    t.log(`average IPv4 performance was ${average.toLocaleString()} per second`);
  }
);

test.serial(
  'should be able to test 100,000 ipv6 addresses in less than 4 seconds',
  async t => {
    const ipv6Tests = fixtures.filter(f => net.isIPv6(f[0]));
    // approximately 100K test runs
    let cycleCount = Math.floor(100_000 / ipv6Tests.length);

    const start = process.hrtime();
    for (let index = 0; index < cycleCount; ++index) {
      ipv6Tests.forEach(([ip, subnet, expected]) => {
        t.is(IPv6.isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 4);

    const friendlyElapsed = elapsed[0] + elapsed[1] / 1_000_000_000;
    const average = Math.floor((cycleCount * ipv6Tests.length) / friendlyElapsed);
    t.log(`average IPv6 performance was ${average.toLocaleString()} per second`);
  }
);
