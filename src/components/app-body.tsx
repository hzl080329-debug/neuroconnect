'use client';
import { useTheme } from '@/lib/theme-context';

export function AppBody({ children }: { children: React.ReactNode }) {
  const { bg } = useTheme();
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }} className="transition-colors duration-300">
      {children}
    </div>
  );
}
