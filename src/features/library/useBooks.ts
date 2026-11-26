import type { Book } from '@/db';
import { listBooks, updateCover } from '@/db';
import { deleteCover, generateCover } from '@/lib/covers';
import { errorMessage } from '@/lib/errors';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';

const LOAD_ERROR_MESSAGE = 'Could not load your library.';

export interface UseBooksResult {
  books: Book[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useBooks(): UseBooksResult {
  const db = useSQLiteContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const latestRequest = useRef(0);
  const failedCoverIds = useRef(new Set<string>());
  const coverRunId = useRef(0);

  const generateMissingCovers = useCallback(
    async (candidates: Book[], runId: number) => {
      for (const book of candidates) {
        if (coverRunId.current !== runId) {
          return;
        }

        if (failedCoverIds.current.has(book.id)) {
          continue;
        }

        try {
          const coverUri = await generateCover(book.id, book.fileUri);
          const updated = await updateCover(db, book.id, coverUri);

          if (!updated) {
            deleteCover(coverUri);
            continue;
          }

          if (coverRunId.current !== runId) {
            return;
          }

          setBooks((previous) =>
            previous.map((item) => (item.id === book.id ? { ...item, coverUri } : item))
          );
        } catch (coverError) {
          failedCoverIds.current.add(book.id);
          console.warn('[library] cover generation failed', coverError);
        }
      }
    },
    [db]
  );

  const refresh = useCallback(async () => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const loadedBooks = await listBooks(db);

      if (latestRequest.current === requestId) {
        setBooks(loadedBooks);

        const missingCovers = loadedBooks.filter(
          (book) => !book.coverUri && !failedCoverIds.current.has(book.id)
        );
        const runId = coverRunId.current + 1;
        coverRunId.current = runId;
        void generateMissingCovers(missingCovers, runId);
      }
    } catch (loadError) {
      console.error('[library] failed to load books', loadError);

      if (latestRequest.current === requestId) {
        setError(__DEV__ ? errorMessage(loadError) : LOAD_ERROR_MESSAGE);
      }
    } finally {
      if (latestRequest.current === requestId) {
        setLoading(false);
      }
    }
  }, [db, generateMissingCovers]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh])
  );

  return { books, loading, error, refresh };
}
