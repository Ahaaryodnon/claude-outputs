import type { VisualisationRequest } from "../models/VisualisationRequest.js";
import type { Theme } from "../themes/groundControlTheme.js";
import { escapeXml, svgRoot } from "../utils/svg.js";

type ChartType = "bar" | "line" | "pie" | "scatter" | "area";

interface ChartData {
  labels?: string[];
  values?: number[];
  series?: { name: string; values: number[] }[];
  points?: { x: number; y: number; label?: string }[];
}

const PADDING = { top: 80, right: 40, bottom: 70, left: 70 };

export function renderChartSvg(req: VisualisationRequest, theme: Theme): string {
  const width = req.options.width ?? 1200;
  const height = req.options.height ?? 800;
  const data = (req.data ?? {}) as ChartData;
  const chartType: ChartType = (req.options.chartType ?? inferChartType(data)) as ChartType;

  let body = renderHeader(req.title, req.description, width, theme);

  switch (chartType) {
    case "bar":
      body += renderBarChart(data, width, height, theme);
      break;
    case "line":
      body += renderLineChart(data, width, height, theme, false);
      break;
    case "area":
      body += renderLineChart(data, width, height, theme, true);
      break;
    case "pie":
      body += renderPieChart(data, width, height, theme);
      break;
    case "scatter":
      body += renderScatterChart(data, width, height, theme);
      break;
    default:
      throw new Error(`Unsupported chartType: ${chartType}`);
  }

  return svgRoot(width, height, body, theme.palette.background);
}

function inferChartType(data: ChartData): ChartType {
  if (data?.points && Array.isArray(data.points)) return "scatter";
  if (data?.series && Array.isArray(data.series)) return "line";
  return "bar";
}

function renderHeader(title: string | undefined, description: string | undefined, width: number, theme: Theme): string {
  const titleText = title
    ? `<text x="${PADDING.left}" y="32" font-family="${theme.fontFamily}" font-size="22" font-weight="700" fill="${theme.palette.text}">${escapeXml(title)}</text>`
    : "";
  const descText = description
    ? `<text x="${PADDING.left}" y="56" font-family="${theme.fontFamily}" font-size="13" fill="${theme.palette.muted}">${escapeXml(description)}</text>`
    : "";
  return `<g>${titleText}${descText}</g>`;
}

function plotArea(width: number, height: number) {
  return {
    x: PADDING.left,
    y: PADDING.top,
    w: width - PADDING.left - PADDING.right,
    h: height - PADDING.top - PADDING.bottom,
  };
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * exp;
}

function renderAxes(area: { x: number; y: number; w: number; h: number }, theme: Theme, yMax: number, yMin = 0, xLabels?: string[]): string {
  const ticks = 5;
  const lines: string[] = [];
  for (let i = 0; i <= ticks; i++) {
    const t = i / ticks;
    const y = area.y + area.h - t * area.h;
    const value = yMin + t * (yMax - yMin);
    lines.push(
      `<line x1="${area.x}" y1="${y}" x2="${area.x + area.w}" y2="${y}" stroke="${theme.palette.surface}" stroke-width="1"/>`,
      `<text x="${area.x - 8}" y="${y + 4}" text-anchor="end" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.muted}">${formatNumber(value)}</text>`,
    );
  }
  lines.push(
    `<line x1="${area.x}" y1="${area.y}" x2="${area.x}" y2="${area.y + area.h}" stroke="${theme.palette.text}" stroke-width="1"/>`,
    `<line x1="${area.x}" y1="${area.y + area.h}" x2="${area.x + area.w}" y2="${area.y + area.h}" stroke="${theme.palette.text}" stroke-width="1"/>`,
  );

  if (xLabels && xLabels.length > 0) {
    const step = area.w / xLabels.length;
    xLabels.forEach((label, i) => {
      const cx = area.x + step * (i + 0.5);
      lines.push(
        `<text x="${cx}" y="${area.y + area.h + 20}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.muted}">${escapeXml(label)}</text>`,
      );
    });
  }
  return lines.join("");
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value) >= 1000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2);
}

function renderBarChart(data: ChartData, width: number, height: number, theme: Theme): string {
  const labels = data.labels ?? [];
  const values = data.values ?? [];
  if (labels.length === 0 || values.length === 0) {
    throw new Error("Bar chart requires data.labels and data.values arrays.");
  }
  const area = plotArea(width, height);
  const yMax = niceMax(Math.max(...values));
  const step = area.w / labels.length;
  const barWidth = step * 0.6;

  const axes = renderAxes(area, theme, yMax, 0, labels);
  const bars = labels
    .map((_, i) => {
      const v = values[i] ?? 0;
      const h = (v / yMax) * area.h;
      const x = area.x + step * i + (step - barWidth) / 2;
      const y = area.y + area.h - h;
      const colour = theme.palette.series[i % theme.palette.series.length];
      return [
        `<rect x="${x}" y="${y}" width="${barWidth}" height="${h}" fill="${colour}" rx="4" ry="4"><title>${escapeXml(labels[i])}: ${formatNumber(v)}</title></rect>`,
        `<text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.text}">${formatNumber(v)}</text>`,
      ].join("");
    })
    .join("");

  return `<g>${axes}${bars}</g>`;
}

