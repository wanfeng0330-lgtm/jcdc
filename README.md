# 识界AI —— 面向AIGC时代的内容可信度认知与传播干预平台

> 用AI对抗AI生成的虚假信息，构建信息可信度认知与传播干预体系

## 🌟 项目定位

**识界AI** 是一个"AI原生的信息可信度辅助判断系统"，不是传统反诈网站，也不是普通资讯平台。它融合传播学视角与AI技术，提供：

- 🔍 **AI内容可信度分析** — 多维度检测AI生成内容
- 🧪 **AI媒介素养实验室** — 游戏化互动体验，构建认知防线
- 🤖 **AI风险解释Agent** — 从传播学视角解释信息风险
- 📊 **数据可视化中心** — 实时监控AI风险态势
- ⚙️ **AI Native技术架构** — 展示AI工作流与人机协同

## 🎨 设计风格

参考 OpenAI / Perplexity / Notion AI / Arc Browser 等现代AI产品风格：

- 极简深色模式
- 毛玻璃卡片
- 发光边框
- 动态渐变
- AI粒子动画
- 流动光效
- 未来感

## 🛠️ 技术栈

### 前端
- **React 19** + **Next.js 16** (App Router)
- **TypeScript**
- **TailwindCSS 4**
- **Framer Motion** (动画)
- **Recharts** (数据可视化)
- **Lucide React** (图标)

### 后端
- **Next.js API Routes**
- Node.js 运行时

### AI接口（预留）
- DeepSeek API / OpenAI API
- Whisper 语音分析
- OCR 文字识别
- AIGC检测模型

## 📱 核心功能

### 1. 首页 Landing Page
- 项目名称与Slogan
- 动态粒子背景
- AI风险流动动画
- CTA按钮
- 数据流效果

### 2. AI内容可信度分析系统（核心）
- 多类型内容上传（图片/视频/音频/文本/截图）
- AI分析过程实时展示（OCR→风险分析→情绪分析→深伪检测→可信度建模）
- 内容可信度评分
- 风险等级判定
- AI生成概率
- 传播学风险解释（情绪操控、身份诱导、极端标题等）
- 验证建议
- 雷达图、风险热力图、详细分析

### 3. AI媒介素养实验室
- 游戏化互动体验《你能识破AI骗局吗？》
- 随机展示AI换脸/拟声/新闻/聊天内容
- 真/假判断
- AI免疫力指数
- 风险认知画像
- 用户弱点分析

### 4. AI风险解释Agent
- ChatGPT风格对话界面
- 流式输出
- 思考动画
- 风险标签
- 卡片式回答
- 传播学视角解释

### 5. 数据可视化中心
- 今日检测数
- AI风险内容占比
- 高频诈骗类型
- 用户误判率
- AI识别率
- 周趋势图
- 24小时分布图
- 风险类型饼图

### 6. 技术架构页
- AI工作流程图
- 核心AI模块展示
- 人机协同结构
- 传播学+AI 项目核心

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/wanfeng0330-lgtm/jcdc.git
cd jcdc/shijie-ai

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📁 项目结构

```
shijie-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx          # 首页
│   │   ├── layout.tsx        # 全局布局
│   │   ├── globals.css       # 全局样式
│   │   ├── analyze/          # AI内容可信度分析
│   │   ├── lab/              # AI媒介素养实验室
│   │   ├── agent/            # AI风险解释Agent
│   │   ├── dashboard/        # 数据可视化中心
│   │   ├── tech/             # 技术架构
│   │   └── api/              # API接口
│   │       ├── analyze/      # 分析接口
│   │       ├── chat/         # 对话接口
│   │       └── dashboard/    # 数据接口
│   ├── components/
│   │   ├── BottomNav.tsx     # 底部导航
│   │   ├── PageContainer.tsx # 页面容器
│   │   ├── ParticleBackground.tsx # 粒子背景
│   │   ├── Charts.tsx        # 图表组件
│   │   └── AIAnimations.tsx  # AI动画组件
│   └── lib/
│       ├── utils.ts          # 工具函数
│       └── mock-data.ts      # 模拟数据
├── package.json
├── tsconfig.json
└── README.md
```

## 🌐 API接口

### POST /api/analyze
提交内容进行AI可信度分析

```json
{
  "type": "image|video|audio|text|screenshot",
  "content": "待分析内容"
}
```

### POST /api/chat
与AI风险解释Agent对话

```json
{
  "message": "用户消息"
}
```

### GET /api/dashboard
获取数据大屏统计数据

## 📄 License

MIT

---

**识界AI** — 让每个人都能在AI时代保持信息清醒 🧠
