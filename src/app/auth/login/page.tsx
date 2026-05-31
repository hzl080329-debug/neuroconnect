'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError(t('auth.loginError')); return; }
    setLoading(true); setError('');
    const { error: err } = await signIn(email, password);
    if (err) setError(err);
    else router.push('/');
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">♦</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来</h1>
        <p className="text-gray-500">登录你的匿名账号</p>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200  p-4 mb-4 text-rose-600 text-sm text-center">{error}</div>}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">{t('auth.email')}</label>
        <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">{t('auth.password')}</label>
        <Input type="password" placeholder="输入密码" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <Button onClick={handleLogin} disabled={loading} className="w-full  py-6" style={{ backgroundColor: '#5B9CF5' }}>
        {loading ? t('common.loading') : t('auth.login')}
      </Button>
      <p className="text-center text-gray-500 mt-4">
        {t('auth.noAccount')}<Link href="/auth/register" className="text-[#3D7AD6] font-semibold ml-1">{t('auth.goRegister')}</Link>
      </p>
    </div>
  );
}
