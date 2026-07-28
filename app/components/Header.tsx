import {NavLink, Link, Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import type {Shop, Menu, CartData} from '@cloudcart/nitrogen';
import {useAside} from './Aside';
import {MagnifyingGlassIcon, ShoppingBagIcon, HeartIcon, Bars3Icon, XMarkIcon} from '@heroicons/react/24/outline';

interface HeaderProps {
  shop: Shop;
  menu: Menu | null;
  cart: Promise<CartData | null>;
  /** When true the header floats transparent over a dark hero until scrolled. */
  overHero?: boolean;
  /** Headroom scroll-reveal (hide on scroll-down, show on scroll-up). Disabled on PDP. */
  reveal?: boolean;
  /** Inverted dark header (black bg, light text, white logo) — used on the Premium page. */
  dark?: boolean;
}

const LOGO = 'https://js4nc.cloudcart.net/cdn/img/logo/1/logo-2.svg?v=1781011008';
const LOGO_WHITE = 'https://cdncloudcart.com/74980/files/image/logo-w.svg?1785129715';

const FALLBACK_MENU = [
  {title: 'Слънчеви очила', url: '/collections/slanchevi-ochila'},
  {title: 'Диоптрични рамки', url: '/collections/optical-glasses'},
  {title: 'Нови', url: '/collections'},
];

export function Header({shop, menu, cart, overHero = false, dark = false}: HeaderProps) {
  const items = (menu?.items?.length ? menu.items : FALLBACK_MENU).slice(0, 4);
  const {open} = useAside();
  // Sticky header: stays pinned to the top and shrinks once the page is scrolled.
  const [scrolled, setScrolled] = useState(false);
  // Header top edge follows the promo bar's bottom edge (36px → 0) so it stays
  // glued to it while the promo bar scrolls away — no gap, no jump.
  const [topGap, setTopGap] = useState(36);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 36);
      setTopGap(Math.max(0, 36 - y));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Solid (white) when scrolled, or on any non-hero page.
  const solid = scrolled || !overHero;
  // Light text/icons when the header is dark (Premium) or floating over a hero.
  const lightText = dark || !solid;

  return (
    <>
    <header
      data-site-header
      className={[
        'fixed left-0 right-0 z-[200] transition-[background-color,border-color] duration-300',
        dark ? 'bg-ink border-b border-white/10' : solid ? 'bg-paper border-b border-[#e8e5e0]' : 'border-b border-transparent',
      ].join(' ')}
      style={{top: `${topGap}px`, transitionTimingFunction: 'var(--ease-snap)'}}
    >
      <nav
        className={`relative flex items-center justify-between px-3 transition-[height] duration-300 md:px-7 ${scrolled ? 'h-[60px]' : 'h-[64px] md:h-[82px]'}`}
        style={{transitionTimingFunction: 'var(--ease-snap)'}}
      >
        {/* Left — menu + search (mobile) · primary nav (desktop) */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => open('mobile')}
            aria-label="Меню"
            className={`flex size-9 items-center justify-center transition-colors md:hidden ${lightText ? 'text-white/85 hover:text-white' : 'text-ink'}`}
          >
            <Bars3Icon className="size-[24px]" />
          </button>
          <button
            type="button"
            onClick={() => open('search')}
            aria-label="Search"
            className={`flex size-9 items-center justify-center transition-colors md:hidden ${lightText ? 'text-white/85 hover:text-white' : 'text-mid hover:text-ink'}`}
          >
            <MagnifyingGlassIcon className="size-[20px]" />
          </button>
          <div className="hidden items-center md:flex">
          {items.map((item) => (
            <NavLink
              key={`${item.title}-${item.url}`}
              to={item.url}
              prefetch="intent"
              className={[
                'group relative flex h-full items-center whitespace-nowrap px-4 font-sans text-[14px] font-medium tracking-[0.01em] transition-colors',
                lightText ? 'text-white/80 hover:text-white' : 'text-[#333333] hover:text-ink',
              ].join(' ')}
            >
              <span
                className={[
                  'relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 group-hover:after:scale-x-100',
                  lightText ? 'after:bg-white' : 'after:bg-ink',
                ].join(' ')}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
          </div>
        </div>

        {/* Center — logo (absolutely centered on the page) */}
        <Link to="/" aria-label={shop.name || 'Opticlasa'} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            src={dark ? LOGO_WHITE : LOGO}
            alt={shop.name || 'Opticlasa'}
            className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-[26px] md:h-[32px]' : 'h-[34px] md:h-[50px]'}`}
            style={{transitionTimingFunction: 'var(--ease-snap)'}}
          />
        </Link>

        {/* Right — special links + CTA + icons */}
        <div className="flex items-center gap-1">
          <Link
            to="/outlet"
            className={`mr-1.5 hidden rounded-full border px-4 py-2 font-display text-[12px] font-extrabold uppercase leading-none tracking-[0.14em] transition-colors lg:inline-block ${
              solid
                ? 'border-red text-red hover:bg-red hover:text-white'
                : 'border-white/60 text-white hover:bg-white hover:text-red'
            }`}
          >
            Outlet
          </Link>
          <Link
            to="/premium"
            className="mr-4 hidden rounded-full border border-[#c9a24a]/70 px-4 py-2 font-display text-[12px] font-extrabold uppercase leading-none tracking-[0.16em] transition-colors hover:bg-[#e7c97f]/15 lg:inline-block"
          >
            <span className="bg-gradient-to-r from-[#b8893d] via-[#e7c97f] to-[#b8893d] bg-clip-text text-transparent">
              Premium
            </span>
          </Link>
          <button
            type="button"
            onClick={() => open('search')}
            aria-label="Search"
            className={`hidden size-9 items-center justify-center transition-colors md:flex ${lightText ? 'text-white/70 hover:text-white' : 'text-mid hover:text-ink'}`}
          >
            <MagnifyingGlassIcon className="size-[20px]" />
          </button>
          <IconLink to="/account/wishlist" label="Wishlist" light={lightText}>
            <HeartIcon className="size-[20px]" />
          </IconLink>
          <button
            type="button"
            onClick={() => open('cart')}
            aria-label="Open cart"
            className={`relative flex size-9 items-center justify-center transition-colors ${
              lightText ? 'text-white/70 hover:text-white' : 'text-mid hover:text-ink'
            }`}
          >
            <ShoppingBagIcon className="size-[20px]" />
            <Suspense>
              <Await resolve={cart}>
                {(resolvedCart) =>
                  resolvedCart && resolvedCart.totalQuantity > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex size-[18px] items-center justify-center rounded-full bg-red text-[0.6rem] font-bold text-white">
                      {resolvedCart.totalQuantity}
                    </span>
                  ) : null
                }
              </Await>
            </Suspense>
          </button>
        </div>
      </nav>
    </header>
    <MobileMenu items={items} />
    </>
  );
}

function MobileMenu({items}: {items: {title: string; url: string}[]}) {
  const {type, close} = useAside();
  const open = type === 'mobile';

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 z-[500] bg-black/50 transition-opacity duration-300 md:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <div
        className={`fixed left-0 top-0 z-[510] flex h-full w-[340px] max-w-[88vw] flex-col bg-paper transition-transform duration-300 md:hidden ${open ? 'translate-x-0 shadow-[0_0_40px_rgba(0,0,0,0.25)]' : '-translate-x-full'}`}
        style={{transitionTimingFunction: 'var(--ease-snap)'}}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <span className="font-display text-[13px] font-bold uppercase tracking-[0.2em] text-ink">Меню</span>
          <button type="button" onClick={close} aria-label="Затвори" className="text-mid transition-colors hover:text-ink">
            <XMarkIcon className="size-6" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col overflow-y-auto px-6 py-4">
          <div className="mb-4 flex flex-col gap-3">
            <Link to="/premium" onClick={close} className="rounded-full border border-[#c9a24a]/70 py-3 text-center font-display text-[14px] font-extrabold uppercase tracking-[0.16em] transition-colors hover:bg-[#e7c97f]/15">
              <span className="bg-gradient-to-r from-[#b8893d] via-[#e7c97f] to-[#b8893d] bg-clip-text text-transparent">Premium</span>
            </Link>
            <Link to="/outlet" onClick={close} className="rounded-full border border-red py-3 text-center font-display text-[14px] font-extrabold uppercase tracking-[0.14em] text-red transition-colors hover:bg-red hover:text-white">Outlet</Link>
          </div>
          {items.map((item) => (
            <Link key={`${item.title}-${item.url}`} to={item.url} onClick={close} className="flex items-center justify-between border-b border-line/60 py-3.5 font-sans text-[16px] text-ink">
              {item.title}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="size-4 text-mid"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-6">
          <img src={LOGO} alt="Opticlasa" className="h-9 w-auto opacity-[0.72] grayscale" />
          <p className="mt-2.5 max-w-[250px] font-sans text-[12px] font-light leading-relaxed text-mid">Висококачествени оригинални дамски и мъжки очила от топ марки на най-добри цени.</p>
          <div className="mt-4 flex items-center gap-4 border-t border-line pt-4">
            <span className="font-sans text-[13px] font-medium text-ink">Последвай ни:</span>
            <a href="https://www.facebook.com/opticlasa/" target="_blank" rel="noreferrer" aria-label="Facebook" className="text-mid transition-colors hover:text-ink">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-[20px]"><path d="M13.5 21v-8h2.6l.4-3h-3V8.1c0-.9.3-1.5 1.6-1.5h1.6V4c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.1V10H8v3h2.3v8h3.2z" /></svg>
            </a>
            <a href="https://www.instagram.com/opticlasa/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-mid transition-colors hover:text-ink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="size-[20px]"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" /></svg>
            </a>
            <a href="https://www.youtube.com/@OPTICLASA-m8z" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-mid transition-colors hover:text-ink">
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-[22px]"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.7 1.7c1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4a2.5 2.5 0 0 0 1.7-1.7C23 15.2 23 12 23 12ZM9.8 15V9l5.2 3-5.2 3Z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

function IconLink({
  to,
  label,
  light,
  children,
}: {
  to: string;
  label: string;
  light: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={`flex size-9 items-center justify-center transition-colors ${
        light ? 'text-white/70 hover:text-white' : 'text-mid hover:text-ink'
      }`}
    >
      {children}
    </NavLink>
  );
}
