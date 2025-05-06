import { Ipv4Address } from "../core/ipv4/ipv4-address.ts";

export class Ipv4AddressPool {
  #pool: Ipv4Address[] = [];
  #index = 0;

  constructor(size = 100) {
    // Pre-allocate pool
    for (let i = 0; i < size; i++) {
      this.#pool.push(new Ipv4Address("0.0.0.0"));
    }
  }

  get(ip: string): Ipv4Address {
    const address = this.#pool[this.#index];
    this.#index = (this.#index + 1) % this.#pool.length;

    // Reinitialize the object instead of creating a new one
    address.reinitialize(ip);
    return address;
  }
}
