"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Visibility = "public" | "private" | "secret" | "collaborate" | undefined;
type JoinStatus =
  | "idle"
  | "joining"
  | "joined"
  | "requested"
  | "already_member"
  | "already_requested"
  | "error";

function joinButtonLabel(v?: Visibility) {
  if (v === "public") return "参加する";
  if (v === "private" || v === "collaborate") return "参加申請";
  return "参加不可";
}

export default function DiscoverJoinButton({
  projectId,
  visibility,
}: {
  projectId: string;
  visibility?: Visibility;
}) {
  const [st, setSt] = useState<JoinStatus>("idle");
  const router = useRouter();

  const disabled = st === "joining" || visibility === "secret";

  const handleJoin = async () => {
    if (disabled) return;
    setSt("joining");
    try {
      const res = await fetch(`/api/projects/${projectId}/join`, { method: "POST" });
      const data = (await res.json()) as { status?: string; error?: string };
      if (!res.ok) {
        alert(data.error || "参加処理に失敗しました");
        setSt("error");
        return;
      }

      const status = data.status as JoinStatus | undefined;
      if (status === "joined" || status === "already_member") {
        setSt(status ?? "joined");
        router.push(`/projects/${projectId}`);
        return;
      }
      if (status === "requested" || status === "already_requested") {
        setSt(status);
        return;
      }

      setSt("error");
    } catch (e) {
      console.error(e);
      setSt("error");
      alert("参加処理に失敗しました");
    }
  };

  return (
    <button
      onClick={handleJoin}
      disabled={disabled}
      className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
    >
      {st === "joining"
        ? "処理中…"
        : st === "requested" || st === "already_requested"
          ? "申請済み"
          : joinButtonLabel(visibility)}
    </button>
  );
}

