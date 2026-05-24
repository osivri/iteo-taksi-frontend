'use client';

import { PageHeader } from '@/components/admin/AdminUi';

const faqs = [
  {
    q: 'Aidat ödememi nasıl yaparım?',
    a: 'Ödemeler menüsünden oda aidatınızı güvenle ödeyebilirsiniz.',
  },
  {
    q: 'Plaka nasıl eklerim?',
    a: 'Plakalarım menüsünden kayıtlı araçlarınızı görüntüleyebilirsiniz. Yeni kayıt için oda ile iletişime geçin.',
  },
  {
    q: 'Hasılat kaydı nasıl eklenir?',
    a: 'Muhasebe menüsünden gelir ve gider kayıtlarınızı oluşturabilirsiniz.',
  },
  {
    q: 'Randevu nasıl alınır?',
    a: 'Randevu menüsünden otel veya oto servis talebi oluşturabilirsiniz.',
  },
];

export default function PanelHelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Yardım & Destek" description="Sık sorulan sorular ve iletişim bilgileri." />

      <div className="rounded-xl border border-iteo-gray-200 bg-white p-6">
        <h2 className="font-semibold text-iteo-black">İTEO İletişim</h2>
        <p className="mt-2 text-sm leading-relaxed text-iteo-gray-600">
          İstanbul Taksiciler Esnaf Odası
          <br />
          Destek: hafta içi 09:00 – 17:00
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="tel:+902125555555"
            className="rounded-lg bg-iteo-yellow px-4 py-2 text-sm font-semibold text-iteo-black">
            📞 Odayı Ara
          </a>
          <a
            href="mailto:destek@iteo.org.tr"
            className="rounded-lg border border-iteo-gray-200 px-4 py-2 text-sm font-medium text-iteo-gray-700 hover:bg-iteo-gray-100">
            ✉️ E-posta Gönder
          </a>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-bold text-iteo-black">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-iteo-gray-200 bg-white p-5">
              <p className="font-semibold text-iteo-black">{faq.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-iteo-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
