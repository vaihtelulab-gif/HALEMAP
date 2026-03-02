'use client';

import { UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Project } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState("");
  const [newProjectEndDate, setNewProjectEndDate] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          start_date: newProjectStartDate || null,
          end_date: newProjectEndDate || null,
        }),
      });

      if (res.ok) {
        const project = await res.json();
        setProjects([project, ...projects]);
        setIsCreating(false);
        setNewProjectName("");
        setNewProjectDesc("");
        setNewProjectStartDate("");
        setNewProjectEndDate("");
      } else {
        alert("プロジェクトの作成に失敗しました");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert("エラーが発生しました");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-indigo-600">halemap</h1>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">プロジェクト一覧</h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            新規プロジェクト作成
          </button>
        </div>

        {isCreating && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold mb-4">新しいプロジェクトを作成</h3>
            <form onSubmit={handleCreateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名</label>
                <input
                  type="text"
                  className="w-full border rounded-md p-2"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">開始日 (任意)</label>
                  <input
                    type="date"
                    className="w-full border rounded-md p-2"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">終了日 (任意)</label>
                  <input
                    type="date"
                    className="w-full border rounded-md p-2"
                    value={newProjectEndDate}
                    onChange={(e) => setNewProjectEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">説明 (任意)</label>
                <textarea
                  className="w-full border rounded-md p-2"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  作成する
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">まだプロジェクトがありません</p>
            <button
              onClick={() => setIsCreating(true)}
              className="text-indigo-600 font-medium hover:underline"
            >
              最初のプロジェクトを作成しましょう
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow hover:border-indigo-300"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || "説明なし"}
                </p>
                {(project.start_date || project.end_date) && (
                  <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">期間:</span> {project.start_date || '未定'} 〜 {project.end_date || '未定'}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>作成日: {new Date(project.created_at).toLocaleDateString()}</span>
                  <span className="text-indigo-600 font-medium">開く →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
