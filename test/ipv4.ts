import * as assert from 'assert';
import { describe } from 'mocha';
import * as IPv4 from '../src/ipv4';
import ipv4fixtures from './fixtures/ipv4';

describe('IPv4 tests', () => {
  it('should check ipv4 subnet membership (one-at-a-time)', () => {
    ipv4fixtures.forEach(([ip, subnet, expected]) => {
      assert.strictEqual(IPv4.isInSubnet(ip, subnet), expected);
    });
  });

  it('should check ipv4 subnet membership (array)', () => {
    const uniqueIps = new Set<string>(ipv4fixtures.map(f => f[0]));

    uniqueIps.forEach(ip => {
      const inSubnets = ipv4fixtures.filter(t => t[0] === ip && t[2]).map(t => t[1]);
      if (inSubnets.length) {
        assert.strictEqual(IPv4.isInSubnet(ip, inSubnets), true);
      }

      const notInSubnets = ipv4fixtures.filter(t => t[0] === ip && !t[2]).map(t => t[1]);
      assert.strictEqual(IPv4.isInSubnet(ip, notInSubnets), false);
    });
  });

  it('should handle an empty subnet array', () => {
    const ip = ipv4fixtures[0][0];
    assert.strictEqual(IPv4.isInSubnet(ip, []), false);
  });

  it('should throw on invalid subnets', () => {
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '10.5.0.1'));
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/-1'));
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '0.0.0.0/33'));
    // first segment of subnet is octal-like, should throw
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '010.0.0.0/8'));
  });

  it('should throw on invalid ipv4', () => {
    assert.throws(() => IPv4.isInSubnet('256.5.0.1', '0.0.0.0/0'));
    assert.throws(() => IPv4.isInSubnet('::1', '0.0.0.0/0'));
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '2001:db8:f53a::1:1/64'));
    assert.throws(() => IPv4.isInSubnet('10.5.0.1', '1.2.3'));
  });

  it('should handle ipv4 localhost', () => {
    assert.strictEqual(IPv4.isLocalhost('127.0.0.1'), true);
    assert.strictEqual(IPv4.isLocalhost('127.99.88.77'), true);
    assert.strictEqual(IPv4.isLocalhost('192.168.0.1'), false);
  });

  it('should handle ipv4 private', () => {
    assert.strictEqual(IPv4.isPrivate('127.0.0.1'), false);
    assert.strictEqual(IPv4.isPrivate('192.168.0.1'), true);
    assert.strictEqual(IPv4.isPrivate('10.11.12.13'), true);
    assert.strictEqual(IPv4.isPrivate('172.16.0.1'), true);
  });

  it('should handle ipv4 reserved', () => {
    assert.strictEqual(IPv4.isReserved('127.0.0.1'), false);
    assert.strictEqual(IPv4.isReserved('169.254.100.200'), true);
    assert.strictEqual(IPv4.isReserved('0.0.0.0'), true);
    assert.strictEqual(IPv4.isReserved('255.255.255.255'), true);
  });

  it('should handle ipv4 special', () => {
    assert.strictEqual(IPv4.isSpecial('127.0.0.1'), true);
    assert.strictEqual(IPv4.isSpecial('192.168.0.1'), true);
    assert.strictEqual(IPv4.isSpecial('169.254.100.200'), true);
    assert.strictEqual(IPv4.isSpecial('8.8.8.8'), false);
  });
});
