import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from "@azure/functions";
import type { VisualisationResponse } from "../models/VisualisationResponse.js";
import { RenderError, render } from "../services/VisualisationRenderer.js";
import {
  loadStorageConfig,
  shouldUseBlobStorage,
  uploadToBlob,
} from "../services/StorageService.js";
import { validateRequest } from "../services/ValidationService.js";

export async function generateVisualisation(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, {
      requestId: "",
      status: "failed",
      visualisationType: "",
      outputFormat: "",
      content: null,
      contentUrl: null,
      errors: [{ code: "INVALID_INPUT", message: "Request body must be valid JSON." }],
    });
  }

  const validation = validateRequest(body);
  if (!validation.ok || !validation.request) {
    const requestId =
      typeof body === "object" && body !== null && "requestId" in body
        ? String((body as Record<string, unknown>).requestId ?? "")
        : "";
    context.log("Validation failed", { requestId, errors: validation.errors });
    return jsonResponse(400, {
      requestId,
      status: "failed",
      visualisationType:
        (typeof body === "object" && body !== null && "visualisationType" in body
          ? String((body as Record<string, unknown>).visualisationType ?? "")
          : "") || "",
      outputFormat: "",
      content: null,
      contentUrl: null,
      errors: validation.errors,
    });
  }

  const req = validation.request;
  context.log("GenerateVisualisation start", {
    requestId: req.requestId,
    visualisationType: req.visualisationType,
    outputFormat: req.options.outputFormat,
    agentName: req.metadata?.agentName,
    userId: req.metadata?.userId,
  });

  try {
    const rendered = render(req);
    const storageConfig = loadStorageConfig();
    let contentUrl: string | null = null;
    let inlineContent: string | null = rendered.content;

    if (shouldUseBlobStorage(rendered.content, storageConfig)) {
      try {
        contentUrl = await uploadToBlob(
          req.requestId,
          rendered.content,
          rendered.outputFormat,
          storageConfig,
        );
        inlineContent = null;
        context.log("Stored visualisation in blob", {
          requestId: req.requestId,
          contentUrl,
        });
      } catch (err) {
        context.error("Blob upload failed; returning inline content", {
          requestId: req.requestId,
          error: (err as Error).message,
        });
      }
    }

    const response: VisualisationResponse = {
      requestId: req.requestId,
      status: "success",
      visualisationType: req.visualisationType,
      outputFormat: rendered.outputFormat,
      content: inlineContent,
      contentUrl,
      errors: [],
    };
    context.log("GenerateVisualisation success", {
      requestId: req.requestId,
      bytes: Buffer.byteLength(rendered.content, "utf8"),
      stored: contentUrl !== null,
    });
    return jsonResponse(200, response);
  } catch (err) {
    if (err instanceof RenderError) {
      context.warn("Render rejected", { requestId: req.requestId, code: err.code, message: err.message });
      return jsonResponse(400, {
        requestId: req.requestId,
        status: "failed",
        visualisationType: req.visualisationType,
        outputFormat: req.options.outputFormat,
        content: null,
        contentUrl: null,
        errors: [{ code: err.code, message: err.message }],
      });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    context.error("Render failed", { requestId: req.requestId, error: message });
    return jsonResponse(500, {
      requestId: req.requestId,
      status: "failed",
      visualisationType: req.visualisationType,
      outputFormat: req.options.outputFormat,
      content: null,
      contentUrl: null,
      errors: [{ code: "RENDER_FAILED", message }],
    });
  }
}

function jsonResponse(status: number, body: VisualisationResponse): HttpResponseInit {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    jsonBody: body,
  };
}

app.http("GenerateVisualisation", {
  methods: ["POST"],
  authLevel: "function",
  route: "visualisation/generate",
  handler: generateVisualisation,
});
