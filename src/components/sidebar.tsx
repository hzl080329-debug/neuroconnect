'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

const icons: Record<string, string> = {
  home: '⌂', profile: '○', notifs: '◉', messages: '⟶', map: '◷',
  boards: '▸', qa: '?', resources: '—', premium: '♦', admin: '⚑', settings: '⚙',
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation();

  const links = [
    { href: '/', label: t('nav.home'), key: 'home' },
    { href: '/profile', label: t('nav.profile'), key: 'profile' },
    { href: '/notifications', label: t('nav.notifications'), key: 'notifs' },
    { href: '/messages', label: t('nav.messages'), key: 'messages' },
    { href: '/experience', label: t('nav.experience'), key: 'map' },
    { href: '/boards', label: t('nav.boards'), key: 'boards' },
    { href: '/qa', label: t('nav.qa'), key: 'qa' },
    { href: '/resources', label: t('nav.resources'), key: 'resources' },
    { href: '/premium', label: t('nav.premium'), key: 'premium' },
    { href: '/settings', label: t('nav.settings'), key: 'settings' },
  ];

  return (
    <aside className="w-48 shrink-0 hidden md:flex flex-col bg-[#111] border-r border-[#222] min-h-screen sticky top-0">
      {/* Logo */}
      <Link href="/" className="px-4 py-6 border-b border-[#222]">
        <h1 className="text-base font-bold tracking-wider text-white">NEURO</h1>
        <h1 className="text-base font-bold tracking-wider text-[#5B9CF5] -mt-1">CONNECT</h1>
        <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">Moebius</p>
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {[...links, ...(profile?.is_admin ? [{ href: '/admin', label: t('nav.admin'), key: 'admin' as const }] : [])].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider transition-colors ${
              pathname === link.href
                ? 'text-[#5B9CF5] bg-[#5B9CF5]/10 border-l-2 border-[#5B9CF5]'
                : 'text-gray-500 hover:text-gray-300 hover:bg-[#1a1a1a] border-l-2 border-transparent'
            }`}
          >
            <span className="text-[10px] w-4 opacity-50">{icons[link.key]}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-[#222]">
        {user ? (
          <button onClick={() => signOut()}
            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-gray-600 hover:text-gray-300 hover:bg-[#1a1a1a] w-full transition-colors">
            <span className="text-[10px] opacity-50">←</span> {t('nav.signOut')}
          </button>
        ) : (
          <Link href="/auth/login"
            className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-wider text-[#5B9CF5] hover:bg-[#5B9CF5]/10 transition-colors">
            <span className="text-[10px] opacity-50">⟶</span> {t('nav.signIn')}
          </Link>
        )}
      </div>
    </aside>
  );
}
