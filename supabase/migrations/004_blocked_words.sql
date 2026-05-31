CREATE TABLE IF NOT EXISTS blocked_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blocked_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read blocked words" ON blocked_words FOR SELECT USING (true);
CREATE POLICY "Admins can manage blocked words" ON blocked_words FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND is_admin = true)
);

-- Insert common spam/scam/swear words
INSERT INTO blocked_words (word) VALUES
  ('广告'), ('推广'), ('加微信'), ('加我'), ('赚钱'), ('兼职'),
  ('日结'), ('刷单'), ('代理'), ('微商'), ('免费领取'), ('点击链接'),
  ('www.'), ('http://'), ('https://'), ('.com'), ('.cn'), ('.net'),
  ('赌博'), ('彩票'), ('色情'), ('贷款'), ('办证'), ('刻章'),
  ('傻逼'), ('傻b'), ('sb'), ('SB'), ('Sb'), ('sB'),
  ('操你'), ('草你'), ('cnm'), ('CNM'), ('cnM'),
  ('他妈'), ('他妈'), ('尼玛'), ('你妈'), ('去死'), ('去你'),
  ('智障'), ('脑残'), ('弱智'), ('废物的'), ('垃圾人'),
  ('fuck'), ('Fuck'), ('FUCK'), ('shit'), ('Shit'), ('SHIT'),
  ('damn'), ('bitch'), ('asshole'), ('dick'), ('pussy'),
  ('艹'), ('屌'), ('鸡巴'), ('逼'), ('婊'), ('贱人'),
  ('神经病'), ('疯子'), ('变态'), ('恶心')
ON CONFLICT (word) DO NOTHING;
