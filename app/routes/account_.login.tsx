import {Form, Link, redirect, useActionData, useNavigation, useSearchParams} from 'react-router';
import {useState} from 'react';
import type {Route} from './+types/account_.login';
import {getContext} from '~/lib/context';
import {getSeoMeta} from '@cloudcart/nitrogen';

const GoogleIcon = (
  <svg className="h-[18px] w-[18px]" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" /><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" /><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" /><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" /></svg>
);
const EyeIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
const EyeOffIcon = (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round"><path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 4.6A9.7 9.7 0 0 1 12 4.4c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.4 4.3M6.1 6.1A17.7 17.7 0 0 0 2 11.4s3.5 7 10 7a9.7 9.7 0 0 0 3.3-.6" /></svg>
);

export const meta: Route.MetaFunction = () => getSeoMeta({title: 'Sign in | Nitrogen'});

type ActionData =
  | {stage: 'email'; error?: string}
  | {stage: 'code'; email: string; error?: string};

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
  const stage = String(form.get('stage') ?? 'email');

  if (stage === 'email') {
    const email = String(form.get('email') ?? '').trim();
    if (!email) {
      return {stage: 'email', error: 'Please enter your email.'} as ActionData;
    }
    await ctx.customerAccount.requestLoginCode(email);
    throw redirect(`/account/login?sent=1&email=${encodeURIComponent(email)}`);
  }

  if (stage === 'code') {
    const email = String(form.get('email') ?? '').trim();
    const code = String(form.get('code') ?? '').trim();
    if (!email || !/^\d{6}$/.test(code)) {
      return {stage: 'code', email, error: 'Enter the 6-digit code.'} as ActionData;
    }
    const {errors} = await ctx.customerAccount.verifyLoginCode(email, code);
    if (errors.length) {
      return {stage: 'code', email, error: errors[0].message} as ActionData;
    }
    throw redirect('/account', {
      headers: {'Set-Cookie': await ctx.session.commit()},
    });
  }

  return {stage: 'email', error: 'Invalid request.'} as ActionData;
}

const authInput = 'w-full rounded-lg border-[1.5px] border-line bg-white px-4 py-3 text-[15px] text-ink outline-none transition-colors focus:border-ink';
const authLabel = 'mb-1.5 block font-display text-[11px] font-semibold uppercase tracking-[0.08em] text-ink';
const authBtn = 'w-full rounded-full bg-ink px-6 py-3.5 font-display text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-red disabled:opacity-60';

export function AuthLayout({title, children, below}: {title: string; children: React.ReactNode; below?: React.ReactNode}) {
  return (
    <div className="mx-auto w-full max-w-[460px] px-5 py-10 sm:py-14">
      <div className="rounded-2xl border border-line bg-white px-7 py-9 shadow-[0_1px_24px_rgba(0,0,0,0.05)] sm:px-9">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-red">Opticlasa</span>
        <h1 className="mt-3 font-display text-[28px] font-extrabold uppercase leading-[1.06] tracking-[-0.01em] text-ink">{title}</h1>
        {children}
      </div>
      {below ? <div className="mt-7 text-center">{below}</div> : null}
    </div>
  );
}

export default function AccountLogin() {
  const [params] = useSearchParams();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showPw, setShowPw] = useState(false);

  const sent = params.get('sent') === '1' || actionData?.stage === 'code';
  const email = actionData?.stage === 'code' ? actionData.email : (params.get('email') ?? '');

  return (
    <AuthLayout
      title="Вход в профила"
      below={
        <p className="text-[14px] text-mid">
          Нямаш профил?{' '}
          <Link to="/account/register" className="font-semibold text-ink underline underline-offset-2 hover:text-red">Създай нов профил</Link>
        </p>
      }
    >
      {!sent ? (
        <div className="mt-7 space-y-4">
          {/* Google (visual — auth via CloudCart backend once wired) */}
          <button type="button" className="flex w-full items-center justify-center gap-3 rounded-full border-[1.5px] border-line bg-white px-6 py-3 font-display text-[13px] font-semibold text-ink transition-colors hover:border-ink">
            {GoogleIcon} Влез с Google
          </button>

          <div className="flex items-center gap-3 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-mid">
            <span className="h-px flex-1 bg-line" /> или <span className="h-px flex-1 bg-line" />
          </div>

          <Form method="POST" className="space-y-4">
            <input type="hidden" name="stage" value="email" />
            <div>
              <label htmlFor="email" className={authLabel}>Имейл</label>
              <input id="email" type="email" name="email" autoComplete="email" required placeholder="you@example.com" className={authInput} />
            </div>
            <div>
              <label htmlFor="password" className={authLabel}>Парола</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} name="password" autoComplete="current-password" className={`${authInput} pr-11`} />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Скрий паролата' : 'Покажи паролата'} className="absolute right-3 top-1/2 -translate-y-1/2 text-mid transition-colors hover:text-ink">
                  {showPw ? EyeOffIcon : EyeIcon}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <label className="flex items-center gap-2 text-mid">
                <input type="checkbox" name="remember" className="size-4 accent-ink" /> Запомни ме
              </label>
              <Link to="/account/login" className="font-medium text-ink underline underline-offset-2 hover:text-red">Забравена парола?</Link>
            </div>
            {actionData?.stage === 'email' && actionData.error ? <p className="text-[13px] text-red">{actionData.error}</p> : null}
            <button type="submit" disabled={isSubmitting} className={authBtn}>{isSubmitting ? 'Изпращане…' : 'Вход'}</button>
            <p className="pt-1 text-center text-[12px] leading-relaxed text-mid">За вход ще ти изпратим 6-цифрен код на имейла.</p>
          </Form>
        </div>
      ) : (
        <Form method="POST" className="mt-7 space-y-4">
          <input type="hidden" name="stage" value="code" />
          <input type="hidden" name="email" value={email} />
          <p className="text-[14px] text-mid">Изпратихме код на <strong className="text-ink">{email}</strong>.</p>
          <div>
            <label htmlFor="code" className={authLabel}>Код за вход</label>
            <input id="code" type="text" name="code" inputMode="numeric" pattern="\d{6}" maxLength={6} autoComplete="one-time-code" required autoFocus className={`${authInput} text-center text-[20px] tracking-[0.4em]`} />
          </div>
          {actionData?.stage === 'code' && actionData.error ? <p className="text-[13px] text-red">{actionData.error}</p> : null}
          <button type="submit" disabled={isSubmitting} className={authBtn}>{isSubmitting ? 'Проверка…' : 'Влез'}</button>
          <p className="text-center text-[13px] text-mid">Не получи код? <Link to="/account/login" className="font-semibold text-ink underline underline-offset-2 hover:text-red">Опитай пак</Link></p>
        </Form>
      )}
    </AuthLayout>
  );
}
