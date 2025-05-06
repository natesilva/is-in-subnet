import { Ipv4Address } from "../src/core/ipv4/ipv4-address.ts";
import { describe, it, expect } from "vitest";

describe("Ipv4Address", () => {
  describe("construction", () => {
    it("should construct valid IP addresses", () => {
      expect(() => new Ipv4Address("192.168.1.1")).not.toThrow();
      expect(() => new Ipv4Address("10.0.0.1")).not.toThrow();
      expect(() => new Ipv4Address("255.255.255.255")).not.toThrow();
      expect(() => new Ipv4Address("0.0.0.0")).not.toThrow();
    });

    it("should reject invalid IP addresses", () => {
      expect(() => new Ipv4Address("256.0.0.1")).toThrow();
      expect(() => new Ipv4Address("192.168.1")).toThrow();
      expect(() => new Ipv4Address("192.168.1.1.1")).toThrow();
      expect(() => new Ipv4Address("192.168.1.a")).toThrow();
    });

    it("should reject IP addresses with leading zeros", () => {
      expect(() => new Ipv4Address("010.0.0.0")).toThrow();
      expect(() => new Ipv4Address("10.01.0.0")).toThrow();
      expect(() => new Ipv4Address("10.0.01.0")).toThrow();
      expect(() => new Ipv4Address("10.0.0.01")).toThrow();
    });

    it("should allow single zero octets", () => {
      expect(() => new Ipv4Address("0.0.0.0")).not.toThrow();
      expect(() => new Ipv4Address("10.0.0.0")).not.toThrow();
      expect(() => new Ipv4Address("10.10.0.10")).not.toThrow();
    });
  });

  describe("properties", () => {
    it("should return the correct string representation", () => {
      const ip = new Ipv4Address("192.168.1.1");
      expect(ip.toString()).toBe("192.168.1.1");
      expect(ip.ip).toBe("192.168.1.1");
    });

    it("should return the correct long value", () => {
      expect(new Ipv4Address("0.0.0.0").long).toBe(0);
      expect(new Ipv4Address("0.0.0.1").long).toBe(1);
      expect(new Ipv4Address("0.0.1.0").long).toBe(256);
      expect(new Ipv4Address("0.1.0.0").long).toBe(65536);
      expect(new Ipv4Address("1.0.0.0").long).toBe(16777216);
      expect(new Ipv4Address("192.168.1.1").long).toBe(3232235777);
      expect(new Ipv4Address("255.255.255.255").long).toBe(4294967295);
    });
  });
});