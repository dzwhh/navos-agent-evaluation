# 部署检查清单

## 🚀 部署前准备

### ✅ 代码质量检查
- [x] 项目构建成功 (`pnpm build`)
- [x] TypeScript 编译无错误
- [x] ESLint 检查通过（仅有少量警告）
- [x] 所有页面预渲染正常
- [x] 图片组件已优化（使用 Next.js Image）
- [x] useSearchParams 已正确包装在 Suspense 中

### ✅ 配置文件检查
- [x] `vercel.json` 配置文件存在且正确
- [x] `package.json` 构建脚本配置正确
- [x] `.env.example` 文件包含所需环境变量
- [x] Next.js 配置文件正确

### 📋 环境变量准备

#### Supabase 配置（必需）
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名密钥
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - 服务端操作密钥（可选）

#### 其他配置（根据需要）
- [ ] `NEXT_PUBLIC_API_BASE_URL` - API 基础 URL
- [ ] `NEXT_PUBLIC_APP_ENV` - 应用环境标识

## 🔧 Vercel 部署步骤

### 方式一：CLI 部署
1. [ ] 安装 Vercel CLI: `npm i -g vercel`
2. [ ] 登录 Vercel: `vercel login`
3. [ ] 部署项目: `vercel --prod`

### 方式二：Git 集成
1. [ ] 推送代码到 Git 仓库
2. [ ] 在 Vercel 导入项目
3. [ ] 配置环境变量
4. [ ] 触发部署

## ⚙️ Vercel 项目配置

### 构建设置
- [ ] Framework Preset: Next.js
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `.next`
- [ ] Install Command: `pnpm install`
- [ ] Node.js Version: 18.x

### 环境变量设置
1. [ ] 进入项目 Settings → Environment Variables
2. [ ] 添加 Supabase 相关变量
3. [ ] 选择适用环境（Production/Preview/Development）
4. [ ] 保存配置

### 域名配置（可选）
- [ ] 添加自定义域名
- [ ] 配置 DNS 记录
- [ ] 验证域名解析

## 🧪 部署后验证

### 功能测试
- [ ] 首页 (`/`) 加载正常
- [ ] 登录页面 (`/login`) 功能正常
- [ ] 问题评估页面 (`/question`) 正常工作
- [ ] 图片查看页面 (`/image`) 正常显示
- [ ] 评估页面 (`/evaluation`) 功能完整
- [ ] 用户管理页面 (`/user-management`) 正常
- [ ] 测试页面 (`/test`) 可访问
- [ ] 数据库测试页面 (`/DatabaseTest`) 连接正常

### API 接口测试
- [ ] `/api/latest-topic` 响应正常
- [ ] `/api/topic-sets` 数据获取正常
- [ ] `/api/placeholder/*` 占位符接口正常

### 性能检查
- [ ] 首屏加载时间 < 3秒
- [ ] 图片加载优化生效
- [ ] 移动端响应式正常
- [ ] 页面间导航流畅

### 数据库连接验证
- [ ] Supabase 连接正常
- [ ] 数据读取功能正常
- [ ] 数据写入功能正常（如果有）
- [ ] 用户认证功能正常（如果有）

## 🔍 故障排除

### 常见问题检查
- [ ] 检查 Vercel 部署日志
- [ ] 验证环境变量是否正确设置
- [ ] 确认 Supabase 项目状态
- [ ] 检查浏览器控制台错误
- [ ] 验证 API 接口响应

### 性能优化
- [ ] 启用 Vercel Analytics
- [ ] 配置适当的缓存策略
- [ ] 监控 Core Web Vitals
- [ ] 检查资源加载时间

## 📊 监控设置

### Vercel 监控
- [ ] 启用 Vercel Analytics
- [ ] 配置错误报告
- [ ] 设置性能监控
- [ ] 配置部署通知

### 日志监控
- [ ] 检查函数执行日志
- [ ] 监控错误率
- [ ] 设置告警规则

## 🔄 维护计划

### 定期检查
- [ ] 每周检查部署状态
- [ ] 每月更新依赖包
- [ ] 季度性能评估
- [ ] 年度安全审计

### 备份策略
- [ ] 代码仓库备份
- [ ] 数据库备份计划
- [ ] 配置文件备份
- [ ] 环境变量备份

---

## 🎉 部署完成确认

当以上所有项目都完成后，你的项目就可以成功部署到 Vercel 了！

**最终验证步骤：**
1. 访问生产环境 URL
2. 测试所有主要功能
3. 检查性能指标
4. 确认监控正常工作

**部署成功！** 🚀