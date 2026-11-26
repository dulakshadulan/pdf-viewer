import type { Book } from '@/db';
import { getBook, updateProgress, updateTotalPages } from '@/db';
import {
  DEFAULT_READING_MODE,
  getReadingMode,
  setReadingMode as saveReadingMode,
  type ReadingMode,
} from '@/lib/settings';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';

const PROGRESS_SAVE_DELAY_MS = 500;

export interface UseReaderResult {
  book: Book | null;
  loading: boolean;
  notFound: boolean;
  currentPage: number;
  totalPages: number;
  readingMode: ReadingMode;
  handlePageChanged: (page: number) => void;
  handleLoadComplete: (total: number) => void;
  toggleReadingMode: () => void;
}

export function useReader(id: string): UseReaderResult {
  const db = useSQLiteContext();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [readingMode, setReadingModeState] = useState<ReadingMode>(DEFAULT_READING_MODE);
  const bookRef = useRef<Book | null>(null);
  const pendingPageRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushPendingPage = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const page = pendingPageRef.current;
    const currentBook = bookRef.current;
    pendingPageRef.current = null;

    if (page === null || !currentBook) {
      return;
    }

    try {
      await updateProgress(db, currentBook.id, page);
    } catch (error) {
      console.error('[reader] failed to save progress', error);
    }
  }, [db]);

  const handlePageChanged = useCallback(
    (page: number) => {
      if (!bookRef.current) {
        return;
      }

      setCurrentPage(page);
      pendingPageRef.current = page;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        void flushPendingPage();
      }, PROGRESS_SAVE_DELAY_MS);
    },
    [flushPendingPage]
  );

  const handleLoadComplete = useCallback(
    (total: number) => {
      const currentBook = bookRef.current;

      if (!currentBook || currentBook.totalPages === total) {
        return;
      }

      void (async () => {
        try {
          await updateTotalPages(db, currentBook.id, total);

          if (bookRef.current?.id !== currentBook.id) {
            return;
          }

          bookRef.current = { ...currentBook, totalPages: total };
          setBook((previous) => (previous ? { ...previous, totalPages: total } : previous));
        } catch (error) {
          console.error('[reader] failed to save total pages', error);
        }
      })();
    },
    [db]
  );

  const toggleReadingMode = useCallback(() => {
    const nextMode: ReadingMode = readingMode === 'scroll' ? 'paged' : 'scroll';

    setReadingModeState(nextMode);
    void saveReadingMode(nextMode).catch((saveError) => {
      console.error('[reader] failed to save reading mode', saveError);
    });
  }, [readingMode]);

  useEffect(() => {
    let active = true;

    async function loadBook() {
      setLoading(true);
      bookRef.current = null;
      setBook(null);
      setCurrentPage(1);
      setReadingModeState(DEFAULT_READING_MODE);

      try {
        const [loadedBook, loadedReadingMode] = await Promise.all([
          getBook(db, id),
          getReadingMode().catch((settingsError) => {
            console.error('[reader] failed to load reading mode', settingsError);
            return DEFAULT_READING_MODE;
          }),
        ]);

        if (active) {
          bookRef.current = loadedBook;
          setBook(loadedBook);
          setCurrentPage(loadedBook?.lastPage ?? 1);
          setReadingModeState(loadedReadingMode);
        }
      } catch (loadError) {
        console.error('[reader] failed to load book', loadError);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBook();

    return () => {
      active = false;
      void flushPendingPage();
    };
  }, [db, id, flushPendingPage]);

  return {
    book,
    loading,
    notFound: !loading && book === null,
    currentPage,
    totalPages: book?.totalPages ?? 0,
    readingMode,
    handlePageChanged,
    handleLoadComplete,
    toggleReadingMode,
  };
}
