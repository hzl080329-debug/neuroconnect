import { Sidebar } from '@/components/sidebar';
import { MobileHeader } from '@/components/mobile-header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <MobileHeader />
        {children}
      </main>
    </div>
  );
}
