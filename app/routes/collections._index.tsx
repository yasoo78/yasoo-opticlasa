import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';
import {getContext} from '~/lib/context';
import {getSeoMeta, getPaginationVariables} from '@cloudcart/nitrogen';
import {Image} from '@cloudcart/nitrogen-react';
import {Pagination} from '~/components/Pagination';

export const meta: Route.MetaFunction = () => getSeoMeta({title: 'Категории | Opticlasa'});

export async function loader({context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const collections = await ctx.storefront.getCollectionsPaginated(paginationVariables);
  return {collections};
}

export default function CollectionsIndex() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="mb-7 border-b border-line pb-5">
        <span className="font-display text-[9px] font-bold uppercase tracking-[0.2em] text-red">Opticlasa</span>
        <h1 className="mt-1 font-display text-[clamp(26px,3.2vw,40px)] font-black tracking-[-0.02em] text-ink">Категории</h1>
      </div>
      <Pagination connection={collections}>
        {({nodes, NextLink, isLoading}) => (
          <div>
            <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
              {nodes.map((collection: any) => {
                const hasImage = collection.image?.url && !/temp_logo|noimage/i.test(collection.image.url);
                return (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  className="group relative block aspect-[3/2] overflow-hidden bg-panel hover:no-underline"
                  prefetch="intent"
                >
                  {hasImage ? (
                    <Image data={collection.image} alt={collection.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-gray-800 to-ink transition-transform duration-700 group-hover:scale-[1.04]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="font-display text-xl font-black tracking-[-0.02em] text-white">{collection.title}</h3>
                    {collection.productsCount != null && (
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.1em] text-white/60">
                        {collection.productsCount} {collection.productsCount === 1 ? 'продукт' : 'продукта'}
                      </span>
                    )}
                  </div>
                </Link>
                );
              })}
            </div>
            <NextLink className="mx-auto my-10 flex w-fit items-center justify-center gap-2 border border-line px-9 py-3.5 font-display text-[11px] font-bold uppercase tracking-[0.1em] text-ink no-underline transition-colors hover:bg-ink hover:text-white hover:no-underline">
              {isLoading ? 'Зарежда...' : 'Зареди още ↓'}
            </NextLink>
          </div>
        )}
      </Pagination>
    </div>
  );
}
