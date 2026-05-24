'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function AdminHeaderActions() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard/profile"
        className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100"
      >
        Profil
      </Link>
      <button
        type="button"
        onClick={logout}
        className="rounded-lg border border-iteo-gray-200 px-3 py-1.5 text-sm text-iteo-gray-500 hover:bg-iteo-gray-100"
      >
        Çıkış
      </button>
    </div>
  );
}
