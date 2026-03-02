/* eslint-disable @next/next/no-img-element */
'use client';

import Link from "next/link";
import { SignInButton, SignUpButton, useUser } from "@clerk/nextjs";
import CountUp from "@/components/CountUp";

const SERVICE_NAME = "halemap";

export default function AboutPage() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900">
      <header className="sticky top-0 z-20 bg-[#fafaf7]/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <Link href="/about" className="flex items-center gap-2">
            <img src="/brand/logo-lockup.png" alt={`${SERVICE_NAME}`} className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            {isLoaded && isSignedIn ? (
              <Link
                href="/"
                className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
              >
                アプリへ
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm">
                    ログイン
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-3 py-2 rounded-md bg-teal-700 text-white hover:bg-teal-800 text-sm">
                    はじめる
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-100">
                街の掲示物を、みんなで整える
              </div>
              <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight">
                あなたの街は、
                <span className="text-teal-800">もっときれいになれる。</span>
              </h1>
              <p className="mt-4 text-lg text-gray-700">
                チラシ・ポスターの設置と撤去を、地域住民で管理するプラットフォーム。
                <span className="font-medium text-gray-900">「はがしたら、街が整った」</span>という爽快感を、日常の行動に。
              </p>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <SignUpButton mode="modal">
                  <button className="px-5 py-3 rounded-md bg-teal-700 text-white hover:bg-teal-800 font-medium text-center">
                    参加して整える
                  </button>
                </SignUpButton>
                <Link
                  href="/"
                  className="px-5 py-3 rounded-md border border-teal-200 bg-white hover:bg-teal-50 font-medium text-center"
                >
                  すでに利用中（プロジェクトへ）
                </Link>
              </div>

              <div className="mt-6 text-sm text-gray-600">
                対象: ボランティア / 地域活動の主催者・参加者
              </div>
              <div className="mt-4 text-sm text-gray-600">
                ユースケース: 掲示物の期限管理 / 自治体・施設ごとの確認先の共有 / 撤去実績の可視化
              </div>
            </div>

            {/* Map image mock */}
            <div className="relative">
              <div className="rounded-3xl border border-teal-100 bg-white shadow-sm overflow-hidden">
                <div className="aspect-[16/10] bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6">
                  <div className="relative h-full w-full rounded-2xl border bg-white/70 backdrop-blur p-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.18]">
                      <div className="h-full w-full bg-[linear-gradient(to_right,#0f766e_1px,transparent_1px),linear-gradient(to_bottom,#0f766e_1px,transparent_1px)] bg-[size:28px_28px]" />
                    </div>

                    <div className="absolute left-[14%] top-[22%] h-[55%] w-[60%] rounded-[36px] bg-teal-200/35 blur-2xl" />
                    <div className="absolute left-[18%] top-[26%] h-[47%] w-[52%] rounded-[32px] bg-cyan-200/35 blur-xl" />

                    {[
                      { x: "28%", y: "34%" },
                      { x: "52%", y: "40%" },
                      { x: "40%", y: "60%" },
                      { x: "66%", y: "52%" },
                      { x: "58%", y: "28%" },
                    ].map((p, i) => (
                      <div key={i} className="absolute" style={{ left: p.x, top: p.y }}>
                        <div className="relative">
                          <div className="absolute -inset-2 rounded-full bg-teal-300/40 blur-md" />
                          <div className="h-3.5 w-3.5 rounded-full bg-teal-700 ring-4 ring-teal-100" />
                        </div>
                      </div>
                    ))}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        最近の活動エリアが<span className="font-medium text-gray-900">光る</span>
                      </div>
                      <div className="text-xs text-gray-500">※地図はモック</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-600">
                撤去の記録が積み重なるほど、街の“整い”が可視化されます。
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12" id="stats">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">数字で見る活動実績</h2>
              <p className="mt-2 text-sm text-gray-600">
                “整った”が、ちゃんと見える。小さな行動が積み上がる指標です。
              </p>
            </div>
            <div className="hidden md:block text-xs text-gray-500">※数値はサンプル</div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "撤去件数", value: 1284, unit: "件" },
              { label: "参加人数", value: 346, unit: "人" },
              { label: "整った街エリア数", value: 27, unit: "エリア" },
            ].map((c) => (
              <div key={c.label} className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm">
                <div className="text-sm font-medium text-gray-600">{c.label}</div>
                <div className="mt-2 text-4xl font-bold tracking-tight text-teal-800">
                  <CountUp to={c.value} />{" "}
                  <span className="text-base font-semibold text-teal-800/80">{c.unit}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">“はがした”が街の健康に変わっていく。</div>
              </div>
            ))}
          </div>
        </section>

        {/* HOW */}
        <section id="how" className="bg-white border-y border-teal-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold">仕組み</h2>
            <p className="mt-2 text-sm text-gray-600">迷わず、責めず、続けられる。3ステップで回る運用です。</p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { step: "1", title: "見つける", desc: "街で気になる掲示物や掲示板を見つける" },
                { step: "2", title: "報告する", desc: "地図にピン＋写真・メモで状況を共有" },
                { step: "3", title: "撤去確認", desc: "撤去したら記録。街が“整った”が残る" },
              ].map((s) => (
                <div key={s.step} className="rounded-2xl border border-teal-100 bg-[#fafaf7] p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold">
                      {s.step}
                    </div>
                    <div className="text-lg font-bold">{s.title}</div>
                  </div>
                  <p className="mt-3 text-sm text-gray-700">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MAP */}
        <section id="map" className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl font-bold">最近の活動マップ</h2>
              <p className="mt-2 text-sm text-gray-600">
                どこが整ったかが見えると、次の一歩が自然に生まれます。 “達成感”を地図に残します。
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-700 shrink-0" />
                  撤去の記録がピンとして残る
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-700 shrink-0" />
                  活動エリアが光って“整い”を可視化
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-teal-700 shrink-0" />
                  参加圧のない、ゆるい協力ができる
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-teal-100 bg-white shadow-sm overflow-hidden">
              <div className="aspect-[16/11] bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6">
                <div className="relative h-full w-full rounded-2xl border bg-white/70 backdrop-blur overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.16]">
                    <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#14b8a633,transparent_55%),radial-gradient(circle_at_65%_35%,#2dd4bf33,transparent_55%),radial-gradient(circle_at_45%_70%,#14b8a626,transparent_60%)]" />
                  </div>
                  <div className="absolute inset-0 opacity-[0.18]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,#0f766e_1px,transparent_1px),linear-gradient(to_bottom,#0f766e_1px,transparent_1px)] bg-[size:32px_32px]" />
                  </div>

                  {[
                    { x: "18%", y: "30%" },
                    { x: "32%", y: "52%" },
                    { x: "56%", y: "40%" },
                    { x: "72%", y: "60%" },
                    { x: "64%", y: "22%" },
                    { x: "42%", y: "28%" },
                  ].map((p, i) => (
                    <div key={i} className="absolute" style={{ left: p.x, top: p.y }}>
                      <div className="relative">
                        <div className="absolute -inset-3 rounded-full bg-teal-300/35 blur-lg" />
                        <div className="h-3.5 w-3.5 rounded-full bg-teal-800 ring-4 ring-teal-100" />
                      </div>
                    </div>
                  ))}

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-gray-600">
                    <span>直近の活動（ピン）</span>
                    <span className="text-gray-500">※モック表示</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VOICES */}
        <section id="voices" className="bg-white border-y border-teal-100">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
            <h2 className="text-2xl font-bold">参加者の声</h2>
            <p className="mt-2 text-sm text-gray-600">
              クラファン×地域サークルのような“活動感”を大切にします。
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: "ボランティア",
                  quote:
                    "“はがした”の記録が残ると、次の人が動きやすい。街が少しずつ澄む感じが気持ちいい。",
                },
                {
                  name: "地域活動の主催者",
                  quote:
                    "貼る人と撤去する人が分かれても運用できるのが助かります。無理に参加を促さないのも良い。",
                },
                {
                  name: "参加したい住民",
                  quote: "予定が合うときだけ1タップで関われる。押し付けがなくて、続けやすい。",
                },
              ].map((v) => (
                <div key={v.name} className="rounded-2xl border border-teal-100 bg-[#fafaf7] p-6">
                  <div className="text-xs font-medium text-teal-900 bg-teal-50 border border-teal-100 inline-flex px-2 py-1 rounded-full">
                    {v.name}
                  </div>
                  <p className="mt-3 text-sm text-gray-800 leading-relaxed">“{v.quote}”</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-cyan-50 p-8 md:p-10 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">あなたの街も整えよう</h2>
                <p className="mt-3 text-sm md:text-base text-gray-700">
                  まずは参加してみる。できるときに、できる分だけ。 “整った”の気持ちよさを、あなたの街にも。
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <SignUpButton mode="modal">
                  <button className="px-5 py-3 rounded-md bg-teal-700 text-white hover:bg-teal-800 font-medium text-center">
                    はじめる
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="px-5 py-3 rounded-md border border-teal-200 bg-white hover:bg-teal-50 font-medium text-center">
                    ログイン
                  </button>
                </SignInButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-teal-100 py-10 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} {SERVICE_NAME}
      </footer>
    </div>
  );
}

