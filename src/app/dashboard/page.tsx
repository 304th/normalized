"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  slug: string;
  region: string;
  provisionStatus: string;
  createdAt: string;
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

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "Ожидание", color: "text-gray-400 bg-gray-500/10" },
  provisioning: { label: "Создание...", color: "text-blue-400 bg-blue-500/10" },
  ready: { label: "Готов", color: "text-green-400 bg-green-500/10" },
  error: { label: "Ошибка", color: "text-red-400 bg-red-500/10" },
};

export default function ProjectsPage() {
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
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setNewName("");
      setShowCreate(false);
      router.push(`/dashboard/${project.id}`);
    },
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate(newName);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="10" height="10" rx="2" fill="var(--accent)" />
            <rect x="18" y="4" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
            <rect x="4" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.6" />
            <rect x="18" y="18" width="10" height="10" rx="2" fill="var(--accent)" opacity="0.3" />
          </svg>
          <span className="font-semibold">normalized</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
        >
          Выйти
        </button>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Проекты</h1>
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
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-3 mb-4 focus:outline-none focus:border-[var(--accent)]"
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
          <div className="space-y-3">
            {projects.map((project) => {
              const status = statusLabels[project.provisionStatus] ?? statusLabels.pending;
              return (
                <button
                  key={project.id}
                  onClick={() => router.push(`/dashboard/${project.id}`)}
                  className="w-full border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)]/50 transition-colors text-left flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-[var(--muted)]">{project.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
                      {project.region}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
