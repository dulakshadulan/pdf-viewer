export function redirectSystemPath({
  path,
  initial,
}: {
  path: string;
  initial: boolean;
}) {
  if (__DEV__) {
    console.log('[open-with] incoming', path, initial);
  }

  try {
    if (path.startsWith('content://') || path.startsWith('file://')) {
      return `/open?uri=${encodeURIComponent(path)}`;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[open-with] failed to rewrite path', error);
    }
  }

  return path;
}
