/**
 * Premium "selections" (smart collections). The storefront API doesn't expose smart
 * collections, so we list their products by handle here. Refresh these lists if the
 * selections change in the admin.
 */
export const SELECTIONS: Record<string, {title: string; products: string[]}> = {
  'premium-kolekciya': {
    title: 'Premium колекция',
    products: [
      'bottega-venetta-bv1386s-001', // Bottega Venetta BV1386S 001
      'cartier-ct0357s-004', // Cartier CT0357S 004
      'cartier-ct0362s-001', // Cartier CT0362S 001
      'dita-aeova-a-01', // Dita AEOVA A - 01
      'bottega-venetta-bv1273s-003', // Bottega Venetta BV1273S 003
      'cartier-ct0012s-004', // Cartier CT0012S 004
      'dita-aegeus-02', // Dita Aegeus 02
      'bottega-venetta-bv1273s-005', // Bottega Venetta BV1273S 005
      'cartier-ct0012s-006', // Cartier CT0012S 006
      'dita-amorly-03', // Dita Amorly 03
      'bottega-venetta-bv1273s-007', // Bottega Venetta BV1273S 007
      'cartier-ct0031rs-002', // Cartier CT0031RS 002
      'dita-ash-b', // Dita Ash B
    ],
  },
  'premium-kolekciya-jeni': {
    title: 'Premium колекция жени',
    products: [
      'etro-etro-0009s-pjpgb', // Etro ETRO 0009/S PJP/GB
      'ralph-lauren-0ra5301u-50018g', // Ralph Lauren 0RA5301U 50018G
      'tiffanyco-0tf3088-610516', // Tiffany&co 0TF3088 610516
      'etro-etro-0011s-71cha', // Etro ETRO 0011/S 71C/HA
      'prada-0pr-07ys-1ab0a7', // Prada 0PR 07YS 1AB0/A7
      'furla-sfu684-0700', // Furla SFU684 0700
    ],
  },
  'premium-kolekciya-maje': {
    title: 'Premium колекция мъже',
    products: [
      'balenciaga-bb0299s-001', // Balenciaga BB0299S 001
      'david-beckham-db-1199gs-kb73o', // David Beckham DB 1199/G/S KB7/3O
      'dsquared-d2-0028s-06j9k', // Dsquared D2 0028/S 06J/9K
      'bottega-venetta-bv1273s-005', // Bottega Venetta BV1273S 005
      'gucci-gg0528s-007', // Gucci GG0528S 007
      'hugo-boss-1317s-284ir', // Hugo Boss 1317/S 284/IR
    ],
  },
};
