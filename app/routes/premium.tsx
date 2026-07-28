import {Link, useLoaderData} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import type {Route} from './+types/premium';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';
import type {Collection, Product} from '@cloudcart/nitrogen';
import {splitBrandName, formatMoney, getColor} from '~/lib/product';
import {cdnSize, onImgErrorToBase} from '~/lib/img';
import {SELECTIONS} from '~/lib/selections';

export const meta: Route.MetaFunction = () =>
  getSeoMeta({title: 'Premium — Opticlasa', description: 'Premium колекция очила от водещите световни марки.'});

export async function loader({context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const byHandles = (hs: string[]) =>
    Promise.all(hs.map((h) => ctx.storefront.getProduct(h).catch(() => null))).then((a) => a.filter(Boolean) as Product[]);
  const [products, collections, womenProducts, menProducts] = await Promise.all([
    ctx.storefront.getProducts(30).catch(() => [] as Product[]),
    ctx.storefront.getCollections(8).catch(() => [] as Collection[]),
    byHandles(SELECTIONS['premium-kolekciya-jeni'].products.slice(0, 5)),
    byHandles(SELECTIONS['premium-kolekciya-maje'].products.slice(0, 5)),
  ]);
  return {products, collections, womenProducts, menProducts};
}

/* ─────────────────────── assets ─────────────────────── */
type HeroSlide = {img: string; mobileImg?: string; eyebrow: string; title: string; to: string; video?: string; hold?: number};
const HERO_SLIDES: HeroSlide[] = [
  {img: 'https://cdncloudcart.com/74980/files/image/slide-premium.jpg?1785130808', mobileImg: 'https://cdncloudcart.com/74980/files/image/slide-premiumm2.jpg?1785221177', eyebrow: 'Нова колекция', title: 'PREMIUM\nСЕЛЕКЦИЯ', to: '/selection/premium-kolekciya'},
];

type CatBanner = {img: string; label: string; to: string; video?: string};
const CAT_BANNERS: CatBanner[] = [
  {img: 'https://cdncloudcart.com/74980/files/image/cat2.jpg?1785134922', label: 'Жени', to: '/selection/premium-kolekciya-jeni'},
  {img: 'https://cdncloudcart.com/74980/files/image/cat3.jpg?1785134923', label: 'Мъже', to: '/selection/premium-kolekciya-maje'},
];

const FEATURE = {
  img: 'https://cdncloudcart.com/74980/files/image/pr-img-01b.jpg?1784888193',
  to: '/products/carolina-lemke-cl1790-16',
  brand: 'Carolina Lemke',
  name: 'CL1790 16',
};

const CARTIER = 'https://cdncloudcart.com/72223/files/image/cartier.jpg?1781055838';
const SHOPS = 'https://cdncloudcart.com/72223/files/image/shops.jpg?1781055742';
const CONTACTS = 'https://cdncloudcart.com/72223/files/image/contacts-1.jpg?1781056147';

// Brand logos — ONLY vendors that have an uploaded logo in the store.
// Sourced from the store's vendor data; add new entries here as more logos go up.
const VENDORS_BASE = 'https://yasoo-opticlasa.cloudcart.net/cdn/img/vendors';
const BRAND_LOGOS = [
  {name: 'Ray-Ban', handle: 'ray-ban-1', img: '123/123.png'},
  {name: 'Cartier', handle: 'cartier', img: '41/41.png'},
  {name: 'Prada', handle: 'prada', img: '80/80.png'},
  {name: 'Gucci', handle: 'gucci', img: '56/56.png'},
  {name: 'Tom Ford', handle: 'tom-ford', img: '88/88.png'},
  {name: 'Saint Laurent', handle: 'saint-laurent', img: '87/87.png'},
  {name: 'Chopard', handle: 'chopard', img: '42/42.webp'},
  {name: 'Carolina Herrera', handle: 'carolina-herrera', img: '36/36.png'},
  {name: 'Dita', handle: 'dita', img: '100/100.png'},
  {name: 'Etro', handle: 'etro', img: '53/53.png'},
  {name: 'Carrera', handle: 'carrera', img: '39/39.png'},
  {name: 'Police', handle: 'police', img: '114/114.png'},
];

/* ── shared bits ── */
const ARROW = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
const PILL_WHITE = 'inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-white';
const PILL_DARK = 'inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-[13px] font-medium text-white transition-colors hover:bg-black';

const onSale = (p: any) => {
  const v = p.variants?.nodes?.[0];
  return v?.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount);
};

