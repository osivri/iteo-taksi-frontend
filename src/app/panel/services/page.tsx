import { redirect } from 'next/navigation';

/** Eski birleşik oda hizmetleri sayfası — modül ekranına yönlendir */
export default function PanelServicesRedirectPage() {
  redirect('/panel');
}
