export function escapeXml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function escapeHtml(value: unknown): string {
  return escapeXml(value);
}

export function svgRoot(width: number, height: number, body: string, background?: string): string {
  const bg = background
    ? `<rect width="${width}" height="${height}" fill="${escapeXml(background)}"/>`
    : "";
  return [
    `<?xml version="1.0" encoding="UTF-8" standalone="no"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">`,
    bg,
    body,
    `</svg>`,
  ].join("");
}

export function wrapAsHtml(title: string, innerSvg: string, fontFamily: string): string {
  const safeTitle = escapeHtml(title || "Visualisation");
  return [
    "<!doctype html>",
    `<html lang="en"><head><meta charset="utf-8"><title>${safeTitle}</title>`,
    `<style>body{margin:0;padding:24px;font-family:${fontFamily};}</style>`,
    "</head><body>",
    innerSvg,
    "</body></html>",
  ].join("");
}
