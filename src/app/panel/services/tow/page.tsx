'use client';

import { ServiceRequestPanel } from '@/components/member/services/ServiceRequestPanel';
import { getServiceModuleBySlug } from '@/components/member/services/service-request-shared';

const config = getServiceModuleBySlug('tow')!;

export default function PanelTowServicePage() {
  return <ServiceRequestPanel config={config} />;
}
