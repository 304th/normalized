"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface Connection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  url: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  region: string;
  provisionStatus: string;
  connection: Connection | null;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.projects || [];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-[var(--accent)] hover:underline"
    >
      {copied ? "Скопировано!" : "Копировать"}
    </button>
  );
}

function ConnectionField({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [show, setShow] = useState(!secret);

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <div className="flex items-center gap-3">
        <code className="text-sm font-mono">
          {show ? value : "••••••••"}
        </code>
        {secret && (
          <button
            onClick={() => setShow(!show)}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {show ? "Скрыть" : "Показать"}
          </button>
        )}
        <CopyButton text={value} />
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  // For now, use first project (single-project view)
  const project = projects[0];
  const conn = project?.connection;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="space-y-6">
        {/* Database Connection */}
        <section className="border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Подключение к базе данных</h2>
          {conn ? (
            <div className="space-y-1">
              {/* Connection URL */}
              <div className="bg-[var(--card)] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--muted)]">Connection URL</span>
                  <CopyButton text={conn.url} />
                </div>
                <code className="text-sm font-mono break-all text-[var(--accent)]">
                  {conn.url.replace(conn.password, "[YOUR-PASSWORD]")}
                </code>
              </div>

              {/* Individual fields */}
              <ConnectionField label="Host" value={conn.host} />
              <ConnectionField label="Port" value={String(conn.port)} />
              <ConnectionField label="Database" value={conn.database} />
              <ConnectionField label="User" value={conn.user} />
              <ConnectionField label="Password" value={conn.password} secret />
            </div>
          ) : (
            <p className="text-sm text-[var(--muted)]">
              {project?.provisionStatus === "ready"
                ? "Данные подключения недоступны"
                : "База данных создаётся..."}
            </p>
          )}
        </section>

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
                defaultValue={project?.name || ""}
                className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--muted)] mb-2">
                Регион
              </label>
              <select
                defaultValue={project?.region || "ru-msk"}
                className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="ru-msk">ru-msk (Москва)</option>
                <option value="ru-spb">ru-spb (Санкт-Петербург)</option>
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
