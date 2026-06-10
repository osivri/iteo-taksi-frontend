import Image from 'next/image';
import Link from 'next/link';
import { IteoIcon, type IconName } from '@/components/ui/icons';

const portals: {
  href: string;
  icon: IconName;
  title: string;
  desc: string;
  benefit: string;
  primary?: boolean;
}[] = [
  {
    href: '/login',
    icon: 'building',
    title: 'Oda Yönetimi',
    desc: 'Duyuru, üye, finans ve operasyon yönetimi',
    benefit: 'Bekleyen işleri tek ekrandan yönetin',
    primary: true,
  },
  {
    href: '/giris?rol=sofor',
    icon: 'taxi',
    title: 'Şoför',
    desc: 'Hasılat, gider, plaka ve vardiya işlemleri',
    benefit: 'Günlük kazancınızı ve fişlerinizi takip edin',
  },
  {
    href: '/giris?rol=oda-uyesi',
    icon: 'user',
    title: 'Oda Üyesi',
    desc: 'Plaka yönetimi, gelir-gider, aidat ve oda hizmetleri',
    benefit: 'Plaka, ödeme ve oda hizmetlerine tek yerden ulaşın',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-iteo-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={96} height={96} className="mb-6 rounded-2xl shadow-lg" />
          <p className="text-sm font-semibold uppercase tracking-wide text-iteo-yellow">
            İstanbul Taksiciler Esnaf Odası
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">İTEO Dijital Kokpit</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Günlük işlerinizi hızlıca tamamlayın. Size uygun rolü seçin; özelleştirilmiş paneliniz açılır.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className={`group flex flex-col gap-4 rounded-2xl border p-6 transition ${
                portal.primary
                  ? 'border-iteo-yellow/50 bg-iteo-yellow/10 hover:border-iteo-yellow hover:bg-iteo-yellow/15'
                  : 'border-white/15 bg-white/5 hover:border-iteo-yellow/40 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                    portal.primary ? 'bg-iteo-yellow text-iteo-black' : 'bg-white/10 text-iteo-yellow'
                  }`}
                >
                  <IteoIcon name={portal.icon} size={24} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold group-hover:text-iteo-yellow">{portal.title}</h2>
                  <p className="mt-1 text-sm text-white/60">{portal.desc}</p>
                </div>
              </div>
              <p className="text-sm text-white/50">{portal.benefit}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-iteo-yellow">
                Panele git <span aria-hidden>→</span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 text-center text-sm text-white/50">
          <p>
            Destek için{' '}
            <a href="mailto:info@iteo.org.tr" className="text-iteo-yellow hover:underline">
              info@iteo.org.tr
            </a>{' '}
            adresine yazabilirsiniz.
          </p>
          <p>© {new Date().getFullYear()} İstanbul Taksiciler Esnaf Odası</p>
        </div>
      </div>
    </div>
  );
}
