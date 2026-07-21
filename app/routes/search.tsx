import {useLoaderData, useNavigate, useNavigation, useSearchParams} from 'react-router';
import {useEffect, useRef, useState, useCallback} from 'react';
import type {Route} from './+types/search';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {ProductCard} from '~/components/ProductCard';
import {ProductFilters} from '~/components/ProductFilters';
import {Pagination} from '~/components/Pagination';
import {MagnifyingGlassIcon, XMarkIcon} from '@heroicons/react/24/outline';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const isSearching = navigation.state === 'loading';

  // Input is fully local — never overwritten by URL/loader data
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const performSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams);
    params.delete('page');
    params.delete('cursor');
    params.delete('direction');

    if (value) {
      params.set('q', value);
    } else {
      params.delete('q');
    }
    navigate(`/search?${params.toString()}`, {replace: true, preventScrollReset: true});
  }, [navigate, searchParams]);

  function handleInputChange(value: string) {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  }

  function clearSearch() {
    setInputValue('');
    navigate('/search', {replace: true, preventScrollReset: true});
    inputRef.current?.focus();
  }

  const totalCount = (products as any)?.totalCount ?? products?.nodes?.length ?? 0;
  const hasResults = products?.nodes && products.nodes.length > 0;

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Търси очила, марки, категории..."
              autoComplete="off"
              className="form-input w-full py-3.5 pl-12 pr-10 border-[1.5px] border-line text-base transition-[border-color] duration-150 focus:border-ink focus:ring-0"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors duration-150 p-1 rounded-full hover:bg-gray-100"
                aria-label="Clear search"
              >
                <XMarkIcon className="size-5" />
              </button>
            )}
          </div>

          {/* Results count */}
          {(inputValue || query) && (
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 border-2 border-gray-300 border-t-red rounded-full animate-spin" />
                  Търси...
                </span>
              ) : products ? (
                <span>
                  <strong className="text-ink">{totalCount.toLocaleString()}</strong> {totalCount === 1 ? 'резултат' : 'резултата'} за <strong className="text-ink">"{query}"</strong>
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!inputValue && !query && (
        <div className="text-center py-16 text-mid">
          <MagnifyingGlassIcon className="size-16 mx-auto mb-4 text-gray-200" />
          <p className="font-display text-lg font-bold text-ink">Започни да търсиш</p>
          <p className="text-sm mt-1">Търси из всички очила, марки и категории</p>
        </div>
      )}

      {/* No results */}
      {query && products && products.nodes.length === 0 && !isSearching && (
        <div className="text-center py-16 text-mid">
          <MagnifyingGlassIcon className="size-16 mx-auto mb-4 text-gray-200" />
          <p className="font-display text-lg font-bold text-ink">Няма резултати</p>
          <p className="text-sm mt-1">Опитай различна дума или промени филтрите</p>
        </div>
      )}

      {/* Results with filters */}
      {hasResults && (
        <div className="grid gap-8 md:grid-cols-[220px_1fr] md:gap-10">
          <aside className="order-2 md:order-1">
            <ProductFilters filters={(products as any).filters} totalCount={totalCount} />
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
      )}
    </div>
  );
}
