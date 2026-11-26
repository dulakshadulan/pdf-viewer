import { Directory, File, Paths } from 'expo-file-system';
import PdfThumbnail from 'react-native-pdf-thumbnail';

const COVERS_DIRECTORY_NAME = 'covers';
const COVER_MAX_WIDTH = 600;
const inFlightCovers = new Map<string, Promise<string>>();

function getCoversDirectory(): Directory {
  const directory = new Directory(Paths.document, COVERS_DIRECTORY_NAME);

  if (!directory.exists) {
    directory.create({ idempotent: true, intermediates: true });
  }

  if (!directory.exists) {
    throw new Error(`The covers directory was not created at ${directory.uri}`);
  }

  return directory;
}

function safeBookId(bookId: string): string {
  return bookId.replace(/[^a-zA-Z0-9_-]/g, '_') || Date.now().toString(36);
}

export function deleteCover(uri: string): void {
  try {
    const file = new File(uri);

    if (file.exists) {
      file.delete();
    }
  } catch {}
}

async function generateCoverInternal(bookId: string, pdfFileUri: string): Promise<string> {
  const cover = await PdfThumbnail.generate(pdfFileUri, 0, { maxWidth: COVER_MAX_WIDTH });
  const generatedFile = new File(cover.uri);

  try {
    const coversDirectory = getCoversDirectory();
    const destination = new File(coversDirectory, `${safeBookId(bookId)}.jpg`);

    if (destination.exists) {
      destination.delete();
    }

    await generatedFile.copy(destination);

    if (!destination.exists) {
      throw new Error(`The cover was not copied to ${destination.uri}`);
    }

    return destination.uri;
  } finally {
    deleteCover(generatedFile.uri);
  }
}

export function generateCover(bookId: string, pdfFileUri: string): Promise<string> {
  const existing = inFlightCovers.get(bookId);

  if (existing) {
    return existing;
  }

  const task = generateCoverInternal(bookId, pdfFileUri).finally(() => {
    inFlightCovers.delete(bookId);
  });

  inFlightCovers.set(bookId, task);
  return task;
}
