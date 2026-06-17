import type { TourPlacement } from "../types";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface PositionResult {
  /** Resolved placement after flipping for overflow. */
  placement: TourPlacement;
  tooltip: { top: number; left: number; width: number };
  /** Arrow position relative to the tooltip box, plus which edge it sits on. */
  arrow: {
    edge: "top" | "bottom" | "left" | "right";
    /** Offset along the edge, in px from the tooltip's top-left corner. */
    offset: number;
  } | null;
}

const GAP = 12;
const ARROW = 8;
const MARGIN = 12;
const MOBILE_BREAKPOINT = 480;

function flip(
  placement: TourPlacement,
  rect: Rect,
  vpW: number,
  vpH: number,
  tooltipH: number,
  width: number,
): TourPlacement {
  const below = vpH - (rect.top + rect.height + GAP);
  const above = rect.top - GAP;
  const right = vpW - (rect.left + rect.width + GAP);
  const left = rect.left - GAP;

  if (placement.startsWith("bottom") && below < tooltipH && above >= tooltipH) {
    return placement.replace("bottom", "top") as TourPlacement;
  }
  if (placement.startsWith("top") && above < tooltipH && below >= tooltipH) {
    return placement.replace("top", "bottom") as TourPlacement;
  }
  if (placement === "left" && left < width && right >= width) return "right";
  if (placement === "right" && right < width && left >= width) return "left";
  return placement;
}

/**
 * Compute tooltip + arrow position for a target rect. Flips on overflow, clamps
 * to the viewport, and on narrow (mobile) viewports pins the tooltip to the
 * bottom of the screen as a sheet.
 */
export function computePosition(
  rect: Rect | null,
  requested: TourPlacement,
  vpW: number,
  vpH: number,
  tooltipH: number,
  baseWidth: number,
): PositionResult {
  const isMobile = vpW < MOBILE_BREAKPOINT;
  const width = Math.min(baseWidth, vpW - MARGIN * 2);

  // Centered step, no target, or mobile → centered / bottom sheet.
  if (!rect || requested === "center") {
    if (isMobile && rect) {
      return {
        placement: "bottom",
        tooltip: {
          top: Math.max(MARGIN, vpH - tooltipH - MARGIN),
          left: (vpW - width) / 2,
          width,
        },
        arrow: null,
      };
    }
    return {
      placement: "center",
      tooltip: { top: vpH / 2 - tooltipH / 2, left: (vpW - width) / 2, width },
      arrow: null,
    };
  }

  // On mobile, anchored tooltips become a bottom sheet (no flip math needed).
  if (isMobile) {
    const placeBelow = rect.top + rect.height / 2 < vpH / 2;
    return {
      placement: placeBelow ? "bottom" : "top",
      tooltip: {
        top: placeBelow
          ? Math.min(rect.top + rect.height + GAP, vpH - tooltipH - MARGIN)
          : Math.max(MARGIN, rect.top - GAP - tooltipH),
        left: (vpW - width) / 2,
        width,
      },
      arrow: null,
    };
  }

  const placement = flip(requested, rect, vpW, vpH, tooltipH, width);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let top = 0;
  let left = 0;
  let arrow: PositionResult["arrow"] = null;

  switch (placement) {
    case "bottom":
    case "bottom-start":
    case "bottom-end": {
      top = rect.top + rect.height + GAP;
      left =
        placement === "bottom-end"
          ? rect.left + rect.width - width
          : placement === "bottom-start"
            ? rect.left
            : centerX - width / 2;
      arrow = { edge: "top", offset: centerX - left };
      break;
    }
    case "top":
    case "top-start":
    case "top-end": {
      top = rect.top - GAP - tooltipH;
      left =
        placement === "top-end"
          ? rect.left + rect.width - width
          : placement === "top-start"
            ? rect.left
            : centerX - width / 2;
      arrow = { edge: "bottom", offset: centerX - left };
      break;
    }
    case "left": {
      top = centerY - tooltipH / 2;
      left = rect.left - GAP - width;
      arrow = { edge: "right", offset: centerY - top };
      break;
    }
    case "right": {
      top = centerY - tooltipH / 2;
      left = rect.left + rect.width + GAP;
      arrow = { edge: "left", offset: centerY - top };
      break;
    }
    default:
      top = rect.top + rect.height + GAP;
      left = centerX - width / 2;
  }

  // Clamp to viewport.
  const clampedLeft = Math.max(MARGIN, Math.min(vpW - width - MARGIN, left));
  const clampedTop = Math.max(MARGIN, Math.min(vpH - tooltipH - MARGIN, top));

  // Re-anchor the arrow after clamping so it still points at the target,
  // keeping it inside the tooltip edge.
  if (arrow) {
    if (arrow.edge === "top" || arrow.edge === "bottom") {
      arrow.offset = clamp(centerX - clampedLeft, ARROW + 4, width - ARROW - 4);
    } else {
      arrow.offset = clamp(
        centerY - clampedTop,
        ARROW + 4,
        tooltipH - ARROW - 4,
      );
    }
  }

  return {
    placement,
    tooltip: { top: clampedTop, left: clampedLeft, width },
    arrow,
  };
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
