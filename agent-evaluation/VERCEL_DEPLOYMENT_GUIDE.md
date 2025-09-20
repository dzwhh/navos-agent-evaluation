# Vercel 部署完整指南

## 🎯 部署概述

您的项目已经准备好部署到 Vercel！项目构建测试通过，所有配置文件已就绪。

## 📋 部署前确认

✅ **已完成的准备工作：**
- 项目构建成功 (`pnpm build` 通过)
- Git 仓库已初始化并提交所有文件
- Vercel 配置文件 (`vercel.json`) 已配置
- 环境变量文件 (`.env.local`) 已设置
- Supabase 数据库连接正常

## 🚀 部署步骤

### 第一步：创建 GitHub 仓库

1. **访问 GitHub**
   - 打开 [github.com](https://github.com)
   - 登录您的 GitHub 账号

2. **创建新仓库**
   - 点击右上角 "+" → "New repository"
   - 仓库名称：`navos-agent-evaluation`
   - 描述：`智能体评估平台 - AI Agent Evaluation Platform`
   - 设置为 **Public**（推荐，便于 Vercel 访问）
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

3. **连接本地仓库**
   
   复制 GitHub 提供的仓库地址，然后在终端执行：
   
   ```bash
   # 添加远程仓库（替换为您的实际仓库地址）
   git remote add origin https://github.com/您的用户名/navos-agent-evaluation.git
   
   # 推送代码
   git branch -M main
   git push -u origin main
   ```

### 第二步：部署到 Vercel

1. **访问 Vercel**
   - 打开 [vercel.com](https://vercel.com)
   - 点击 "Sign Up" 或 "Log In"
   - 选择 "Continue with GitHub"

2. **导入项目**
   - 点击 "New Project"
   - 找到您的 `navos-agent-evaluation` 仓库
   - 点击 "Import"

3. **配置项目设置**
   - **Project Name**: `navos-agent-evaluation`
   - **Framework**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `pnpm build`（已在 vercel.json 中配置）
   - **Install Command**: `pnpm install`（已在 vercel.json 中配置）

4. **配置环境变量**
   
   在 "Environment Variables" 部分添加以下变量：
   
   ```
   NEXT_PUBLIC_SUPABASE_URL
   值：https://hhedkvyrfoonfgehnxkv.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   值：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhoZWRrdnlyZm9vbmZnZWhueGt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxMjAzMzQsImV4cCI6MjA3MzY5NjMzNH0.WXdyF14d2jjEVDRIuK4F4DjxJCdowk1n7AXLrU-iajA
   ```
   
   **注意**：为每个环境变量选择 "Production", "Preview", "Development" 三个环境。

5. **开始部署**
   - 点击 "Deploy"
   - 等待构建完成（约 2-5 分钟）

## 🔍 部署后验证

### 自动验证
部署完成后，Vercel 会提供一个访问链接，格式类似：
`https://navos-agent-evaluation.vercel.app`

### 功能测试清单

请逐一测试以下功能：

- [ ] **首页访问** - 确认页面正常加载
- [ ] **登录功能** - 测试用户登录流程
- [ ] **问题评估页面** - `/question` 路径可正常访问
- [ ] **图片查看功能** - `/image` 路径功能正常
- [ ] **用户管理页面** - `/user-management` 可正常访问
- [ ] **评估功能** - `/evaluation` 页面正常工作
- [ ] **数据库连接** - 访问 `/DatabaseTest` 验证数据库连接
- [ ] **API 接口** - 检查 `/api/topic-sets` 等接口响应
- [ ] **移动端适配** - 在手机上测试响应式设计

### 性能检查

- [ ] 页面加载时间 < 3 秒
- [ ] 图片加载正常
- [ ] 无控制台错误
- [ ] 数据库查询响应正常

## 🛠️ 故障排除

### 常见问题及解决方案

1. **构建失败**
   - 检查 Vercel 构建日志
   - 确认环境变量配置正确
   - 验证 `package.json` 依赖版本

2. **环境变量问题**
   - 确保所有环境变量都已添加
   - 检查变量名称拼写
   - 确认选择了正确的环境（Production/Preview/Development）

3. **数据库连接失败**
   - 验证 Supabase URL 和密钥正确
   - 检查 Supabase 项目状态
   - 确认数据库表和权限设置

4. **页面 404 错误**
   - 检查路由配置
   - 确认文件路径正确
   - 查看 Next.js 路由设置

## 🔧 高级配置

### 自定义域名

1. 在 Vercel 项目设置中选择 "Domains"
2. 添加您的自定义域名
3. 按照提示配置 DNS 记录
4. 等待 SSL 证书自动配置

### 性能监控

1. 启用 Vercel Analytics
2. 配置 Web Vitals 监控
3. 设置错误报告

### 自动部署

- 每次推送到 `main` 分支会自动触发部署
- 可在 Vercel 设置中配置部署分支
- 支持预览部署（Preview Deployments）

## 📞 获取帮助

如果遇到问题，请检查：

1. **Vercel 部署日志** - 查看详细错误信息
2. **浏览器控制台** - 检查前端错误
3. **Supabase 仪表板** - 验证数据库状态
4. **GitHub 仓库** - 确认代码推送成功

## 🎉 部署成功！

恭喜！您的智能体评估平台已成功部署到 Vercel。

**下一步：**
- 分享您的应用链接
- 配置自定义域名（可选）
- 设置监控和分析
- 定期更新和维护

---

**部署时间**: 预计 10-15 分钟  
**技术支持**: 如需帮助，请查看 Vercel 官方文档或联系技术支持