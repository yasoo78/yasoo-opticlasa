import {Form, Link} from 'react-router';
import {useEffect, useRef} from 'react';
import {XMarkIcon, MagnifyingGlassIcon} from '@heroicons/react/24/outline';
import {useAside} from './Aside';

const POPULAR = ['Слънчеви очила', 'Диоптрични рамки', 'Ray-Ban', 'Cartier', 'Dita'];

/** Full-width search panel that drops down from the top (opened from the header search icon). */
export function SearchOverlay() {
  const {type, close} = useAside();
  const open = type === 'search';
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close]);

  return (
    <>
      {/* dimmed backdrop over the rest of the page */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[500] bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />

      {/* the panel itself */}
      <div
        className={`fixed inset-x-0 top-0 z-[510] bg-ink text-white transition-transform duration-300 ${open ? 'translate-y-0 shadow-[0_20px_60px_rgba(0,0,0,0.5)]' : '-translate-y-full'}`}
        style={{transitionTimingFunction: 'var(--ease-snap)'}}
      >
        <div className="mx-auto max-w-3xl px-6 py-14 text-center">
          <button
            type="button"
            onClick={close}
            aria-label="Затвори"
            className="mx-auto mb-10 flex size-11 items-center justify-center text-white/70 transition-colors hover:text-white"
          >
            <XMarkIcon className="size-8" strokeWidth={1.5} />
          </button>

          <h2 className="mb-6 font-display text-[22px] font-bold uppercase tracking-[0.03em]">Търси в Opticlasa</h2>

          <Form method="get" action="/search" onSubmit={close} className="relative mx-auto max-w-2xl" role="search">
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Търси очила, марки, модели…"
              autoComplete="off"
              className="w-full rounded-full border border-white/15 bg-white/[0.06] py-4 pl-6 pr-16 text-[15px] text-white placeholder-white/40 outline-none transition-colors focus:border-white/40"
            />
            <button
              type="submit"
              aria-label="Търси"
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-white/85"
            >
              <MagnifyingGlassIcon className="size-5" />
            </button>
          </Form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px]">
            <span className="font-semibold uppercase tracking-wide text-white/80">Най-често търсени:</span>
            {POPULAR.map((t) => (
              <Link
                key={t}
                to={`/search?q=${encodeURIComponent(t)}`}
                onClick={close}
                className="text-white/60 transition-colors hover:text-red"
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
