export interface MemberVehicle {
  id: string;
  plateNumber: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  status?: string;
}

export function parseMemberVehiclesResponse(res: unknown): MemberVehicle[] {
  if (!res || typeof res !== 'object') return [];
  const payload = res as { data?: unknown; items?: unknown };

  if (Array.isArray(payload.data)) return payload.data as MemberVehicle[];
  if (Array.isArray(payload.items)) return payload.items as MemberVehicle[];

  if (payload.data && typeof payload.data === 'object') {
    const nested = payload.data as { items?: unknown };
    if (Array.isArray(nested.items)) return nested.items as MemberVehicle[];
  }

  return [];
}

export function activeMemberVehicles(vehicles: MemberVehicle[]): MemberVehicle[] {
  return vehicles.filter((v) => !v.status || v.status === 'ACTIVE');
}
