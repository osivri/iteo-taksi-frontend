'use client';

import { ServiceRequestPanel } from '@/components/member/services/ServiceRequestPanel';
import { getServiceModuleBySlug } from '@/components/member/services/service-request-shared';

const config = getServiceModuleBySlug('insurance')!;

export default function PanelInsuranceServicePage() {
  return <ServiceRequestPanel config={config} />;
}
