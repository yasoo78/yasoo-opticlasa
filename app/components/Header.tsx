import {NavLink, Link, Await} from 'react-router';
import {Suspense, useEffect, useRef, useState} from 'react';
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

export function Header({shop, menu, cart, overHero = false, reveal = true}: HeaderProps) {
  const items = (menu?.items?.length ? menu.items : FALLBACK_MENU).slice(0, 4);
  const {open} = useAside();
  const [scrolled, setScrolled] = useState(false);
  // Headroom reveal: hide the bar on scroll-down, slide it back on any scroll-up.
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 36);
      const dy = y - lastY.current;
      if (!reveal || y < 80) setHidden(false);
      else if (dy > 4) setHidden(true);      // scrolling down → hide
      else if (dy < -4) setHidden(false);    // scrolling up → reveal
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, [reveal]);

  // Solid (white) when scrolled, or on any non-hero page.
  const solid = scrolled || !overHero;

  return (
    <header
      data-site-header
      className={[
        'fixed left-0 right-0 z-[200] transition-[top,transform,background-color,border-color] duration-300 will-change-transform',
        scrolled ? 'top-0' : 'top-9',
        hidden ? '-translate-y-[140%]' : 'translate-y-0',
        solid ? 'bg-paper border-b border-[#e8e5e0]' : 'border-b border-transparent',
      ].join(' ')}
      style={{transitionTimingFunction: 'var(--ease-snap)'}}
    >
      <nav className="relative flex h-[68px] items-center justify-between px-7">
        {/* Left — primary nav */}
        <div className="hidden items-center md:flex">
          {items.map((item) => (
            <NavLink
              key={`${item.title}-${item.url}`}
              to={item.url}
              prefetch="intent"
              className={[
                'relative flex h-[68px] items-center whitespace-nowrap px-4 font-sans text-[13px] font-medium tracking-[0.01em] transition-colors',
                'after:absolute after:bottom-2 after:left-4 after:right-4 after:h-0.5 after:origin-left after:scale-x-0 after:transition-transform after:duration-200 hover:after:scale-x-100',
                solid
                  ? 'text-mid hover:text-ink after:bg-ink'
                  : 'text-white/80 hover:text-white after:bg-white',
              ].join(' ')}
            >
              {item.title}
            </NavLink>
          ))}
        </div>

        {/* Center — logo (absolutely centered on the page) */}
        <Link to="/" aria-label={shop.name || 'Opticlasa'} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <img src={LOGO} alt={shop.name || 'Opticlasa'} className="h-[38px] w-auto" />
        </Link>

        {/* Right — special links + CTA + icons */}
        <div className="flex items-center gap-1">
          <Link
            to="/collections"
            className={`mr-1.5 hidden rounded-full border px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase leading-none tracking-[0.14em] transition-colors lg:inline-block ${
              solid
                ? 'border-red text-red hover:bg-red hover:text-white'
                : 'border-white/60 text-white hover:bg-white hover:text-red'
            }`}
          >
            Outlet
          </Link>
          <Link
            to="/collections"
            className="mr-4 hidden rounded-full border border-[#c9a24a]/70 px-3.5 py-1.5 font-display text-[11px] font-extrabold uppercase leading-none tracking-[0.16em] transition-colors hover:bg-[#e7c97f]/15 lg:inline-block"
          >
            <span className="bg-gradient-to-r from-[#b8893d] via-[#e7c97f] to-[#b8893d] bg-clip-text text-transparent">
              Premium
            </span>
          </Link>
          <IconLink to="/search" label="Search" solid={solid}>
            <MagnifyingGlassIcon className="size-[18px]" />
          </IconLink>
          <IconLink to="/account/wishlist" label="Wishlist" solid={solid}>
            <HeartIcon className="size-[18px]" />
          </IconLink>
          <button
            type="button"
            onClick={() => open('cart')}
            aria-label="Open cart"
            className={`relative flex size-9 items-center justify-center transition-colors ${
              solid ? 'text-mid hover:text-ink' : 'text-white/70 hover:text-white'
            }`}
          >
            <ShoppingBagIcon className="size-[18px]" />
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
