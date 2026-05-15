import {
  SUPPORTED_OUTPUT_FORMATS,
  SUPPORTED_THEMES,
  SUPPORTED_VISUALISATION_TYPES,
  type OutputFormat,
  type ThemeName,
  type VisualisationRequest,
  type VisualisationType,
} from "../models/VisualisationRequest.js";
import type { VisualisationError } from "../models/VisualisationResponse.js";

export interface ValidationResult {
  ok: boolean;
  errors: VisualisationError[];
  request?: VisualisationRequest;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function missing(field: string): VisualisationError {
  return {
    code: "INVALID_INPUT",
    message: `Missing required field: ${field}`,
    field,
  };
}

export function validateRequest(body: unknown): ValidationResult {
  const errors: VisualisationError[] = [];

  if (!isObject(body)) {
    return {
      ok: false,
      errors: [
        {
          code: "INVALID_INPUT",
          message: "Request body must be a JSON object.",
        },
      ],
    };
  }

  const requestId = body.requestId;
  if (typeof requestId !== "string" || requestId.trim() === "") {
    errors.push(missing("requestId"));
  }

  const visualisationType = body.visualisationType;
  if (typeof visualisationType !== "string" || visualisationType.trim() === "") {
    errors.push(missing("visualisationType"));
  } else if (
    !SUPPORTED_VISUALISATION_TYPES.includes(visualisationType as VisualisationType)
  ) {
    errors.push({
      code: "UNSUPPORTED_TYPE",
      message: `Unsupported visualisationType: ${visualisationType}. Supported: ${SUPPORTED_VISUALISATION_TYPES.join(", ")}.`,
      field: "visualisationType",
    });
  }

  if (body.data === undefined || body.data === null) {
    errors.push(missing("data"));
  }

  const options = body.options;
  if (!isObject(options)) {
    errors.push(missing("options"));
  } else {
    const outputFormat = options.outputFormat;
    if (typeof outputFormat !== "string" || outputFormat.trim() === "") {
      errors.push(missing("options.outputFormat"));
    } else if (!SUPPORTED_OUTPUT_FORMATS.includes(outputFormat as OutputFormat)) {
      errors.push({
        code: "UNSUPPORTED_FORMAT",
        message: `Unsupported outputFormat: ${outputFormat}. Supported: ${SUPPORTED_OUTPUT_FORMATS.join(", ")}.`,
        field: "options.outputFormat",
      });
    }

    if (options.theme !== undefined) {
      if (
        typeof options.theme !== "string" ||
        !SUPPORTED_THEMES.includes(options.theme as ThemeName)
      ) {
        errors.push({
          code: "UNSUPPORTED_THEME",
          message: `Unsupported theme: ${String(options.theme)}. Supported: ${SUPPORTED_THEMES.join(", ")}.`,
          field: "options.theme",
        });
      }
    }

    if (
      options.width !== undefined &&
      (typeof options.width !== "number" || options.width <= 0 || options.width > 10000)
    ) {
      errors.push({
        code: "INVALID_INPUT",
        message: "options.width must be a positive number up to 10000.",
        field: "options.width",
      });
    }
    if (
      options.height !== undefined &&
      (typeof options.height !== "number" || options.height <= 0 || options.height > 10000)
    ) {
      errors.push({
        code: "INVALID_INPUT",
        message: "options.height must be a positive number up to 10000.",
        field: "options.height",
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const normalised = body as unknown as VisualisationRequest;
  normalised.options.theme ??= "default";
  normalised.options.width ??= 1200;
  normalised.options.height ??= 800;

  return { ok: true, errors: [], request: normalised };
}
