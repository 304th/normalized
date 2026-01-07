"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Bucket {
  id: string;
  name: string;
  isPublic: boolean;
}

interface FileItem {
  key: string;
  size: number;
  lastModified: string;
  url: string | null;
}

interface Project {
  id: string;
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

async function fetchFiles(bucketId: string): Promise<FileItem[]> {
  const res = await fetch(`/api/storage/buckets/${bucketId}/files`);
  if (!res.ok) throw new Error("fetch failed");
  const data = await res.json();
  return data.files || [];
}

async function uploadFile(bucketId: string, file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`/api/storage/buckets/${bucketId}/files`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "upload failed");
  }
}

async function deleteFile(bucketId: string, key: string): Promise<void> {
  const res = await fetch(`/api/storage/buckets/${bucketId}/files/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("delete failed");
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileType(key: string): string {
  const ext = key.split(".").pop()?.toLowerCase() || "";
  const typeMap: Record<string, string> = {
    jpg: "Изображение",
    jpeg: "Изображение",
    png: "Изображение",
    gif: "Изображение",
    webp: "Изображение",
    svg: "Изображение",
    pdf: "PDF",
    doc: "Документ",
    docx: "Документ",
    xls: "Таблица",
    xlsx: "Таблица",
    mp4: "Видео",
    webm: "Видео",
    mp3: "Аудио",
    wav: "Аудио",
    zip: "Архив",
    rar: "Архив",
    json: "JSON",
    txt: "Текст",
  };
  return typeMap[ext] || ext.toUpperCase() || "Файл";
}

export default function FilesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [error, setError] = useState("");

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  const projectId = projects[0]?.id;

  const { data: buckets = [] } = useQuery({
    queryKey: ["buckets", projectId],
    queryFn: () => fetchBuckets(projectId!),
    enabled: !!projectId,
  });

  // Auto-select first bucket
  const bucketId = selectedBucket || buckets[0]?.id || "";

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["files", bucketId],
    queryFn: () => fetchFiles(bucketId),
    enabled: !!bucketId,
  });

  const deleteMutation = useMutation({
    mutationFn: ({ key }: { key: string }) => deleteFile(bucketId, key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files", bucketId] });
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0 || !bucketId) return;

    setUploading(true);
    setUploadProgress([]);
    setError("");

    const filesToUpload = Array.from(fileList);

    for (const file of filesToUpload) {
      try {
        setUploadProgress((prev) => [...prev, `Загрузка ${file.name}...`]);
        await uploadFile(bucketId, file);
        setUploadProgress((prev) =>
          prev.map((p) => (p.includes(file.name) ? `✓ ${file.name}` : p))
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Ошибка загрузки";
        setUploadProgress((prev) =>
          prev.map((p) => (p.includes(file.name) ? `✗ ${file.name}: ${msg}` : p))
        );
        setError(msg);
      }
    }

    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["files", bucketId] });
    queryClient.invalidateQueries({ queryKey: ["buckets"] });

    // Clear progress after a delay
    setTimeout(() => setUploadProgress([]), 3000);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleUpload(e.dataTransfer.files);
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
  }

  const currentBucket = buckets.find((b) => b.id === bucketId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Файлы</h1>

      {/* Bucket selector */}
      {buckets.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm text-[var(--muted)] mb-2">Бакет</label>
          <select
            value={bucketId}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="bg-[var(--card)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[var(--accent)]"
          >
            {buckets.map((bucket) => (
              <option key={bucket.id} value={bucket.id}>
                {bucket.name} {bucket.isPublic ? "(публичный)" : "(приватный)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {buckets.length === 0 ? (
        <div className="border border-dashed border-[var(--border)] rounded-xl p-12 text-center">
          <div className="text-[var(--muted)] mb-4">
            Сначала создайте бакет
          </div>
          <a href="/dashboard/storage/buckets" className="text-[var(--accent)] hover:underline">
            Перейти к бакетам
          </a>
        </div>
      ) : (
        <>
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
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="space-y-1">
                {uploadProgress.map((p, i) => (
                  <div key={i} className="text-sm text-[var(--muted)]">
                    {p}
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="text-[var(--muted)] mb-2">
                  Перетащите файлы сюда или
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[var(--accent)] hover:underline"
                >
                  выберите файлы
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Files list */}
          <div className="border border-[var(--border)] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[var(--card-dark)]">
                <tr className="border-b border-[var(--border)]">
                  <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">
                    Имя
                  </th>
                  <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">
                    Размер
                  </th>
                  <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">
                    Тип
                  </th>
                  <th className="px-4 py-3 text-left text-[var(--muted)] font-medium">
                    Дата
                  </th>
                  <th className="px-4 py-3 text-right text-[var(--muted)] font-medium">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                      Загрузка...
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--muted)]">
                      Нет файлов
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr
                      key={file.key}
                      className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card)]"
                    >
                      <td className="px-4 py-3 font-medium">{file.key}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {getFileType(file.key)}
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">
                        {formatDate(file.lastModified)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {file.url && (
                            <button
                              onClick={() => copyUrl(file.url!)}
                              className="text-[var(--accent)] hover:underline text-xs"
                            >
                              URL
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm("Удалить файл?")) {
                                deleteMutation.mutate({ key: file.key });
                              }
                            }}
                            className="text-red-500 hover:text-red-400 text-xs"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Public URL info */}
          {currentBucket?.isPublic && (
            <div className="mt-4 text-xs text-[var(--muted)]">
              Публичные файлы доступны по URL: https://s3.timeweb.cloud/{currentBucket.name}/
              {"<filename>"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
