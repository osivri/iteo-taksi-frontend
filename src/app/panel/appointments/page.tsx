import { redirect } from 'next/navigation';

/** Eski birleşik randevu sayfası — modül ekranına yönlendir */
export default function PanelAppointmentsRedirectPage() {
  redirect('/panel');
}
