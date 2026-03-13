import Link from "next/link";

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#fafaf7] text-gray-900">
      <header className="sticky top-0 z-20 bg-[#fafaf7]/80 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/about" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-lockup.png" alt="halemap" className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              サービス概要
            </Link>
            <Link
              href="/"
              className="px-3 py-2 rounded-md bg-teal-700 text-white hover:bg-teal-800 text-sm"
            >
              アプリへ
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-teal-100 bg-white p-6 md:p-8 shadow-sm">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">使い方・機能まとめ</h1>
          <p className="mt-3 text-sm md:text-base text-gray-600 max-w-3xl">
            halemap は「掲示する」「はがす（撤去する）」を、地図と履歴で共有し、地域・施設ごとの運用の違いも含めて、
            迷いにくい形で残すためのツールです。
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="#flow"
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              まずは流れ
            </a>
            <a
              href="#features"
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              主要機能
            </a>
            <a
              href="#projects"
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              プロジェクト/参加
            </a>
            <a
              href="#tips"
              className="px-3 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm"
            >
              運用のコツ
            </a>
          </div>
        </div>

        <section id="flow" className="mt-10">
          <h2 className="text-xl font-bold">まずは流れ（3ステップ）</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                t: "スポットを登録",
                d: "掲示板/掲示ポイントを地図上に登録します（場所は残る）。",
              },
              {
                n: "2",
                t: "掲示/撤去を報告",
                d: "写真・メモを添えて「貼る/剥がす」を記録。掲示期限（任意）も残せます。",
              },
              {
                n: "3",
                t: "履歴で追える",
                d: "タイムラインで最近の更新を確認。必要な人だけ、必要なときに追えます。",
              },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold">
                    {s.n}
                  </div>
                  <div className="text-lg font-bold">{s.t}</div>
                </div>
                <p className="mt-3 text-sm text-gray-700">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="features" className="mt-12">
          <h2 className="text-xl font-bold">主要機能</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                t: "地図（スポット）",
                d: "スポットはプロジェクト終了まで維持。状態（掲示中/空き）で見分けられます。",
              },
              {
                t: "掲示/撤去の作業報告",
                d: "写真（任意）＋メモで状況を共有。掲示期限の記録にも対応。",
              },
              {
                t: "タイムライン（最近の更新）",
                d: "プロジェクトLPや地図の履歴から、最近の作業を追えます。",
              },
              {
                t: "サムネイル",
                d: "プロジェクトごとにサムネイル設定。アップロード時に 16:9 WebP へ自動整形。",
              },
              {
                t: "プロジェクトLP → 地図",
                d: "一覧からLPへ。概要/注意事項/メンバー/最近の更新を見てから地図へ移動できます。",
              },
              {
                t: "PWA（ホーム画面に追加）",
                d: "スマホでアプリのように使えます（環境により挙動が異なる場合があります）。",
              },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
                <div className="text-sm font-bold text-gray-900">{f.t}</div>
                <p className="mt-2 text-sm text-gray-700">{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="projects" className="mt-12">
          <h2 className="text-xl font-bold">プロジェクトと参加</h2>
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-gray-900">公開範囲（Visibility）</div>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li>パブリック: 誰でも参加</li>
                <li>プライベート: 参加に承認が必要</li>
                <li>シークレット: 一覧に出さない（招待制）</li>
                <li>コラボレート: ゲスト招待に対応（運用に合わせて）</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
              <div className="text-sm font-bold text-gray-900">参加方法</div>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                <li>「プロジェクトを探す」から参加（公開範囲に応じて）</li>
                <li>「招待コードで参加」から参加（招待コード入力）</li>
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/join"
                  className="px-4 py-2 rounded-md border border-teal-200 bg-white hover:bg-teal-50 text-sm font-medium"
                >
                  招待コードで参加
                </Link>
                <Link
                  href="/discover"
                  className="px-4 py-2 rounded-md bg-teal-700 text-white hover:bg-teal-800 text-sm font-medium"
                >
                  プロジェクトを探す
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="tips" className="mt-12">
          <h2 className="text-xl font-bold">運用のコツ</h2>
          <div className="mt-4 rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <span className="font-medium text-gray-900">注意事項はLPに集約</span>：
                「どこに確認するか」「写真の撮り方」など、迷いポイントを最初に置きます。
              </li>
              <li>
                <span className="font-medium text-gray-900">スポット名は短く一貫</span>：
                「駅前掲示板」「公民館入口」など検索しやすい名前がおすすめです。
              </li>
              <li>
                <span className="font-medium text-gray-900">メモは“判断材料”だけ</span>：
                長文より、次の人が判断できる情報（期限・管理者・掲示場所の条件）を優先。
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-12">
          <div className="rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-cyan-50 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="text-lg font-bold">はじめよう</div>
                <div className="mt-1 text-sm text-gray-700">まずは参加して、プロジェクトLPから地図へ。</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="px-5 py-3 rounded-md bg-teal-700 text-white hover:bg-teal-800 font-medium"
                >
                  アプリへ
                </Link>
                <Link
                  href="/about"
                  className="px-5 py-3 rounded-md border border-teal-200 bg-white hover:bg-teal-50 font-medium"
                >
                  サービス概要
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

