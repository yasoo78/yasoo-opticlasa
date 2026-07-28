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

// Top subcategory banners: display order (left→right) + custom image, per collection handle.
const SUBCAT_BANNERS: Record<string, Array<{handle: string; img: string}>> = {
  'slanchevi-ochila': [
    {handle: 'zheni', img: 'https://cdncloudcart.com/74980/files/image/cat6.jpg'}, // Жени
    {handle: 'mazhe', img: 'https://cdncloudcart.com/74980/files/image/cat7.jpg'}, // Мъже
    {handle: 'detsa', img: 'https://cdncloudcart.com/74980/files/image/cat8.jpg'}, // Деца
  ],
  'optical-glasses': [
    {handle: 'optical-glasses-jeni', img: 'https://cdncloudcart.com/74980/files/image/cat9.jpg'}, // Жени
    {handle: 'optical-glasses-maje', img: 'https://cdncloudcart.com/74980/files/image/cat10.jpg'}, // Мъже
    {handle: 'optical-glasses-deca', img: 'https://cdncloudcart.com/74980/files/image/cat11.jpg'}, // Деца
  ],
};

// Promo image tiles injected at fixed grid positions, per collection handle (test).
const LISTING_PROMOS: Record<string, Array<{position: number; img: string}>> = {
  'slanchevi-ochila': [
    {position: 6, img: 'https://cdncloudcart.com/74980/files/image/cat3.jpg?1785134923'},
    {position: 11, img: 'https://cdncloudcart.com/74980/files/image/cat2.jpg?1785134922'},
  ],
  'optical-glasses': [
    {position: 6, img: 'https://cdncloudcart.com/74980/files/image/pr-img-05.jpg?1785236850'},
    {position: 11, img: 'https://cdncloudcart.com/74980/files/image/pr-img-04.jpg?1785236850'},
  ],
};

export default function CollectionPage() {
  const {collection, products, children} = useLoaderData<typeof loader>();
  const col = collection as any;
  const cfg = SUBCAT_BANNERS[col.handle];
  const subcats = cfg
    ? cfg
        .map(({handle, img}) => {
          const c = (children as any[]).find((x) => x.handle === handle);
          return c ? {...c, image: {url: img}} : null;
        })
        .filter(Boolean)
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
