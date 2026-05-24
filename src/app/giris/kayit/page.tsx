import { MemberRegisterForm } from '@/components/member/MemberRegisterForm';
import type { MemberRoleSlug } from '@/lib/member';

export default async function MemberRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string }>;
}) {
  const { rol } = await searchParams;
  const roleSlug: MemberRoleSlug =
    rol === 'sofor' || rol === 'mal-sahibi' || rol === 'uye' ? rol : 'sofor';

  return <MemberRegisterForm roleSlug={roleSlug} />;
}
