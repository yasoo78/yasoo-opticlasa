import {useLoaderData, data, Link} from 'react-router';
import {useEffect, useState, useRef} from 'react';
import type {Route} from './+types/products.$handle';
import {getContext} from '~/lib/context';
import {getSeoMeta, generateProductJsonLd} from '@cloudcart/nitrogen';
import type {Product} from '@cloudcart/nitrogen';
import {Image, Money, VariantSelector, useOptimisticVariant} from '@cloudcart/nitrogen-react';
import {AddToCartButton} from '~/components/AddToCartButton';
import {WishlistButton} from '~/components/WishlistButton';
import {Eye, ChevronDown, ChevronRight, ChevronLeft, Truck, Glasses, BadgeCheck, MapPin, ArrowLeft, ArrowRight, X, FileText, Info, ShoppingCart} from 'lucide-react';
import {LensEffectModal} from '~/components/LensEffectModal';
import {topChromeBottom} from '~/lib/chrome';

export const meta: Route.MetaFunction = ({data: d}) => {
  const product = d?.product;
  if (!product) return getSeoMeta({title: 'Продукт | Opticlasa'});
  const url = `/products/${product.handle}`;
  return [
    ...getSeoMeta({
      title: product.seo?.title || `${product.title} | Opticlasa`,
      description: product.seo?.description || product.description,
      type: 'product',
      ...(product.featuredImage
        ? {image: {url: product.featuredImage.url, width: product.featuredImage.width, height: product.featuredImage.height}}
        : {}),
    }),
    {'script:ld+json': generateProductJsonLd(product, url)},
  ];
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const product = await ctx.storefront.getProduct(params.handle);
  if (!product) throw data('Product not found', {status: 404});
  const pool = await ctx.storefront.getProducts(16).catch(() => [] as Product[]);
  const related = pool.filter((p) => p.handle !== product.handle);
  return {
    product,
    linkedProducts: (product as any).linkedProducts?.nodes ?? [],
    collections: (product as any).collections?.nodes ?? [],
    related,
  };
}

/* ─── arrows / svg ─── */
const A = (cls = 'h-3 w-3') => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
);

export default function ProductPage() {
  const {product, collections, related} = useLoaderData<typeof loader>();
  const firstVariant = (product as any).variants.nodes[0];
  const {selectedVariant} = useOptimisticVariant(product as any, firstVariant);
  const variant = selectedVariant ?? firstVariant;

  const {brand, name} = splitBrandName(product as any);
  const images = galleryImages(product as any);
  const sameBrand = related.filter((p) => splitBrandName(p).brand === brand).slice(0, 8);
  const moreFromBrand = sameBrand.length >= 3 ? sameBrand : related.slice(0, 8);
  const alsoLike = related.filter((p) => !moreFromBrand.includes(p)).slice(0, 4);

  return (
    <div className="text-ink">
      <StickyBar brand={brand} name={name} variant={variant} />

      {/* ① STAGE — gallery + buy panel */}
      <div id="pdp-stage" className="grid border-t border-line lg:grid-cols-[70fr_30fr] lg:items-start">
        <Gallery images={images} name={name} />
        <BuyPanel product={product as any} variant={variant} brand={brand} name={name} collections={collections} />
      </div>

      <ProductDetails product={product as any} brand={brand} name={name} />
      <CampaignBanner brand={brand} gender={getProp(product as any, /^пол$|gender|за\s*кого/i)} />
      {moreFromBrand.length > 0 && <Carousel title={`Още от ${brand}`} products={moreFromBrand} viewAllTo="/products" />}
      {alsoLike.length > 0 && <Carousel title="Може да харесате и" products={alsoLike} viewAllTo="/products" />}
    </div>
  );
}

/* ───────────────────── STICKY ATC BAR ───────────────────── */
function StickyBar({brand, name, variant}: {brand: string; name: string; variant: any}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const stage = document.getElementById('pdp-stage');
    if (!stage) return;
    const obs = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), {rootMargin: '-50% 0px 0px 0px'});
    obs.observe(stage);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      data-sticky-bar
      className={`fixed bottom-0 left-0 right-0 z-[190] flex h-14 items-center justify-between gap-3 border-t border-white/[0.08] bg-ink px-5 transition-transform duration-300 md:gap-6 md:px-[52px] ${visible ? 'translate-y-0' : 'translate-y-[150%]'}`}
      style={{transitionTimingFunction: 'var(--ease-snap)'}}
    >
      <div className="flex min-w-0 items-center gap-2 md:gap-3.5">
        <span className="shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.02em] text-white">{brand}</span>
        <span className="min-w-0 truncate text-[10px] font-medium uppercase tracking-[0.16em] text-white/50">{name}</span>
        {variant && <span className="shrink-0 font-display text-[13px] font-bold text-red">{fmtEUR(variant.price.amount)}</span>}
      </div>
      {variant && (
        <AddToCartButton
          merchandiseId={variant.id}
          disabled={!variant.availableForSale}
          className="flex shrink-0 items-center justify-center gap-2.5 bg-red px-3.5 py-2.5 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red-dark disabled:opacity-50 md:px-5"
        >
          <ShoppingCart className="h-[18px] w-[18px] md:hidden" strokeWidth={2} />
          <span className="sr-only md:not-sr-only">Добавете в количката</span>
        </AddToCartButton>
      )}
    </div>
  );
}

