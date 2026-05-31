'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { createMedicalRecord } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const REGIONS: { name: string; slug: string }[] = [
  { name: '北京', slug: 'beijing' }, { name: '上海', slug: 'shanghai' },
  { name: '天津', slug: 'tianjin' }, { name: '重庆', slug: 'chongqing' },
  { name: '广东', slug: 'guangdong' }, { name: '浙江', slug: 'zhejiang' },
  { name: '江苏', slug: 'jiangsu' }, { name: '四川', slug: 'sichuan' },
  { name: '湖北', slug: 'hubei' }, { name: '湖南', slug: 'hunan' },
  { name: '福建', slug: 'fujian' }, { name: '山东', slug: 'shandong' },
  { name: '河南', slug: 'henan' }, { name: '河北', slug: 'hebei' },
  { name: '陕西', slug: 'shaanxi' }, { name: '安徽', slug: 'anhui' },
  { name: '辽宁', slug: 'liaoning' }, { name: '吉林', slug: 'jilin' },
  { name: '黑龙江', slug: 'heilongjiang' }, { name: '江西', slug: 'jiangxi' },
  { name: '广西', slug: 'guangxi' }, { name: '云南', slug: 'yunnan' },
  { name: '贵州', slug: 'guizhou' }, { name: '山西', slug: 'shanxi' },
  { name: '甘肃', slug: 'gansu' }, { name: '内蒙古', slug: 'neimenggu' },
  { name: '新疆', slug: 'xinjiang' }, { name: '西藏', slug: 'xizang' },
  { name: '海南', slug: 'hainan' }, { name: '宁夏', slug: 'ningxia' },
  { name: '青海', slug: 'qinghai' }, { name: '香港', slug: 'hongkong' },
  { name: '澳门', slug: 'macau' }, { name: '台湾', slug: 'taiwan' },
];

const DEPARTMENTS = ['精神科', '心理科', '神经内科', '儿科', '其他'];
const RATINGS = [1, 2, 3, 4, 5];

export default function SubmitExperiencePage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const router = useRouter();
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [hospital, setHospital] = useState('');
  const [department, setDepartment] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medication, setMedication] = useState('');
  const [cost, setCost] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profile) { toast.error(t('auth.loginError')); router.push('/auth/login'); return; }
    if (!region || !title || !content) { toast.error(t('common.error')); return; }
    setLoading(true);
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
    const result = await createMedicalRecord({
      authorId: profile.id, region, city, hospitalName: hospital,
      department, diagnosis, medication, cost, rating,
      title, content, tags: tagList, isAnonymous,
    });
    setLoading(false);
    if (result) {
      toast.success(t('common.save'));
      router.push(`/experience/${result.id}`);
    } else {
      toast.error(t('common.error'));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()} className="text-[#3D7AD6] font-medium">{t('common.cancel')}</button>
        <h1 className="text-lg font-semibold text-gray-800">{t('experience.submit')}</h1>
        <Button onClick={handleSubmit} disabled={loading} className="rounded-full" style={{ backgroundColor: '#5B9CF5' }}>
          {loading ? t('common.loading') : t('post.publish')}
        </Button>
      </div>

      <div className="text-xs text-gray-400 mb-6 ml-1">
        💡 所有就诊信息仅用于经验参考，匿名身份会被保护
      </div>

      {/* Region */}
      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.region')} <span className="text-red-400">*</span></label>
      <select value={region} onChange={e => setRegion(e.target.value)}
        className="w-full bg-white  px-4 py-3 border border-gray-200 mb-2 text-gray-800">
        <option value="">{t('experience.all')}</option>
        {REGIONS.map(r => <option key={r.slug} value={r.slug}>{r.name}</option>)}
      </select>

      <label className="text-sm font-medium text-gray-600 mb-2 block mt-4">{t('experience.city')}</label>
      <Input placeholder={t('experience.city')} value={city} onChange={e => setCity(e.target.value)} className="mb-4" />

      {/* Hospital & Department */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.hospital')}</label>
          <Input placeholder={t('experience.hospital')} value={hospital} onChange={e => setHospital(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.department')}</label>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS.map(d => (
              <button key={d} onClick={() => setDepartment(d === department ? '' : d)}
                className={`rounded-full px-3 py-1.5 text-xs border ${department === d ? 'border-[#5B9CF5] bg-[#5B9CF5]/10 text-[#3D7AD6] font-semibold' : 'border-gray-200 text-gray-500'}`}
              >{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnosis & Med */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.diagnosis')}</label>
          <Input placeholder="ADHD-C" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.medication')}</label>
          <Input placeholder="e.g. Ritalin 18mg" value={medication} onChange={e => setMedication(e.target.value)} />
        </div>
      </div>

      {/* Cost & Rating */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.cost')}</label>
          <Input placeholder="0" type="number" value={cost} onChange={e => setCost(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 mb-2 block">{t('experience.rating')}</label>
          <div className="flex gap-1 mt-2">
            {RATINGS.map(r => (
              <button key={r} onClick={() => setRating(r === rating ? 0 : r)} className={`text-xl ${r <= rating ? '' : 'opacity-30'}`}>★</button>
            ))}
          </div>
        </div>
      </div>

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.title')} <span className="text-red-400">*</span></label>
      <Input placeholder={t('post.title')} value={title} onChange={e => setTitle(e.target.value)} maxLength={100} className="mb-4" />

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.content')} <span className="text-red-400">*</span></label>
      <Textarea placeholder={t('post.content')} value={content} onChange={e => setContent(e.target.value)} rows={8} className="mb-4" />

      <label className="text-sm font-medium text-gray-600 mb-2 block">{t('post.tags')}</label>
      <Input placeholder="ADHD, ASD..." value={tags} onChange={e => setTags(e.target.value)} className="mb-5" />

      <div className="flex items-center justify-between bg-white  px-4 py-3 border mb-10">
        <div><span className="font-medium text-gray-800">{t('post.anonymous')}</span><p className="text-xs text-gray-400">{t('post.anonymous')}</p></div>
        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
      </div>
    </div>
  );
}
