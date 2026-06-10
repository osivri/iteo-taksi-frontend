'use client';

import { ServiceRequestPanel } from '@/components/member/services/ServiceRequestPanel';
import { getServiceModuleBySlug } from '@/components/member/services/service-request-shared';

const config = getServiceModuleBySlug('petition')!;

export default function PanelPetitionServicePage() {
  return <ServiceRequestPanel config={config} />;
}
