import type { VisualisationRequest } from "../models/VisualisationRequest.js";
import type { Theme } from "../themes/groundControlTheme.js";
import { escapeHtml, escapeXml, svgRoot } from "../utils/svg.js";

interface TableData {
  columns?: (string | { name: string; align?: "left" | "right" | "center" })[];
  rows?: (string | number | null)[][];
  headers?: string[];
}

function normaliseColumns(data: TableData): { name: string; align: "left" | "right" | "center" }[] {
  const cols = data.columns ?? data.headers ?? [];
  return cols.map((c) =>
    typeof c === "string" ? { name: c, align: "left" } : { name: c.name, align: c.align ?? "left" },
  );
}

function valueAlign(value: unknown, fallback: "left" | "right" | "center"): "left" | "right" | "center" {
  if (fallback !== "left") return fallback;
  return typeof value === "number" ? "right" : "left";
}

export function renderTableHtml(req: VisualisationRequest, theme: Theme): string {
  const data = (req.data ?? {}) as TableData;
  const columns = normaliseColumns(data);
  const rows = data.rows ?? [];
  if (columns.length === 0) {
    throw new Error("Table visualisation requires data.columns.");
  }

  const css = `
    body{margin:0;padding:24px;font-family:${theme.fontFamily};background:${theme.palette.background};color:${theme.palette.text}}
    h1{font-size:20px;margin:0 0 4px}
    p.desc{margin:0 0 16px;color:${theme.palette.muted};font-size:13px}
    table{border-collapse:collapse;width:100%;font-size:13px}
    thead th{background:${theme.palette.primary};color:#fff;text-align:left;padding:10px 12px;font-weight:600}
    tbody td{padding:10px 12px;border-bottom:1px solid ${theme.palette.surface}}
    tbody tr:nth-child(even){background:${theme.palette.surface}}
  `;

  const head = columns
    .map((c) => `<th style="text-align:${c.align}">${escapeHtml(c.name)}</th>`)
    .join("");
  const body = rows
    .map(
      (r) =>
        `<tr>${columns
          .map((c, i) => {
            const value = r[i] ?? "";
            return `<td style="text-align:${valueAlign(value, c.align)}">${escapeHtml(value)}</td>`;
          })
          .join("")}</tr>`,
    )
    .join("");

  return [
    "<!doctype html><html lang='en'><head><meta charset='utf-8'>",
    `<title>${escapeHtml(req.title ?? "Table")}</title>`,
    `<style>${css}</style></head><body>`,
    req.title ? `<h1>${escapeHtml(req.title)}</h1>` : "",
    req.description ? `<p class="desc">${escapeHtml(req.description)}</p>` : "",
    `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`,
    "</body></html>",
  ].join("");
}

export function renderTableSvg(req: VisualisationRequest, theme: Theme): string {
  const width = req.options.width ?? 1200;
  const data = (req.data ?? {}) as TableData;
  const columns = normaliseColumns(data);
  const rows = data.rows ?? [];
  if (columns.length === 0) {
    throw new Error("Table visualisation requires data.columns.");
  }

  const rowHeight = 32;
  const headerHeight = 40;
  const topOffset = req.title ? 70 : 24;
  const height = topOffset + headerHeight + rowHeight * rows.length + 24;
  const colWidth = (width - 48) / columns.length;

  const header = req.title
    ? `<text x="24" y="36" font-family="${theme.fontFamily}" font-size="20" font-weight="700" fill="${theme.palette.text}">${escapeXml(req.title)}</text>`
    : "";
  const desc = req.description
    ? `<text x="24" y="58" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.muted}">${escapeXml(req.description)}</text>`
    : "";

  const headerCells = columns
    .map(
      (c, i) =>
        `<rect x="${24 + i * colWidth}" y="${topOffset}" width="${colWidth}" height="${headerHeight}" fill="${theme.palette.primary}"/>` +
        `<text x="${24 + i * colWidth + 12}" y="${topOffset + 26}" font-family="${theme.fontFamily}" font-size="13" font-weight="600" fill="#FFFFFF">${escapeXml(c.name)}</text>`,
    )
    .join("");

  const bodyRows = rows
    .map((r, ri) => {
      const y = topOffset + headerHeight + ri * rowHeight;
      const bg =
        ri % 2 === 1
          ? `<rect x="24" y="${y}" width="${width - 48}" height="${rowHeight}" fill="${theme.palette.surface}"/>`
          : "";
      const cells = columns
        .map((_, ci) => {
          const value = r[ci] ?? "";
          return `<text x="${24 + ci * colWidth + 12}" y="${y + 22}" font-family="${theme.fontFamily}" font-size="13" fill="${theme.palette.text}">${escapeXml(value)}</text>`;
        })
        .join("");
      return bg + cells;
    })
    .join("");

  return svgRoot(width, height, `${header}${desc}${headerCells}${bodyRows}`, theme.palette.background);
}
