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

export default function CollectionPage() {
  const {collection, products, children} = useLoaderData<typeof loader>();
  const col = collection as any;
  const breadcrumb = [
    ...((col.breadcrumb ?? []).filter((b: any) => b.handle !== col.handle).map((b: any) => ({title: b.title, to: `/collections/${b.handle}`}))),
    {title: col.title},
  ];

  return (
    <ProductListing
      title={col.title}
      breadcrumb={breadcrumb}
      products={products as any}
      subcats={children as any}
    />
  );
}
