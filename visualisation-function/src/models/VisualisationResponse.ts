import type { OutputFormat, VisualisationType } from "./VisualisationRequest.js";

export interface VisualisationError {
  code:
    | "INVALID_INPUT"
    | "UNSUPPORTED_TYPE"
    | "UNSUPPORTED_FORMAT"
    | "UNSUPPORTED_THEME"
    | "RENDER_FAILED"
    | "STORAGE_FAILED"
    | "INTERNAL_ERROR";
  message: string;
  field?: string;
}

export interface VisualisationResponse {
  requestId: string;
  status: "success" | "failed";
  visualisationType: VisualisationType | string;
  outputFormat: OutputFormat | string;
  content: string | null;
  contentUrl: string | null;
  errors: VisualisationError[];
}
