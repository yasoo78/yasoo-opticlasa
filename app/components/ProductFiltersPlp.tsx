import {useState, type ReactNode} from 'react';
import {useSearchParams, useNavigate} from 'react-router';
import type {Filter} from '@cloudcart/nitrogen';
import {filterInputToParam, isFilterActive} from '~/lib/filters';

/**
 * Category/PLP sidebar filters — adapted from the Salomon mirror spec §8.B.
 * Accordion boxes (default closed), sort radios first, checkbox facets,
 * 26px colour dots for the Цвят facet. Размер is a plain checkbox list (no
 * special pill grid). Everything drives URL search params.
 */

const SORTS: Array<{value: string; label: string}> = [
  {value: '', label: 'Препоръчани'},
  {value: 'created-desc', label: 'Най-нови'},
  {value: 'price-asc', label: 'Цена: ниска › висока'},
  {value: 'price-desc', label: 'Цена: висока › ниска'},
  {value: 'title-asc', label: 'По име'},
];

// Bulgarian colour slug/name → hex. The API's swatchColor wins when present;
// this is the fallback. Extended for Opticlasa eyewear colours (havana etc.).
const COLOR_HEX: Record<string, string> = {
  cheren: '#111111', черен: '#111111', черно: '#111111', черна: '#111111',
  byal: '#ffffff', бял: '#ffffff', бяло: '#ffffff', бяла: '#ffffff',
  siv: '#8c8c8c', сив: '#8c8c8c', сиво: '#8c8c8c', сива: '#8c8c8c',
  kafyav: '#6b4a2f', кафяв: '#6b4a2f', кафяво: '#6b4a2f', кафява: '#6b4a2f',
  svetlokafyav: '#c9a06a', светлокафяв: '#c9a06a',
  zelen: '#6f7a3f', зелен: '#6f7a3f', зелено: '#6f7a3f', зелена: '#6f7a3f',
  sin: '#2f4d80', син: '#2f4d80', синьо: '#2f4d80', синя: '#2f4d80',
  cherven: '#cc2b1d', червен: '#cc2b1d', червено: '#cc2b1d', червена: '#cc2b1d',
  lilav: '#7b3fa0', лилав: '#7b3fa0', лилаво: '#7b3fa0',
  rozov: '#e87fb0', розов: '#e87fb0', розово: '#e87fb0',
  zhalt: '#e8d24a', жълт: '#e8d24a', жълто: '#e8d24a',
  oranzhev: '#e8763a', оранжев: '#e8763a', оранжево: '#e8763a',
  turkoaz: '#6fd0c0', тюркоаз: '#6fd0c0',
  bezhov: '#d8c4a0', бежов: '#d8c4a0', бежово: '#d8c4a0',
  zlaten: '#c9a85a', златен: '#c9a85a', златно: '#c9a85a', златист: '#c9a85a',
  srebaren: '#bdbdbd', сребърен: '#bdbdbd', сребрист: '#bdbdbd', сребристо: '#bdbdbd',
  // eyewear-specific
  havana: '#6b4a2f', хавана: '#6b4a2f', костенурка: '#6b4a2f', костенуркова: '#6b4a2f',
  demihavana: '#8a5a2b', демихавана: '#8a5a2b', meden: '#b4762b', меден: '#b4762b',
  prozrachen: '#f2f2f2', прозрачен: '#f2f2f2', прозрачно: '#f2f2f2', clear: '#f2f2f2',
  огледало: '#9aa7b3', огледален: '#9aa7b3', огледално: '#9aa7b3',
  димчат: '#5a5a5a', опушен: '#5a5a5a', опушено: '#5a5a5a', smoke: '#5a5a5a',
  розово_злато: '#d6a98a', многоцветен: '#888888', градиент: '#9a8f86',
};
const HEX_KEYS = Object.keys(COLOR_HEX).sort((a, b) => b.length - a.length);
function colorHex(name: string, swatch?: string): string {
  if (swatch) return swatch;
  const n = name?.toLowerCase?.()?.trim() ?? '';
  if (!n) return '#cccccc';
  if (COLOR_HEX[n]) return COLOR_HEX[n];
  for (const tok of n.split(/[\s/,.()-]+/)) if (COLOR_HEX[tok]) return COLOR_HEX[tok];
  for (const k of HEX_KEYS) if (k.length > 3 && n.includes(k)) return COLOR_HEX[k];
  return '#cccccc';
}
const isColorLabel = (label?: string) => /цвят|color|colour|цвета/i.test(label ?? '');