export default function PremiumPage() {
  const {products, collections, menProducts, womenProducts} = useLoaderData<typeof loader>();

  const womenBest = womenProducts.length >= 4 ? womenProducts : products.slice(5, 9);
  const menBest = menProducts.length >= 4 ? menProducts : products.slice(5, 9);

  return (
    <>
      <Hero />
      <CategoryBanners />
      <BrandsMarquee />
      {womenBest.length >= 4 && <Bestsellers products={womenBest} to="/selection/premium-kolekciya-jeni" feature={{img: 'https://cdncloudcart.com/74980/files/image/pr-img-02.jpg?1785139948', name: 'DITA AEOVA A - 01', brand: 'Dita', to: '/products/dita-aeova-a-01', price: '894.76 €'}} />}
      <CartierBanner img="https://cdncloudcart.com/74980/files/image/bg-003b.jpg?1785136812" heightClass="h-[900px]" overlay={false} dark raise={30} titleSize="text-[clamp(30px,4vw,70px)]" parallax mobileLight eyebrow="Нова колекция" title={'DITA PREMIUM\nCOLLECTION'} to="/search?q=DITA" />
      {menBest.length >= 4 && <Bestsellers products={menBest} title={'Избрани модели\nза мъже'} to="/selection/premium-kolekciya-maje" feature={{img: 'https://cdncloudcart.com/74980/files/image/pr-img-03.jpg?1785140632', name: 'David Beckham DB 1199', brand: 'David Beckham', to: '/products/david-beckham-db-1199gs-kb73o', price: '276.10 €'}} />}
      <StickyFeatures />
      <Newsletter />
    </>
  );
}

