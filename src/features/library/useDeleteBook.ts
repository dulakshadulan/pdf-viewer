import type { Book } from '@/db';
import { deleteBook } from '@/db';
import { deleteCover } from '@/lib/covers';
import { errorMessage } from '@/lib/errors';
import { deleteBookFile } from '@/lib/files';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

type RefreshBooks = () => Promise<void> | void;

export interface UseDeleteBookResult {
  confirmDelete: (book: Book) => void;
  deletingId: string | null;
  error: string | null;
}

export function useDeleteBook(refresh: RefreshBooks): UseDeleteBookResult {
  const db = useSQLiteContext();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (book: Book) => {
      setDeletingId(book.id);
      setError(null);

      try {
        try {
          deleteBookFile(book.fileUri);
        } catch (fileError) {
          console.warn('[library] failed to delete book file', fileError);
        }

        if (book.coverUri) {
          deleteCover(book.coverUri);
        }

        await deleteBook(db, book.id);
        await refresh();
      } catch (deleteError) {
        console.error('[library] failed to delete book', deleteError);
        setError(errorMessage(deleteError));
      } finally {
        setDeletingId(null);
      }
    },
    [db, refresh]
  );

  const confirmDelete = useCallback(
    (book: Book) => {
      Alert.alert(
        'Delete book?',
        `Remove "${book.title}" from your library? The PDF file will also be deleted.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              void remove(book);
            },
          },
        ]
      );
    },
    [remove]
  );

  return { confirmDelete, deletingId, error };
}
