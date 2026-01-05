export default function UsersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[var(--muted)] text-sm">Управление пользователями приложения</p>
        <button className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
          Добавить
        </button>
      </div>
      <div className="border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0c0c0e]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Email</th>
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Создан</th>
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-[var(--muted)]">
                Нет пользователей
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
