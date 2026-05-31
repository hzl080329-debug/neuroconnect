import Link from 'next/link';
import { getPosts } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import { BoardActions } from '@/components/board-actions';

const NAMES: Record<string, string> = {
  adhd: 'ADHD', audhd: 'AuDHD', autism: '自闭谱系', anxiety: '焦虑抑郁',
  experience: '就诊经历', life: '生活分享', work: '学习工作', support: '情绪支持',
};

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [posts, boardData] = await Promise.all([
    getPosts({ boardSlug: slug }),
    supabase.from('boards').select('id').eq('slug', slug).single(),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="text-[#3D7AD6] font-medium">← 返回</Link>
        <h1 className="text-xl font-bold text-gray-800">{NAMES[slug] || slug}</h1>
        <BoardActions boardId={boardData.data?.id || ''} />
      </div>
      {posts.length > 0 ? posts.map((p: any) => (
        <Link key={p.id} href={`/post/${p.id}`} className="block bg-white  p-4 mb-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-400">{p.is_anonymous ? '匿名' : p.author?.anonymous_name}</span>
            <span className="text-xs text-gray-300 ml-auto">{new Date(p.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">{p.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{p.content}</p>
          <div className="flex gap-4 mt-3 text-xs text-gray-400"><span>❤️ {p.vote_count || 0}</span><span>◦ {p.comment_count || 0}</span></div>
        </Link>
      )) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-4xl mb-4">▴</div>
          <p>这个板块还没有帖子</p>
          <Link href="/submit" className="text-[#5B9CF5] mt-2 inline-block">发布第一个帖子 ⟶</Link>
        </div>
      )}
    </div>
  );
}
