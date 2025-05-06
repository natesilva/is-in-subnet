import type { IpAddress } from "../core/interfaces/ip-address.ts";
import { Ipv4Address } from "../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";
import * as net from "./net.js";

/**
 * Given input which can be a string, an Ipv4Address, or an Ipv6Address, normalize to an
 * IpAddress object.
 * @param input the input to normalize to an IpAddress object
 * @returns an IpAddress object
 * @throws Error if the input is not a valid IP address
 */
export function makeIpAddress(input: string | IpAddress) {
  if (typeof input === "string") {
    const ipVersion = net.isIP(input);
    if (ipVersion === 4) {
      return new Ipv4Address(input);
    } else if (ipVersion === 6) {
      return new Ipv6Address(input);
    }
    throw new Error(`not a valid IPv4 or IPv6 address: ${input}`);
  } else {
    return input;
  }
}
