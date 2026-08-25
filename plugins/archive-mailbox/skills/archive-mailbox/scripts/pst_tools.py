#!/usr/bin/env python3
"""Browse, search, and export messages from a local .pst export of an
archive mailbox. Requires libpff:  pip install libpff-python

Commands:
  tree   FILE                          folder hierarchy with message counts
  search FILE [--subject S] [--sender S] [--since YYYY-MM-DD]
              [--until YYYY-MM-DD] [--folder PATHPREFIX] [--limit N]
  show   FILE --folder PATH --index N  headers + body preview
  export FILE --folder PATH --index N --out msg.eml
"""
import argparse
import datetime
import json
import sys

try:
    import pypff
except ImportError:
    sys.exit("error: libpff not installed — run: pip install libpff-python\n"
             "(alternative: apt/brew install pst-utils, then use readpst)")


def open_pst(path):
    f = pypff.file()
    try:
        f.open(path)
    except Exception as e:
        sys.exit(f"error: cannot open {path}: {e}")
    return f


def walk(folder, path=""):
    name = folder.name or "(unnamed)"
    here = f"{path}/{name}" if path else name
    yield here, folder
    for i in range(folder.number_of_sub_folders):
        try:
            sub = folder.get_sub_folder(i)
        except Exception:
            continue
        yield from walk(sub, here)


def msg_meta(msg):
    try:
        delivered = msg.delivery_time
    except Exception:
        delivered = None
    return {
        "subject": (msg.subject or "").strip(),
        "sender": (msg.sender_name or "").strip(),
        "date": delivered.isoformat() if delivered else None,
    }


def parse_date(s):
    return datetime.datetime.strptime(s, "%Y-%m-%d") if s else None


def cmd_tree(a):
    f = open_pst(a.file)
    for path, folder in walk(f.get_root_folder()):
        n = folder.number_of_sub_messages
        if n or folder.number_of_sub_folders:
            print(f"{n:>6}  {path}")


def cmd_search(a):
    f = open_pst(a.file)
    since, until = parse_date(a.since), parse_date(a.until)
    if until:
        until += datetime.timedelta(days=1)
    shown = skipped = 0
    for path, folder in walk(f.get_root_folder()):
        if a.folder and not path.lower().startswith(a.folder.lower()):
            continue
        for i in range(folder.number_of_sub_messages):
            try:
                m = msg_meta(folder.get_sub_message(i))
            except Exception:
                skipped += 1
                continue
            if a.subject and a.subject.lower() not in m["subject"].lower():
                continue
            if a.sender and a.sender.lower() not in m["sender"].lower():
                continue
            if since or until:
                if not m["date"]:
                    continue
                d = datetime.datetime.fromisoformat(m["date"]).replace(tzinfo=None)
                if (since and d < since) or (until and d >= until):
                    continue
            print(json.dumps({"folder": path, "index": i, **m}))
            shown += 1
            if shown >= a.limit:
                print(f"# limit {a.limit} reached", file=sys.stderr)
                return
    print(f"# {shown} match(es), {skipped} undecodable item(s) skipped",
          file=sys.stderr)


def find_message(a):
    f = open_pst(a.file)
    for path, folder in walk(f.get_root_folder()):
        if path.lower() == a.folder.lower():
            if a.index >= folder.number_of_sub_messages:
                sys.exit(f"error: folder has only "
                         f"{folder.number_of_sub_messages} messages")
            return folder.get_sub_message(a.index)
    sys.exit(f"error: folder not found: {a.folder} (use the 'tree' command)")


def cmd_show(a):
    msg = find_message(a)
    print(msg.transport_headers or
          "\n".join(f"{k}: {v}" for k, v in msg_meta(msg).items() if v))
    body = msg.plain_text_body or msg.html_body or b""
    if isinstance(body, bytes):
        body = body.decode("utf-8", errors="replace")
    print()
    print(body[:a.chars])
    if len(body) > a.chars:
        print(f"\n[... truncated at {a.chars} chars of {len(body)}]")
    n = msg.number_of_attachments
    if n:
        print(f"\n[{n} attachment(s) — use 'export' to extract]")


def cmd_export(a):
    from email.message import EmailMessage
    from email import message_from_string, policy

    msg = find_message(a)
    plain = msg.plain_text_body
    html = msg.html_body
    if isinstance(plain, bytes):
        plain = plain.decode("utf-8", errors="replace")
    if isinstance(html, bytes):
        html = html.decode("utf-8", errors="replace")

    eml = EmailMessage(policy=policy.default)
    if msg.transport_headers:
        hdrs = message_from_string(msg.transport_headers, policy=policy.default)
        skip = {"content-type", "content-transfer-encoding", "mime-version"}
        for k, v in hdrs.items():
            if k.lower() not in skip and k not in eml:
                try:
                    eml[k] = v
                except Exception:
                    pass
    else:
        meta = msg_meta(msg)
        if meta["subject"]:
            eml["Subject"] = meta["subject"]
        if meta["sender"]:
            eml["From"] = meta["sender"]
        if meta["date"]:
            eml["Date"] = meta["date"]

    eml.set_content(plain or "")
    if html:
        eml.add_alternative(html, subtype="html")

    for i in range(msg.number_of_attachments):
        try:
            att = msg.get_attachment(i)
            data = att.read_buffer(att.size) if att.size else b""
            name = getattr(att, "name", None) or f"attachment-{i}"
            eml.add_attachment(data, maintype="application",
                               subtype="octet-stream", filename=name)
        except Exception as e:
            print(f"warning: attachment {i} skipped: {e}", file=sys.stderr)

    with open(a.out, "wb") as fh:
        fh.write(eml.as_bytes())
    print(f"wrote {a.out}")


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    t = sub.add_parser("tree")
    t.add_argument("file")

    s = sub.add_parser("search")
    s.add_argument("file")
    s.add_argument("--subject")
    s.add_argument("--sender")
    s.add_argument("--since", help="YYYY-MM-DD")
    s.add_argument("--until", help="YYYY-MM-DD")
    s.add_argument("--folder", help="restrict to folder path prefix")
    s.add_argument("--limit", type=int, default=100)

    for name in ("show", "export"):
        c = sub.add_parser(name)
        c.add_argument("file")
        c.add_argument("--folder", required=True)
        c.add_argument("--index", type=int, required=True)
        if name == "show":
            c.add_argument("--chars", type=int, default=4000)
        else:
            c.add_argument("--out", required=True)

    a = p.parse_args()
    {"tree": cmd_tree, "search": cmd_search,
     "show": cmd_show, "export": cmd_export}[a.cmd](a)


if __name__ == "__main__":
    main()
