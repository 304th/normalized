"use client";

import { useState } from "react";

export default function FilesPage() {
  const [dragActive, setDragActive] = useState(false);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Файлы</h1>

      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center mb-6 transition-colors ${
          dragActive
            ? "border-[var(--accent)] bg-[var(--accent)]/5"
            : "border-[var(--border)]"
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => setDragActive(false)}
      >
        <div className="text-[var(--muted)] mb-2">
          Перетащите файлы сюда или
        </div>
        <button className="text-[var(--accent)] hover:underline">
          выберите файлы
        </button>
      </div>

      {/* Files list */}
      <div className="border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0c0c0e]">
            <tr className="border-b border-[var(--border)]">
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Имя</th>
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Размер</th>
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Тип</th>
              <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-[var(--muted)]">
                Нет файлов
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
