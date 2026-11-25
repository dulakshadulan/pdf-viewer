import type { SQLiteDatabase } from 'expo-sqlite';

import { BOOKS_SCHEMA_SQL, DATABASE_VERSION } from './schema';

export const DATABASE_NAME = 'pdf-reader.db';

export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      ${BOOKS_SCHEMA_SQL}
    `);
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
