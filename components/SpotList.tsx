'use client';

import { useEffect, useState, useMemo } from 'react';
import { Spot } from '@/types';

interface SpotListProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

type FilterType = 'all' | 'expired' | 'expiring' | 'posted' | 'vacant';

export default function SpotList({ isOpen, onClose, projectId }: SpotListProps) {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (isOpen) {
      fetchSpots();
    }
  }, [isOpen, projectId]);

  const fetchSpots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/spots?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSpots(data);
      }
    } catch (error) {
      console.error('Failed to fetch spots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 期限切れチェック用関数
  const isExpired = (deadline?: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  // 期限間近チェック用関数 (3日以内)
  const isExpiringSoon = (deadline?: string) => {
    if (!deadline) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 3;
  };

  const filteredSpots = useMemo(() => {
    const result = spots.filter(spot => {
      if (filter === 'all') return true;
      if (filter === 'vacant') return spot.status === 'vacant';
      
      // 以下は posted であることが前提のフィルタ
      if (spot.status !== 'posted') return false;
      
      if (filter === 'posted') return true; // posted全体
      if (filter === 'expired') return isExpired(spot.current_deadline);
      if (filter === 'expiring') return isExpiringSoon(spot.current_deadline);
      
      return true;
    });

    // 期限切れ・期限間近順にソート（期限が設定されているものを優先）
    return result.sort((a, b) => {
      if (a.status === 'vacant' && b.status === 'vacant') return 0;
      if (a.status === 'vacant') return 1;
      if (b.status === 'vacant') return -1;

      // 両方postedの場合
      const aExpired = isExpired(a.current_deadline);
      const bExpired = isExpired(b.current_deadline);
      if (aExpired && !bExpired) return -1;
      if (!aExpired && bExpired) return 1;

      const aExpiring = isExpiringSoon(a.current_deadline);
      const bExpiring = isExpiringSoon(b.current_deadline);
      if (aExpiring && !bExpiring) return -1;
      if (!aExpiring && bExpiring) return 1;

      // 期限が近い順
      if (a.current_deadline && b.current_deadline) {
        return new Date(a.current_deadline).getTime() - new Date(b.current_deadline).getTime();
      }
      return 0;
    });
  }, [spots, filter]);

  const counts = useMemo(() => {
    return {
      all: spots.length,
      expired: spots.filter(s => s.status === 'posted' && isExpired(s.current_deadline)).length,
      expiring: spots.filter(s => s.status === 'posted' && isExpiringSoon(s.current_deadline)).length,
      posted: spots.filter(s => s.status === 'posted').length,
      vacant: spots.filter(s => s.status === 'vacant').length,
    };
  }, [spots]);

  return (
    <>
      {/* オーバーレイ (モバイル用) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[1000] sm:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドバー本体 */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[1001] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shrink-0">
          <h2 className="font-bold text-lg">スポット一覧</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Filters */}
        <div className="p-2 bg-gray-100 border-b overflow-x-auto whitespace-nowrap shrink-0">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              すべて ({counts.all})
            </button>
            <button
              onClick={() => setFilter('posted')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === 'posted' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              掲示中 ({counts.posted})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === 'expired' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
              }`}
            >
              期限切れ ({counts.expired})
            </button>
            <button
              onClick={() => setFilter('expiring')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === 'expiring' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'
              }`}
            >
              期限間近 ({counts.expiring})
            </button>
            <button
              onClick={() => setFilter('vacant')}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                filter === 'vacant' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-600 border-green-200 hover:bg-green-50'
              }`}
            >
              空き ({counts.vacant})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredSpots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">該当するスポットはありません</p>
              {filter !== 'all' && (
                <button 
                  onClick={() => setFilter('all')}
                  className="text-indigo-600 text-sm mt-2 hover:underline"
                >
                  すべてのスポットを表示
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSpots.map((spot) => {
                const expired = isExpired(spot.current_deadline);
                const expiring = isExpiringSoon(spot.current_deadline);
                
                return (
                  <div key={spot.id} className={`bg-white p-3 rounded-lg shadow-sm border ${
                    expired ? 'border-purple-300 ring-1 ring-purple-300' : 
                    expiring ? 'border-orange-300 ring-1 ring-orange-300' : 
                    'border-gray-100'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{spot.name}</h3>
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded-full ${
                          spot.status === 'posted'
                            ? (expired ? 'bg-purple-100 text-purple-700' : (expiring ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'))
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {spot.status === 'posted' 
                          ? (expired ? '期限切れ' : (expiring ? '期限間近' : '掲示中'))
                          : '空き'}
                      </span>
                    </div>

                    {spot.status === 'posted' && spot.current_poster_name && (
                      <div className="mb-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">掲示物:</p>
                            <p className="text-sm font-medium text-gray-800">{spot.current_poster_name}</p>
                          </div>
                          {spot.current_deadline && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500 mb-0.5">期限:</p>
                              <p className={`text-sm font-bold ${
                                expired ? 'text-purple-600' : expiring ? 'text-orange-600' : 'text-gray-800'
                              }`}>
                                {spot.current_deadline}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {spot.memo && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{spot.memo}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
