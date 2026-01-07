"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface ApiKey {
  id: string;
  name: string;
  key: string;
}

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  region: string;
  provisionStatus: string;
  dbSizeMb: number;
  storageMb: number;
  planId: string;
  dbHost: string | null;
  dbPort: number | null;
  dbName: string | null;
  dbUser: string | null;
  createdAt: string;
  apiKeys: ApiKey[];
}

async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидание", color: "text-gray-400 bg-gray-500/10" },
  provisioning: { label: "Создание...", color: "text-blue-400 bg-blue-500/10" },
  upgrading: { label: "Обновление...", color: "text-yellow-400 bg-yellow-500/10" },
  ready: { label: "Готов", color: "text-green-400 bg-green-500/10" },
  error: { label: "Ошибка", color: "text-red-400 bg-red-500/10" },
};

export default function ProjectOverviewPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [showKey, setShowKey] = useState(false);
  const [showDbPassword, setShowDbPassword] = useState(false);

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => fetchProject(projectId),
  });

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Загрузка...</div>
      </div>
    );
  }

  const status = statusLabels[project.provisionStatus] ?? statusLabels.pending;
  const apiKey = project.apiKeys[0]?.key || "";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-[var(--muted)] text-sm">{project.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
            {project.region}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Stats */}
        <div className="border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">Использование</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">База данных</span>
              <span>{project.dbSizeMb} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Хранилище</span>
              <span>{project.storageMb} MB</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted)]">Тариф</span>
              <span className="capitalize">{project.planId}</span>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="border border-[var(--border)] rounded-xl p-5">
          <h2 className="font-semibold mb-4">API</h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[var(--muted)]">API Key</span>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="text-xs text-[var(--accent)]"
                >
                  {showKey ? "Скрыть" : "Показать"}
                </button>
              </div>
              <code className="text-xs break-all bg-[var(--card)] p-2 rounded block">
                {showKey ? apiKey : "nrm_••••••••••••••••••••"}
              </code>
            </div>
            <div>
              <div className="text-xs text-[var(--muted)] mb-1">URL</div>
              <code className="text-xs break-all bg-[var(--card)] p-2 rounded block">
                https://api.normalized.ru/v1/{project.slug}
              </code>
            </div>
          </div>
        </div>

        {/* Database Connection */}
        {project.dbHost && (
          <div className="border border-[var(--border)] rounded-xl p-5 md:col-span-2">
            <h2 className="font-semibold mb-4">Подключение к БД</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--muted)] text-xs">Host</span>
                <code className="block bg-[var(--card)] p-2 rounded text-xs mt-1">
                  {project.dbHost}
                </code>
              </div>
              <div>
                <span className="text-[var(--muted)] text-xs">Port</span>
                <code className="block bg-[var(--card)] p-2 rounded text-xs mt-1">
                  {project.dbPort}
                </code>
              </div>
              <div>
                <span className="text-[var(--muted)] text-xs">Database</span>
                <code className="block bg-[var(--card)] p-2 rounded text-xs mt-1">
                  {project.dbName}
                </code>
              </div>
              <div>
                <span className="text-[var(--muted)] text-xs">User</span>
                <code className="block bg-[var(--card)] p-2 rounded text-xs mt-1">
                  {project.dbUser}
                </code>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[var(--muted)] text-xs">Connection string</span>
              <code className="block bg-[var(--card)] p-2 rounded text-xs mt-1 break-all">
                postgresql://{project.dbUser}:***@{project.dbHost}:{project.dbPort}/{project.dbName}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
