import test from "node:test";
import assert from "node:assert/strict";
import { render, RenderError } from "../src/services/VisualisationRenderer.js";
import { GROUND_CONTROL_COLOURS } from "../src/themes/groundControlTheme.js";
import type { VisualisationRequest } from "../src/models/VisualisationRequest.js";

function baseChartRequest(overrides: Partial<VisualisationRequest> = {}): VisualisationRequest {
  return {
    requestId: "vis-001",
    visualisationType: "chart",
    title: "Automation Opportunities by Department",
    description: "Bar chart",
    data: { labels: ["Finance", "Operations", "HR", "IT"], values: [12, 18, 6, 14] },
    options: {
      theme: "ground-control",
      outputFormat: "svg",
      width: 1200,
      height: 800,
      ...(overrides.options ?? {}),
    },
    ...overrides,
  } as VisualisationRequest;
}

test("renders a bar chart SVG with ground-control palette", () => {
  const result = render(baseChartRequest());
  assert.equal(result.outputFormat, "svg");
  assert.equal(result.contentType, "image/svg+xml");
  assert.match(result.content, /^<\?xml/);
  assert.ok(result.content.includes(GROUND_CONTROL_COLOURS.darkGreen));
  assert.ok(result.content.includes("Automation Opportunities"));
});

test("renders a pie chart with the specified chart type", () => {
  const result = render(
    baseChartRequest({ options: { theme: "ground-control", outputFormat: "svg", chartType: "pie" } }),
  );
  assert.match(result.content, /<path d="M /);
});

test("renders a line chart with series data", () => {
  const req: VisualisationRequest = {
    requestId: "vis-002",
    visualisationType: "chart",
    data: {
      labels: ["Jan", "Feb", "Mar"],
      series: [
        { name: "Revenue", values: [100, 120, 140] },
        { name: "Cost", values: [60, 70, 65] },
      ],
    },
    options: { outputFormat: "svg", chartType: "line", width: 800, height: 500 },
  };
  const result = render(req);
  assert.ok(result.content.includes("Revenue"));
  assert.ok(result.content.includes("Cost"));
});

test("renders a KPI card SVG", () => {
  const req: VisualisationRequest = {
    requestId: "kpi-001",
    visualisationType: "kpi",
    title: "Q2 Snapshot",
    data: {
      kpis: [
        { label: "ARR", value: 4.2, unit: "$M", trend: "up", delta: "+12%" },
        { label: "NPS", value: 62, trend: "up", delta: "+4" },
      ],
    },
    options: { theme: "ground-control", outputFormat: "svg", width: 1200, height: 400 },
  };
  const result = render(req);
  assert.match(result.content, /^<\?xml/);
  assert.ok(result.content.includes("ARR"));
  assert.ok(result.content.includes("4.2"));
});

test("returns mermaid source unchanged for outputFormat=mermaid", () => {
  const source = "graph TD;A-->B;B-->C;";
  const result = render({
    requestId: "m-1",
    visualisationType: "mermaid",
    data: { diagram: source },
    options: { outputFormat: "mermaid" },
  } as VisualisationRequest);
  assert.equal(result.outputFormat, "mermaid");
  assert.equal(result.content, source);
});

test("renders mermaid HTML with embedded definition", () => {
  const result = render({
    requestId: "m-2",
    visualisationType: "mermaid",
    title: "Flow",
    data: { diagram: "graph LR; A-->B" },
    options: { theme: "ground-control", outputFormat: "html" },
  } as VisualisationRequest);
  assert.equal(result.outputFormat, "html");
  assert.ok(result.content.includes("class=\"mermaid\""));
  assert.ok(result.content.includes("A--&gt;B"));
});

test("renders a table as HTML when requested", () => {
  const result = render({
    requestId: "tbl-1",
    visualisationType: "table",
    title: "Projects",
    data: {
      columns: ["Name", { name: "Spend", align: "right" }],
      rows: [
        ["Alpha", 1200],
        ["Beta", 4500],
      ],
    },
    options: { outputFormat: "html" },
  } as VisualisationRequest);
  assert.equal(result.outputFormat, "html");
  assert.ok(result.content.includes("<table>"));
  assert.ok(result.content.includes("Alpha"));
});

test("renders a timeline SVG", () => {
  const result = render({
    requestId: "tl-1",
    visualisationType: "timeline",
    title: "Roadmap",
    data: {
      events: [
        { date: "2026-Q1", label: "Discovery", status: "complete" },
        { date: "2026-Q2", label: "Build", status: "in-progress" },
        { date: "2026-Q3", label: "Rollout", status: "planned" },
      ],
    },
    options: { theme: "ground-control", outputFormat: "svg" },
  } as VisualisationRequest);
  assert.match(result.content, /^<\?xml/);
  assert.ok(result.content.includes("Discovery"));
});

test("rejects PNG output with UNSUPPORTED_FORMAT", () => {
  assert.throws(
    () =>
      render({
        requestId: "vis-1",
        visualisationType: "chart",
        data: { labels: ["a"], values: [1] },
        options: { outputFormat: "png" },
      } as VisualisationRequest),
    (err) => err instanceof RenderError && err.code === "UNSUPPORTED_FORMAT",
  );
});

test("escapes potentially dangerous strings", () => {
  const result = render({
    requestId: "xss-1",
    visualisationType: "chart",
    title: "<script>alert(1)</script>",
    data: { labels: ["</text><x"], values: [1] },
    options: { outputFormat: "svg" },
  } as VisualisationRequest);
  assert.ok(!result.content.includes("<script>"));
  assert.ok(result.content.includes("&lt;script&gt;"));
  assert.ok(!result.content.includes("</text><x"));
});
