/**
 * Utilities implementing a subset of the functionality of the Node.js `net` module.
 *
 * @module
 */

// RegExp for testing if a string represents an IPv4 address
const v4Seg = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
const v4Str = `(${v4Seg}[.]){3}${v4Seg}`;
const IPv4Reg = new RegExp(`^${v4Str}$`);

// RegExp for testing if a string represents an IPv6 address
const v6Seg = "(?:[0-9a-fA-F]{1,4})";
const IPv6Reg = new RegExp(
  "^(" +
    `(?:${v6Seg}:){7}(?:${v6Seg}|:)|` +
    `(?:${v6Seg}:){6}(?:${v4Str}|:${v6Seg}|:)|` +
    `(?:${v6Seg}:){5}(?::${v4Str}|(:${v6Seg}){1,2}|:)|` +
    `(?:${v6Seg}:){4}(?:(:${v6Seg}){0,1}:${v4Str}|(:${v6Seg}){1,3}|:)|` +
    `(?:${v6Seg}:){3}(?:(:${v6Seg}){0,2}:${v4Str}|(:${v6Seg}){1,4}|:)|` +
    `(?:${v6Seg}:){2}(?:(:${v6Seg}){0,3}:${v4Str}|(:${v6Seg}){1,5}|:)|` +
    `(?:${v6Seg}:){1}(?:(:${v6Seg}){0,4}:${v4Str}|(:${v6Seg}){1,6}|:)|` +
    `(?::((?::${v6Seg}){0,5}:${v4Str}|(?::${v6Seg}){1,7}|:))` +
    ")(%[0-9a-zA-Z]{1,})?$",
);

/**
 * Test if the string represents an IPv4 address.
 *
 * IPv6-mapped IPv4 addresses (e.g., `::ffff:192.168.1.1`) are not considered IPv4
 * addresses by this function.
 *
 * Matches Node.js [net.isIPv4](https://nodejs.org/api/net.html#netisipv4input)
 * functionality.
 *
 * @param s The string to test.
 * @returns `true` if the string represents an IPv4 address.
 * @category Utilities
 */
export function isIPv4(s: string): boolean {
  return IPv4Reg.test(s);
}

/**
 * Test if the string represents an IPv6 address.
 *
 * Matches Node.js [net.isIPv6](https://nodejs.org/api/net.html#netisipv6input)
 * functionality.
 *
 * @param s The string to test.
 * @returns `true` if the string represents an IPv6 address.
 * @category Utilities
 */
export function isIPv6(s: string): boolean {
  return IPv6Reg.test(s);
}

/**
 * If the string represents an IP address, returns the version of the IP address.
 * Otherwise, returns `0`.
 *
 * Matches Node.js [net.isIP](https://nodejs.org/api/net.html#netisipinput) functionality.
 *
 * @param s The string to test.
 * @returns `4` if the string represents an IPv4 address, `6` if it represents an IPv6
 *  address (including IPv6-mapped IPv4 addresses), and `0` otherwise.
 * @category Utilities
 */
export function isIP(s: string): 4 | 6 | 0 {
  if (isIPv4(s)) return 4;
  if (isIPv6(s)) return 6;
  return 0;
}
