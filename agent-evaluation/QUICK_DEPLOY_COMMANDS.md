# 🚀 快速部署命令指南

## 第一步：推送代码到 GitHub

### 1. 创建 GitHub 仓库
请手动在 GitHub 网站创建仓库：
- 访问 [github.com](https://github.com)
- 点击 "+" → "New repository"
- 仓库名：`navos-agent-evaluation`
- 设置为 Public
- 不要初始化 README
- 创建后复制仓库地址

### 2. 连接并推送代码

**将下面的 `YOUR_GITHUB_USERNAME` 替换为您的 GitHub 用户名，然后执行：**

```bash
# 添加远程仓库
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/navos-agent-evaluation.git

# 推送代码
git branch -M main
git push -u origin main
```

## 第二步：部署到 Vercel

### 方式一：网页部署（推荐）

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 导入 `navos-agent-evaluation` 仓库
5. 添加环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://hhedkvyrfoonfgehnxkv.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWRrdnlyZm9vbmZnZWhueGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAzMzQsImV4cCI6MjA3MzY5NjMzNH0.WXdyF14d2jjEVDRIuK4F4DjxJCdowk1n7AXLrU-iajA
   ```
6. 点击 "Deploy"

### 方式二：命令行部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

## 验证部署

部署完成后，访问 Vercel 提供的链接，测试以下页面：

- 首页：`/`
- 登录：`/login`
- 问题评估：`/question`
- 图片查看：`/image`
- 用户管理：`/user-management`
- 数据库测试：`/DatabaseTest`

## 🎉 完成！

您的智能体评估平台已成功部署到 Vercel！

**注意事项：**
- 确保 GitHub 仓库设置为 Public 或给 Vercel 访问权限
- 环境变量必须正确配置
- 首次部署可能需要 3-5 分钟

**获取帮助：**
- 查看详细指南：`VERCEL_DEPLOYMENT_GUIDE.md`
- 检查部署清单：`DEPLOYMENT_CHECKLIST.md`