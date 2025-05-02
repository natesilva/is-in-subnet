# is-in-subnet [![npm](https://img.shields.io/npm/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet) [![license](https://img.shields.io/github/license/natesilva/is-in-subnet.svg)](https://github.com/natesilva/is-in-subnet/blob/master/LICENSE) [![node](https://img.shields.io/node/v/is-in-subnet.svg)](https://www.npmjs.com/package/is-in-subnet)

Check if an IPv4 or IPv6 address is contained within a given [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) subnet.

Key Features:

- Small footprint
- Fast performance
- Simple API
- Comprehensive test coverage
- TypeScript support
- Zero external dependencies
- ESM and CommonJS compatibility
- Works in Node.js and browsers

For complete documentation, see the 📖 [Reference](doc/reference.md) page.

## Getting Started

### ESM, TypeScript, Node.js, Bundlers

Install the package using npm:

```shell
npm install is-in-subnet
```

Then, import and use the `isInSubnet` function:

```javascript
import { isInSubnet } from "is-in-subnet";

console.log(isInSubnet("10.5.0.1", "10.4.5.0/16")); // false
console.log(isInSubnet("10.5.0.1", "10.4.5.0/15")); // true

console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f53b::1:1/48")); // false
console.log(isInSubnet("2001:db8:f53a::1", "2001:db8:f531::1:1/44")); // true
```

### In a browser (without a bundler)

For direct use in a browser without a bundler, you can use a CDN like unpkg or jsdelivr.

```html
<!-- From unpkg -->
<script src="https://unpkg.com/is-in-subnet@latest"></script>

<!-- Or, from jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/is-in-subnet@latest"></script>

<script>
  // The IsInSubnet object is available in the global scope
  console.log(IsInSubnet.isInSubnet("10.5.0.1", "10.4.5.0/16"));
  // Alternatively, use the check alias:
  console.log(IsInSubnet.check("10.5.0.1", "10.4.5.0/16"));
</script>
```

## More ways to use it

### Test multiple subnets

You can pass an array of subnets instead of a single subnet:

```javascript
const inAnySubnet = IsInSubnet("10.5.0.1", ["10.4.5.0/16", "192.168.1.0/24"]);
```

### Amortize parsing cost with a functional approach

The `createChecker(subnetOrSubnets)` function returns a specialized function for checking
addresses against the provided subnet(s), amortizing the parsing cost. Depending on the
number of addresses you need to check, this can be significantly faster than using the
`isInSubnet` function repeatedly.

```javascript
const checker = createChecker(["10.4.5.0/16", "192.168.1.0/24"]);
console.log(checker("10.5.0.1")); // true
```

### Test for special address types

Convenience functions are available to test for special types of addresses:

- `isPrivate(address)`: Checks for private addresses (e.g., `192.168.0.0/16`)
- `isLocalhost(address)`: Checks for localhost addresses (e.g., `::1`)

And more. See the [documentation](doc/reference.md#testing-for-special-address-ranges) for a complete list.

### Validate IP addresses

Functions are provided to check if a string is a valid IPv4 or IPv6 address:

- `isIPv4(address)`
- `isIPv6(address)`
- `isIP(address)`: Checks for either IPv4 or IPv6 validity.

These functions work similarly to the similarly-named functions in Node.js's `net` module.
