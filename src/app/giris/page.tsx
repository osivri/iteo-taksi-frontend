import { MemberLoginForm } from '@/components/member/MemberLoginForm';
import type { MemberRoleSlug } from '@/lib/member';

export default async function MemberLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const { rol } = await searchParams;
  const roleSlug: MemberRoleSlug =
    rol === 'sofor' || rol === 'oda-uyesi' || rol === 'mal-sahibi' || rol === 'uye' ? rol : 'sofor';

  return <MemberLoginForm roleSlug={roleSlug} />;
}
