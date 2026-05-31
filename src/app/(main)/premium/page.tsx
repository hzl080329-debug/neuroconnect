'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n-provider';
import { toast } from 'sonner';

const AFDIAN_URL = 'https://ifdian.net/a/moebiushewanzuoyou';

export default function PremiumPage() {
  const { profile, user, refreshProfile } = useAuth();
  const { t, lang, changeLang } = useI18n();
  const email = user?.email;
  const [verifying, setVerifying] = useState(false);
  const [activating, setActivating] = useState(false);

  const handleVerify = async () => {
    if (!profile) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/check-afdian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user?.email }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`找到赞助：¥${data.order.total_amount}`);
      setActivating(true);
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('profiles').update({
        is_premium: true,
        premium_until: expiry,
        premium_order_id: data.order.out_trade_no,
      }).eq('user_id', profile.user_id);
      await supabase.from('premium_requests').insert({
        username: profile.anonymous_name,
        contact: `爱发电订单: ${data.order.out_trade_no}`,
        status: 'approved',
      });
      await refreshProfile();
      toast.success('🎉 Premium 已自动激活！');
    } catch {
      toast.error('验证失败，请重试');
    } finally {
      setVerifying(false);
      setActivating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← {t('premium.back')}</Link>

      {profile?.is_premium && (
        <div className="border border-[#5B9CF5] bg-[#5B9CF5]/5 p-4 mb-8 text-center">
          <p className="text-[#5B9CF5] font-bold text-sm">♦ {t('premium.active')}</p>
          {profile.premium_until && (
            <p className="text-xs text-gray-400 mt-1">
              {t('premium.expires')} {new Date(profile.premium_until).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}
            </p>
          )}
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#111] mb-2">{t('premium.title')}</h1>
        <p className="text-sm text-gray-500">{t('premium.subtitle')}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 p-6">
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#111]">{t('premium.free')}</h3>
            <p className="text-3xl font-black text-gray-300 mt-2">¥0</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>{t('premium.free1')}</li><li>{t('premium.free2')}</li><li>{t('premium.free3')}</li><li>{t('premium.free4')}</li><li>{t('premium.free5')}</li>
          </ul>
        </div>
        <div className="border-2 border-[#5B9CF5] p-6 relative">
          <div className="absolute -top-3 right-4 bg-[#5B9CF5] text-white text-xs px-3 py-0.5 font-bold">{t('premium.recommend')}</div>
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#5B9CF5]">Premium</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              <p className="text-3xl font-black text-[#5B9CF5]">¥9.9</p><p className="text-xs text-gray-400">{t('premium.monthly')}</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">¥68{t('premium.yearly')}</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="font-bold text-[#5B9CF5]">{t('premium.benefits1')}</li>
            <li>{t('premium.benefits2')}</li><li>{t('premium.benefits3')}</li><li>{t('premium.benefits4')}</li><li>{t('premium.benefits5')}</li>
          </ul>
        </div>
      </div>

      {/* 爱发电支付 */}
      <div className="border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-black text-[#111] mb-4">♦ {t('premium.howto')}</h2>

        <div className="bg-blue-50 border border-blue-100 p-4 mb-4 text-xs text-gray-600 leading-relaxed">
          <p className="font-bold mb-1">⚠️ {t('premium.notice')}</p>
          <p>{t('premium.noticeText')}</p>
          <p className="text-[#5B9CF5] font-bold text-base mt-1">
            {email || '（请先登录）'}
          </p>
          <p className="mt-1 text-gray-400">{t('premium.noticeHint')}</p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <a
            href={AFDIAN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF6B9D] text-white px-10 py-3 font-bold text-sm rounded-full hover:opacity-90 transition"
          >
            ♥ {t('premium.sponsor')}
          </a>
          <button
            onClick={handleVerify}
            disabled={verifying || activating || !profile}
            className="w-full max-w-sm py-3 bg-[#5B9CF5] text-white text-sm font-bold hover:bg-[#4A8AE8] disabled:opacity-50"
          >
            {activating ? t('premium.activating') : verifying ? t('premium.verifying') : t('premium.verify')}
          </button>
        </div>
      </div>
    </div>
  );
}
