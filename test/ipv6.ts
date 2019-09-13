import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as IPv6 from '../src/ipv6';
import ipv6fixtures from './fixtures/ipv6';

describe('IPv6 tests', () => {
  it('should check ipv6 subnet membership (one-at-a-time)', () => {
    ipv6fixtures.forEach(([ip, subnet, expected]) => {
      assert.strictEqual(IPv6.isInSubnet(ip, subnet), expected);
    });
  });

  it('should check ipv6 subnet membership (array)', () => {
    const uniqueIps = new Set<string>(ipv6fixtures.map(f => f[0]));

    uniqueIps.forEach(ip => {
      const inSubnets = ipv6fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
      if (inSubnets.length) {
        assert.strictEqual(IPv6.isInSubnet(ip, inSubnets), true);
      }

      const notInSubnets = ipv6fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
      assert.strictEqual(IPv6.isInSubnet(ip, notInSubnets), false);
    });
  });

  it('should handle an empty subnet array', () => {
    const ip = ipv6fixtures[0][0];
    assert.strictEqual(IPv6.isInSubnet(ip, []), false);
  });

  it('should throw on invalid subnets', () => {
    assert.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1'));
    assert.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/-1'));
    assert.throws(() => IPv6.isInSubnet('2001:db8:f53a::1', '2001:db8:f53a::1/129'));
  });

  it('should throw on invalid ipv6', () => {
    assert.throws(() => IPv6.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
    assert.throws(() => IPv6.isInSubnet('::ffff:22.33', '2001:db8:f53a::1:1/64'));
    assert.throws(() => IPv6.isInSubnet('::ffff:192.168.0.256', '2001:db8:f53a::1:1/64'));
  });

  it('should handle ipv6 localhost', () => {
    assert.strictEqual(IPv6.isLocalhost('::1'), true);
    assert.strictEqual(IPv6.isLocalhost('::2'), false);
  });

  it('should handle ipv6 private', () => {
    assert.strictEqual(IPv6.isPrivate('::1'), false);
    assert.strictEqual(IPv6.isPrivate('fe80::5555:1111:2222:7777%utun2'), true);
    assert.strictEqual(IPv6.isPrivate('fdc5:3c04:80bf:d9ee::1'), true);
  });

  it('should handle ipv6 mapped', () => {
    assert.strictEqual(IPv6.isIPv4MappedAddress('::1'), false);
    assert.strictEqual(
      IPv6.isIPv4MappedAddress('fe80::5555:1111:2222:7777%utun2'),
      false
    );
    assert.strictEqual(IPv6.isIPv4MappedAddress('::ffff:192.168.0.1'), true);

    // THIS FORMAT IS DEPRECATED AND WE DO NOT SUPPORT IT: SEE RFC4291 SECTION 2.5.5.1
    // https://tools.ietf.org/html/rfc4291#section-2.5.5.1
    assert.throws(() => IPv6.isIPv4MappedAddress('::192.168.0.1'));
  });

  it('should handle ipv6 reserved', () => {
    assert.strictEqual(IPv6.isReserved('2001:db8:f53a::1'), true);
    assert.strictEqual(IPv6.isReserved('2001:4860:4860::8888'), false);
    assert.strictEqual(IPv6.isReserved('::'), true);
  });

  it('should handle ipv6 special', () => {
    assert.strictEqual(IPv6.isSpecial('2001:4860:4860::8888'), false);
    assert.strictEqual(IPv6.isSpecial('::1'), true);
    assert.strictEqual(IPv6.isSpecial('::ffff:192.168.0.1'), false);
    assert.strictEqual(IPv6.isSpecial('2001:db8:f53a::1'), true);
  });

  it('should extract mapped ipv4', () => {
    assert.strictEqual(IPv6.extractMappedIpv4('::ffff:127.0.0.1'), '127.0.0.1');

    // bogus IP should throw
    assert.throws(() => IPv6.extractMappedIpv4('::ffff:444.333.2.1'));

    // invalid address format should throw
    assert.throws(() => IPv6.extractMappedIpv4('::192.168.0.1'));
  });
});
