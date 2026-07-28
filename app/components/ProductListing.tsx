import {useState} from 'react';
import {Link, useSearchParams, useNavigate, useLocation} from 'react-router';
import type {Filter, Product} from '@cloudcart/nitrogen';
import {ProductFiltersPlp} from './ProductFiltersPlp';
import {Pagination} from './Pagination';
import {Breadcrumbs} from './Breadcrumbs';
import {WishlistButton} from './WishlistButton';
import {filterInputToParam, isFilterActive} from '~/lib/filters';
import {cdnSize, baseUrl, onImgErrorToBase} from '~/lib/img';
import {splitBrandName, formatMoney} from '~/lib/product';

/**
 * Category / product-listing page — adapted from the Salomon Nitrogen mirror (spec §8),
 * minus the bits Opticlasa doesn't need: no per-card colour swatches, no leaf-page
 * sibling switcher, no special Размер pill grid (plain checkbox facet instead).
 * Subcategory cards use the live CloudCart category images (Opticlasa exposes real ones).
 */

type Cat = {id: string; title: string; handle: string; image?: {url?: string} | null; productsCount?: number | null};
type Conn = {nodes: Product[]; pageInfo: any; filters?: Filter[]; totalCount?: number | null};

const LABELS: Record<string, string> = {color: 'Цвят', colour: 'Цвят', size: 'Размер', gender: 'Пол', brand: 'Марка', shape: 'Форма', material: 'Материал', type: 'Вид продукт'};
const clean = (l?: string) => (!l || /widget|listing|filter\.|[a-z]+\.[a-z]+\./i.test(l) || /^[A-Z._]+$/.test(l) ? '' : LABELS[l.toLowerCase().trim()] ?? l);
const plural = (n: number) => `${n} ${n === 1 ? 'продукт' : 'продукта'}`;

// Override the image (only) of the product at a fixed 1-based grid position.
type Promo = {position: number; img: string};

