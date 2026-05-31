'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AVATARS = [
  '•','🐱','🐻','🐰','🐼','🦉','🐨','🐸','🦋','🐙','🦄','🐶',
  '🐯','🦁','🐮','🐷','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦇',
  '🐺','🐗','🐴','🦎','🐠','🐳','🐙','🦀','🐞','🦂','🐛','🦟',
  '🌸','🌺','🌻','🌹','🍀','🌵','🍄','★','🌈','☀️','🌙','🔥',
  '💜','💚','🧡','🩷','🩵','🤍','🫶','✨','🎈','🎀','♦','🪷',
];

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) { setError('请填写邮箱和密码'); return; }
    if (password.length < 6) { setError('密码至少6个字符'); return; }
    if (!name.trim()) { setError('请设置匿名昵称'); return; }
    setLoading(true); setError('');
    const { error: err } = await signUp(email, password);
    if (err) setError(err);
    else { router.push('/'); }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">♦</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">创建匿名账号</h1>
        <p className="text-gray-500 text-sm">设置你的匿名身份</p>
      </div>
      {error && <div className="bg-rose-50 border border-rose-200  p-4 mb-4 text-rose-600 text-sm text-center">{error}</div>}

      <label className="text-sm font-medium text-gray-700 mb-2 block">选择头像</label>
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {AVATARS.map(a => (
          <button key={a} onClick={() => setAvatar(a)}
            className={`w-10 h-10 rounded-full text-lg flex items-center justify-center ${avatar === a ? 'bg-[#5B9CF5]/20 border-2 border-[#5B9CF5] scale-110' : 'bg-white border border-gray-200 hover:border-gray-300'}`}
          >{a}</button>
        ))}
      </div>

      <label className="text-sm font-medium text-gray-700 mb-2 block">匿名昵称</label>
      <Input placeholder="起一个喜欢的昵称" value={name} onChange={e => setName(e.target.value)} maxLength={20} className="mb-2" />
      <p className="text-xs text-gray-400 mb-4 ml-1">社区中展示的名称（2-20字符）</p>

      <label className="text-sm font-medium text-gray-700 mb-2 block">邮箱</label>
      <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} className="mb-2" />
      <p className="text-xs text-gray-400 mb-4 ml-1">仅用于登录，不公开</p>

      <label className="text-sm font-medium text-gray-700 mb-2 block">密码</label>
      <Input type="password" placeholder="至少6个字符" value={password} onChange={e => setPassword(e.target.value)} className="mb-8" />

      <Button onClick={handleRegister} disabled={loading} className="w-full  py-6 mb-4" style={{ backgroundColor: '#5B9CF5' }}>
        {loading ? '注册中...' : '注册'}
      </Button>
      <p className="text-center text-gray-500">
        已有账号？<Link href="/auth/login" className="text-[#3D7AD6] font-semibold ml-1">登录</Link>
      </p>
    </div>
  );
}
