/**
 * Generate a full URL for a storage asset.
 * Reads the current origin dynamically so it works in any environment
 * (localhost:8000, varnellcollection.com, staging, etc.)
 *
 * @param path - The relative path, e.g. "/storage/products/abc.jpg"
 */
export function assetUrl(path: string | null | undefined): string {
    if (!path) return '';
    // If the path is already an absolute URL, return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${window.location.origin}${path}`;
}
