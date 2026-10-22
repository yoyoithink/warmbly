# Warmbly 文档

文档网站发布于 [docs.warmbly.com](https://docs.warmbly.com)，使用 Next.js 和 [Fumadocs](https://fumadocs.dev) 构建。内容以 MDX 格式保存在 `content/docs/` 中，分为四个侧边栏分类：

- `guides/`：产品各项功能的使用方法
- `learn/`：冷邮件与邮件送达能力基础
- `api/`：API 参考（身份验证、权限、端点和错误码）
- `development/`：自托管、部署、运维与开发

## 开发

```bash
pnpm install
pnpm dev          # dev server on :3000
pnpm types:check  # mdx + route types + tsc
pnpm lint         # eslint
```

## 静态导出

`pnpm build` 会将整个网站导出到 `out/`，生成可由任意静态托管服务或 CDN 提供的纯静态站点。搜索使用预先构建的索引（`/api/search`）在客户端运行，OG 图片在构建时生成。每个页面在 `/llms.mdx/docs/` 下都有原始 Markdown 镜像，并提供 `llms.txt` / `llms-full.txt` 索引。

托管说明：导出结果使用带尾部斜杠的 URL（`guides/mailboxes/index.html`），自定义 404 页面输出为 `404.html`。请将托管服务配置为在路径不存在时显示该页面。

## 约定

- Frontmatter 中的 `title` 是页面的 H1 标题，不要在正文中再用 `#` 标题重复。通过 `icon` 字段为每个页面设置 lucide 图标。
- 当文件夹的 `meta.json` 设置了 `"root": true` 时，该文件夹会成为侧边栏标签页。
- 正文尽量避免使用破折号，可改用句号、逗号、冒号或括号。
