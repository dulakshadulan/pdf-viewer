import { PdfViewer } from '@/features/reader/PdfViewer';
import { useReader } from '@/features/reader/useReader';
import { useTheme } from '@/lib/ThemeProvider';
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
  const { colors } = useTheme();

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
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
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
                    color={colors.primary}
                    name={readingMode === 'scroll' ? 'swap-vertical' : 'swap-horizontal'}
                    size={22}
                  />
                </Pressable>
              )
            : undefined,
        }}
      />
      {loading ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : notFound || book === null ? (
        <View style={[styles.centered, { backgroundColor: colors.background }]}>
          <Text style={[styles.notFound, { color: colors.text }]}>Book not found</Text>
        </View>
      ) : (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {pdfError ? (
            <View
              style={[
                styles.errorBanner,
                { backgroundColor: colors.surface, borderBottomColor: colors.danger },
              ]}
            >
              <Text style={[styles.errorText, { color: colors.danger }]}>{pdfError}</Text>
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
                style={({ pressed }) => [
                  styles.pageButton,
                  { backgroundColor: colors.card, borderColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pageCounter, { color: colors.primary }]}>
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
          style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}
        >
          <Pressable
            accessibilityLabel="Close go to page dialog"
            accessibilityRole="button"
            onPress={closeJumpModal}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Go to page</Text>
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
              placeholderTextColor={colors.textSecondary}
              returnKeyType="go"
              selectTextOnFocus
              selectionColor={colors.primary}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={jumpInput}
            />
            {jumpError ? (
              <Text style={[styles.modalError, { color: colors.danger }]}>{jumpError}</Text>
            ) : null}
            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={closeJumpModal}
                style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}
              >
                <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleJump}
                style={({ pressed }) => [
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.modalGo, { color: colors.background }]}>Go</Text>
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
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  notFound: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    borderBottomWidth: 1,
    padding: 12,
  },
  errorText: {
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
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  pageCounter: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.8,
  },
  modalOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderRadius: 16,
    gap: 12,
    maxWidth: 360,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: 'center',
  },
  modalError: {
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
    fontSize: 15,
    fontWeight: '600',
  },
  modalGo: {
    fontSize: 15,
    fontWeight: '600',
  },
});
