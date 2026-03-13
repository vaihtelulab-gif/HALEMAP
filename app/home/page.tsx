import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import type { Project } from "@/types";
import HomeCreateProject from "@/components/HomeCreateProject";

export default async function Home() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { data: memberProjects, error: memberError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId);

  if (memberError) {
    throw new Error(memberError.message);
  }

  const projectIds = (memberProjects ?? []).map((mp: { project_id: string }) => mp.project_id);

  const projects: Project[] =
    projectIds.length === 0
      ? []
      : (((await supabase
          .from("projects")
          .select("*")
          .in("id", projectIds)
          .order("created_at", { ascending: false })).data ?? []) as Project[]);

  const formatDateTime = (value?: string | null) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  return (
    <div className="min-h-screen bg-[#fafaf7]">
      <header className="bg-[#fafaf7]/80 backdrop-blur border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/home" className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="bg-white border border-teal-200 px-3 py-2 rounded-md hover:bg-teal-50 transition-colors text-sm"
            >
              サイトTOP
            </Link>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Key message area */}
        <section className="pt-10 pb-8 md:pt-12 md:pb-10">
          <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-white p-6 md:p-8 shadow-sm">
            <div className="pointer-events-none absolute inset-0 opacity-[0.16]">
              <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#14b8a633,transparent_55%),radial-gradient(circle_at_70%_40%,#2dd4bf33,transparent_55%),radial-gradient(circle_at_45%_85%,#0ea5e926,transparent_60%)]" />
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
              <div className="h-full w-full bg-[linear-gradient(to_right,#0f766e_1px,transparent_1px),linear-gradient(to_bottom,#0f766e_1px,transparent_1px)] bg-[size:44px_44px]" />
            </div>
            <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-900">
                街を整える
              </span>
              <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-900">
                地域ごとのルールにあわせた運用
              </span>
              <span className="inline-flex items-center rounded-full border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-900">
                自分のペースで参加
              </span>
            </div>

            <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
              街に貼った情報を、きちんと閉じる。
            </h1>
            <p className="mt-3 text-sm md:text-base text-gray-600 max-w-3xl">
              掲示・撤去を「整える行為」として記録し、自治体・施設ごとの違いも
              <span className="font-medium text-gray-900">「どこに確認すべきか」</span>
              まで含めて残せます。貼る人と整える人が別でも、自然に回る運用を目指します。
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Link
                href="/discover"
                className="bg-white border border-teal-200 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors text-sm"
              >
                プロジェクトを探す
              </Link>
              <Link
                href="/join"
                className="bg-white border border-teal-200 px-4 py-2 rounded-md hover:bg-teal-50 transition-colors text-sm"
              >
                招待コードで参加
              </Link>
              <HomeCreateProject />
              <Link
                href="/guide"
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                使い方・機能を見る
              </Link>
            </div>
          </div>
          </div>
        </section>

        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">プロジェクト一覧</h2>
            <p className="text-sm text-gray-500 mt-1">
              最初の1行だけが見える位置に配置しています。続きはスクロールで。
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">まだプロジェクトがありません</p>
            <div className="flex items-center justify-center gap-2">
              <Link href="/discover" className="text-indigo-600 font-medium hover:underline">
                プロジェクトを探す
              </Link>
              <span className="text-gray-300">/</span>
              <span className="text-indigo-600 font-medium">上の「新規プロジェクト作成」から作れます</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                href={`/projects/${project.id}`}
                key={project.id}
                className="block bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow hover:border-teal-200"
              >
                <div className="mb-4 w-full aspect-[16/9] overflow-hidden rounded-md bg-gradient-to-br from-indigo-50 to-gray-100 border">
                  {project.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.thumbnail_url}
                      alt={`${project.name} のサムネイル`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">
                      サムネイル未設定
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || "説明なし"}
                </p>
                {(project.start_at || project.end_at || project.start_date || project.end_date) && (
                  <div className="mb-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-medium">期間:</span>{" "}
                    {formatDateTime(project.start_at) || project.start_date || "未定"} 〜{" "}
                    {formatDateTime(project.end_at) || project.end_date || "未定"}
                  </div>
                )}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>作成日: {new Date(project.created_at).toLocaleDateString()}</span>
                  <span className="text-teal-700 font-medium">LPへ →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

