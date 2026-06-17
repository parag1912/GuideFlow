import { beforeEach, describe, expect, it } from "vitest";
import { createLocalStorageAdapter, DEFAULT_PERSISTED } from "./localStorage";

beforeEach(() => {
  window.localStorage.clear();
});

describe("localStorage adapter", () => {
  it("saves and loads round-trip, namespaced by user", async () => {
    const a = createLocalStorageAdapter("user-1");
    a.save({
      ...DEFAULT_PERSISTED,
      welcomeSeen: true,
      completedSteps: ["a"],
    });
    const loaded = await a.load();
    expect(loaded?.welcomeSeen).toBe(true);
    expect(loaded?.completedSteps).toEqual(["a"]);

    // A different user id is isolated.
    expect(await createLocalStorageAdapter("user-2").load()).toBeNull();
  });

  it("clears stored state", async () => {
    const a = createLocalStorageAdapter("u");
    a.save({ ...DEFAULT_PERSISTED, welcomeSeen: true });
    a.clear?.();
    expect(await a.load()).toBeNull();
  });

  it("migrates legacy completedTours/dismissedTours into seenTours", async () => {
    window.localStorage.setItem(
      "rgj_legacy",
      JSON.stringify({
        welcomeSeen: true,
        completedSteps: ["s1"],
        completedTours: ["t1"],
        dismissedTours: ["t2", "t1"],
      }),
    );
    const loaded = await createLocalStorageAdapter("legacy").load();
    expect(loaded?.seenTours.slice().sort()).toEqual(["t1", "t2"]);
    expect(loaded?.completedSteps).toEqual(["s1"]);
  });

  it("returns null on corrupt JSON instead of throwing", async () => {
    window.localStorage.setItem("rgj_bad", "{not json");
    expect(await createLocalStorageAdapter("bad").load()).toBeNull();
  });
});
