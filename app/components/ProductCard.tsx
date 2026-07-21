import {Link} from 'react-router';
import type {Product} from '@cloudcart/nitrogen';
import {Image, Money} from '@cloudcart/nitrogen-react';
import {WishlistButton} from './WishlistButton';
import {splitBrandName} from '~/lib/product';

export function ProductCard({product, loading}: {product: Product; loading?: 'eager' | 'lazy'}) {
  const p = product as any;
  const {brand, name} = splitBrandName(product);
  const onSale = p.variants?.nodes?.[0]?.compareAtPrice &&
    parseFloat(p.variants.nodes[0].compareAtPrice.amount) > parseFloat(p.variants.nodes[0].price.amount);

  return (
    <Link to={`/products/${product.handle}`} prefetch="intent" className="group flex flex-col text-inherit">
      <div className="relative aspect-square overflow-hidden bg-white">
        {p.featuredImage?.url ? (
          <Image data={p.featuredImage} alt={product.title} loading={loading} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.04]" />
        ) : (
          <img src="/noimage.svg" alt={product.title} loading={loading} className="h-full w-full object-contain p-6" />
        )}
        {p.availableForSale === false && (
          <span className="absolute left-4 top-4 rounded-full bg-ink px-3 py-1 font-sans text-[10px] font-medium text-white">Изчерпан</span>
        )}
        {onSale && p.availableForSale !== false && (
          <span className="absolute left-4 top-4 rounded-full bg-red px-3 py-1 font-sans text-[10px] font-medium text-white">Промо</span>
        )}
        <div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
          <WishlistButton productId={product.id} size="md" />
        </div>
      </div>
      <div className="pt-3">
        <div className="font-display text-[16px] font-semibold uppercase leading-tight tracking-[0.01em] text-ink">{brand || name}</div>
        {brand && name && <div className="mt-1 font-sans text-[11px] font-medium uppercase tracking-[0.16em] text-mid">{name}</div>}
        <div className="mt-1.5 font-sans text-[13px] text-ink">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}
