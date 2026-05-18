# Visualisation Function

Azure Function (`GenerateVisualisation`) that turns structured visualisation
requests from AI agents into renderable output (SVG, HTML, Mermaid, JSON).

## Endpoint

```
POST /api/visualisation/generate
```

Auth level: `function` (use the function key, or front it with APIM / Easy
Auth). Function timeout is set to 30 seconds in `host.json`.

## Supported visualisation types

| Type        | Output formats        | Notes                                                            |
|-------------|------------------------|------------------------------------------------------------------|
| `chart`     | `svg`, `html`, `json`  | `options.chartType`: `bar`, `line`, `area`, `pie`, `scatter`     |
| `mermaid`   | `mermaid`, `html`, `svg` | `svg` returns a placeholder with the source embedded; render client-side or via mermaid-cli for true SVG |
| `flowchart` | same as `mermaid`      | Alias of `mermaid`                                               |
| `kpi`       | `svg`, `html`, `json`  | Single or grouped KPI cards                                      |
| `table`     | `svg`, `html`, `json`  | `html` is recommended for accessibility                          |
| `timeline`  | `svg`, `html`, `json`  | Milestones with `complete` / `in-progress` / `planned` status    |

`png` is intentionally not produced in-process to keep the function on the
Consumption plan (no native canvas/Puppeteer). Take the returned SVG/HTML
and rasterise it downstream (Azure Container App with `sharp`, QuickChart,
or `mmdc` for Mermaid) if a PNG is required.

## Themes

Pass `options.theme = "ground-control"` to apply the brand palette:

| Token       | Hex      |
|-------------|----------|
| darkGreen   | `#294238` |
| lightGreen  | `#B2D235` |
| midGreen    | `#50B748` |
| grey        | `#E6EBE3` |
| orange      | `#F57821` |

Default font: `Arial, Helvetica, sans-serif`.

## Storage fallback

If the rendered payload exceeds `VISUALISATION_INLINE_MAX_BYTES`
(default 256 KiB) **and** `VISUALISATION_BLOB_ACCOUNT_URL` is configured,
the output is uploaded to Azure Blob Storage using `DefaultAzureCredential`
(managed identity in Azure, `az login` locally). The response returns
`contentUrl` and `content: null`.

Required app settings for the blob fallback:

| Setting                              | Purpose                                    |
|--------------------------------------|--------------------------------------------|
| `VISUALISATION_BLOB_ACCOUNT_URL`     | e.g. `https://<account>.blob.core.windows.net` |
| `VISUALISATION_BLOB_CONTAINER`       | container name (default `visualisations`)  |
| `VISUALISATION_INLINE_MAX_BYTES`     | inline cut-off in bytes (default 262144)   |

Grant the function's managed identity the `Storage Blob Data Contributor`
role on the storage account.

## Validation

Required fields: `requestId`, `visualisationType`, `data`,
`options.outputFormat`. Unsupported `visualisationType`, `outputFormat` or
`theme` values produce HTTP 400 with a structured error body. See
`src/services/ValidationService.ts`.

## Local development

```bash
npm install
cp local.settings.json.example local.settings.json
npm run build
npm start          # requires the Azure Functions Core Tools v4
```

Run the tests:

```bash
npm test
```

## Samples

`samples/` contains ready-to-curl request bodies:

```bash
curl -sS -X POST "http://localhost:7071/api/visualisation/generate" \
  -H "content-type: application/json" \
  --data @samples/chart-bar.request.json | jq -r '.content' > chart.svg
```

## Project layout

```
visualisation-function/
  src/
    functions/GenerateVisualisation.ts   HTTP entry point
    services/
      ValidationService.ts                input contract checks
      VisualisationRenderer.ts            dispatches to type-specific renderers
      ChartService.ts                     bar/line/area/pie/scatter SVG
      MermaidService.ts                   passthrough + client-side render HTML
      KpiService.ts                       KPI cards SVG
      TableService.ts                     table SVG / HTML
      TimelineService.ts                  milestone timeline SVG
      StorageService.ts                   Azure Blob fallback
    themes/groundControlTheme.ts          palette + default theme
    models/                                request/response contracts
    utils/svg.ts                           shared SVG / XML helpers
  tests/                                   node:test unit tests
  samples/                                 example request bodies
  host.json, package.json, tsconfig.json
```

## Observability

Every request is logged with `requestId`, `visualisationType`,
`outputFormat`, `agentName`, `userId`, byte size, and storage decision.
Errors are logged with their code (`INVALID_INPUT`, `UNSUPPORTED_*`,
`RENDER_FAILED`, `STORAGE_FAILED`) so they can be alerted on in
Application Insights without exposing payload contents.
