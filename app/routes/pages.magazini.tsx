import type {Route} from './+types/pages.magazini';
import {getSeoMeta} from '@cloudcart/nitrogen';
import {MapPin, Phone, Clock} from 'lucide-react';

export const meta: Route.MetaFunction = () =>
  getSeoMeta({title: 'Магазини | Opticlasa', description: 'Над 40 физически магазина Opticlasa в цялата страна — адреси, телефони и работно време.'});

type Shop = {name: string; address: string; phone: string; hours: string};

const SHOPS: Array<{city: string; stores: Shop[]}> = [
  {
    city: 'София',
    stores: [
      {name: 'Atelier Ottico', address: 'ул. Леге 8, 1000 София', phone: '+359 879 170247', hours: 'Пон–Пет 10:00–19:00 · Съб 11:00–18:00'},
      {name: 'Paradise Center', address: 'бул. „Черни връх" 100, 1407 София', phone: '+359 2 440 10 66', hours: 'Всеки ден 10:00–22:00'},
      {name: 'Promo Optic Paradise', address: 'бул. „Черни връх" 100, 1407 София', phone: '+359 885 655046', hours: 'Всеки ден 10:00–22:00'},
      {name: 'Ring Mall', address: 'Софийски околовръстен път 214, в.з. Симеоново', phone: '+359 877 742282', hours: 'Всеки ден 10:00–22:00'},
      {name: 'Garitage Park', address: 'ул. Донка Ушлинова 2, сграда 1, 1766 София', phone: '+359 877 235661', hours: 'Пон–Пет 10:30–20:00 · Съб 10:30–17:00'},
      {name: 'The Mall', address: 'бул. „Цариградско шосе" 115з, 1784 София', phone: '+359 2 878 78 79', hours: 'Всеки ден 10:00–22:00'},
      {name: 'The Mall (ниво 1)', address: 'бул. „Цариградско шосе" 115з, 1784 София', phone: '+359 876 403 300', hours: 'Всеки ден 10:00–22:00'},
      {name: 'Serdika Center', address: 'бул. „Ситняково" 48, 1505 София', phone: '+359 2 49 52 017', hours: 'Всеки ден 10:00–22:00'},
      {name: 'бул. „Витоша"', address: 'бул. „Витоша" 36, 1000 София', phone: '+359 879 831 688', hours: 'Пон–Съб 10:00–20:00 · Нед 11:30–18:30'},
      {name: 'ул. „Леге"', address: 'ул. Леге 6-8, 1000 София', phone: '+359 877 865 721', hours: 'Пон–Пет 10:00–19:00 · Съб 11:00–17:00'},
      {name: 'ул. „Алабин"', address: 'ул. „Алабин И. Вл." 31, 1000 София', phone: '+359 2 943 48 47', hours: 'Пон–Пет 10:00–19:30 · Съб 10:30–19:30'},
      {name: 'Mall of Sofia', address: 'бул. „Александър Стамболийски" 101, 1303 София', phone: '+359 877 238011', hours: 'Всеки ден 10:00–20:00'},
      {name: 'Bulgaria Mall', address: 'бул. „България" 69, 1404 София', phone: '+359 886 209986', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Park Center', address: 'бул. „Арсеналски" 2, 1421 София', phone: '+359 2 426 00 39', hours: 'Всеки ден 10:00–20:00'},
      {name: 'Sky City Mall', address: 'ул. „Коста Лулчев" 52, ж.к. Христо Смирненски', phone: '+359 877 239192', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Holiday Park Красно село', address: 'бул. „Никола Мушанов" 149А, 1373 София', phone: '+359 879 526783', hours: 'Всеки ден 10:30–19:30'},
      {name: 'МЦ Пентаграм', address: 'ул. Враня 109-111, 1309 София', phone: '+359 878 497467', hours: 'Пон–Пет 09:00–18:30'},
      {name: 'Promo Optic Generali', address: 'бул. „Княз Александър Дондуков" 79-81', phone: '+359 878 497533', hours: 'Пон–Пет 09:00–18:00'},
      {name: 'Promo Optic Раковски', address: 'ул. „Георги С. Раковски" 151', phone: '+359 878 380050', hours: 'Пон–Пет 10:00–19:00'},
      {name: 'Outlet West Mall', address: 'бул. „Царица Йоанна" 15, 1336 София', phone: '+359 877 742 254', hours: 'Всеки ден 10:00–20:00'},
      {name: 'Outlet Граф Игнатиев', address: 'ул. „Граф Игнатиев" 41-А, 1142 София', phone: '+359 2 988 54 10', hours: 'Пон–Пет 10:30–19:30 · Съб 10:30–17:30'},
      {name: 'Outlet Солунска', address: 'ул. „Солунска" 37, 1000 София', phone: '+359 2 986 71 00', hours: 'Пон–Пет 10:30–19:30 · Съб 10:30–17:30'},
      {name: 'Sofia Outlet Center', address: 'бул. „Цариградско шосе" 92A, 1729 София', phone: '+359 879 926 803', hours: 'Всеки ден 11:00–20:00'},
    ],
  },
  {
    city: 'Пловдив',
    stores: [
      {name: 'Княз Александър I-ви 12', address: 'ул. „Княз Александър I-ви" 12, 4000 Пловдив', phone: '+359 878 372 408', hours: 'Пон–Съб 10:00–19:30 · Нед 11:00–19:00'},
      {name: 'Plovdiv Plaza Mall', address: 'ул. Георги Странски 3, 4019 Пловдив', phone: '+359 885 390 144', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Mall Plovdiv', address: 'ул. „Перущица" 8, 4002 Пловдив', phone: '+359 32 25 01 38', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Княз Александър I-ви 32', address: 'ул. „Княз Александър I-ви" 32, 4000 Пловдив', phone: '+359 877 113 224', hours: 'Пон–Съб 10:00–19:30 · Нед 11:00–19:00'},
    ],
  },
  {
    city: 'Варна',
    stores: [
      {name: 'Delta Planet Varna', address: 'бул. Сливница 185, 9009 Варна', phone: '+359 887 121 996', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Grand Mall Varna', address: 'ул. „Академик Андрей Сахаров" 2, 9009 Варна', phone: '+359 878 66 0438', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Mall Varna', address: 'бул. „Владислав Варненчик" 186, 9009 Варна', phone: '+359 878 660431', hours: 'Всеки ден 10:00–20:00'},
      {name: 'бул. „Княз Борис I-ви"', address: 'бул. „Княз Борис I-ви" 29, 9000 Варна', phone: '+359 87 9627210', hours: 'Пон–Съб 10:00–20:00 · Нед 11:00–18:00'},
    ],
  },
  {
    city: 'Бургас',
    stores: [
      {name: 'Galleria Burgas', address: 'ул. „Янко Комитов" 6, 8001 Бургас', phone: '+359 56 911 839', hours: 'Всеки ден 10:00–21:00'},
      {name: 'Burgas Plaza', address: 'бул. „Транспортна", 8008 Бургас', phone: '+359 56 52 18 66', hours: 'Всеки ден 10:00–20:00'},
    ],
  },
  {
    city: 'Перник',
    stores: [
      {name: 'Holiday Park', address: 'ул. Захари Зограф 159, 2306 Перник', phone: '+359 87 8328581', hours: 'Всеки ден 10:30–19:00'},
      {name: 'Перник Плаза', address: 'бул. Юрий Гагарин 2А, 2300 Перник', phone: '+359 87 8384347', hours: 'Всеки ден 10:30–19:00'},
    ],
  },
  {
    city: 'Стара Загора',
    stores: [
      {name: 'Galleria Stara Zagora', address: 'ул. Хан Аспарух 30, 6000 Стара Загора', phone: '+359 876 547425', hours: 'Всеки ден 10:00–20:00'},
    ],
  },
  {
    city: 'Русе',
    stores: [
      {name: 'Mall Rousse', address: 'бул. Липник 121-Д, 7005 Русе', phone: '+359 876 301931', hours: 'Всеки ден 10:00–20:00'},
    ],
  },
  {
    city: 'Велико Търново',
    stores: [
      {name: 'бул. Независимост 42', address: 'бул. Независимост 42, 5000 Велико Търново', phone: '+359 878 326394', hours: 'Пон–Съб 10:00–19:00 · Нед 11:00–18:00'},
    ],
  },
  {
    city: 'Благоевград',
    stores: [
      {name: 'ул. Тодор Александров 23', address: 'ул. Тодор Александров 23, Благоевград', phone: '+359 876 763924', hours: 'Пон–Съб 10:00–19:00 · Нед 11:00–18:00'},
    ],
  },
  {
    city: 'Враца',
    stores: [
      {name: 'Holiday Park', address: 'бул. „2-ри юни", Източна промишлена зона, 3000 Враца', phone: '+359 877 241182', hours: 'Всеки ден 10:30–19:00'},
    ],
  },
  {
    city: 'Хасково',
    stores: [
      {name: 'Holiday Park Haskovo', address: 'ул. Димитровградско шосе, Хасково', phone: '+359 878 497466', hours: 'Всеки ден 10:30–19:00'},
    ],
  },
];

const TOTAL = SHOPS.reduce((n, c) => n + c.stores.length, 0);

export default function MagaziniPage() {
  return (
    <div className="w-full">
      {/* map — full-bleed at the very top, framed over Bulgaria */}
      <iframe
        title="Карта на магазините"
        src="https://maps.google.com/maps?q=Opticlasa+optika&ll=42.75,25.30&z=7&output=embed"
        className="block h-[400px] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />

      {/* header — below the map */}
      <div className="px-5 pt-10 md:px-10">
        <span className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-red">Opticlasa</span>
        <h1 className="mt-2.5 font-display text-[clamp(36px,5.5vw,68px)] font-extrabold uppercase leading-[0.98] tracking-[-0.02em] text-ink">Магазини</h1>
        <p className="mt-5 max-w-[680px] text-[16px] font-light leading-relaxed text-mid">
          Над {TOTAL} физически магазина в цялата страна. Заповядайте за професионална консултация,
          преглед на зрението и напасване на очила и лещи.
        </p>
      </div>

      {/* stores by city — 4 per row on wide screens */}
      <div className="px-5 py-12 md:px-10">
        <div className="flex flex-col gap-12">
          {SHOPS.map((group) => (
            <section key={group.city}>
              <div className="mb-5 flex items-baseline gap-3 border-b border-line pb-3">
                <h2 className="font-display text-[20px] font-extrabold uppercase tracking-[-0.01em] text-ink">{group.city}</h2>
                <span className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-mid">
                  {group.stores.length} {group.stores.length === 1 ? 'магазин' : 'магазина'}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.stores.map((s) => (
                  <StoreCard key={`${group.city}-${s.name}`} shop={s} city={group.city} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoreCard({shop, city}: {shop: Shop; city: string}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Opticlasa ${city} ${shop.name} ${shop.address}`)}`;
  return (
    <div className="flex flex-col rounded-xl border border-line bg-white p-5 transition-colors hover:border-ink">
      <h3 className="font-display text-[15px] font-bold uppercase tracking-[0.01em] text-ink">{shop.name}</h3>
      <div className="mt-3.5 flex flex-col gap-2.5 text-[13px] leading-snug text-mid">
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2.5 transition-colors hover:text-ink">
          <MapPin className="mt-[1px] size-4 shrink-0 text-red" strokeWidth={1.7} />
          <span>{shop.address}</span>
        </a>
        <a href={`tel:${shop.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2.5 transition-colors hover:text-ink">
          <Phone className="size-4 shrink-0 text-red" strokeWidth={1.7} />
          <span>{shop.phone}</span>
        </a>
        <div className="flex items-start gap-2.5">
          <Clock className="mt-[1px] size-4 shrink-0 text-red" strokeWidth={1.7} />
          <span>{shop.hours}</span>
        </div>
      </div>
    </div>
  );
}
