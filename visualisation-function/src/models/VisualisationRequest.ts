export type VisualisationType =
  | "chart"
  | "mermaid"
  | "flowchart"
  | "kpi"
  | "table"
  | "timeline";

export type OutputFormat = "svg" | "png" | "html" | "mermaid" | "json";

export type ThemeName = "ground-control" | "default";

export interface VisualisationOptions {
  theme?: ThemeName;
  outputFormat: OutputFormat;
  width?: number;
  height?: number;
  chartType?: "bar" | "line" | "pie" | "scatter" | "area";
}

export interface VisualisationMetadata {
  agentName?: string;
  userId?: string;
  source?: string;
}

export interface VisualisationRequest {
  requestId: string;
  visualisationType: VisualisationType;
  title?: string;
  description?: string;
  data: unknown;
  options: VisualisationOptions;
  metadata?: VisualisationMetadata;
}

export const SUPPORTED_VISUALISATION_TYPES: VisualisationType[] = [
  "chart",
  "mermaid",
  "flowchart",
  "kpi",
  "table",
  "timeline",
];

export const SUPPORTED_OUTPUT_FORMATS: OutputFormat[] = [
  "svg",
  "png",
  "html",
  "mermaid",
  "json",
];

export const SUPPORTED_THEMES: ThemeName[] = ["ground-control", "default"];
