import type { VisualisationRequest } from "../models/VisualisationRequest.js";
import type { Theme } from "../themes/groundControlTheme.js";
import { escapeXml, svgRoot } from "../utils/svg.js";

interface TimelineEvent {
  date: string;
  label: string;
  description?: string;
  status?: "complete" | "in-progress" | "planned";
}

interface TimelineData {
  events?: TimelineEvent[];
  milestones?: TimelineEvent[];
}

export function renderTimelineSvg(req: VisualisationRequest, theme: Theme): string {
  const data = (req.data ?? {}) as TimelineData;
  const events = data.events ?? data.milestones ?? [];
  if (events.length === 0) {
    throw new Error("Timeline visualisation requires data.events (or data.milestones) array.");
  }

  const width = req.options.width ?? 1200;
  const height = req.options.height ?? 480;
  const topOffset = req.title ? 90 : 40;
  const axisY = topOffset + 60;
  const usable = width - 120;
  const step = events.length > 1 ? usable / (events.length - 1) : 0;

  const header = req.title
    ? `<text x="32" y="40" font-family="${theme.fontFamily}" font-size="22" font-weight="700" fill="${theme.palette.text}">${escapeXml(req.title)}</text>`
    : "";
  const desc = req.description
    ? `<text x="32" y="64" font-family="${theme.fontFamily}" font-size="13" fill="${theme.palette.muted}">${escapeXml(req.description)}</text>`
    : "";

  const axis = `<line x1="60" y1="${axisY}" x2="${width - 60}" y2="${axisY}" stroke="${theme.palette.primary}" stroke-width="2"/>`;

  const items = events
    .map((evt, i) => {
      const cx = 60 + step * i;
      const colour =
        evt.status === "complete"
          ? theme.palette.secondary
          : evt.status === "planned"
            ? theme.palette.muted
            : theme.palette.accent;
      const labelY = i % 2 === 0 ? axisY - 30 : axisY + 50;
      const descY = labelY + (i % 2 === 0 ? -18 : 18);
      return [
        `<circle cx="${cx}" cy="${axisY}" r="9" fill="${colour}" stroke="${theme.palette.background}" stroke-width="3"/>`,
        `<text x="${cx}" y="${labelY}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="13" font-weight="600" fill="${theme.palette.text}">${escapeXml(evt.label)}</text>`,
        `<text x="${cx}" y="${descY}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="11" fill="${theme.palette.muted}">${escapeXml(evt.date)}</text>`,
        evt.description
          ? `<text x="${cx}" y="${descY + (i % 2 === 0 ? -16 : 16)}" text-anchor="middle" font-family="${theme.fontFamily}" font-size="11" fill="${theme.palette.muted}">${escapeXml(evt.description)}</text>`
          : "",
      ].join("");
    })
    .join("");

  return svgRoot(width, height, `${header}${desc}${axis}${items}`, theme.palette.background);
}
