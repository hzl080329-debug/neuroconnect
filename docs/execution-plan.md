# 执行步骤

## 执行原则

1. **每次只做一步**：完成当前步骤并验证后，再进入下一步
2. **先文档后代码**：所有开发基于本文档定义的步骤执行
3. **每日记录日志**：在 devlogs/ 下按日期记录完成事项和待办
4. **遇到问题暂停**：不要强行推进，先解决问题再继续
5. **保持代码可运行**：每步完成后，`npm run dev` 应该能成功启动

---

## 第一阶段：基础搭建

### 步骤 1.1：初始化 Next.js 项目

**目标**：创建 Next.js 14+ 项目，包含 TypeScript、Tailwind CSS、App Router、src 目录

**执行**：
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**验证**：
- `npm run dev` 成功启动
- 浏览器打开 http://localhost:3000 看到 Next.js 欢迎页

**产出文件**：
- package.json
- tsconfig.json
- tailwind.config.ts
- next.config.js
- src/app/layout.tsx
- src/app/page.tsx

---

### 步骤 1.2：配置 Tailwind 自定义主题

**目标**：将设计规范的配色、字体、圆角写入 Tailwind 配置

**操作**：
- 编辑 tailwind.config.ts
- 添加 primary、accent 色阶
- 添加 warm white 背景色
- 配置字体（Inter、Noto Sans SC）
- 配置默认字号（最小 16px）

**关键配置**：
- primary: { 50-800 } → Teal 色系
- accent: Lavender
- backgroundColor 默认 warm white

**验证**：
- 在首页添加测试元素，确认主题色生效

**产出文件**：
- tailwind.config.ts（修改）
- src/app/globals.css（修改，添加基础样式）

---

### 步骤 1.3：初始化 shadcn/ui

**目标**：安装并配置 shadcn/ui 组件库

**操作**：
```bash
npx shadcn-ui@latest init
```
- 选择默认配置
- 基础色选择 Teal
- CSS 变量模式：是

**随后安装核心组件**：
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add separator
```

**验证**：
- `components/ui/` 目录下有对应组件文件
- 导入 Button 组件测试渲染

**产出文件**：
- components/ui/*（多个组件文件）
- components.json（shadcn 配置）
- src/lib/utils.ts（cn 工具函数）

---

### 步骤 1.4：配置 Supabase 项目

**目标**：创建 Supabase 项目并本地配置

**操作**：
1. 前往 https://supabase.com 注册/登录
2. 创建新项目，记录：
   - Project URL
   - anon/public key
   - service_role key（保密）
3. 本地安装依赖：
```bash
npm install @supabase/supabase-js @supabase/ssr
```
4. 创建 `.env.local`：
```
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_key
```
5. 创建 `src/lib/supabase/client.ts`（客户端）
6. 创建 `src/lib/supabase/server.ts`（服务端）
7. 创建 `src/lib/supabase/middleware.ts`（中间件）

**验证**：
- 能通过 Supabase 客户端连接到项目

**产出文件**：
- .env.local
- src/lib/supabase/client.ts
- src/lib/supabase/server.ts
- src/lib/supabase/middleware.ts

---

### 步骤 1.5：配置 Prisma ORM

**目标**：设置 Prisma，编写完整数据库 Schema

**操作**：
1. 安装 Prisma：
```bash
npm install prisma @prisma/client
npx prisma init
```
2. 将 `docs/tech-specs.md` 中的 Schema 写入 `prisma/schema.prisma`
3. 配置 Supabase 数据库连接字符串到 `.env`
4. 执行迁移：
```bash
npx prisma db push
npx prisma generate
```

**验证**：
- Supabase 数据库中可以看到创建的表
- `npx prisma studio` 可以打开管理界面

**产出文件**：
- prisma/schema.prisma
- src/lib/prisma.ts
- 数据库表结构

---

### 步骤 1.6：配置 next-intl 国际化

**目标**：设置中英双语路由和文案

**操作**：
1. 安装 next-intl：
```bash
npm install next-intl
```
2. 创建 `src/messages/zh.json`（中文文案）
3. 创建 `src/messages/en.json`（英文文案）
4. 创建 `src/i18n.ts`（国际化配置）
5. 创建 `src/middleware.ts`（语言检测和路由）
6. 调整 `src/app/` 目录结构为 `src/app/[locale]/`

**文案需覆盖**：
- 导航栏（首页、板块、问答、资源、私信）
- 通用 UI（搜索、登录、注册、发布、提交）
- 板块名称（7 个板块）

**验证**：
- 访问 `/zh` 显示中文界面
- 访问 `/en` 显示英文界面
- 访问 `/` 自动重定向到浏览器语言

**产出文件**：
- src/messages/zh.json
- src/messages/en.json
- src/i18n.ts
- src/middleware.ts
- src/app/[locale]/layout.tsx
- src/app/[locale]/page.tsx

---

### 步骤 1.7：搭建基础布局组件

**目标**：创建全局导航栏、页脚、页面布局

**组件清单**：
- `Navbar`：顶部导航（Logo、搜索框、板块下拉、语言切换、用户菜单）
- `Footer`：页脚（链接、版权、社区规则入口）
- `RootLayout`：全局布局（包含 Navbar + main + Footer）
- `Sidebar`：侧边栏（桌面端显示板块列表、热门标签）
- `MobileNav`：移动端底部导航栏

**设计要点**：
- Navbar 固定顶部，半透明毛玻璃效果
- 移动端使用底部 Tab 导航
- 搜索框在 Navbar 中居中
- 语言切换使用下拉按钮

**验证**：
- 桌面端和移动端布局正常
- 导航链接可点击
- 页面结构语义化

**产出文件**：
- src/components/layout/navbar.tsx
- src/components/layout/footer.tsx
- src/components/layout/sidebar.tsx
- src/components/layout/mobile-nav.tsx
- src/app/[locale]/layout.tsx（更新）

---

## 第二阶段：用户系统

### 步骤 2.1：注册页面

### 步骤 2.2：登录页面

### 步骤 2.3：Supabase Auth 集成（后端处理注册/登录/登出）

### 步骤 2.4：注册后自动创建 Profile + 设置匿名昵称和头像

### 步骤 2.5：个人主页

---

## 第三阶段：核心内容

### 步骤 3.1：板块列表 + 板块页面

### 步骤 3.2：发帖功能

### 步骤 3.3：帖子详情页

### 步骤 3.4：评论 + 回复

### 步骤 3.5：点赞功能

### 步骤 3.6：收藏功能

### 步骤 3.7：首页（热门/最新/推荐）

---

## 第四阶段：特色功能

### 步骤 4.1：就诊经历分享

### 步骤 4.2：匿名问答区

### 步骤 4.3：搜索 + 标签筛选

---

## 第五阶段：社交功能

### 步骤 5.1：异步私信

### 步骤 5.2：通知系统

---

## 第六阶段：治理与资源

### 步骤 6.1：内容举报

### 步骤 6.2：审核后台

### 步骤 6.3：资源中心

### 步骤 6.4：社区规则页

---

## 第七阶段：优化与上线

### 步骤 7.1：响应式适配检查

### 步骤 7.2：无障碍检查

### 步骤 7.3：性能优化

### 步骤 7.4：部署到 Vercel
