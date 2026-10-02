# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## 计数器与 Vercel 部署

计数器读写走 `server/api/counter.get.ts` / `counter.post.ts`，存储层在 `server/utils/counter-store.ts`。

- 配置了 `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`（或旧版 `KV_REST_API_URL` + `KV_REST_API_TOKEN`）→ 使用 Upstash Redis，数据持久化
- 未配置 → 回退到进程内存计数，冷启动后归零（页面底部会提示当前后端）

部署到 Vercel：

1. Import 本仓库，Framework 选 Nuxt.js，其余保持默认
2. 在项目页 Storage 标签创建 KV 数据库并连接到项目，Vercel 会自动注入上面两个环境变量
3. 重新部署后页面底部应显示 `vercel-kv`，刷新或换设备访问计数都不会丢
