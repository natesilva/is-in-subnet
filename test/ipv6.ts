import * as IPv6 from '../src/ipv6';

import ipv6fixtures from './fixtures/ipv6';
import test from 'ava';

test('ipv6 subnet membership (one-at-a-time)', async t => {
  ipv6fixtures.forEach(([ip, subnet, expected]) => {
    t.is(IPv6.isInSubnet(ip, subnet), expected);
  });
});

test('ipv6 subnet membership (array)', async t => {
  const uniqueIps = new Set<string>(ipv6fixtures.map(f => f[0]));

  uniqueIps.forEach(ip => {
    const inSubnets = ipv6fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
    if (inSubnets.length) {
      t.true(IPv6.isInSubnet(ip, inSubnets));
    }

    const notInSubnets = ipv6fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
    t.false(IPv6.isInSubnet(ip, notInSubnets));
  });
});

test('handles empty subnet array', async t => {
  const ip = ipv6fixtures[0][0];
  t.false(IPv6.isInSubnet(ip, []));
});

test('invalid subnets', async t => {
  t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1'));
  t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/-1'));
  t.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/129'));
});

test('invalid ipv6', async t => {
  t.throws(() => IPv6.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
  t.throws(() => IPv6.isInSubnet('::ffff:22.33', '2001:db8:f53a::1:1/64'));
  t.throws(() => IPv6.isInSubnet('::ffff:192.168.0.256', '2001:db8:f53a::1:1/64'));
});

test('ipv6 localhost', async t => {
  t.true(IPv6.isLocalhost('::1'));
  t.false(IPv6.isLocalhost('::2'));
});

test('ipv6 private', async t => {
  t.false(IPv6.isPrivate('::1'));
  t.true(IPv6.isPrivate('fe80::5555:1111:2222:7777%utun2'));
  t.true(IPv6.isPrivate('fdc5:3c04:80bf:d9ee::1'));
});

test('ipv6 mapped', async t => {
  t.false(IPv6.isIPv4MappedAddress('::1'));
  t.false(IPv6.isIPv4MappedAddress('fe80::5555:1111:2222:7777%utun2'));
  t.true(IPv6.isIPv4MappedAddress('::ffff:192.168.0.1'));

  // THIS FORMAT IS DEPRECATED AND WE DO NOT SUPPORT IT: SEE RFC4291 SECTION 2.5.5.1
  // https://tools.ietf.org/html/rfc4291#section-2.5.5.1
  t.throws(() => IPv6.isIPv4MappedAddress('::192.168.0.1'));
});

test('ipv6 reserved', async t => {
  t.true(IPv6.isReserved('2001:db8:f53a::1'));
  t.false(IPv6.isReserved('2001:4860:4860::8888'));
  t.true(IPv6.isReserved('::'));
});

test('ipv6 special', async t => {
  t.false(IPv6.isSpecial('2001:4860:4860::8888'));
  t.true(IPv6.isSpecial('::1'));
  t.false(IPv6.isSpecial('::ffff:192.168.0.1'));
  t.true(IPv6.isSpecial('2001:db8:f53a::1'));
});

test('extract mapped ipv4', async t => {
  t.is(IPv6.extractMappedIpv4('::ffff:127.0.0.1'), '127.0.0.1');

  // bogus IP should throw
  t.throws(() => IPv6.extractMappedIpv4('::ffff:444.333.2.1'));

  // invalid address format should throw
  t.throws(() => IPv6.extractMappedIpv4('::192.168.0.1'));
});
