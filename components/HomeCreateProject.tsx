"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeCreateProject() {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectStartAt, setNewProjectStartAt] = useState("");
  const [newProjectEndAt, setNewProjectEndAt] = useState("");
  const [newProjectVisibility, setNewProjectVisibility] = useState<
    "public" | "private" | "secret" | "collaborate"
  >("private");

  const router = useRouter();

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDesc,
          start_at: newProjectStartAt ? new Date(newProjectStartAt).toISOString() : null,
          end_at: newProjectEndAt ? new Date(newProjectEndAt).toISOString() : null,
          visibility: newProjectVisibility,
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        alert(data.error || "プロジェクトの作成に失敗しました");
        return;
      }

      setIsCreating(false);
      setNewProjectName("");
      setNewProjectDesc("");
      setNewProjectStartAt("");
      setNewProjectEndAt("");
      setNewProjectVisibility("private");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsCreating(true)}
        className="bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition-colors"
      >
        新規プロジェクト作成
      </button>

      {isCreating && (
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-bold">新しいプロジェクトを作成</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              閉じる
            </button>
          </div>

          <form onSubmit={handleCreateProject} className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                プロジェクト名
              </label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">開始日時 (任意)</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-md p-2"
                  value={newProjectStartAt}
                  onChange={(e) => setNewProjectStartAt(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">終了日時 (任意)</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-md p-2"
                  value={newProjectEndAt}
                  onChange={(e) => setNewProjectEndAt(e.target.value)}
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

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">公開範囲</label>
              <select
                className="w-full border rounded-md p-2"
                value={newProjectVisibility}
                onChange={(e) =>
                  setNewProjectVisibility(
                    e.target.value as "public" | "private" | "secret" | "collaborate",
                  )
                }
              >
                <option value="public">パブリック（誰でも参加可能）</option>
                <option value="private">プライベート（参加に承認が必要）</option>
                <option value="secret">シークレット（一覧に出さない・招待制）</option>
                <option value="collaborate">コラボレート（ゲスト招待が可能）</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                参加導線は「プロジェクトを探す」から利用できます（シークレットは表示されません）。
              </p>
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
                disabled={isSubmitting}
                className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 disabled:opacity-50"
              >
                作成する
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

