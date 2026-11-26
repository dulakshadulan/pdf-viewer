import type { Book } from '@/db';
import { colorFromId, formatProgress } from '@/lib/format';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface BookCardProps {
  book: Book;
  disabled?: boolean;
  onPress: () => void;
  onLongPress: () => void;
}

export function BookCard({ book, disabled = false, onPress, onLongPress }: BookCardProps) {
  const initial = book.title.trim().charAt(0).toUpperCase() || '?';
  const author = book.author.trim() || 'Unknown author';
  const [failedCoverUri, setFailedCoverUri] = useState<string | null>(null);
  const showCover = Boolean(book.coverUri) && failedCoverUri !== book.coverUri;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${author}`}
      accessibilityHint="Opens the reader. Long press to delete."
      disabled={disabled}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.cover, { backgroundColor: colorFromId(book.id) }]}>
        <Text style={styles.initial}>{initial}</Text>
        {showCover && book.coverUri ? (
          <Image
            source={{ uri: book.coverUri }}
            style={styles.coverImage}
            resizeMode="cover"
            onError={() => setFailedCoverUri(book.coverUri)}
          />
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {book.title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {author}
      </Text>
      <Text style={styles.progress}>{formatProgress(book)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    gap: 6,
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  cover: {
    alignItems: 'center',
    aspectRatio: 2 / 3,
    borderRadius: 10,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  coverImage: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  initial: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '700',
  },
  title: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    minHeight: 40,
  },
  author: {
    color: '#6b7280',
    fontSize: 13,
  },
  progress: {
    color: '#355070',
    fontSize: 12,
    fontWeight: '600',
  },
});
