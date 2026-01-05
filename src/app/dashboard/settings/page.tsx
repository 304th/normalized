export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="space-y-6">
        {/* General */}
        <section className="border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Общие</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--muted)] mb-2">
                Название проекта
              </label>
              <input
                type="text"
                defaultValue="My Project"
                className="w-full max-w-md bg-[#18181b] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-2">
                Регион
              </label>
              <select className="bg-[#18181b] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]">
                <option>ru-msk (Москва)</option>
                <option>ru-spb (Санкт-Петербург)</option>
              </select>
            </div>
          </div>
        </section>

        {/* API */}
        <section className="border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">API ключи</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Управление ключами доступа к API
          </p>
          <button className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
            Создать ключ
          </button>
        </section>

        {/* Danger zone */}
        <section className="border border-red-500/30 rounded-xl p-5">
          <h2 className="font-semibold text-red-500 mb-4">Опасная зона</h2>
          <p className="text-sm text-[var(--muted)] mb-4">
            Удаление проекта необратимо
          </p>
          <button className="border border-red-500/50 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors">
            Удалить проект
          </button>
        </section>
      </div>
    </div>
  );
}
