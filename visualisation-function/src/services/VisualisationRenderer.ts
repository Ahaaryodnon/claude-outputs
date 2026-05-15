import type {
  OutputFormat,
  VisualisationRequest,
  VisualisationType,
} from "../models/VisualisationRequest.js";
import { resolveTheme } from "../themes/groundControlTheme.js";
import { wrapAsHtml } from "../utils/svg.js";
import { renderChartSvg } from "./ChartService.js";
import { renderKpiSvg } from "./KpiService.js";
import {
  getMermaidSource,
  renderMermaidHtml,
  renderMermaidPlaceholderSvg,
} from "./MermaidService.js";
import { renderTableHtml, renderTableSvg } from "./TableService.js";
import { renderTimelineSvg } from "./TimelineService.js";

export interface RenderResult {
  content: string;
  outputFormat: OutputFormat;
  contentType: string;
}

const CONTENT_TYPE: Record<OutputFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  html: "text/html; charset=utf-8",
  mermaid: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
};

export function render(req: VisualisationRequest): RenderResult {
  const theme = resolveTheme(req.options.theme);
  const type = req.visualisationType as VisualisationType;
  const format = req.options.outputFormat;

  if (format === "png") {
    throw new RenderError(
      "UNSUPPORTED_FORMAT",
      "PNG output is not supported in the in-process renderer. Request 'svg' or 'html'; PNG can be produced by a downstream rasteriser.",
    );
  }

  if (format === "json") {
    return {
      content: JSON.stringify(req, null, 2),
      outputFormat: "json",
      contentType: CONTENT_TYPE.json,
    };
  }

  switch (type) {
    case "chart": {
      const svg = renderChartSvg(req, theme);
      return formatOutput(svg, format, req.title, theme.fontFamily);
    }
    case "kpi": {
      const svg = renderKpiSvg(req, theme);
      return formatOutput(svg, format, req.title, theme.fontFamily);
    }
    case "table": {
      if (format === "html") {
        return {
          content: renderTableHtml(req, theme),
          outputFormat: "html",
          contentType: CONTENT_TYPE.html,
        };
      }
      const svg = renderTableSvg(req, theme);
      return formatOutput(svg, format, req.title, theme.fontFamily);
    }
    case "timeline": {
      const svg = renderTimelineSvg(req, theme);
      return formatOutput(svg, format, req.title, theme.fontFamily);
    }
    case "mermaid":
    case "flowchart": {
      if (format === "mermaid") {
        return {
          content: getMermaidSource(req),
          outputFormat: "mermaid",
          contentType: CONTENT_TYPE.mermaid,
        };
      }
      if (format === "html") {
        return {
          content: renderMermaidHtml(req, theme),
          outputFormat: "html",
          contentType: CONTENT_TYPE.html,
        };
      }
      if (format === "svg") {
        return {
          content: renderMermaidPlaceholderSvg(req, theme),
          outputFormat: "svg",
          contentType: CONTENT_TYPE.svg,
        };
      }
      throw new RenderError(
        "UNSUPPORTED_FORMAT",
        `Format '${format}' is not supported for Mermaid. Use 'mermaid', 'html' or 'svg'.`,
      );
    }
    default:
      throw new RenderError("UNSUPPORTED_TYPE", `Unsupported visualisationType: ${type}`);
  }
}

function formatOutput(
  svg: string,
  format: OutputFormat,
  title: string | undefined,
  fontFamily: string,
): RenderResult {
  if (format === "svg") {
    return { content: svg, outputFormat: "svg", contentType: CONTENT_TYPE.svg };
  }
  if (format === "html") {
    return {
      content: wrapAsHtml(title ?? "Visualisation", svg, fontFamily),
      outputFormat: "html",
      contentType: CONTENT_TYPE.html,
    };
  }
  throw new RenderError(
    "UNSUPPORTED_FORMAT",
    `Format '${format}' is not supported for this visualisationType.`,
  );
}

export class RenderError extends Error {
  constructor(
    public code: "UNSUPPORTED_TYPE" | "UNSUPPORTED_FORMAT" | "RENDER_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "RenderError";
  }
}
