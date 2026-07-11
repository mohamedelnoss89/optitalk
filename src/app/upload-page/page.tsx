// ===== OptiTalk - Upload Videos Page =====
'use client';

import { useState } from 'react';

const FRIENDS = [
  { id: 'friend-alex', name: 'أليكس' },
  { id: 'friend-layla', name: 'ليلى' },
  { id: 'friend-omar', name: 'عمر' },
  { id: 'friend-sara', name: 'سارة' },
  { id: 'friend-karim', name: 'كريم' },
  { id: 'friend-nora', name: 'نورا' },
  { id: 'friend-sami', name: 'سامي' },
  { id: 'friend-maya', name: 'مايا' },
  { id: 'friend-tarek', name: 'طارق' },
  { id: 'friend-yara', name: 'محمد' },
  { id: 'friend-hassan', name: 'يارا' },
  { id: 'friend-dina', name: 'أشرف' },
  { id: 'friend-amir', name: 'أمير' },
  { id: 'friend-hana', name: 'هنا' },
  { id: 'friend-ziad', name: 'زياد' },
  { id: 'friend-farida', name: 'فريدة' },
  { id: 'friend-khaled', name: 'خالد' },
  { id: 'friend-mariam', name: 'مريم' },
];

export default function UploadPage() {
  const [uploading, setUploading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});

  const handleUpload = async (friendId: string, file: File) => {
    setUploading(friendId);
    setResults(prev => ({ ...prev, [friendId]: 'pending' }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('friendId', friendId);

      const res = await fetch('/api/upload-friend-video', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setResults(prev => ({ ...prev, [friendId]: 'success' }));
      } else {
        setResults(prev => ({ ...prev, [friendId]: 'error' }));
      }
    } catch {
      setResults(prev => ({ ...prev, [friendId]: 'error' }));
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (friendId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(friendId, file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-2xl font-bold text-white">رفع فيديوهات الأصدقاء</h1>
        <p className="mb-6 text-sm text-white/60">اختار الفيديو لكل صديق واضغط عليه</p>

        <div className="grid grid-cols-2 gap-3">
          {FRIENDS.map((friend) => (
            <div
              key={friend.id}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-white">{friend.name}</span>
                {results[friend.id] === 'success' && <span className="text-green-400">✓</span>}
                {results[friend.id] === 'error' && <span className="text-red-400">✗</span>}
                {results[friend.id] === 'pending' && <span className="text-yellow-400">⏳</span>}
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="video/mp4"
                  onChange={(e) => handleFileSelect(friend.id, e)}
                  disabled={uploading !== null}
                  className="hidden"
                />
                <span
                  className={`block cursor-pointer rounded-lg px-3 py-2 text-center text-xs font-bold transition-all ${
                    uploading === friend.id
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : results[friend.id] === 'success'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                  }`}
                >
                  {uploading === friend.id
                    ? 'بيرفع...'
                    : results[friend.id] === 'success'
                    ? 'اترفع ✓'
                    : 'اختار فيديو'}
                </span>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
