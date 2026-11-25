import { Directory, File, Paths } from 'expo-file-system';
import * as FileSystemLegacy from 'expo-file-system/legacy';

import { errorMessage, StageError } from './errors';

const BOOKS_DIRECTORY_NAME = 'books';

function getBooksDirectory(): Directory {
  try {
    const directory = new Directory(Paths.document, BOOKS_DIRECTORY_NAME);

    if (!directory.exists) {
      directory.create({ idempotent: true, intermediates: true });
    }

    if (!directory.exists) {
      throw new Error(`The directory was not created at ${directory.uri}`);
    }

    if (__DEV__) {
      console.log('[upload] ensureBooksDir ok', directory.uri);
    }

    return directory;
  } catch (error) {
    throw new StageError('ensureBooksDir', errorMessage(error), error);
  }
}

function extensionFromUri(uri: string): string {
  const path = uri.split('?')[0];
  const filename = path.split('/').pop() ?? '';
  const dotIndex = filename.lastIndexOf('.');

  if (dotIndex < 0) {
    return '.pdf';
  }

  const extension = filename.slice(dotIndex).toLowerCase();
  return /^\.[a-z0-9]+$/.test(extension) ? extension : '.pdf';
}

async function copyWithStreams(source: File, destination: File): Promise<void> {
  if (destination.exists) {
    destination.delete();
  }

  destination.create({ intermediates: true });
  await source.readableStream().pipeTo(destination.writableStream());
}

function deleteFileIfPresent(file: File): void {
  try {
    if (file.exists) {
      file.delete();
    }
  } catch {}
}

export async function copyIntoBooksDir(sourceUri: string): Promise<string> {
  try {
    const booksDirectory = getBooksDirectory();
    const source = new File(sourceUri);

    if (sourceUri.startsWith('file://') && !source.exists) {
      throw new Error(`The picked file is no longer available at ${sourceUri}`);
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extensionFromUri(sourceUri)}`;
    const destination = new File(booksDirectory, filename);

    if (__DEV__) {
      let sourceSize: number | null = null;

      try {
        sourceSize = source.size;
      } catch {
        sourceSize = null;
      }

      console.log('[upload] copyFile starting', {
        sourceUri,
        sourceExists: source.exists,
        sourceSize,
        destinationUri: destination.uri,
      });
    }

    try {
      if (sourceUri.startsWith('content://')) {
        await FileSystemLegacy.copyAsync({ from: sourceUri, to: destination.uri });
      } else {
        await source.copy(destination);
      }

      if (__DEV__) {
        console.log('[upload] copyFile ok', destination.uri);
      }
    } catch (copyError) {
      if (__DEV__) {
        console.warn('[upload] copyFile failed, retrying', errorMessage(copyError));
      }

      try {
        deleteFileIfPresent(destination);

        if (sourceUri.startsWith('content://')) {
          await source.copy(destination);
        } else {
          await copyWithStreams(source, destination);
        }

        if (__DEV__) {
          console.log('[upload] copyFile fallback ok', destination.uri);
        }
      } catch (fallbackError) {
        deleteFileIfPresent(destination);
        throw new Error(
          `copy failed: ${errorMessage(copyError)}; fallback failed: ${errorMessage(fallbackError)}`
        );
      }
    }

    if (!destination.exists) {
      throw new Error(`The copy finished but the destination does not exist at ${destination.uri}`);
    }

    return destination.uri;
  } catch (error) {
    if (error instanceof StageError) {
      throw error;
    }

    throw new StageError('copyFile', errorMessage(error), error);
  }
}

export function deleteBookFile(uri: string): void {
  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {
    // The file is already gone or cannot be accessed; nothing to clean up.
  }
}
