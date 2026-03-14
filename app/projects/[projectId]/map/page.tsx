import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default async function ProjectMapPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const { userId } = await auth();

  if (!userId) {
    const { data: project } = await supabase
      .from("projects")
      .select("visibility, open_access")
      .eq("id", projectId)
      .maybeSingle();

    const isOpenProject = project?.visibility === "public" && Boolean(project?.open_access);
    if (!isOpenProject) redirect("/sign-in");
  }

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* ヘッダー（オーバーレイ） */}
      <div className="absolute top-4 right-4 z-[1100] flex items-center gap-2 pointer-events-auto">
        <Link
          href={`/projects/${projectId}`}
          className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-bold text-teal-800 hover:bg-teal-50 border border-teal-100"
        >
          プロジェクトLP
        </Link>
        {userId ? (
          <>
            <Link
              href="/home"
              className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-bold text-teal-800 hover:bg-teal-50 border border-teal-100"
            >
              プロジェクト一覧
            </Link>
            <div className="bg-white p-2 rounded-full shadow-md">
              <UserButton afterSignOutUrl="/sign-in" />
            </div>
          </>
        ) : (
          <Link
            href="/sign-in"
            className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-bold text-teal-800 hover:bg-teal-50 border border-teal-100"
          >
            ログイン
          </Link>
        )}
      </div>

      {/* 地図コンポーネント */}
      <MapWrapper projectId={projectId} />
    </main>
  );
}

