"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  dbSizeMb: number;
  storageMb: number;
  createdAt: string;
  apiKeys: ApiKey[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        setNewName("");
        setShowCreate(false);
        fetchProjects();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreating(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--muted)]">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-lg">
            normalized
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Выйти
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Проекты</h1>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            Новый проект
          </button>
        </div>

        {/* Create modal */}
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
                    disabled={creating || !newName.trim()}
                    className="flex-1 bg-[var(--accent)] text-[var(--background)] py-2 rounded-lg font-medium hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
                  >
                    {creating ? "Создание..." : "Создать"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Projects grid */}
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [showKey, setShowKey] = useState(false);
  const apiKey = project.apiKeys[0]?.key || "";

  return (
    <div className="border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-sm text-[var(--muted)]">{project.slug}</p>
        </div>
        <span className="text-xs bg-[var(--accent)]/10 text-[var(--accent)] px-2 py-1 rounded">
          {project.region}
        </span>
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

      {/* API Key */}
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

      {/* Connection URL */}
      <div className="bg-[#18181b] rounded-lg p-3">
        <div className="text-xs text-[var(--muted)] mb-1">URL</div>
        <code className="text-xs break-all">
          https://api.normalized.ru/v1/{project.slug}
        </code>
      </div>
    </div>
  );
}
