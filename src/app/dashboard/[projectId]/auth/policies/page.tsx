export default function AuthPoliciesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Политики доступа</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Row Level Security (RLS) политики для контроля доступа к данным
      </p>
      <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
        <div className="text-[var(--muted)]">Политики не настроены</div>
      </div>
    </div>
  );
}
