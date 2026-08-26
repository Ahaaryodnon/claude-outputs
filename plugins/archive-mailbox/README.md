# Archive Mailbox plugin for Claude Cowork

Lets Claude interact with your Exchange Online **archive mailbox**
(In-Place Archive / "Online Archive") — something the normal Outlook/Mail
connectors cannot do, because Microsoft Graph's standard mail API explicitly
does not support in-place archive mailboxes.

## What it can do

| Capability | Route |
|---|---|
| Discover your archive mailbox id | Graph (beta `exchangeSettings`) |
| Browse archive folders, item counts | Graph Mailbox Import/Export API (v1.0) |
| List/search items by subject, sender, date | Graph (extended-property expansion) |
| Restore an archived item into your primary mailbox | Graph export → import (needs admin-consented scope) |
| Full-text search, read full bodies, export `.eml` | Local PST export (libpff) |

## Why two routes

Microsoft only recently closed the archive-mailbox gap in Graph (driven by the
EWS retirement in October 2026), via the **Mailbox Import/Export APIs**
(`/admin/exchange/mailboxes/{MBX:…}`). They work with delegated permissions,
but they are archival-grade, not mail-grade: items expose metadata only (no
body), export produces an opaque FastTransfer stream, and there is no
server-side full-text search. So:

- **Graph route** — live access: browse, metadata search, and restore items
  back to your inbox where they become fully readable.
- **PST route** — offline access: export the archive to a `.pst` from classic
  Outlook, then Claude searches/reads/exports messages locally with `libpff`.
  Full bodies and attachments, nothing leaves your machine.

## Setup

1. Install the plugin (this folder) into Claude Cowork / Claude Code.
2. For the Graph route, register a public-client app in Entra ID with
   delegated `MailboxFolder.Read` + `MailboxItem.Read` (no admin consent
   needed) and set `GRAPH_CLIENT_ID`. Add `MailboxItem.ImportExport`
   (admin consent) only if you want restore. Details:
   `skills/archive-mailbox/references/graph-api.md`.
3. For the PST route, `pip install libpff-python` and export your archive from
   classic Outlook for Windows. Details:
   `skills/archive-mailbox/references/pst-workflow.md`.

## Layout

```
plugins/archive-mailbox/
├── .claude-plugin/plugin.json
└── skills/archive-mailbox/
    ├── SKILL.md                    # how Claude decides + drives both routes
    ├── references/
    │   ├── graph-api.md            # endpoints, permissions, limits, redirects
    │   └── pst-workflow.md         # Outlook export steps + libpff usage
    └── scripts/
        ├── graph_archive.py        # stdlib-only Graph CLI (device-code auth)
        └── pst_tools.py            # PST tree/search/show/export (libpff)
```

## Known limitations (by design of the underlying APIs)

- Graph `mailboxItem` has no subject/sender/body properties; the plugin pulls
  subject/sender/date via MAPI extended properties, and reading a full body
  requires restoring the item to the primary mailbox first.
- No `$search` on archive items — substring matching happens client-side.
- Auto-expanding archives return HTTP 308 redirects to auxiliary mailboxes;
  the script follows them automatically.
- Archive discovery (`inPlaceArchiveMailboxId`) is beta-only for now.
- EWS-based approaches are dead ends (retirement begins October 2026).
- New Outlook and Outlook for Mac cannot export PSTs; classic Outlook for
  Windows (or an admin's Purview export) is needed for the PST route.
