# PDF Reader — Implementation Plan

A simple, free, ad-free, offline PDF reader. Users keep a private library of
PDFs on their device; files never leave the device. There is no 3D interface,
no cloud sync, no accounts, and no analytics.

## Scope

- Local library of PDFs.
- "Open with" support for PDFs opened from other apps.
- Reader with resume at the last page, page jump, zoom, and scroll or paged mode.
- Page colors: white, sepia, night.
- Keep-screen-on setting.
- Privacy-first: no tracking, no ads, no accounts, no cloud.

## Stack

- React Native + Expo (TypeScript, strict)
- Expo Router, routes in `src/app/`
- Local SQLite is the only source of truth for the UI (offline-first)
- `react-native-pdf` with `react-native-blob-util` for rendering
- EAS development builds (development client), not Expo Go

## Folder layout

```
src/
  app/                      # Expo Router routes only
  db/
    types.ts                # Book, BookRow, NewBook + row mapping
    schema.ts               # SQL statements + schema version
    database.ts             # DB name + PRAGMA user_version migrations
    booksRepository.ts      # async typed CRUD (db passed as first arg)
    index.ts                # barrel export
  features/
    library/                # hooks + presentational components
    upload/
    reader/
  lib/                      # files, format, and other helpers
```

Keep non-route code outside `src/app/` and keep business logic out of screen
components.

## Schema

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  file_uri TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  cover_uri TEXT,
  total_pages INTEGER NOT NULL DEFAULT 0,
  last_page INTEGER NOT NULL DEFAULT 1,
  added_at INTEGER NOT NULL,
  remote_path TEXT,
  synced INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX books_added_at_idx ON books (added_at DESC);
```

`synced` is stored as `0 | 1` and mapped to/from `boolean` in exactly one place
(`src/db/types.ts`). `remote_path` and `synced` are legacy columns from the old
cloud-sync scope; they are unused and can be dropped in a future migration.

## Migrations

Migrations run through `PRAGMA user_version` inside `SQLiteProvider`'s
`onInit` handler. Version 0 creates the table and index. Future schema changes
add another `if (currentVersion === N)` block and bump `DATABASE_VERSION`.

## Repository API

All functions are async, fully typed, and take `db: SQLiteDatabase` as the
first argument.

- `listBooks(db): Promise<Book[]>` — newest `added_at` first
- `getBook(db, id): Promise<Book | null>`
- `addBook(db, input: NewBook): Promise<Book>` — id from `expo-crypto`
- `updateProgress(db, id, page): Promise<boolean>`
- `updateTotalPages(db, id, total): Promise<boolean>`
- `deleteBook(db, id): Promise<boolean>`

## Build order

1. Router scaffold (done)
2. DB layer: packages, schema, migrations, repository, provider, dev smoke test (done)
3. Upload: document picker, private file copy, insert book (done)
4. Library screen: list books from SQLite (done)
5. Reader: resume at `last_page`, save progress, fill `total_pages` on first open (done)
6. "Open with" support: register PDF handling and import into the library
7. Reader enhancements: page jump, zoom, scroll or paged mode
8. Page colors: white, sepia, night
9. Keep-screen-on setting
10. Verify: typecheck, lint, device testing

## Native dependencies

Installed in one batch so a single EAS development rebuild covers everything:

- `expo-sqlite`
- `expo-crypto`
- `expo-file-system`
- `expo-document-picker`
- `react-native-pdf`
- `react-native-blob-util`
- `@config-plugins/react-native-pdf`
- `@config-plugins/react-native-blob-util`

## Rules

- On-device only; no upload, sync, sharing, accounts, analytics, or ads.
- No 3D.
- Keep reading/book management in `src/features`.
- Small commits, one feature per task.
- Do not add libraries without agreement.
