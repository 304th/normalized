"use client";

import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";

interface Project {
  id: string;
  name: string;
  slug: string;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.projects || [];
}

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const currentProject = projects.find((p) => p.id === projectId);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  function handleProjectSwitch(newProjectId: string) {
    router.push(`/dashboard/${newProjectId}`);
  }

  return (
    <div className="min-h-screen flex">
      <Sidebar projectId={projectId} />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-14 border-b border-[var(--border)] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {/* Project switcher */}
            <select
              value={projectId}
              onChange={(e) => handleProjectSwitch(e.target.value)}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)]"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Выйти
          </button>
        </header>
        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
