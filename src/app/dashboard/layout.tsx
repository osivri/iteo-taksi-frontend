import Image from 'next/image';
import {
  AdminMobileNavButton,
  AdminSidebar,
  AdminSidebarProvider,
} from '@/components/admin/AdminSidebar';
import { AdminHeaderActions } from '@/components/admin/AdminHeaderActions';
import { requireAdminSession } from '@/lib/auth/require-admin';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminSession();

  return (
    <AdminSidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-iteo-gray-200 bg-white px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <AdminMobileNavButton />
              <div className="flex items-center gap-2 md:hidden">
                <Image src="/iteo_logo.jpeg" alt="İTEO" width={36} height={36} className="rounded-md" />
                <span className="font-semibold">İTEO Admin</span>
              </div>
              <p className="hidden text-sm text-iteo-gray-500 md:block">
                İstanbul Taksiciler Esnaf Odası — Yönetim Paneli
              </p>
            </div>
            <AdminHeaderActions />
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </AdminSidebarProvider>
  );
}
