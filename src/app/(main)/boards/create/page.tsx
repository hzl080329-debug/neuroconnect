'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateBoardPage() {
  const { t } = useTranslation();
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
    if (!profile) { toast.error(t('auth.loginError')); return; }
    if (!name.trim() || !slug.trim()) { toast.error(t('common.error')); return; }
    if (!/^[a-z0-9-]+$/.test(slug)) { toast.error('Only lowercase letters, numbers, and hyphens'); return; }
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
      toast.error(error.message.includes('duplicate') ? 'ID already taken' : error.message);
    } else {
      toast.success(t('common.save'));
      router.push(`/b/${slug.trim()}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/" className="text-[#3D7AD6] text-sm mb-6 inline-block">← {t('common.back')}</Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{t('boards.create')}</h1>

      <div className="bg-white  p-6 border shadow-sm">
        <label className="text-sm font-medium text-gray-600 mb-2 block">{t('boards.create')}</label>
        <Input placeholder={t('boards.create')} value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')); }} maxLength={30} className="mb-4" />

        <label className="text-sm font-medium text-gray-600 mb-2 block">{t('common.save')}</label>
        <Input placeholder="asperger" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} maxLength={30} className="mb-2" />
        <p className="text-xs text-gray-400 mb-4 ml-1">URL slug: lowercase letters, numbers and hyphens only</p>

        <label className="text-sm font-medium text-gray-600 mb-2 block">{t('common.noData')}</label>
        <Textarea placeholder={t('common.noData')} value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="mb-4" />

        <label className="text-sm font-medium text-gray-600 mb-2 block">Icon</label>
        <input type="file" ref={fileRef} onChange={handleIconUpload} accept="image/*" className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 p-3 mb-6 text-sm text-gray-400 hover:border-[#5B9CF5] hover:text-[#5B9CF5]">
          {iconUrl ? '✓ Uploaded' : uploading ? t('common.loading') : '+ Upload Icon'}
        </button>

        <Button onClick={handleCreate} disabled={loading} className="w-full" style={{ backgroundColor: '#5B9CF5' }}>
          {loading ? t('common.loading') : t('boards.create')}
        </Button>
      </div>
    </div>
  );
}
