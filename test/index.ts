import {
  isIPv4MappedAddress,
  isInSubnet,
  isLocalhost,
  isPrivate,
  isReserved,
  isSpecial
} from '../src/index';

import test from 'ava';

const ipv4Tests: [string, string, boolean][] = [
  ['10.5.0.1', '0.0.0.0/0', true],
  ['10.5.0.1', '11.0.0.0/8', false],
  ['10.5.0.1', '10.0.0.0/8', true],
  ['10.5.0.1', '10.0.0.1/8', true],
  ['10.5.0.1', '10.0.0.10/8', true],
  ['10.5.0.1', '10.5.5.0/16', true],
  ['10.5.0.1', '10.4.5.0/16', false],
  ['10.5.0.1', '10.4.5.0/15', true],
  ['10.5.0.1', '10.5.0.2/32', false],
  ['10.5.0.1', '10.5.0.1/32', true]
];

const ipv6Tests: [string, string, boolean][] = [
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

test('ipv4 subnet membership (one-at-a-time)', async t => {
  ipv4Tests.forEach(([ip, subnet, expected]) => {
    t.is(isInSubnet(ip, subnet), expected);
  });
});

test('ipv4 subnet membership (array)', async t => {
  const ip = ipv4Tests[0][0];
  const inSubnets = ipv4Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
  t.is(isInSubnet(ip, inSubnets), true);

  const notInSubnets = ipv4Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
  t.is(isInSubnet(ip, notInSubnets), false);
});

test('ipv6 subnet membership (one-at-a-time)', async t => {
  ipv6Tests.forEach(([ip, subnet, expected]) => {
    t.is(isInSubnet(ip, subnet), expected);
  });
});

test('ipv6 subnet membership (array)', async t => {
  const ip = ipv6Tests[0][0];
  const inSubnets = ipv6Tests.filter(t => t[0] === ip && t[2]).map(t => t[1]);
  t.is(isInSubnet(ip, inSubnets), true);

  const notInSubnets = ipv6Tests.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
  t.is(isInSubnet(ip, notInSubnets), false);
});

test('private addresses', async t => {
  t.is(isPrivate('192.168.0.1'), true);
  t.is(isPrivate('fe80::5555:1111:2222:7777%utun2'), true);
});

test('localhost addresses', async t => {
  t.is(isLocalhost('127.0.0.1'), true);
  t.is(isLocalhost('::1'), true);
});

test('IPv4 mapped addresses', async t => {
  t.is(isIPv4MappedAddress('8.8.8.8'), false);
  t.is(isIPv4MappedAddress('::ffff:8.8.8.8'), true);
});

test('reserved addresses', async t => {
  t.is(isReserved('169.254.100.200'), true);
  t.is(isReserved('2001:db8:f53a::1'), true);
});

test('special addresses', async t => {
  t.is(isSpecial('127.0.0.1'), true);
  t.is(isSpecial('::'), true);
});

test.serial(
  'should be able to test 100,000 ipv4 addresses in less than 5 seconds',
  async t => {
    const start = process.hrtime();
    // approximately 100K test runs
    let testCount = Math.floor(100_000 / ipv4Tests.length);
    for (let index = 0; index < testCount; ++index) {
      ipv4Tests.forEach(([ip, subnet, expected]) => {
        t.is(isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 5);
  }
);

test.serial(
  'should be able to test 100,000 ipv6 addresses in less than 5 seconds',
  async t => {
    const start = process.hrtime();
    // approximately 100K test runs
    let testCount = Math.floor(100_000 / ipv6Tests.length);
    for (let index = 0; index < testCount; ++index) {
      ipv6Tests.forEach(([ip, subnet, expected]) => {
        t.is(isInSubnet(ip, subnet), expected);
      });
    }
    const elapsed = process.hrtime(start);
    t.true(elapsed[0] < 5);
  }
);
