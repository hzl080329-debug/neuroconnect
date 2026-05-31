'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateBoardPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [slug, setSlug] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2*1024*1024) { toast.error('Max 2MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `board-icons/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('posts').upload(path, file);
    if (error) { toast.error('Upload failed'); setUploading(false); return; }
    const { data } = supabase.storage.from('posts').getPublicUrl(path);
    setIconUrl(data.publicUrl);
    setUploading(false);
  };

  const handleCreate = async () => {
    if (!profile) { toast.error('请先登录'); return; }
    if (!name.trim() || !slug.trim()) { toast.error('请填写完整'); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { toast.error('英文ID只能包含小写字母、数字和横线'); return; }
    setLoading(true);
    const { error } = await supabase.from('boards').insert({
      slug: slug.trim(),
      name_zh: name.trim(),
      name_en: name.trim(),
      description_zh: desc.trim(),
      description_en: desc.trim(),
      icon: iconUrl || '▸',
      sort_order: 99,
    });
    if (error) {
      toast.error(error.message.includes('duplicate') ? '该ID已被使用' : error.message);
    } else {
      toast.success('板块创建成功！');
      router.push(`/b/${slug.trim()}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] text-sm mb-6 inline-block">← 返回</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">创建新板块</h1>

      <div className="bg-white  p-6 border shadow-sm">
        <label className="text-sm font-medium text-gray-600 mb-2 block">板块名称</label>
        <Input placeholder="例如：阿斯伯格、女性ADHD" value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }} maxLength={30} className="mb-4" />

        <label className="text-sm font-medium text-gray-600 mb-2 block">板块ID（英文）</label>
        <Input placeholder="例如：asperger" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} maxLength={30} className="mb-2" />
        <p className="text-xs text-gray-400 mb-4 ml-1">URL 中使用的标识，只能小写字母、数字和横线</p>

        <label className="text-sm font-medium text-gray-600 mb-2 block">板块简介</label>
        <Textarea placeholder="这个板块讨论什么？" value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="mb-4" />

        <label className="text-sm font-medium text-gray-600 mb-2 block">板块图标（可选）</label>
        <input type="file" ref={fileRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 p-3 mb-6 text-sm text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5]">
          {iconUrl ? '✓ 图标已上传' : uploading ? '上传中...' : '+ 上传图标'}
        </button>

        <Button onClick={handleCreate} disabled={loading} className="w-full" style={{ backgroundColor: '#5B9CF5' }}>
          {loading ? '创建中...' : '创建板块'}
        </Button>
      </div>
    </div>
  );
}
