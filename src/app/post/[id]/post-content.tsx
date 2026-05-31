'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createComment, votePost, toggleSavePost, submitReport, editComment, deleteComment, deletePost, getCommentsSorted } from '@/lib/data';

function CommentItem({ comment, profile, onUpdate }: { comment: any; profile: any; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const isAuthor = profile && comment.author_id === profile.id;

  const handleEdit = async () => { await editComment(comment.id, profile.id, text); setEditing(false); onUpdate(); };
  const handleDelete = async () => { if (confirm('Delete?')) { await deleteComment(comment.id, profile.id); onUpdate(); } };

  return (
    <div className="mb-4 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm text-gray-600 font-medium">{comment.is_anonymous ? '匿名' : comment.author?.anonymous_name}</span>
        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString('zh-CN')}</span>
        {isAuthor && (
          <div className="ml-auto flex gap-2 text-xs">
            <button onClick={() => setEditing(!editing)} className="text-gray-400 hover:text-[#5B9CF5]">编辑</button>
            <button onClick={handleDelete} className="text-gray-400 hover:text-red-400">删除</button>
          </div>
        )}
      </div>
      {editing ? (
        <div className="flex gap-2">
          <Input value={text} onChange={e => setText(e.target.value)} className="flex-1 text-sm" />
          <Button size="sm" onClick={handleEdit} className="text-xs bg-[#5B9CF5]">保存</Button>
        </div>
      ) : (
        <p className="text-sm text-gray-800">{comment.content}</p>
      )}
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function PostContent({ postId, initialComments, voteCount, commentCount, postAuthorId }: {
  postId: string; initialComments: any[]; voteCount: number; commentCount: number; postAuthorId: string;
}) {
  const { profile } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [votes, setVotes] = useState(voteCount);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'new' | 'top'>('new');
  const router = useRouter();

  const handleVote = async (value: 1 | -1) => {
    if (!profile) { toast.error('请先登录'); return; }
    await votePost(postId, profile.id, value);
    router.refresh();
  };

  const handleComment = async () => {
    if (!profile) { toast.error('请先登录'); return; }
    if (!text.trim()) return;
    setLoading(true);
    const c = await createComment({ postId, authorId: profile.id, content: text.trim(), isAnonymous: true });
    if (c) {
      setComments(prev => [...prev, { ...c, author: { anonymous_name: '我', avatar_url: null } }]);
      setText('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Actions */}
      <div className="flex gap-5 mb-6 items-center text-xs font-medium text-gray-400">
        <button onClick={() => handleVote(1)} className="flex items-center gap-1.5 hover:text-[#5B9CF5] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
          <span>{votes}</span>
        </button>
        <button onClick={() => handleVote(-1)} className="flex items-center gap-1.5 hover:text-gray-700 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </button>
        <span className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          {comments.length}
        </span>
        <button onClick={() => profile && toggleSavePost(postId, profile.id)} className="flex items-center gap-1.5 hover:text-[#5B9CF5] transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          收藏
        </button>
        {profile && profile.id === postAuthorId && (
          <button onClick={async () => {
            if (!confirm('Delete?')  ) return;
            await deletePost(postId, profile.id);
            router.push('/');
          }} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            删除
          </button>
        )}
        <button onClick={() => {
          if (!profile) { toast.error('请先登录'); return; }
          const reason = prompt('Report:\n1.Spam 2.Hate 3.Fake 4.Other');
          if (reason) { submitReport(profile.id, 'post', postId, reason); toast.success('Reported'); }
        }} className="flex items-center gap-1.5 hover:text-red-400 transition-colors ml-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          举报
        </button>
      </div>

      {/* Comments */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">评论 ({comments.length})</h3>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setSortOrder('new')} className={`px-2 py-1 font-bold ${sortOrder === 'new' ? 'text-[#5B9CF5] border-b-2 border-[#5B9CF5]' : 'text-gray-400'}`}>最新</button>
          <button onClick={() => setSortOrder('top')} className={`px-2 py-1 font-bold ${sortOrder === 'top' ? 'text-[#5B9CF5] border-b-2 border-[#5B9CF5]' : 'text-gray-400'}`}>最热</button>
        </div>
      </div>
      {comments.length > 0 ? comments.map((c: any) => (
        <CommentItem key={c.id} comment={c} profile={profile} onUpdate={() => router.refresh()} />
      )) : (
        <p className="text-gray-400 text-center py-8">暂无评论，来说点什么吧</p>
      )}

      {/* Comment input */}
      <div className="flex gap-3 mt-4 pb-10">
        <Input
          placeholder="写下你的评论..."
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 rounded-full"
          onKeyDown={e => e.key === 'Enter' && handleComment()}
        />
        <Button onClick={handleComment} disabled={loading} className="rounded-full" style={{ backgroundColor: '#5B9CF5' }}>
          ⟶
        </Button>
      </div>
    </div>
  );
}
