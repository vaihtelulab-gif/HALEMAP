import Image from "next/image";
import { Camera, Music, Share2, ArrowRight, MapPin, Calendar } from "lucide-react";
import { Header } from "@/components/header";

export default function Home() {
  return (
    <main className="min-h-screen bg-dark text-white overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center grid-bg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark pointer-events-none"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-10 w-32 h-32 border-2 border-secondary/30 rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-1/3 right-10 w-64 h-64 border border-primary/20 rounded-full animate-bounce-slow"></div>

        <div className="container mx-auto px-6 text-center z-10 relative">
          <div className="inline-block mb-4 px-4 py-1 border border-secondary text-secondary rounded-full text-sm tracking-widest uppercase bg-secondary/10 backdrop-blur-sm">
            Game Market 2026 Spring
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-tight">
            ANALOG <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary text-shadow-neon">
              × DIGITAL
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            カードを並べて、スマホで撮るだけ。<br/>
            あなたのテーブルが、即興スタジオに変わる。
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <a href="#about" className="group bg-primary text-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-all duration-300 flex items-center gap-2">
              遊び方を見る <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
            </a>
            <a href="https://gamemarket.jp/gamemarket/2026s" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-full font-bold text-lg border border-white/30 hover:bg-white/10 transition-all duration-300">
              ゲムマ公式サイトへ
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="about" className="py-24 bg-dark relative">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
            <span className="border-b-4 border-primary pb-2">HOW TO PLAY</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors duration-300 group">
              <div className="w-16 h-16 bg-primary text-dark rounded-full flex items-center justify-center text-3xl font-bold mb-6 group-hover:scale-110 transition-transform">1</div>
              <h3 className="text-2xl font-bold mb-4">並べる (Build)</h3>
              <p className="text-gray-400 leading-relaxed">
                音符カードや休符カードをボードに並べます。
                友達と相談しながら、最高のリズムパターンを作りましょう。
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-secondary/50 transition-colors duration-300 group">
              <div className="w-16 h-16 bg-secondary text-dark rounded-full flex items-center justify-center text-3xl font-bold mb-6 group-hover:scale-110 transition-transform">2</div>
              <h3 className="text-2xl font-bold mb-4">撮る (Scan)</h3>
              <p className="text-gray-400 leading-relaxed">
                専用アプリでボードをパシャリ。
                画像認識AIが一瞬で譜面を読み取り、デジタルデータに変換します。
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10 hover:border-primary/50 transition-colors duration-300 group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary text-dark rounded-full flex items-center justify-center text-3xl font-bold mb-6 group-hover:scale-110 transition-transform">3</div>
              <h3 className="text-2xl font-bold mb-4">鳴らす (Play)</h3>
              <p className="text-gray-400 leading-relaxed">
                ビートに合わせてボディーパーカッション！
                演奏動画は自動で合成され、TikTokやインスタに即シェアできます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-b from-dark to-black overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-2xl rounded-full"></div>
              <div className="relative bg-gray-800 rounded-xl aspect-[9/16] w-64 mx-auto border-4 border-gray-700 flex items-center justify-center overflow-hidden shadow-2xl">
                {/* Mockup Screen */}
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                    <Camera className="w-8 h-8 text-secondary" />
                  </div>
                  <p className="text-sm text-gray-400">Scanning...</p>
                  <div className="mt-8 space-y-2">
                    <div className="h-2 bg-gray-700 rounded w-3/4 mx-auto"></div>
                    <div className="h-2 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                アプリが<br/>
                <span className="text-primary">魔法</span>をかける。
              </h2>
              <ul className="space-y-8">
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">爆速スキャン</h4>
                    <p className="text-gray-400">待ち時間ゼロ。並べた瞬間、音楽になる。</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Music className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">多彩な音色</h4>
                    <p className="text-gray-400">ドラム、シンセ、和太鼓... ジャンルに合わせて音色をチェンジ。</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-white/10 p-3 rounded-lg">
                    <Share2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">動画ジェネレーター</h4>
                    <p className="text-gray-400">演奏動画と正解リズムを自動合成。編集いらずでバズる動画に。</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Game Market Info */}
      <section className="py-24 bg-white text-dark">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gray-100 rounded-3xl p-8 md:p-16 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-bl-full z-0"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
                ゲームマーケット2026春<br/>出展決定！
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="flex items-center gap-4">
                  <Calendar className="w-10 h-10 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500 font-bold">DATE</p>
                    <p className="text-xl font-bold">2026.5.23(土) - 24(日)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-10 h-10 text-secondary" />
                  <div>
                    <p className="text-sm text-gray-500 font-bold">PLACE</p>
                    <p className="text-xl font-bold">幕張メッセ 展示ホール</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border-2 border-dashed border-gray-300 text-center mb-8">
                <p className="text-gray-500 font-bold mb-2">ブース番号</p>
                <p className="text-4xl font-black text-dark">未定</p>
                <p className="text-xs text-gray-400 mt-2">※決定次第更新します</p>
              </div>

              <div className="text-center">
                <p className="font-bold mb-4">会場限定特典</p>
                <div className="inline-block bg-dark text-white px-6 py-2 rounded-full text-sm">
                  プロモカード「8分休符（キラ）」プレゼント！
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reservation / CTA */}
      <section id="reservation" className="py-24 bg-dark text-center relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30"></div>
        <div className="container mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">
            GET READY TO <br/>
            <span className="text-primary">BEAT</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            当日販売分は数に限りがあります。<br/>
            確実に手に入れたい方は、事前予約をおすすめします。
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <button className="bg-white text-dark px-10 py-5 rounded-full font-bold text-xl hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
              予約フォームへ (準備中)
            </button>
            <button className="border-2 border-white text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-white/10 transition-colors">
              X (Twitter) で最新情報をチェック
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <div className="text-2xl font-bold tracking-tighter text-white mb-4">
            BeatStack
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 BeatStack Project. All rights reserved.<br/>
            Unauthorized copying and replication of the contents of this site, text and images are strictly prohibited.
          </p>
        </div>
      </footer>
    </main>
  );
}
