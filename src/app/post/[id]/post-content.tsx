'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createComment, votePost, voteComment, toggleSavePost, submitReport, editComment, deleteComment, editPost, deletePost, getCommentReplies, blockUser, createNotification } from '@/lib/data';
import { useI18n } from '@/lib/i18n-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function CommentItem({ comment, profile, onUpdate, depth = 0 }: { comment: any; profile: any; onUpdate: () => void; depth?: number }) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<any[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const isAuthor = profile && comment.author_id === profile.id;

  const handleEdit = async () => { await editComment(comment.id, profile.id, text); setEditing(false); onUpdate(); };
  const handleDelete = async () => { if (confirm('Delete?')) { await deleteComment(comment.id, profile.id); onUpdate(); } };

  const handleReply = async () => {
    if (!profile || !replyText.trim()) return;
    const c = await createComment({ postId: comment.post_id, authorId: profile.id, content: replyText.trim(), isAnonymous: true, parentId: comment.id });
    if (c) {
      setReplies(prev => [...prev, { ...c, author: { anonymous_name: '我', avatar_url: null } }]);
      setReplyText('');
      setReplying(false);
      setShowReplies(true);
      if (profile.id !== comment.author_id) {
        createNotification({ userId: comment.author_id, type: 'reply', titleZh: '有人回复了你的评论', titleEn: 'Someone replied to your comment', bodyZh: replyText.trim().slice(0, 50), bodyEn: replyText.trim().slice(0, 50), link: `/post/${comment.post_id}` });
      }
      onUpdate();
    }
  };

  const loadReplies = async () => {
    if (showReplies) { setShowReplies(false); return; }
    setLoadingReplies(true);
    const r = await getCommentReplies(comment.id);
    setReplies(r);
    setShowReplies(true);
    setLoadingReplies(false);
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-3 border-l-2 border-gray-100' : ''}`}>
      <div className="mb-3 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-600 font-medium">{comment.is_anonymous ? t('post.anonymousUser') : comment.author?.anonymous_name}</span>
          <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Input value={text} onChange={e => setText(e.target.value)} className="flex-1 text-sm" />
            <Button size="sm" onClick={handleEdit} className="text-xs bg-[#5B9CF5]">{t('common.save')}</Button>
            <Button size="sm" onClick={() => setEditing(false)} variant="outline" className="text-xs">{t('common.cancel')}</Button>
          </div>
        ) : (
          <p className="text-sm text-gray-800 mb-2">{comment.content}</p>
        )}
        <div className="flex gap-3 text-xs text-gray-400 items-center">
          {profile && (
            <>
              <button onClick={async () => {
                await voteComment(comment.id, profile.id, 1);
                if (profile.id !== comment.author_id) {
                  createNotification({ userId: comment.author_id, type: 'vote', titleZh: '有人赞了你的评论', titleEn: 'Someone voted your comment', bodyZh: comment.content.slice(0, 50), bodyEn: comment.content.slice(0, 50), link: `/post/${comment.post_id}` });
                }
                onUpdate();
              }} className="hover:text-[#5B9CF5]">▲</button>
              <span className="text-gray-500 font-bold">{comment.vote_count || 0}</span>
              <button onClick={async () => { await voteComment(comment.id, profile.id, -1); onUpdate(); }} className="hover:text-red-400">▼</button>
            </>
          )}
          {profile && (
            <button onClick={() => setReplying(!replying)} className="hover:text-[#5B9CF5]">{t('post.reply')}</button>
          )}

          {/* Block button - only show for others' comments, not self */}
          {profile && !isAuthor && (
            <button onClick={async () => {
              if (!confirm('屏蔽该用户？你将不再看到对方的帖子和评论。')) return;
              await blockUser(profile.id, comment.author_id);
              toast.success('已屏蔽');
              onUpdate();
            }} className="hover:text-red-400">屏蔽</button>
          )}
          {isAuthor && (
            <>
              <button onClick={() => setEditing(!editing)} className="hover:text-[#5B9CF5]">{t('post.edit')}</button>
              <button onClick={handleDelete} className="hover:text-red-400">{t('post.delete')}</button>
            </>
          )}
          {depth === 0 && (
            <button onClick={loadReplies} className="hover:text-[#5B9CF5]">
              {loadingReplies ? '...' : showReplies ? '收起回复' : `${t('post.reply')}${(comment as any)._replyCount ? ` (${(comment as any)._replyCount})` : ''}`}
            </button>
          )}
        </div>

        {/* Reply input */}
        {replying && (
          <div className="flex gap-2 mt-2">
            <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder={t('post.reply') + '...'} className="flex-1 text-sm" />
            <Button size="sm" onClick={handleReply} className="text-xs bg-[#5B9CF5]">{t('post.reply')}</Button>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div className="mb-2">
          {replies.map((r: any) => (
            <CommentItem key={r.id} comment={r} profile={profile} onUpdate={onUpdate} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PostContent({ postId, initialPost, initialComments, voteCount, commentCount, postAuthorId }: {
  postId: string; initialPost: any; initialComments: any[]; voteCount: number; commentCount: number; postAuthorId: string;
}) {
  const { t, lang } = useI18n();
  const { profile } = useAuth();
  const router = useRouter();

  // Post editing
  const [editingPost, setEditingPost] = useState(false);
  const [editTitle, setEditTitle] = useState(initialPost.title);
  const [editContent, setEditContent] = useState(initialPost.content);
  const [postData, setPostData] = useState(initialPost);

  // Comments
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'new' | 'top'>('new');

  const [votes, setVotes] = useState(voteCount);
  const isAuthor = profile && profile.id === postAuthorId;

  const handleSavePost = async () => {
    if (!profile || !editTitle.trim() || !editContent.trim()) return;
    const updated = await editPost(postId, profile.id, { title: editTitle.trim(), content: editContent.trim() });
    if (updated) {
      setPostData(updated);
      setEditingPost(false);
      toast.success('已更新');
      router.refresh();
    } else {
      toast.error('编辑失败');
    }
  };

  const handleVote = async (value: 1 | -1) => {
    if (!profile) { toast.error('请先登录'); return; }
    await votePost(postId, profile.id, value);
    if (profile.id !== postAuthorId) {
      createNotification({ userId: postAuthorId, type: 'vote', titleZh: '有人赞了你的帖子', titleEn: 'Someone voted your post', bodyZh: initialPost.title, bodyEn: initialPost.title, link: `/post/${postId}` });
    }
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
      if (profile.id !== postAuthorId) {
        createNotification({ userId: postAuthorId, type: 'comment', titleZh: '有人评论了你的帖子', titleEn: 'Someone commented on your post', bodyZh: initialPost.title, bodyEn: initialPost.title, link: `/post/${postId}` });
      }
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Post body */}
      <div className="bg-white p-5 border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="bg-[#5B9CF5]/10 text-[#3D7AD6] text-xs font-semibold rounded-full px-3 py-1 inline-block">
            {lang === 'en' ? (postData.board?.name_en || postData.board?.name_zh) : postData.board?.name_zh}
          </span>
          {isAuthor && !editingPost && (
            <button onClick={() => setEditingPost(true)} className="text-xs text-gray-400 hover:text-[#5B9CF5]">
              {t('post.edit')}
            </button>
          )}
        </div>

        {editingPost ? (
          <div className="space-y-3">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-bold" placeholder={t('post.title')} />
            <Textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6} className="text-base" placeholder={t('post.content')} />
            <div className="flex gap-2">
              <Button onClick={handleSavePost} className="bg-[#5B9CF5] text-xs">{t('common.save')}</Button>
              <Button onClick={() => { setEditingPost(false); setEditTitle(postData.title); setEditContent(postData.content); }} variant="outline" className="text-xs">{t('common.cancel')}</Button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-3">{postData.title}</h2>
            <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
              <span>{postData.is_anonymous ? '• ' + t('post.anonymousUser') : '👤 ' + postData.author?.anonymous_name}</span>
              <span>·</span>
              <span>{new Date(postData.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'zh-CN')}</span>
            </div>
            <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{postData.content}</p>
            {postData.image_url && (
              <img src={postData.image_url} alt={postData.title} className="w-full mt-4 border border-gray-200 object-cover max-h-96" />
            )}
            {postData.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {postData.tags.map((pt: any) => (
                  <span key={pt.tag?.name} className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">{pt.tag?.name}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
          {t('post.save')}
        </button>
        {profile && !isAuthor && (
          <button onClick={async () => {
            if (!confirm('屏蔽该用户？')) return;
            await blockUser(profile.id, postAuthorId);
            toast.success('已屏蔽');
          }} className="flex items-center gap-1.5 hover:text-red-400 transition-colors text-xs">
            🚫 屏蔽
          </button>
        )}
        {isAuthor && (
          <button onClick={async () => {
            if (!confirm('Delete?')) return;
            await deletePost(postId, profile.id);
            router.push('/');
          }} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            {t('post.delete')}
          </button>
        )}
        <button onClick={() => {
          if (!profile) { toast.error('请先登录'); return; }
          const reason = prompt('Report:\n1.Spam 2.Hate 3.Fake 4.Other');
          if (reason) { submitReport(profile.id, 'post', postId, reason); toast.success('Reported'); }
        }} className="flex items-center gap-1.5 hover:text-red-400 transition-colors ml-auto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          {t('post.report')}
        </button>
      </div>

      {/* Comments */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{t('post.comment')} ({comments.length})</h3>
        <div className="flex gap-1 text-xs">
          <button onClick={() => setSortOrder('new')} className={`px-2 py-1 font-bold ${sortOrder === 'new' ? 'text-[#5B9CF5] border-b-2 border-[#5B9CF5]' : 'text-gray-400'}`}>{t('post.new')}</button>
          <button onClick={() => setSortOrder('top')} className={`px-2 py-1 font-bold ${sortOrder === 'top' ? 'text-[#5B9CF5] border-b-2 border-[#5B9CF5]' : 'text-gray-400'}`}>{t('post.top')}</button>
        </div>
      </div>
      {comments.length > 0 ? comments.map((c: any) => (
        <CommentItem key={c.id} comment={c} profile={profile} onUpdate={() => router.refresh()} />
      )) : (
        <p className="text-gray-400 text-center py-8">{t('post.noComments')}</p>
      )}

      {/* Comment input */}
      <div className="flex gap-3 mt-4 pb-10">
        <Input
          placeholder={t('post.writeComment')}
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
