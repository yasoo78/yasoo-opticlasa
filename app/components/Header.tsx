import {NavLink, Link, Await} from 'react-router';
import {Suspense, useEffect, useState} from 'react';
import type {Shop, Menu, CartData} from '@cloudcart/nitrogen';
import {useAside} from './Aside';
import {MagnifyingGlassIcon, ShoppingBagIcon, HeartIcon} from '@heroicons/react/24/outline';

interface HeaderProps {
  shop: Shop;
  menu: Menu | null;
  cart: Promise<CartData | null>;
  /** When true the header floats transparent over a dark hero until scrolled. */
  overHero?: boolean;
  /** Headroom scroll-reveal (hide on scroll-down, show on scroll-up). Disabled on PDP. */
  reveal?: boolean;
}

const LOGO = 'https://js4nc.cloudcart.net/cdn/img/logo/1/logo-2.svg?v=1781011008';

const FALLBACK_MENU = [
  {title: 'Слънчеви очила', url: '/collections/slanchevi-ochila'},
  {title: 'Диоптрични рамки', url: '/collections/optical-glasses'},
  {title: 'Нови', url: '/collections'},
];

export function Header({shop, menu, cart, overHero = false}: HeaderProps) {
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

  return (
    <header
      data-site-header
      className={[
        'fixed left-0 right-0 z-[200] transition-[background-color,border-color] duration-300',
        solid ? 'bg-paper border-b border-[#e8e5e0]' : 'border-b border-transparent',
      ].join(' ')}
      style={{top: `${topGap}px`, transitionTimingFunction: 'var(--ease-snap)'}}
    >
      <nav
        className={`relative flex items-center justify-between px-7 transition-[height] duration-300 ${scrolled ? 'h-[60px]' : 'h-[82px]'}`}
        style={{transitionTimingFunction: 'var(--ease-snap)'}}
      >
        {/* Left — primary nav */}
        <div className="hidden items-center md:flex">
          {items.map((item) => (
            <NavLink
              key={`${item.title}-${item.url}`}
              to={item.url}
              prefetch="intent"
              className={[
                'group relative flex h-full items-center whitespace-nowrap px-4 font-sans text-[14px] font-medium tracking-[0.01em] transition-colors',
                solid ? 'text-[#333333] hover:text-ink' : 'text-white/80 hover:text-white',
              ].join(' ')}
            >
              <span
                className={[
                  'relative after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 group-hover:after:scale-x-100',
                  solid ? 'after:bg-ink' : 'after:bg-white',
                ].join(' ')}
              >
                {item.title}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Center — logo (absolutely centered on the page) */}
        <Link to="/" aria-label={shop.name || 'Opticlasa'} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img
            src={LOGO}
            alt={shop.name || 'Opticlasa'}
            className={`w-auto transition-[height] duration-300 ${scrolled ? 'h-[32px]' : 'h-[50px]'}`}
            style={{transitionTimingFunction: 'var(--ease-snap)'}}
          />
        </Link>

        {/* Right — special links + CTA + icons */}
        <div className="flex items-center gap-1">
          <Link
            to="/collections"
            className={`mr-1.5 hidden rounded-full border px-4 py-2 font-display text-[12px] font-extrabold uppercase leading-none tracking-[0.14em] transition-colors lg:inline-block ${
              solid
                ? 'border-red text-red hover:bg-red hover:text-white'
                : 'border-white/60 text-white hover:bg-white hover:text-red'
            }`}
          >
            Outlet
          </Link>
          <Link
            to="/collections"
            className="mr-4 hidden rounded-full border border-[#c9a24a]/70 px-4 py-2 font-display text-[12px] font-extrabold uppercase leading-none tracking-[0.16em] transition-colors hover:bg-[#e7c97f]/15 lg:inline-block"
          >
            <span className="bg-gradient-to-r from-[#b8893d] via-[#e7c97f] to-[#b8893d] bg-clip-text text-transparent">
              Premium
            </span>
          </Link>
          <IconLink to="/search" label="Search" solid={solid}>
            <MagnifyingGlassIcon className="size-[20px]" />
          </IconLink>
          <IconLink to="/account/wishlist" label="Wishlist" solid={solid}>
            <HeartIcon className="size-[20px]" />
          </IconLink>
          <button
            type="button"
            onClick={() => open('cart')}
            aria-label="Open cart"
            className={`relative flex size-9 items-center justify-center transition-colors ${
              solid ? 'text-mid hover:text-ink' : 'text-white/70 hover:text-white'
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
  );
}

function IconLink({
  to,
  label,
  solid,
  children,
}: {
  to: string;
  label: string;
  solid: boolean;
  children: React.ReactNode;
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={`flex size-9 items-center justify-center transition-colors ${
        solid ? 'text-mid hover:text-ink' : 'text-white/70 hover:text-white'
      }`}
    >
      {children}
    </NavLink>
  );
}
