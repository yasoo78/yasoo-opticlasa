import {data, useLoaderData} from 'react-router';
import type {Route} from './+types/selection.$handle';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import type {Product} from '@cloudcart/nitrogen';
import {ProductListing} from '~/components/ProductListing';
import {SELECTIONS} from '~/lib/selections';
import {buildFiltersFromParams, buildSortFromParams} from '~/lib/filters';

// "Нови" — dynamic newest-first listing (the smart collection has 200+ products,
// so we don't load them one-by-one; we page the full catalogue sorted by newest).
// Promo image tiles injected at fixed grid positions on the "Нови" page.
const NOVI_PROMOS = [
  {position: 4, img: 'https://cdncloudcart.com/74980/files/image/cat2.jpg?1785134922'},
  {position: 11, img: 'https://cdncloudcart.com/74980/files/image/pr-img-05.jpg?1785236850'},
];

export const meta: Route.MetaFunction = ({data: d}) =>
  getSeoMeta({title: `${(d as any)?.title ?? 'Селекция'} — Opticlasa`});

export async function loader({params, context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);

  // Dynamic "Нови" listing.
  if (params.handle === 'novi') {
    const url = new URL(request.url);
    const paginationVariables = getPaginationVariables(request, {pageBy: 12});
    const filters = buildFiltersFromParams(url.searchParams);
    const sort = buildSortFromParams(url.searchParams);
    const products = await ctx.storefront.getProductsPaginated({
      ...paginationVariables,
      sortKey: sort.sortKey ?? 'CREATED_AT',
      reverse: sort.sortKey ? sort.reverse : true,
      filters,
    });
    return {title: 'Нови', products, subcats: [] as any[], promos: NOVI_PROMOS};
  }

  const sel = SELECTIONS[params.handle];
  if (!sel) throw data('Not found', {status: 404});
  const products = (
    await Promise.all(sel.products.map((h) => ctx.storefront.getProduct(h).catch(() => null)))
  ).filter(Boolean) as Product[];
  return {
    title: sel.title,
    products: {
      nodes: products,
      pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
      filters: [],
      totalCount: products.length,
    },
    subcats: [] as any[],
    promos: sel.promoImg ? [{position: 6, img: sel.promoImg}] : [],
  };
}

export default function SelectionPage() {
  const {title, products, subcats, promos} = useLoaderData<typeof loader>();
  return (
    <ProductListing
      title={title}
      breadcrumb={[{title}]}
      products={products as any}
      subcats={subcats as any}
      promos={promos}
    />
  );
}
