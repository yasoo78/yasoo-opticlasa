import {useLoaderData} from 'react-router';
import type {Route} from './+types/products._index';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {ProductCard} from '~/components/ProductCard';
import {ProductFilters} from '~/components/ProductFilters';
import {Pagination} from '~/components/Pagination';
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
    <div className="w-full">
      <div className="mb-7 border-b border-line pb-5">
        <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-red">Opticlasa</span>
        <h1 className="mt-1 font-display text-[clamp(26px,3.2vw,40px)] font-black tracking-[-0.02em] text-ink">Всички очила</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
        <aside className="order-2 md:order-1">
          <ProductFilters filters={(products as any).filters} totalCount={(products as any).totalCount} />
        </aside>

        <div className="order-1 md:order-2">
          <Pagination connection={products}>
            {({nodes, NextLink, isLoading}) => (
              <div>
                <div className="grid grid-cols-2 gap-0.5 sm:grid-cols-3 lg:grid-cols-4">
                  {nodes.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <NextLink className="mx-auto my-10 flex w-fit items-center justify-center gap-2 border border-line px-9 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-ink no-underline transition-colors hover:bg-ink hover:text-white hover:no-underline">
                  {isLoading ? 'Зарежда...' : 'Зареди още ↓'}
                </NextLink>
              </div>
            )}
          </Pagination>
        </div>
      </div>
    </div>
  );
}
