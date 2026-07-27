import {data, useLoaderData} from 'react-router';
import type {Route} from './+types/selection.$handle';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';
import type {Product} from '@cloudcart/nitrogen';
import {ProductListing} from '~/components/ProductListing';
import {SELECTIONS} from '~/lib/selections';

export const meta: Route.MetaFunction = ({data: d}) =>
  getSeoMeta({title: `${(d as any)?.title ?? 'Селекция'} — Opticlasa`});

export async function loader({params, context, request}: Route.LoaderArgs) {
  const sel = SELECTIONS[params.handle];
  if (!sel) throw data('Not found', {status: 404});
  const ctx = await getContext(context, request);
  const products = (
    await Promise.all(sel.products.map((h) => ctx.storefront.getProduct(h).catch(() => null)))
  ).filter(Boolean) as Product[];
  return {title: sel.title, products, promoImg: sel.promoImg ?? null};
}

export default function SelectionPage() {
  const {title, products, promoImg} = useLoaderData<typeof loader>();
  return (
    <ProductListing
      title={title}
      breadcrumb={[{title: 'Начало', to: '/'}, {title}]}
      products={{
        nodes: products,
        pageInfo: {hasNextPage: false, hasPreviousPage: false, startCursor: null, endCursor: null},
        filters: [],
        totalCount: products.length,
      }}
      promos={promoImg ? [{position: 6, img: promoImg}] : []}
    />
  );
}
