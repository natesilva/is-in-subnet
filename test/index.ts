import * as assert from 'assert';
import { describe, it } from 'mocha';
import {
  isInSubnet,
  isIPv4MappedAddress,
  isLocalhost,
  isPrivate,
  isReserved,
  isSpecial
} from '../src/index';
import ipv4fixtures from './fixtures/ipv4';
import ipv6fixtures from './fixtures/ipv6';

const fixtures = ipv4fixtures.slice().concat(ipv6fixtures);

describe('general tests', () => {
  it('should check subnet membership (one-at-a-time)', () => {
    fixtures.forEach(([ip, subnet, expected]) => {
      assert.strictEqual(isInSubnet(ip, subnet), expected);
    });
  });

  it('should check subnet membership (array)', () => {
    const uniqueIps = new Set<string>(fixtures.map(f => f[0]));

    uniqueIps.forEach(ip => {
      const inSubnets = fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
      if (inSubnets.length) {
        assert.strictEqual(isInSubnet(ip, inSubnets), true);
      }

      const notInSubnets = fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
      assert.strictEqual(isInSubnet(ip, notInSubnets), false);
    });
  });

  it('should check subnet membership (mixed IPv4 and IPv6 array)', () => {
    const TRUSTED_ADDRESSES = ['127.0.0.1/8', '::1/128', '10.0.0.0/8', 'fc00::/7'];
    assert.strictEqual(isInSubnet('127.1.2.3', TRUSTED_ADDRESSES), true);
    assert.strictEqual(isInSubnet('10.254.254.254', TRUSTED_ADDRESSES), true);
    assert.strictEqual(isInSubnet('1.2.3.4', TRUSTED_ADDRESSES), false);

    assert.strictEqual(isInSubnet('::1', TRUSTED_ADDRESSES), true);
    assert.strictEqual(isInSubnet('fc00::1', TRUSTED_ADDRESSES), true);
    assert.strictEqual(isInSubnet('fe80::5555:1111:2222:7777', TRUSTED_ADDRESSES), false);
  });

  it('should recognize ipv4 encapsulated in ipv6', () => {
    assert.strictEqual(isInSubnet('::ffff:172.16.10.10', '172.16.0.0/16'), true);
    assert.strictEqual(isInSubnet('::ffff:172.16.10.10', '::ffff:172.16.0.0/112'), true);
    assert.strictEqual(isInSubnet('::ffff:192.168.10.10', '172.16.0.0/16'), false);
    assert.strictEqual(
      isInSubnet('::ffff:192.168.10.10', '::ffff:172.16.0.0/112'),
      false
    );
  });

  it('should recognize private addresses', () => {
    assert.strictEqual(isPrivate('192.168.0.1'), true);
    assert.strictEqual(isPrivate('fe80::5555:1111:2222:7777%utun2'), true);
    assert.strictEqual(isPrivate('::ffff:192.168.0.1'), true);
  });

  it('should recognize localhost addresses', () => {
    assert.strictEqual(isLocalhost('127.0.0.1'), true);
    assert.strictEqual(isLocalhost('::1'), true);
    assert.strictEqual(isLocalhost('::ffff:127.0.0.1'), true);
  });

  it('should recognize IPv4 mapped addresses', () => {
    assert.strictEqual(isIPv4MappedAddress('8.8.8.8'), false);
    assert.strictEqual(isIPv4MappedAddress('::ffff:8.8.8.8'), true);
  });

  it('should recognize reserved addresses', () => {
    assert.strictEqual(isReserved('169.254.100.200'), true);
    assert.strictEqual(isReserved('2001:db8:f53a::1'), true);
    assert.strictEqual(isReserved('::ffff:169.254.100.200'), true);
  });

  it('should recognize special addresses', () => {
    assert.strictEqual(isSpecial('127.0.0.1'), true);
    assert.strictEqual(isSpecial('::'), true);
    assert.strictEqual(isSpecial('::ffff:127.0.0.1'), true);
  });
});
