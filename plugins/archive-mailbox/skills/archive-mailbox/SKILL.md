---
name: archive-mailbox
description: >-
  Work with the user's Exchange Online archive mailbox (In-Place Archive /
  Online Archive). Use whenever the user mentions their archive mailbox,
  online archive, in-place archive, archived email, "email older than X that
  got archived", restoring an archived message, or searching a PST export of
  their mailbox. Two routes: Microsoft Graph Mailbox Import/Export APIs
  (preferred, live access) or a local PST file (offline fallback). Do NOT use
  for the Outlook "Archive" one-click folder — that is part of the primary
  mailbox and is reachable with normal mail tools.
---

# Archive Mailbox

Help the user browse, search, and recover email from their Exchange Online
**archive mailbox** (a.k.a. In-Place Archive / Online Archive). This mailbox is
**separate from the primary mailbox** and is NOT reachable through the normal
Graph mail endpoints (`/me/messages`, `/me/mailFolders`) — those explicitly do
not support in-place archives. Any Outlook/Mail connector tools the session has
will therefore never see archive content. Use the routes below instead.

## Terminology check (do this first)

Ask or infer which "archive" the user means:

- **Outlook one-click "Archive" folder** — an ordinary folder in the primary
  mailbox (well-known name `archive`). Normal mail tools / `/me/mailFolders/archive`
  handle this. This skill is not needed.
- **In-Place / Online Archive** — the separate "Archive – user@…" mailbox shown
  as a second store in Outlook. That is what this skill is for.

## Route selection

1. **Graph route (preferred — live data).** Works when the user can sign in to
   Microsoft 365 and an app registration (or the Microsoft Graph command-line
   public client) is available. Uses the Mailbox Import/Export APIs under
   `https://graph.microsoft.com/{v1.0|beta}/admin/exchange/mailboxes/{mailboxId}`.
   Despite the `/admin/` path these work with *delegated* permissions
   (`MailboxFolder.Read`, `MailboxItem.Read`) on the user's own mailbox.
2. **PST route (offline fallback).** Works when the user has (or can create via
   Outlook's Export wizard) a `.pst` export of the archive, or when tenant
   policy blocks the Graph permissions. Everything runs locally; nothing leaves
   the machine.

If the user has a PST already on disk, the PST route is usually faster and
gives full message bodies. If they need *current* archive content or want to
restore an item back into their inbox, use the Graph route.

## Graph route

Read `references/graph-api.md` for full endpoint/permission detail before
composing requests. Use `scripts/graph_archive.py` (stdlib-only Python) rather
than hand-rolling auth:

```bash
# One-time: sign in (device-code flow; prints a code for the user to enter)
python3 scripts/graph_archive.py login

# Discover mailbox ids (primary + inPlaceArchiveMailboxId)
python3 scripts/graph_archive.py mailboxes

# Browse the archive
python3 scripts/graph_archive.py folders --mailbox "MBX:...archive-id..."
python3 scripts/graph_archive.py items --mailbox "MBX:..." --folder "<folderId>" --top 50

# Search (server-side date filter + client-side subject/sender match)
python3 scripts/graph_archive.py search --mailbox "MBX:..." --folder "<folderId>" \
  --subject "invoice" --since 2019-01-01 --until 2020-12-31

# Recover: copy an archived item back into the primary mailbox
python3 scripts/graph_archive.py restore --archive-mailbox "MBX:..." \
  --item "<itemId>" --primary-mailbox "MBX:..."
```

The script needs `GRAPH_CLIENT_ID` (and optionally `GRAPH_TENANT_ID`) set — see
`references/graph-api.md` § Setup for how the user registers a public-client
app, and which scopes need admin consent. Tokens cache in
`~/.archive-mailbox/tokens.json`.

### Hard limitations of the Graph route — be upfront about these

- **No message bodies via list/get.** `mailboxItem` exposes only id, dates,
  size, and item class. Subject / sender / received date come via MAPI
  single-value extended properties (the script expands them for you). To read
  a full body the item must be **restored to the primary mailbox** (then read
  with normal mail tools) — or use the PST route.
- **Export is an opaque stream.** `exportItems` returns a base64 FastTransfer
  (FTS) stream, only useful for re-importing into Exchange — it is not an
  `.eml` you can open.
- **No server-side full-text search.** `$filter`/`$orderby` work on the few
  exposed properties and extended properties; there is no `$search`. For "find
  the email where I said X in 2018", offer to enumerate + filter client-side
  (fine for a folder, slow for a 50 GB archive) or suggest the PST route /
  Purview Content Search via an admin.
- **Auto-expanding archives redirect.** Folders that physically live in an
  auxiliary archive return `HTTP 308` (or `ErrorArchiveFolderMovedPermanently`
  during export) with the correct mailbox in the Location/error — the script
  follows these automatically. Well-known folder names don't work in archives;
  always use folder ids.
- **`MailboxItem.ImportExport` (needed only for `restore`) requires admin
  consent**; plain read scopes do not. Discovery of the archive id
  (`inPlaceArchiveMailboxId`) is on the **beta** endpoint.
- **EWS is not an option** — it is retired for new use and shuts down October
  2026; do not suggest EWS-based tooling.

## PST route

Read `references/pst-workflow.md` first (includes the exact Outlook export
steps to give the user). Then use `scripts/pst_tools.py`:

```bash
# Requires: pip install libpff-python   (or apt/brew install pst-utils for readpst)
python3 scripts/pst_tools.py tree archive.pst
python3 scripts/pst_tools.py search archive.pst --subject "invoice" --since 2019-01-01
python3 scripts/pst_tools.py show archive.pst --folder "Top of Outlook data file/Inbox" --index 42
python3 scripts/pst_tools.py export archive.pst --folder ".../Inbox" --index 42 --out msg.eml
```

PST route caveats: the PST is a point-in-time snapshot; Outlook's export can
take hours for large archives; `libpff` occasionally can't decode rare item
classes (report, skip, continue). Never upload the PST or its content to any
external service — parse locally only.

## Conduct

- This is the user's own mail. Do not summarise, quote, or move messages
  beyond what they asked for, and confirm before `restore` (it writes into
  their primary mailbox) — it creates a copy; the archive original is untouched.
- If tenant policy blocks consent for the Graph scopes, say so plainly and
  fall back to the PST route rather than suggesting workarounds.
