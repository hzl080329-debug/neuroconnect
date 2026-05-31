'use client';
import { useState } from 'react';
import Link from 'next/link';
import { PROVINCES } from './china-provinces';

export function ChinaMap({ regionCounts }: { regionCounts: Record<string, number> }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);
  const total = Object.values(regionCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full max-w-[700px] mx-auto bg-white border shadow-sm p-3">
      {/* Top bar */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <Link href="/experience?region=all"
          className="inline-flex items-center gap-1.5 bg-[#5B9CF5] text-white rounded-full px-5 py-2 font-medium text-sm hover:opacity-90 shadow-sm">
          🗺️ 全国 ({total})
        </Link>
        <Link href="/experience/submit"
          className="inline-flex items-center gap-1.5 bg-white rounded-full px-5 py-2 border-2 border-[#5B9CF5] text-[#3D7AD6] font-medium text-sm hover:bg-[#5B9CF5]/5">
          ✏️ 分享经历
        </Link>
      </div>

      <svg viewBox="0 0 1000 800" className="w-full h-auto">
        {/* Background */}
        <rect width="1000" height="800" fill="#FFFFFF" rx="12" />

        {/* Province paths */}
        {PROVINCES.map((prov) => {
          const count = regionCounts[prov.slug] || 0;
          const isHovered = hovered === prov.slug;
          const fillColor = isHovered
            ? '#5B9CF5'
            : count > 0
              ? '#99F6E4'
              : '#F8FAFC';
          const strokeColor = isHovered
            ? '#3D7AD6'
            : count > 0
              ? '#5EEAD4'
              : '#D1D5DB';
          return (
            <path
              key={prov.slug}
              d={prov.path}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={isHovered ? 2 : 0.8}
              strokeLinejoin="round"
              className="cursor-pointer transition-all duration-150"
              style={{ filter: isHovered ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.2))' : undefined }}
              onMouseEnter={(e) => {
                setHovered(prov.slug);
                setTooltip({ x: e.clientX, y: e.clientY, name: prov.name, count });
              }}
              onMouseMove={(e) => {
                setTooltip(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
              }}
              onMouseLeave={() => {
                setHovered(null);
                setTooltip(null);
              }}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.href = `/experience?region=${prov.slug}`;
                }
              }}
            />
          );
        })}

        {/* South China Sea inset */}
        <g transform="translate(820, 620)">
          <rect width="160" height="160" fill="#E0F2FE" rx="8" stroke="#BAE6FD" />
          <text x="80" y="18" textAnchor="middle" fill="#64748B" fontSize="9" fontWeight="600">南海诸岛</text>
          {/* Simplified islands shape */}
          <path d="M70,30 L90,25 L105,30 L115,40 L110,52 L95,58 L80,56 L68,48 L65,38 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="0.5" />
          <circle cx="82" cy="38" r="1.5" fill="#64748B" />
          <circle cx="95" cy="35" r="1.5" fill="#64748B" />
          <circle cx="88" cy="48" r="1.5" fill="#64748B" />
          <circle cx="100" cy="45" r="1.5" fill="#64748B" />
          <circle cx="78" cy="52" r="1.2" fill="#64748B" />
          <text x="80" y="75" textAnchor="middle" fill="#94A3B8" fontSize="7">东沙群岛</text>
          <text x="80" y="88" textAnchor="middle" fill="#94A3B8" fontSize="7">西沙群岛</text>
          <text x="80" y="101" textAnchor="middle" fill="#94A3B8" fontSize="7">中沙群岛</text>
          <text x="80" y="114" textAnchor="middle" fill="#94A3B8" fontSize="7">南沙群岛</text>
          <line x1="50" y1="130" x2="110" y2="130" stroke="#CBD5E1" strokeWidth="0.5" />
          <line x1="50" y1="135" x2="110" y2="135" stroke="#CBD5E1" strokeWidth="0.5" />
          <line x1="50" y1="140" x2="110" y2="140" stroke="#CBD5E1" strokeWidth="0.5" />
          <line x1="50" y1="145" x2="110" y2="145" stroke="#CBD5E1" strokeWidth="0.5" />
          <line x1="50" y1="150" x2="110" y2="150" stroke="#CBD5E1" strokeWidth="0.5" />
        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-[#111] text-white text-xs font-bold px-3 py-1.5 rounded shadow-lg"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 32,
          }}
        >
          {tooltip.name}
          {tooltip.count > 0 && (
            <span className="ml-1 text-[#5EEAD4]">{tooltip.count}</span>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#99F6E4] border border-[#5EEAD4]" /> 有就诊经历
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#F8FAFC] border border-[#D1D5DB]" /> 暂无
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-[#5B9CF5] border border-[#3D7AD6]" /> 已选中
        </span>
      </div>
    </div>
  );
}
