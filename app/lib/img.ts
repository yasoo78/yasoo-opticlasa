/**
 * CloudCart product image CDN helper (spec §3.4 / §11).
 *
 * Raw product images are 1920px — always resize. Arbitrary sizes can 404, so
 * callers should pair this with `onImgErrorToBase` (falls back to the un-resized
 * original). Recommended widths: subcat card 200 · grid card 600 · PDP gallery 700.
 */

/** Strip any existing query string (the un-resized original, used as the onError fallback). */
export function baseUrl(url: string | undefined): string | undefined {
  return url ? url.split('?')[0] : url;
}

/** Resize a CloudCart `/cdn/img/` URL to a square W×W; leaves non-CDN URLs untouched. */
export function cdnSize(url: string | undefined, w: number): string | undefined {
  if (!url) return url;
  return /\/cdn\/img\//.test(url) ? `${url.split('?')[0]}?width=${w}&height=${w}` : url;
}

/** `onError` handler: fall back from a resized URL to the un-resized base (avoids 404 holes). */
export function onImgErrorToBase(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  const base = img.src.split('?')[0];
  if (img.src !== base) img.src = base;
}
