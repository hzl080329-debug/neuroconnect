'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-provider';
import { useAuth } from '@/lib/auth-context';
import { getUserPosts, updateProfile } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const AVATARS = ['◈','•','○','▴','▾','★','♦','□','●','◦','◉','⊕'];

export default function ProfilePage() {
  const { t, lang, changeLang } = useI18n();
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [votedPosts, setVotedPosts] = useState<any[]>([]);
  const [tab, setTab] = useState<'posts' | 'saved' | 'voted'>('posts');
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      getUserPosts(profile.id).then(setPosts);
      supabase.from('post_saves').select('post:posts(*, author:profiles!posts_author_id_fkey(anonymous_name), board:boards(name_zh))').eq('user_id', profile.id).order('created_at', { ascending: false }).then(({ data }) => setSavedPosts((data || []).map((s: any) => s.post).filter(Boolean)));
      supabase.from('post_votes').select('post:posts(*, author:profiles!posts_author_id_fkey(anonymous_name), board:boards(name_zh))').eq('user_id', profile.id).eq('value', 1).order('created_at', { ascending: false }).then(({ data }) => setVotedPosts((data || []).map((v: any) => v.post).filter(Boolean)));
      setEditName(profile.anonymous_name || '');
      setEditAvatar(profile.avatar_url || AVATARS[0]);
      setEditBio(profile.bio || '');
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('图片不能超过2MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const { error } = await supabase.storage.from('avatars').upload(`avatars/${profile.user_id}.${ext}`, file, { upsert: true });
    if (error) { toast.error('上传失败'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(`avatars/${profile.user_id}.${ext}`);
    setEditAvatar(urlData.publicUrl);
    setUploading(false);
    toast.success('头像已更新');
  };

  const handleSave = async () => {
    if (!profile || !editName.trim()) return;
    setSaving(true);
    try {
      await updateProfile(profile.user_id, { anonymous_name: editName.trim(), avatar_url: editAvatar, bio: editBio.trim() });
      await refreshProfile();
      toast.success('已保存');
      setEditing(false);
    } catch { toast.error('保存失败'); }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400 text-sm">{t('common.loading')}</div>;

  if (!user || !profile) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-[#111] mb-2">NEUROCONNECT</h1>
        <p className="text-sm text-gray-500 mb-8">注册匿名账号，开始分享</p>
        <Link href="/auth/register" className="block w-full py-3 bg-[#5B9CF5] text-white text-sm font-bold mb-3">注册</Link>
        <Link href="/auth/login" className="block w-full py-3 border-2 border-[#5B9CF5] text-[#5B9CF5] text-sm font-bold">登录</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 font-bold mb-6 inline-block">{'← '}{t('common.back')}</Link>

      {editing ? (
        <div className="border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-bold text-[#111] mb-6">{t('profile.edit')}</h2>

          {profile.is_premium && (
            <div className="mb-4">
              <input type="file" ref={fileRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full text-xs border-gray-300">
                {uploading ? '上传中...' : '从相册选择照片 (Premium)'}
              </Button>
            </div>
          )}

          <label className="text-xs font-bold text-gray-400 mb-2 block">头像</label>
          <div className="flex flex-wrap gap-2 mb-6">
            {AVATARS.map(a => (
              <button key={a} onClick={() => setEditAvatar(a)}
                className={`w-10 h-10 text-base border-2 font-bold ${editAvatar === a ? 'border-[#5B9CF5] text-[#5B9CF5]' : 'border-gray-200 text-gray-400'}`}
              >{a}</button>
            ))}
          </div>

          <label className="text-xs font-bold text-gray-400 mb-2 block">{t('profile.nickname')}</label>
          <Input value={editName} onChange={e => setEditName(e.target.value)} maxLength={20} className="mb-4 border-gray-300" />

          <label className="text-xs font-bold text-gray-400 mb-2 block">{t('profile.bio')}</label>
          <Textarea value={editBio} onChange={e => setEditBio(e.target.value)} maxLength={200} rows={3} className="mb-6 border-gray-300" />

          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#5B9CF5] text-white text-xs font-bold">
              {saving ? '保存中...' : t('profile.save')}
            </Button>
            <Button onClick={() => setEditing(false)} variant="outline" className="flex-1 border-gray-300 text-xs font-bold">{t('common.cancel')}</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 border-2 border-[#5B9CF5] flex items-center justify-center text-2xl mx-auto mb-4 font-bold text-[#5B9CF5]">
              {profile.avatar_url || '•'}
            </div>
            <h1 className="text-xl font-black text-[#111] flex items-center justify-center gap-2">
              {profile.anonymous_name}
              {profile.is_premium && <span className="text-[#5B9CF5] text-xs">♦</span>}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{profile.karma || 0} {t('profile.karma')}</p>
            {profile.bio && <p className="text-xs text-gray-500 mt-3">{profile.bio}</p>}
            <p className="text-xs text-gray-400 mt-3">{t('profile.joined')} {new Date(profile.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</p>
            <Button onClick={() => setEditing(true)} variant="outline" className="mt-4 border-gray-300 text-xs font-bold">
              {t('profile.edit')}
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { key: 'posts' as const, label: t('profile.posts'), count: posts.length },
              { key: 'saved' as const, label: t('profile.saved'), count: savedPosts.length },
              { key: 'voted' as const, label: t('profile.liked'), count: votedPosts.length },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`border p-3 text-center transition-colors ${tab === t.key ? 'border-[#5B9CF5] bg-[#5B9CF5]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                <div className={`text-xl font-black ${tab === t.key ? 'text-[#5B9CF5]' : 'text-[#111]'}`}>{t.count}</div>
                <div className={`text-xs mt-1 ${tab === t.key ? 'text-[#5B9CF5] font-bold' : 'text-gray-400'}`}>{t.label}</div>
              </button>
            ))}
            <Link href="/messages" className="border border-gray-200 p-3 text-center block hover:border-gray-300">
              <div className="text-xl font-black text-[#111]">⟶</div><div className="text-xs text-gray-400 mt-1">{t('messages.title')}</div>
            </Link>
          </div>

          {tab === 'posts' && (posts.length > 0 ? posts.map((p: any) => <PostLink key={p.id} p={p} />) : <p className="text-xs text-gray-300 py-6 text-center">{t('common.noData')}</p>)}
          {tab === 'saved' && (savedPosts.length > 0 ? savedPosts.map((p: any) => <PostLink key={p.id} p={p} />) : <p className="text-xs text-gray-300 py-6 text-center">{t('common.noData')}</p>)}
          {tab === 'voted' && (votedPosts.length > 0 ? votedPosts.map((p: any) => <PostLink key={p.id} p={p} />) : <p className="text-xs text-gray-300 py-6 text-center">{t('common.noData')}</p>)}

          <div className="mt-6 space-y-2">
            <Link href="/rules" className="block border border-gray-200 p-3 text-xs font-bold text-gray-600 hover:border-gray-400">社区规则</Link>
            <button onClick={() => signOut()} className="block w-full text-left border border-gray-200 p-3 text-xs font-bold text-gray-400 hover:text-red-500 hover:border-red-300">{t('profile.logout')}</button>
          </div>
        </>
      )}
    </div>
  );
}

function PostLink({ p }: { p: any }) {
  return (
    <Link href={`/post/${p.id}`} className="block border border-gray-200 p-4 mb-2 hover:border-gray-400 transition-colors">
      <div className="flex items-center gap-3 mb-2 text-xs"><span className="font-bold text-[#5B9CF5]">{p.board?.name_zh}</span><span className="text-gray-300">|</span><span className="text-gray-400">{p.title}</span></div>
      <p className="text-xs text-gray-500 line-clamp-1">{p.content}</p>
      <div className="flex gap-4 mt-2 text-xs text-gray-300"><span>▲ {p.vote_count || 0}</span><span>● {p.comment_count || 0}</span></div>
    </Link>
  );
}
