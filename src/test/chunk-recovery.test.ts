import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearChunkReloadGuard,
  isChunkLoadError,
  reloadOnceForChunkError,
} from "@/lib/chunk-recovery";

describe("Recovery from an outdated page copy", () => {
  let reload: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    reload = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { reload },
    });
    clearChunkReloadGuard();
  });

  afterEach(() => clearChunkReloadGuard());

  it("recognises the blank-screen import failure", () => {
    expect(
      isChunkLoadError(
        new TypeError(
          "Failed to fetch dynamically imported module: /src/routes/explorar.tsx?tsr-split=component",
        ),
      ),
    ).toBe(true);
  });

  it("recognises the failure when another error wraps it", () => {
    const wrapped = new Error("routing failed", {
      cause: new TypeError("Failed to fetch dynamically imported module"),
    });
    expect(isChunkLoadError(wrapped)).toBe(true);
  });

  it("leaves an unrelated error alone", () => {
    expect(
      isChunkLoadError(new TypeError("Cannot read properties of undefined (reading 'queryFn')")),
    ).toBe(false);
  });

  it("reloads one time and never twice", () => {
    expect(reloadOnceForChunkError()).toBe(true);
    expect(reloadOnceForChunkError()).toBe(false);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("allows a fresh recovery once the page has loaded", () => {
    expect(reloadOnceForChunkError()).toBe(true);
    clearChunkReloadGuard();
    expect(reloadOnceForChunkError()).toBe(true);
    expect(reload).toHaveBeenCalledTimes(2);
  });
});
