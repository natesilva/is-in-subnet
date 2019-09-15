# is-in-subnet

## Checking if an address is in a subnet

`isInSubnet(address: string, subnetOrSubnets: string | string[]): boolean`

Test if the given IP address is contained in the specified subnet.

ℹ️ `check(…)` is an alias for `isInSubnet(…)`

* `address` the IPv4 or IPv6 address to check
* `subnet` the IPv4 or IPv6 CIDR to test (or an array of them)

Will `throw` an `Error` if the address or subnet are not valid IP addresses, or the CIDR prefix length is not valid.

## Checking if a string represents a valid IP address

* `isIPv4(s: string): boolean`
    * Test if the string represents an IPv4 address. Matches the similar function in Node.js: [net.isIPv4](https://nodejs.org/api/net.html#net_net_isipv4_input)

* `isIPv6(s: string): boolean`
    * Test if the string represents an IPv6 address. Matches the similar function in Node.js: [net.isIPv6](https://nodejs.org/api/net.html#net_net_isipv6_input)

* `isIP(s: string): 0 | 4 | 6`
    * Combined test that checks if the string represents either an IPv4 or IPv6 address. Returns `4` or `6` if the address can be parsed. If the address isn’t recognized as either IPv4 or IPv6, returns `0`.  Matches the similar function in Node.js: [net.isIP](https://nodejs.org/api/net.html#net_net_isip_input)
 
## Testing for special address ranges

* `isPrivate(address: string): boolean`
    * Test if the given IP address is a private/internal IP address. For IPv4 this includes `192.168.x.x` and similar addresses. For IPv6 it includes link-local and ULA (unique local address) ranges.

* `isLocalhost(address: string): boolean`
    * Test if the given IP address is a localhost address.

* `isReserved(address: string): boolean`
    * Test if the given IP address is in a reserved range. These addresses are not expected to be seen in public internet traffic.

* `isSpecial(address: string): boolean`
    * A combined test that checks if the given IP address matches any of the above categories (private, localhost, or reserved).

The complete list can be seen in the source code: [ipRange.ts](../src/ipRange.ts)
