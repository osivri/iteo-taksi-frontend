import Image from 'next/image';
import Link from 'next/link';

const portals = [
  {
    href: '/login',
    emoji: '🏛️',
    title: 'Oda Yönetimi',
    desc: 'Duyuru, üye, finans ve operasyon yönetimi',
    accent: 'border-iteo-yellow bg-iteo-yellow/10',
  },
  {
    href: '/giris?rol=sofor',
    emoji: '🚕',
    title: 'Şoför',
    desc: 'Hasılat, gider, plaka ve vardiya işlemleri',
    accent: 'border-white/20 bg-white/5',
  },
  {
    href: '/giris?rol=mal-sahibi',
    emoji: '🏷️',
    title: 'Mal / Plaka Sahibi',
    desc: 'Plaka yönetimi, gelir-gider ve aidat takibi',
    accent: 'border-white/20 bg-white/5',
  },
  {
    href: '/giris?rol=uye',
    emoji: '👤',
    title: 'Oda Üyesi',
    desc: 'Duyuru, haber, ödeme ve randevu hizmetleri',
    accent: 'border-white/20 bg-white/5',
  },
] as const;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-iteo-black text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <div className="mb-12 flex flex-col items-center text-center">
          <Image src="/iteo_logo.jpeg" alt="İTEO Logo" width={96} height={96} className="mb-6 rounded-2xl" />
          <p className="text-sm font-semibold uppercase tracking-wide text-iteo-yellow">
            İstanbul Taksiciler Esnaf Odası
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">İTEO Dijital Portal</h1>
          <p className="mt-4 max-w-xl text-white/70">
            Devam etmek için size uygun giriş türünü seçin. Her rol için özelleştirilmiş panel açılır.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              className={`group flex items-start gap-4 rounded-2xl border p-6 transition hover:border-iteo-yellow hover:bg-iteo-yellow/10 ${portal.accent}`}>
              <span className="text-3xl">{portal.emoji}</span>
              <div className="flex-1">
                <h2 className="text-lg font-bold group-hover:text-iteo-yellow">{portal.title}</h2>
                <p className="mt-1 text-sm text-white/60">{portal.desc}</p>
              </div>
              <span className="text-xl text-iteo-yellow opacity-0 transition group-hover:opacity-100">→</span>
            </Link>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-white/40">
          © {new Date().getFullYear()} İstanbul Taksiciler Esnaf Odası
        </p>
      </div>
    </div>
  );
}
