-- NeuroConnect 数据库初始化
-- 在 Supabase SQL Editor 中执行此文件，或通过 CLI 迁移

-- 板块表
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_zh TEXT,
  description_en TEXT,
  icon TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户公开资料（关联 Supabase Auth）
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_name TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子表
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  vote_count INT DEFAULT 0,
  comment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- 帖子标签关联
CREATE TABLE post_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子投票（点赞/踩）
CREATE TABLE post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  value INT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 收藏
CREATE TABLE post_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 就诊经历
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  hospital_name TEXT,
  department TEXT,
  diagnosis TEXT,
  medication TEXT,
  cost TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 问答
CREATE TABLE qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  answer_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE qa_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES qa_questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 私信
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 举报
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  body_zh TEXT NOT NULL,
  body_en TEXT NOT NULL,
  link TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 资源中心
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh TEXT NOT NULL,
  title_en TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('article', 'link', 'hotline')),
  content_zh TEXT,
  content_en TEXT,
  url TEXT,
  category TEXT NOT NULL CHECK (category IN ('knowledge', 'guide', 'hotline', 'support')),
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX idx_posts_board_id ON posts(board_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_messages_sender_receiver ON messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- 触发器：更新帖子评论数
-- ============================================
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

-- ============================================
-- 触发器：更新帖子投票数
-- ============================================
CREATE OR REPLACE FUNCTION update_post_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET vote_count = vote_count + NEW.value WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET vote_count = vote_count - OLD.value WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts SET vote_count = vote_count - OLD.value + NEW.value WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vote_count
  AFTER INSERT OR DELETE OR UPDATE ON post_votes
  FOR EACH ROW EXECUTE FUNCTION update_post_vote_count();

-- ============================================
-- 触发器：自动创建 profile
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, anonymous_name)
  VALUES (NEW.id, 'user_' || substr(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 初始数据：7 个社区板块
-- ============================================
INSERT INTO boards (slug, name_zh, name_en, description_zh, description_en, icon, sort_order) VALUES
  ('adhd', 'ADHD', 'ADHD', '注意力缺陷多动障碍相关讨论', 'Discussions about ADHD', '🧠', 1),
  ('autism', '自闭谱系', 'Autism Spectrum', '自闭症谱系相关讨论', 'Discussions about Autism Spectrum', '🌈', 2),
  ('anxiety', '焦虑抑郁', 'Anxiety & Depression', '焦虑、抑郁等情绪障碍讨论', 'Anxiety, depression, and mood disorders', '💙', 3),
  ('experience', '就诊经历', 'Medical Visits', '医院就诊、诊断过程分享', 'Share medical visit experiences', '🏥', 4),
  ('life', '生活分享', 'Life Sharing', '日常生活、兴趣爱好分享', 'Daily life and hobbies', '🌿', 5),
  ('work', '学习工作', 'Study & Work', '学习技巧、工作适应讨论', 'Study tips and work adaptation', '📝', 6),
  ('support', '情绪支持', 'Emotional Support', '情绪倾诉、互相支持', 'Emotional support and mutual help', '🤗', 7);

-- ============================================
-- RLS 策略（Row Level Security）
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 公开读取策略
CREATE POLICY "Public read boards" ON boards FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public read posts" ON posts FOR SELECT USING (is_hidden = false);
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (is_hidden = false);
CREATE POLICY "Public read medical_records" ON medical_records FOR SELECT USING (true);
CREATE POLICY "Public read qa_questions" ON qa_questions FOR SELECT USING (true);
CREATE POLICY "Public read qa_answers" ON qa_answers FOR SELECT USING (true);
CREATE POLICY "Public read resources" ON resources FOR SELECT USING (published = true);

-- 登录用户写入策略
CREATE POLICY "Users can insert posts" ON posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id));
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id));
CREATE POLICY "Users can insert comments" ON comments FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = author_id));
CREATE POLICY "Users can insert votes" ON post_votes FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));
CREATE POLICY "Users can insert saves" ON post_saves FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = sender_id));
CREATE POLICY "Users can read own messages" ON messages FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = sender_id OR user_id = receiver_id));
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM profiles WHERE id = reporter_id));
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT USING (auth.uid() IN (SELECT user_id FROM profiles WHERE id = user_id));
