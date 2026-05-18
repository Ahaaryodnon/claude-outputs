# Microsoft 365 Copilot plugin package

This folder contains the artefacts needed to surface `GenerateVisualisation`
as an **API plugin action** inside a Microsoft 365 Copilot **declarative
agent**.

| File                     | Purpose                                                                                                  |
|--------------------------|----------------------------------------------------------------------------------------------------------|
| `openapi.yaml`           | OpenAPI 3.0.3 description of `POST /api/visualisation/generate`. Authored to the Microsoft Learn [OpenAPI document guidance](https://learn.microsoft.com/microsoft-365/copilot/extensibility/openapi-document-guidance) — every operation has `operationId`, `summary`, `description`, parameter descriptions, and response schemas with examples. |
| `ai-plugin.json`         | API plugin manifest ([`plugin-manifest-2.4`](https://learn.microsoft.com/microsoft-365/copilot/extensibility/plugin-manifest-2.4)) that references `openapi.yaml` and declares `generateVisualisation` as an exposed function. |
| `declarativeAgent.json`  | Declarative-agent manifest ([`declarative-agent-manifest-1.7`](https://learn.microsoft.com/microsoft-365/copilot/extensibility/declarative-agent-manifest-1.7)) that bundles the plugin as an `actions` entry. |

## How to deploy

1. Replace the `servers[0].url` `functionApp` variable default in
   `openapi.yaml` with your real Function App name, or pass it through at
   import time in the Microsoft 365 Agents Toolkit.
2. In the [Teams Developer Portal](https://dev.teams.microsoft.com),
   create an **API key** entry for your Function App's function key
   and copy the generated **reference ID** into
   `ai-plugin.json -> runtimes[0].auth.reference_id`
   (replace `REPLACE_WITH_TDP_API_KEY_REFERENCE_ID`).
   The OpenAPI spec already declares the API key as the
   `x-functions-key` header.
3. Reference `declarativeAgent.json` from your Teams app `manifest.json`:
   ```json
   "copilotAgents": {
     "declarativeAgents": [
       { "id": "groundControlVisualiser", "file": "declarativeAgent.json" }
     ]
   }
   ```
4. Package and sideload via the Agents Toolkit, or upload the resulting
   `.zip` through the [Microsoft 365 admin centre](https://admin.microsoft.com)
   for tenant-wide distribution.

## Validating the OpenAPI document

Either tool works:

```bash
# Microsoft's Hidi validator
dotnet tool install -g Microsoft.OpenApi.Hidi
hidi validate -d copilot/openapi.yaml

# Or via Spectral
npx @stoplight/spectral-cli lint copilot/openapi.yaml
```

## Notes

- `png` is intentionally absent from the manifest's recommended formats
  because the function does not rasterise SVG in-process. If a PNG is
  required, route the SVG response through a downstream renderer
  (Container App with `sharp`, QuickChart, or `mmdc` for Mermaid).
- The OpenAPI document deliberately exposes a **single operation**.
  Copilot quality degrades past ~10 functions per plugin
  ([source](https://learn.microsoft.com/microsoft-365/copilot/extensibility/overview-plugins#generating-plugin-packages)),
  and one rich operation routes more reliably than several near-duplicates.
