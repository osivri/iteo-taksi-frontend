interface Step {
  step: string;
  title: string;
  desc: string;
}

interface Props {
  steps: readonly Step[];
}

export function MarketplaceSteps({ steps }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s) => (
        <div
          key={s.step}
          className="rounded-2xl border border-iteo-gray-200 bg-white p-4 shadow-sm"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-iteo-yellow text-sm font-black text-iteo-black">
            {s.step}
          </span>
          <p className="mt-3 font-bold text-iteo-black">{s.title}</p>
          <p className="mt-1 text-sm text-iteo-gray-500">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}
