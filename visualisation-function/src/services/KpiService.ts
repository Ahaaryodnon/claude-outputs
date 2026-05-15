import type { VisualisationRequest } from "../models/VisualisationRequest.js";
import type { Theme } from "../themes/groundControlTheme.js";
import { escapeXml, svgRoot } from "../utils/svg.js";

interface KpiItem {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  delta?: string | number;
  description?: string;
}

interface KpiData {
  kpis?: KpiItem[];
  items?: KpiItem[];
  label?: string;
  value?: string | number;
  unit?: string;
  trend?: "up" | "down" | "flat";
  delta?: string | number;
  description?: string;
}

function normaliseKpis(data: KpiData): KpiItem[] {
  if (Array.isArray(data.kpis)) return data.kpis;
  if (Array.isArray(data.items)) return data.items;
  if (data.label !== undefined && data.value !== undefined) {
    return [
      {
        label: data.label,
        value: data.value,
        unit: data.unit,
        trend: data.trend,
        delta: data.delta,
        description: data.description,
      },
    ];
  }
  throw new Error("KPI visualisation requires data.kpis (array) or a single {label, value}.");
}

export function renderKpiSvg(req: VisualisationRequest, theme: Theme): string {
  const width = req.options.width ?? 1200;
  const height = req.options.height ?? 400;
  const data = (req.data ?? {}) as KpiData;
  const kpis = normaliseKpis(data);

  const header = req.title
    ? `<text x="32" y="40" font-family="${theme.fontFamily}" font-size="22" font-weight="700" fill="${theme.palette.text}">${escapeXml(req.title)}</text>`
    : "";
  const sub = req.description
    ? `<text x="32" y="64" font-family="${theme.fontFamily}" font-size="13" fill="${theme.palette.muted}">${escapeXml(req.description)}</text>`
    : "";

  const cardsTop = req.title || req.description ? 90 : 32;
  const gap = 24;
  const availableWidth = width - 64;
  const cardWidth = (availableWidth - gap * (kpis.length - 1)) / kpis.length;
  const cardHeight = Math.min(220, height - cardsTop - 32);

  const cards = kpis
    .map((kpi, i) => {
      const x = 32 + i * (cardWidth + gap);
      const trendColour =
        kpi.trend === "up"
          ? theme.palette.secondary
          : kpi.trend === "down"
            ? theme.palette.accent
            : theme.palette.muted;
      const trendSymbol =
        kpi.trend === "up" ? "▲" : kpi.trend === "down" ? "▼" : kpi.trend === "flat" ? "▬" : "";
      const valueDisplay = `${kpi.value}${kpi.unit ? ` ${kpi.unit}` : ""}`;
      return [
        `<rect x="${x}" y="${cardsTop}" width="${cardWidth}" height="${cardHeight}" rx="12" fill="${theme.palette.surface}"/>`,
        `<text x="${x + 24}" y="${cardsTop + 36}" font-family="${theme.fontFamily}" font-size="14" fill="${theme.palette.muted}">${escapeXml(kpi.label)}</text>`,
        `<text x="${x + 24}" y="${cardsTop + 92}" font-family="${theme.fontFamily}" font-size="44" font-weight="700" fill="${theme.palette.text}">${escapeXml(valueDisplay)}</text>`,
        trendSymbol
          ? `<text x="${x + 24}" y="${cardsTop + 124}" font-family="${theme.fontFamily}" font-size="14" font-weight="600" fill="${trendColour}">${trendSymbol} ${escapeXml(kpi.delta ?? "")}</text>`
          : "",
        kpi.description
          ? `<text x="${x + 24}" y="${cardsTop + cardHeight - 24}" font-family="${theme.fontFamily}" font-size="12" fill="${theme.palette.muted}">${escapeXml(kpi.description)}</text>`
          : "",
      ].join("");
    })
    .join("");

  return svgRoot(width, height, `${header}${sub}${cards}`, theme.palette.background);
}
