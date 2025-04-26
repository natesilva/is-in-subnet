import { expect, suite, test, vi } from "vitest";
import { createChecker } from "../src/index.js";
import type { CheckFunction } from "../src/types/checker.js";
import * as util from "../src/util.js";

suite("createChecker", () => {
  test("createChecker should handle invalid IP addresses", () => {
    // This test covers the 'return false' branch in createChecker
    // when the address is neither IPv4 nor IPv6
    const checker = createChecker("192.168.0.0/24");

    // Mock the isIP function to return 0 (not an IP)
    const mockIsIP = vi.fn().mockReturnValue(0);
    vi.spyOn(util, "isIP").mockImplementation(mockIsIP);

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
    const typedChecker: CheckFunction = checker;
    expect(typeof typedChecker).toBe("function");
    expect(typedChecker("192.168.0.1")).toBe(true);
  });

  test("createChecker should return false for non-IP address", () => {
    // We need to mock isIP to return a value that's not 0, 4, or 6
    // to hit the 'return false' branch
    const checker = createChecker("192.168.0.0/24");

    // Mock the isIP function to return a value that will pass the initial check
    // but fail the IPv4/IPv6 specific checks
    const mockIsIP = vi.fn().mockReturnValue(5); // Not 0, 4, or 6
    vi.spyOn(util, "isIP").mockImplementation(mockIsIP);

    try {
      // This should hit the 'return false' branch without throwing
      expect(checker("strange-ip")).toBe(false);
    } finally {
      vi.restoreAllMocks();
    }
  });
});
