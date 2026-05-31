'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';
import { getMedicalRecord } from '@/lib/data';

const REGION_NAMES: Record<string, string> = {
  beijing: '北京', shanghai: '上海', tianjin: '天津', chongqing: '重庆',
  guangdong: '广东', zhejiang: '浙江', jiangsu: '江苏', sichuan: '四川',
  hubei: '湖北', hunan: '湖南', fujian: '福建', shandong: '山东',
  henan: '河南', hebei: '河北', shaanxi: '陕西', anhui: '安徽',
  liaoning: '辽宁', jilin: '吉林', heilongjiang: '黑龙江', jiangxi: '江西',
  guangxi: '广西', yunnan: '云南', guizhou: '贵州', shanxi: '山西',
  gansu: '甘肃', neimenggu: '内蒙古', xinjiang: '新疆', xizang: '西藏',
  hainan: '海南', ningxia: '宁夏', qinghai: '青海',
  hongkong: '香港', macau: '澳门', taiwan: '台湾',
};

export default function ExperienceDetailPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const id = params.id as string;
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const locale = i18n.language === 'en' ? 'en-US' : 'zh-CN';

  useEffect(() => {
    getMedicalRecord(id).then((r) => {
      if (!r) {
        notFound();
        return;
      }
      setRecord(r);
      setLoading(false);
    });
  }, [id]);

  if (loading || !record) {
    return <div className="max-w-2xl mx-auto px-4 py-6 text-center text-gray-400">{t('common.loading')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/experience" className="text-[#3D7AD6] font-medium">← {t('experience.back')}</Link>
        <h1 className="text-lg font-semibold text-gray-800 flex-1 truncate">{record.title}</h1>
      </div>

      <div className="bg-white  p-5 border shadow-sm mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {record.region && (
            <span className="bg-blue-50 text-blue-600 rounded-full px-3 py-1 text-xs font-medium">
              📍 {REGION_NAMES[record.region] || record.region}
            </span>
          )}
          {record.city && (
            <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs">{record.city}</span>
          )}
          {record.rating > 0 && (
            <span className="bg-yellow-50 text-yellow-600 rounded-full px-3 py-1 text-xs font-medium">
              {'★'.repeat(record.rating)}
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">{record.title}</h2>

        {/* Info grid */}
        {(record.hospital_name || record.department || record.diagnosis || record.medication || record.cost) && (
          <div className="bg-gray-50  p-4 mb-4 grid grid-cols-2 gap-3 text-sm">
            {record.hospital_name && (
              <div><span className="text-gray-400">{t('experience.hospital')}</span><p className="text-gray-700 font-medium mt-0.5">{record.hospital_name}</p></div>
            )}
            {record.department && (
              <div><span className="text-gray-400">{t('experience.department')}</span><p className="text-gray-700 font-medium mt-0.5">{record.department}</p></div>
            )}
            {record.diagnosis && (
              <div><span className="text-gray-400">{t('experience.diagnosis')}</span><p className="text-gray-700 font-medium mt-0.5">{record.diagnosis}</p></div>
            )}
            {record.medication && (
              <div><span className="text-gray-400">{t('experience.medication')}</span><p className="text-gray-700 font-medium mt-0.5">{record.medication}</p></div>
            )}
            {record.cost && (
              <div><span className="text-gray-400">{t('experience.cost')}</span><p className="text-gray-700 font-medium mt-0.5">¥{record.cost}</p></div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>{record.is_anonymous ? '• 匿名' : '👤 ' + (record.author?.anonymous_name || '未知')}</span>
          <span>·</span>
          <span>{new Date(record.created_at).toLocaleDateString(locale)}</span>
        </div>

        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.content}</p>

        {record.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            {record.tags.map((tag: string, i: number) => (
              <span key={i} className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
