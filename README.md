# Fund2Build clickable HTML mock (v2)

Static spec demo of the redesigned experience (**D74–D78**). Not a production app: **no payments**, **no auth**, **no Cursor SDK**.

## Open locally

From this folder:

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080/

`index.html` is Home (Sort = Hot).

## What this is

- One feed with Sort (Hot · New · Top) and a Following switch when signed in (`?signedin=1`).
- One project page per sample, sections by stage.
- Back sheet (dialog, focus trap, Escape).
- Editor: six questions, live checklist, Publish disabled until 9/9.
- Owner strip on `?owner=1`.
- You › Backed with held / spent / refunded lines.
- Hosted samples, type filter, S-ids, D-numbers: **`?spec=1` only** (D75).

Copy per state: `../mock-fixtures.md`. Words: `../vocabulary.md`. Layout: `../wireframes.md`.

## R1

Unmoderated 6-minute task kit: `../research/r1-comprehension-test.md`. In-mock start: `r1.html`.

A/B first click at Prototype: `?primary=try` or `?primary=back`. Safety-chip trust variant: `?chip=safety&spec=1`.

## Query flags

| Flag | Effect |
| --- | --- |
| `spec=1` | Fixture map, hosted cards, type filter, kickers |
| `owner=1` | Owner strip on project pages |
| `signedin=1` | Avatar menu + Following |
| `primary=try\|back` | Which Prototype button is visually primary |
| `draft=empty\|partial\|complete\|listed` | Editor fixtures |
| `strip=…` | Owner-strip variant (with `owner=1`) |

Relative links assume you start from this directory.
