import Link from 'next/link';
import { getBoards, getPosts } from '@/lib/data';

const SYMBOLS: Record<string, string> = {
  adhd: '◈', audhd: '◉', autism: '•', anxiety: '○',
  experience: '□', life: '▴', work: '▾', support: '★',
};

export default async function HomePage() {
  const [boards, hotPosts, latestPosts] = await Promise.all([
    getBoards(),
    getPosts({ sort: 'hot', limit: 5 }),
    getPosts({ sort: 'latest', limit: 5 }),
  ]);
  const official = boards.filter((b: any) => b.sort_order < 90);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 pb-24">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-[#111] leading-none">NEURO</h1>
        <h1 className="text-3xl font-black tracking-tight text-[#5B9CF5] leading-none">CONNECT</h1>
        <p className="text-xs text-gray-400 mt-2 uppercase tracking-[0.2em]">Moebius 河湾左右</p>
      </div>

      {/* Search */}
      <Link href="/search" className="flex items-center bg-white border border-gray-200 px-4 py-3 mb-8 text-sm text-gray-400 hover:border-gray-300 transition-colors">
        <span className="mr-2 opacity-30">⌕</span> 搜索帖子、话题...
      </Link>

      {/* Boards */}
      <section className="mb-8">
        <h2 className="text-xs tracking-[0.15em] text-gray-400 mb-3 font-bold">社区板块</h2>
        <div className="flex flex-wrap gap-2">
          {official.map((b: any) => (
            <Link key={b.id} href={b.slug === 'experience' ? '/experience' : `/b/${b.slug}`}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 text-sm text-gray-700 font-bold hover:border-[#5B9CF5] hover:text-[#5B9CF5] hover:bg-[#5B9CF5]/5 transition-colors">
              <span className="text-[#5B9CF5]">{SYMBOLS[b.slug] || '●'}</span>
              {b.icon} {b.name_zh}
            </Link>
          ))}
        </div>
      </section>

      {/* Hot */}
      <section className="mb-8">
        <h2 className="text-xs tracking-[0.15em] text-gray-400 mb-3 font-bold">热门帖子</h2>
        {hotPosts.length > 0 ? hotPosts.map((p: any) => <PostCard key={p.id} post={p} />) : (
          <div className="border border-gray-200 p-8 text-center text-sm text-gray-300">还没有帖子，成为第一个分享的人吧</div>
        )}
      </section>

      {/* Latest */}
      <section>
        <h2 className="text-xs tracking-[0.15em] text-gray-400 mb-3 font-bold">最新讨论</h2>
        {latestPosts.length > 0 ? latestPosts.map((p: any) => <PostCard key={p.id} post={p} />) : (
          <div className="border border-gray-200 p-8 text-center text-sm text-gray-300">社区刚刚开始，快来发布第一个帖子</div>
        )}
      </section>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="text-center mb-6">
          <Link href="/rules" className="text-xs text-gray-400 hover:text-gray-600 font-bold">社区规则</Link>
          <span className="text-xs text-gray-300 mx-3">/</span>
          <span className="text-xs text-gray-300">Moebius 河湾左右</span>
        </div>

        <div className="border border-gray-200 p-5">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 text-center">Contact</h3>
          <div className="space-y-2 text-xs text-gray-600 max-w-xs mx-auto">
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">WeChat</span>
              <span className="font-medium">moebius318</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">公众号</span>
              <span className="font-medium">Moebius河湾左右</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">Email</span>
              <span className="font-medium">moebius318@163.com</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">Rednote</span>
              <span className="font-medium">moebiushewan</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-400 w-24 shrink-0">Instagram</span>
              <span className="font-medium">moebius_hewanzuoyou</span>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <Link href="/submit" className="fixed bottom-6 right-6 w-12 h-12 bg-[#5B9CF5] text-white flex items-center justify-center text-xl hover:bg-[#4A8AE8] transition-colors shadow-lg z-50">
        +
      </Link>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/post/${post.id}`} className="block border border-gray-100 p-4 mb-2 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3 mb-2 text-xs text-gray-400">
        <span className="font-bold text-[#5B9CF5]">{post.board?.name_zh}</span>
        <span className="text-gray-300">|</span>
        <span>{post.is_anonymous ? '匿名' : post.author?.anonymous_name}</span>
        <span className="ml-auto">{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
      </div>
      <h3 className="text-sm font-bold text-[#111] mb-1 line-clamp-2">{post.title}</h3>
      <p className="text-xs text-gray-500 line-clamp-2">{post.content}</p>
      <div className="flex gap-4 mt-2 text-[10px] text-gray-300">
        <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5M5 12l7-7 7 7"/></svg> {post.vote_count || 0}</span>
        <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> {post.comment_count || 0}</span>
      </div>
    </Link>
  );
}
