import {Link} from 'react-router';
import type {Shop, Menu} from '@cloudcart/nitrogen';

interface FooterProps {
  shop: Shop;
  menu: Menu | null;
}

const SHOP_LINKS = [
  {title: 'Слънчеви очила', url: '/collections/slanchevi-ochila'},
  {title: 'Диоптрични рамки', url: '/collections/optical-glasses'},
  {title: 'Контактни лещи', url: '/pages/kontaktni-leshti'},
  {title: 'Premium', url: '/premium'},
  {title: 'Outlet', url: '/outlet'},
  {title: 'Пробвай преди да купиш', url: '/pages/probvaj-predi-da-kupish'},
  {title: 'Нови продукти', url: '/selection/novi'},
];

const HELP_LINKS = [
  {title: 'Работа в Opticlasa', url: '/pages/rabota-v-opticlasa'},
  {title: 'Често задавани въпроси', url: '/pages/chesto-zadavani-vaprosi'},
  {title: 'Доставка и връщане', url: '/pages/dostavka-i-vrashtane'},
  {title: 'Гаранция', url: '/pages/garantsiya'},
  {title: 'Изплащане с TBI', url: '/pages/izplashtane-tbi'},
  {title: 'Корпоративни клиенти', url: '/pages/korporativni-klienti'},
  {title: 'За нас', url: '/pages/za-nas'},
  {title: 'Магазини', url: '/pages/magazini'},
  {title: 'Контакти', url: '/pages/kontakti'},
];

const PAYMENTS = ['Visa', 'Mastercard', 'Maestro', 'TBI'];

export function Footer({shop, menu}: FooterProps) {
  const shopLinks = menu?.items?.length ? menu.items : SHOP_LINKS;
  const name = (shop.name || 'opticlasa').toLowerCase();

  return (
    <footer className="relative overflow-hidden bg-ink">
      {/* top — 3 columns */}
      <div className="relative z-[2] grid gap-12 border-b border-white/[0.06] px-12 pb-12 pt-14 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="mb-3.5 font-display text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            Свържете се с нас
          </div>
          <div className="mb-4 font-display text-[28px] font-extrabold leading-tight text-white/80">
            Тук сме,
            <br />
            за да помогнем
          </div>
          <div className="text-[13px] font-light leading-[1.9] text-white/40">
            <span className="text-white/60">Пон–Пет, 9:00–17:00</span>
            <br />
            +359 2 868 75 32
            <br />
            +359 87 9977668
            <br />
            <br />
            <span className="text-white/60">Главен офис</span>
            <br />
            бул. Искърско шосе 7, сграда 6
            <br />
            София 1528
          </div>
        </div>

        <FooterCol heading="Магазин" links={shopLinks} />
        <FooterCol heading="Помощ" links={HELP_LINKS} />
      </div>

      {/* legal bar */}
      <div className="relative z-[2] flex flex-wrap items-center justify-between gap-2.5 border-t border-white/5 px-12 py-4">
        <div className="text-[10px] tracking-[0.02em] text-white/30">
          © {new Date().getFullYear()} {shop.name || 'Opticlasa'} / Mega Optic OOD &nbsp;·&nbsp;
          <Link to="/pages/obshti-usloviya" className="underline underline-offset-2 hover:text-white/60">
            Общи условия
          </Link>
          &nbsp;·&nbsp;
          <Link to="/pages/poveritelnost" className="underline underline-offset-2 hover:text-white/60">
            Поверителност
          </Link>
        </div>
        <div className="flex gap-1.5">
          {PAYMENTS.map((p) => (
            <span
              key={p}
              className="rounded-sm border border-white/[0.09] bg-white/[0.04] px-2 py-[3px] text-[9px] font-semibold uppercase tracking-[0.05em] text-white/20"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* giant clipped wordmark */}
      <div className="relative z-[1] overflow-hidden pt-0.5 leading-[0.82]">
        <span className="block select-none whitespace-nowrap px-2.5 font-display font-black lowercase leading-[0.86] tracking-[-0.03em] text-white/[0.065] text-[clamp(88px,17.5vw,210px)]">
          {name}
        </span>
      </div>
    </footer>
  );
}

function FooterCol({heading, links}: {heading: string; links: Array<{title: string; url: string}>}) {
  return (
    <div>
      <div className="mb-[18px] font-display text-[9px] font-bold uppercase tracking-[0.16em] text-white/30">
        {heading}
      </div>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={`${l.title}-${l.url}`}>
            <Link
              to={l.url}
              prefetch="intent"
              className="text-[13px] text-white/50 transition-colors hover:text-white/90"
            >
              {l.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
