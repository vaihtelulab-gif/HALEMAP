'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import Timeline from './Timeline';
import SpotList from './SpotList';
import ProjectSettings from './ProjectSettings';

const Map = dynamic(() => import('./Map'), { 
  ssr: false,
  loading: () => <div className="h-screen w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
});

export default function MapWrapper({ projectId }: { projectId: string }) {
  const [activeSidebar, setActiveSidebar] = useState<'none' | 'timeline' | 'spotlist'>('none');
  const [isAddMode, setIsAddMode] = useState(false);
  const [selectedSpotIdForTimeline, setSelectedSpotIdForTimeline] = useState<string | null>(null);
  const [locateTrigger, setLocateTrigger] = useState(0);

  const handleShowTimeline = (spotId: string | null) => {
    setSelectedSpotIdForTimeline(spotId);
    setActiveSidebar('timeline');
  };

  return (
    <>
      <Map 
        projectId={projectId}
        isAddMode={isAddMode} 
        onAddModeChange={setIsAddMode} 
        onShowTimeline={handleShowTimeline}
        locateTrigger={locateTrigger}
      />
      
      {/* 登録モード時の案内表示 */}
      {isAddMode && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-bold animate-bounce pointer-events-none">
          地図上の登録したい場所をタップしてください
        </div>
      )}

      {/* アクションボタン群 */}
      <div className="absolute bottom-8 right-4 z-[999] flex flex-col gap-3">
        {/* プロジェクト設定ボタン */}
        <button 
          onClick={() => setActiveSidebar('settings')}
          className="bg-white text-gray-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="プロジェクト設定"
          title="プロジェクト設定"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        {/* スポット登録ボタン */}
        <button 
          onClick={() => {
            setIsAddMode(!isAddMode);
            setActiveSidebar('none');
          }}
          className={`${isAddMode ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'} p-3 rounded-full shadow-lg hover:opacity-90 transition-colors border border-gray-200`}
          aria-label="スポットを登録"
          title="スポットを登録"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        {/* スポット一覧ボタン */}
        <button 
          onClick={() => setActiveSidebar('spotlist')}
          className="bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="スポット一覧を表示"
          title="スポット一覧"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>

        {/* 全体のタイムラインボタン */}
        <button 
          onClick={() => handleShowTimeline(null)}
          className="bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="全体の作業履歴を表示"
          title="全体の作業履歴"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </button>

        {/* 現在地ボタン */}
        <button 
          onClick={() => {
            // Mapコンポーネントに現在地取得を指示するためのイベントを発火
            // 簡易的な実装として、windowイベントを使用するか、stateをリフトアップする
            // ここではstateリフトアップが望ましいが、MapWrapperの構造上、
            // Mapコンポーネントにrefを渡すか、トリガー用のpropを渡すのが良い。
            // 今回はトリガーprop方式を採用するために、MapWrapperにstateを追加します。
            // (このStrReplaceの後でstate追加のStrReplaceを行います)
            setLocateTrigger(prev => prev + 1);
          }}
          className="bg-white text-indigo-600 p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          aria-label="現在地を表示"
          title="現在地を表示"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </button>
      </div>

      {/* サイドバー */}
      <Timeline 
        isOpen={activeSidebar === 'timeline'} 
        onClose={() => setActiveSidebar('none')} 
        spotId={selectedSpotIdForTimeline}
        projectId={projectId}
      />
      <SpotList 
        isOpen={activeSidebar === 'spotlist'} 
        onClose={() => setActiveSidebar('none')} 
        projectId={projectId}
      />
      <ProjectSettings
        isOpen={activeSidebar === 'settings'}
        onClose={() => setActiveSidebar('none')}
        projectId={projectId}
      />
    </>
  );
}
