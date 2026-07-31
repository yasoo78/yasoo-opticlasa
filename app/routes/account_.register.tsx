import {Form, Link, redirect, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/account_.register';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';
import {AuthLayout} from './account_.login';

const authInput = 'w-full rounded-lg border-[1.5px] border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink';
const authLabel = 'mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-ink';
const authBtn = 'w-full rounded-full bg-ink px-6 py-3.5 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red disabled:opacity-60';

export const meta: Route.MetaFunction = () => getSeoMeta({title: 'Create account | Nitrogen'});

type ActionData = {error: string; values?: Record<string, string>};

export async function loader({context, request}: Route.LoaderArgs) {
  const ctx = await getContext(context, request);
  if (ctx.customerAccount.isLoggedIn()) {
    throw redirect('/account');
  }
  return null;
}

export async function action({request, context}: Route.ActionArgs) {
  const ctx = await getContext(context, request);
  const form = await request.formData();
  const email = String(form.get('email') ?? '').trim();
  const firstName = String(form.get('firstName') ?? '').trim();
  const lastName = String(form.get('lastName') ?? '').trim();
  const acceptsMarketing = form.get('acceptsMarketing') === 'on';

  if (!email) {
    return {error: 'Email is required.', values: {firstName, lastName}} as ActionData;
  }

  const {errors} = await ctx.customerAccount.register({
    email,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    acceptsMarketing,
  });

  if (errors.length) {
    return {
      error: errors[0].message,
      values: {email, firstName, lastName},
    } as ActionData;
  }

  throw redirect(`/account/login?sent=1&email=${encodeURIComponent(email)}`);
}

export default function AccountRegister() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const v = actionData?.values ?? {};

  return (
    <AuthLayout
      title="Създай профил"
      below={
        <p className="text-[14px] text-mid">
          Вече имаш профил?{' '}
          <Link to="/account/login" className="font-semibold text-ink underline underline-offset-2 hover:text-red">Влез</Link>
        </p>
      }
    >
      <Form method="POST" className="mt-7 space-y-4">
        <div>
          <label htmlFor="email" className={authLabel}>Имейл</label>
          <input id="email" type="email" name="email" autoComplete="email" required defaultValue={v.email ?? ''} placeholder="you@example.com" className={authInput} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="firstName" className={authLabel}>Име</label>
            <input id="firstName" type="text" name="firstName" autoComplete="given-name" defaultValue={v.firstName ?? ''} className={authInput} />
          </div>
          <div>
            <label htmlFor="lastName" className={authLabel}>Фамилия</label>
            <input id="lastName" type="text" name="lastName" autoComplete="family-name" defaultValue={v.lastName ?? ''} className={authInput} />
          </div>
        </div>

        <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-mid">
          <input type="checkbox" name="acceptsMarketing" className="mt-0.5 accent-ink" />
          <span>Искам да получавам новини и промоции по имейл.</span>
        </label>

        {actionData?.error ? <p className="text-[13px] text-red">{actionData.error}</p> : null}

        <button type="submit" disabled={isSubmitting} className={authBtn}>{isSubmitting ? 'Създаване…' : 'Създай профил'}</button>
      </Form>
    </AuthLayout>
  );
}
