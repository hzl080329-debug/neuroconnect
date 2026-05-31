import Link from 'next/link';
import { getMedicalRecords, getRegionCounts } from '@/lib/data';
import { ChinaMapWrapper } from '@/components/china-map-wrapper';

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

export default async function ExperiencePage({ searchParams }: {
  searchParams: Promise<{ region?: string }>
}) {
  const { region } = await searchParams;
  const [records, regionCounts] = await Promise.all([
    getMedicalRecords(region),
    getRegionCounts(),
  ]);
  const total = Object.values(regionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Link href="/" className="text-[#3D7AD6] font-medium">←</Link>
        <h1 className="text-2xl font-bold text-gray-800">就诊地图</h1>
        {region && region !== 'all' && (
          <span className="bg-[#5B9CF5]/10 text-[#3D7AD6] rounded-full px-3 py-1 text-sm font-medium">
            📍 {REGION_NAMES[region] || region}
          </span>
        )}
      </div>

      {/* Interactive Map */}
      <ChinaMapWrapper regionCounts={regionCounts} />

      {/* Results list */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {region && region !== 'all'
              ? `${REGION_NAMES[region] || region} 的就诊经历`
              : '最新就诊经历'}
          </h2>
          <span className="text-sm text-gray-400">共 {records.length} 篇</span>
        </div>

        {records.length > 0 ? (
          <>
            {records.map((r: any) => (
              <Link key={r.id} href={`/experience/${r.id}`}
                className="block bg-white  p-4 mb-3 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {r.region && (
                    <span className="bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 text-xs font-medium">
                      📍 {REGION_NAMES[r.region] || r.region}
                    </span>
                  )}
                  {r.hospital_name && (
                    <span className="bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">{r.hospital_name}</span>
                  )}
                  {r.rating > 0 && <span className="text-xs ml-auto">{'★'.repeat(r.rating)}</span>}
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{r.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{r.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{r.is_anonymous ? '• 匿名' : '👤 ' + (r.author?.anonymous_name || '')}</span>
                  <span>·</span>
                  <span>{new Date(r.created_at).toLocaleDateString('zh-CN')}</span>
                  {r.diagnosis && <><span>·</span><span>{r.diagnosis}</span></>}
                </div>
              </Link>
            ))}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">▸</div>
            <p className="text-gray-500 mb-2">
              {region && region !== 'all' ? `${REGION_NAMES[region] || region} 还没有就诊经历` : '还没有就诊经历'}
            </p>
            <p className="text-gray-400 text-sm mb-6">成为第一个分享的人吧</p>
            <Link href="/experience/submit" className="inline-block bg-[#5B9CF5] text-white rounded-full px-6 py-3 font-semibold">
              分享我的就诊经历
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
