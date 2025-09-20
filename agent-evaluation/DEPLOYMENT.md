# 项目部署指南

## 概述
本项目是一个基于 Next.js 的智能体评估平台，支持多种AI模型的对比评估。项目已配置好 Vercel 部署所需的配置文件。

## 部署前检查清单

### 1. 构建验证
- [x] 项目构建成功 (`pnpm build`)
- [x] 所有页面预渲染正常
- [x] TypeScript 类型检查通过
- [x] ESLint 检查通过（仅有少量警告）

### 2. 配置文件检查
- [x] `vercel.json` 配置文件存在
- [x] `package.json` 脚本配置正确
- [x] Next.js 配置文件 (`next.config.js`) 正确

## Vercel 部署步骤

### 方式一：通过 Vercel CLI（推荐）

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel
   
   # 首次部署会询问项目配置，按提示操作
   # 后续部署可直接使用
   vercel --prod
   ```

### 方式二：通过 Vercel 网站

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub/GitLab 账号登录
3. 点击 "New Project"
4. 导入你的 Git 仓库
5. Vercel 会自动检测 Next.js 项目并配置构建设置
6. 点击 "Deploy" 开始部署

## 环境变量配置

### 必需的环境变量

在 Vercel 项目设置中配置以下环境变量：

```bash
# 数据库连接（如果使用）
DATABASE_URL=your_database_connection_string

# API 密钥（如果需要）
NEXT_PUBLIC_API_BASE_URL=your_api_base_url

# 其他环境变量
NEXT_PUBLIC_APP_ENV=production
```

### 环境变量设置步骤

1. 在 Vercel 项目仪表板中，进入 "Settings" 标签
2. 选择 "Environment Variables"
3. 添加所需的环境变量
4. 选择适用的环境（Production, Preview, Development）
5. 保存配置

## 域名配置

### 使用 Vercel 提供的域名
- 部署成功后，Vercel 会自动分配一个 `.vercel.app` 域名
- 格式通常为：`your-project-name.vercel.app`

### 配置自定义域名

1. 在 Vercel 项目设置中，进入 "Domains" 标签
2. 点击 "Add Domain"
3. 输入你的域名（如：`yourdomain.com`）
4. 按照提示配置 DNS 记录：
   - 添加 CNAME 记录指向 `cname.vercel-dns.com`
   - 或添加 A 记录指向 Vercel 提供的 IP 地址
5. 等待 DNS 传播完成（通常需要几分钟到几小时）

## 数据库连接验证

### 检查数据库连接

1. **本地测试**
   ```bash
   # 确保本地环境变量正确
   pnpm dev
   # 访问 http://localhost:3000/DatabaseTest 测试数据库连接
   ```

2. **生产环境测试**
   - 部署完成后访问 `https://your-domain.com/DatabaseTest`
   - 检查数据库连接状态
   - 验证数据读写功能

### 常见数据库配置

- **Supabase**: 确保 `DATABASE_URL` 格式正确
- **PlanetScale**: 配置连接字符串和 SSL 设置
- **Vercel Postgres**: 使用 Vercel 提供的数据库服务

## 性能优化建议

### 1. 图片优化
- [x] 已使用 Next.js Image 组件
- [x] 配置了适当的图片尺寸

### 2. 代码分割
- [x] Next.js 自动代码分割已启用
- [x] 动态导入已正确配置

### 3. 缓存策略
- 静态资源自动缓存
- API 路由可配置缓存头

## 监控和日志

### Vercel Analytics
1. 在项目设置中启用 Analytics
2. 查看页面性能指标
3. 监控用户访问数据

### 错误监控
- 查看 Vercel 函数日志
- 配置错误报告服务（如 Sentry）

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的依赖版本
   - 确保所有环境变量已正确配置
   - 查看构建日志中的具体错误信息

2. **运行时错误**
   - 检查 Vercel 函数日志
   - 验证环境变量是否正确设置
   - 确保数据库连接正常

3. **性能问题**
   - 使用 Vercel Analytics 分析性能
   - 检查图片和资源加载时间
   - 优化数据库查询

### 调试步骤

1. 本地复现问题
2. 检查浏览器控制台错误
3. 查看 Vercel 部署日志
4. 验证环境变量配置
5. 测试数据库连接

## 部署后验证

### 功能测试清单

- [ ] 首页加载正常
- [ ] 用户登录功能
- [ ] 问题评估页面
- [ ] 图片查看功能
- [ ] 用户管理页面
- [ ] API 接口响应正常
- [ ] 数据库读写功能
- [ ] 响应式设计在移动端正常

### 性能检查

- [ ] 页面加载时间 < 3秒
- [ ] 图片加载优化
- [ ] 移动端体验良好
- [ ] SEO 基础配置

## 维护和更新

### 自动部署
- 连接 Git 仓库后，推送到主分支会自动触发部署
- 可在 Vercel 设置中配置部署分支

### 版本回滚
- 在 Vercel 仪表板中可以快速回滚到之前的版本
- 支持一键回滚功能

### 定期维护
- 定期更新依赖包
- 监控性能指标
- 备份重要数据
- 检查安全更新

---

**部署完成后，请访问你的域名验证所有功能是否正常工作！**