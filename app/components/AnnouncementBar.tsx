import {Link} from 'react-router';
import {useEffect, useState} from 'react';

const MESSAGES: Array<{text: string; link?: {label: string; to: string}}> = [
  {text: 'Безплатна доставка при поръчка над 100 лв'},
  {text: '–40% на втора рамка', link: {label: 'Виж промоцията', to: '/collections'}},
  {text: 'Изплащане с TBI Bank · от 50 лв/мес'},
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (MESSAGES.length < 2) return;
    let swap: ReturnType<typeof setTimeout>;
    const cycle = setInterval(() => {
      setShow(false); // fade current out
      swap = setTimeout(() => {
        setI((p) => (p + 1) % MESSAGES.length);
        setShow(true); // fade next in
      }, 450);
    }, 4000);
    return () => {
      clearInterval(cycle);
      clearTimeout(swap);
    };
  }, []);

  const m = MESSAGES[i];

  return (
    <div className="relative z-[300] flex h-9 items-center justify-center overflow-hidden bg-ink text-paper">
      <span
        className={`flex items-center text-xs tracking-[0.03em] whitespace-nowrap transition-opacity duration-[450ms] ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {m.text}
        {m.link && (
          <>
            {' · '}
            <Link to={m.link.to} className="ml-1 border-b border-white/30 hover:border-white">
              {m.link.label}
            </Link>
          </>
        )}
      </span>
    </div>
  );
}
