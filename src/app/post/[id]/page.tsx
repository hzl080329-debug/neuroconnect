import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getComments } from '@/lib/data';
import { PostContent } from './post-content';

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, comments] = await Promise.all([getPost(id), getComments(id)]);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link href="/" className="text-[#3D7AD6] font-medium mr-4">← 返回</Link>
        <h1 className="text-lg font-semibold text-gray-800 truncate flex-1">{post.title}</h1>
      </div>

      <div className="bg-white  p-5 border border-gray-100 shadow-sm mb-6">
        <span className="bg-[#5B9CF5]/10 text-[#3D7AD6] text-xs font-semibold rounded-full px-3 py-1 inline-block mb-3">
          {post.board?.name_zh}
        </span>
        <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
          <span>{post.is_anonymous ? '• 匿名' : '👤 ' + post.author?.anonymous_name}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
        </div>
        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        {post.image_url && (
          <img src={post.image_url} alt={post.title} className="w-full mt-4 border border-gray-200 object-cover max-h-96" />
        )}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((pt: any) => (
              <span key={pt.tag?.name} className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">{pt.tag?.name}</span>
            ))}
          </div>
        )}
      </div>

      <PostContent postId={id} initialComments={comments} voteCount={post.vote_count} commentCount={post.comment_count} postAuthorId={post.author_id} />
    </div>
  );
}
