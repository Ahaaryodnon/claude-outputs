#!/usr/bin/env python3
"""Access an Exchange Online archive mailbox via the Microsoft Graph
Mailbox Import/Export APIs. Stdlib only — no pip installs required.

Environment:
  GRAPH_CLIENT_ID   (required) Entra app id of a public client
  GRAPH_TENANT_ID   (optional) tenant id/domain, default "organizations"

Commands:
  login                          device-code sign-in (token cached locally)
  mailboxes                      show primary + in-place archive mailbox ids
  folders   --mailbox MBX:...    list mail folders
  items     --mailbox --folder   list items (subject/sender/date expanded)
  search    --mailbox --folder   filter items by subject/sender/date
  restore   --archive-mailbox --item --primary-mailbox
                                 copy an archived item into the primary mailbox
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

GRAPH = "https://graph.microsoft.com"
CACHE = os.path.expanduser("~/.archive-mailbox/tokens.json")
READ_SCOPES = [
    "https://graph.microsoft.com/User.Read",
    "https://graph.microsoft.com/MailboxFolder.Read",
    "https://graph.microsoft.com/MailboxItem.Read",
    "offline_access",
]
IMPORT_SCOPE = "https://graph.microsoft.com/MailboxItem.ImportExport"

# MAPI extended properties: subject, sender name, sender SMTP, delivery time
EXT_PROPS = {
    "String 0x0037": "subject",
    "String 0x0C1A": "sender",
    "String 0x5D01": "senderSmtp",
    "SystemTime 0x0E06": "received",
}
EXPAND = "singleValueExtendedProperties($filter=" + " or ".join(
    f"id eq '{p}'" for p in EXT_PROPS) + ")"


def die(msg):
    sys.exit(f"error: {msg}")


def client_config():
    cid = os.environ.get("GRAPH_CLIENT_ID")
    if not cid:
        die("set GRAPH_CLIENT_ID (see references/graph-api.md § Setup)")
    return cid, os.environ.get("GRAPH_TENANT_ID", "organizations")


def http(url, method="GET", data=None, headers=None, form=False):
    body = None
    headers = dict(headers or {})
    if data is not None:
        if form:
            body = urllib.parse.urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read()
            return resp.status, dict(resp.headers), json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            payload = json.loads(raw)
        except ValueError:
            payload = {"raw": raw.decode(errors="replace")}
        return e.code, dict(e.headers), payload


def token_request(tenant, form):
    url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
    return http(url, "POST", form, form=True)


def save_tokens(tok):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    fd = os.open(CACHE, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "w") as f:
        json.dump(tok, f)


def login(scopes):
    cid, tenant = client_config()
    status, _, dc = http(
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/devicecode",
        "POST", {"client_id": cid, "scope": " ".join(scopes)}, form=True)
    if status != 200:
        die(f"device code request failed: {dc}")
    print(dc["message"], flush=True)  # "go to https://microsoft.com/devicelogin ..."
    interval = dc.get("interval", 5)
    while True:
        time.sleep(interval)
        status, _, tok = token_request(tenant, {
            "grant_type": "urn:ietf:params:oauth:grant-type:device_code",
            "client_id": cid, "device_code": dc["device_code"]})
        if status == 200:
            tok["expires_at"] = time.time() + tok.get("expires_in", 3600) - 60
            save_tokens(tok)
            print("signed in; token cached at", CACHE)
            return tok
        err = tok.get("error")
        if err == "authorization_pending":
            continue
        if err == "slow_down":
            interval += 5
            continue
        die(f"sign-in failed: {tok.get('error_description', err)}")


def get_token():
    if not os.path.exists(CACHE):
        die("not signed in — run: graph_archive.py login")
    with open(CACHE) as f:
        tok = json.load(f)
    if time.time() < tok.get("expires_at", 0):
        return tok["access_token"]
    cid, tenant = client_config()
    status, _, new = token_request(tenant, {
        "grant_type": "refresh_token", "client_id": cid,
        "refresh_token": tok.get("refresh_token", "")})
    if status != 200:
        die("token refresh failed — run: graph_archive.py login")
    new.setdefault("refresh_token", tok.get("refresh_token"))
    new["expires_at"] = time.time() + new.get("expires_in", 3600) - 60
    save_tokens(new)
    return new["access_token"]


def graph(path, method="GET", data=None, absolute=None):
    """Graph call that follows archive-mailbox 308 redirects (re-auth'd)."""
    url = absolute or (GRAPH + path)
    headers = {"Authorization": f"Bearer {get_token()}"}
    for _ in range(4):
        status, resp_headers, payload = http(url, method, data, headers)
        if status == 308 and resp_headers.get("Location"):
            url = resp_headers["Location"]  # auxiliary archive mailbox
            continue
        if status == 429:
            time.sleep(int(resp_headers.get("Retry-After", "5")))
            continue
        if status >= 400:
            die(f"{method} {url} -> {status}: "
                f"{payload.get('error', payload)}")
        return payload
    die(f"gave up on {url}")


def paged(path):
    url = GRAPH + path
    while url:
        page = graph("", absolute=url)
        yield from page.get("value", [])
        url = page.get("@odata.nextLink")


def flatten(item):
    out = {"id": item.get("id"), "type": item.get("type"),
           "size": item.get("size"),
           "created": item.get("createdDateTime")}
    for ep in item.get("singleValueExtendedProperties") or []:
        key = EXT_PROPS.get(ep.get("id"))
        if key:
            out[key] = ep.get("value")
    return out


def qs(**params):
    return "?" + urllib.parse.urlencode(
        {k: v for k, v in params.items() if v is not None},
        quote_via=urllib.parse.quote)


def cmd_mailboxes(_):
    s = graph("/beta/me/settings/exchange")
    print(json.dumps({
        "primaryMailboxId": s.get("primaryMailboxId"),
        "inPlaceArchiveMailboxId": s.get("inPlaceArchiveMailboxId"),
    }, indent=2))
    if not s.get("inPlaceArchiveMailboxId"):
        print("note: no in-place archive found — it may not be enabled "
              "for this account.", file=sys.stderr)


def cmd_folders(a):
    rows = []
    for f in paged(f"/v1.0/admin/exchange/mailboxes/{a.mailbox}/folders?$top=100"):
        rows.append({"id": f.get("id"), "name": f.get("displayName"),
                     "parentId": f.get("parentFolderId"),
                     "class": f.get("type"),
                     "items": f.get("totalItemCount")})
    print(json.dumps(rows, indent=2))


def cmd_items(a):
    path = (f"/v1.0/admin/exchange/mailboxes/{a.mailbox}/folders/{a.folder}"
            f"/items{qs(**{'$top': min(a.top, 100), '$expand': EXPAND})}")
    count = 0
    for item in paged(path):
        print(json.dumps(flatten(item)))
        count += 1
        if count >= a.top:
            break


def cmd_search(a):
    filters = []
    if a.since:
        filters.append(f"createdDateTime ge {a.since}T00:00:00Z")
    if a.until:
        filters.append(f"createdDateTime le {a.until}T23:59:59Z")
    q = qs(**{"$top": 100, "$expand": EXPAND,
              "$filter": " and ".join(filters) if filters else None})
    path = (f"/v1.0/admin/exchange/mailboxes/{a.mailbox}/folders/{a.folder}"
            f"/items{q}")
    shown = 0
    for item in paged(path):
        row = flatten(item)
        if a.subject and a.subject.lower() not in (row.get("subject") or "").lower():
            continue
        if a.sender and a.sender.lower() not in (
                (row.get("sender") or "") + (row.get("senderSmtp") or "")).lower():
            continue
        print(json.dumps(row))
        shown += 1
        if shown >= a.limit:
            break
    print(f"# {shown} match(es)", file=sys.stderr)


def cmd_restore(a):
    # 1. export from archive (handles ErrorArchiveFolderMovedPermanently)
    resp = graph(f"/v1.0/admin/exchange/mailboxes/{a.archive_mailbox}/exportItems",
                 "POST", {"itemIds": [a.item]})
    results = resp.get("value", [resp])
    blob = None
    for r in results:
        err = (r.get("error") or {})
        if "ArchiveFolderMovedPermanently" in str(err):
            redirect = err.get("message", "").split("'")[1]
            r = graph("", "POST", {"itemIds": [a.item]}, absolute=redirect)
            r = r.get("value", [r])[0]
        blob = r.get("data")
    if not blob:
        die(f"export returned no data: {resp}")

    # 2. destination folder in primary mailbox
    folder_id = a.dest_folder
    if not folder_id:
        for f in paged(f"/v1.0/admin/exchange/mailboxes/{a.primary_mailbox}"
                       "/folders?$top=100"):
            if f.get("displayName") == "Restored from archive":
                folder_id = f["id"]
                break
        if not folder_id:
            root = next(iter(paged(
                f"/v1.0/admin/exchange/mailboxes/{a.primary_mailbox}"
                "/folders?$top=1")), None)
            made = graph(f"/v1.0/admin/exchange/mailboxes/{a.primary_mailbox}"
                         "/folders", "POST",
                         {"displayName": "Restored from archive",
                          "parentFolderId": root.get("parentFolderId")
                          if root else None})
            folder_id = made["id"]

    # 3-4. import session + upload (importUrl is pre-authenticated: no bearer)
    session = graph(f"/v1.0/admin/exchange/mailboxes/{a.primary_mailbox}"
                    "/createImportSession", "POST", {})
    status, _, result = http(session["importUrl"], "POST", {
        "FolderId": folder_id, "Mode": "create", "Data": blob})
    if status >= 400:
        die(f"import failed ({status}): {result}")
    print(json.dumps({"restored": True, "folderId": folder_id,
                      "result": result}, indent=2))


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    lg = sub.add_parser("login")
    lg.add_argument("--with-import", action="store_true",
                    help="also request MailboxItem.ImportExport (admin consent)")
    sub.add_parser("mailboxes")
    fo = sub.add_parser("folders")
    fo.add_argument("--mailbox", required=True)
    it = sub.add_parser("items")
    it.add_argument("--mailbox", required=True)
    it.add_argument("--folder", required=True)
    it.add_argument("--top", type=int, default=50)
    se = sub.add_parser("search")
    se.add_argument("--mailbox", required=True)
    se.add_argument("--folder", required=True)
    se.add_argument("--subject")
    se.add_argument("--sender")
    se.add_argument("--since", help="YYYY-MM-DD")
    se.add_argument("--until", help="YYYY-MM-DD")
    se.add_argument("--limit", type=int, default=50)
    re_ = sub.add_parser("restore")
    re_.add_argument("--archive-mailbox", required=True)
    re_.add_argument("--item", required=True)
    re_.add_argument("--primary-mailbox", required=True)
    re_.add_argument("--dest-folder", help="target folderId (default: "
                     "'Restored from archive', created if missing)")

    a = p.parse_args()
    if a.cmd == "login":
        scopes = READ_SCOPES + ([IMPORT_SCOPE] if a.with_import else [])
        login(scopes)
    elif a.cmd == "mailboxes":
        cmd_mailboxes(a)
    elif a.cmd == "folders":
        cmd_folders(a)
    elif a.cmd == "items":
        cmd_items(a)
    elif a.cmd == "search":
        cmd_search(a)
    elif a.cmd == "restore":
        cmd_restore(a)


if __name__ == "__main__":
    main()
