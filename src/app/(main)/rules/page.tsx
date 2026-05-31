import Link from 'next/link';

const RULES = [
  { title: '尊重与包容', content: '请尊重每个人的经历和感受，不评判、不攻击、不歧视。' },
  { title: '匿名与安全', content: '不要在帖子中透露真实姓名、地址、电话等个人信息。保护自己和他人的隐私。' },
  { title: '内容责任', content: '分享就诊经历时请注明仅是个人经验，不构成医疗建议。' },
  { title: '禁止内容', content: '禁止发布仇恨言论、骚扰、广告、虚假医疗建议和违法内容。' },
  { title: '举报机制', content: '看到违规内容请使用举报功能。累计3次举报的内容将自动隐藏，等待管理员审核。' },
  { title: '互助精神', content: '分享你的经验、倾听他人、给予支持，一起建立温暖的社区。' },
];

export default function RulesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/" className="text-[#3D7AD6] font-medium">← 返回</Link>
        <h1 className="text-xl font-bold text-gray-800">社区规则</h1>
      </div>
      {RULES.map((r, i) => (
        <div key={i} className="bg-white  p-5 mb-4 border shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#5B9CF5]/10 flex items-center justify-center font-bold text-[#3D7AD6]">{i + 1}</div>
            <h3 className="font-semibold text-gray-800">{r.title}</h3>
          </div>
          <p className="text-sm text-gray-600 ml-11">{r.content}</p>
        </div>
      ))}
    </div>
  );
}
