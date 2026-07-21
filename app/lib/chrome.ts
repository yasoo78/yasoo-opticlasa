/**
 * Bottom edge (in px from viewport top) of the fixed top chrome — the site header
 * plus the PDP sticky add-to-cart bar when it's visible. PDP drawers (lens/TBI)
 * anchor their top to this so they start *after* the sticky bar, never under it.
 */
export function topChromeBottom(): number {
  if (typeof document === 'undefined') return 68;
  let max = 0;
  // the real fixed site nav — NOT the cart/aside drawer header that also uses <header>
  const header = document.querySelector('[data-site-header]') ?? document.querySelector('header.fixed');
  if (header) max = Math.max(max, header.getBoundingClientRect().bottom);
  const bar = document.querySelector('[data-sticky-bar]');
  if (bar) {
    const r = bar.getBoundingClientRect();
    if (r.top >= 0 && r.bottom > r.top) max = Math.max(max, r.bottom);
  }
  return Math.max(0, Math.round(max));
}
