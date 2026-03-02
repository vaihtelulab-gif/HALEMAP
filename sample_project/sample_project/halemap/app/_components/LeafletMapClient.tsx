"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(
  () => import("./LeafletMap").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-zinc-600">
        地図を読み込み中…
      </div>
    ),
  },
);

export function LeafletMapClient() {
  return <LeafletMap />;
}

