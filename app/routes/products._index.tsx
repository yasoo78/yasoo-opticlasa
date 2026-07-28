import {useLoaderData} from 'react-router';
import type {Route} from './+types/products._index';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {ProductListing} from '~/components/ProductListing';
import {buildFiltersFromParams, buildSortFromParams} from '~/lib/filters';

export const meta: Route.MetaFunction = () => getSeoMeta({title: 'Всички очила | Opticlasa'});

export async function loader({context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const url = new URL(request.url);
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const filters = buildFiltersFromParams(url.searchParams);
  const {sortKey, reverse} = buildSortFromParams(url.searchParams);

  const products = await ctx.storefront.getProductsPaginated({
    ...paginationVariables,
    sortKey,
    reverse,
    filters,
  });

  return {products};
}

export default function ProductsIndex() {
  const {products} = useLoaderData<typeof loader>();
  return (
    <ProductListing
      title="Всички очила"
      breadcrumb={[{title: 'Всички очила'}]}
      products={products as any}
    />
  );
}
