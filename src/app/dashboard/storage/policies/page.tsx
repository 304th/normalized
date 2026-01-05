export default function StoragePoliciesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Политики хранилища</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Управление доступом к файлам и бакетам
      </p>
      <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
        <div className="text-[var(--muted)] mb-4">Политики не настроены</div>
        <button className="text-[var(--accent)] hover:underline">
          Создать политику
        </button>
      </div>
    </div>
  );
}
