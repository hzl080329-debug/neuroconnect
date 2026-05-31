# 设计规范

## 设计理念

**关键词**：温暖、简洁、包容、安全、平静

这个社区面向神经多样性人群，设计需要营造「低刺激、高信任」的氛围。避免过于鲜艳的颜色、复杂的动效、密集的信息排列。

---

## 配色方案

### 主色调

| 色阶 | HEX | 用途 |
|------|-----|------|
| Cyan-50 | #E0FAFC | 浅背景 |
| Cyan-100 | #BFF5F9 | 悬停态 |
| Cyan-200 | #7FEDF4 | 选中态 |
| Cyan-300 | #3FE3EF | 次要按钮 |
| **Cyan-400** | **#0CE2ED** | **主色（按钮、链接、强调）** |
| Cyan-500 | #0BCBD5 | 主色悬停 |
| Cyan-600 | #0AB4BD | 图标 |
| Cyan-700 | #0F7376 | 主色按下/深色 |
| Cyan-800 | #0A5E61 | 深色背景文字 |

### 中性色

| 色阶 | HEX | 用途 |
|------|-----|------|
| Warm White | #FFFAF5 | 页面背景（暖白，比纯白更柔和） |
| Gray-50 | #F9FAFB | 卡片/区块背景 |
| Gray-100 | #F3F4F6 | 分隔区域 |
| Gray-200 | #E5E7EB | 边框 |
| Gray-300 | #D1D5DB | 禁用态边框 |
| Gray-400 | #9CA3AF | 占位文字 |
| Gray-500 | #6B7280 | 次要文字 |
| Gray-600 | #4B5563 | 辅助文字 |
| Gray-700 | #374151 | 正文文字 |
| Gray-800 | #1F2937 | 标题/强调文字 |
| Gray-900 | #111827 | 最大文字 |

### 功能色

| 用途 | 颜色 | HEX |
|------|------|------|
| 强调/点缀 | Lavender | #8B5CF6 |
| 安全/成功 | Green-400 | #4ADE80 |
| 警告 | Amber-300 | #FCD34D |
| 错误 | Rose-400 | #FB7185 |
| 信息 | Sky-400 | #38BDF8 |

### Tailwind 配置

```js
// tailwind.config.ts
colors: {
  primary: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',  // 主色
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
  },
  accent: {
    DEFAULT: '#8B5CF6',
    light: '#E0E7FF',
  },
  warm: {
    white: '#FFFAF5',
  }
}
```

---

## 字体系统

### 字体族

| 用途 | 字体 | 备选 |
|------|------|------|
| 中文正文 | Noto Sans SC | system-ui, sans-serif |
| 英文正文 | Inter | system-ui, sans-serif |
| 等宽（代码/数据） | JetBrains Mono | monospace |

Google Fonts 引入：
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### 字号层级

| 层级 | 字号 | 行高 | 用途 |
|------|------|------|------|
| xs | 12px | 1.5 | 辅助标注、时间戳 |
| sm | 14px | 1.5 | 次要信息、标签 |
| **base** | **16px** | **1.6** | **正文（最小阅读字号）** |
| lg | 18px | 1.6 | 强调正文、卡片标题 |
| xl | 20px | 1.5 | 小标题 |
| 2xl | 24px | 1.4 | 页面标题 |
| 3xl | 30px | 1.3 | 首页大标题 |
| 4xl | 36px | 1.2 | Landing 标题 |

### 字重

- Regular (400)：正文
- Medium (500)：强调文字、标签
- Semibold (600)：小标题、按钮
- Bold (700)：大标题

---

## 间距系统

使用 Tailwind 默认间距（基于 4px 网格），常用值：

| 名称 | 值 | 用途 |
|------|-----|------|
| 2 | 8px | 紧凑间距（图标与文字） |
| 3 | 12px | 标签内边距 |
| **4** | **16px** | **标准内边距** |
| 5 | 20px | 宽松内边距 |
| 6 | 24px | 卡片内边距 |
| 8 | 32px | 区块间距 |
| 12 | 48px | 大区块间距 |
| 16 | 64px | 页面章节间距 |

---

## 圆角与阴影

### 圆角
- 按钮、输入框、标签：`rounded-lg` (8px)
- 卡片：`rounded-xl` (12px)
- 头像：`rounded-full` (圆形)
- 弹窗：`rounded-2xl` (16px)

### 阴影
- 卡片：`shadow-sm`（轻微阴影，不刺眼）
- 悬停卡片：`shadow-md`
- 弹窗：`shadow-lg`
- 不使用大阴影，保持柔和感

---

## 组件设计规范

### 按钮

| 变体 | 样式 | 用途 |
|------|------|------|
| Primary | `bg-primary-500 text-white hover:bg-primary-600` | 主要操作 |
| Secondary | `bg-primary-50 text-primary-700 hover:bg-primary-100` | 次要操作 |
| Ghost | `text-gray-600 hover:bg-gray-100` | 低强调操作 |
| Destructive | `bg-rose-400 text-white hover:bg-rose-500` | 删除/举报 |

- 所有按钮最小高度 44px（触摸友好）
- Focus 状态：`ring-2 ring-primary-300 ring-offset-2`

### 输入框
- 边框：`border border-gray-200`
- Focus：`border-primary-400 ring-2 ring-primary-100`
- 最小高度 44px
- Placeholder 颜色：`text-gray-400`

### 卡片
- 背景白色，`shadow-sm`
- 内边距 `p-6`（24px）
- 帖子卡片悬停时阴影轻微加深

---

## 响应式断点

```
sm:  640px   — 手机横屏
md:  768px   — 平板
lg:  1024px  — 笔记本
xl:  1280px  — 桌面
2xl: 1536px  — 大屏
```

### 布局策略

| 设备 | 宽度 | 布局 |
|------|------|------|
| 手机 (<768px) | 全宽 | 单栏，底部导航 |
| 平板 (768-1023px) | 全宽 | 单栏，侧边抽屉 |
| 桌面 (≥1024px) | 最大 1200px | 双栏（内容+侧边栏） |

---

## 无障碍检查清单

- [ ] 所有图片有 `alt` 属性
- [ ] 表单输入有 `<label>` 关联
- [ ] 颜色对比度 ≥ 4.5:1（正文文字）
- [ ] 颜色不是传达信息的唯一方式
- [ ] 可键盘导航（Tab、Enter、Esc）
- [ ] Focus 指示器可见
- [ ] 标题层级正确（h1 → h2 → h3）
- [ ] 使用语义化 HTML（`<nav>`, `<main>`, `<article>`）
- [ ] ARIA 标签在必要时使用
- [ ] 动画尊重 `prefers-reduced-motion`
- [ ] 触摸目标最小 44×44px

---

## 预设匿名头像

提供 24 个预设头像供用户选择，分为：
- 动物类（猫、狗、兔子、鸟、狐狸等）
- 植物类（仙人掌、向日葵、蘑菇等）
- 抽象类（星星、月亮、云朵等）

头像以 SVG 图标形式内嵌，颜色统一使用 Teal 和 Lavender 色系。
