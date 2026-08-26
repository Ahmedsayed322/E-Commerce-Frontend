import { environment } from '../../../environments/environment';

/**
 * Resolves a model image path or S3 key to a previewable, next-gen optimized URL.
 * Automatically appends modern format (WebP/AVIF) query params for CDN assets.
 */
export function resolveImageUrl(
  path?: string | null,
  fallback = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&fm=webp&q=80'
): string {
  if (!path || typeof path !== 'string' || !path.trim()) {
    return fallback;
  }
  const cleanPath = path.trim();
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('data:')) {
    // If it's an Unsplash URL without auto-format, add next-gen webp parameters
    if (cleanPath.includes('images.unsplash.com') && !cleanPath.includes('auto=format')) {
      const separator = cleanPath.includes('?') ? '&' : '?';
      return `${cleanPath}${separator}auto=format&fit=crop&fm=webp&q=80`;
    }
    return cleanPath;
  }
  const host = environment.backendBaseUrl || 'http://3.93.100.36';
  const formattedKey = cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath;
  return `${host}/uploads/${formattedKey}`;
}
