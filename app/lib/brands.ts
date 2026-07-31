/** Brand (vendor) logos. Only some vendors have an uploaded logo; the rest fall back to text. */
export const VENDORS_BASE = 'https://yasoo-opticlasa.cloudcart.net/cdn/img/vendors';

export const BRAND_LOGOS = [
  {name: 'Armani Exchange', handle: 'armani-exchange', img: '23/23.png'},
  {name: 'Balenciaga', handle: 'balenciaga', img: '28/28.svg'},
  {name: 'Blumarine', handle: 'blumarine', img: '98/98.png'},
  {name: 'Bulgari', handle: 'bulgari', img: '99/99.svg'},
  {name: 'Carolina Herrera', handle: 'carolina-herrera', img: '36/36.png'},
  {name: 'Carrera', handle: 'carrera', img: '39/39.png'},
  {name: 'Cartier', handle: 'cartier', img: '41/41.png'},
  {name: 'Chopard', handle: 'chopard', img: '42/42.webp'},
  {name: 'David Beckham', handle: 'david-beckham', img: '45/45.png'},
  {name: 'Davidoff', handle: 'davidoff', img: '47/47.png'},
  {name: 'Dita', handle: 'dita', img: '100/100.png'},
  {name: 'Dolce&gabbana', handle: 'dolce-gabbana', img: '50/50.png'},
  {name: 'Etro', handle: 'etro', img: '53/53.png'},
  {name: 'Gucci', handle: 'gucci', img: '56/56.png'},
  {name: 'Police', handle: 'police', img: '114/114.png'},
  {name: 'Prada', handle: 'prada', img: '80/80.png'},
  {name: 'Ray-Ban', handle: 'ray-ban-1', img: '123/123.png'},
  {name: 'Saint Laurent', handle: 'saint-laurent', img: '87/87.png'},
  {name: 'Tom Ford', handle: 'tom-ford', img: '88/88.png'},
];

const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const LOGO_MAP: Record<string, string> = {};
for (const b of BRAND_LOGOS) LOGO_MAP[norm(b.name)] = `${VENDORS_BASE}/${b.img}?width=240&v=2`;
// common label variants → canonical
LOGO_MAP[norm('Ray Ban')] = LOGO_MAP[norm('Ray-Ban')];

/** Returns a logo URL for a brand name, or undefined when the brand has no logo. */
export function brandLogo(name: string): string | undefined {
  return LOGO_MAP[norm(name)];
}

/**
 * All brands available per category (for the quick brand-filter tiles). The storefront
 * facet only exposes the top ~10 brands, so we keep the full per-category list here
 * (main categories are the union of their gender sub-categories). Values match the
 * store's vendor names, so they drive the `?vendor=` product filter directly.
 */
// Every brand with products (used on the "Нови" listing, which spans all brands).
export const ALL_BRANDS: string[] = ['Armani Exchange', 'Arnette', 'Balenciaga', 'Blumarine', 'Bottega Venetta', 'Bulgari', 'Burberry', 'Carolina Herrera', 'Carolina Lemke', 'Carrera', 'Cartier', 'Chopard', 'David Beckham', 'Davidoff', 'Dita', 'Dolce&gabbana', 'Dsquared', 'Emporio Armani', 'Etro', 'Eyepetizer', 'Furla', 'Givenchy', 'Gucci', 'Guess', 'Hugo Boss', 'Jimmy Choo', 'Liu Jo', 'Longchamp', 'Marc Jacobs', 'Max Mara', 'Max&co', 'Michael Kors', 'Miu Miu', 'Montblanc', 'Moschino', 'Oakley', 'Persol', 'Pierre Cardin', 'Polaroid', 'Police', 'Porsche Design', 'Prada', 'Ralph Lauren', 'Ray Ban', 'Ray Ban - Junior', 'Ray-Ban', 'Saint Laurent', 'Superdry', 'Tiffany&co', 'Tom Ford', 'Tommy Hilfiger', 'Under Armour', 'Versace', 'Vogue'];

export const CATEGORY_BRANDS: Record<string, string[]> = {
  'slanchevi-ochila': ['Armani Exchange', 'Arnette', 'Balenciaga', 'Bottega Venetta', 'Burberry', 'Carolina Lemke', 'Carrera', 'Cartier', 'Chopard', 'David Beckham', 'Davidoff', 'Dita', 'Dsquared', 'Etro', 'Eyepetizer', 'Furla', 'Givenchy', 'Gucci', 'Guess', 'Hugo Boss', 'Jimmy Choo', 'Liu Jo', 'Marc Jacobs', 'Max Mara', 'Max&co', 'Michael Kors', 'Miu Miu', 'Montblanc', 'Moschino', 'Oakley', 'Persol', 'Pierre Cardin', 'Polaroid', 'Prada', 'Ralph Lauren', 'Ray Ban', 'Ray Ban - Junior', 'Ray-Ban', 'Saint Laurent', 'Superdry', 'Tiffany&co', 'Tom Ford', 'Under Armour', 'Versace', 'Vogue'],
  'optical-glasses': ['Blumarine', 'Bulgari', 'Carolina Herrera', 'Davidoff', 'Dita', 'Dolce&gabbana', 'Dsquared', 'Emporio Armani', 'Gucci', 'Hugo Boss', 'Liu Jo', 'Longchamp', 'Marc Jacobs', 'Max Mara', 'Montblanc', 'Pierre Cardin', 'Police', 'Porsche Design', 'Saint Laurent', 'Tommy Hilfiger'],
  'zheni': ['Arnette', 'Balenciaga', 'Bottega Venetta', 'Burberry', 'Carolina Lemke', 'Cartier', 'Chopard', 'David Beckham', 'Davidoff', 'Dita', 'Dsquared', 'Etro', 'Eyepetizer', 'Furla', 'Givenchy', 'Guess', 'Jimmy Choo', 'Liu Jo', 'Marc Jacobs', 'Max Mara', 'Max&co', 'Michael Kors', 'Miu Miu', 'Moschino', 'Persol', 'Pierre Cardin', 'Polaroid', 'Prada', 'Ralph Lauren', 'Ray Ban', 'Ray-Ban', 'Saint Laurent', 'Superdry', 'Tiffany&co', 'Tom Ford', 'Under Armour', 'Versace'],
  'mazhe': ['Armani Exchange', 'Arnette', 'Carrera', 'Cartier', 'Chopard', 'David Beckham', 'Dsquared', 'Gucci', 'Guess', 'Hugo Boss', 'Montblanc', 'Moschino', 'Oakley', 'Pierre Cardin', 'Polaroid', 'Ray-Ban', 'Tom Ford', 'Versace'],
  'detsa': ['Oakley', 'Polaroid', 'Ray Ban - Junior', 'Vogue'],
  'optical-glasses-jeni': ['Blumarine', 'Bulgari', 'Carolina Herrera', 'Davidoff', 'Dita', 'Dolce&gabbana', 'Dsquared', 'Gucci', 'Longchamp', 'Marc Jacobs', 'Max Mara', 'Montblanc', 'Pierre Cardin', 'Saint Laurent', 'Tommy Hilfiger'],
  'optical-glasses-maje': ['Davidoff', 'Dita', 'Dolce&gabbana', 'Emporio Armani', 'Hugo Boss', 'Pierre Cardin', 'Police', 'Porsche Design'],
  'optical-glasses-deca': ['Liu Jo', 'Police'],
};
