'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AFDIAN_SPONSOR_URL = 'https://ifdian.net/a/moebiushewanzuoyou';

export default function PremiumPage() {
  const { profile, refreshProfile } = useAuth();
  const [afdianId, setAfdianId] = useState(profile?.afdian_user_id || '');
  const [verifying, setVerifying] = useState(false);
  const [activating, setActivating] = useState(false);

  // Save afdian ID
  const handleSaveAfdianId = async () => {
    if (!profile || !afdianId.trim()) return;
    const { error } = await supabase.from('profiles')
      .update({ afdian_user_id: afdianId.trim() })
      .eq('user_id', profile.user_id);
    if (error) { toast.error('保存失败'); return; }
    await refreshProfile();
    toast.success('爱发电 ID 已保存');
  };

  // Verify payment via API
  const handleVerify = async () => {
    if (!profile || !afdianId.trim()) {
      toast.error('请先填写你的爱发电用户名');
      return;
    }
    setVerifying(true);
    try {
      const res = await fetch('/api/check-afdian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afdianUserId: afdianId.trim(),
          neuroconnectUserId: profile.user_id,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        toast.error(data.error);
        return;
      }
      toast.success(`找到赞助记录：¥${data.order.total_amount}（${data.order.plan_title}）`);
      // Auto-activate
      setActivating(true);
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from('profiles').update({
        is_premium: true,
        premium_until: expiry,
        premium_order_id: data.order.out_trade_no,
      }).eq('user_id', profile.user_id);
      await supabase.from('premium_requests').insert({
        username: profile.anonymous_name,
        contact: `爱发电: ${afdianId.trim()} / 订单: ${data.order.out_trade_no}`,
        status: 'approved',
      });
      await refreshProfile();
      toast.success('🎉 Premium 已自动激活！');
    } catch {
      toast.error('验证失败，请稍后再试');
    } finally {
      setVerifying(false);
      setActivating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← 返回</Link>

      {profile?.is_premium && (
        <div className="border border-[#5B9CF5] bg-[#5B9CF5]/5 p-4 mb-8 text-center">
          <p className="text-[#5B9CF5] font-bold text-sm">♦ 你已是 Premium 会员</p>
          {profile.premium_until && (
            <p className="text-xs text-gray-400 mt-1">
              有效期至 {new Date(profile.premium_until).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl font-black text-[#111] mb-2">PREMIUM</h1>
        <p className="text-sm text-gray-500">支持社区，解锁更多功能</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="border border-gray-200 p-6">
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#111]">免费</h3>
            <p className="text-3xl font-black text-gray-300 mt-2">¥0</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li>浏览板块</li><li>发帖 / 评论</li><li>点赞 / 收藏</li><li>就诊地图</li><li>基础私信</li>
          </ul>
        </div>
        <div className="border-2 border-[#5B9CF5] p-6 relative">
          <div className="absolute -top-3 right-4 bg-[#5B9CF5] text-white text-xs px-3 py-0.5 font-bold">推荐</div>
          <div className="text-center mb-4">
            <h3 className="font-black text-lg text-[#5B9CF5]">Premium</h3>
            <div className="flex items-center justify-center gap-1 mt-2">
              <p className="text-3xl font-black text-[#5B9CF5]">¥9.9</p><p className="text-xs text-gray-400">/月</p>
            </div>
            <p className="text-xs text-gray-400 mt-1">¥68/年</p>
          </div>
          <ul className="space-y-2 text-xs text-gray-600">
            <li className="font-bold text-[#5B9CF5]">全部免费功能</li>
            <li>自定义头像上传</li><li>无限制私信</li><li>Premium 徽章</li><li>更多主题色</li>
          </ul>
        </div>
      </div>

      {/* 爱发电 Payment */}
      <div className="border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-black text-[#111] mb-4">♦ 爱发电赞助</h2>
        <div className="flex flex-col items-center gap-4">
          <a
            href={AFDIAN_SPONSOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#FF6B9D] text-white px-8 py-3 font-bold text-sm rounded-full hover:opacity-90 transition"
          >
            ♥ 去爱发电赞助
          </a>
          <p className="text-xs text-gray-400">¥9.9/月 · ¥68/年，点击跳转爱发电完成支付后回来验证</p>
        </div>
      </div>

      {/* Activation */}
      <div className="border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-black text-[#111] mb-4">♦ 自动验证激活</h2>
        <div className="space-y-3 max-w-sm mx-auto">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">你的爱发电用户名 (User ID)</label>
            <div className="flex gap-2">
              <input
                placeholder="爱发电用户名"
                value={afdianId}
                onChange={e => setAfdianId(e.target.value)}
                className="flex-1 border border-gray-300 p-3 text-sm"
              />
              <button
                onClick={handleSaveAfdianId}
                className="px-4 py-3 border border-gray-300 text-xs text-gray-600 hover:bg-gray-50"
              >
                保存
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">可在爱发电 App → 我的 → 右上角查看</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-3 text-xs text-gray-500 leading-relaxed">
            <p className="font-bold mb-1">操作步骤：</p>
            <p>1. 填写爱发电用户名并「保存」</p>
            <p>2. 点击上方「去爱发电赞助」完成支付</p>
            <p>3. 回到此页面点击「验证支付」自动激活</p>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying || activating || !afdianId.trim()}
            className="w-full py-3 bg-[#5B9CF5] text-white text-sm font-bold hover:bg-[#4A8AE8] disabled:opacity-50"
          >
            {activating ? '激活中...' : verifying ? '验证中...' : '验证支付并激活'}
          </button>
        </div>
      </div>
    </div>
  );
}
