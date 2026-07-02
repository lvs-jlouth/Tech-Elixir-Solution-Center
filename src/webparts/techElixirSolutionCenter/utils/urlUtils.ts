/**
 * sanitizeUrl
 *
 * Returns the input URL only when its scheme is `https:` or `http:`.
 * Relative paths (starting with `/`, `./`, or `../`) are passed through unchanged.
 * All other schemes — including `javascript:`, `data:`, and `vbscript:` — are
 * rejected and an empty string is returned instead.
 *
 * Use this before rendering any data-supplied value as an `href` or image `src`
 * to prevent protocol-injection attacks from SharePoint list content.
 *
 * @param url - The raw URL value from data or props.
 * @returns A safe URL string, or `''` if the value is unsafe or empty.
 */
export function sanitizeUrl(url: string | undefined): string {
  if (!url || !url.trim()) {
    return '';
  }

  const trimmed = url.trim();

  // Allow relative URLs (site-relative or document-relative)
  if (trimmed.startsWith('/') || trimmed.startsWith('./') || trimmed.startsWith('../')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? trimmed : '';
  } catch {
    // Not a valid absolute URL and not a relative path — reject it
    return '';
  }
}
