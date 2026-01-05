export default function BackupsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Бэкапы</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[var(--muted)] text-sm">Резервные копии базы данных</p>
        <button className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
          Создать бэкап
        </button>
      </div>
      <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
        <div className="text-[var(--muted)]">Нет резервных копий</div>
      </div>
    </div>
  );
}
