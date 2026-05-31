import { supabase } from './supabase';

export async function getBoards() {
  const { data } = await supabase.from('boards').select('*').order('sort_order');
  return data || [];
}

export async function getPosts(opts?: {
  boardSlug?: string;
  sort?: 'latest' | 'hot';
  limit?: number;
}) {
  let q = supabase.from('posts').select(
    '*, author:profiles!posts_author_id_fkey(anonymous_name, avatar_url), board:boards(slug, name_zh)'
  ).eq('is_hidden', false);

  if (opts?.boardSlug) {
    const { data: b } = await supabase.from('boards').select('id').eq('slug', opts.boardSlug).single();
    if (b) q = q.eq('board_id', b.id);
  }

  if (opts?.sort === 'hot') q = q.order('vote_count', { ascending: false });
  else q = q.order('created_at', { ascending: false });

  q = q.limit(opts?.limit || 20);
  const { data } = await q;
  return data || [];
}

export async function getPost(id: string) {
  const { data } = await supabase.from('posts').select(
    '*, author:profiles!posts_author_id_fkey(anonymous_name, avatar_url), board:boards(slug, name_zh), tags:post_tags(tag:tags(name))'
  ).eq('id', id).single();
  return data;
}

export async function createPost(p: {
  authorId: string; boardId: string; title: string; content: string;
  isAnonymous: boolean; tags?: string[]; imageUrl?: string;
}) {
  const { data, error } = await supabase.from('posts').insert({
    author_id: p.authorId, board_id: p.boardId, title: p.title,
    content: p.content, is_anonymous: p.isAnonymous, image_url: p.imageUrl || null,
  }).select().single();
  if (error || !data) return null;
  if (p.tags?.length) {
    for (const t of p.tags) {
      const name = t.trim(); if (!name) continue;
      let { data: et } = await supabase.from('tags').select('id').eq('name', name).single();
      if (!et) { const { data: nt } = await supabase.from('tags').insert({ name }).select().single(); et = nt; }
      if (et) await supabase.from('post_tags').insert({ post_id: data.id, tag_id: et.id });
    }
  }
  return data;
}

export async function getComments(postId: string) {
  const { data } = await supabase.from('comments').select(
    '*, author:profiles!comments_author_id_fkey(anonymous_name, avatar_url)'
  ).eq('post_id', postId).is('parent_id', null).eq('is_hidden', false)
   .order('created_at', { ascending: true });
  return data || [];
}

export async function createComment(c: {
  postId: string; authorId: string; content: string; isAnonymous: boolean;
}) {
  const { data } = await supabase.from('comments').insert({
    post_id: c.postId, author_id: c.authorId, content: c.content,
    is_anonymous: c.isAnonymous,
  }).select().single();
  return data;
}

export async function votePost(postId: string, userId: string, value: number) {
  const { data: ex } = await supabase.from('post_votes').select('*')
    .eq('post_id', postId).eq('user_id', userId).single();
  if (ex) {
    if (ex.value === value) { await supabase.from('post_votes').delete().eq('id', ex.id); return null; }
    const { data } = await supabase.from('post_votes').update({ value }).eq('id', ex.id).select().single();
    return data;
  }
  const { data } = await supabase.from('post_votes').insert({ post_id: postId, user_id: userId, value }).select().single();
  return data;
}

export async function toggleSavePost(postId: string, userId: string) {
  const { data: ex } = await supabase.from('post_saves').select('*')
    .eq('post_id', postId).eq('user_id', userId).single();
  if (ex) { await supabase.from('post_saves').delete().eq('id', ex.id); return false; }
  await supabase.from('post_saves').insert({ post_id: postId, user_id: userId });
  return true;
}

export async function searchPosts(q: string) {
  const { data } = await supabase.from('posts').select(
    '*, author:profiles!posts_author_id_fkey(anonymous_name, avatar_url), board:boards(slug, name_zh)'
  ).eq('is_hidden', false).or(`title.ilike.%${q}%,content.ilike.%${q}%`)
   .order('created_at', { ascending: false }).limit(20);
  return data || [];
}

export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
  return data;
}

