import {Link, useLoaderData} from 'react-router';
import {useEffect, useRef, useState} from 'react';
import type {Route} from './+types/_index';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';
import type {Collection, Product} from '@cloudcart/nitrogen';
import {splitBrandName, formatMoney, getColor} from '~/lib/product';
import {cdnSize, onImgErrorToBase} from '~/lib/img';

export const meta: Route.MetaFunction = () =>
  getSeoMeta({title: 'Opticlasa — Очила от водещи марки', description: 'Слънчеви очила и диоптрични рамки от Cartier, Gucci, Tom Ford, Ray-Ban и още 50+ марки.'});

export async function loader({context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const [products, collections] = await Promise.all([
    ctx.storefront.getProducts(30).catch(() => [] as Product[]),
    ctx.storefront.getCollections(8).catch(() => [] as Collection[]),
  ]);
  return {products, collections};
}

/* ─────────────────────── assets ─────────────────────── */
type HeroSlide = {img: string; eyebrow: string; title: string; to: string; video?: string; hold?: number};
const HERO_SLIDES: HeroSlide[] = [
  {img: 'https://cdncloudcart.com/74980/files/image/slide2.jpg?1784638750', eyebrow: 'Нова колекция', title: 'Eyewear by\nDavid Beckham', to: '/search?q=David%20Beckham'},
  {img: 'https://cdncloudcart.com/72223/files/image/etro-zephyr.jpg?1781002900', video: 'https://cdncloudcart.com/74980/files/video/32-adv-ss26-video-16-9.mp4?1784637245', hold: 12000, eyebrow: 'Нова колекция', title: 'CHOPARD\nEYEWEAR', to: '/collections/slanchevi-ochila?vendor=chopard'},
  {img: 'https://cdncloudcart.com/74980/files/image/slide3.jpg?1784873484', eyebrow: 'Нова колекция', title: 'Carolina\nHerrera', to: '/search?q=Carolina%20Herrera'},
];

const CAT_BANNERS = [
  {img: 'https://cdncloudcart.com/72223/files/image/sun.jpg?1781058284', label: 'Слънчеви очила', to: '/collections/slanchevi-ochila'},
  {img: 'https://cdncloudcart.com/72223/files/image/diopt.jpg?1781058286', label: 'Диоптрични рамки', to: '/collections/optical-glasses'},
];

const FEATURE = {
  img: 'https://js4nc.cloudcart.net/cdn/img/products/559/carolina-lemke-cl1790-16-6a27fdc3ee6fd.jpeg?width=1100&height=1100&v=1781005764',
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
  {name: 'Tom Ford', handle: 'tom-ford', img: '88/88.png'},
  {name: 'Saint Laurent', handle: 'saint-laurent', img: '87/87.png'},
  {name: 'Chopard', handle: 'chopard', img: '42/42.webp'},
  {name: 'Carolina Herrera', handle: 'carolina-herrera', img: '36/36.png'},
  {name: 'David Beckham', handle: 'david-beckham', img: '45/45.png'},
  {name: 'Etro', handle: 'etro', img: '53/53.png'},
  {name: 'Carrera', handle: 'carrera', img: '39/39.png'},
  {name: 'Police', handle: 'police', img: '114/114.png'},
];

/* ── shared bits ── */
const ARROW = (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);
const PILL_WHITE = 'inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-sans text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-white';

const onSale = (p: any) => {
  const v = p.variants?.nodes?.[0];
  return v?.compareAtPrice && parseFloat(v.compareAtPrice.amount) > parseFloat(v.price.amount);
};

export default function Homepage() {
  const {products, collections} = useLoaderData<typeof loader>();

  const newest = products.slice(0, 5);
  const best = products.slice(5, 10).length >= 3 ? products.slice(5, 10) : products.slice(0, 5);
  const disc = products.filter(onSale).slice(0, 5);
  const discounted = disc.length >= 3 ? disc : products.slice(10, 15);

  const tabs = [
    {key: 'new', label: 'Нови', to: '/products', products: newest},
    {key: 'best', label: 'Най-продавани', to: '/products', products: best},
    {key: 'sale', label: 'Промоции', to: '/products', products: discounted},
  ].filter((t) => t.products.length > 0);

  return (
    <>
      <Hero />
      <BrandsMarquee />
      <CategoryBanners />
      {tabs.length > 0 && <ProductShowcase tabs={tabs} />}
      {products.length >= 4 && <Bestsellers products={products.slice(5, 9)} />}
      <CartierBanner />
      <StoreAndContacts />
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
    <section className="relative h-[86vh] min-h-[580px] overflow-hidden bg-hero">
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
            <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${s.img}')`}} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-[12vh] left-[6vw] max-w-[640px]">
            <span className="mb-4 block font-sans text-[11px] font-semibold uppercase tracking-[0.24em] text-white/85">{s.eyebrow}</span>
            <h1 className="mb-8 whitespace-pre-line font-display text-[clamp(40px,6.5vw,82px)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-white">{s.title}</h1>
            <Link to={s.to} className={PILL_WHITE}>Разгледай {ARROW}</Link>
          </div>
        </div>
      ))}
      {/* indicators */}
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 items-center gap-2.5">
        {HERO_SLIDES.map((_, idx) => (
          <button key={idx} type="button" aria-label={`Слайд ${idx + 1}`} onClick={() => setI(idx)} className={`h-[3px] rounded-full transition-all duration-300 ${idx === i ? 'w-8 bg-white' : 'w-4 bg-white/45 hover:bg-white/70'}`} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────── CATEGORY BANNERS — sunglasses / optical ─────────────── */
function CategoryBanners() {
  return (
    <div className="mt-0.5 grid gap-0.5 md:grid-cols-2">
      {CAT_BANNERS.map((b) => (
        <Link key={b.label} to={b.to} prefetch="intent" className="group relative block h-[58vh] min-h-[400px] overflow-hidden bg-panel">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]" style={{backgroundImage: `url('${b.img}')`}} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-9">
            <span className="font-display text-[clamp(22px,2.6vw,32px)] font-bold uppercase tracking-[-0.01em] text-white">{b.label}</span>
            <span className={`${PILL_WHITE} pointer-events-none`}>Разгледай {ARROW}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─────────────── PRODUCT SHOWCASE — tabbed 5-card rail ─────────────── */
type Tab = {key: string; label: string; to: string; products: Product[]};
function ProductShowcase({tabs}: {tabs: Tab[]}) {
  const [active, setActive] = useState(tabs[0].key);
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  const rail = useRef<HTMLDivElement>(null);
  const step = (d: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({left: d * el.clientWidth * 0.8, behavior: 'smooth'});
  };
  return (
    <section className="bg-paper py-20">
      {/* tab header */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 px-10">
        <div className="flex items-end gap-8">
          {tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setActive(t.key)} className={`relative pb-2.5 font-display text-[clamp(20px,2.6vw,30px)] font-extrabold uppercase tracking-[-0.015em] transition-colors ${active === t.key ? 'text-ink' : 'text-[#c4c4c4] hover:text-mid'}`}>
              {t.label}
              <span className={`absolute inset-x-0 bottom-0 h-[3px] origin-left bg-red transition-transform duration-300 ${active === t.key ? 'scale-x-100' : 'scale-x-0'}`} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-5">
          <Link to={tab.to} className="hidden items-center gap-1.5 border-b border-ink/30 pb-0.5 font-sans text-[13px] font-medium text-ink transition-colors hover:border-ink sm:inline-flex">
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
        {tab.products.map((p) => (
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
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex flex-col text-inherit">
      <div className="relative aspect-square overflow-hidden bg-white">
        {img ? (
          <img src={img} alt={product.title} loading="lazy" onError={onImgErrorToBase} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <img src="/noimage.svg" alt={product.title} className="h-full w-full object-contain p-6" />
        )}
        {onSale(p) && <span className="absolute left-3 top-3 rounded-full bg-red px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">Промо</span>}
      </div>
      <div className="mt-[11px]">
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
    <section className="bg-off pt-12 pb-0">
      <div className="mb-8 text-center font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-mid">Марки, на които вярвате</div>
      <div className="group/marquee relative overflow-hidden">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-off to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-off to-transparent" />
        <div className="animate-marquee flex w-max items-center gap-6 whitespace-nowrap" style={{animationDuration: '55s'}}>
          {row.map((b, i) => (
            <Link
              key={`${b.handle}-${i}`}
              to={`/search?q=${encodeURIComponent(b.name)}`}
              aria-label={b.name}
              className="flex h-16 w-[190px] shrink-0 items-center justify-center opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <img
                src={`${VENDORS_BASE}/${b.img}?width=300&height=300`}
                alt={b.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
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
  const img = cdnSize((product as any).featuredImage?.url, big ? 800 : 500);
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
      </div>
    </Link>
  );
}

function Bestsellers({products}: {products: Product[]}) {
  const [a, b, c, d] = products; // a,b = top row · c,d = right column · big = Carolina Lemke feature
  return (
    <section className="bg-off">
      <div className="grid grid-cols-2 gap-0.5 lg:grid-cols-3 lg:grid-rows-3 lg:[grid-template-rows:repeat(3,minmax(0,17rem))]">
        {/* title cell */}
        <div className="flex flex-col items-start justify-center gap-5 bg-paper p-8 lg:col-start-1 lg:row-start-1">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-red">Акценти</span>
          <h2 className="font-display text-[clamp(26px,3.2vw,40px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink">Избрани<br />модели</h2>
          <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-red">Разгледай {ARROW}</Link>
        </div>
        {a && <div className="lg:col-start-2 lg:row-start-1"><MosaicCard product={a} /></div>}
        {b && <div className="lg:col-start-3 lg:row-start-1"><MosaicCard product={b} /></div>}
        {/* BIG feature — Carolina Lemke, same A&T card style (product on white) */}
        <Link to={FEATURE.to} prefetch="intent" className="group flex h-full flex-col bg-paper text-inherit lg:col-start-1 lg:row-start-2 lg:col-span-2 lg:row-span-2">
          <div className="min-h-0 flex-1">
            <img src={FEATURE.img} alt={`${FEATURE.brand} ${FEATURE.name}`} loading="lazy" className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover:scale-[1.05]" />
          </div>
          <div className="px-5 pb-5">
            <div className="font-display text-[20px] font-medium tracking-[-0.01em] text-ink">{FEATURE.name}</div>
            <div className="mt-0.5 font-sans text-[12px] font-light text-mid">{FEATURE.brand}</div>
          </div>
        </Link>
        {c && <div className="lg:col-start-3 lg:row-start-2"><MosaicCard product={c} /></div>}
        {d && <div className="lg:col-start-3 lg:row-start-3"><MosaicCard product={d} /></div>}
      </div>
    </section>
  );
}

/* ─────────────── CARTIER — premium editorial banner ─────────────── */
function CartierBanner() {
  return (
    <Link to="/search?q=Cartier" className="group relative mt-0.5 block h-[64vh] min-h-[440px] overflow-hidden bg-panel">
      <div className="absolute inset-0 bg-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]" style={{backgroundImage: `url('${CARTIER}')`, backgroundPosition: '50% 10%'}} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/15 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-10">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-red">Premium · Cartier</span>
        <h2 className="font-display text-[clamp(30px,4vw,56px)] font-extrabold uppercase leading-[1.0] tracking-[-0.02em] text-white">Cartier<br />Collection</h2>
        <span className={`${PILL_WHITE} pointer-events-none`}>Виж колекцията {ARROW}</span>
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
      <form className="flex w-full max-w-[480px] overflow-hidden rounded-full border border-line bg-white" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder="Вашият имейл адрес" className="flex-1 bg-transparent px-6 py-3.5 font-sans text-[14px] text-ink outline-none placeholder:text-[#aaa]" />
        <button type="submit" className="m-1 rounded-full bg-ink px-6 py-2.5 font-sans text-[13px] font-medium text-white transition-colors hover:bg-red">Абонирай се</button>
      </form>
      <p className="max-w-[420px] font-sans text-[12px] font-light leading-relaxed text-mid">
        С абонирането се съгласявате с нашата <Link to="/policies" className="border-b border-mid/40 hover:border-mid">политика за поверителност</Link>.
      </p>
    </section>
  );
}
