# 技术规范

## 技术栈明细

| 层面 | 选型 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | Next.js | 14+ | App Router 模式 |
| 语言 | TypeScript | 5.x | 严格模式 |
| 样式系统 | Tailwind CSS | 3.x | 原子化 CSS |
| 组件库 | shadcn/ui | latest | 基于 Radix UI |
| 图标 | Lucide React | latest | 开源图标库 |
| 国际化 | next-intl | 3.x | Server Components 兼容 |
| 认证 | Supabase Auth | - | 邮箱+手机号 |
| 数据库 | PostgreSQL | 15+ | Supabase 托管 |
| ORM | Prisma | 5.x | 类型安全查询 |
| 文件存储 | Supabase Storage | - | 头像、图片 |
| 邮件 | Resend | latest | 注册验证邮件 |
| 部署 | Vercel | - | 前端托管 |
| 包管理 | npm | - | 锁定版本 |

---

## 项目架构

```
src/
├── app/                        # Next.js App Router 页面
│   ├── [locale]/               # 国际化路由
│   │   ├── page.tsx            # 首页
│   │   ├── layout.tsx          # 全局布局
│   │   ├── b/
│   │   │   └── [board]/        # 板块页
│   │   ├── post/
│   │   │   └── [id]/           # 帖子详情
│   │   ├── submit/             # 发帖
│   │   ├── experience/         # 就诊经历
│   │   ├── qa/                 # 问答区
│   │   ├── messages/           # 私信
│   │   ├── resources/          # 资源中心
│   │   ├── profile/            # 个人主页
│   │   ├── rules/              # 社区规则
│   │   ├── admin/              # 管理后台
│   │   └── auth/               # 登录/注册
│   └── api/                    # API 路由
│       └── ...
├── components/                 # 共享组件
│   ├── ui/                     # shadcn/ui 基础组件
│   ├── layout/                 # 布局组件
│   ├── posts/                  # 帖子相关组件
│   ├── comments/               # 评论组件
│   └── shared/                 # 通用组件
├── lib/                        # 工具库
│   ├── supabase/               # Supabase 客户端
│   ├── prisma.ts               # Prisma 客户端
│   ├── auth.ts                 # 认证工具
│   └── utils.ts                # 通用工具
├── hooks/                      # 自定义 Hooks
├── types/                      # TypeScript 类型定义
├── messages/                   # 国际化文案
│   ├── zh.json                 # 中文
│   └── en.json                 # 英文
└── styles/                     # 全局样式
```

---

## 数据库完整 Schema（Prisma）

