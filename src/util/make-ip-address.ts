import type { IpAddress } from "../core/interfaces/ip-address.ts";
import { Ipv4Address } from "../core/ipv4/ipv4-address.ts";
import { Ipv6Address } from "../core/ipv6/ipv6-address.ts";
import * as util from "./net.js";

/**
 * Given input which can be a string, an Ipv4Address, or an Ipv6Address, normalize to an
 * IpAddress object.
 * @param input the input to normalize to an IpAddress object
 * @returns an IpAddress object
 * @throws Error if the input is not a valid IP address
 */
export function makeIpAddress(input: string | IpAddress) {
  if (typeof input === "string") {
    if (!util.isIP(input)) {
      throw new Error(`not a valid IPv4 or IPv6 address: ${input}`);
    }
    if (util.isIPv4(input)) {
      return new Ipv4Address(input);
    } else {
      return new Ipv6Address(input);
    }
  } else {
    return input;
  }
}