export function ProductListing({
  title,
  breadcrumb,
  products,
  subcats = [],
  promos = [],
}: {
  title: string;
  breadcrumb: Array<{title: string; to?: string}>;
  products: Conn;
  subcats?: Cat[];
  promos?: Promo[];
}) {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [dense, setDense] = useState(false);

  const filters = products.filters ?? [];
  const total = products.totalCount ?? products.nodes.length;

  // active-filter chips from facet values + price
  const chips: Array<{group: string; label: string; remove: () => void}> = [];
  for (const f of filters) for (const v of f.values) if (isFilterActive(sp, v.input)) chips.push({group: clean(f.label), label: v.label, remove: () => removeInput(v.input)});
  const minP = sp.get('minPrice'); const maxP = sp.get('maxPrice');
  if (minP || maxP) chips.push({group: 'Цена', label: `${minP || 0}–${maxP || '∞'}`, remove: () => {const p = new URLSearchParams(sp); p.delete('minPrice'); p.delete('maxPrice'); navigate(`?${p}`, {preventScrollReset: true});}});

  function removeInput(input: string) {
    const param = filterInputToParam(input);
    if (!param) return;
    const p = new URLSearchParams(sp);
    const rest = p.getAll(param.key).filter((v) => v !== param.value);
    p.delete(param.key);
    rest.forEach((v) => p.append(param.key, v));
    navigate(`?${p}`, {preventScrollReset: true});
  }

  const gridCls = dense ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="w-full px-5 pt-[15px]">
      <Breadcrumbs items={breadcrumb} />
      <h1 className="mt-3.5 font-display text-[26px] font-extrabold uppercase tracking-[-0.01em] text-ink md:text-[46px]">{title}</h1>

      {subcats.length > 0 && <CatRow cats={subcats} />}

      {/* toolbar */}
      <div className="my-[18px] mb-[22px] flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => setShowFilters((s) => !s)} className="inline-flex items-center gap-2 rounded-[24px] border border-ink bg-white px-[18px] py-2 font-display text-[12px] font-semibold uppercase tracking-[0.04em] text-ink transition-colors hover:bg-ink hover:text-white">
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
          {showFilters ? 'Скрий филтрите' : 'Покажи филтрите'}
        </button>

        {chips.length > 0 && (
          <div className="scrollbar-none flex flex-1 items-center gap-1.5 overflow-x-auto">
            {chips.map((c, i) => (
              <span key={i} className="inline-flex shrink-0 items-center gap-2 rounded-[20px] bg-[#eee] px-3.5 py-[7px] text-[13px] text-[#222]">
                {c.group && <b className="font-semibold">{c.group}:</b>} {c.label}
                <button type="button" onClick={c.remove} aria-label="Премахни" className="text-[#666] hover:text-ink">✕</button>
              </span>
            ))}
            <button type="button" onClick={() => navigate(pathname, {preventScrollReset: true})} className="shrink-0 px-2 text-[13px] font-semibold text-ink underline">Изчисти всички</button>
          </div>
        )}

        <div className="ml-auto flex items-center gap-[18px]">
          <span className="whitespace-nowrap font-display text-[13px] font-semibold text-ink">{plural(total)}</span>
          <div className="hidden items-center gap-1.5 sm:flex">
            <GridBtn active={!dense} onClick={() => setDense(false)} cols={3} />
            <GridBtn active={dense} onClick={() => setDense(true)} cols={4} />
          </div>
        </div>
      </div>

      {/* Desktop: inline sidebar (as before). Mobile: filters open in the overlay below. */}
      <div className="flex items-start">
        <aside className={`hidden overflow-hidden transition-[width,margin,opacity] duration-500 md:block ${showFilters ? 'mr-9 w-[260px] opacity-100' : 'mr-0 w-0 opacity-0'} sticky top-6 shrink-0 self-start`}>
          <div className="w-[260px]"><ProductFiltersPlp filters={filters} /></div>
        </aside>

        <div className="min-w-0 flex-1">
          <Pagination connection={products}>
            {({nodes, NextLink, isLoading}) => (
              <div>
                {/* 1px hairlines between cards via the grid's bg showing through the gap;
                    hovering the grid fades the lines away (Salomon look, ref image #24). */}
                <div className={`-mx-5 grid gap-px bg-line transition-colors duration-300 hover:bg-transparent ${gridCls}`}>
                  {nodes.map((product, i) => (
                    <div key={product.id} className="bg-paper p-3 sm:p-5">
                      <PlpCard product={product} imageOverride={promos.find((pr) => pr.position === i + 1)?.img} />
                    </div>
                  ))}
                </div>
                <NextLink className="mx-auto my-12 flex w-fit items-center justify-center gap-2 rounded-full border border-ink px-10 py-3.5 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-white">
                  {isLoading ? 'Зарежда...' : 'Зареди още'}
                </NextLink>
              </div>
            )}
          </Pagination>
        </div>
      </div>

      {/* Mobile only — filters as a full-screen overlay */}
      <div className="md:hidden">
        <FilterOverlay open={showFilters} onClose={() => setShowFilters(false)} filters={filters} total={total} />
      </div>
    </div>
  );
}

/* Full-screen filter overlay — slides in from the left over everything (incl. header),
   so opening it never reflows the page (fixes the header shift from the old inline sidebar). */
