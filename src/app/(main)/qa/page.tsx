'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getQAQuestions, createQAQuestion, getQAAnswers, createQAAnswer } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function QAPage() {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Answer state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => { loadQuestions(); }, []);

  const loadQuestions = async () => {
    setQuestions(await getQAQuestions());
    setLoading(false);
  };

  const handleAsk = async () => {
    if (!profile) { toast.error('请先登录'); return; }
    if (!title.trim() || !content.trim()) { toast.error('请填写完整'); return; }
    setSubmitting(true);
    const q = await createQAQuestion(profile.id, title.trim(), content.trim(), isAnonymous);
    if (q) {
      toast.success('问题已发布');
      setShowAsk(false); setTitle(''); setContent('');
      loadQuestions();
    } else toast.error('发布失败');
    setSubmitting(false);
  };

  const loadAnswers = async (qid: string) => {
    setAnswers(await getQAAnswers(qid));
    setExpandedId(qid);
  };

  const handleAnswer = async (qid: string) => {
    if (!profile) { toast.error('请先登录'); return; }
    if (!answerText.trim()) return;
    const a = await createQAAnswer(qid, profile.id, answerText.trim(), isAnonymous);
    if (a) {
      toast.success('回答已发布');
      setAnswerText('');
      loadAnswers(qid);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="text-[#3D7AD6] text-sm mb-1 inline-block">← 返回</Link>
          <h1 className="text-2xl font-bold text-gray-800">匿名问答区</h1>
        </div>
        <Button onClick={() => setShowAsk(!showAsk)} className="rounded-full" style={{ backgroundColor: '#5B9CF5' }}>
          {showAsk ? '取消' : '提问'}
        </Button>
      </div>

      {/* Ask form */}
      {showAsk && (
        <div className="bg-white  p-5 border shadow-sm mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">匿名提问</h3>
          <Input placeholder="以问号结尾会更容易获得回答" value={title} onChange={e => setTitle(e.target.value)}
            maxLength={200} className="mb-3" />
          <Textarea placeholder="详细描述你的问题..." value={content} onChange={e => setContent(e.target.value)}
            rows={4} className="mb-3" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <span className="text-sm text-gray-500">匿名提问</span>
            </div>
          </div>
          <Button onClick={handleAsk} disabled={submitting} className="w-full " style={{ backgroundColor: '#5B9CF5' }}>
            {submitting ? '发布中...' : '发布问题'}
          </Button>
        </div>
      )}

      {/* Questions list */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">加载中...</p>
      ) : questions.length > 0 ? (
        questions.map((q: any) => (
          <div key={q.id} className="bg-white  border shadow-sm mb-3 overflow-hidden">
            <button
              onClick={() => expandedId === q.id ? setExpandedId(null) : loadAnswers(q.id)}
              className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">问答</span>
                <span className="text-xs text-gray-400">{q.is_anonymous ? '匿名' : q.author?.anonymous_name}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{q.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{q.content}</p>
              <div className="flex gap-4 mt-2 text-xs text-gray-400">
                <span>{q.answer_count || 0} 个回答</span>
                <span>{new Date(q.created_at).toLocaleDateString('zh-CN')}</span>
              </div>
            </button>

            {/* Answers */}
            {expandedId === q.id && (
              <div className="border-t bg-gray-50/50 p-4">
                {answers.length > 0 ? (
                  answers.map((a: any) => (
                    <div key={a.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500 font-medium">{a.is_anonymous ? '匿名' : a.author?.anonymous_name}</span>
                      </div>
                      <p className="text-sm text-gray-800">{a.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 py-2">暂无回答</p>
                )}

                {/* Answer input */}
                <div className="flex gap-2 mt-3">
                  <Input placeholder="写下你的回答..." value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAnswer(q.id)}
                    className="flex-1 text-sm rounded-full" />
                  <Button size="sm" onClick={() => handleAnswer(q.id)} className="rounded-full"
                    style={{ backgroundColor: '#5B9CF5' }}>回答</Button>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">◦</div>
          <p className="text-gray-500">还没有人提问</p>
          <p className="text-gray-400 text-sm mt-2">点击右上角「提问」发布第一个问题</p>
        </div>
      )}
    </div>
  );
}
