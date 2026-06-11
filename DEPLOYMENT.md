# 家庭积分奖惩系统 - 部署说明

## 项目结构

```
family/
├── .env.local                    # 环境变量配置
├── miniprogram/                  # 微信小程序
│   ├── app.js                    # 小程序入口
│   ├── app.json                  # 小程序配置
│   ├── app.wxss                  # 全局样式
│   ├── utils/
│   │   ├── supabase.js           # Supabase工具函数
│   │   └── auth.js               # 认证工具函数
│   └── pages/                    # 小程序页面
│       ├── home/                 # 首页
│       ├── members/              # 家庭成员管理
│       ├── tasks/                # 任务管理
│       ├── points/               # 积分明细/排行榜
│       └── mall/                 # 积分商城
└── web-admin/                    # Web管理后台
    ├── package.json              # 项目依赖配置
    ├── next.config.js            # Next.js配置
    ├── tailwind.config.js        # Tailwind CSS配置
    ├── tsconfig.json             # TypeScript配置
    └── src/
        ├── pages/                # 页面组件
        ├── components/           # 公共组件
        └── utils/                # 工具函数
```

## 环境变量配置

在项目根目录创建 `.env.local` 文件，内容如下：

```env
SUPABASE_URL=https://feufomdbxdfnwfmjisda.supabase.co
SUPABASE_ANON_KEY=sb_publishable_6l7u5vIJ420YUuYimTunkA_p2xS6MeW
```

## Supabase数据库配置

### 创建表结构

1. **family_members（家庭成员表）**
```sql
CREATE TABLE family_members (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
  points INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **tasks（任务表）**
```sql
CREATE TABLE tasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('add', 'deduct')),
  points INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. **point_requests（积分申请表）**
```sql
CREATE TABLE point_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT REFERENCES family_members(id),
  task_id BIGINT REFERENCES tasks(id),
  points INTEGER NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reject_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. **point_records（积分记录表）**
```sql
CREATE TABLE point_records (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT REFERENCES family_members(id),
  type TEXT NOT NULL CHECK (type IN ('add', 'deduct', 'exchange', 'task')),
  description TEXT,
  points INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

5. **products（商品表）**
```sql
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

6. **exchange_requests（兑换申请表）**
```sql
CREATE TABLE exchange_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  member_id BIGINT REFERENCES family_members(id),
  product_id BIGINT REFERENCES products(id),
  points INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reject_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 创建触发器（自动更新积分）

```sql
-- 积分申请通过时更新成员积分
CREATE OR REPLACE FUNCTION update_member_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE family_members 
    SET points = points + NEW.points 
    WHERE id = NEW.member_id;
    
    INSERT INTO point_records (member_id, type, description, points)
    VALUES (NEW.member_id, 'task', '任务完成: ' || (SELECT name FROM tasks WHERE id = NEW.task_id), NEW.points);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER point_request_approved
AFTER UPDATE ON point_requests
FOR EACH ROW
EXECUTE FUNCTION update_member_points();

-- 兑换申请通过时扣减积分
CREATE OR REPLACE FUNCTION update_exchange_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' THEN
    UPDATE family_members 
    SET points = points - NEW.points 
    WHERE id = NEW.member_id;
    
    UPDATE products 
    SET stock = stock - 1 
    WHERE id = NEW.product_id;
    
    INSERT INTO point_records (member_id, type, description, points)
    VALUES (NEW.member_id, 'exchange', '兑换: ' || (SELECT name FROM products WHERE id = NEW.product_id), -NEW.points);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exchange_request_approved
AFTER UPDATE ON exchange_requests
FOR EACH ROW
EXECUTE FUNCTION update_exchange_points();
```

### 设置行级安全策略

```sql
-- 启用行级安全
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;

-- 允许所有用户读取数据（简化配置）
CREATE POLICY "Allow read access for all users" ON family_members
FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON tasks
FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON point_requests
FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON point_records
FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON products
FOR SELECT USING (true);

CREATE POLICY "Allow read access for all users" ON exchange_requests
FOR SELECT USING (true);

-- 允许插入新的申请
CREATE POLICY "Allow insert for point requests" ON point_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow insert for exchange requests" ON exchange_requests
FOR INSERT WITH CHECK (true);
```

## 微信小程序部署

### 开发环境

1. 打开微信开发者工具
2. 导入 `miniprogram` 目录
3. 配置小程序 AppID（需在微信公众平台注册）
4. 运行开发服务器进行调试

### 生产部署

1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 登录微信公众平台提交审核
4. 审核通过后发布上线

## Web管理后台部署

### 开发环境

```bash
cd web-admin
npm install
npm run dev
```

访问 http://localhost:3000 查看效果

### 部署到 Vercel

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 登录 Vercel：
```bash
vercel login
```

3. 部署项目：
```bash
cd web-admin
vercel
```

4. 配置环境变量：
在 Vercel 控制台中添加以下环境变量：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 环境变量配置

确保以下环境变量已正确配置：

| 变量名 | 值 |
|--------|-----|
| SUPABASE_URL | https://feufomdbxdfnwfmjisda.supabase.co |
| SUPABASE_ANON_KEY | sb_publishable_6l7u5vIJ420YUuYimTunkA_p2xS6MeW |

## 功能说明

### 小程序端

1. **首页** - 显示当前用户积分、快速入口
2. **家庭成员** - 查看家庭成员列表和积分排名
3. **任务中心** - 查看任务列表、提交积分申请
4. **积分明细** - 查看积分变化记录、排行榜
5. **积分商城** - 浏览商品、申请兑换

### Web管理后台

1. **仪表盘** - 数据概览、积分排行榜、最近动态
2. **家庭成员管理** - 添加/编辑/删除成员
3. **任务管理** - 添加/编辑/删除任务、启停任务
4. **积分申请审核** - 审核孩子提交的积分申请
5. **积分明细** - 查看所有积分记录
6. **积分商城** - 添加/编辑/删除商品
7. **兑换申请审核** - 审核兑换申请

## 技术栈

- **前端框架**: Next.js 14
- **样式**: Tailwind CSS 3
- **数据库**: Supabase (PostgreSQL)
- **小程序**: 微信小程序原生
- **部署**: Vercel

## 权限说明

- **家长角色**: 拥有完整管理权限，可审核申请、管理任务和商品
- **孩子角色**: 仅可读可提交申请，不可修改配置

## 注意事项

1. 确保 Supabase 项目已正确配置，包括表结构和行级安全策略
2. 小程序需在微信公众平台注册并获取 AppID
3. Web 后台部署时需正确配置环境变量
4. 建议定期备份数据库数据