/* ───────────────────── GALLERY ───────────────────── */
function Gallery({images, name}: {images: string[]; name: string}) {
  const [open, setOpen] = useState(false);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const hero = images[0];
  const rest = images.slice(1);
  const shown = open ? rest : rest.slice(0, 4); // 2 rows of 2 by default
  const hasMore = rest.length > 4;
  const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const c = e.currentTarget.parentElement;
    if (c) c.style.display = 'none';
  };

  return (
    <div className="relative flex flex-col gap-2 bg-white">
      {/* hero — 1 big, wide landscape proportion */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f4f4f4]">
        {hero ? (
          <img src={hero} alt={name} loading="eager" className="h-full w-full object-contain p-8 mix-blend-multiply" onError={(e) => {(e.currentTarget as HTMLImageElement).src = '/noimage.svg'; e.currentTarget.classList.add('opacity-40');}} />
        ) : (
          <img src="/noimage.svg" alt={name} className="h-full w-full object-contain p-16 opacity-40" />
        )}
        <button type="button" onClick={() => setTryOnOpen(true)} className="sheen absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-white px-5 py-3 font-display text-[11px] font-bold uppercase tracking-[0.06em] text-ink shadow-[0_3px_16px_rgba(0,0,0,0.16)] transition-transform hover:scale-105 md:gap-2.5 md:px-6 md:text-[12px] md:tracking-[0.1em] [&>*]:relative [&>*]:z-[2]">
          <Glasses className="h-[18px] w-[18px]" strokeWidth={1.6} />
          <span className="relative z-[2]">Пробвай виртуално</span>
        </button>
      </div>

      {/* rows of 2 squares */}
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {shown.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden bg-[#f4f4f4]">
              <img src={src} alt={`${name} ${i + 2}`} loading="lazy" className="h-full w-full object-contain p-6 mix-blend-multiply" onError={hideOnError} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <button onClick={() => setOpen((o) => !o)} className="mx-auto flex items-center gap-2 py-4 font-display text-[12px] font-bold uppercase tracking-[0.12em] text-ink transition-opacity hover:opacity-60">
          {open ? 'Скрий' : 'Виж повече'}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      <TryOnModal open={tryOnOpen} onClose={() => setTryOnOpen(false)} name={name} />
    </div>
  );
}

/* ───────────────────── VIRTUAL TRY-ON (placeholder — wide drawer, text only for now) ───────────────────── */
function TryOnModal({open, onClose, name}: {open: boolean; onClose: () => void; name: string}) {
  const [topOffset, setTopOffset] = useState(68);
  useEffect(() => {
    if (!open) return;
    setTopOffset(topChromeBottom());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[400]" style={{top: topOffset}} role="dialog" aria-modal="true">
      <div className="animate-fade-in absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full flex-col overflow-hidden bg-white md:w-[50vw]">
        <div className="flex items-center px-6 py-5">
          <button onClick={onClose} className="flex items-center gap-2.5 font-display text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:text-red">
            <ChevronLeft className="h-5 w-5" /> Виртуална проба
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 text-center md:px-14">
          <Glasses className="h-12 w-12 text-ink" strokeWidth={1.2} />
          <div className="mt-5 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-red">Скоро</div>
          <h4 className="mt-2 font-display text-[26px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">Пробвай очилата<br />върху себе си</h4>
          <p className="mt-4 max-w-[440px] text-[15px] font-light leading-relaxed text-mid">
            Съвсем скоро ще можеш да пробваш <span className="text-ink">{name}</span> виртуално — директно през камерата на телефона или компютъра, за да видиш как ти стоят, преди да поръчаш.
          </p>
          <p className="mt-3 max-w-[440px] text-[13px] font-light leading-relaxed text-mid">
            Функцията е в разработка. Междувременно можеш да пробваш модела на живо в някой от нашите магазини.
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ───────────────────── BUY PANEL ───────────────────── */
function BuyPanel({product, variant, brand, name, collections}: {product: Product; variant: any; brand: string; name: string; collections: any[]}) {
  const col = collections?.[0];
  const collectionSub = getProp(product, /колекц|collection|серия/i);
  const frame = getProp(product, /рамка|frame|материал/i);
  const lens = getProp(product, /стъкл|lens|цвят на стъкл/i) || getColor(product);
  const sizeProp = getProp(product, /размер|size/i);
  const dims = parseDims(sizeProp);
  const polar = getProp(product, /поляр|polar/i);
  const material = frame || getProp(product, /материал|material|рамка|frame/i);
  const isPolarized = /поляризиран|polarized|^\s*да|с\s*поляр/i.test(polar) && !/без|неполяр|non[\s-]?polar|^\s*не\b/i.test(polar);
  const [lensOpen, setLensOpen] = useState(false);
  const [tbiOpen, setTbiOpen] = useState(false);
  const [storesOpen, setStoresOpen] = useState(false);
  const colorMap = colorImageMap(product);

  return (
    <div className="flex flex-col px-5 pb-12 pt-8 md:px-10 lg:sticky lg:top-[84px] lg:self-start">
      {/* breadcrumb — sits just above the title */}
      <nav className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-mid" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-ink">Начало</Link>
        {col && <><span className="opacity-40">/</span><Link to={`/collections/${col.handle}`} className="transition-colors hover:text-ink">{col.title}</Link></>}
        <span className="opacity-40">/</span>
        <Link to="/products" className="transition-colors hover:text-ink">{brand}</Link>
        <span className="opacity-40">/</span>
        <span className="font-medium text-ink">{name}</span>
      </nav>
      {/* title + wishlist */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-display text-[28px] font-extrabold uppercase leading-[1.02] tracking-[-0.01em] text-ink">{brand}</div>
          <div className="mt-1.5 text-[13px] font-medium uppercase tracking-[0.16em] text-mid">{name}</div>
        </div>
        <WishlistButton productId={(product as any).id} size="md" className="mt-1 shrink-0 !bg-transparent !shadow-none" />
      </div>
      {collectionSub && <div className="mt-1 text-xs font-light italic text-mid">{collectionSub}</div>}

      {/* price */}
      <div className="mt-4 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold tracking-[-0.01em] text-ink">{variant ? fmtEUR(variant.price.amount) : null}</span>
        {variant && <span className="text-xs font-light text-mid">{fmtBGN(variant.price.amount)}</span>}
      </div>
      {variant && (
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-mid">
          <span className="h-[5px] w-[5px] flex-shrink-0 rounded-full bg-red" />
          От {fmtEUR(parseFloat(variant.price.amount) / 12)}/мес с <button type="button" onClick={() => setTbiOpen(true)} className="border-b border-red/30 font-medium text-red transition-opacity hover:opacity-70">TBI Bank</button> · 12 вноски
        </div>
      )}

      <div className="my-[18px] h-px bg-line" />

      {/* variant options */}
      <VariantSelector product={product as any}>
        {(options: any[]) =>
          options.map(({name: optName, values}: any) => {
            const meta = getOptionMeta(product, optName);
            const isColor = meta.type === 'color' || /цвят|color|цвета/i.test(optName);
            const active = values.find((v: any) => v.isActive);
            if (isColor) {
              return (
                <div key={optName} className="mb-3.5">
                  <div className="mb-3 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-ink">{values.length} цвята</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {values.map((o: any) => {
                      const img = colorMap[o.value];
                      return (
                        <Link
                          key={o.value}
                          to={o.to}
                          preventScrollReset
                          replace
                          title={o.value}
                          className={`aspect-square border bg-white p-1 transition-colors ${o.isActive ? 'border-2 border-ink' : 'border-[1.5px] border-line hover:border-mid'}`}
                          style={img ? {backgroundImage: `url('${img}')`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'} : (meta.values[o.value]?.color ? {backgroundColor: meta.values[o.value].color} : undefined)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            }
            return (
              <div key={optName} className="flex items-center justify-between border-b border-line py-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-ink">{optName}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {values.map((o: any) => (
                      <Link key={o.value} to={o.to} preventScrollReset replace className={`px-2.5 py-1 text-[13px] transition-colors ${o.isActive ? 'bg-ink text-white' : 'text-ink hover:bg-sand'} ${!o.available ? 'text-mid line-through' : ''}`}>{o.value}</Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        }
      </VariantSelector>

      {/* key properties — bold labels, no row dividers (Ray-Ban feel) */}
      <div className="mt-7 flex flex-col gap-2.5">
        {material && (
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[12px] font-bold uppercase tracking-[0.04em] text-ink">Материал</span>
            <span className="text-[14px] text-[#444]">{material}</span>
          </div>
        )}
        <div className="flex items-baseline gap-2.5">
          <span className="font-display text-[12px] font-bold uppercase tracking-[0.04em] text-ink">Поляризация</span>
          <span className="text-[14px] text-[#444]">{isPolarized ? 'Поляризирани' : 'Неполяризирани'}</span>
        </div>
        {isPolarized && (
          <button type="button" onClick={() => setLensOpen(true)} className="mt-0.5 flex w-fit items-center gap-1.5 whitespace-nowrap font-display text-[12px] font-bold uppercase tracking-[0.04em] text-red transition-opacity hover:opacity-70">
            Виж ефекта на поляризация
            <ChevronRight className="h-4 w-4 shrink-0" strokeWidth={2} />
          </button>
        )}
      </div>
      <div className="mt-6 border-t border-line" />

      {/* ATC */}
      <div className="mt-7">
        {variant && (
          <AddToCartButton
            merchandiseId={variant.id}
            disabled={!variant.availableForSale}
            className="flex w-full items-center justify-center gap-2.5 bg-ink px-4 py-[18px] font-display text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red disabled:bg-gray-300 disabled:text-gray-500"
          >
            {variant.availableForSale ? 'Добавете в количката' : 'Изчерпан'}
          </AddToCartButton>
        )}
      </div>

      {/* USPs — 3, modern icons, borderless */}
      <div className="mt-8 grid grid-cols-3 gap-2">
        {[
          {Icon: Truck, l1: 'Безплатна', l2: 'доставка'},
          {Icon: Glasses, l1: 'Пробвай', l2: 'преди да купиш'},
          {Icon: BadgeCheck, l1: 'Гарантирана', l2: 'автентичност'},
        ].map(({Icon, l1, l2}) => (
          <div key={l1} className="flex flex-col items-center gap-2.5 text-center">
            <Icon className="h-6 w-6 text-ink" strokeWidth={1.4} />
            <span className="text-[11px] font-medium leading-[1.35] text-mid">{l1}<br />{l2}</span>
          </div>
        ))}
      </div>

      {/* store availability */}
      <div className="mt-6 flex items-center gap-2 text-[13px] text-mid">
        <MapPin className="h-4 w-4 flex-shrink-0 text-red" strokeWidth={1.7} />
        Наличен в магазин — <button type="button" onClick={() => setStoresOpen(true)} className="border-b border-red/30 text-red transition-opacity hover:opacity-70">Намери близо до теб</button>
      </div>

      <LensEffectModal open={lensOpen} onClose={() => setLensOpen(false)} lensName={lens} />
      <TbiModal open={tbiOpen} onClose={() => setTbiOpen(false)} variant={variant} />
      <StoresModal open={storesOpen} onClose={() => setStoresOpen(false)} title={`${brand} ${name}`} />
    </div>
  );
}

/* ───────────────────── PRODUCT DETAILS (grouped from real props, no boxes — ref image #10) ───────────────────── */
function ProductDetails({product, brand, name}: {product: Product; brand: string; name: string}) {
  const raw = (product as any).description?.trim() ?? '';
  // Build readable paragraphs: honour HTML block breaks, repair glued sentences
  // ("...използване.Поляризираните"), then chunk long single blocks into 2-sentence paras.
  let paragraphs = raw
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .split(/\n+/)
    .map((s: string) => s.replace(/\s+/g, ' ').replace(/([.!?;])(?=[A-ZА-Я])/g, '$1 ').trim())
    .filter(Boolean);
  if (paragraphs.length <= 1 && paragraphs[0]) {
    const sentences = paragraphs[0].match(/[^.!?]+[.!?]+(\s|$)/g) ?? [paragraphs[0]];
    paragraphs = [];
    for (let i = 0; i < sentences.length; i += 2) paragraphs.push(sentences.slice(i, i + 2).join(' ').trim());
  }

  // Bucket EVERY scraped property into a group — show the full list we actually have.
  const props: Array<{name: string; values: string[]}> = ((product as any).properties ?? []).filter((p: any) => p?.values?.[0]);
  const pick = (re: RegExp) => props.filter((p) => re.test(p.name));
  const toRows = (list: typeof props): Array<[string, string]> => list.map((p) => [p.name, p.values[0]]);

  const frame = pick(/рамк|форма|дръжк|frame|temple|shape|материал/i);
  const lens = pick(/стъкл|лещ|lens|поляр|polar|uv|категори|покрити|treatment|третир/i);
  const used = new Set([...frame, ...lens].map((p) => p.name));
  const other = props.filter((p) => !used.has(p.name));

  const groups = [
    {Icon: Glasses, title: 'Описание на рамката', rows: toRows(frame)},
    {Icon: Eye, title: 'Информация за стъклата', rows: toRows(lens)},
    {Icon: Info, title: 'Допълнителни характеристики', rows: toRows(other)},
  ].filter((g) => g.rows.length);

  if (!groups.length && !paragraphs.length) return null;

  return (
    <section className="px-5 py-12 md:px-[52px]">
      <h2 className="font-display text-[24px] font-extrabold uppercase tracking-[-0.01em] text-ink sm:text-[30px]">Детайли за продукта</h2>
      <div className="mt-2 text-[12px] font-medium uppercase tracking-[0.08em] text-mid">Модел · {brand} {name}</div>

      <div className="mt-9 grid gap-x-16 gap-y-12 lg:grid-cols-[34%_1fr]">
        {/* description — left column */}
        {paragraphs.length > 0 && (
          <div className="lg:max-w-[440px]">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 shrink-0 text-ink" strokeWidth={1.4} />
              <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink">За продукта</h3>
            </div>
            <div className="mt-3 h-[2px] w-8 bg-red" />
            <div className="mt-4 flex flex-col gap-4 text-[14px] font-light leading-[1.8] text-mid">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        )}
        {/* properties — right column, two columns wide */}
        <div className="grid gap-x-16 gap-y-10 sm:grid-cols-2">
          {groups.map(({Icon, title, rows}) => (
            <div key={title}>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6 shrink-0 text-ink" strokeWidth={1.4} />
                <h3 className="font-display text-[13px] font-bold uppercase tracking-[0.04em] text-ink">{title}</h3>
              </div>
              <div className="mt-3 h-[2px] w-8 bg-red" />
              <dl className="mt-4 flex flex-col gap-2.5">
                {rows.map(([label, value]) => (
                  <div key={label} className="flex items-baseline gap-2.5">
                    <dt className="font-display text-[11px] font-bold uppercase tracking-[0.04em] text-ink">{label}</dt>
                    <dd className="text-[14px] text-[#444]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────── CAMPAIGN BANNER ───────────────────── */
const BANNER_WOMEN = 'https://cdncloudcart.com/74980/files/image/bg-brands-woman.jpg?1785497989';
const BANNER_MEN = 'https://cdncloudcart.com/74980/files/image/bg-brands-man.jpg?1785497989';
const BANNER_KIDS = 'https://cdncloudcart.com/74980/files/image/bg-brands-kids.jpg?1785497988';

// Short brand blurbs shown under the collection title. Keys are normalised
// (lowercase, no spaces/punctuation). Unknown brands fall back to a generic line.
const BRAND_BLURB: Record<string, string> = {
  rayban: 'Ray-Ban е най-разпознаваемата марка слънчеви очила в света, създадена през 1937 г. за пилотите на американските военновъздушни сили. Емблематичните модели Aviator и Wayfarer се превърнаха в символ на стил, носен от поколения икони на киното и музиката. Всеки чифт съчетава безкомпромисно качество на стъклата с надеждна защита и вечен дизайн. Избор за онези, които ценят класиката, преминала проверката на времето.',
  cartier: 'Cartier е синоним на френски лукс и бижутерска прецизност вече повече от век и половина. Очилата на марката се изработват с внимание към най-малкия детайл, често с елементи от благородни метали. Те съчетават безвременна елегантност с усещане за изключителност и статус. Изборът на онези, които не правят компромис с качеството и престижа.',
  gucci: 'Gucci олицетворява смелия дух на съвременната италианска мода и обича да провокира. Очилата на марката се отличават с разпознаваеми детайли, богати цветове и характерния уеб-мотив. Те са изявление за стил, създадено за хора, които искат да се открояват. Лукс с чувство за хумор и безкрайно самочувствие.',
  prada: 'Prada е символ на изчистена италианска елегантност и интелигентен подход към модата. Очилата на марката залагат на модерен минимализъм, качествени материали и характерен, разпознаваем почерк. Дизайнът е сдържан, но винаги с фина, отличаваща детайлност. За ценителите на тихия, изискан лукс.',
  tomford: 'Tom Ford носи името на един от най-влиятелните съвременни дизайнери и излъчва безкомпромисен лукс. Очилата се отличават с изразителни форми, плътни линии и характерния метален детайл „Т". Всеки модел е изработен с внимание към качеството и излъчва увереност и чувственост. Създадени за хора с изявен вкус към модерната елегантност.',
  dita: 'Dita е калифорнийска марка, посветена на луксозните очила от най-висок клас. Всеки модел се изработва почти изцяло на ръка в Япония, с фокус върху съвършенството на детайла. Материалите включват титан, ацетат и авангардни решения, рядко срещани при масовите марки. Изборът на ценители, които търсят ексклузивност и безупречна изработка.',
  persol: 'Persol е италианска марка с богата история, основана през 1917 г. в Торино. Известна е с изключителния комфорт, характерната стрелка Supreme Arrow и патентованите гъвкави рамки. Очилата съчетават занаятчийска изработка с елегантен, вечно актуален дизайн. Любима марка на артисти и ценители на класическия италиански стил.',
  oakley: 'Oakley е синоним на спортна прецизност и технологични иновации. Марката разработва собствени решения за стъкла, които осигуряват изключителна яснота, контраст и защита. Издръжливите, аеродинамични рамки са създадени за активен живот и екстремни условия. Изборът на спортисти и всички, които изискват максимална функционалност.',
  versace: 'Versace е олицетворение на италианския гламур, лукс и смелост. Очилата на марката са ярки, чувствени и украсени с емблематичния мотив Медуза. Всеки модел прави силно впечатление и излъчва богатство и самочувствие. За хора, които обичат да бъдат в центъра на вниманието.',
  dolcegabbana: 'Dolce & Gabbana е израз на италианската страст, чувственост и любов към барока. Очилата на марката са богато украсени, изразителни и пълни с характер. Дизайнът често черпи вдъхновение от средиземноморския дух и сицилианската естетика. За тези, които обичат разкоша и не се страхуват да го покажат.',
  emporioarmani: 'Emporio Armani е по-младата, динамична линия на легендарния Giorgio Armani. Очилата съчетават модерна елегантност с изчистени линии и достъпен лукс. Дизайнът е градски, изискан и подходящ за ежедневието. За стилни хора, които ценят италианското качество без излишен блясък.',
  giorgioarmani: 'Giorgio Armani е еталон за изтънчена италианска елегантност и безупречен вкус. Очилата на марката се отличават със сдържан лукс, чисти линии и превъзходни материали. Всеки детайл е обмислен, за да излъчва спокойна увереност. Избор на хора с изградено чувство за стил.',
  armaniexchange: 'Armani Exchange е младежката, динамична марка от семейството на Armani. Очилата съчетават градски стил, достъпност и разпознаваем модерен дизайн. Създадени са за активни хора, които следят тенденциите. Стил с италиански почерк и енергия за всеки ден.',
  burberry: 'Burberry е британска модна къща с над 160-годишна история и силно наследство. Очилата носят емблематичното каре и излъчват класа с нотка модерност. Изработени са с внимание към качеството и детайла. За ценителите на елегантния британски стил с характер.',
  michaelkors: 'Michael Kors е американска марка, символ на достъпен лукс и нюйоркски усет за мода. Очилата съчетават гламур, модерни форми и разпознаваем блясък. Дизайнът е ефектен, но носим за всеки ден. За хора, които обичат стил с малко бляскавина.',
  hugoboss: 'Hugo Boss е немска марка, синоним на делова елегантност и прецизност. Очилата залагат на изчистен дизайн, качествени материали и сдържан, уверен стил. Подходящи са както за офиса, така и за официални поводи. За мъже и жени с усет към класическата модерност.',
  saintlaurent: 'Saint Laurent е парижка модна къща, символ на шик и рок-елегантност. Очилата на марката са дръзки, безвременни и винаги на ръба на модата. Дизайнът съчетава изисканост с бунтарски дух. За хора с изявен, уверен вкус.',
  tommyhilfiger: 'Tommy Hilfiger е емблема на американския преппи стил. Очилата са свежи, спортно-елегантни и излъчват младежка енергия. Разпознаваемите цветове и качествената изработка ги правят чудесен избор за всеки ден. Класика с американски дух на достъпна цена.',
  guess: 'Guess е марка с младежки, съблазнителен и разпознаваем гламур. Очилата залагат на смели детайли, лога и ефектни форми. Дизайнът е забавен, модерен и винаги привлича вниманието. За тези, които обичат стил с малко дързост.',
  polaroid: 'Polaroid е пионерът в поляризационната технология, с десетилетия опит в защитата на очите. Очилата предлагат надеждна защита от отблясъци и чисто, комфортно виждане. Съчетават проверено качество с достъпна цена и съвременен дизайн. Практичен избор за всеки, който цени доброто зрение.',
  carrera: 'Carrera е легендарна марка със състезателен дух, основана през 1956 г. Очилата се отличават с дързък дизайн, ярки цветове и спортна елегантност. Създадени са за смели, свободолюбиви личности. Икона на стила от миналия век, актуална и днес.',
  police: 'Police е италианска марка с градски, мъжествен и бунтарски характер. Очилата излъчват независимост и увереност, с изчистен, съвременен дизайн. Носени са от редица известни лица по света. За хора със силна индивидуалност.',
  chopard: 'Chopard е швейцарска марка, символ на висок часовникарски и бижутерски лукс. Очилата се изработват с изключителна прецизност и често включват благородни материали. Всеки модел излъчва изтънченост и ексклузивност. За истинските ценители на съвършенството.',
  bvlgari: 'Bvlgari е римска марка с богато бижутерско наследство и разпознаваем гламур. Очилата се превръщат в истинско бижу за лицето, с изящни детайли и смели форми. Дизайнът съчетава италианска чувственост с усещане за лукс. За жени, които обичат да блестят.',
  bulgari: 'Bvlgari е римска марка с богато бижутерско наследство и разпознаваем гламур. Очилата се превръщат в истинско бижу за лицето, с изящни детайли и смели форми. Дизайнът съчетава италианска чувственост с усещане за лукс. За жени, които обичат да блестят.',
  miumiu: 'Miu Miu е игривата, женствена линия на модната къща Prada. Очилата предлагат модерен, малко бунтарски прочит на лукса. Дизайнът е свеж, независим и винаги на крачка пред тенденциите. За младите по дух и стил.',
  marcjacobs: 'Marc Jacobs е нюйоркска марка с чувство за хумор и разпознаваем стил. Очилата съчетават модерен дизайн, забавни детайли и достъпен лукс. Създадени са за креативни, самоуверени личности. Стил с характер и градска енергия.',
  vogue: 'Vogue Eyewear е марка, вдъхновена от подиума и последните модни тенденции. Очилата предлагат модерен, трендов дизайн на достъпна цена. Всеки сезон носи нови форми и цветове в крак с модата. За младите и следящите тенденциите.',
  furla: 'Furla е италианска марка с елегантен, женствен почерк. Очилата се отличават с изчистени линии, качествени материали и фини детайли. Дизайнът е изискан, но носим за всеки ден. За жени с усет към италианския стил.',
  maxmara: 'Max Mara е синоним на изчистена женствена елегантност и качество. Очилата залагат на сдържан дизайн, благородни материали и вечни форми. Всеки модел излъчва спокоен, изискан лукс. За жени с изградено чувство за стил.',
  carolinaherrera: 'Carolina Herrera е марка, олицетворяваща изискана женственост и елегантен маниер. Очилата съчетават класика с латино темперамент и фини детайли. Дизайнът е грациозен, изтънчен и вечен. За жени, които ценят елегантността.',
  jimmychoo: 'Jimmy Choo е символ на гламур, блясък и малко пикантност. Очилата често включват искрящи детайли и ефектни форми. Дизайнът излъчва звезден, вечерен чар. За жени, които обичат да блестят на всяка сцена.',
  montblanc: 'Montblanc е немска марка, символ на дискретен лукс и безупречна изработка. Очилата излъчват сдържана изисканост и внимание към детайла. Материалите и качеството са от най-висок клас. За ценители на тихия, истински лукс.',
  porschedesign: 'Porsche Design пренася инженерната прецизност на автомобилната икона в света на очилата. Дизайнът е функционален, минималистичен и технологичен. Всеки модел съчетава лека конструкция с висока издръжливост. За мъже, които ценят точността и модерната естетика.',
  ralphlauren: 'Ralph Lauren е еталон за американска класика и вечна елегантност. Очилата излъчват аристократичен дух, изисканост и качество. Дизайнът е чист, стилен и подходящ за всеки повод. За хора с усет към класическия, изчистен стил.',
  tiffanyco: 'Tiffany & Co. пренася бижутерската изящност в света на очилата. Моделите често носят емблематичното синьо и фини, женствени детайли. Всеки чифт излъчва изтънченост и лукс. За жени, които ценят елегантността на детайла.',
  moschino: 'Moschino е италианска марка с ексцентричен, закачлив дух. Очилата се отличават със смели, нестандартни детайли и чувство за хумор. Дизайнът е дързък, забавен и провокативен. За хора, които не се страхуват да експериментират.',
  givenchy: 'Givenchy е парижка модна къща, символ на изисканост и модерна елегантност. Очилата съчетават чисти линии с фин, разпознаваем характер. Дизайнът е изтънчен, но със съвременен почерк. За ценителите на френския шик.',
  balenciaga: 'Balenciaga е марка на предела на модата, известна с авангардния си дух. Очилата се отличават със смели, нестандартни форми и силно присъствие. Дизайнът е модерен, градски и провокативен. За смелите, които определят тенденциите.',
  bottegaveneta: 'Bottega Veneta е синоним на тих лукс и безупречен италиански занаят. Очилата залагат на изчистен дизайн без крещящи лога. Качеството на материалите и изработката говори само за себе си. За ценители на дискретната изисканост.',
  hugo: 'HUGO е по-младата, дръзка линия на Hugo Boss. Очилата залагат на модерен, независим стил с характер. Дизайнът е свеж и подходящ за уверени личности. За тези, които следват собствения си път.',
  calvinklein: 'Calvin Klein е символ на американския минимализъм и изчистена естетика. Очилата залагат на чисти линии, семплота и вечна модерност. Дизайнът е сдържан, но винаги стилен. За ценителите на елегантната простота.',
  davidbeckham: 'David Beckham носи името на модната икона и излъчва класически британски стил. Очилата съчетават мъжествен характер с изчистен, съвременен дизайн. Качествената изработка ги прави чудесен избор за всеки ден. За мъже с усет към елегантността.',
  pierrecardin: 'Pierre Cardin е френска марка с дълга история и достъпна елегантност. Очилата залагат на класически форми и качествена изработка. Дизайнът е изчистен, изискан и вечен. Стойностен избор с френски почерк.',
};
function brandBlurb(brand: string): string {
  const key = (brand ?? '').toLowerCase().replace(/[^a-zа-я0-9]/gi, '');
  return BRAND_BLURB[key] ?? `${brand} е марка, която съчетава качествени материали, внимание към детайла и разпознаваем дизайн. Всеки модел е създаден да предложи стил и комфорт при ежедневно носене. Очилата гарантират надеждна защита и дълготрайност. Изборът на онези, които ценят автентичността и доброто качество.`;
}

function CampaignBanner({brand, gender}: {brand: string; gender?: string}) {
  const g = gender ?? '';
  const img = /дет|деца|kid|child|junior/i.test(g) ? BANNER_KIDS : /мъж|men\b|man\b/i.test(g) ? BANNER_MEN : BANNER_WOMEN;
  return (
    <div className="relative overflow-hidden bg-ink">
      <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage: `url('${img}')`}} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="relative flex min-h-[40vh] flex-col justify-end px-5 py-14 md:px-[52px] md:py-16">
        <span className="mb-2.5 block font-display text-[9px] font-bold uppercase tracking-[0.18em] text-red">{brand} · Колекция</span>
        <div className="font-display text-[clamp(26px,3.5vw,46px)] font-extrabold leading-none tracking-[-0.02em] text-white">{brand}<br />Collection</div>
        <p className="mt-4 max-w-[640px] text-[13.5px] font-light leading-relaxed text-white/85 md:text-[15px]">{brandBlurb(brand)}</p>
      </div>
    </div>
  );
}

/* ───────────────────── TBI MODAL (opens from the price line) ───────────────────── */
function TbiModal({open, onClose, variant}: {open: boolean; onClose: () => void; variant: any}) {
  const [topOffset, setTopOffset] = useState(68);
  useEffect(() => {
    if (!open) return;
    setTopOffset(topChromeBottom());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open || !variant) return null;
  const price = parseFloat(variant.price.amount);
  const plans = [6, 12, 18, 25].map((n, i) => {
    const total = price * (1 + i * 0.015);
    return {n, monthly: total / n, total};
  });
  return (
    <div className="fixed inset-x-0 bottom-0 z-[400]" style={{top: topOffset}} role="dialog" aria-modal="true">
      <div className="animate-fade-in absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)]">
        <div className="flex items-center px-6 py-5">
          <button onClick={onClose} className="flex items-center gap-2.5 font-display text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:text-red">
            <ChevronLeft className="h-5 w-5" /> TBI Bank
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-red">Изплащане на вноски</div>
          <h4 className="mb-3 font-display text-[24px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">Вземи сега,<br />плати по-късно</h4>
          <p className="text-[14px] font-light leading-relaxed text-mid">Разплати покупката си на удобни месечни вноски без поръчители. Изберете брой вноски при поръчка.</p>
          <table className="mt-7 w-full border-collapse">
            <thead><tr>{['Вноски', 'Месечна вноска', 'Общо'].map((h) => <th key={h} className="border-b border-line px-2 pb-2.5 text-left font-display text-[10px] font-bold uppercase tracking-[0.08em] text-mid">{h}</th>)}</tr></thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.n} className={p.n === 12 ? 'bg-ink text-white' : ''}>
                  <td className="border-b border-line px-2 py-3 text-[14px]">{p.n} × месеца</td>
                  <td className={`border-b border-line px-2 py-3 text-[14px] ${p.n === 12 ? 'font-display font-bold text-red' : ''}`}>{fmtEUR(p.monthly)}</td>
                  <td className="border-b border-line px-2 py-3 text-[14px]">{fmtEUR(p.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  );
}

/* ───────────────────── STORE AVAILABILITY MODAL ───────────────────── */
// Example data only — the store network doesn't feed real per-model stock yet.
const STORES: Array<{city: string; mall: string; status: 'in' | 'limited'}> = [
  {city: 'София', mall: 'Garitage Park', status: 'in'},
  {city: 'София', mall: 'The Mall', status: 'in'},
  {city: 'София', mall: 'Sky City Mall', status: 'limited'},
  {city: 'Пловдив', mall: 'Plovdiv Plaza Mall', status: 'in'},
  {city: 'Хасково', mall: 'Holiday Park Haskovo', status: 'in'},
];

function StoresModal({open, onClose, title}: {open: boolean; onClose: () => void; title: string}) {
  const [topOffset, setTopOffset] = useState(68);
  useEffect(() => {
    if (!open) return;
    setTopOffset(topChromeBottom());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[400]" style={{top: topOffset}} role="dialog" aria-modal="true">
      <div className="animate-fade-in absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-hidden bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)]">
        <div className="flex items-center px-6 py-5">
          <button onClick={onClose} className="flex items-center gap-2.5 font-display text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:text-red">
            <ChevronLeft className="h-5 w-5" /> Наличност в магазините
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="mb-2 font-display text-[10px] font-bold uppercase tracking-[0.16em] text-red">Наличност</div>
          <h4 className="mb-1 font-display text-[24px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink">Този модел в магазин</h4>
          <p className="text-[13px] font-light text-mid">{title}</p>
          <ul className="mt-6 flex flex-col divide-y divide-line border-y border-line">
            {STORES.map((s, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red" strokeWidth={1.7} />
                  <div>
                    <div className="text-[14px] font-medium text-ink">Магазин {s.city}</div>
                    <div className="text-[13px] text-mid">{s.mall}</div>
                  </div>
                </div>
                {s.status === 'limited' ? (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-[#f7efe0] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#a9791f]">Ограничена наличност</span>
                ) : (
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-[#e9f4ec] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.03em] text-[#2f8a4e]">Наличен</span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-[12px] font-light leading-relaxed text-mid">Наличността е примерна. Обади се на магазина, за да потвърдиш преди посещение.</p>
        </div>
      </aside>
    </div>
  );
}

/* ───────────────────── PRODUCT CARD + CAROUSEL ───────────────────── */
function PdpCard({product}: {product: Product}) {
  const {brand, name} = splitBrandName(product);
  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex flex-col text-inherit">
      <div className="aspect-square overflow-hidden bg-white">
        {product.featuredImage?.url ? <Image data={product.featuredImage} alt={product.title} loading="lazy" className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" /> : <img src="/noimage.svg" alt={product.title} className="h-full w-full object-contain p-6" />}
      </div>
      <div className="pt-3.5">
        <div className="font-display text-[15px] font-bold uppercase leading-[1.15] tracking-[0.01em] text-ink">{brand}</div>
        <div className="mb-1.5 mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-mid">{name}</div>
        <div className="text-[13px] text-mid"><Money data={product.priceRange.minVariantPrice} /></div>
      </div>
    </Link>
  );
}

/**
 * Horizontal product carousel — 3.5 cards visible, big left-aligned title, view-all + arrows
 * top-right, and a scroll-position indicator line that appears on horizontal scroll for 2s.
 */
function Carousel({title, products, viewAllTo = '/products'}: {title: string; products: Product[]; viewAllTo?: string}) {
  const track = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({show: false, w: 25, left: 0});
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const measure = () => {
    const el = track.current;
    if (!el) return;
    const {scrollLeft, clientWidth, scrollWidth} = el;
    const wFrac = scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1;
    const left = scrollWidth > clientWidth ? (scrollLeft / (scrollWidth - clientWidth)) * (1 - wFrac) : 0;
    setBar((b) => ({...b, w: wFrac * 100, left: left * 100}));
  };
  useEffect(() => {
    measure();
  }, []);
  const onScroll = () => {
    measure();
    setBar((b) => ({...b, show: true}));
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setBar((b) => ({...b, show: false})), 2000);
  };
  const step = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({left: dir * el.clientWidth * 0.85, behavior: 'smooth'});
  };
  const hasScroll = bar.w < 99;

  return (
    <section className="px-5 pb-8 pt-9 md:px-[52px]">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="font-display text-[24px] font-extrabold uppercase tracking-[-0.015em] text-ink sm:text-[28px]">{title}</h2>
        <div className="flex items-center gap-4">
          <Link to={viewAllTo} className="hidden font-display text-[11px] font-bold uppercase tracking-[0.08em] text-mid transition-colors hover:text-ink md:inline">Виж всички</Link>
          <button type="button" onClick={() => step(-1)} aria-label="Назад" className="flex size-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => step(1)} aria-label="Напред" className="flex size-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div ref={track} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto md:snap-none md:gap-6">
        {products.map((p) => (
          <div key={p.id} className="shrink-0 basis-[44%] snap-start sm:basis-[31%] md:basis-[calc((100%_-_3_*_1.5rem)_/_3.5)]">
            <PdpCard product={p} />
          </div>
        ))}
      </div>
      {hasScroll && (
        <div className={`relative mt-6 h-px bg-line transition-opacity duration-300 ${bar.show ? 'opacity-100' : 'opacity-0'}`}>
          <span className="absolute top-0 block h-px bg-ink" style={{width: `${bar.w}%`, left: `${bar.left}%`}} />
        </div>
      )}
    </section>
  );
}

/* ───────────────────── HELPERS ───────────────────── */
const KNOWN_BRANDS = ['Ray Ban', 'Ray-Ban', 'Tom Ford', 'Saint Laurent', 'Carolina Herrera', 'Carolina Lemke', 'Marc Jacobs', 'Michael Kors', 'Emporio Armani', 'Giorgio Armani', 'Dolce Gabbana', 'Calvin Klein', 'Paul Smith', 'Hugo Boss', 'Jimmy Choo', 'Max Mara', 'Salvatore Ferragamo', 'David Beckham', 'Porsche Design'];

function getProp(p: Product, re: RegExp): string {
  const prop = ((p as any).properties ?? []).find((x: any) => re.test(x.name));
  return prop?.values?.[0] ?? '';
}
function splitBrandName(p: Product): {brand: string; name: string} {
  const propBrand = getProp(p, /бранд|марк|brand|производ/i);
  const title = p.title ?? '';
  if (propBrand) return {brand: propBrand, name: title.toLowerCase().startsWith(propBrand.toLowerCase()) ? title.slice(propBrand.length).trim() || title : title};
  const known = KNOWN_BRANDS.find((b) => title.toLowerCase().startsWith(b.toLowerCase()));
  if (known) return {brand: known, name: title.slice(known.length).trim() || title};
  const parts = title.split(' ');
  return {brand: parts[0] ?? '', name: parts.slice(1).join(' ') || title};
}
function getColor(p: Product): string {
  const opt = ((p as any).options ?? []).find((o: any) => /цвят|цвета|color|colour/i.test(o.name));
  if (opt?.values?.length) return opt.values[0];
  return getProp(p, /цвят|color|colour/i);
}
function getOptionMeta(product: Product, optionName: string) {
  const values: Record<string, {color?: string; swatchUrl?: string}> = {};
  let type: string | undefined;
  for (const v of (product as any).variants.nodes) {
    for (const so of v.selectedOptions) {
      if (so.name !== optionName) continue;
      if (so.type && !type) type = so.type;
      if (!values[so.value]) values[so.value] = {color: so.color || undefined, swatchUrl: so.swatchUrl || undefined};
    }
  }
  return {type, values};
}
function colorImageMap(product: Product): Record<string, string> {
  const map: Record<string, string> = {};
  for (const v of (product as any).variants.nodes) {
    const colorOpt = v.selectedOptions.find((so: any) => /цвят|color|colour/i.test(so.name));
    if (colorOpt && v.image?.url && !map[colorOpt.value]) map[colorOpt.value] = v.image.url;
  }
  return map;
}
function galleryImages(product: Product): string[] {
  const imgs: string[] = [];
  const featured = (product as any).featuredImage?.url;
  if (featured) imgs.push(featured);
  for (const n of (product as any).images?.nodes ?? []) {
    if (n?.url && !imgs.includes(n.url)) imgs.push(n.url);
  }
  for (const v of (product as any).variants?.nodes ?? []) {
    if (v.image?.url && !imgs.includes(v.image.url)) imgs.push(v.image.url);
  }
  return imgs;
}
function parseDims(s: string): {lens: number; bridge: number; temple: number} | null {
  if (!s) return null;
  const nums = (s.match(/\d{2,3}/g) ?? []).map(Number);
  if (nums.length >= 3) return {lens: nums[0], bridge: nums[1], temple: nums[2]};
  if (nums.length === 2) return {lens: nums[0], bridge: nums[1], temple: 140};
  return null;
}
function fmtEUR(n: number | string): string {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return v.toLocaleString('bg-BG', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' €';
}
function fmtBGN(eur: string): string {
  return (parseFloat(eur) * 1.95583).toLocaleString('bg-BG', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + ' лв.';
}
