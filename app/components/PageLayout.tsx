import type {ReactNode} from 'react';
import {useLocation} from 'react-router';
import type {Shop, Menu, CartData} from '@cloudcart/nitrogen';
import {AnnouncementBar} from './AnnouncementBar';
import {Header} from './Header';
import {Footer} from './Footer';

interface PageLayoutProps {
  shop: Shop;
  headerMenu: Menu | null;
  footerMenu: Menu | null;
  cart: Promise<CartData | null>;
  children: ReactNode;
}

export function PageLayout({shop, headerMenu, footerMenu, cart, children}: PageLayoutProps) {
  const {pathname} = useLocation();
  const isHome = pathname === '/';
  const isProduct = pathname.startsWith('/products/');
  // Category/PLP pages are full-bleed — ProductListing supplies its own 40px gutter.
  const isCollection = pathname.startsWith('/collections/');

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header shop={shop} menu={headerMenu} cart={cart} overHero={false} reveal={!isProduct} />
      {isHome ? (
        // Editorial canvas — full-bleed, sections self-stack with a 2px gap; offset to clear the solid header.
        <main className="flex w-full flex-1 flex-col gap-0.5 pt-[82px]">{children}</main>
      ) : isProduct ? (
        // PDP — full-bleed editorial; offset to clear the fixed header.
        <main className="w-full flex-1 pt-[82px]">{children}</main>
      ) : isCollection ? (
        // Category/PLP — full width (no max-w cap, no extra padding); gutter from ProductListing.
        <main className="w-full flex-1 pt-[82px]">{children}</main>
      ) : (
        // Inner pages — contained, padded, offset to clear the fixed header.
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 pb-10 pt-[82px] md:px-8">{children}</main>
      )}
      <Footer shop={shop} menu={footerMenu} />
    </div>
  );
}
