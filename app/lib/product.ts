import type {Product} from '@cloudcart/nitrogen';

/** Multi-word eyewear brands that must not be split on the first space. */
export const KNOWN_BRANDS = [
  'Ray Ban', 'Ray-Ban', 'Tom Ford', 'Saint Laurent', 'Carolina Herrera', 'Carolina Lemke',
  'Marc Jacobs', 'Michael Kors', 'Emporio Armani', 'Giorgio Armani', 'Dolce Gabbana',
  'Calvin Klein', 'Paul Smith', 'Hugo Boss', 'Jimmy Choo', 'Max Mara', 'Salvatore Ferragamo',
  'David Beckham', 'Porsche Design',
];

export function getProp(p: Product, re: RegExp): string {
  const prop = ((p as any).properties ?? []).find((x: any) => re.test(x.name));
  return prop?.values?.[0] ?? '';
}

/** BG price format: amount + currency SUFFIX, e.g. "138.00 лв." / "59.00 €". */
export function formatMoney(money: {amount?: string | number; currencyCode?: string} | null | undefined): string {
  if (!money?.amount && money?.amount !== 0) return '';
  const n = typeof money.amount === 'string' ? parseFloat(money.amount) : money.amount;
  if (Number.isNaN(n)) return '';
  const sym = money.currencyCode === 'EUR' ? '€' : money.currencyCode === 'BGN' ? 'лв.' : money.currencyCode ?? '';
  return `${n.toFixed(2)} ${sym}`.trim();
}

/** Small grey card subtitle — eyewear shows the product type (e.g. "Слънчеви очила"),
 *  falling back to the first colour. Empty string → the card omits the subtitle line. */
export function getSubtitle(p: Product): string {
  const type = (p as any).productType || getProp(p, /вид\s*продукт|тип|product\s*type|type/i);
  return type || getColor(p) || '';
}

/** Split an Opticlasa product title ("Ray Ban 3025 003/3F") into brand + model. */
export function splitBrandName(p: Product): {brand: string; name: string} {
  const propBrand = getProp(p, /бранд|марк|brand|производ/i);
  const title = p.title ?? '';
  if (propBrand) {
    return {brand: propBrand, name: title.toLowerCase().startsWith(propBrand.toLowerCase()) ? title.slice(propBrand.length).trim() || title : title};
  }
  const known = KNOWN_BRANDS.find((b) => title.toLowerCase().startsWith(b.toLowerCase()));
  if (known) return {brand: known, name: title.slice(known.length).trim() || title};
  const parts = title.split(' ');
  return {brand: parts[0] ?? '', name: parts.slice(1).join(' ') || title};
}

export function getColor(p: Product): string {
  const opt = ((p as any).options ?? []).find((o: any) => /цвят|цвета|color|colour/i.test(o.name));
  if (opt?.values?.length) return opt.values[0];
  return getProp(p, /цвят|color|colour/i);
}
