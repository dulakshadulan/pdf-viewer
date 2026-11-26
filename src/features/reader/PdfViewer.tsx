import type { ReadingMode } from '@/lib/settings';
import { forwardRef, useState } from 'react';
import Pdf, { type PdfError, type PdfRef } from 'react-native-pdf';
import { StyleSheet } from 'react-native';

interface PdfViewerProps {
  fileUri: string;
  initialPage: number;
  readingMode: ReadingMode;
  onPageChanged: (page: number, total: number) => void;
  onLoadComplete: (total: number) => void;
  onError: (error: PdfError) => void;
  onPageTap: () => void;
}

export const PdfViewer = forwardRef<PdfRef, PdfViewerProps>(function PdfViewer(
  {
    fileUri,
    initialPage,
    readingMode,
    onPageChanged,
    onLoadComplete,
    onError,
    onPageTap,
  },
  ref
) {
  const paged = readingMode === 'paged';
  const [mountPage] = useState(initialPage);

  return (
    <Pdf
      ref={ref}
      source={{ uri: fileUri, cache: false }}
      page={mountPage}
      horizontal={paged}
      enablePaging={paged}
      enableDoubleTapZoom
      minScale={1}
      maxScale={4}
      onLoadComplete={(total) => onLoadComplete(total)}
      onPageChanged={(page, total) => onPageChanged(page, total)}
      onError={(error) => onError(error)}
      onPageSingleTap={() => onPageTap()}
      style={styles.pdf}
    />
  );
});

const styles = StyleSheet.create({
  pdf: {
    backgroundColor: '#ffffff',
    flex: 1,
    width: '100%',
  },
});
