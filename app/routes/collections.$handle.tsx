import {useLoaderData, data} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {ProductListing} from '~/components/ProductListing';
import {buildFiltersFromParams, buildSortFromParams} from '~/lib/filters';

export const meta: Route.MetaFunction = ({data: d}) => {
  const col = (d as any)?.collection;
  return getSeoMeta({
    title: col?.seo?.title || (col ? `${col.title} | Opticlasa` : 'Категория | Opticlasa'),
    description: col?.seo?.description || col?.description,
  });
};

export async function loader({params, context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const filters = buildFiltersFromParams(url.searchParams);
  const {sortKey, reverse} = buildSortFromParams(url.searchParams);

  const result = await ctx.storefront.getCollectionProductsPaginated(params.handle, {
    ...paginationVariables,
    sortKey,
    reverse,
    filters,
  });

  if (!result) throw data('Collection not found', {status: 404});

  const col = result.collection as any;
  return {
    collection: col,
    products: result.products,
    children: col.children?.nodes ?? [],
  };
}

// Custom banner images for the top subcategory tiles, by position (left→right), per collection handle.
const SUBCAT_IMAGE_OVERRIDES: Record<string, string[]> = {
  'slanchevi-ochila': [
    'https://cdncloudcart.com/74980/files/image/cat6.jpg',
    'https://cdncloudcart.com/74980/files/image/cat7.jpg',
    'https://cdncloudcart.com/74980/files/image/cat8.jpg',
  ],
};

// Promo image tiles injected at fixed grid positions, per collection handle (test).
const LISTING_PROMOS: Record<string, Array<{position: number; img: string}>> = {
  'slanchevi-ochila': [
    {position: 6, img: 'https://cdncloudcart.com/74980/files/image/cat4.jpg?1785149469'},
    {position: 10, img: 'https://cdncloudcart.com/74980/files/image/cat5.jpg?1785149480'},
  ],
  'optical-glasses': [
    {position: 6, img: 'https://cdncloudcart.com/74980/files/image/cat2.jpg?1785134922'},
    {position: 10, img: 'https://cdncloudcart.com/74980/files/image/cat3.jpg?1785134923'},
  ],
};

export default function CollectionPage() {
  const {collection, products, children} = useLoaderData<typeof loader>();
  const col = collection as any;
  const overrides = SUBCAT_IMAGE_OVERRIDES[col.handle];
  const subcats = overrides
    ? (children as any[]).map((c, i) => (overrides[i] ? {...c, image: {url: overrides[i]}} : c))
    : children;
  const breadcrumb = [
    ...((col.breadcrumb ?? []).filter((b: any) => b.handle !== col.handle).map((b: any) => ({title: b.title, to: `/collections/${b.handle}`}))),
    {title: col.title},
  ];

  return (
    <ProductListing
      title={col.title}
      breadcrumb={breadcrumb}
      products={products as any}
      subcats={subcats as any}
      promos={LISTING_PROMOS[col.handle] ?? []}
    />
  );
}
