import * as net from 'net';

import {
  isIPv4MappedAddress,
  isInSubnet,
  isLocalhost,
  isPrivate,
  isReserved,
  isSpecial
} from '../src/index';

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

test('subnet membership (one-at-a-time)', async t => {
  fixtures.forEach(([ip, subnet, expected]) => {
    t.is(isInSubnet(ip, subnet), expected);
  });
});

test('subnet membership (array)', async t => {
  const uniqueIps = new Set<string>(fixtures.map(f => f[0]));

  uniqueIps.forEach(ip => {
    const inSubnets = fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    t.true(isInSubnet(ip, inSubnets));

    const notInSubnets = fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.false(isInSubnet(ip, notInSubnets));
  });
});

test('private addresses', async t => {
  t.true(isPrivate('192.168.0.1'));
  t.true(isPrivate('fe80::5555:1111:2222:7777%utun2'));
});

test('localhost addresses', async t => {
  t.true(isLocalhost('127.0.0.1'));
  t.true(isLocalhost('::1'));
});

test('IPv4 mapped addresses', async t => {
  t.false(isIPv4MappedAddress('8.8.8.8'));
  t.true(isIPv4MappedAddress('::ffff:8.8.8.8'));
});

test('reserved addresses', async t => {
  t.true(isReserved('169.254.100.200'));
  t.true(isReserved('2001:db8:f53a::1'));
});

test('special addresses', async t => {
  t.true(isSpecial('127.0.0.1'));
  t.true(isSpecial('::'));
});
