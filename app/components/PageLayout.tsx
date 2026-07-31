import type {ReactNode} from 'react';
import {Link, useLocation} from 'react-router';
import type {Shop, Menu, CartData} from '@cloudcart/nitrogen';
import {AnnouncementBar} from './AnnouncementBar';
import {Header} from './Header';
import {Footer} from './Footer';

const LOGO_WHITE = 'https://cdncloudcart.com/74980/files/image/logo-w.svg?1785129715';

interface PageLayoutProps {
  shop: Shop;
  headerMenu: Menu | null;
  footerMenu: Menu | null;
  cart: Promise<CartData | null>;
  isLoggedIn?: boolean;
  children: ReactNode;
}

export function PageLayout({shop, headerMenu, footerMenu, cart, isLoggedIn = false, children}: PageLayoutProps) {
  const {pathname} = useLocation();
  const isHome = pathname === '/' || pathname === '/premium' || pathname === '/outlet';
  const isProduct = pathname.startsWith('/products/');
  // Category/PLP & selection pages are full-bleed — ProductListing supplies its own 40px gutter.
  const isCollection = pathname.startsWith('/collections/') || pathname.startsWith('/selection/') || pathname.startsWith('/search') || pathname === '/products';
  const isPremium = pathname === '/premium';
  const isOutlet = pathname === '/outlet';
  const isAuth = pathname === '/account/login' || pathname === '/account/register';

  // Auth pages — standalone chrome: slim black bar with the white logo, no header/footer.
  if (isAuth) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f6f6f6]">
        <div className="flex h-[56px] shrink-0 items-center justify-center bg-ink">
          <Link to="/" aria-label={shop.name || 'Opticlasa'}>
            <img src={LOGO_WHITE} alt={shop.name || 'Opticlasa'} className="h-[26px] w-auto brightness-0 invert" />
          </Link>
        </div>
        <main className="flex flex-1 items-start justify-center">{children}</main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar gold={isPremium} red={isOutlet} />
      <Header shop={shop} menu={headerMenu} cart={cart} overHero={false} reveal={!isProduct} dark={isPremium} isLoggedIn={isLoggedIn} />
      {isHome ? (
        // Editorial canvas — full-bleed, sections self-stack with a 2px gap; offset to clear the solid header.
        <main className="flex w-full flex-1 flex-col gap-0.5 pt-[64px] md:pt-[82px]">{children}</main>
      ) : isProduct ? (
        // PDP — full-bleed editorial; offset to clear the fixed header.
        <main className="w-full flex-1 pt-[64px] md:pt-[82px]">{children}</main>
      ) : isCollection ? (
        // Category/PLP — full width (no max-w cap, no extra padding); gutter from ProductListing.
        <main className="w-full flex-1 pt-[64px] md:pt-[82px]">{children}</main>
      ) : (
        // Inner pages — contained, padded, offset to clear the fixed header.
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-10 pt-[64px] md:pt-[82px] md:px-8">{children}</main>
      )}
      <Footer shop={shop} menu={footerMenu} />
    </div>
  );
}
