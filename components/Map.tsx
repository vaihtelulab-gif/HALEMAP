'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { Spot, Project } from '@/types';
import { supabase } from '@/lib/supabaseClient';

// Leafletのデフォルトアイコン設定
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: iconUrl,
  iconRetinaUrl: iconRetinaUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const markerIconCache = new globalThis.Map<string, L.DivIcon>();

function pinSvg(color: string) {
  return `
<svg width="30" height="46" viewBox="0 0 30 46" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M15 45C15 45 28 29.7 28 17C28 8.7 22.2 2 15 2C7.8 2 2 8.7 2 17C2 29.7 15 45 15 45Z" fill="${color}" stroke="rgba(0,0,0,0.25)" stroke-width="1"/>
  <circle cx="15" cy="17" r="6.5" fill="white" fill-opacity="0.92"/>
  <circle cx="15" cy="17" r="4.5" fill="rgba(0,0,0,0.18)"/>
</svg>
`.trim();
}

function getStatusMarkerIcon(status: Spot["status"]): L.DivIcon {
  // posted: green / vacant(removal): gray-brown
  const color = status === "posted" ? "#16a34a" : "#6b7280";
  const key = `pin:${status}:${color}`;
  const cached = markerIconCache.get(key);
  if (cached) return cached;

  const icon = L.divIcon({
    className: "",
    html: pinSvg(color),
    iconSize: [30, 46],
    iconAnchor: [15, 44],
    popupAnchor: [0, -38],
  });
  markerIconCache.set(key, icon);
  return icon;
}

// マップクリックイベントを処理するコンポーネント
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// マップ設定を適用するコンポーネント
function MapConfigController({ config }: { config: Project['map_config'] }) {
  const map = useMap();

  useEffect(() => {
    if (config) {
      const { center, range } = config;
      const latDiff = range.ns / 111111 / 2;
      const lngDiff = range.ew / (111111 * Math.cos(center.lat * Math.PI / 180)) / 2;

      const bounds = L.latLngBounds(
        [center.lat - latDiff, center.lng - lngDiff],
        [center.lat + latDiff, center.lng + lngDiff]
      );

      map.setMaxBounds(bounds.pad(0.1)); // 少し余裕を持たせる
      map.fitBounds(bounds);
      map.setMinZoom(10); // ズームアウトしすぎないように制限
    }
  }, [config, map]);

  return null;
}

// 現在地制御コンポーネント
function LocationController({ trigger, onLocationFound }: { trigger: number, onLocationFound: (latlng: L.LatLng) => void }) {
  const map = useMap();

  useEffect(() => {
    if (trigger > 0) {
      map.locate({ setView: true, maxZoom: 16, watch: true });
    }
    
    // クリーンアップ
    return () => {
      map.stopLocate();
    };
  }, [trigger, map]);

  useMapEvents({
    locationfound(e) {
      onLocationFound(e.latlng);
    },
    locationerror(e) {
      console.error("Location access denied.", e);
      // ユーザーへの通知は控えめにするか、明示的なアクション時のみにする
      if (trigger > 0) {
        alert("現在地を取得できませんでした。ブラウザの位置情報設定をご確認ください。");
      }
    }
  });

  return null;
}