const LABEL_MAP: Record<string, string> = {
  brands: 'Марки', brand: 'Марка', color: 'Цвят', colour: 'Цвят', price: 'Цена', size: 'Размер',
  gender: 'Пол', availability: 'Наличност', shape: 'Форма', material: 'Материал', frame: 'Рамка', lens: 'Стъкла',
  type: 'Вид продукт', collection: 'Колекция',
};
function cleanLabel(label: string | undefined, fallback: string): string {
  if (!label || /widget|listing|filter\.|[a-z]+\.[a-z]+\./i.test(label) || /^[A-Z._]+$/.test(label)) return fallback;
  return LABEL_MAP[label.toLowerCase().trim()] ?? label;
}

export function ProductFiltersPlp({filters = []}: {filters?: Filter[]}) {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const currentSort = sp.get('sort') ?? '';

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(sp);
    value ? p.set(key, value) : p.delete(key);
    ['cursor', 'direction', 'page'].forEach((k) => p.delete(k));
    navigate(`?${p.toString()}`, {preventScrollReset: true});
  }
  function toggle(input: string) {
    const param = filterInputToParam(input);
    if (!param) return;
    const p = new URLSearchParams(sp);
    const existing = p.getAll(param.key);
    if (existing.includes(param.value)) {
      p.delete(param.key);
      existing.filter((v) => v !== param.value).forEach((v) => p.append(param.key, v));
    } else p.append(param.key, param.value);
    ['cursor', 'direction', 'page'].forEach((k) => p.delete(k));
    navigate(`?${p.toString()}`, {preventScrollReset: true});
  }

  // "Форма" filter — pulled to the very top, open by default, rendered as icon tiles.
  const shape = filters.find((f) => cleanLabel(f.label, '') === 'Форма' || /форма/i.test(f.label ?? ''));
  const rest = filters.filter((f) => f !== shape);

  return (
    <div>
      {shape && <ShapeFilter filter={shape} sp={sp} toggle={toggle} />}

      <Accordion title="Сортирай по" current={SORTS.find((s) => s.value === currentSort)?.label}>
        <ul>
          {SORTS.map((s) => (
            <li key={s.value}>
              <button type="button" onClick={() => setParam('sort', s.value)} className="flex w-full items-center gap-[11px] py-[7px] text-left text-[14px] text-[#222]">
                <Radio on={currentSort === s.value} /> {s.label}
              </button>
            </li>
          ))}
        </ul>
      </Accordion>

      {rest.map((f) => (
        <FilterBox key={f.id} filter={f} sp={sp} toggle={toggle} setParam={setParam} />
      ))}
    </div>
  );
}

/* "Форма" facet rendered as icon + text tiles (open by default, always first). */
function ShapeFilter({filter, sp, toggle}: {filter: Filter; sp: URLSearchParams; toggle: (i: string) => void}) {
  return (
    <Accordion title="Форма" defaultOpen>
      <div className="flex flex-wrap gap-2 pt-1">
        {filter.values.map((v) => {
          const on = isFilterActive(sp, v.input);
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => toggle(v.input)}
              title={`${v.label} (${v.count})`}
              className={`flex items-center gap-2 rounded-[10px] border px-2.5 py-2 text-[12px] font-medium transition-colors ${on ? 'border-ink bg-ink text-white' : 'border-[#dcdcdc] text-ink hover:border-ink'}`}
            >
              <ShapeIcon label={v.label} className="h-[17px] w-9 shrink-0" />
              <span>{v.label}</span>
            </button>
          );
        })}
      </div>
    </Accordion>
  );
}

