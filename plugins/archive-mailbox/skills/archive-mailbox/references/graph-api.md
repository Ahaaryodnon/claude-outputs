# Graph Mailbox Import/Export APIs — archive mailbox reference

Status (verified August 2026): the classic Outlook mail API
(`/me/messages`, `/me/mailFolders`) **does not support in-place archive
mailboxes** and never will. Archive access arrived with the **Mailbox
Import/Export APIs** (`/admin/exchange/mailboxes/...`), which support
"primary, shared, and archive mailboxes on Exchange Online". Folder/item
listing is on v1.0; archive-mailbox *discovery* is still beta-only.

## Setup (one time, per user/tenant)

1. Register an app in Entra ID (or reuse an existing public client):
   - Platform: *Mobile and desktop applications*, enable
     **Allow public client flows** (device code needs it).
   - Delegated Graph permissions:
     | Scope | Needed for | Admin consent |
     |---|---|---|
     | `User.Read` | sign-in | no |
     | `MailboxFolder.Read` | list folders | no |
     | `MailboxItem.Read` | list/get items | no |
     | `MailboxItem.ImportExport` | export/restore | **yes** |
   - The Microsoft Graph command-line public client id
     (`14d82eec-204b-4c2f-b7e8-296a70dab67e`) can work for read-only use if
     the tenant allows it, but a dedicated registration is cleaner.
2. Export `GRAPH_CLIENT_ID=<app id>` and, for single-tenant apps,
   `GRAPH_TENANT_ID=<tenant id>` (defaults to `organizations`).

## Endpoints

Base: `https://graph.microsoft.com`

| Purpose | Method + path | Version |
|---|---|---|
| Discover mailbox ids | `GET /beta/me/settings/exchange` → `primaryMailboxId`, `inPlaceArchiveMailboxId` | beta |
| List folders | `GET /v1.0/admin/exchange/mailboxes/{mailboxId}/folders` | v1.0 |
| List child folders | filter on `parentFolderId` | v1.0 |
| List items | `GET /v1.0/admin/exchange/mailboxes/{mailboxId}/folders/{folderId}/items` | v1.0 |
| Get item | `GET .../items/{itemId}` | v1.0 |
| Delta (folders/items) | `.../folders/delta`, `.../items/delta` | v1.0 |
| Export items | `POST /v1.0/admin/exchange/mailboxes/{mailboxId}/exportItems` body `{"itemIds": [...]}` | v1.0 |
| Create import session | `POST /v1.0/admin/exchange/mailboxes/{mailboxId}/createImportSession` → `importUrl` | v1.0 |
| Upload item | `POST {importUrl}` body `{"FolderId", "Mode": "create", "Data": <base64 FTS>}` — **no Authorization header** (URL is pre-authed) | n/a |

`{mailboxId}` is the opaque `MBX:...` value, not a UPN.

## mailboxItem shape

Properties: `id`, `changeKey`, `createdDateTime`, `lastModifiedDateTime`,
`size`, `type` (message class, e.g. `IPM.Note`), `categories`. **No subject,
sender, or body.** Get metadata via extended-property expansion:

```
?$expand=singleValueExtendedProperties(
  $filter=id eq 'String 0x0037' or id eq 'String 0x0C1A'
       or id eq 'String 0x5D01' or id eq 'SystemTime 0x0E06')
```

| MAPI property | id | Meaning |
|---|---|---|
| PR_SUBJECT | `String 0x0037` | subject |
| PR_SENDER_NAME | `String 0x0C1A` | sender display name |
| PidTagSenderSmtpAddress | `String 0x5D01` | sender SMTP |
| PR_MESSAGE_DELIVERY_TIME | `SystemTime 0x0E06` | received time |
| PR_HASATTACH | `Boolean 0x0E1B` | has attachments |

Server-side filtering: standard properties (`createdDateTime ge 2019-01-01T00:00:00Z`)
and extended-property filters (`singleValueExtendedProperties/any(ep: ep/id eq
'String 0x0037' and ep/value eq '...')` — equality, not contains). There is no
`$search`; do substring matching client-side.

## Folders

- `mailboxFolder`: `id`, `displayName`, `parentFolderId`, `type`
  (e.g. `IPF.Note`), `totalItemCount`, sizes. Filter mail folders with
  `$filter=type eq 'IPF.Note'`.
- **Well-known names don't work in archive mailboxes** — always navigate by id
  from the folder list.

## Auto-expanding archive redirects

Large archives are split into a main + auxiliary archive mailboxes.

- Folder/item request for content in an auxiliary archive → `HTTP 308` with
  `Location` header pointing at the same path under the correct
  `MBX:` id. Re-issue the request there (re-attach the bearer token).
- `exportItems` → per-item error `ErrorArchiveFolderMovedPermanently` whose
  message contains the URL to re-POST for that item.
- Import into an expanded folder → `HTTP 409` naming the correct target
  mailbox; create a fresh import session against that mailbox and retry.

## Restore pattern (archive → primary inbox)

1. `exportItems` on the archive mailbox with the item id → base64 `data`.
2. Pick/create a destination folder in the primary mailbox (e.g. a
   "Restored from archive" folder via `POST .../folders`).
3. `createImportSession` on the **primary** mailbox.
4. `POST importUrl` with `{"FolderId": ..., "Mode": "create", "Data": ...}`.

This copies — the archived original is left in place. Requires the
admin-consented `MailboxItem.ImportExport` scope.

## Throttling & scale

These endpoints share Exchange resource limits: expect `429` with
`Retry-After` on large enumerations; page with `$top` (≤ 100 typical) and
`@odata.nextLink`. Enumerating a multi-GB archive item-by-item is slow by
design — for tenant-scale search point admins at Purview Content Search
(archives are always in scope there).

## Sources

- Mail API overview — "does not support in-place archive mailboxes":
  https://learn.microsoft.com/graph/api/resources/mail-api-overview
- Import/Export overview — "primary, shared, and archive mailboxes":
  https://learn.microsoft.com/graph/mailbox-import-export-concept-overview
- List folders / list items / export / import session under
  https://learn.microsoft.com/graph/api/resources/mailbox-import-export-api-overview
- Archive redirects: https://learn.microsoft.com/graph/handle-archive-mailbox-redirects
- exchangeSettings (beta, `inPlaceArchiveMailboxId`):
  https://learn.microsoft.com/graph/api/resources/exchangesettings?view=graph-rest-beta
- EWS retirement (Oct 2026):
  https://techcommunity.microsoft.com/blog/exchange/retirement-of-exchange-web-services-in-exchange-online/3924440
