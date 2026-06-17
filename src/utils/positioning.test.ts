import { describe, expect, it } from "vitest";
import { computePosition, type Rect } from "./positioning";

const VP = { w: 1200, h: 800 }; // desktop (above mobile breakpoint)
const WIDTH = 320;

describe("computePosition", () => {
  it("centers when there is no target", () => {
    const r = computePosition(null, "bottom", VP.w, VP.h, 200, WIDTH);
    expect(r.placement).toBe("center");
    expect(r.arrow).toBeNull();
    expect(r.tooltip.left).toBeCloseTo((VP.w - WIDTH) / 2);
  });

  it("places below with an upward arrow when there is room", () => {
    const rect: Rect = { top: 100, left: 500, width: 100, height: 40 };
    const r = computePosition(rect, "bottom", VP.w, VP.h, 200, WIDTH);
    expect(r.placement).toBe("bottom");
    expect(r.arrow?.edge).toBe("top");
    expect(r.tooltip.top).toBeGreaterThan(rect.top + rect.height);
  });

  it("flips bottom → top when there's no room below", () => {
    const rect: Rect = { top: 700, left: 500, width: 100, height: 40 };
    const r = computePosition(rect, "bottom", VP.w, VP.h, 300, WIDTH);
    expect(r.placement).toBe("top");
    expect(r.arrow?.edge).toBe("bottom");
  });

  it("clamps the tooltip within the viewport horizontally", () => {
    const rect: Rect = { top: 100, left: 1180, width: 20, height: 20 };
    const r = computePosition(rect, "bottom", VP.w, VP.h, 200, WIDTH);
    expect(r.tooltip.left).toBeGreaterThanOrEqual(0);
    expect(r.tooltip.left + r.tooltip.width).toBeLessThanOrEqual(VP.w);
  });

  it("uses a bottom-sheet (no arrow) on mobile viewports", () => {
    const rect: Rect = { top: 100, left: 50, width: 100, height: 40 };
    const r = computePosition(rect, "right", 380, 700, 200, WIDTH);
    expect(r.arrow).toBeNull();
    expect(r.tooltip.width).toBeLessThanOrEqual(380 - 24);
  });
});
