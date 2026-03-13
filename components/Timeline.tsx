'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Report } from '@/types';

interface TimelineProps {
  isOpen: boolean;
  onClose: () => void;
  spotId?: string | null;
  projectId: string;
}

export default function Timeline({ isOpen, onClose, spotId, projectId }: TimelineProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cache = useMemo(() => new Map<string, Report[]>(), []);

  useEffect(() => {
    if (!isOpen) return;

    const key = spotId ? `spot:${spotId}` : `project:${projectId}`;
    const cached = cache.get(key);
    if (cached) {
      setReports(cached);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    // Cancel any in-flight request (rapid open/close or switching spotId).
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchReports = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        let url = '/api/timeline';
        const params = new URLSearchParams();

        if (spotId) {
          params.append('spot_id', spotId);
        } else {
          params.append('project_id', projectId);
        }

        url += `?${params.toString()}`;

        const res = await fetch(url, { signal: controller.signal });
        if (res.ok) {
          const data = (await res.json()) as Report[];
          cache.set(key, data);
          setReports(data);
        } else {
          let details = '';
          try {
            const data = (await res.json()) as { error?: string; message?: string };
            details = data.error || data.message || JSON.stringify(data);
          } catch {
            try {
              details = await res.text();
            } catch {
              details = '';
            }
          }
          setReports([]);
          setErrorMessage(`取得に失敗しました (${res.status})${details ? `: ${details}` : ''}`);
        }
      } catch (error) {
        // Ignore abort errors (expected when switching quickly).
        if (error instanceof DOMException && error.name === 'AbortError') return;
        console.error('Failed to fetch timeline:', error);
        const message = error instanceof Error ? error.message : String(error);
        setErrorMessage(`取得に失敗しました: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchReports();

    return () => {
      controller.abort();
    };
  }, [isOpen, spotId, projectId]);

  const handleReaction = async (reportId: string, emoji: string) => {
    // Optimistic update
    setReports((prevReports) =>
      prevReports.map((report) => {
        if (report.id === reportId) {
          const isLiked = !report.is_liked;
          const countChange = isLiked ? 1 : -1;
          return {
            ...report,
            is_liked: isLiked,
            thumbs_up_count: (report.thumbs_up_count || 0) + countChange,
          };
        }
        return report;
      })
    );

    try {
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report_id: reportId, emoji }),
      });

      if (!res.ok) {
        // Revert on error
        console.error('Failed to update reaction');
        // Cache may now be stale; clear and let next open refetch.
        const key = spotId ? `spot:${spotId}` : `project:${projectId}`;
        cache.delete(key);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      const key = spotId ? `spot:${spotId}` : `project:${projectId}`;
      cache.delete(key);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      {/* オーバーレイ (モバイル用) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-[1200] sm:hidden"
          onClick={onClose}
        />
      )}
      
      {/* サイドバー本体 */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[1201] flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-indigo-600 text-white shrink-0">
          <h2 className="font-bold text-lg">
            {spotId ? 'スポット作業履歴' : '全体の作業履歴'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-full transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errorMessage}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-center text-gray-500 py-8">まだ報告がありません</p>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="relative pl-6 border-l-2 border-gray-200 last:border-0 pb-6 last:pb-0">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                      report.type === 'post' ? 'bg-indigo-500' : 'bg-gray-500'
                    }`}
                  ></div>

                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          report.type === 'post'
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {report.type === 'post' ? '貼った' : '剥がした'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(report.created_at)}
                      </span>
                    </div>

                    {!spotId && (
                      <h3 className="font-bold text-sm text-gray-900 mb-1 truncate">
                        {report.spot?.name || '不明なスポット'}
                      </h3>
                    )}

                    {report.type === 'post' && report.poster_name && (
                      <div className="text-sm text-gray-800 mb-2 font-medium bg-yellow-50 p-1 rounded border border-yellow-200">
                        📄 {report.poster_name}
                      </div>
                    )}

                    {report.performed_by?.display_name && (
                      <p className="text-xs text-gray-500 mb-2">
                        by {report.performed_by.display_name}
                      </p>
                    )}

                    {report.memo && (
                      <p className="text-sm text-gray-600 mb-2 bg-gray-50 p-2 rounded break-words whitespace-pre-wrap">
                        {report.memo}
                      </p>
                    )}

                    {report.photo_url && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={report.photo_url}
                          alt="報告写真"
                          className="w-full h-32 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Reaction Button */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center">
                      <button
                        onClick={() => handleReaction(report.id, '👍')}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
                          report.is_liked
                            ? 'bg-indigo-100 text-indigo-600'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span>👍</span>
                        <span className="font-medium">{report.thumbs_up_count || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
