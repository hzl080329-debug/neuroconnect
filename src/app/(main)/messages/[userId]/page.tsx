'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { getMessages, sendMessage as sendMsg } from '@/lib/data';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const { profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile) { router.push('/auth/login'); return; }
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [userId, profile]);

  const loadMessages = async () => {
    if (!profile) return;
    const msgs = await getMessages(profile.id, userId);
    setMessages(msgs);
    setLoading(false);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSend = async () => {
    if (!profile || !text.trim()) return;
    await sendMsg(profile.id, userId, text.trim());
    setText('');
    loadMessages();
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b bg-white">
        <button onClick={() => router.back()} className="text-[#3D7AD6] font-medium">{'← '}{t('messages.back')}</button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">•</div>
          <span className="font-semibold text-gray-800">私信对话</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#FFFAF5]">
        {loading ? (
          <p className="text-center text-gray-400 py-10">{t('common.loading')}</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-400 py-10">{t('messages.noMessages')}</p>
        ) : (
          messages.map((m: any) => {
            const isMine = m.sender_id === profile.id;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%]  px-4 py-3 ${
                  isMine ? 'bg-[#5B9CF5] text-white rounded-br-md' : 'bg-white border text-gray-800 rounded-bl-md'
                }`}>
                  <p className="text-sm">{m.content}</p>
                  <p className={`text-xs mt-1 ${isMine ? 'text-white/70' : 'text-gray-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString(i18n.language === 'en' ? 'en-US' : 'zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    {m.read_at && isMine ? ` ✓${t('messages.read')}` : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 px-4 py-3 border-t bg-white">
        <Input
          placeholder="输入消息..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 rounded-full"
        />
        <Button onClick={handleSend} className="rounded-full" style={{ backgroundColor: '#5B9CF5' }}>
          {t('messages.send')}
        </Button>
      </div>
    </div>
  );
}