/* Line-art glasses icons per shape, matched from the Bulgarian value label. */
function ShapeIcon({label, className}: {label: string; className?: string}) {
  const n = (label ?? '').toLowerCase();
  const key =
    n.includes('авиатор') ? 'aviator'
    : n.includes('квадрат') ? 'square'
    : (n.includes('котеш') || n.includes('пеперуд')) ? 'cateye'
    : n.includes('кръгл') ? 'round'
    : n.includes('маск') ? 'mask'
    : n.includes('правоъгъл') ? 'rect'
    : n.includes('спорт') ? 'sport'
    : n.includes('овал') ? 'oval'
    : 'round';
  const P: Record<string, ReactNode> = {
    round: (<>
      <circle cx="13" cy="11" r="7.5" /><circle cx="35" cy="11" r="7.5" /><path d="M20.5 11h7" />
      <path d="M4 8 2.5 8.6M44 8l1.5 .6" />
    </>),
    oval: (<>
      <ellipse cx="13" cy="11" rx="8.5" ry="5.8" /><ellipse cx="35" cy="11" rx="8.5" ry="5.8" /><path d="M21.5 11h5" />
    </>),
    square: (<>
      <rect x="4.5" y="4.5" width="15" height="14" rx="2.5" /><rect x="28.5" y="4.5" width="15" height="14" rx="2.5" /><path d="M19.5 9h9" />
    </>),
    rect: (<>
      <rect x="3" y="6.5" width="17.5" height="9.5" rx="2" /><rect x="27.5" y="6.5" width="17.5" height="9.5" rx="2" /><path d="M20.5 11h7" />
    </>),
    aviator: (<>
      <path d="M4.5 7C4 6 12 6 12 6c8 0 7.5 3 7.5 3-1.5 9-8 9-8 9-6 0-7-10-7-10Z" />
      <path d="M43.5 7c.5-1-7.5-1-7.5-1-8 0-7.5 3-7.5 3 1.5 9 8 9 8 9 6 0 7-10 7-10Z" />
      <path d="M19.5 8C24 6 28.5 8 28.5 8" />
    </>),
    cateye: (<>
      <path d="M3 7.5C4 6.5 12 7.5 12 7.5c8 1 7 4.5 7 4.5-2 3.5-8 3-8 3-6.5-.5-8-5.5-8-5.5C2.8 8.2 3 7.5 3 7.5Z" />
      <path d="M45 7.5C44 6.5 36 7.5 36 7.5c-8 1-7 4.5-7 4.5 2 3.5 8 3 8 3 6.5-.5 8-5.5 8-5.5.2-1.3 0-2 0-2Z" />
      <path d="M19 9.5C24 8 29 9.5 29 9.5" />
    </>),
    mask: (<>
      <path d="M4 7C24 4 44 7 44 7c-1 7-4 9.5-4 9.5C24 19 8 16.5 8 16.5 5 14 4 7 4 7Z" />
      <path d="M24 4.8V7" />
    </>),
    sport: (<>
      <path d="M3 8 20 6.5c2.5 0 2.5 2.5 2.5 2.5l-1 4.5C13 15.5 4 13 4 13 2 10.5 3 8 3 8Z" />
      <path d="M45 8 28 6.5c-2.5 0-2.5 2.5-2.5 2.5l1 4.5C36 15.5 44 13 44 13c2-2.5 1-5 1-5Z" />
    </>),
  };
  return (
    <svg viewBox="0 0 48 22" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {P[key]}
    </svg>
  );
}

