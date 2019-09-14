import * as assert from 'assert';
import { describe } from 'mocha';
import * as util from '../src/util';

describe('util', () => {
  describe('isIPv6', () => {
    const valid = [
      '0000:0000:0000:0000:0000:0000:0000:0000',
      '1050:0:0:0:5:600:300c:326b',
      '2001:252:0:1::2008:6',
      '2001::',
      '2001:dead::',
      '2001:dead:beef:1::',
      '2001:dead:beef:1::2008:6',
      '2001:dead:beef::',
      '::',
      '::1',
      '::2001:252:1:1.1.1.1',
      '::2001:252:1:2008:6',
      '::2001:252:1:255.255.255.255',
      'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
      '::192:168:0:1', // deprecated format but allowed by Node’s net.isIPv6
      '::ffff:127.0.0.1', // mapped IPv4
      { toString: () => '::2001:252:1:255.255.255.255' }
    ];

    const invalid = [
      '1200::AB00:1234::2552:7777:1313', // uses :: twice
      '1200:0000:AB00:1234:O000:2552:7777:1313', // contains an O instead of 0
      '1050:0:0:0:5:600:300g:326b', // g is an invalid hex digit
      '127.0.0.1',
      'example.com',
      '',
      null,
      123,
      true,
      {},
      { toString: () => '127.0.0.1' },
      { toString: () => 'bla' }
    ];

    it('should recognize valid ipv6 addresses', () => {
      valid.forEach(ip => {
        // `as any` so we can test values convertible to string
        assert.strictEqual(util.isIPv6(ip as any), true, `testing ${ip}`);
      });
    });

    it('should not recognize invalid ipv6 addresses', () => {
      invalid.forEach(ip => {
        // `as any` so we can test non-string values
        assert.strictEqual(util.isIPv6(ip as any), false, `testing ${ip}`);
      });
    });

    it('should return false if no address is provided', () => {
      // `as any` so we can test non-string values
      assert.strictEqual((util.isIPv6 as any)(), false);
    });
  });

  describe('isIPv4', () => {
    const valid = [
      '0.0.0.0',
      '255.255.255.255',
      '192.168.1.100',
      '127.0.0.1',
      { toString: () => '127.0.0.1' }
    ];

    const invalid = [
      '2001:0db8:aaaa:0001::0200', // IPv6
      '192.168.256.1', // third octet out-of-range
      'example.com',
      '',
      null,
      123,
      true,
      {},
      { toString: () => '::2001:252:1:255.255.255.255' },
      { toString: () => 'bla' },
      '2001:252:0:1::2008:6'
    ];

    it('should recognize valid ipv4 addresses', () => {
      valid.forEach(ip => {
        // `as any` so we can test values convertible to string
        assert.strictEqual(util.isIPv4(ip as any), true, `testing ${ip}`);
      });
    });

    it('should not recognize invalid ipv4 addresses', () => {
      invalid.forEach(ip => {
        // `as any` so we can test non-string values
        assert.strictEqual(util.isIPv4(ip as any), false, `testing ${ip}`);
      });
    });

    it('should return false if no address is provided', () => {
      // `as any` so we can test non-string values
      assert.strictEqual((util.isIPv4 as any)(), false);
    });
  });
});
