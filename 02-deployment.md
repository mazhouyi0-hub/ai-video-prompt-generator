# 部署执行文档

代码目录就是仓库根目录（静态站，无构建命令）。

## 步骤 1：推 GitHub（需用户账号授权）
1. 用户浏览器登录 GitHub（账号 mazhouyi0-hub，待当场核实）。
2. 新建公开仓库，建议名 `ai-video-prompt-generator`。
3. 把本目录全部文件推入（或由 Muse 在用户登录后用浏览器/令牌完成）。

## 步骤 2：Vercel 部署（需用户账号授权）
1. vercel.com 用 GitHub 账号登录 → Add New Project → Import 该仓库。
2. Framework Preset 选 Other，Build Command 留空，Output Directory 留空（根目录即站点）。
3. Deploy 后得到 *.vercel.app 地址，逐页验活三个页面。

## 步骤 3：域名（可选，用户拍板后执行）
- 候选：Spaceship 买 .com 新域名（支付宝），或用已有域名子域。
- Vercel 项目 Settings → Domains 添加域名，按提示在域名商处改 nameserver 或 DNS 记录，等待 Valid Configuration。

## 步骤 4：Google Search Console + Bing（需用户 Google 账号授权）
1. GSC 添加资源（域名级或网址前缀），验证方式选 DNS TXT（域名级）或 HTML 文件（网址前缀）。
2. 验证通过后提交 sitemap：`https://<域名>/sitemap.xml`。
3. Bing Webmaster 可从 GSC 一键导入。

## 每次更新
改文件 → 推 GitHub → Vercel 自动重新部署；部署失败时线上保持旧版，需看 Vercel Deployments 状态排错。

## 回滚
Vercel Deployments 里把上一个成功部署 Promote to Production 即可。
