const templates = [
  { name: "Подтверждение email", key: "confirm_email" },
  { name: "Сброс пароля", key: "reset_password" },
  { name: "Magic link", key: "magic_link" },
  { name: "Приглашение", key: "invite" },
];

export default function TemplatesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Шаблоны писем</h1>
      <p className="text-[var(--muted)] text-sm mb-6">
        Настройте шаблоны email-уведомлений
      </p>
      <div className="space-y-3">
        {templates.map((t) => (
          <div
            key={t.key}
            className="border border-[var(--border)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--accent)]/50 transition-colors cursor-pointer"
          >
            <span>{t.name}</span>
            <span className="text-[var(--muted)] text-sm">Редактировать</span>
          </div>
        ))}
      </div>
    </div>
  );
}
