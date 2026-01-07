export default function SqlEditorPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">SQL редактор</h1>
      <div className="border border-[var(--border)] rounded-xl bg-[var(--card-dark)] p-4 min-h-[400px]">
        <textarea
          placeholder="SELECT * FROM users;"
          className="w-full h-64 bg-transparent text-sm font-mono resize-none focus:outline-none"
        />
        <div className="border-t border-[var(--border)] pt-4 mt-4">
          <button className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors">
            Выполнить
          </button>
        </div>
      </div>
    </div>
  );
}
