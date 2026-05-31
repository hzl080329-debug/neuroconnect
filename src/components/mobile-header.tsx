'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileHeader() {
  const pathname = usePathname();
  if (pathname === '/') return null;

  return (
    <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
      <Link href="/" className="text-[#3D7AD6] font-medium flex items-center gap-1">
        ← 返回
      </Link>
    </div>
  );
}
