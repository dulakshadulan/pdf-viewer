import { addBook } from '@/db';
import { errorMessage } from '@/lib/errors';
import { copyIntoBooksDir, deleteBookFile } from '@/lib/files';
import { titleFromFilename } from '@/lib/format';
import { File, FileMode } from 'expo-file-system';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

export type OpenIncomingFileStatus = 'loading' | 'error';

export interface UseOpenIncomingFileResult {
  status: OpenIncomingFileStatus;
  error: string | null;
}

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d] as const;
const NOT_PDF_MESSAGE = 'That file is not a PDF.';
const GENERIC_ERROR_MESSAGE = 'Could not open this file. Please try again.';
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

class NotPdfError extends Error {
  constructor() {
    super(NOT_PDF_MESSAGE);
    this.name = 'NotPdfError';
  }
}

function fallbackTitle(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  return `PDF ${day} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
}

function titleFromIncomingUri(uri: string): string {
  try {
    const name = new File(uri).name;
    const title = name ? titleFromFilename(name) : '';

    if (title && !title.includes(':') && !title.includes('%')) {
      return title;
    }
  } catch {}

  return fallbackTitle();
}

async function hasPdfSignature(uri: string): Promise<boolean> {
  const handle = new File(uri).open(FileMode.ReadOnly);

  try {
    const bytes = await handle.readBytes(PDF_SIGNATURE.length);
    return PDF_SIGNATURE.every((byte, index) => bytes[index] === byte);
  } finally {
    handle.close();
  }
}

export function useOpenIncomingFile(uri: string | undefined): UseOpenIncomingFileResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<UseOpenIncomingFileResult>({
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function openIncomingFile() {
      await Promise.resolve();

      if (!active) {
        return;
      }

      setState({ status: 'loading', error: null });

      if (!uri) {
        setState({ status: 'error', error: 'No file was provided.' });
        return;
      }

      const incomingUri = uri;

      if (!incomingUri.startsWith('content://') && !incomingUri.startsWith('file://')) {
        setState({ status: 'error', error: 'This file location is not supported.' });
        return;
      }

      let storedUri: string | null = null;
      let imported = false;

      try {
        const title = titleFromIncomingUri(incomingUri);
        storedUri = await copyIntoBooksDir(incomingUri);

        if (!(await hasPdfSignature(storedUri))) {
          throw new NotPdfError();
        }

        const book = await addBook(db, { title, fileUri: storedUri, fileType: 'pdf' });
        imported = true;

        if (!active) {
          return;
        }

        router.replace('/');
        router.push({ pathname: '/reader/[id]', params: { id: book.id } });
      } catch (error) {
        if (storedUri && !imported) {
          deleteBookFile(storedUri);
        }

        if (!active) {
          return;
        }

        setState({
          status: 'error',
          error:
            error instanceof NotPdfError
              ? NOT_PDF_MESSAGE
              : __DEV__
                ? errorMessage(error)
                : GENERIC_ERROR_MESSAGE,
        });
      }
    }

    void openIncomingFile();

    return () => {
      active = false;
    };
  }, [db, uri]);

  return state;
}
