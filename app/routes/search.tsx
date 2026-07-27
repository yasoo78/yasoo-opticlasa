import {useLoaderData} from 'react-router';
import type {Route} from './+types/search';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {ProductListing} from '~/components/ProductListing';
import {buildFiltersFromParams, buildSortFromParams} from '~/lib/filters';

export const meta: Route.MetaFunction = () => getSeoMeta({title: 'Търсене | Opticlasa'});

export async function loader({request, context}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const url = new URL(request.url);
  const q = url.searchParams.get('q') ?? '';

  if (!q) return {query: q, products: null};

  const paginationVariables = getPaginationVariables(request, {pageBy: 12});
  const filters = buildFiltersFromParams(url.searchParams);
  const {sortKey, reverse} = buildSortFromParams(url.searchParams);

  const products = await ctx.storefront.getProductsPaginated({
    ...paginationVariables,
    sortKey,
    reverse,
    filters,
    query: q,
  });

  return {query: q, products};
}

export default function SearchPage() {
  const {query, products} = useLoaderData<typeof loader>();

  if (!query || !products) {
    return (
      <div className="w-full px-10 pb-24 pt-24 text-center text-mid">
        <p className="font-display text-[22px] font-bold uppercase tracking-[-0.01em] text-ink">Започни да търсиш</p>
        <p className="mt-2 text-sm">Търси из всички очила, марки и категории.</p>
      </div>
    );
  }

  return (
    <ProductListing
      title={`Резултати за „${query}“`}
      breadcrumb={[{title: 'Начало', to: '/'}, {title: 'Търсене'}]}
      products={products as any}
    />
  );
}