export async function getUserPosts(userId: string) {
  const { data } = await supabase.from('posts').select('*, board:boards(name_zh)')
    .eq('author_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// Medical Records (就诊经历)
export async function getMedicalRecords(region?: string) {
  let q = supabase.from('medical_records').select(
    '*, author:profiles!medical_records_author_id_fkey(anonymous_name, avatar_url)'
  ).eq('is_published', true).order('created_at', { ascending: false });
  if (region && region !== 'all') q = q.eq('region', region);
  const { data } = await q;
  return data || [];
}

export async function getMedicalRecord(id: string) {
  const { data } = await supabase.from('medical_records').select(
    '*, author:profiles!medical_records_author_id_fkey(anonymous_name, avatar_url)'
  ).eq('id', id).single();
  return data;
}

export async function getRegionCounts() {
  const { data } = await supabase.from('medical_records')
    .select('region').eq('is_published', true);
  const counts: Record<string, number> = {};
  (data || []).forEach((r: any) => {
    if (r.region) counts[r.region] = (counts[r.region] || 0) + 1;
  });
  return counts;
}

export async function createMedicalRecord(record: {
  authorId: string; region: string; city?: string;
  hospitalName?: string; department?: string; diagnosis?: string;
  medication?: string; cost?: string; rating?: number;
  title: string; content: string; tags?: string[]; isAnonymous: boolean;
}) {
  const { data } = await supabase.from('medical_records').insert({
    author_id: record.authorId, region: record.region, city: record.city || null,
    hospital_name: record.hospitalName, department: record.department,
    diagnosis: record.diagnosis, medication: record.medication,
    cost: record.cost, rating: record.rating, title: record.title,
    content: record.content, tags: record.tags || [],
    is_anonymous: record.isAnonymous,
  }).select().single();
  return data;
}

// Messages
export async function getConversations(userId: string) {
  const { data: sent } = await supabase.from('messages')
    .select('receiver_id, profiles!messages_receiver_id_fkey(anonymous_name, avatar_url)')
    .eq('sender_id', userId).order('created_at', { ascending: false });
  const { data: received } = await supabase.from('messages')
    .select('sender_id, profiles!messages_sender_id_fkey(anonymous_name, avatar_url)')
    .eq('receiver_id', userId).order('created_at', { ascending: false });

  const convMap = new Map<string, any>();
  for (const m of [...(sent || []), ...(received || [])] as any[]) {
    const pid = (m as any).receiver_id || (m as any).sender_id;
    const profile = (m as any).profiles;
    if (!convMap.has(pid) && pid !== userId) {
      convMap.set(pid, { userId: pid, anonymous_name: profile?.anonymous_name || '匿名', avatar_url: profile?.avatar_url });
    }
  }
  return Array.from(convMap.values());
}

export async function getMessages(userId: string, otherUserId: string) {
  const { data } = await supabase.from('messages').select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: true });
  // Mark as read
  await supabase.from('messages').update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId).eq('sender_id', otherUserId).is('read_at', null);
  return data || [];
}

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const { data } = await supabase.from('messages').insert({
    sender_id: senderId, receiver_id: receiverId, content,
  }).select().single();
  return data;
}

export async function updateProfile(userId: string, data: { anonymous_name?: string; avatar_url?: string; bio?: string }) {
  const { data: result, error } = await supabase.from('profiles')
    .update(data).eq('user_id', userId).select().single();
  if (error) throw error;
  return result;
}

// QA
export async function getQAQuestions() {
  const { data } = await supabase.from('qa_questions').select(
    '*, author:profiles!qa_questions_author_id_fkey(anonymous_name, avatar_url)'
  ).order('created_at', { ascending: false });
  return data || [];
}

export async function getQAQuestion(id: string) {
  const { data } = await supabase.from('qa_questions').select(
    '*, author:profiles!qa_questions_author_id_fkey(anonymous_name, avatar_url)'
  ).eq('id', id).single();
  return data;
}

export async function createQAQuestion(authorId: string, title: string, content: string, isAnonymous: boolean) {
  const { data } = await supabase.from('qa_questions').insert({
    author_id: authorId, title, content, is_anonymous: isAnonymous,
  }).select().single();
  return data;
}

export async function getQAAnswers(questionId: string) {
  const { data } = await supabase.from('qa_answers').select(
    '*, author:profiles!qa_answers_author_id_fkey(anonymous_name, avatar_url)'
  ).eq('question_id', questionId).order('created_at', { ascending: true });
  return data || [];
}