/* ─────────────── HERO — rotating campaign carousel ─────────────── */
function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const hold = HERO_SLIDES[i].hold ?? 6000;
    const id = setTimeout(() => setI((p) => (p + 1) % HERO_SLIDES.length), hold);
    return () => clearTimeout(id);
  }, [i]);
  return (
    <section className="relative h-[420px] overflow-hidden bg-hero md:h-[800px]">
      {HERO_SLIDES.map((s, idx) => (
        <div key={idx} className={`absolute inset-0 transition-opacity duration-[1100ms] ease-out ${idx === i ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          {s.video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src={s.video}
              poster={s.img}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <>
              <div className="absolute inset-0 bg-cover bg-center md:hidden" style={{backgroundImage: `url('${s.mobileImg || s.img}')`}} />
              <div className="absolute inset-0 hidden bg-cover bg-center md:block" style={{backgroundImage: `url('${s.img}')`}} />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-6 left-[6vw] max-w-[640px] md:bottom-[12vh]">
            <span className="mb-4 block font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">{s.eyebrow}</span>
            <h1 className="whitespace-pre-line font-display text-[clamp(40px,6.5vw,82px)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-white">{s.title}</h1>
          </div>
        </div>
      ))}
      {/* indicators */}
      {HERO_SLIDES.length > 1 && (
        <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
          {HERO_SLIDES.map((_, idx) => (
            <button key={idx} type="button" aria-label={`Слайд ${idx + 1}`} onClick={() => setI(idx)} className={`h-[3px] rounded-full transition-all duration-300 ${idx === i ? 'w-8 bg-white' : 'w-4 bg-white/45 hover:bg-white/70'}`} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────── CATEGORY BANNERS — sunglasses / optical ─────────────── */
function CategoryBanners() {
  return (
    <div className="grid gap-0.5 md:grid-cols-2">
      {CAT_BANNERS.map((b) => (
        <Link key={b.label} to={b.to} prefetch="intent" className="group relative block h-[68vh] min-h-[460px] overflow-hidden bg-panel">
          {b.video ? (
            <video
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              src={b.video}
              poster={b.img}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          ) : (
            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" style={{backgroundImage: `url('${b.img}')`}} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-5 p-9">
            <div>
              <span className="mb-3 block font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">Премиум колекция</span>
              <span className="block font-display text-[34px] sm:text-[48px] lg:text-[60px] font-black uppercase leading-none tracking-[-0.01em] text-white">{b.label}</span>
            </div>
            <span className={`${PILL_WHITE} pointer-events-none`}>Разгледай {ARROW}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─────────────── PRODUCT SHOWCASE — tabbed 5-card rail ─────────────── */
function ProductShowcase({title, to, products}: {title: string; to: string; products: Product[]}) {
  const rail = useRef<HTMLDivElement>(null);
  const step = (d: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({left: d * el.clientWidth * 0.8, behavior: 'smooth'});
  };
  return (
    <section className="bg-paper py-20">
      {/* header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 px-10">
        <h2 className="font-display text-[clamp(20px,2.6vw,30px)] font-extrabold uppercase tracking-[-0.015em] text-ink">{title}</h2>
        <div className="flex items-center gap-5">
          <Link to={to} className="hidden items-center gap-1.5 border-b border-ink/30 pb-0.5 font-sans text-[13px] font-medium text-ink transition-colors hover:border-ink sm:inline-flex">
            Виж всички {ARROW}
          </Link>
          <div className="hidden items-center gap-2 sm:flex">
            <button type="button" onClick={() => step(-1)} aria-label="Назад" className="flex size-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg></button>
            <button type="button" onClick={() => step(1)} aria-label="Напред" className="flex size-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></button>
          </div>
        </div>
      </div>
      {/* card rail */}
      <div ref={rail} className="scrollbar-none flex gap-4 overflow-x-auto scroll-smooth px-10">
        {products.map((p) => (
          <div key={p.id} className="w-[76%] shrink-0 sm:w-[44%] md:w-[30%] lg:w-[calc((100%-4*1rem)/5)]">
            <ShowcaseCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ShowcaseCard({product}: {product: Product}) {
  const p = product as any;
  const {brand, name} = splitBrandName(product);
  const img = cdnSize(p.featuredImage?.url, 600);
  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex flex-col bg-[#f5f5f5] text-inherit">
      <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
        {img ? (
          <img src={img} alt={product.title} loading="lazy" onError={onImgErrorToBase} className="h-full w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <img src="/noimage.svg" alt={product.title} className="h-full w-full object-contain p-6" />
        )}
        {onSale(p) && <span className="absolute left-3 top-3 rounded-full bg-red px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">Промо</span>}
      </div>
      <div className="px-4 pb-4 pt-[11px]">
        <div className="font-display text-[15px] font-semibold uppercase leading-[1.2] tracking-[0.01em] text-ink">{brand || name}</div>
        {brand && name && <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-mid">{name}</div>}
        <div className="mt-1.5 text-[14px] font-medium text-ink">{formatMoney(product.priceRange?.minVariantPrice)}</div>
      </div>
    </Link>
  );
}

/* ─────────────── BRANDS — slow infinite marquee of logotypes ─────────────── */
function BrandsMarquee() {
  if (BRAND_LOGOS.length === 0) return null;
  const row = [...BRAND_LOGOS, ...BRAND_LOGOS];
  return (
    <section className="-mb-0.5 bg-off py-12">
      <div className="mb-8 text-center font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-mid">Премиум марки, на които вярвате</div>
      <div className="group/marquee relative overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-off to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-off to-transparent" />
        <div className="animate-marquee flex w-max items-center gap-[50px] whitespace-nowrap" style={{animationDuration: '55s'}}>
          {row.map((b, i) => (
            <Link
              key={`${b.handle}-${i}`}
              to={`/search?q=${encodeURIComponent(b.name)}`}
              aria-label={b.name}
              className="flex h-[87px] w-[150px] shrink-0 items-center justify-center opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <img
                src={`${VENDORS_BASE}/${b.img}?width=380&v=2`}
                alt={b.name}
                loading="lazy"
                className="w-full object-contain"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── BESTSELLERS — A&T asymmetric mosaic ─────────────── */
/* 3-col / 3-row grid: title cell (top-left), two products (top), one BIG
   featured product (col 1-2, rows 2-3), two small products (right column). */
function MosaicCard({product, big = false}: {product: Product; big?: boolean}) {
  const {brand, name} = splitBrandName(product);
  const colour = getColor(product);
  const img = cdnSize((product as any).featuredImage?.url, big ? 1000 : 900);
  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex h-full flex-col bg-paper text-inherit">
      <div className="min-h-0 flex-1">
        {img ? (
          <img src={img} alt={product.title} loading="lazy" onError={onImgErrorToBase} className={`h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.05] ${big ? 'p-8' : 'p-4'}`} />
        ) : <img src="/noimage.svg" alt={product.title} className="h-full w-full object-contain p-4" />}
      </div>
      <div className="px-5 pb-5">
        <div className={`font-display font-medium tracking-[-0.01em] text-ink ${big ? 'text-[20px]' : 'text-[15px]'}`}>{name}</div>
        <div className="mt-0.5 font-sans text-[12px] font-light text-mid">{[brand, colour].filter(Boolean).join(' · ')}</div>
        <div className="mt-1.5 text-[14px] font-medium text-ink">{formatMoney((product as any).priceRange?.minVariantPrice)}</div>
      </div>
    </Link>
  );
}

function Bestsellers({products, title = 'Избрани модели\nза жени', to = '/products', feature = FEATURE}: {products: Product[]; title?: string; to?: string; feature?: {img: string; name: string; brand: string; to: string; price?: string}}) {
  const [a, b, c, d] = products; // a,b = top row · c,d = right column · big = Carolina Lemke feature
  return (
    <section className="bg-off">
      <div className="grid grid-cols-2 gap-0.5 [grid-auto-rows:minmax(0,20rem)] lg:grid-cols-3 lg:[grid-auto-rows:minmax(0,30rem)]">
        {/* title cell */}
        <div className="flex flex-col items-start justify-center gap-5 bg-paper px-5 py-8 md:p-8">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-red">Premium</span>
          <h2 className="whitespace-pre-line font-display text-[clamp(26px,3.2vw,40px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink">{title}</h2>
          <Link to={to} className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-red">Разгледай {ARROW}</Link>
        </div>
        {a && <div><MosaicCard product={a} /></div>}
        {b && <div><MosaicCard product={b} /></div>}
        {c && <div><MosaicCard product={c} /></div>}
        {d && <div><MosaicCard product={d} /></div>}
        {/* feature — normal-size cell (bottom-right) */}
        <Link to={feature.to} prefetch="intent" className="group flex h-full flex-col bg-paper text-inherit">
          <div className="min-h-0 flex-1 overflow-hidden">
            <img src={feature.img} alt={`${feature.brand} ${feature.name}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]" />
          </div>
          <div className="px-5 pb-5">
            <div className="font-display text-[15px] font-medium tracking-[-0.01em] text-ink">{feature.name}</div>
            <div className="mt-0.5 font-sans text-[12px] font-light text-mid">{feature.brand}</div>
            <div className="mt-1.5 text-[14px] font-medium text-ink">{feature.price}</div>
          </div>
        </Link>
      </div>
    </section>
  );
}

/* ─────────────── STICKY FEATURES — sticky left, scrolling right list ─────────────── */
const FEATURES = [
  {title: '34 магазина', text: '34 физически магазина в цялата страна. Заповядайте за професионална консултация и грижа за вашето зрение.'},
  {title: 'Безплатна доставка', text: 'Всяка поръчка се изпраща напълно безплатно до адрес в цялата страна с куриер Speedy. Доставката е до 2 работни дни след потвърждение.'},
  {title: 'Пробвай преди да купиш', text: 'При доставка куриерът изчаква да пробвате модела. Ако не ви хареса, връщате го веднага — безплатно и без притеснения.'},
  {title: 'Гарантирана автентичност', text: 'Всички продукти в Opticlasa са 100% оригинални. Верига с над 20 години доказано качество и надеждност на българския пазар.'},
  {title: '2 години гаранция', text: 'Две години гаранция срещу фабрични дефекти. Включва и безплатна поддръжка — наносници, накрайници, винтове и ултразвуково почистване.'},
];
const FEATURE_ICONS = [
  <img key="s" src="https://cdncloudcart.com/74980/files/image/icons-05.svg?1785141821" alt="" />,
  <img key="0" src="https://cdncloudcart.com/74980/files/image/icons-01.svg" alt="" />,
  <img key="1" src="https://cdncloudcart.com/74980/files/image/icons-02.svg" alt="" />,
  <img key="2" src="https://cdncloudcart.com/74980/files/image/icons-03.svg" alt="" />,
  <img key="3" src="https://cdncloudcart.com/74980/files/image/icons-04.svg" alt="" />,
];
function StickyFeatures() {
  return (
    <section className="bg-[#f5f5f5]">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 px-10 py-20 sm:grid-cols-3 lg:grid-cols-5">
        {FEATURES.map((f, i) => (
          <div key={f.title} className="flex flex-col items-center gap-3 text-center">
            <div className="text-ink">{FEATURE_ICONS[i]}</div>
            <h3 className="font-display text-[19px] font-semibold tracking-[-0.01em] text-ink">{f.title}</h3>
            <p className="max-w-[280px] font-sans text-[14px] leading-relaxed text-mid">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────── CARTIER — premium editorial banner ─────────────── */
function CartierBanner({img = CARTIER, heightClass = 'h-[64vh] min-h-[440px]', overlay = true, dark = false, raise = 0, titleSize = 'text-[clamp(30px,4vw,56px)]', parallax = false, eyebrow = 'Premium · Cartier', title = 'Cartier\nCollection', to = '/search?q=Cartier', mobileLight = false}: {img?: string; heightClass?: string; overlay?: boolean; dark?: boolean; raise?: number; titleSize?: string; parallax?: boolean; eyebrow?: string; title?: string; to?: string; mobileLight?: boolean}) {
  const bgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!parallax) return;
    const bg = bgRef.current;
    const el = bg?.parentElement;
    if (!bg || !el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const posY = Math.max(0, Math.min(100, 50 + offset * 0.15));
      bg.style.backgroundPosition = `50% ${posY}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [parallax]);
  return (
    <Link to={to} className={`group relative mt-0.5 block overflow-hidden bg-panel ${heightClass}`}>
      <div
        ref={bgRef}
        className={parallax
          ? 'pointer-events-none absolute inset-0 bg-cover will-change-[background-position]'
          : 'absolute inset-0 bg-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]'}
        style={{backgroundImage: `url('${img}')`, backgroundPosition: '50% 10%'}}
      />
      {overlay && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
        </>
      )}
      <div className="absolute inset-x-0 flex flex-col items-start gap-4 p-10" style={{bottom: `${raise}px`}}>
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-red">{eyebrow}</span>
        <h2 className={`whitespace-pre-line font-display ${titleSize} font-extrabold uppercase leading-[1.0] tracking-[-0.02em] ${mobileLight ? (dark ? 'text-white md:text-ink' : 'text-white') : dark ? 'text-ink' : 'text-white'}`}>{title}</h2>
        <span className={`pointer-events-none inline-flex items-center gap-2 rounded-full px-6 py-3 font-sans text-[13px] font-medium ${mobileLight ? (dark ? 'bg-white text-ink md:bg-ink md:text-white' : 'bg-white text-ink') : dark ? 'bg-ink text-white' : 'bg-white text-ink'}`}>Виж колекцията {ARROW}</span>
      </div>
    </Link>
  );
}

/* ─────────────── STORES + CONTACT LENSES ─────────────── */
function StoreAndContacts() {
  return (
    <div className="mt-0.5 grid gap-0.5 md:grid-cols-2">
      {/* shops / find a store */}
      <Link to="/pages/contact" className="group relative block h-[58vh] min-h-[420px] overflow-hidden bg-panel">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" style={{backgroundImage: `url('${SHOPS}')`}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-10">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Намери магазин</span>
          <div className="flex items-end gap-3">
            <span className="font-display text-[clamp(56px,8vw,96px)] font-extrabold leading-[0.8] tracking-[-0.03em] text-red">34</span>
            <span className="pb-2 font-display text-[clamp(20px,2.4vw,30px)] font-extrabold uppercase leading-[1.0] tracking-[-0.01em] text-white">магазина<br />в България</span>
          </div>
          <span className={`${PILL_WHITE} pointer-events-none mt-1`}>Намери най-близкия {ARROW}</span>
        </div>
      </Link>
      {/* contact lenses */}
      <Link to="/pages/contact" className="group relative block h-[58vh] min-h-[420px] overflow-hidden bg-panel">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" style={{backgroundImage: `url('${CONTACTS}')`}} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-10 text-center">
          <h2 className="font-display text-[clamp(28px,3.8vw,48px)] font-extrabold uppercase leading-[1.02] tracking-[-0.015em] text-white">Поръчка на<br />контактни лещи</h2>
          <span className="font-sans text-[14px] font-light tracking-[0.1em] text-white/85">и разтвори</span>
          <span className="pointer-events-none inline-flex items-center gap-2 rounded-full border border-white px-8 py-3 font-sans text-[13px] font-medium uppercase tracking-[0.06em] text-white transition-colors group-hover:bg-white group-hover:text-ink">Поръчай {ARROW}</span>
        </div>
      </Link>
    </div>
  );
}

/* ─────────────── NEWSLETTER ─────────────── */
function Newsletter() {
  return (
    <section className="flex flex-col items-center gap-6 bg-paper px-10 py-24 text-center">
      <h2 className="max-w-[560px] font-display text-[clamp(24px,3.4vw,42px)] font-bold uppercase leading-[1.1] tracking-[-0.02em] text-ink">
        Абонирай се за новостите
      </h2>
      <form className="flex w-full max-w-[480px] flex-col gap-2.5 sm:flex-row sm:gap-0 sm:overflow-hidden sm:rounded-full sm:border sm:border-line sm:bg-white" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Вашият имейл адрес" className="flex-1 rounded-full border border-line bg-white px-6 py-3.5 font-sans text-[14px] text-ink outline-none placeholder:text-[#aaa] sm:rounded-none sm:border-0 sm:bg-transparent" />
        <button type="submit" className="rounded-full bg-ink px-6 py-3.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-red sm:m-1 sm:py-2.5">Абонирай се</button>
      </form>
      <p className="max-w-[420px] font-sans text-[12px] font-light leading-relaxed text-mid">
        С абонирането се съгласявате с нашата <Link to="/policies" className="border-b border-mid/40 hover:border-mid">политика за поверителност</Link>.
      </p>
    </section>
  );
}