function renderLineChart(data: ChartData, width: number, height: number, theme: Theme, fillArea: boolean): string {
  const labels = data.labels ?? [];
  const series = data.series ?? (data.values ? [{ name: "Series", values: data.values }] : []);
  if (labels.length === 0 || series.length === 0) {
    throw new Error("Line/area chart requires data.labels and data.series (or data.values).");
  }
  const allValues = series.flatMap((s) => s.values);
  const yMax = niceMax(Math.max(...allValues));
  const area = plotArea(width, height);
  const axes = renderAxes(area, theme, yMax, 0, labels);
  const step = area.w / Math.max(labels.length - 1, 1);

  const seriesSvg = series
    .map((s, idx) => {
      const colour = theme.palette.series[idx % theme.palette.series.length];
      const points = s.values.map((v, i) => {
        const x = area.x + step * i;
        const y = area.y + area.h - (v / yMax) * area.h;
        return `${x},${y}`;
      });
      const path = `M ${points.join(" L ")}`;
      const fill = fillArea
        ? `<path d="${path} L ${area.x + step * (s.values.length - 1)},${area.y + area.h} L ${area.x},${area.y + area.h} Z" fill="${colour}" fill-opacity="0.2"/>`
        : "";
      const stroke = `<path d="${path}" fill="none" stroke="${colour}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
      const dots = s.values
        .map((v, i) => {
          const x = area.x + step * i;
          const y = area.y + area.h - (v / yMax) * area.h;
          return `<circle cx="${x}" cy="${y}" r="3.5" fill="${colour}"><title>${escapeXml(s.name)} ${escapeXml(labels[i])}: ${formatNumber(v)}</title></circle>`;
        })
        .join("");
      return fill + stroke + dots;
    })
    .join("");

  const legend = renderLegend(series.map((s, i) => ({ name: s.name, colour: theme.palette.series[i % theme.palette.series.length] })), area, theme);
  return `<g>${axes}${seriesSvg}${legend}</g>`;
}

function renderPieChart(data: ChartData, width: number, height: number, theme: Theme): string {
  const labels = data.labels ?? [];
  const values = data.values ?? [];
  if (labels.length === 0 || values.length === 0) {
    throw new Error("Pie chart requires data.labels and data.values arrays.");
  }
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const cx = width / 2;
  const cy = (height + PADDING.top - PADDING.bottom) / 2;
  const radius = Math.min(width, height - PADDING.top) * 0.35;

  let startAngle = -Math.PI / 2;
  const slices = labels
    .map((label, i) => {
      const value = values[i] ?? 0;
      const angle = (value / total) * Math.PI * 2;
      const endAngle = startAngle + angle;
      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      const colour = theme.palette.series[i % theme.palette.series.length];
      const labelAngle = startAngle + angle / 2;
      const lx = cx + radius * 0.6 * Math.cos(labelAngle);
      const ly = cy + radius * 0.6 * Math.sin(labelAngle);
      const pct = ((value / total) * 100).toFixed(1);
      startAngle = endAngle;
      return [
        `<path d="${d}" fill="${colour}" stroke="${theme.palette.background}" stroke-width="2"><title>${escapeXml(label)}: ${formatNumber(value)} (${pct}%)</title></path>`,
        `<text x="${lx}" y="${ly}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="12" fill="#FFFFFF" font-weight="600">${pct}%</text>`,
      ].join("");
    })
    .join("");

  const legend = renderLegend(
    labels.map((name, i) => ({ name, colour: theme.palette.series[i % theme.palette.series.length] })),
    { x: PADDING.left, y: height - PADDING.bottom + 24, w: width - PADDING.left - PADDING.right, h: 24 },
    theme,
  );
  return `<g>${slices}${legend}</g>`;
}

function renderScatterChart(data: ChartData, width: number, height: number, theme: Theme): string {
  const points = data.points ?? [];
  if (points.length === 0) {
    throw new Error("Scatter chart requires data.points array of {x, y}.");
  }
  const area = plotArea(width, height);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = niceMax(Math.max(...xs));
  const yMax = niceMax(Math.max(...ys));
  const axes = renderAxes(area, theme, yMax);

  const dots = points
    .map((p, i) => {
      const x = area.x + ((p.x - xMin) / (xMax - xMin || 1)) * area.w;
      const y = area.y + area.h - (p.y / yMax) * area.h;
      const colour = theme.palette.series[i % theme.palette.series.length];
      return `<circle cx="${x}" cy="${y}" r="5" fill="${colour}" fill-opacity="0.85"><title>${escapeXml(p.label ?? `(${p.x}, ${p.y})`)}</title></circle>`;
    })
    .join("");

  return `<g>${axes}${dots}</g>`;
}

function renderLegend(
  items: { name: string; colour: string }[],
  area: { x: number; y: number; w: number; h: number },
  theme: Theme,
): string {
  const itemW = Math.min(180, area.w / Math.max(items.length, 1));
  const y = area.y + area.h + 30;
  return items
    .map((item, i) => {
      const x = area.x + i * itemW;
      return [
        `<rect x="${x}" y="${y - 10}" width="12" height="12" fill="${item.colour}" rx="2"/>`,
        `<text x="${x + 18}" y="${y}" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.text}">${escapeXml(item.name)}</text>`,
      ].join("");
    })
    .join("");
}
