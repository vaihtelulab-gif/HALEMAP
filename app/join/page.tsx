/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}

export default function JoinByCodePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const normalized = useMemo(() => normalizeCode(code), [code]);

  const canSubmit = isLoaded && isSignedIn && normalized.length >= 6 && !isSubmitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/parkmate/join-by-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized }),
      });

      const data = (await res.json()) as { error?: string; project_id?: string };
      if (!res.ok) {
        alert(data.error || "参加に失敗しました");
        return;
      }

      router.push("/home");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`エラーが発生しました: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900">
      <header className="sticky top-0 z-20 bg-[#fafaf7]/80 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/about" className="flex items-center gap-2">
            <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
          </Link>
          <Link
            href="/home"
            className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
          >
            アプリへ
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-teal-100 bg-white p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl font-bold">招待コードで参加</h1>
          <p className="mt-2 text-sm text-gray-600">
            参加したいプロジェクトのメンバーから招待コードを受け取り、ここに入力してください。
          </p>

          {!isLoaded ? (
            <div className="mt-6 text-sm text-gray-600">読み込み中...</div>
          ) : !isSignedIn ? (
            <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-4">
              <div className="text-sm text-teal-900 font-medium">
                参加にはログインが必要です
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/sign-in"
                  className="px-4 py-2 rounded-md bg-teal-700 text-white hover:bg-teal-800 text-sm font-medium"
                >
                  ログイン
                </Link>
                <Link
                  href="/sign-up"
                  className="px-4 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm font-medium"
                >
                  アカウント作成
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-6" onSubmit={onSubmit}>
              <label className="block text-sm font-medium text-gray-700">
                招待コード
              </label>
              <input
                className="mt-2 w-full rounded-md border border-gray-200 bg-white px-3 py-2 font-mono tracking-widest uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="例: ABC12345"
                inputMode="text"
                autoCapitalize="characters"
              />
              <div className="mt-2 text-xs text-gray-500">
                入力値: <span className="font-mono">{normalized || "—"}</span>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="px-5 py-3 rounded-md bg-teal-700 text-white hover:bg-teal-800 font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "参加中..." : "参加する"}
                </button>
                <Link href="/home" className="text-sm text-gray-500 hover:underline">
                  戻る
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

