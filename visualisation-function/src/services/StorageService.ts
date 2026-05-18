import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { randomUUID } from "node:crypto";
import type { OutputFormat } from "../models/VisualisationRequest.js";

const FORMAT_CONTENT_TYPE: Record<OutputFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
  html: "text/html; charset=utf-8",
  mermaid: "text/plain; charset=utf-8",
  json: "application/json; charset=utf-8",
};

const FORMAT_EXTENSION: Record<OutputFormat, string> = {
  svg: "svg",
  png: "png",
  html: "html",
  mermaid: "mmd",
  json: "json",
};

export interface StorageConfig {
  accountUrl?: string;
  container?: string;
  inlineMaxBytes: number;
}

export function loadStorageConfig(): StorageConfig {
  return {
    accountUrl: process.env.VISUALISATION_BLOB_ACCOUNT_URL,
    container: process.env.VISUALISATION_BLOB_CONTAINER ?? "visualisations",
    inlineMaxBytes: Number(process.env.VISUALISATION_INLINE_MAX_BYTES ?? 262_144),
  };
}

export function shouldUseBlobStorage(content: string, config: StorageConfig): boolean {
  if (!config.accountUrl) return false;
  return Buffer.byteLength(content, "utf8") > config.inlineMaxBytes;
}

export async function uploadToBlob(
  requestId: string,
  content: string | Buffer,
  outputFormat: OutputFormat,
  config: StorageConfig,
): Promise<string> {
  if (!config.accountUrl) {
    throw new Error("VISUALISATION_BLOB_ACCOUNT_URL is not configured.");
  }
  const credential = new DefaultAzureCredential();
  const service = new BlobServiceClient(config.accountUrl, credential);
  const containerClient = service.getContainerClient(config.container ?? "visualisations");
  await containerClient.createIfNotExists();

  const blobName = `${new Date().toISOString().slice(0, 10)}/${requestId}-${randomUUID()}.${FORMAT_EXTENSION[outputFormat]}`;
  const blockBlob = containerClient.getBlockBlobClient(blobName);
  const body = typeof content === "string" ? Buffer.from(content, "utf8") : content;
  await blockBlob.uploadData(body, {
    blobHTTPHeaders: { blobContentType: FORMAT_CONTENT_TYPE[outputFormat] },
  });
  return blockBlob.url;
}
