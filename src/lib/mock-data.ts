// AI风险分析模拟数据

export interface AnalysisResult {
  credibilityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiGeneratedProb: number;
  riskFactors: RiskFactor[];
  verificationSuggestions: string[];
  emotionAnalysis: EmotionAnalysis;
  spreadAnalysis: SpreadAnalysis;
}

export interface RiskFactor {
  type: string;
  label: string;
  score: number;
  description: string;
  icon?: string;
}

export interface EmotionAnalysis {
  primary: string;
  intensity: number;
  manipulationRisk: number;
  techniques: string[];
}

export interface SpreadAnalysis {
  velocity: number;
  reach: string;
  pattern: string;
  nodes: number;
}

export const mockAnalysisResult: AnalysisResult = {
  credibilityScore: 42,
  riskLevel: 'high',
  aiGeneratedProb: 87,
  riskFactors: [
    {
      type: 'emotion',
      label: '情绪操控风险',
      score: 85,
      description: '内容使用强烈的恐惧和紧迫感引导情绪，属于典型的情绪操控模式',
      icon: '🧠',
    },
    {
      type: 'identity',
      label: '身份信任诱导',
      score: 72,
      description: '伪造权威身份建立信任链，利用"官方"身份进行信息诱导',
      icon: '👤',
    },
    {
      type: 'title',
      label: '极端标题特征',
      score: 91,
      description: '标题使用夸张表述和极端用词，符合AI生成的标题党特征',
      icon: '📰',
    },
    {
      type: 'voice',
      label: 'AI拟声特征',
      score: 68,
      description: '音频中检测到AI语音合成特征，语调转换存在不自然跳跃',
      icon: '🎙️',
    },
    {
      type: 'deepfake',
      label: 'AI换脸异常',
      score: 45,
      description: '视频中面部边缘存在轻微不连续，但需要进一步验证',
      icon: '🎭',
    },
    {
      type: 'spread',
      label: '传播诱导模式',
      score: 78,
      description: '内容结构符合社交工程学传播模板，具有明确的传播诱导设计',
      icon: '🔄',
    },
  ],
  verificationSuggestions: [
    '联系本人通过其他渠道确认信息真实性',
    '在官方渠道搜索原始信息来源',
    '检查发布账号的认证状态和历史记录',
    '注意信息中的情绪诱导措辞',
    '使用多源交叉验证确认关键信息',
  ],
  emotionAnalysis: {
    primary: '恐惧与紧迫感',
    intensity: 82,
    manipulationRisk: 76,
    techniques: ['紧迫感制造', '恐惧诉求', '从众暗示', '权威借用'],
  },
  spreadAnalysis: {
    velocity: 8.5,
    reach: '高扩散潜力',
    pattern: '链式传播+社交放大',
    nodes: 1247,
  },
};

