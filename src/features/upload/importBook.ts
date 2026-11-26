import type { Book } from '@/db';
import { addBook, updateCover } from '@/db';
import { generateCover } from '@/lib/covers';
import { errorMessage, StageError } from '@/lib/errors';
import { copyIntoBooksDir, deleteBookFile } from '@/lib/files';
import type { SQLiteDatabase } from 'expo-sqlite';

export interface PickedFile {
  uri: string;
  name: string;
  mimeType?: string;
}

export interface ImportBookInput {
  pickedFile: PickedFile;
  title: string;
  author: string;
}

export async function importBook(db: SQLiteDatabase, input: ImportBookInput): Promise<Book> {
  const title = input.title.trim();

  if (!title) {
    throw new Error('A title is required.');
  }

  const storedUri = await copyIntoBooksDir(input.pickedFile.uri);

  try {
    const book = await addBook(db, {
      title,
      author: input.author.trim(),
      fileUri: storedUri,
      fileType: 'pdf',
    });

    if (__DEV__) {
      console.log('[upload] insertDb ok', book.id);
    }

    void (async () => {
      try {
        const coverUri = await generateCover(book.id, book.fileUri);
        await updateCover(db, book.id, coverUri);
      } catch (coverError) {
        console.warn('[upload] cover generation failed', coverError);
      }
    })();

    return book;
  } catch (error) {
    deleteBookFile(storedUri);
    throw new StageError('insertDb', errorMessage(error), error);
  }
}
