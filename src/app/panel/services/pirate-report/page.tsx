'use client';

import { ServiceRequestPanel } from '@/components/member/services/ServiceRequestPanel';
import { getServiceModuleBySlug } from '@/components/member/services/service-request-shared';

const config = getServiceModuleBySlug('pirate-report')!;

export default function PanelPirateReportServicePage() {
  return <ServiceRequestPanel config={config} />;
}