// 媒介素养测试数据
export interface QuizQuestion {
  id: number;
  type: 'image' | 'audio' | 'text' | 'video';
  category: string;
  content: string;
  description: string;
  isFake: boolean;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  riskType: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    type: 'text',
    category: 'AI新闻',
    content: '震惊！某市财政局紧急通知：所有退休人员必须在3天内完成社保认证，否则停发养老金！',
    description: '一条在微信群广泛传播的"紧急通知"',
    isFake: true,
    explanation: '这是典型的AI生成诈骗信息。特征：制造紧迫感、利用权威身份、要求紧急操作。真实政府部门通知不会设置如此紧迫的时间限制。',
    difficulty: 'easy',
    riskType: '身份信任诱导',
  },
  {
    id: 2,
    type: 'image',
    category: 'AI换脸',
    content: '视频中某知名企业家宣布公司重大重组计划',
    description: '一段在社交媒体流传的"企业家视频声明"',
    isFake: true,
    explanation: 'AI换脸技术可生成高度逼真的视频。判断要点：面部边缘是否有模糊、光线是否一致、眨眼频率是否正常。',
    difficulty: 'medium',
    riskType: 'AI换脸异常',
  },
  {
    id: 3,
    type: 'audio',
    category: 'AI拟声',
    content: '"妈，我出事了，赶紧给我转5万块！"一通来自"儿子"的紧急电话',
    description: '一通声称是家人的紧急求助电话',
    isFake: true,
    explanation: 'AI拟声技术只需几秒语音样本就能克隆声音。判断要点：是否拒绝视频通话、是否催促转账、语气是否与平时不同。',
    difficulty: 'easy',
    riskType: 'AI拟声特征',
  },
  {
    id: 4,
    type: 'text',
    category: '情绪操控',
    content: '重要提醒！你的银行卡已被冻结，请立即点击链接验证身份，否则将面临法律后果！',
    description: '一条"银行"发来的短信',
    isFake: true,
    explanation: '典型的情绪操控诈骗。特征：制造恐惧、设置紧迫时限、要求点击不明链接。银行不会通过短信要求点击链接验证。',
    difficulty: 'easy',
    riskType: '情绪操控风险',
  },
  {
    id: 5,
    type: 'text',
    category: 'AI新闻',
    content: '今日沪深两市低开高走，沪指收涨0.23%报3256点，两市成交额1.2万亿',
    description: '一条财经新闻快讯',
    isFake: false,
    explanation: '正常的财经新闻格式，数据合理，措辞中性，没有情绪诱导。但也要注意核对原始数据来源。',
    difficulty: 'medium',
    riskType: '信息来源验证',
  },
  {
    id: 6,
    type: 'image',
    category: 'AI换脸',
    content: '某名人代言理财产品的短视频广告',
    description: '一条在短视频平台看到的"名人代言"广告',
    isFake: true,
    explanation: 'AI换脸技术常被用于伪造名人代言。判断要点：名人是否在其他渠道确认代言、画面是否有不自然之处、推广链接是否正规。',
    difficulty: 'hard',
    riskType: 'AI换脸异常',
  },
  {
    id: 7,
    type: 'audio',
    category: 'AI拟声',
    content: '"老板，这是新的收款账号，请把货款打到这个账号。"一条来自"合作方"的语音消息',
    description: '一条声称来自商业伙伴的语音',
    isFake: true,
    explanation: 'AI拟声+社交工程的组合攻击。判断要点：是否要求改变原有支付方式、是否催促操作、是否能通过其他方式联系本人确认。',
    difficulty: 'hard',
    riskType: 'AI拟声特征',
  },
  {
    id: 8,
    type: 'text',
    category: '传播诱导',
    content: '独家！某知名企业即将倒闭，内部人士透露惊人消息！转发让更多人知道真相！',
    description: '一条在社交平台热传的"独家消息"',
    isFake: true,
    explanation: '典型的传播诱导模板。特征：使用"独家""惊人"等夸张词汇、要求转发扩大传播、没有可信信源。真实报道会标注信息来源。',
    difficulty: 'medium',
    riskType: '传播诱导模式',
  },
];

// 免疫力测试结果
export interface ImmunityResult {
  overallScore: number;
  level: string;
  levelDesc: string;
  weaknesses: string[];
  strengths: string[];
  riskProfile: {
    type: string;
    score: number;
  }[];
}

// 数据大屏数据
export const dashboardData = {
  todayChecks: 12847,
  aiRiskRatio: 34.7,
  highFreqScams: [
    { name: 'AI拟声诈骗', count: 3256, trend: 12.5 },
    { name: 'AI换脸诈骗', count: 2187, trend: 8.3 },
    { name: 'AI新闻伪造', count: 1890, trend: 15.2 },
    { name: '情绪操控信息', count: 1654, trend: -3.1 },
    { name: '身份伪造', count: 1234, trend: 6.8 },
  ],
  userMisjudgeRate: 28.3,
  aiDetectionRate: 92.1,
  weeklyTrend: [
    { day: '周一', checks: 1820, risks: 620 },
    { day: '周二', checks: 1950, risks: 710 },
    { day: '周三', checks: 2100, risks: 780 },
    { day: '周四', checks: 1890, risks: 650 },
    { day: '周五', checks: 2050, risks: 750 },
    { day: '周六', checks: 1650, risks: 580 },
    { day: '周日', checks: 1387, risks: 520 },
  ],
  riskTypeDistribution: [
    { name: 'AI拟声', value: 35 },
    { name: 'AI换脸', value: 25 },
    { name: 'AI新闻', value: 20 },
    { name: '情绪操控', value: 12 },
    { name: '身份伪造', value: 8 },
  ],
  hourlyChecks: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    count: Math.floor(Math.random() * 500 + 100),
  })),
};

// AI Agent 对话数据
export const agentResponses: Record<string, string> = {
  default: `我来帮你分析这个情况。

**风险分析**
这是一个典型的AI拟声诈骗场景。AI语音克隆技术已经非常成熟，只需几秒的语音样本就能生成高度逼真的合成语音。

**可信度解释**
从传播学角度来看，这种诈骗利用了以下认知偏差：
- **权威偏差**：倾向于相信来自"家人"的信息
- **紧迫效应**：紧急情况会降低理性判断能力
- **情感绑架**：亲情关系被恶意利用

**操作建议**
1. 挂断电话，通过其他方式联系本人确认
2. 设置家庭暗号，用于验证身份
3. 开通银行转账延迟到账功能
4. 向公安机关报案并保存录音证据`,
};
