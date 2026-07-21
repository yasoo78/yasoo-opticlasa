import {useState, useRef, useCallback, useEffect} from 'react';
import {ChevronLeft, Sun, Cloud, ArrowLeft, ArrowRight} from 'lucide-react';
import {topChromeBottom} from '~/lib/chrome';

/**
 * Before/after polarization demo — a draggable image-comparison slider inside a
 * centered modal dialog (dimmed backdrop over the page, not a full-screen takeover).
 *
 * Images: pass `before` (no polarization) and `after` (polarized) for real licensed photos.
 * If no `after` is given, the "polarized" side is simulated with a CSS filter (deeper
 * contrast/saturation + glare cut) on the same base scene — so we never ship third-party assets.
 */
export function LensEffectModal({
  open,
  onClose,
  lensName,
  title = 'Поляризация',
  before = '/img/editorial/hero-herrera.jpg',
  after,
}: {
  open: boolean;
  onClose: () => void;
  lensName?: string;
  title?: string;
  before?: string;
  after?: string;
}) {
  const [pos, setPos] = useState(50);
  const [topOffset, setTopOffset] = useState(68);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  }, []);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    setTopOffset(topChromeBottom());
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  // Global drag tracking so the handle keeps following the pointer.
  useEffect(() => {
    const move = (e: PointerEvent) => dragging.current && setFromClientX(e.clientX);
    const up = () => (dragging.current = false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [setFromClientX]);

  if (!open) return null;

  const polarizedFilter = 'saturate(1.55) contrast(1.14) brightness(0.92)';

  return (
    <div className="fixed inset-x-0 bottom-0 z-[400]" style={{top: topOffset}} role="dialog" aria-modal="true">
      {/* light, soft backdrop — click to close */}
      <div className="animate-fade-in absolute inset-0 bg-black/15 backdrop-blur-[2px]" onClick={onClose} />

      {/* right slide-in drawer (sits below the nav, rounded card feel) */}
      <aside className="animate-slide-in-right absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-hidden rounded-l-2xl bg-white shadow-[-16px_0_48px_rgba(0,0,0,0.16)]">
        {/* header */}
        <div className="flex items-center px-6 py-5">
          <button onClick={onClose} className="flex items-center gap-2.5 font-display text-[14px] font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:text-red">
            <ChevronLeft className="h-5 w-5" /> {title}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-7">
          {/* before / after comparison — inset, rounded */}
          <div
            ref={wrapRef}
            className="relative aspect-[16/10] w-full cursor-ew-resize select-none overflow-hidden rounded-xl bg-sand"
            onPointerDown={(e) => {
              dragging.current = true;
              setFromClientX(e.clientX);
            }}
          >
            <img src={after ?? before} alt="С поляризация" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={after ? undefined : {filter: polarizedFilter}} />
            <img src={before} alt="Без поляризация" draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{clipPath: `inset(0 ${100 - pos}% 0 0)`}} />

            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Без</span>
            <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">С поляризация</span>

            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.12)]" style={{left: `${pos}%`}} />
            <div
              role="slider"
              aria-label="Плъзни за сравнение"
              aria-valuenow={Math.round(pos)}
              tabIndex={0}
              onPointerDown={(e) => {
                e.stopPropagation();
                dragging.current = true;
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4));
                if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4));
              }}
              className="absolute top-1/2 flex h-11 w-[72px] -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center gap-2 rounded-full border border-black/10 bg-white shadow-[0_2px_14px_rgba(0,0,0,0.20)]"
              style={{left: `${pos}%`}}
            >
              <ArrowLeft className="h-4 w-4 text-ink" strokeWidth={2} />
              <ArrowRight className="h-4 w-4 text-ink" strokeWidth={2} />
            </div>
          </div>

          {/* description */}
          <div className="pt-7">
            <h3 className="font-display text-[18px] font-extrabold uppercase tracking-[-0.01em] text-ink">{lensName || 'Поляризирани лещи'}</h3>
            <p className="mt-3 text-[14px] leading-[1.7] text-mid">
              Поляризираните лещи елиминират отблясъците от отразяващи повърхности като вода, сняг и стъкло. Резултатът е по-наситен цвят, по-висок контраст и значително по-комфортно виждане при силна слънчева светлина.
            </p>
            <div className="mt-7 flex items-center gap-3.5 text-[11px] font-medium uppercase tracking-[0.1em] text-mid">
              Светлинни условия
              <Sun className="h-5 w-5 text-ink" strokeWidth={1.6} />
              <Cloud className="h-5 w-5 text-ink" strokeWidth={1.6} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
