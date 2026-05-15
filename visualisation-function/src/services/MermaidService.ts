import type { VisualisationRequest } from "../models/VisualisationRequest.js";
import type { Theme } from "../themes/groundControlTheme.js";
import { escapeHtml } from "../utils/svg.js";

interface MermaidData {
  diagram?: string;
  definition?: string;
  source?: string;
}

export function getMermaidSource(req: VisualisationRequest): string {
  const data = (req.data ?? {}) as MermaidData;
  const src = data.diagram ?? data.definition ?? data.source;
  if (typeof src !== "string" || src.trim() === "") {
    throw new Error("Mermaid visualisation requires data.diagram (or data.definition / data.source) as a string.");
  }
  return src.trim();
}

export function renderMermaidHtml(req: VisualisationRequest, theme: Theme): string {
  const source = getMermaidSource(req);
  const mermaidTheme = theme.name === "ground-control" ? "base" : "default";
  const themeVars =
    theme.name === "ground-control"
      ? `themeVariables: { primaryColor: '${theme.palette.surface}', primaryTextColor: '${theme.palette.text}', primaryBorderColor: '${theme.palette.primary}', lineColor: '${theme.palette.primary}', secondaryColor: '${theme.palette.secondary}', tertiaryColor: '${theme.palette.accent}', fontFamily: '${theme.fontFamily}' }`
      : "";
  const config = `{ startOnLoad: true, theme: '${mermaidTheme}', ${themeVars} }`;
  const safeTitle = escapeHtml(req.title ?? "Mermaid diagram");
  return [
    "<!doctype html>",
    `<html lang="en"><head><meta charset="utf-8"><title>${safeTitle}</title>`,
    `<style>body{margin:0;padding:24px;font-family:${theme.fontFamily};background:${theme.palette.background};color:${theme.palette.text};}h1{font-size:20px;margin:0 0 8px}</style>`,
    "</head><body>",
    req.title ? `<h1>${safeTitle}</h1>` : "",
    `<pre class="mermaid">${escapeHtml(source)}</pre>`,
    `<script type="module">`,
    `import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';`,
    `mermaid.initialize(${config});`,
    `</script>`,
    "</body></html>",
  ].join("");
}

export function renderMermaidPlaceholderSvg(req: VisualisationRequest, theme: Theme): string {
  const source = getMermaidSource(req);
  const width = req.options.width ?? 1200;
  const height = req.options.height ?? 800;
  const lines = source.split(/\r?\n/);
  const lineHeight = 18;
  const rows = lines
    .map(
      (line, i) =>
        `<text x="24" y="${72 + i * lineHeight}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="13" fill="${theme.palette.text}" xml:space="preserve">${escapeHtml(line)}</text>`,
    )
    .join("");
  const note = `Server-side Mermaid → SVG conversion is not available in this runtime. Render the embedded Mermaid source client-side, or request outputFormat 'mermaid' or 'html'.`;
  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`,
    `<rect width="${width}" height="${height}" fill="${theme.palette.surface}"/>`,
    req.title
      ? `<text x="24" y="36" font-family="${theme.fontFamily}" font-size="18" font-weight="700" fill="${theme.palette.text}">${escapeHtml(req.title)}</text>`
      : "",
    `<text x="24" y="56" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.muted}">${escapeHtml(note)}</text>`,
    rows,
    `</svg>`,
  ].join("");
}