export async function createQAAnswer(questionId: string, authorId: string, content: string, isAnonymous: boolean) {
  const { data } = await supabase.from('qa_answers').insert({
    question_id: questionId, author_id: authorId, content, is_anonymous: isAnonymous,
  }).select().single();
  return data;
}

export async function editComment(commentId: string, authorId: string, content: string) {
  const { data } = await supabase.from('comments')
    .update({ content }).eq('id', commentId).eq('author_id', authorId).select().single();
  return data;
}

export async function deleteComment(commentId: string, authorId: string) {
  const { error } = await supabase.from('comments')
    .delete().eq('id', commentId).eq('author_id', authorId);
  return !error;
}

export async function editPost(postId: string, authorId: string, data: { title?: string; content?: string }) {
  const { data: result, error } = await supabase.from('posts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', postId).eq('author_id', authorId).select().single();
  return result || null;
}

export async function deletePost(postId: string, authorId: string) {
  const { error } = await supabase.from('posts')
    .delete().eq('id', postId).eq('author_id', authorId);
  return !error;
}

// Reports
export async function submitReport(reporterId: string, targetType: string, targetId: string, reason: string) {
  const { data } = await supabase.from('reports').insert({
    reporter_id: reporterId, target_type: targetType, target_id: targetId, reason,
  }).select().single();
  return data;
}

// Notifications
export async function getNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*')
    .eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return data || [];
}

export async function createNotification(notif: {
  userId: string; type: string; titleZh: string; titleEn: string;
  bodyZh: string; bodyEn: string; link?: string;
}) {
  await supabase.from('notifications').insert({
    user_id: notif.userId, type: notif.type,
    title_zh: notif.titleZh, title_en: notif.titleEn,
    body_zh: notif.bodyZh, body_en: notif.bodyEn, link: notif.link || null,
  });
}

export async function markNotificationsRead(userId: string) {
  await supabase.from('notifications').update({ read_at: new Date().toISOString() })
    .eq('user_id', userId).is('read_at', null);
}

export async function getUnreadCount(userId: string) {
  const { count } = await supabase.from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId).is('read_at', null);
  return count || 0;
}

// Board members
export async function joinBoard(boardId: string, userId: string) {
  await supabase.from('board_members').insert({ board_id: boardId, user_id: userId });
}
export async function leaveBoard(boardId: string, userId: string) {
  await supabase.from('board_members').delete().eq('board_id', boardId).eq('user_id', userId);
}
export async function isMember(boardId: string, userId: string) {
  const { data } = await supabase.from('board_members').select('*').eq('board_id', boardId).eq('user_id', userId).single();
  return !!data;
}
export async function getJoinedBoards(userId: string) {
  const { data } = await supabase.from('board_members').select('board:boards(*)').eq('user_id', userId);
  return (data || []).map((m: any) => m.board);
}

// Block users
export async function blockUser(blockerId: string, blockedId: string) {
  await supabase.from('blocked_users').insert({ blocker_id: blockerId, blocked_id: blockedId });
}
export async function unblockUser(blockerId: string, blockedId: string) {
  await supabase.from('blocked_users').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
}

// Comments with sort
export async function getCommentsSorted(postId: string, sort: 'new' | 'top' = 'new') {
  const q = supabase.from('comments').select('*, author:profiles!comments_author_id_fkey(anonymous_name, avatar_url)')
    .eq('post_id', postId).is('parent_id', null).eq('is_hidden', false);
  if (sort === 'top') q.order('created_at', { ascending: true }); // placeholder - would need vote_count on comments
  else q.order('created_at', { ascending: true });
  const { data } = await q;
  return data || [];
}

// Resources
export async function getResources() {
  const { data } = await supabase.from('resources').select('*')
    .eq('published', true).order('created_at', { ascending: false });
  return data || [];
}

// Admin
export async function getReports() {
  const { data } = await supabase.from('reports').select('*')
    .eq('status', 'pending').order('created_at', { ascending: false });
  return data || [];
}

export async function handleReport(reportId: string, adminId: string, status: string) {
  const { data } = await supabase.from('reports').update({
    status, reviewed_by: adminId,
  }).eq('id', reportId).select().single();
  return data;
}
