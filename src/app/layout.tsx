import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { AppBody } from '@/components/app-body';
import { AmbientBg } from '@/components/ambient-bg';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'NeuroConnect - 神经多样性互助社区',
  description: '面向ADHD、自闭谱系、焦虑抑郁等神经多样性人群的匿名互助社区',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body className="min-h-screen antialiased bg-[#FAFAFA]">
        <AuthProvider>
          <ThemeProvider>
            <AppBody>
              <AmbientBg />
              {children}
            </AppBody>
            <Toaster position="top-center" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