```prisma
// 板块
model Board {
  id          String   @id @default(cuid())
  slug        String   @unique
  nameZh      String
  nameEn      String
  descriptionZh String?
  descriptionEn String?
  icon        String?
  sortOrder   Int      @default(0)
  posts       Post[]
  createdAt   DateTime @default(now())
}

// 用户公开资料（关联 Supabase Auth）
model Profile {
  id            String   @id @default(cuid())
  userId        String   @unique  // Supabase auth.users.id
  anonymousName String   @unique
  avatarUrl     String?
  bio           String?
  isAdmin       Boolean  @default(false)
  posts         Post[]
  comments      Comment[]
  votes         PostVote[]
  saves         PostSave[]
  sentMessages  Message[]  @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  medicalRecords MedicalRecord[]
  qaQuestions   QAQuestion[]
  qaAnswers     QAAnswer[]
  notifications Notification[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// 帖子
model Post {
  id          String    @id @default(cuid())
  authorId    String
  author      Profile   @relation(fields: [authorId], references: [id])
  boardId     String
  board       Board     @relation(fields: [boardId], references: [id])
  title       String
  content     String
  isAnonymous Boolean   @default(false)
  isHidden    Boolean   @default(false)  // 举报自动隐藏
  voteCount   Int       @default(0)
  commentCount Int      @default(0)
  comments    Comment[]
  votes       PostVote[]
  saves       PostSave[]
  tags        PostTag[]
  reports     Report[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

// 标签
model Tag {
  id    String    @id @default(cuid())
  name  String    @unique
  posts PostTag[]
}

// 帖子-标签关联
model PostTag {
  id     String @id @default(cuid())
  postId String
  tagId  String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
}

// 评论
model Comment {
  id          String    @id @default(cuid())
  postId      String
  post        Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId    String
  author      Profile   @relation(fields: [authorId], references: [id])
  parentId    String?
  parent      Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies     Comment[] @relation("CommentReplies")
  content     String
  isAnonymous Boolean   @default(false)
  isHidden    Boolean   @default(false)
  reports     Report[]
  createdAt   DateTime  @default(now())
}

// 帖子投票（点赞/踩）
model PostVote {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      Profile  @relation(fields: [userId], references: [id])
  value     Int      // 1 = 赞, -1 = 踩
  createdAt DateTime @default(now())

  @@unique([postId, userId])
}

// 收藏
model PostSave {
  id        String   @id @default(cuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId    String
  user      Profile  @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())

  @@unique([postId, userId])
}

// 就诊经历
model MedicalRecord {
  id            String   @id @default(cuid())
  authorId      String
  author        Profile  @relation(fields: [authorId], references: [id])
  hospitalName  String?
  department    String?
  diagnosis     String?
  medication    String?
  cost          String?
  rating        Int?     // 1-5 评分
  title         String
  content       String
  tags          String[] // 标签数组
  isAnonymous   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// 问答
model QAQuestion {
  id          String     @id @default(cuid())
  authorId    String
  author      Profile    @relation(fields: [authorId], references: [id])
  title       String
  content     String
  isAnonymous Boolean    @default(true)
  answerCount Int        @default(0)
  answers     QAAnswer[]
  createdAt   DateTime   @default(now())
}

model QAAnswer {
  id          String     @id @default(cuid())
  questionId  String
  question    QAQuestion @relation(fields: [questionId], references: [id], onDelete: Cascade)
  authorId    String
  author      Profile    @relation(fields: [authorId], references: [id])
  content     String
  isAnonymous Boolean    @default(true)
  createdAt   DateTime   @default(now())
}

// 私信
model Message {
  id         String    @id @default(cuid())
  senderId   String
  sender     Profile   @relation("SentMessages", fields: [senderId], references: [id])
  receiverId String
  receiver   Profile   @relation("ReceivedMessages", fields: [receiverId], references: [id])
  content    String
  readAt     DateTime?
  createdAt  DateTime  @default(now())
}

// 举报
model Report {
  id          String   @id @default(cuid())
  reporterId  String
  targetType  String   // "post" | "comment"
  targetId    String
  reason      String
  status      String   @default("pending") // pending | reviewed | resolved
  reviewedBy  String?
  post        Post?    @relation(fields: [targetId], references: [id], onDelete: Cascade)
  comment     Comment? @relation(fields: [targetId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
}

// 通知
model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      Profile  @relation(fields: [userId], references: [id])
  type      String   // comment_reply | vote | message | report_result
  titleZh   String
  titleEn   String
  bodyZh    String
  bodyEn    String
  link      String?  // 跳转链接
  readAt    DateTime?
  createdAt DateTime @default(now())
}

// 资源
model Resource {
  id          String   @id @default(cuid())
  titleZh     String
  titleEn     String
  type        String   // article | link | hotline
  contentZh   String?
  contentEn   String?
  url         String?
  category    String   // knowledge | guide | hotline | support
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API 设计原则

1. **RESTful 风格**：使用标准 HTTP 方法和状态码
2. **国际化**：API 返回数据不翻译，翻译在前端通过 next-intl 处理
3. **权限验证**：敏感操作通过 Supabase Auth middleware 确认身份
4. **分页**：列表接口默认分页（page + pageSize，游标分页用于实时数据）
5. **错误统一**：`{ error: string, code: string }` 格式

### 核心 API 端点

```
GET    /api/boards                    # 板块列表
GET    /api/boards/[slug]             # 板块详情
GET    /api/posts                     # 帖子列表（支持 ?board, ?sort, ?page, ?tag）
POST   /api/posts                     # 发帖（需登录）
GET    /api/posts/[id]               # 帖子详情
PUT    /api/posts/[id]               # 编辑帖子（作者）
DELETE /api/posts/[id]               # 删除帖子（作者或管理员）
POST   /api/posts/[id]/vote          # 点赞/踩
POST   /api/posts/[id]/save          # 收藏
GET    /api/posts/[id]/comments      # 评论列表
POST   /api/posts/[id]/comments      # 发表评论
POST   /api/comments/[id]/reply      # 回复评论
GET    /api/experiences              # 就诊经历列表
POST   /api/experiences              # 分享就诊经历
GET    /api/qa                       # 问答列表
POST   /api/qa                       # 提问
GET    /api/qa/[id]                  # 问题详情
POST   /api/qa/[id]/answers          # 回答
GET    /api/messages                 # 私信列表
GET    /api/messages/[userId]        # 对话详情
POST   /api/messages                 # 发送私信
POST   /api/reports                  # 提交举报
GET    /api/admin/reports            # 管理员查看举报
PUT    /api/admin/reports/[id]       # 管理员处理举报
GET    /api/resources                # 资源列表
POST   /api/admin/resources          # 管理员发布资源
GET    /api/search                   # 搜索
GET    /api/notifications            # 通知列表
```

---

## 安全规范

1. **SQL 注入防护**：使用 Prisma 参数化查询，禁止拼接 SQL
2. **XSS 防护**：所有用户输入内容渲染前进行转义
3. **CSRF 防护**：Next.js Server Actions 自带 CSRF 保护
4. **身份认证**：Supabase Auth RLS（行级安全）策略
5. **输入验证**：使用 Zod 对所有 API 输入进行验证
6. **敏感信息**：邮箱、手机号仅存储在 Supabase Auth，不暴露在任何 API 中
7. **速率限制**：发帖、评论、私信等操作添加速率限制
