import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import MapWrapper from "@/components/MapWrapper";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProjectMapPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projectId } = await params;

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
        <Link
          href="/home"
          className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-bold text-teal-800 hover:bg-teal-50 border border-teal-100"
        >
          プロジェクト一覧
        </Link>
        <div className="bg-white p-2 rounded-full shadow-md">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>

      {/* 地図コンポーネント */}
      <MapWrapper projectId={projectId} />
    </main>
  );
}

