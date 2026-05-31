'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n-provider';
import { getProfileBySlug, getUserPostsBySlug, followUser, unfollowUser, isFollowing, getFollowerCount, getFollowingCount } from '@/lib/data';
import { toast } from 'sonner';

export default function UserPage() {
  const { t, lang } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const { profile: me } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const p = await getProfileBySlug(slug);
      if (!p) { setLoading(false); return; }
      setProfile(p);
      const [pts, fc, fgc] = await Promise.all([
        getUserPostsBySlug(slug),
        getFollowerCount(p.id),
        getFollowingCount(p.id),
      ]);
      setPosts(pts);
      setFollowerCount(fc);
      setFollowingCount(fgc);
      if (me) {
        const isF = await isFollowing(me.id, p.id);
        setFollowing(isF);
      }
      setLoading(false);
    })();
  }, [slug, me]);

  const handleFollow = async () => {
    if (!me) { toast.error('请先登录'); return; }
    if (following) {
      await unfollowUser(me.id, profile.id);
      setFollowing(false);
      setFollowerCount(prev => prev - 1);
    } else {
      await followUser(me.id, profile.id);
      setFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('common.loading')}</div>;
  if (!profile) return <div className="text-center py-20 text-gray-400">User not found</div>;

  const isMe = me?.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <Link href="/" className="text-xs text-gray-400 font-bold mb-6 inline-block">← {t('common.back')}</Link>

      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-2xl">
            {profile.avatar_url || '○'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile.anonymous_name}</h1>
            <p className="text-sm text-gray-400">@{profile.slug}</p>
            {profile.bio && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{profile.bio}</p>}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-500"><b className="text-gray-800 dark:text-gray-200">{followerCount}</b> 关注者</span>
          <span className="text-gray-500"><b className="text-gray-800 dark:text-gray-200">{followingCount}</b> 关注中</span>
          {!isMe && (
            <button
              onClick={handleFollow}
              className={`ml-auto px-5 py-1.5 rounded-full text-sm font-bold ${
                following ? 'border border-gray-300 dark:border-gray-600 text-gray-500' : 'bg-[#5B9CF5] text-white'
              }`}
            >
              {following ? '已关注' : '+ 关注'}
            </button>
          )}
          {isMe && (
            <Link href="/profile" className="ml-auto text-xs text-[#5B9CF5]">编辑资料</Link>
          )}
        </div>
      </div>

      <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('profile.posts')} ({posts.length})</h2>
      {posts.length > 0 ? posts.map((p: any) => (
        <Link key={p.id} href={`/post/${p.id}`}
          className="block bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 p-4 mb-2 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
            <span className="font-bold text-[#5B9CF5]">{lang === 'en' ? (p.board?.name_en || p.board?.name_zh) : p.board?.name_zh}</span>
            <span className="ml-auto">{new Date(p.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">{p.title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{p.content}</p>
        </Link>
      )) : (
        <p className="text-center text-gray-400 py-10">{t('common.noData')}</p>
      )}
    </div>
  );
}
