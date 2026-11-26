import { PdfViewer } from '@/features/reader/PdfViewer';
import { useReader } from '@/features/reader/useReader';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PdfError, PdfRef } from 'react-native-pdf';

const CONTROLS_HIDE_DELAY_MS = 3000;

export default function ReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    book,
    loading,
    notFound,
    currentPage,
    totalPages,
    readingMode,
    handleLoadComplete,
    handlePageChanged,
    toggleReadingMode,
  } = useReader(id);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [jumpVisible, setJumpVisible] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const pdfRef = useRef<PdfRef>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      hideTimerRef.current = null;
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY_MS);
  }, [clearHideTimer]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (!book || jumpVisible) {
      clearHideTimer();
      return;
    }

    scheduleHide();

    return clearHideTimer;
  }, [book, jumpVisible, clearHideTimer, scheduleHide]);

  const handlePdfError = useCallback((error: PdfError) => {
    console.error('[reader] pdf error', error);
    setPdfError(error.message || 'Could not open this PDF.');
  }, []);

  const handleToggleReadingMode = useCallback(() => {
    toggleReadingMode();
    showControls();
  }, [showControls, toggleReadingMode]);

  const handlePageTap = useCallback(() => {
    showControls();
  }, [showControls]);

  const openJumpModal = useCallback(() => {
    if (totalPages <= 0) {
      return;
    }

    clearHideTimer();
    setControlsVisible(true);
    setJumpInput(String(currentPage));
    setJumpError(null);
    setJumpVisible(true);
  }, [clearHideTimer, currentPage, totalPages]);

  const closeJumpModal = useCallback(() => {
    setJumpVisible(false);
    setControlsVisible(true);
    setJumpInput('');
    setJumpError(null);
  }, []);

  const handleJump = useCallback(() => {
    const value = jumpInput.trim();

    if (!/^\d+$/.test(value)) {
      setJumpError('Enter a page number.');
      return;
    }

    const page = Number(value);

    if (page < 1 || page > totalPages) {
      setJumpError(`Enter a page between 1 and ${totalPages}.`);
      return;
    }

    pdfRef.current?.setPage(page);
    closeJumpModal();
  }, [closeJumpModal, jumpInput, totalPages]);

  return (
    <>
      <Stack.Screen
        options={{
          title: book?.title ?? 'Reader',
          headerRight: book
            ? () => (
                <Pressable
                  accessibilityHint="Changes the page layout."
                  accessibilityLabel={
                    readingMode === 'scroll' ? 'Switch to paged mode' : 'Switch to scroll mode'
                  }
                  accessibilityRole="button"
                  hitSlop={12}
                  onPress={handleToggleReadingMode}
                  style={styles.headerButton}
                >
                  <Ionicons
                    color="#355070"
                    name={readingMode === 'scroll' ? 'swap-vertical' : 'swap-horizontal'}
                    size={22}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#355070" size="large" />
        </View>
      ) : notFound || book === null ? (
        <View style={styles.centered}>
          <Text style={styles.notFound}>Book not found</Text>
        </View>
      ) : (
        <View style={styles.container}>
          {pdfError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{pdfError}</Text>
            </View>
          ) : null}
          <PdfViewer
            key={readingMode}
            ref={pdfRef}
            fileUri={book.fileUri}
            initialPage={currentPage}
            readingMode={readingMode}
            onPageChanged={handlePageChanged}
            onLoadComplete={handleLoadComplete}
            onError={handlePdfError}
            onPageTap={handlePageTap}
          />
          {controlsVisible ? (
            <View
              pointerEvents="box-none"
              style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}
            >
              <Pressable
                accessibilityHint="Opens the page jump dialog."
                accessibilityLabel={`Page ${currentPage} of ${totalPages || 'unknown'}`}
                accessibilityRole="button"
                disabled={totalPages <= 0}
                hitSlop={8}
                onPress={openJumpModal}
                style={({ pressed }) => [styles.pageButton, pressed && styles.pressed]}
              >
                <Text style={styles.pageCounter}>
                  {currentPage} / {totalPages > 0 ? totalPages : '—'}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      )}
      <Modal
        animationType="fade"
        onRequestClose={closeJumpModal}
        transparent
        visible={jumpVisible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <Pressable
            accessibilityLabel="Close go to page dialog"
            accessibilityRole="button"
            onPress={closeJumpModal}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Go to page</Text>
            <TextInput
              accessibilityLabel="Page number"
              autoFocus
              keyboardType="number-pad"
              onChangeText={(value) => {
                setJumpInput(value);
                if (jumpError) {
                  setJumpError(null);
                }
              }}
              onSubmitEditing={handleJump}
              placeholder={`1–${totalPages}`}
              returnKeyType="go"
              selectTextOnFocus
              style={styles.modalInput}
              value={jumpInput}
            />
            {jumpError ? <Text style={styles.modalError}>{jumpError}</Text> : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={closeJumpModal}
                style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
              >
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleJump}
                style={({ pressed }) => [
                  styles.modalButton,
                  styles.modalGoButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.modalGo}>Go</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e7eb',
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  notFound: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderBottomColor: '#fecaca',
    borderBottomWidth: 1,
    padding: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
    textAlign: 'center',
  },
  headerButton: {
    paddingHorizontal: 4,
  },
  bottomBar: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  pageButton: {
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageCounter: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    gap: 12,
    maxWidth: 360,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderWidth: 1,
    color: '#111827',
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalError: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  modalButton: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  modalCancel: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  modalGoButton: {
    backgroundColor: '#355070',
  },
  modalGo: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
