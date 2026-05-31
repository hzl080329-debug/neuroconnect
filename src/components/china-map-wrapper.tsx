'use client';
import dynamic from 'next/dynamic';

const ChinaMapDynamic = dynamic(
  () => import('./china-map').then(m => ({ default: m.ChinaMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[700px] mx-auto h-[400px] bg-gray-50  flex items-center justify-center text-gray-400 text-sm">
        加载地图中...
      </div>
    ),
  }
);

export function ChinaMapWrapper({ regionCounts }: { regionCounts: Record<string, number> }) {
  return <ChinaMapDynamic regionCounts={regionCounts} />;
}
