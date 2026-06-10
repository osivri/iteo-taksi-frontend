'use client';

import { ServiceRequestPanel } from '@/components/member/services/ServiceRequestPanel';
import { getServiceModuleBySlug } from '@/components/member/services/service-request-shared';

const config = getServiceModuleBySlug('complaint')!;

export default function PanelComplaintServicePage() {
  return <ServiceRequestPanel config={config} />;
}
