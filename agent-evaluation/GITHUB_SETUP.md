# GitHub 仓库创建和 Vercel 部署指南

## 第一步：创建 GitHub 仓库

### 手动创建 GitHub 仓库

1. **访问 GitHub**
   - 打开浏览器，访问 [github.com](https://github.com)
   - 登录你的 GitHub 账号

2. **创建新仓库**
   - 点击右上角的 "+" 按钮
   - 选择 "New repository"
   - 仓库名称建议：`navos-agent-evaluation`
   - 描述：`智能体评估平台 - AI Agent Evaluation Platform`
   - 选择 "Public" 或 "Private"（推荐 Public 以便 Vercel 访问）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

3. **获取仓库地址**
   - 创建完成后，GitHub 会显示仓库地址
   - 复制 HTTPS 地址，格式类似：`https://github.com/你的用户名/navos-agent-evaluation.git`

## 第二步：连接本地仓库到 GitHub

请在终端中执行以下命令（将 YOUR_GITHUB_URL 替换为你的实际仓库地址）：

```bash
# 添加远程仓库
git remote add origin YOUR_GITHUB_URL

# 推送代码到 GitHub
git branch -M main
git push -u origin main
```

## 第三步：部署到 Vercel

### 方式一：通过 Vercel 网站（推荐）

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 或 "Log In"
   - 选择 "Continue with GitHub" 使用 GitHub 账号登录

2. **导入项目**
   - 登录后点击 "New Project"
   - 在 "Import Git Repository" 部分找到你刚创建的仓库
   - 点击 "Import"

3. **配置项目**
   - Project Name: `navos-agent-evaluation`
   - Framework Preset: Vercel 会自动检测为 "Next.js"
   - Root Directory: 保持默认（./）
   - Build and Output Settings: 保持默认

4. **环境变量配置**
   - 在 "Environment Variables" 部分添加：
     ```
     NEXT_PUBLIC_SUPABASE_URL=你的Supabase项目URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase匿名密钥
     ```
   - 这些值可以从你的 `.env.local` 文件中获取

5. **开始部署**
   - 点击 "Deploy" 开始部署
   - 等待构建完成（通常需要 2-5 分钟）

### 方式二：通过 Vercel CLI

如果你想使用命令行，可以安装 Vercel CLI：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 第四步：验证部署

1. **检查部署状态**
   - 在 Vercel 仪表板中查看部署状态
   - 等待显示 "Ready" 状态

2. **访问应用**
   - 点击 Vercel 提供的域名链接
   - 测试主要功能是否正常

3. **功能验证清单**
   - [ ] 首页加载正常
   - [ ] 登录功能正常
   - [ ] 问题评估页面可访问
   - [ ] 图片查看功能正常
   - [ ] 用户管理页面正常
   - [ ] 数据库连接正常

## 环境变量说明

确保在 Vercel 项目设置中配置了以下环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 项目 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 匿名访问密钥

这些值可以在你的 Supabase 项目设置中找到。

## 后续维护

- **自动部署**: 每次推送到 main 分支都会自动触发部署
- **域名配置**: 可在 Vercel 项目设置中配置自定义域名
- **监控**: 使用 Vercel Analytics 监控应用性能

## 需要帮助？

如果在部署过程中遇到问题，请检查：
1. GitHub 仓库是否公开或 Vercel 有访问权限
2. 环境变量是否正确配置
3. Supabase 数据库连接是否正常
4. 构建日志中的错误信息