"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { Project, Report } from "@/types";
import ProjectSettings from "@/components/ProjectSettings";

function visibilityLabel(v?: Project["visibility"]) {
  switch (v) {
    case "public":
      return "パブリック";
    case "private":
      return "プライベート";
    case "secret":
      return "シークレット";
    case "collaborate":
      return "コラボレート";
    default:
      return "未設定";
  }
}

export default function ProjectLanding({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [members, setMembers] = useState<
    Array<{
      user_id: string;
      role: string;
      joined_at: string;
      user?: { display_name?: string | null; email?: string | null };
    }>
  >([]);
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const run = async () => {
      setIsLoading(true);
      try {
        const [projRes, roleRes, membersRes, timelineRes] = await Promise.all([
          fetch("/api/projects"),
          fetch(`/api/projects/${projectId}/role`),
          fetch(`/api/projects/${projectId}/members`),
          fetch(`/api/timeline?${new URLSearchParams({ project_id: projectId }).toString()}`),
        ]);

        if (projRes.ok) {
          const list = (await projRes.json()) as Project[];
          setProject(list.find((p) => p.id === projectId) ?? null);
        }

        if (roleRes.ok) {
          const data = (await roleRes.json()) as { role?: string };
          setRole(data.role ?? null);
        } else {
          setRole(null);
        }

        if (membersRes.ok) {
          const data = (await membersRes.json()) as Array<{
            user_id: string;
            role: string;
            joined_at: string;
            user?: { display_name?: string | null; email?: string | null };
          }>;
          setMembers(data);
        }

        if (timelineRes.ok) {
          const data = (await timelineRes.json()) as Report[];
          setRecentReports(data.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    run();
  }, [projectId]);

  const periodText = useMemo(() => {
    if (!project) return null;
    if (!project.start_at && !project.end_at && !project.start_date && !project.end_date) return null;
    const fmt = (v?: string | null) => {
      if (!v) return null;
      const d = new Date(v);
      if (Number.isNaN(d.getTime())) return v;
      return new Intl.DateTimeFormat("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    };
    return `${fmt(project.start_at) || project.start_date || "未定"} 〜 ${fmt(project.end_at) || project.end_date || "未定"}`;
  }, [project]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafaf7]">
        <header className="bg-[#fafaf7]/80 backdrop-blur border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <Link href="/home" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
            </Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-lg border p-6">
            <div className="animate-pulse">
              <div className="h-40 bg-gray-100 rounded-md mb-4" />
              <div className="h-6 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#fafaf7]">
        <header className="bg-[#fafaf7]/80 backdrop-blur border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
            <Link href="/home" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
            </Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-lg border p-6">
            <h1 className="text-xl font-bold mb-2">プロジェクトが見つかりません</h1>
            <p className="text-sm text-gray-600 mb-4">
              参加権限がないか、削除された可能性があります。
            </p>
            <Link href="/home" className="text-teal-800 font-medium hover:underline">
              プロジェクト一覧へ戻る
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="bg-[#fafaf7]/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/home" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
            </Link>
            <span className="text-sm text-gray-500">/ {project.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              設定
            </button>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-teal-100 overflow-hidden">
          <div className="w-full aspect-[16/9] bg-gradient-to-br from-teal-50 to-gray-100 border-b border-teal-100">
            {project.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.thumbnail_url}
                alt={`${project.name} のサムネイル`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                サムネイル未設定
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  作成日: {new Date(project.created_at).toLocaleDateString()}
                  {role ? ` / あなたの権限: ${role}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-900 border border-teal-100">
                  {visibilityLabel(project.visibility)}
                </span>
                {periodText && (
                  <span className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-900 border border-teal-100">
                    期間: {periodText}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Link
                href={`/projects/${projectId}/map`}
                className="inline-flex items-center justify-center bg-teal-700 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition-colors"
              >
                地図を開く
              </Link>
              <Link
                href={`/projects/${projectId}/map?sidebar=timeline`}
                className="inline-flex items-center justify-center bg-white border border-teal-200 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors"
              >
                作業履歴を見る
              </Link>
              <Link
                href={`/projects/${projectId}/map`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center bg-white border border-teal-200 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors"
              >
                別タブで開く
              </Link>
              <Link
                href="/home"
                className="inline-flex items-center justify-center bg-white border border-teal-200 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors"
              >
                プロジェクト一覧へ戻る
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <section>
                <h2 className="text-lg font-bold mb-2">概要</h2>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {project.description?.trim() ? project.description : "説明は未設定です。"}
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold mb-2">詳細（注意事項など）</h2>
                <div className="rounded-md border border-teal-100 bg-teal-50/40 p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {project.details?.trim()
                      ? project.details
                      : "未設定です。プロジェクト設定から記載できます。"}
                  </p>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-lg font-bold">メンバー</h2>
                  <span className="text-xs text-gray-500">{members.length}人</span>
                </div>
                {members.length === 0 ? (
                  <div className="text-sm text-gray-500">メンバー情報を取得できませんでした。</div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <div className="divide-y">
                      {members.slice(0, 20).map((m) => (
                        <div key={m.user_id} className="p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {m.user?.display_name || "名称未設定"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{m.user?.email || ""}</div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 shrink-0">
                            {m.role}
                          </div>
                        </div>
                      ))}
                    </div>
                    {members.length > 20 && (
                      <div className="p-3 text-xs text-gray-500 bg-gray-50">
                        先頭20件のみ表示しています。
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2 className="text-lg font-bold">最近の更新</h2>
                  <Link
                    href={`/projects/${projectId}/map?sidebar=timeline`}
                    className="text-sm text-teal-800 hover:underline"
                  >
                    もっと見る
                  </Link>
                </div>
                {recentReports.length === 0 ? (
                  <div className="text-sm text-gray-500">まだ更新がありません。</div>
                ) : (
                  <div className="space-y-2">
                    {recentReports.map((r) => (
                      <div key={r.id} className="rounded-md border bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {(r.type === "post" ? "掲示" : "撤去") + (r.spot?.name ? ` / ${r.spot.name}` : "")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(r.created_at).toLocaleString()}
                              {r.poster_name ? ` / 作業者: ${r.poster_name}` : ""}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 shrink-0">
                            👍 {r.thumbs_up_count ?? 0}
                          </div>
                        </div>
                        {r.memo && (
                          <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                            {r.memo}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      </main>

      <ProjectSettings
        projectId={projectId}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

