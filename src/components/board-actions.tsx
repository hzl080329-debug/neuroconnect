'use client';
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n-provider';
import { useAuth } from '@/lib/auth-context';
import { joinBoard, leaveBoard, isMember } from '@/lib/data';

export function BoardActions({ boardId }: { boardId: string }) {
  const { t } = useI18n();
  const { profile } = useAuth();
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) { isMember(boardId, profile.id).then(setJoined).finally(() => setLoading(false)); }
    else setLoading(false);
  }, [boardId, profile]);

  if (!profile || loading) return null;

  return (
    <button
      onClick={async () => {
        if (joined) { await leaveBoard(boardId, profile.id); setJoined(false); }
        else { await joinBoard(boardId, profile.id); setJoined(true); }
      }}
      className={`text-xs font-bold px-3 py-1 border transition-colors ${
        joined ? 'border-[#5B9CF5] text-[#5B9CF5] bg-[#5B9CF5]/5' : 'border-gray-300 text-gray-500 hover:border-[#5B9CF5]'
      }`}
    >
      {joined ? t('boards.joined') : t('boards.join')}
    </button>
  );
}