function Accordion({title, current, defaultOpen = false, children}: {title: string; current?: string; defaultOpen?: boolean; children: ReactNode}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e7e7e7]">
      <button type="button" onClick={() => setOpen((o) => !o)} className="relative flex w-full items-center py-4 pl-0.5 pr-6 text-left font-display text-[12px] font-semibold uppercase tracking-[0.03em] text-ink">
        {title}
        {current && <span className="ml-1 font-sans font-normal normal-case text-muted">: {current}</span>}
        <svg className={`absolute right-1.5 size-3 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && <div className="px-0.5 pb-4 pt-0.5">{children}</div>}
    </div>
  );
}

function Radio({on}: {on: boolean}) {
  return (
    <span className={`flex size-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${on ? 'border-ink' : 'border-[#c4c4c4]'}`}>
      {on && <span className="size-2.5 rounded-full bg-ink" />}
    </span>
  );
}
function Check({on}: {on: boolean}) {
  return (
    <span className={`flex size-5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] ${on ? 'border-ink bg-ink' : 'border-[#c4c4c4]'}`}>
      {on && <svg className="size-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>}
    </span>
  );
}

function FilterBox({filter, sp, toggle, setParam}: {filter: Filter; sp: URLSearchParams; toggle: (i: string) => void; setParam: (k: string, v: string) => void}) {
  const label = cleanLabel(filter.label, 'Филтър');

  // Native colour swatch facet, OR any colour-labelled LIST facet
  // (Цвят на стъклата / Цвят на рамката) — render colour dots like Salomon.
  if (filter.type === 'SWATCH_COLOR' || (filter.type === 'LIST' && isColorLabel(filter.label))) {
    return (
      <Accordion title={label}>
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-1.5">
          {filter.values.map((v) => {
            const on = isFilterActive(sp, v.input);
            const hex = colorHex(v.label, (v as any).swatchColor);
            return (
              <button key={v.id} type="button" onClick={() => toggle(v.input)} title={`${v.label} (${v.count})`} className="flex items-center gap-2.5 py-1.5 text-left text-[14px] text-[#222]">
                <span className={`size-[26px] shrink-0 rounded-full ${on ? 'shadow-[0_0_0_2px_#fff,0_0_0_4px_#111]' : ''}`} style={{backgroundColor: hex, border: `1px solid ${/^#f[2-9a-f]/i.test(hex) ? '#bbbbbb' : '#dcdcdc'}`}} />
                <span className="truncate">{v.label}</span>
              </button>
            );
          })}
        </div>
      </Accordion>
    );
  }

  // LIST facets (incl. Размер) — plain checkbox list, no special pill grid.
  if (filter.type === 'LIST') {
    return (
      <Accordion title={label}>
        <ul>
          {filter.values.map((v) => (
            <li key={v.id}>
              <button type="button" onClick={() => toggle(v.input)} className="flex w-full items-center gap-[11px] py-[7px] text-left text-[14px] text-[#222]">
                <Check on={isFilterActive(sp, v.input)} />
                <span className="flex-1 truncate">{v.label}</span>
                <span className="shrink-0 text-[12px] text-crumb">({v.count})</span>
              </button>
            </li>
          ))}
        </ul>
      </Accordion>
    );
  }

  if (filter.type === 'PRICE_RANGE') {
    const min = filter.minValue?.value ?? 0;
    const max = filter.maxValue?.value ?? 0;
    return (
      <Accordion title={cleanLabel(filter.label, 'Цена')}>
        <div className="flex items-center gap-2">
          <input type="number" placeholder={String(min)} defaultValue={sp.get('minPrice') ?? ''} onBlur={(e) => setParam('minPrice', e.target.value)} className="form-input w-full rounded-md border-line px-2 py-2 text-[13px] focus:border-ink focus:ring-0" />
          <span className="shrink-0 text-crumb">—</span>
          <input type="number" placeholder={String(max)} defaultValue={sp.get('maxPrice') ?? ''} onBlur={(e) => setParam('maxPrice', e.target.value)} className="form-input w-full rounded-md border-line px-2 py-2 text-[13px] focus:border-ink focus:ring-0" />
        </div>
      </Accordion>
    );
  }

  if (filter.type === 'BOOLEAN') {
    const tv = filter.values.find((v) => {
      try { const p = JSON.parse(v.input); return p.onSale || p.isNew || p.isFeatured; } catch { return false; }
    });
    if (!tv) return null;
    return (
      <Accordion title={label}>
        <button type="button" onClick={() => toggle(tv.input)} className="flex w-full items-center gap-[11px] py-[7px] text-left text-[14px] text-[#222]">
          <Check on={isFilterActive(sp, tv.input)} /> <span className="flex-1">{label}</span> <span className="text-[12px] text-crumb">({tv.count})</span>
        </button>
      </Accordion>
    );
  }

  return null;
}