export default function Map({ 
  projectId,
  isAddMode, 
  onAddModeChange,
  onShowTimeline,
  locateTrigger
}: { 
  projectId: string,
  isAddMode: boolean, 
  onAddModeChange: (mode: boolean) => void,
  onShowTimeline: (spotId: string) => void,
  locateTrigger?: number
}) {
  const [isMounted, setIsMounted] = useState(false);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [newSpotPos, setNewSpotPos] = useState<L.LatLng | null>(null);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotMemo, setNewSpotMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mapConfig, setMapConfig] = useState<Project['map_config']>(undefined);
  const [projectEndDate, setProjectEndDate] = useState<string | null>(null);
  
  // 現在地ステート
  const [userLocation, setUserLocation] = useState<L.LatLng | null>(null);
  
  // 作業報告用ステート
  const [reportingSpot, setReportingSpot] = useState<Spot | null>(null);
  const [reportType, setReportType] = useState<'post' | 'remove' | null>(null);
  const [reportMemo, setReportMemo] = useState('');
  const [reportPosterName, setReportPosterName] = useState('');
  const [reportDeadline, setReportDeadline] = useState('');
  const [reportFile, setReportFile] = useState<File | null>(null);

  // 初期化とスポット取得
  useEffect(() => {
    setIsMounted(true);
    
    // Fix icon issue only once
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
    delete proto._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchSpots();
      fetchProjectDetails();
      checkAdmin();
    }
  }, [isMounted, projectId]); // projectIdが変わったら再取得

  const checkAdmin = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/role`);
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(['owner', 'admin'].includes(data.role));
      }
    } catch (error) {
      console.error('Failed to check admin role:', error);
    }
  };

  const fetchProjectDetails = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const projects = (await res.json()) as Array<{
          id: string;
          map_config?: Project["map_config"];
          end_date?: string | null;
          end_at?: string | null;
        }>;
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          if (project.map_config) {
            setMapConfig(project.map_config);
          }
          if (project.end_at && project.end_at.length >= 10) {
            setProjectEndDate(project.end_at.slice(0, 10));
          } else if (project.end_date) {
            setProjectEndDate(project.end_date);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch project details:', error);
    }
  };

  // AddModeがオフになったら新規登録マーカーを消す
  useEffect(() => {
    if (!isAddMode) {
      setNewSpotPos(null);
    }
  }, [isAddMode]);

  const fetchSpots = async () => {
    try {
      const res = await fetch(`/api/spots?project_id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setSpots(data);
      }
    } catch (error) {
      console.error('Failed to fetch spots:', error);
    }
  };

  const handleMapClick = (latlng: L.LatLng) => {
    // 報告中は新規登録を無効化
    if (reportingSpot) return;
    // 追加モードでない場合は無視
    if (!isAddMode) return;

    setNewSpotPos(latlng);
    setNewSpotName('');
    setNewSpotMemo('');
  };

  const handleSaveSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotPos || !newSpotName) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/spots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSpotName,
          latitude: newSpotPos.lat,
          longitude: newSpotPos.lng,
          status: 'vacant',
          memo: newSpotMemo,
          project_id: projectId,
        }),
      });

      if (res.ok) {
        const savedSpot = await res.json();
        setSpots([savedSpot, ...spots]);
        setNewSpotPos(null);
        onAddModeChange(false); // 登録完了したらモード終了
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving spot:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSpot = async (spotId: string) => {
    if (!confirm('本当にこのスポットを削除しますか？')) return;
    try {
      const res = await fetch(`/api/spots?id=${spotId}&project_id=${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSpots(spots.filter(s => s.id !== spotId));
        setReportingSpot(null);
      } else {
        alert('削除に失敗しました（権限がない可能性があります）');
      }
    } catch (error) {
      console.error('Error deleting spot:', error);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingSpot || !reportType) return;

    setIsLoading(true);
    let photoUrl = null;

    try {
      // 1. 画像アップロード
      if (reportFile) {
        const fileExt = reportFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${reportingSpot.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(filePath, reportFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(filePath);
        
        photoUrl = publicUrl;
      }

      // 2. 報告データの保存
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spot_id: reportingSpot.id,
          type: reportType,
          photo_url: photoUrl,
          memo: reportMemo,
          poster_name: reportPosterName,
          removal_deadline: reportDeadline || null,
        }),
      });

      if (res.ok) {
        // スポットの状態を更新して再取得
        await fetchSpots();
        setReportingSpot(null);
        setReportType(null);
        setReportMemo('');
        setReportPosterName('');
        setReportDeadline('');
        setReportFile(null);
      } else {
        alert('報告に失敗しました');
      }
    } catch (error) {
      console.error('Error reporting:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert('エラーが発生しました: ' + message);
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

  if (!isMounted || typeof window === 'undefined') {
    return <div className="h-screen w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>;
  }

  return (
    <MapContainer
      key={projectId} // Force re-mount when project changes
      center={[35.6895, 139.6917]} // 都庁前
      zoom={13}
      scrollWheelZoom={true}
      className="h-screen w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapClickHandler onMapClick={handleMapClick} />
      <MapConfigController config={mapConfig} />
      <LocationController 
        trigger={locateTrigger || 0} 
        onLocationFound={(latlng) => setUserLocation(latlng)} 
      />

      {/* 現在地マーカー */}
      {userLocation && (
        <CircleMarker 
          center={userLocation} 
          radius={8} 
          pathOptions={{ color: 'white', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }} 
        >
          <Popup>現在地</Popup>
        </CircleMarker>
      )}

      {spots.map((spot) => (
        <Marker
          key={spot.id}
          position={[spot.latitude, spot.longitude]}
          icon={getStatusMarkerIcon(spot.status)}
        >
          <Popup minWidth={250}>
            {reportingSpot?.id === spot.id ? (
              // 報告フォーム
              <div className="p-1">
                <h3 className="font-bold mb-2">
                  {reportType === 'post' ? 'ポスターを貼る' : 'ポスターを剥がす'}
                </h3>
                <form onSubmit={handleReport}>
                  {reportType === 'post' && (
                    <>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">ポスター名</label>
                        <input
                          type="text"
                          className="w-full border rounded p-1 text-sm"
                          value={reportPosterName}
                          onChange={(e) => setReportPosterName(e.target.value)}
                          placeholder="例: 春のコンサート"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label className="block text-xs text-gray-500 mb-1">掲示期限 (任意)</label>
                        <input
                          type="date"
                          className="w-full border rounded p-1 text-sm"
                          value={reportDeadline}
                          onChange={(e) => setReportDeadline(e.target.value)}
                        />
                        {projectEndDate && !reportDeadline && (
                          <p className="text-[10px] text-gray-400 mt-0.5">※未設定の場合、プロジェクト終了日({projectEndDate})が目安となります</p>
                        )}
                      </div>
                    </>
                  )}
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">写真 (任意)</label>
                    <label className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                      <div className="flex flex-col items-center">
                        {reportFile ? (
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs text-teal-800 font-medium truncate max-w-[180px]">{reportFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-xs text-teal-800 font-bold bg-teal-50 px-2 py-1 rounded border border-teal-100">写真を追加する</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setReportFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs text-gray-500 mb-1">メモ</label>
                    <textarea
                      className="w-full border rounded p-1 text-sm"
                      value={reportMemo}
                      onChange={(e) => setReportMemo(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-between gap-2">
                    <button
                      type="button"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => {
                        setReportingSpot(null);
                        setReportType(null);
                        setReportPosterName('');
                        setReportDeadline('');
                      }}
                    >
                      キャンセル
                    </button>
                    <button
                      type="submit"
                      className="bg-teal-700 text-white text-xs px-3 py-1.5 rounded hover:bg-teal-800 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {isLoading ? '送信中...' : '報告する'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // 通常表示
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{spot.name}</h3>
                <div className="text-sm text-gray-600 mb-2">
                  状態: <span className={
                    spot.status === 'posted' 
                      ? (isExpired(spot.current_deadline) ? 'text-purple-600 font-bold' : (isExpiringSoon(spot.current_deadline) ? 'text-orange-500 font-bold' : 'text-red-600 font-bold'))
                      : 'text-green-600 font-bold'
                  }>
                    {spot.status === 'posted' 
                      ? (isExpired(spot.current_deadline) ? '期限切れ' : (isExpiringSoon(spot.current_deadline) ? '期限間近' : '掲示中'))
                      : '空き'}
                  </span>
                </div>
                {spot.status === 'posted' && spot.current_poster_name && (
                  <div className="text-sm text-gray-800 mb-2 font-medium bg-yellow-50 p-1 rounded border border-yellow-200">
                    <div>📄 {spot.current_poster_name}</div>
                    {spot.current_deadline && (
                      <div className={`text-xs mt-1 ${isExpired(spot.current_deadline) ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        期限: {spot.current_deadline}
                      </div>
                    )}
                  </div>
                )}
                {spot.memo && <p className="text-sm text-gray-500 mb-3">{spot.memo}</p>}
                
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onShowTimeline(spot.id)}
                    className="bg-gray-100 text-gray-600 text-xs py-2 px-3 rounded hover:bg-gray-200"
                    title="履歴を見る"
                  >
                    🕒
                  </button>
                  {spot.status === 'vacant' ? (
                    <button
                      onClick={() => {
                        setReportingSpot(spot);
                        setReportType('post');
                        // プロジェクトの終了日をデフォルト値としてセット
                        if (projectEndDate) {
                          setReportDeadline(projectEndDate);
                        }
                      }}
                      className="flex-1 bg-teal-700 text-white text-xs py-2 rounded hover:bg-teal-800"
                    >
                      ポスターを貼る
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setReportingSpot(spot);
                        setReportType('remove');
                      }}
                      className="flex-1 bg-gray-600 text-white text-xs py-2 rounded hover:bg-gray-700"
                    >
                      剥がす
                    </button>
                  )}
                </div>
                {isAdmin && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteSpot(spot.id)}
                      className="text-red-500 text-xs hover:text-red-700 underline"
                    >
                      スポットを削除
                    </button>
                  </div>
                )}
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {newSpotPos && !reportingSpot && (
        <Marker position={newSpotPos}>
          <Popup closeButton={false} minWidth={250}>
            <div className="p-2">
              <h3 className="font-bold mb-2">新しいスポットを登録</h3>
              <form onSubmit={handleSaveSpot}>
                <div className="mb-2">
                  <label className="block text-xs text-gray-500 mb-1">名前</label>
                  <input
                    type="text"
                    className="w-full border rounded p-1 text-sm"
                    value={newSpotName}
                    onChange={(e) => setNewSpotName(e.target.value)}
                    required
                    placeholder="掲示板の名前"
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">メモ</label>
                  <textarea
                    className="w-full border rounded p-1 text-sm"
                    value={newSpotMemo}
                    onChange={(e) => setNewSpotMemo(e.target.value)}
                    placeholder="詳細情報など"
                    rows={2}
                  />
                </div>
                <div className="flex justify-between">
                  <button
                    type="button"
                    className="text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => {
                      setNewSpotPos(null);
                      onAddModeChange(false);
                    }}
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-700 text-white text-xs px-3 py-1.5 rounded hover:bg-teal-800 disabled:opacity-50"
                  >
                    {isLoading ? '保存中...' : '登録する'}
                  </button>
                </div>
              </form>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
