export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-iteo-gray-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-iteo-black">{title}</h1>
      <p className="mt-2 text-iteo-gray-500">
        Bu modül PRD kapsamında bir sonraki geliştirme adımında tamamlanacaktır.
      </p>
    </div>
  );
}
