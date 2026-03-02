'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const AreaSettingMap = dynamic(() => import('./AreaSettingMap'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

interface Member {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user: {
    display_name: string;
    email: string;
  };
}

interface ProjectSettingsProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface MapConfig {
  center: { lat: number; lng: number };
  range: { ns: number; ew: number };
}

export default function ProjectSettings({ projectId, isOpen, onClose }: ProjectSettingsProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'settings' | 'area'>('members');
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Area Setting Modal State
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);
  const [tempCenter, setTempCenter] = useState<{ lat: number; lng: number }>({ lat: 35.6895, lng: 139.6917 });
  const [tempRange, setTempRange] = useState<{ ns: number; ew: number }>({ ns: 1000, ew: 1000 });

  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      fetchProjectDetails();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    }
  };

  const fetchProjectDetails = async () => {
    const res = await fetch('/api/projects');
    if (res.ok) {
      const projects = (await res.json()) as Array<{
        id: string;
        name: string;
        description?: string | null;
        start_date?: string | null;
        end_date?: string | null;
        map_config?: MapConfig;
      }>;
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setProjectName(project.name);
        setProjectDesc(project.description || '');
        setProjectStartDate(project.start_date || '');
        setProjectEndDate(project.end_date || '');
        if (project.map_config) {
          setMapConfig(project.map_config);
          setTempCenter(project.map_config.center);
          setTempRange(project.map_config.range);
        }
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      
      if (res.ok) {
        setInviteEmail('');
        fetchMembers();
        alert('メンバーを追加しました');
      } else {
        const data = await res.json();
        alert(data.error || '招待に失敗しました');
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: userId, role: newRole }),
      });
      if (res.ok) {
        fetchMembers();
      } else {
        alert('権限の変更に失敗しました');
      }
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('本当にこのメンバーを削除しますか？')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members?user_id=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchMembers();
      } else {
        alert('メンバーの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName,
          description: projectDesc,
          start_date: projectStartDate || null,
          end_date: projectEndDate || null,
        }),
      });
      if (res.ok) {
        alert('プロジェクト情報を更新しました');
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('本当にこのプロジェクトを削除しますか？この操作は取り消せません。')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/');
      } else {
        alert('プロジェクトの削除に失敗しました');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleSaveArea = async () => {
    setIsLoading(true);
    const newConfig = {
      center: tempCenter,
      range: tempRange
    };
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: projectName, 
          description: projectDesc,
          map_config: newConfig,
          start_date: projectStartDate || null,
          end_date: projectEndDate || null,
        }),
      });
      if (res.ok) {
        setMapConfig(newConfig);
        setIsAreaModalOpen(false);
        alert('表示エリア設定を保存しました');
      } else {
        alert('保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving area:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col relative">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">プロジェクト設定</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'members' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('members')}
          >
            メンバー管理
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'area' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('area')}
          >
            表示エリア設定
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('settings')}
          >
            設定・削除
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'members' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">メンバーを招待</h3>
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    className="flex-1 border rounded p-2"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                  <select
                    className="border rounded p-2"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">メンバー</option>
                    <option value="admin">管理者</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    招待
                  </button>
                </form>
                <p className="text-xs text-gray-500 mt-1">※招待するユーザーは既にアプリに登録している必要があります。</p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4">メンバー一覧</h3>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.user_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-bold">{member.user.display_name || '名称未設定'}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded p-1 text-sm"
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                          disabled={member.role === 'owner'}
                        >
                          <option value="owner">オーナー</option>
                          <option value="admin">管理者</option>
                          <option value="member">メンバー</option>
                        </select>
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            削除
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'area' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">地図の表示エリア設定</h3>
                <p className="text-sm text-gray-600 mb-4">
                  プロジェクトで表示する地図の範囲を制限できます。設定すると、ユーザーはこの範囲外に移動できなくなります。
                </p>
                
                {mapConfig ? (
                  <div className="bg-gray-50 p-4 rounded mb-4">
                    <p className="font-bold text-sm mb-1">現在の設定:</p>
                    <p className="text-sm">中心: {mapConfig.center.lat.toFixed(4)}, {mapConfig.center.lng.toFixed(4)}</p>
                    <p className="text-sm">範囲: 南北 {mapConfig.range.ns}m / 東西 {mapConfig.range.ew}m</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded mb-4 text-yellow-800 text-sm">
                    エリア設定は未設定です。デフォルトの表示範囲が使用されます。
                  </div>
                )}

                <button
                  onClick={() => setIsAreaModalOpen(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 w-full md:w-auto"
                >
                  エリアを設定・変更する
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-bold mb-4">プロジェクト情報の編集</h3>
                <form onSubmit={handleUpdateProject}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">プロジェクト名</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={projectStartDate}
                        onChange={(e) => setProjectStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                      <input
                        type="date"
                        className="w-full border rounded p-2"
                        value={projectEndDate}
                        onChange={(e) => setProjectEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <textarea
                      className="w-full border rounded p-2"
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                  >
                    更新する
                  </button>
                </form>
              </div>

              <div className="pt-8 border-t border-red-200">
                <h3 className="text-lg font-bold text-red-600 mb-2">危険な操作</h3>
                <p className="text-sm text-gray-600 mb-4">プロジェクトを削除すると、関連する全てのスポット、報告、写真が削除されます。</p>
                <button
                  onClick={handleDeleteProject}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  プロジェクトを削除する
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Area Setting Modal */}
        {isAreaModalOpen && (
          <div className="absolute inset-0 bg-white z-50 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold">エリア設定</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAreaModalOpen(false)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSaveArea}
                  disabled={isLoading}
                  className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  保存
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <AreaSettingMap
                center={tempCenter}
                range={tempRange}
                onCenterChange={(c) => setTempCenter(c)}
              />
              
              {/* Controls Overlay */}
              <div className="absolute bottom-8 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-[1000] max-w-sm mx-auto">
                <h4 className="font-bold text-sm mb-2">表示範囲の設定 (メートル)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">南北の距離: {tempRange.ns}m</label>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={tempRange.ns}
                      onChange={(e) => setTempRange({ ...tempRange, ns: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">東西の距離: {tempRange.ew}m</label>
                    <input
                      type="range"
                      min="100"
                      max="10000"
                      step="100"
                      value={tempRange.ew}
                      onChange={(e) => setTempRange({ ...tempRange, ew: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    ※ 地図をドラッグまたはクリックして中心点を移動できます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
