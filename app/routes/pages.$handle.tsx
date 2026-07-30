import {useLoaderData, data} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';
import {RichText} from '@cloudcart/nitrogen-react';
import {STATIC_PAGES, StaticPage} from '~/lib/staticPages';

export const meta: Route.MetaFunction = ({data: d}) =>
  getSeoMeta({title: d?.title ? `${d.title} | Opticlasa` : 'Страница | Opticlasa'});

export async function loader({params, context, request}: Route.LoaderArgs) {
  // Locally-defined static pages take precedence over CMS pages.
  const staticData = STATIC_PAGES[params.handle];
  if (staticData) return {title: staticData.title, staticHandle: params.handle, page: null};

  const ctx = await getContext(context, request);
  const page = await ctx.storefront.getPage(params.handle);
  if (!page) throw data('Page not found', {status: 404});
  return {title: page.title, staticHandle: null, page};
}

export default function PageRoute() {
  const {staticHandle, page} = useLoaderData<typeof loader>();
  if (staticHandle) return <StaticPage {...STATIC_PAGES[staticHandle]} />;
  return (
    <article className="mx-auto max-w-5xl py-2">
      <h1 className="font-display text-[clamp(28px,4vw,44px)] font-extrabold uppercase leading-[1.05] tracking-[-0.01em] text-ink">{page!.title}</h1>
      <div className="mt-4 h-[3px] w-12 bg-red" />
      <div className="prose mt-7 max-w-none text-[15px] leading-[1.85] text-mid"><RichText data={page!.body} /></div>
    </article>
  );
}
