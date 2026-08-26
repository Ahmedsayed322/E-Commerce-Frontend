/**
 * Resolves a model image path or S3 key to a previewable URL.
 * If the path is already a full HTTP(S) URL (such as external or demo assets), returns it.
 * If the path is an S3 key (such as 'products/...', 'Category/...', 'brands/...', 'users/...'),
 * maps it to the backend streaming endpoint: `http://localhost:3000/uploads/${path}`.
 */
export function resolveImageUrl(path?: string | null, fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'): string {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return fallback;
  }
  const cleanPath = path.trim();
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:')) {
    return cleanPath;
  }
  const host = 'http://localhost:3000';
  const formattedKey = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  return `${host}/uploads/${formattedKey}`;
}
