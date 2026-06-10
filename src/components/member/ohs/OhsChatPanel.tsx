'use client';

import { IteoIcon } from '@/components/ui/icons';

interface Props {
  question: string;
  answer: string | null;
  asking: boolean;
  onQuestionChange: (value: string) => void;
  onAsk: () => void;
}

export function OhsChatPanel({ question, answer, asking, onQuestionChange, onAsk }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-iteo-gray-200 bg-white shadow-md">
      <div className="border-b border-white/10 bg-gradient-to-r from-iteo-black to-[#1f1f1f] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-iteo-yellow/20">
            <IteoIcon name="shield" size={24} className="text-iteo-yellow" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">İSG Danışmanına Sor</h2>
            <p className="mt-0.5 text-sm text-white/65">
              İş güvenliği, KKD, hijyen ve sürüş güvenliği hakkında soru sorun.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-iteo-gray-500">Sorunuz</span>
          <textarea
            placeholder="İSG konusunda sorunuzu yazın..."
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-iteo-gray-200 px-4 py-3 text-sm text-iteo-black placeholder:text-iteo-gray-400 focus:border-iteo-yellow focus:outline-none focus:ring-2 focus:ring-iteo-yellow/30"
          />
        </label>

        <button
          type="button"
          onClick={onAsk}
          disabled={asking || !question.trim()}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-iteo-yellow py-3.5 text-sm font-bold text-iteo-black transition hover:bg-iteo-yellow/90 disabled:opacity-60 sm:w-auto sm:px-8"
        >
          <IteoIcon name="help" size={18} />
          {asking ? 'Yanıtlanıyor...' : 'Sor'}
        </button>

        {answer && (
          <div className="rounded-xl border border-iteo-success/30 bg-iteo-success-light p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-iteo-success">Danışman yanıtı</p>
            <p className="text-sm leading-relaxed text-iteo-black">{answer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
