import type { Book } from '@/db';
import { BookCard } from '@/features/library/BookCard';
import { EmptyLibrary } from '@/features/library/EmptyLibrary';
import { useBooks } from '@/features/library/useBooks';
import { useDeleteBook } from '@/features/library/useDeleteBook';
import { useTheme } from '@/lib/ThemeProvider';
import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ListRenderItemInfo,
} from 'react-native';

export default function LibraryScreen() {
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { books, loading, error, refresh } = useBooks();
  const { confirmDelete, deletingId, error: deleteError } = useDeleteBook(refresh);
  const cardWidth = Math.floor((width - 48) / 2);

  const openBook = useCallback((book: Book) => {
    router.push({ pathname: '/reader/[id]', params: { id: book.id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Book>) => (
      <View style={{ width: cardWidth }}>
        <BookCard
          book={item}
          disabled={deletingId === item.id}
          onPress={() => openBook(item)}
          onLongPress={() => confirmDelete(item)}
        />
      </View>
    ),
    [cardWidth, confirmDelete, deletingId, openBook]
  );

  const emptyContent = loading ? (
    <View style={styles.centered}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={[styles.muted, { color: colors.textSecondary }]}>Loading your library...</Text>
    </View>
  ) : error ? (
    <View style={styles.centered}>
      <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
      <Text style={[styles.muted, { color: colors.textSecondary }]}>{error}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void refresh();
        }}
        style={({ pressed }) => [
          styles.retryButton,
          { backgroundColor: colors.primary },
          pressed && styles.pressed,
        ]}
      >
        <Text style={[styles.retryText, { color: colors.background }]}>Try again</Text>
      </Pressable>
    </View>
  ) : (
    <EmptyLibrary onUpload={() => router.navigate('/upload')} />
  );

  const bannerError = deleteError ?? (books.length > 0 ? error : null);

  return (
    <FlatList
      columnWrapperStyle={styles.column}
      contentContainerStyle={[styles.content, books.length === 0 && styles.emptyContent]}
      data={books}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={emptyContent}
      ListHeaderComponent={
        bannerError ? (
          <Text
            style={[
              styles.banner,
              {
                backgroundColor: colors.surface,
                borderColor: colors.danger,
                color: colors.danger,
              },
            ]}
          >
            {bannerError}
          </Text>
        ) : undefined
      }
      numColumns={2}
      onRefresh={() => {
        void refresh();
      }}
      refreshing={loading && books.length > 0}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  column: {
    gap: 16,
  },
  centered: {
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  muted: {
    fontSize: 15,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 11,
  },
  pressed: {
    opacity: 0.85,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  banner: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    padding: 12,
  },
});
