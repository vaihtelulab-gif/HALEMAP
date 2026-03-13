import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import type { Project } from "@/types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DiscoverJoinButton from "@/components/DiscoverJoinButton";

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

export default async function DiscoverPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: memberRows, error: memberError } = await supabase
    .from("project_members")
    .select("project_id")
    .eq("user_id", userId);

  if (memberError) {
    throw new Error(memberError.message);
  }

  const memberIds = new Set((memberRows ?? []).map((r: { project_id: string }) => r.project_id));

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id,name,description,created_by,created_at,start_at,end_at,start_date,end_date,thumbnail_url,visibility")
    .in("visibility", ["public", "private", "collaborate"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const visible = (projects ?? []).filter((p: { id: string }) => !memberIds.has(p.id)) as Project[];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/home" className="text-xl font-bold text-indigo-600 hover:underline">
              halemap
            </Link>
            <span className="text-sm text-gray-500">/ プロジェクトを探す</span>
          </div>
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">参加できるプロジェクト</h2>
          <Link
            href="/home"
            className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm"
          >
            戻る
          </Link>
        </div>

        {visible.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">表示できるプロジェクトがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((project) => {
              return (
                <div
                  key={project.id}
                  className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
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

                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                      {visibilityLabel(project.visibility)}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {project.description || "説明なし"}
                  </p>

                  <DiscoverJoinButton projectId={project.id} visibility={project.visibility} />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

