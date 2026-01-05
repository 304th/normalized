"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  createdAt: string;
  apiKeys: ApiKey[];
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (res.status === 401) throw new Error("unauthorized");
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.projects || [];
}

async function createProject(name: string): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("create failed");
  return res.json();
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    retry: (count, error) => {
      if (error.message === "unauthorized") {
        router.push("/login");
        return false;
      }
      return count < 1;
    },
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewName("");
      setShowCreate(false);
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate(newName);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[var(--muted)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Обзор</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Новый проект
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Новый проект</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Название проекта"
                autoFocus
                className="w-full bg-[#18181b] border border-[var(--border)] rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-[var(--accent)]"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border border-[var(--border)] py-2 rounded-lg hover:bg-[var(--border)] transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !newName.trim()}
                  className="flex-1 bg-[var(--accent)] text-[var(--background)] py-2 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
          <div className="text-[var(--muted)] mb-4">У вас пока нет проектов</div>
          <button
            onClick={() => setShowCreate(true)}
            className="text-[var(--accent)] hover:underline"
          >
            Создать первый проект
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидание", color: "text-gray-400 bg-gray-500/10" },
  provisioning: { label: "Создание", color: "text-blue-400 bg-blue-500/10" },
  ready: { label: "Готов", color: "text-green-400 bg-green-500/10" },
  error: { label: "Ошибка", color: "text-red-400 bg-red-500/10" },
};

function ProjectCard({ project }: { project: Project }) {
  const [showKey, setShowKey] = useState(false);
  const apiKey = project.apiKeys[0]?.key || "";
  const status = statusLabels[project.provisionStatus] ?? statusLabels.pending;

  return (
    <div className="border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-sm text-[var(--muted)]">{project.slug}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
            {project.region}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between text-[var(--muted)]">
          <span>База данных</span>
          <span>{project.dbSizeMb} MB</span>
        </div>
        <div className="flex justify-between text-[var(--muted)]">
          <span>Хранилище</span>
          <span>{project.storageMb} MB</span>
        </div>
      </div>

      <div className="bg-[#18181b] rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--muted)]">API Key</span>
          <button
            onClick={() => setShowKey(!showKey)}
            className="text-xs text-[var(--accent)]"
          >
            {showKey ? "Скрыть" : "Показать"}
          </button>
        </div>
        <code className="text-xs break-all">
          {showKey ? apiKey : "nrm_••••••••••••••••••••"}
        </code>
      </div>

      <div className="bg-[#18181b] rounded-lg p-3">
        <div className="text-xs text-[var(--muted)] mb-1">URL</div>
        <code className="text-xs break-all">
          https://api.normalized.ru/v1/{project.slug}
        </code>
      </div>
    </div>
  );
}
