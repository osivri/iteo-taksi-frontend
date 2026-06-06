import Image from "next/image";
import Link from "next/link";
import { AdminHeaderActions } from "@/components/admin/AdminHeaderActions";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/profile", label: "Profilim", icon: "👤" },
  { href: "/dashboard/users", label: "Kullanıcılar", icon: "👥" },
  { href: "/dashboard/vehicles", label: "Plaka / Araç", icon: "🚕" },
  { href: "/dashboard/stands", label: "Duraklar", icon: "🚏" },
  { href: "/dashboard/service-requests", label: "Hizmet Talepleri", icon: "📋" },
  { href: "/dashboard/listings", label: "İlanlar", icon: "📌" },
  { href: "/dashboard/spare-parts", label: "Yedek Parça", icon: "🔧" },
  { href: "/dashboard/staff-expenses", label: "Personel Gider", icon: "👔" },
  { href: "/dashboard/announcements", label: "Duyurular", icon: "📢" },
  { href: "/dashboard/news", label: "Haberler", icon: "📰" },
  { href: "/dashboard/payments", label: "Ödemeler", icon: "💳" },
  { href: "/dashboard/finance", label: "Muhasebe", icon: "📒" },
  { href: "/dashboard/ohs", label: "İSG İçerikleri", icon: "🦺" },
  { href: "/dashboard/appointments", label: "Randevular", icon: "📅" },
  { href: "/dashboard/forgotten-items", label: "Unutulan Eşya", icon: "🧳" },
  { href: "/dashboard/notifications", label: "Bildirimler", icon: "🔔" },
  { href: "/dashboard/reports", label: "Raporlar", icon: "📈" },
  { href: "/dashboard/audit-logs", label: "İşlem Logları", icon: "📝" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-shrink-0 flex-col bg-iteo-black text-white md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 p-5">
          <Image
            src="/iteo_logo.jpeg"
            alt="İTEO Logo"
            width={44}
            height={44}
            className="rounded-lg"
          />
          <div>
            <p className="text-xs font-semibold text-iteo-yellow uppercase tracking-wide">İTEO</p>
            <p className="text-sm font-medium">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-iteo-gray-200 bg-white px-6 py-4">
          <div className="md:hidden flex items-center gap-2">
            <Image src="/iteo_logo.jpeg" alt="İTEO" width={36} height={36} className="rounded-md" />
            <span className="font-semibold">İTEO Admin</span>
          </div>
          <p className="hidden md:block text-sm text-iteo-gray-500">
            İstanbul Taksiciler Esnaf Odası — Yönetim Paneli
          </p>
          <AdminHeaderActions />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
