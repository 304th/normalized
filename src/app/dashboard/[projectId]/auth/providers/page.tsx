const providers = [
  { name: "Email", enabled: true, icon: "mail" },
  { name: "Google", enabled: false, icon: "google" },
  { name: "GitHub", enabled: false, icon: "github" },
  { name: "Yandex", enabled: false, icon: "yandex" },
];

export default function ProvidersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Провайдеры</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Настройте способы аутентификации пользователей
      </p>
      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.name}
            className="border border-[var(--border)] rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--card)] rounded-lg flex items-center justify-center text-xs">
                {p.name[0]}
              </div>
              <span className="font-medium">{p.name}</span>
            </div>
            <div
              className={`px-2 py-1 rounded text-xs ${
                p.enabled
                  ? "bg-green-500/10 text-green-500"
                  : "bg-[var(--border)] text-[var(--muted)]"
              }`}
            >
              {p.enabled ? "Включён" : "Выключен"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
