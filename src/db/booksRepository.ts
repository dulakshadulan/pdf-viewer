import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';

import { bookFromRow, syncedToDb, type Book, type BookRow, type NewBook } from './types';

export async function listBooks(db: SQLiteDatabase): Promise<Book[]> {
  const rows = await db.getAllAsync<BookRow>('SELECT * FROM books ORDER BY added_at DESC');
  return rows.map(bookFromRow);
}

export async function getBook(db: SQLiteDatabase, id: string): Promise<Book | null> {
  const row = await db.getFirstAsync<BookRow>('SELECT * FROM books WHERE id = ?', id);
  return row ? bookFromRow(row) : null;
}

export async function addBook(db: SQLiteDatabase, input: NewBook): Promise<Book> {
  const book: Book = {
    id: Crypto.randomUUID(),
    title: input.title,
    author: input.author ?? '',
    fileUri: input.fileUri,
    fileType: input.fileType ?? 'pdf',
    coverUri: input.coverUri ?? null,
    totalPages: input.totalPages ?? 0,
    lastPage: 1,
    addedAt: Date.now(),
    remotePath: null,
    synced: false,
  };

  await db.runAsync(
    `INSERT INTO books (
      id, title, author, file_uri, file_type, cover_uri,
      total_pages, last_page, added_at, remote_path, synced
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    book.id,
    book.title,
    book.author,
    book.fileUri,
    book.fileType,
    book.coverUri,
    book.totalPages,
    book.lastPage,
    book.addedAt,
    book.remotePath,
    syncedToDb(book.synced)
  );

  return book;
}

export async function updateProgress(
  db: SQLiteDatabase,
  id: string,
  page: number
): Promise<boolean> {
  const result = await db.runAsync('UPDATE books SET last_page = ? WHERE id = ?', page, id);
  return result.changes > 0;
}

export async function updateTotalPages(
  db: SQLiteDatabase,
  id: string,
  total: number
): Promise<boolean> {
  const result = await db.runAsync('UPDATE books SET total_pages = ? WHERE id = ?', total, id);
  return result.changes > 0;
}

export async function updateCover(
  db: SQLiteDatabase,
  id: string,
  coverUri: string | null
): Promise<boolean> {
  const result = await db.runAsync('UPDATE books SET cover_uri = ? WHERE id = ?', coverUri, id);
  return result.changes > 0;
}

export async function deleteBook(db: SQLiteDatabase, id: string): Promise<boolean> {
  const result = await db.runAsync('DELETE FROM books WHERE id = ?', id);
  return result.changes > 0;
}
