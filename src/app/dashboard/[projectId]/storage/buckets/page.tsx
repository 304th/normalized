"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Bucket {
  id: string;
  name: string;
  isPublic: boolean;
  maxFileSizeMb: number | null;
  allowedMimes: string[];
  sizeBytes: string;
  fileCount: number;
  createdAt: string;
}

interface Project {
  id: string;
  name: string;
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.projects || [];
}

async function fetchBuckets(projectId: string): Promise<Bucket[]> {
  const res = await fetch(`/api/storage/buckets?projectId=${projectId}`);
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.buckets || [];
}

async function createBucket(data: {
  projectId: string;
  name: string;
  isPublic: boolean;
  maxFileSizeMb?: number;
  allowedMimes?: string[];
}): Promise<Bucket> {
  const res = await fetch("/api/storage/buckets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "create failed");
  }
  const json = await res.json();
  return json.bucket;
}

async function deleteBucket(id: string): Promise<void> {
  const res = await fetch(`/api/storage/buckets/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("delete failed");
}

function formatBytes(bytes: string | number): string {
  const b = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (b === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const MIME_OPTIONS = [
  { value: "image/*", label: "Изображения" },
  { value: "video/*", label: "Видео" },
  { value: "audio/*", label: "Аудио" },
  { value: "application/pdf", label: "PDF" },
  { value: "text/*", label: "Текст" },
];

export default function BucketsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newMaxSize, setNewMaxSize] = useState("");
  const [newMimes, setNewMimes] = useState<string[]>([]);
  const [error, setError] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projectId = projects[0]?.id;

  const { data: buckets = [], isLoading } = useQuery({
    queryKey: ["buckets", projectId],
    queryFn: () => fetchBuckets(projectId!),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: createBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
      setShowCreate(false);
      resetForm();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBucket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });

  function resetForm() {
    setNewName("");
    setNewIsPublic(false);
    setNewMaxSize("");
    setNewMimes([]);
    setError("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !projectId) return;

    createMutation.mutate({
      projectId,
      name: newName.trim(),
      isPublic: newIsPublic,
      maxFileSizeMb: newMaxSize ? parseInt(newMaxSize, 10) : undefined,
      allowedMimes: newMimes.length > 0 ? newMimes : undefined,
    });
  }

  function toggleMime(mime: string) {
    setNewMimes((prev) =>
      prev.includes(mime) ? prev.filter((m) => m !== mime) : [...prev, mime]
    );
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
      <h1 className="text-2xl font-bold mb-6">Бакеты</h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[var(--muted)] text-sm">Контейнеры для хранения файлов</p>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[var(--accent)] text-[var(--background)] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
        >
          Создать бакет
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Новый бакет</h2>
            <form onSubmit={handleCreate}>
              {error && (
                <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">
                    Название
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="my-bucket"
                    autoFocus
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Public/Private */}
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">
                    Доступ
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewIsPublic(false)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        !newIsPublic
                          ? "bg-[var(--accent)] text-[var(--background)]"
                          : "border border-[var(--border)] hover:bg-[var(--border)]"
                      }`}
                    >
                      Приватный
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewIsPublic(true)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        newIsPublic
                          ? "bg-[var(--accent)] text-[var(--background)]"
                          : "border border-[var(--border)] hover:bg-[var(--border)]"
                      }`}
                    >
                      Публичный
                    </button>
                  </div>
                </div>

                {/* Max file size */}
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">
                    Макс. размер файла (MB)
                  </label>
                  <input
                    type="number"
                    value={newMaxSize}
                    onChange={(e) => setNewMaxSize(e.target.value)}
                    placeholder="Без ограничений"
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>

                {/* Allowed MIME types */}
                <div>
                  <label className="block text-sm text-[var(--muted)] mb-2">
                    Разрешённые типы файлов
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MIME_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleMime(opt.value)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          newMimes.includes(opt.value)
                            ? "bg-[var(--accent)] text-[var(--background)]"
                            : "border border-[var(--border)] hover:bg-[var(--border)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {newMimes.length === 0 && (
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Не выбрано = все типы разрешены
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false);
                    resetForm();
                  }}
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

      {/* Buckets grid */}
      {buckets.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
          <div className="text-[var(--muted)] mb-4">У вас пока нет бакетов</div>
          <button
            onClick={() => setShowCreate(true)}
            className="text-[var(--accent)] hover:underline"
          >
            Создать первый бакет
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {buckets.map((bucket) => (
            <div
              key={bucket.id}
              className="border border-[var(--border)] rounded-xl p-5 hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{bucket.name}</h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      bucket.isPublic
                        ? "bg-green-500/10 text-green-500"
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}
                  >
                    {bucket.isPublic ? "Публичный" : "Приватный"}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm("Удалить бакет?")) {
                        deleteMutation.mutate(bucket.id);
                      }
                    }}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>
              <div className="text-sm text-[var(--muted)]">
                {bucket.fileCount} файлов • {formatBytes(bucket.sizeBytes)}
              </div>
              {bucket.maxFileSizeMb && (
                <div className="text-xs text-[var(--muted)] mt-1">
                  Макс. размер: {bucket.maxFileSizeMb} MB
                </div>
              )}
              {bucket.allowedMimes.length > 0 && (
                <div className="text-xs text-[var(--muted)] mt-1">
                  Типы: {bucket.allowedMimes.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
