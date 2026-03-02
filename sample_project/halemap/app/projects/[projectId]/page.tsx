import { UserButton } from "@clerk/nextjs";
import MapWrapper from '@/components/MapWrapper';
import Link from "next/link";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  return (
    <main className="relative h-screen w-full overflow-hidden">
      {/* ヘッダー（オーバーレイ） */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Link href="/" className="bg-white px-3 py-2 rounded-full shadow-md text-sm font-bold text-indigo-600 hover:bg-gray-50">
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
