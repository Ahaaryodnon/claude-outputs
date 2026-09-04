# PST route — offline archive access

Use when the Graph route is blocked (no app registration, consent denied) or
the user already has a `.pst` export. Everything is local; never send PST
content to external services.

## Getting a PST of the archive (user does this in Outlook for Windows)

1. Outlook → **File → Open & Export → Import/Export**.
2. **Export to a file** → **Outlook Data File (.pst)**.
3. Select the archive store — it appears as **"Online Archive – user@…"**
   (select the top of it, tick *Include subfolders*).
4. Choose a path with enough disk (archives are often tens of GB) and no
   password (libpff cannot open password-protected PSTs; Outlook's PST
   "password" is trivially weak anyway and not worth the friction).

Notes:
- New Outlook (Monarch) and Outlook for Mac cannot export PSTs; classic
  Outlook for Windows is required. Mac's `.olm` is a different format.
- An admin can alternatively produce a PST via Purview Content Search /
  eDiscovery export — same downstream workflow.
- The export is a snapshot; re-export to refresh.

## Tooling

Preferred: `scripts/pst_tools.py` with **libpff**:

```bash
pip install libpff-python        # module name: pypff
```

If pip is unavailable, `readpst` (package `pst-utils`, apt/brew) converts the
whole PST to mbox/EML for grepping:

```bash
readpst -e -o outdir archive.pst   # one .eml per message, folder tree preserved
```

## pst_tools.py commands

```bash
python3 pst_tools.py tree archive.pst
    # folder hierarchy with message counts

python3 pst_tools.py search archive.pst \
    --subject "invoice" --sender "acme" --since 2019-01-01 --until 2020-12-31 \
    --folder "Top of Outlook data file/Inbox" --limit 100
    # case-insensitive substring match on subject/sender; date range on
    # delivery time; --folder restricts the walk (prefix match); prints
    # folder path + index + date + sender + subject

python3 pst_tools.py show archive.pst --folder "<path>" --index N
    # headers + plain-text body preview

python3 pst_tools.py export archive.pst --folder "<path>" --index N --out msg.eml
    # reconstructs an .eml (original transport headers when present,
    # body + attachments re-attached)
```

Message identity is (folder path, index) within this PST file — stable for a
given file, meaningless across re-exports.

## Caveats

- Large PSTs: `tree` and `search` stream folder-by-folder, but a full-archive
  substring search over 50 GB still takes minutes — narrow with `--folder`
  and dates first.
- Some item classes (stubs left by third-party archivers, S/MIME, corrupted
  items) may fail to decode; the scripts skip and report them rather than
  aborting.
- Attachments: `export` re-attaches regular file attachments; embedded
  messages are exported as `.msg`-like attachments best-effort.
- OST files are not PSTs; libpff cannot read them reliably — and note the
  archive mailbox is never cached locally by Outlook, so there is no OST
  shortcut anyway.
