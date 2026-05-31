'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getBoards, createPost } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useRef } from 'react';
import { useI18n } from '@/lib/i18n-provider';

const COLORS = ['#5B9CF5', '#7AB8F5', '#4ADE80', '#F59E0B', '#EC4899', '#5B9CF5', '#F97316'];

export default function SubmitPage() {
  const { t, lang, changeLang } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);
  const { profile } = useAuth();
  const router = useRouter();
  const [boards, setBoards] = useState<any[]>([]);
  const [boardId, setBoardId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `public/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('posts').upload(path, file);
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('posts').getPublicUrl(path);
    setImageUrl(urlData.publicUrl);
    setUploading(false);
  };

  useEffect(() => { getBoards().then(setBoards); }, []);

  const handleSubmit = async () => {
    if (!profile) { toast.error('请先登录'); router.push('/auth/login'); return; }
    if (!boardId || !title || !content) { toast.error('请填写完整'); return; }
    setLoading(true);
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const result = await createPost({ authorId: profile.id, boardId, title, content, isAnonymous, tags: tagList, imageUrl });
    setLoading(false);
    if (result) {
      toast.success('发布成功！');
      router.push(`/post/${result.id}`);
    } else {
      toast.error('发布失败，请重试');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-[#3D7AD6] font-medium">{t('common.cancel')}</button>
        <h1 className="text-lg font-semibold text-gray-800">{t('post.submit')}</h1>
        <Button onClick={handleSubmit} disabled={!boardId || !title || !content || loading}
          className="rounded-full" style={{ backgroundColor: '#5B9CF5' }}>
          {loading ? t('common.loading') : t('post.publish')}
        </Button>
      </div>

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.board')}</label>
      <div className="flex flex-wrap gap-2 mb-5">
        {boards.map((b: any, i: number) => (
          <button key={b.id} onClick={() => setBoardId(b.id)}
            className="rounded-full px-4 py-2 border text-sm font-medium"
            style={{
              borderColor: COLORS[i % COLORS.length],
              color: boardId === b.id ? COLORS[i % COLORS.length] : '#6B7280',
              backgroundColor: boardId === b.id ? COLORS[i % COLORS.length] + '20' : 'transparent',
            }}
          >{b.icon} {b.name_zh}</button>
        ))}
      </div>

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.title')}</label>
      <Input placeholder="起一个标题..." value={title} onChange={e => setTitle(e.target.value)} maxLength={100} className="mb-4" />

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.content')}</label>
      <Textarea placeholder="分享你想说的..." value={content} onChange={e => setContent(e.target.value)} rows={8} className="mb-4" />

      <label className="text-sm font-medium text-gray-600 mb-2 block">图片（可选）</label>
      <input type="file" ref={fileRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      {imageUrl ? (
        <div className="mb-4 relative">
          <img src={imageUrl} alt="preview" className="w-full max-h-48 object-cover border border-gray-200" />
          <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1">移除</button>
        </div>
      ) : (
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 p-4 mb-4 text-sm text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5] transition-colors">
          {uploading ? '上传中...' : '+ 添加图片'}
        </button>
      )}

      <label className="text-sm font-medium text-gray-600 mb-2 block">标签（逗号分隔）</label>
      <Input placeholder="例如：ADHD, 就诊经历" value={tags} onChange={e => setTags(e.target.value)} className="mb-5" />

      <div className="flex items-center justify-between bg-white  px-4 py-3 border">
        <div><span className="font-medium text-gray-800">{t('post.anonymous')}</span><p className="text-sm text-gray-400">开启后以匿名身份发布</p></div>
        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>
    </div>
  );
}
