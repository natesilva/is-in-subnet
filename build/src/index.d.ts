import * as IPv4 from './ipv4';
import * as IPv6 from './ipv6';
/**
 * Test if the given IP address is contained in the specified subnet.
 * @param address the IPv4 or IPv6 address to check
 * @param subnet the IPv4 or IPv6 CIDR to test (or an array of them)
 * @throws if the address or subnet are not valid IP addresses, or the CIDR prefix length
 *  is not valid
 */
export declare function isInSubnet(address: string, subnetOrSubnets: string | string[]): any;
/** Test if the given IP address is a private/internal IP address. */
export declare function isPrivate(address: string): any;
/** Test if the given IP address is a localhost address. */
export declare function isLocalhost(address: string): any;
/** Test if the given IP address is an IPv4 address mapped onto IPv6 */
export declare function isIPv4MappedAddress(address: string): any;
/** Test if the given IP address is in a known reserved range and not a normal host IP */
export declare function isReserved(address: string): any;
/**
 * Test if the given IP address is a special address of any kind (private, reserved,
 * localhost)
 */
export declare function isSpecial(address: string): any;
export { IPv4, IPv6 };
