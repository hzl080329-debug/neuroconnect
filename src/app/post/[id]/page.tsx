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

      <PostContent
        postId={id}
        initialPost={post}
        initialComments={comments}
        voteCount={post.vote_count}
        commentCount={post.comment_count}
        postAuthorId={post.author_id}
      />
    </div>
  );
}