function FilterOverlay({open, onClose, filters, total}: {open: boolean; onClose: () => void; filters: Filter[]; total: number}) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[540] bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <div
        className={`fixed inset-y-0 left-0 z-[550] flex w-full flex-col bg-paper transition-transform duration-300 sm:w-[440px] ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-[18px]">
          <span className="font-display text-[15px] font-bold uppercase tracking-[0.04em] text-ink">Филтри</span>
          <button type="button" onClick={onClose} aria-label="Затвори" className="text-mid transition-colors hover:text-ink">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-1">
          <ProductFiltersPlp filters={filters} />
        </div>
        <div className="border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="flex w-full items-center justify-center rounded-full bg-ink px-6 py-3.5 font-display text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red">
            Виж резултатите ({total})
          </button>
        </div>
      </div>
    </>
  );
}

/* Borderless product card — Salomon look (spec §7), swatch row removed. */
function PlpCard({product, imageOverride}: {product: Product; imageOverride?: string}) {
  const p = product as any;
  const {brand, name} = splitBrandName(product);
  const display = imageOverride ?? cdnSize(p.featuredImage?.url, 600);
  const v0 = p.variants?.nodes?.[0];
  const onSale = v0?.compareAtPrice && parseFloat(v0.compareAtPrice.amount) > parseFloat(v0.price.amount);

  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex flex-col text-inherit">
      <div className="relative aspect-square overflow-hidden bg-white">
        {display ? (
          <img src={display} alt={product.title} loading="eager" onError={imageOverride ? undefined : onImgErrorToBase} className={`h-full w-full ${imageOverride ? 'object-cover' : 'object-contain'} transition-transform duration-500 group-hover:scale-[1.03]`} />
        ) : (
          <img src="/noimage.svg" alt={product.title} className="h-full w-full object-contain p-6" />
        )}

        {p.availableForSale === false && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">Изчерпан</span>
        )}
        {onSale && p.availableForSale !== false && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">Промо</span>
        )}

        <div className="absolute right-3 top-3 z-[6]">
          <WishlistButton productId={product.id} size="md" className="!size-8 border border-line shadow-[0_1px_6px_rgba(0,0,0,0.18)]" />
        </div>
      </div>

      <div className="mt-[11px]">
        <div className="font-display text-[15px] font-semibold uppercase leading-[1.2] tracking-[0.01em] text-ink">{brand || name}</div>
        {brand && name && <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-mid">{name}</div>}
        <div className="mt-1.5 text-[14px] font-medium leading-[1.2] text-ink">
          {formatMoney(product.priceRange?.minVariantPrice)}
        </div>
      </div>
    </Link>
  );
}

/* Subcategory banners — tall editorial tiles (home-hero style), 3 per row. */
function CatRow({cats}: {cats: Cat[]}) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-3">
      {cats.map((c) => {
        // request a ~4:3 landscape crop — also busts any old cached square/portrait crop
        const img = c.image?.url ? `${baseUrl(c.image.url)}?width=820&height=616` : undefined;
        return (
          <Link
            key={c.id}
            to={`/collections/${c.handle}`}
            prefetch="intent"
            className="group relative block aspect-[4/3] overflow-hidden bg-panel"
          >
            {img ? (
              <img
                src={img}
                alt={c.title}
                loading="eager"
                onError={(e) => {(e.currentTarget as HTMLImageElement).style.visibility = 'hidden';}}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
              />
            ) : (
              <span className="absolute inset-0 flex items-center justify-center font-display text-[15px] font-bold uppercase tracking-[0.04em] text-mid">{c.title}</span>
            )}
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-4 p-9 md:gap-3 md:p-6">
              <span className="font-display text-[34px] font-black uppercase leading-none tracking-[-0.01em] text-white sm:text-[48px] md:text-[30px] lg:text-[38px]">{c.title}</span>
              <span className="hidden items-center gap-2 rounded-full bg-white px-6 py-3 font-sans text-[13px] font-medium text-ink transition-colors group-hover:bg-ink group-hover:text-white md:inline-flex">
                Разгледай
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GridBtn({active, onClick, cols}: {active: boolean; onClick: () => void; cols: 3 | 4}) {
  return (
    <button type="button" onClick={onClick} aria-label={`${cols} колони`} className={`flex size-8 items-center justify-center rounded-[7px] border ${active ? 'border-ink bg-ink text-white' : 'border-line3 bg-white text-ink'}`}>
      <div className="flex gap-px">{Array.from({length: cols}).map((_, i) => <span key={i} className="block h-3.5 w-px bg-current" />)}</div>
    </button>
  );
}
