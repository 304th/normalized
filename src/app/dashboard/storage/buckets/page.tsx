export default function BucketsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Бакеты</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[var(--muted)] text-sm">Контейнеры для хранения файлов</p>
        <button className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
          Создать бакет
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-colors cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">public</h3>
            <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
              Публичный
            </span>
          </div>
          <div className="text-sm text-[var(--muted)]">
            0 файлов • 0 MB
          </div>
        </div>
        <div className="border border-dashed border-[var(--border)] rounded-xl p-5 flex items-center justify-center text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors cursor-pointer">
          + Новый бакет
        </div>
      </div>
    </div>
  );
}
