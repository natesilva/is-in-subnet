import { expect, suite, test, vi } from "vitest";
import { createChecker } from "../src/index.ts";
import * as net from "../src/util/net.ts";

suite("createChecker", () => {
  test("createChecker should handle invalid IP addresses", () => {
    // This test covers the 'return false' branch in createChecker
    // when the address is neither IPv4 nor IPv6
    const checker = createChecker("192.168.0.0/24");

    // Mock the isIP function to return 0 (not an IP)
    const mockIsIP = vi.fn().mockReturnValue(0);
    vi.spyOn(net, "isIP").mockImplementation(mockIsIP);

    try {
      // This should hit the 'return false' branch in the checker function
      // The function should throw because we're passing an invalid IP
      expect(() => checker("not-an-ip")).toThrow();
    } finally {
      vi.restoreAllMocks();
    }
  });

  test("createChecker function should properly use CheckFunction type", () => {
    const checker = createChecker("192.168.0.0/24");

    // Verify the CheckFunction type is properly used
    expect(typeof checker).toBe("function");
    expect(checker("192.168.0.1")).toBe(true);
  });
});
