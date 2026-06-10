import { toMemberRole, type MemberRole } from '@/lib/member';

const MEMBER_ROLES: MemberRole[] = ['DRIVER', 'PLATE_OWNER', 'USER'];

/** Panel pathname -> allowed member roles. Longest prefix match wins. */
const PANEL_ROUTE_ROLES: Array<{ prefix: string; roles: MemberRole[] }> = [
  { prefix: '/panel/onboarding', roles: MEMBER_ROLES },
  { prefix: '/panel/kvkk', roles: MEMBER_ROLES },
  { prefix: '/panel/address', roles: MEMBER_ROLES },
  { prefix: '/panel/finance', roles: ['DRIVER', 'PLATE_OWNER'] },
  { prefix: '/panel/forgotten-items', roles: ['DRIVER', 'PLATE_OWNER'] },
  { prefix: '/panel/payments', roles: ['PLATE_OWNER', 'USER'] },
  { prefix: '/panel', roles: MEMBER_ROLES },
];

export function getAllowedRolesForPanelPath(pathname: string): MemberRole[] | null {
  const match = [...PANEL_ROUTE_ROLES]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((entry) => pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`));

  return match?.roles ?? null;
}

export function isPanelPathAllowed(pathname: string, role: string): boolean {
  const allowed = getAllowedRolesForPanelPath(pathname);
  if (!allowed) return true;
  return allowed.includes(toMemberRole(role));
}
