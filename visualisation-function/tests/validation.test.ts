import test from "node:test";
import assert from "node:assert/strict";
import { validateRequest } from "../src/services/ValidationService.js";

test("rejects non-object body", () => {
  const result = validateRequest("not an object");
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "INVALID_INPUT");
});

test("reports missing required fields", () => {
  const result = validateRequest({});
  assert.equal(result.ok, false);
  const fields = result.errors.map((e) => e.field).filter(Boolean);
  assert.ok(fields.includes("requestId"));
  assert.ok(fields.includes("visualisationType"));
  assert.ok(fields.includes("data"));
  assert.ok(fields.includes("options"));
});

test("rejects unsupported visualisationType", () => {
  const result = validateRequest({
    requestId: "vis-1",
    visualisationType: "hologram",
    data: {},
    options: { outputFormat: "svg" },
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.code === "UNSUPPORTED_TYPE"));
});

test("rejects unsupported outputFormat", () => {
  const result = validateRequest({
    requestId: "vis-1",
    visualisationType: "chart",
    data: { labels: [], values: [] },
    options: { outputFormat: "tiff" },
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.code === "UNSUPPORTED_FORMAT"));
});

test("rejects unsupported theme", () => {
  const result = validateRequest({
    requestId: "vis-1",
    visualisationType: "chart",
    data: { labels: ["a"], values: [1] },
    options: { outputFormat: "svg", theme: "neon" },
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.code === "UNSUPPORTED_THEME"));
});

test("accepts a valid request and applies defaults", () => {
  const result = validateRequest({
    requestId: "vis-1",
    visualisationType: "chart",
    data: { labels: ["a"], values: [1] },
    options: { outputFormat: "svg" },
  });
  assert.equal(result.ok, true);
  assert.equal(result.request?.options.theme, "default");
  assert.equal(result.request?.options.width, 1200);
  assert.equal(result.request?.options.height, 800);
});
