# 古诗源

回到原点的古诗阅读站。一屏一首诗，安静、克制。

## 本地开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)，首页展示第一首诗的阅读页。

## 构建

```bash
npm run build
```

产出纯静态站点，位于 `out/` 目录，无运行时服务端依赖。

## 测试

```bash
npm test
npm run typecheck
```

## 诗的数据格式

每首诗一个 Markdown 文件，放在 `content/poems/` 目录。文件名即 URL slug（如 `duan-ge-xing.md` → `/p/duan-ge-xing`）。

Frontmatter 字段：

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 诗题 |
| `author` | 是 | 作者 |
| `dynasty` | 是 | 朝代 |

正文为诗的原文，一行一句，无需改组件代码。

示例：

```markdown
---
title: 短歌行
author: 曹操
dynasty: 魏
---

对酒当歌，人生几何！
譬如朝露，去日苦多。
```

新增一首诗：在 `content/poems/` 下新建 `.md` 文件，重新 `npm run build` 即可。

## 部署到 Cloudflare Pages

### 方式一：Git 连接（推荐）

1. 将仓库推送到 GitHub
2. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → Create → Connect to Git
3. 构建设置：
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node.js version**: 20 或更高
4. 推送即自动部署

### 方式二：Wrangler CLI

```bash
npm run build
npx wrangler pages deploy out --project-name=gushiyuan
```

## 技术栈

- Next.js（SSG 静态导出）
- Tailwind CSS（页面骨架）
- 自定义 CSS（中文阅读排版）
- LXGW WenKai 字体

详细产品定位见根目录 [《古诗源》网站 PRD](./《古诗源》网站 PRD ｜ 回到原点.md)。
