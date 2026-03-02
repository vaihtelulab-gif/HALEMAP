import { LeafletMapClient } from "./_components/LeafletMapClient";

export default function Page() {
  return (
    <div className="flex h-dvh flex-col bg-white text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-base font-semibold leading-6">halemap</div>
            <div className="truncate text-xs text-zinc-600">
              OpenStreetMap / Leaflet
            </div>
          </div>
          <a
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-900 hover:bg-zinc-50"
            href="/manifest.webmanifest"
            target="_blank"
            rel="noreferrer"
          >
            manifest
          </a>
        </div>
      </header>

      <main className="relative flex-1">
        <LeafletMapClient />

        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-xs text-zinc-700 shadow-sm backdrop-blur">
          <div className="pointer-events-auto font-medium text-zinc-900">
            まずは表示復旧
          </div>
          <div className="pointer-events-auto mt-1">
            次に「どんな地図UIにしたいか」を反映していきます。
          </div>
        </div>
      </main>
    </div>
  );
}