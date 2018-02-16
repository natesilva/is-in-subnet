import * as IPv4 from '../src/ipv4';

import ipv4fixtures from './fixtures/ipv4';
import test from 'ava';

test('ipv4 subnet membership (one-at-a-time)', async t => {
  ipv4fixtures.forEach(([ip, subnet, expected]) => {
    t.is(IPv4.isInSubnet(ip, subnet), expected);
  });
});

test('ipv4 subnet membership (array)', async t => {
  const ip = ipv4fixtures[0][0];
  const inSubnets = ipv4fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
  if (inSubnets.length) {
    t.true(IPv4.isInSubnet(ip, inSubnets));
  }

  const notInSubnets = ipv4fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
  t.false(IPv4.isInSubnet(ip, notInSubnets));
});

test('handles empty subnet array', async t => {
  const ip = ipv4fixtures[0][0];
  t.false(IPv4.isInSubnet(ip, []));
});

test('invalid subnets', async t => {
  t.throws(() => IPv4.isInSubnet('10.5.0.1', '10.5.0.1'));
  t.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/-1'));
  t.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/33'));
});

test('invalid ipv4', async t => {
  t.throws(() => IPv4.isInSubnet('256.5.0.1', '0.0.0.0/0'));
  t.throws(() => IPv4.isInSubnet('::1', '0.0.0.0/0'));
  t.throws(() => IPv4.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
  t.throws(() => IPv4.isInSubnet('10.5.0.1', '1.2.3'));
});

test('ipv4 localhost', async t => {
  t.true(IPv4.isLocalhost('127.0.0.1'));
  t.true(IPv4.isLocalhost('127.99.88.77'));
  t.false(IPv4.isLocalhost('192.168.0.1'));
});

test('ipv4 private', async t => {
  t.false(IPv4.isPrivate('127.0.0.1'));
  t.true(IPv4.isPrivate('192.168.0.1'));
  t.true(IPv4.isPrivate('10.11.12.13'));
  t.true(IPv4.isPrivate('172.16.0.1'));
});

test('ipv4 reserved', async t => {
  t.false(IPv4.isReserved('127.0.0.1'));
  t.true(IPv4.isReserved('169.254.100.200'));
  t.true(IPv4.isReserved('0.0.0.0'));
  t.true(IPv4.isReserved('255.255.255.255'));
});

test('ipv4 special', async t => {
  t.true(IPv4.isSpecial('127.0.0.1'));
  t.true(IPv4.isSpecial('192.168.0.1'));
  t.true(IPv4.isSpecial('169.254.100.200'));
  t.false(IPv4.isSpecial('8.8.8.8'));
});
