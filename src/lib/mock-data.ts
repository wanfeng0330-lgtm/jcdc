// AI风险分析模拟数据

export interface AnalysisResult {
  credibilityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  aiGeneratedProb: number;
  riskFactors: RiskFactor[];
  verificationSuggestions: string[];
  emotionAnalysis: EmotionAnalysis;
  spreadAnalysis: SpreadAnalysis;
  // 联网验证结果
  verification?: VerificationResult;
  // 多信号风险分析
  multiSignalRisk?: MultiSignalRisk;
}

// ============== 多信号风险分析 ==============

// 单个风险信号的严重程度
export type SignalSeverity = 'strong' | 'medium' | 'weak' | 'none';
// 信号是否被检测到
export type SignalDetected = boolean;

// 单个风险信号
export interface RiskSignal {
  // 信号标识
  id: string;
  // 信号名称
  name: string;
  // 信号图标
  icon: string;
  // 信号类别：视觉/情感/来源/传播/标题/时间线
  category: 'visual' | 'emotion' | 'source' | 'spread' | 'headline' | 'timeline';
  // 是否检测到该信号
  detected: SignalDetected;
  // 严重程度
  severity: SignalSeverity;
  // 严重程度数值 (0-100)
  severityScore: number;
  // 信号描述/证据
  evidence: string;
  // 来自哪个分析阶段
  source: 'perception' | 'search' | 'verification' | 'comparison';
}

// 多信号风险分析结果
export interface MultiSignalRisk {
  // 所有信号列表
  signals: RiskSignal[];
  // 综合风险等级
  overallRiskLevel: 'critical' | 'high' | 'medium' | 'low' | 'safe';
  // 综合风险评分 (0-100)
  overallRiskScore: number;
  // 各类别汇总
  categorySummary: {
    visual: { detected: boolean; maxSeverity: SignalSeverity; score: number };
    emotion: { detected: boolean; maxSeverity: SignalSeverity; score: number };
    source: { detected: boolean; maxSeverity: SignalSeverity; score: number };
    spread: { detected: boolean; maxSeverity: SignalSeverity; score: number };
    headline: { detected: boolean; maxSeverity: SignalSeverity; score: number };
    timeline: { detected: boolean; maxSeverity: SignalSeverity; score: number };
  };
  // 系统综合分析结论
  systemSummary: string;
}

// UCAE 验证结果
export interface VerificationResult {
  // 原始来源
  originalSource?: string | null;
  originalUrl?: string | null;
  // 首次发布时间
  firstPublishedDate?: string | null;
  // 是否旧闻翻炒
  isOldNewsRecycled: boolean;
  oldNewsOriginalDate?: string | null;
  // 是否断章取义
  isOutOfContext: boolean;
  contextExplanation?: string | null;
  // 是否存在误导传播
  hasMisleadingSpread: boolean;
  misleadingExplanation?: string | null;
  // 搜索到的相关来源
  relatedSources: RelatedSource[];
  // AI综合判断
  aiSummary: string;
  // 图片对比结果
  imageComparison?: ImageComparisonResult;
}

// 图片对比结果
export interface ImageComparisonResult {
  // 是否找到可对比的网络图片
  hasComparisonImages: boolean;
  // 对比的图片列表
  comparisons: ImageComparison[];
  // AI综合对比结论
  comparisonSummary: string;
}

export interface ImageComparison {
  // 网络图片 URL
  imageUrl: string;
  // 来源页面标题
  sourceTitle: string;
  // 来源页面 URL
  sourceUrl: string;
  // 视觉相似度 (0-100)
  visualSimilarity: number;
  // 关系类型
  relationship: 'same_image' | 'same_scene' | 'edited_version' | 'similar_content' | 'unrelated';
  // 具体差异描述
  differenceDescription: string;
}

export interface RelatedSource {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
  isDebunked?: boolean; // 是否已被辟谣
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
  // 多媒体支持
  imageUrl?: string;       // 图片路径（本地 /lab/ 路径或外部URL）
  audioDescription?: string; // 音频场景描述（替代真实音频）
  hint?: string;           // 识别提示
  telltaleSigns?: string[]; // 关键识别线索
}

export const quizQuestions: QuizQuestion[] = [
  // ============ AI图片 vs 真实图片 ============
  {
    id: 101,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: true,
    explanation: '这是由StyleGAN2 AI生成的人脸。识别线索：1) 背景模糊不自然 2) 眼睛可能存在不对称 3) 头发边缘过于光滑 4) 耳环或眼镜可能有变形。AI生成的人脸通常在这些细节上有瑕疵。',
    difficulty: 'medium',
    riskType: 'AI换脸异常',
    imageUrl: '/lab/faces-ai/face1.jpg',
    hint: '注意观察头发边缘、背景和配饰细节',
    telltaleSigns: ['头发边缘过于完美', '背景存在不自然模糊', '眼镜/耳环可能有变形'],
  },
  {
    id: 102,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: false,
    explanation: '这是真实的人脸照片。真实照片的特征：1) 皮肤纹理自然，有毛孔和细纹 2) 光影过渡自然 3) 背景有真实景深 4) 五官比例自然。真实人脸会有不完美之处，这正是真实的标志。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    imageUrl: '/lab/faces-real/face1.jpg',
    hint: '注意皮肤质感和光影的自然过渡',
    telltaleSigns: ['皮肤纹理自然', '光影过渡平滑', '背景有真实景深'],
  },
  {
    id: 103,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: true,
    explanation: '这是AI生成的人脸。高级识别技巧：1) 观察牙齿——AI通常无法正确生成牙齿排列 2) 注意瞳孔反光是否一致 3) 衣服纹理可能有异常重复 4) 肩膀线条可能不自然。',
    difficulty: 'hard',
    riskType: 'AI换脸异常',
    imageUrl: '/lab/faces-ai/face2.jpg',
    hint: '注意牙齿、瞳孔反光和衣服纹理',
    telltaleSigns: ['牙齿排列异常', '瞳孔反光不一致', '衣服纹理有异常重复'],
  },
  {
    id: 104,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: false,
    explanation: '这是真实的人脸照片。识别真实照片的关键：1) 面部有自然的微表情不对称 2) 皮肤在不同光线下有真实的质感变化 3) 头发有自然的凌乱和分叉 4) 整体色调自然，不过度饱和。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    imageUrl: '/lab/faces-real/face2.jpg',
    hint: '注意面部微表情的自然不对称',
    telltaleSigns: ['微表情自然不对称', '皮肤质感真实', '头发有自然凌乱'],
  },
  {
    id: 105,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: true,
    explanation: '这是AI生成的人脸。识别关键：1) 面部与脖子的肤色过渡是否自然 2) 耳朵形状是否合理（AI常在耳朵上出错）3) 额头与发际线过渡是否自然 4) 整体过于"完美"，缺乏真实人像的自然瑕疵。',
    difficulty: 'medium',
    riskType: 'AI换脸异常',
    imageUrl: '/lab/faces-ai/face3.jpg',
    hint: '注意耳朵形状和发际线过渡',
    telltaleSigns: ['肤色过渡不自然', '耳朵形状异常', '过于完美缺乏瑕疵'],
  },
  {
    id: 106,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: false,
    explanation: '这是真实的人脸照片。即使是专业人像，真实照片也会在细节处展现自然特征：1) 眼白有自然的微红血丝 2) 嘴唇有自然的干纹 3) 眉毛有自然的疏密变化。',
    difficulty: 'medium',
    riskType: '信息来源验证',
    imageUrl: '/lab/faces-real/face3.jpg',
    hint: '注意眼白、嘴唇和眉毛的自然细节',
    telltaleSigns: ['眼白有微红血丝', '嘴唇有自然干纹', '眉毛疏密变化自然'],
  },
  {
    id: 107,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: true,
    explanation: '这是AI生成的人脸。观察要点：1) 下巴和颈部过渡区域是否自然 2) 领口/衣领是否有清晰的物理折叠 3) 光源方向是否一致 4) 眼睛虹膜纹理是否有AI常见的同心圆模式。',
    difficulty: 'hard',
    riskType: 'AI换脸异常',
    imageUrl: '/lab/faces-ai/face4.jpg',
    hint: '注意光源方向和眼睛虹膜纹理',
    telltaleSigns: ['光源方向不一致', '虹膜有同心圆纹理', '领口缺乏物理折叠'],
  },
  {
    id: 108,
    type: 'image',
    category: 'AI人脸',
    content: '这是真实的人脸照片吗？',
    description: '请仔细观察这张人脸照片，判断它是否为真实拍摄',
    isFake: false,
    explanation: '这是真实的人脸照片。记住：不是所有"好看"的照片都是AI生成的。真实照片的特点：1) 面部肌肉在微笑时有自然的拉扯 2) 眼角有自然的细纹（鱼尾纹）3) 光影在鼻翼两侧有自然的明暗变化。',
    difficulty: 'hard',
    riskType: '信息来源验证',
    imageUrl: '/lab/faces-real/face4.jpg',
    hint: '不是所有好看的照片都是AI的——注意面部肌肉拉扯',
    telltaleSigns: ['微笑时肌肉拉扯自然', '眼角有自然细纹', '鼻翼两侧光影自然'],
  },

  // ============ AI新闻 ============
  {
    id: 201,
    type: 'text',
    category: 'AI新闻',
    content: '震惊！某市财政局紧急通知：所有退休人员必须在3天内完成社保认证，否则停发养老金！',
    description: '一条在微信群广泛传播的"紧急通知"',
    isFake: true,
    explanation: '这是典型的AI生成诈骗信息。特征：制造紧迫感、利用权威身份、要求紧急操作。真实政府部门通知不会设置如此紧迫的时间限制。',
    difficulty: 'easy',
    riskType: '身份信任诱导',
    telltaleSigns: ['3天紧迫时限', '冒充政府权威', '停发威胁'],
  },
  {
    id: 202,
    type: 'text',
    category: '真实新闻',
    content: '今日沪深两市低开高走，沪指收涨0.23%报3256点，两市成交额1.2万亿',
    description: '一条财经新闻快讯',
    isFake: false,
    explanation: '正常的财经新闻格式，数据合理，措辞中性，没有情绪诱导。但也要注意核对原始数据来源。',
    difficulty: 'medium',
    riskType: '信息来源验证',
    telltaleSigns: ['措辞中性', '数据合理', '无情绪诱导'],
  },
  {
    id: 203,
    type: 'text',
    category: 'AI新闻',
    content: '突发！某知名企业家深夜发布内部信，宣布公司即将倒闭，数千员工面临失业！转发让更多人知道真相！',
    description: '一条在社交平台热传的"独家消息"',
    isFake: true,
    explanation: '典型的传播诱导模板。特征：使用"独家""惊人"等夸张词汇、要求转发扩大传播、没有可信信源。真实报道会标注信息来源。',
    difficulty: 'medium',
    riskType: '传播诱导模式',
    telltaleSigns: ['"突发""独家"标题党', '要求转发', '无可信信源'],
  },
  {
    id: 204,
    type: 'text',
    category: '真实新闻',
    content: '据新华社报道，国务院办公厅近日印发《关于进一步优化营商环境的意见》，提出20条具体措施。',
    description: '一条来自官方媒体的新闻报道',
    isFake: false,
    explanation: '这是标准的官方新闻报道格式：信源明确（新华社）、政策文件有据可查、措辞严谨客观、没有情绪化表述。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    telltaleSigns: ['信源明确（新华社）', '措辞严谨', '可追溯的政策文件'],
  },
  {
    id: 205,
    type: 'text',
    category: 'AI新闻',
    content: '警告！研究发现99%的饮用水都含有微塑料，长期饮用将导致严重疾病！专家建议立即更换净水器！',
    description: '一条在朋友圈刷屏的"健康提醒"',
    isFake: true,
    explanation: '典型的情绪操控+产品推销组合。特征：1) 夸大数据（"99%"）2) 制造恐慌（"严重疾病"）3) 引导消费（"更换净水器"）4) 缺乏具体研究引用。真实研究报道会注明出处和研究方法。',
    difficulty: 'medium',
    riskType: '情绪操控风险',
    telltaleSigns: ['夸大数据（99%）', '制造健康恐慌', '引导消费行为', '缺乏研究引用'],
  },
  {
    id: 206,
    type: 'text',
    category: '真实新闻',
    content: '国家气候中心今天发布暴雨蓝色预警：预计未来24小时，湖南、江西、浙江等地部分地区有大到暴雨，最大降雨量可达80毫米。',
    description: '一条气象预警信息',
    isFake: false,
    explanation: '标准的气象预警格式：发布机构权威（国家气候中心）、预警等级明确（蓝色预警）、预报数据具体（24小时、80毫米）、措辞准确。真实预警信息都有固定格式和编号，可在官网查证。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    telltaleSigns: ['发布机构权威', '预警等级明确', '数据具体可查'],
  },

  // ============ AI拟声 ============
  {
    id: 301,
    type: 'audio',
    category: 'AI拟声',
    content: '"妈，我出事了，赶紧给我转5万块！"',
    description: '一通来自"儿子"的紧急求助电话',
    isFake: true,
    explanation: 'AI拟声技术只需几秒语音样本就能克隆声音。判断要点：是否拒绝视频通话、是否催促转账、语气是否与平时不同。遇到此类电话，务必通过其他渠道确认身份。',
    difficulty: 'easy',
    riskType: 'AI拟声特征',
    audioDescription: '🔊 想象你接到一通电话，对方声音听起来像你的孩子，但语调急促、要求紧急转账',
    telltaleSigns: ['拒绝视频通话', '紧急催促转账', '语气与平时不同'],
  },
  {
    id: 302,
    type: 'audio',
    category: 'AI拟声',
    content: '"老板，这是新的收款账号，请把货款打到这个账号。"',
    description: '一条来自"合作方"的语音消息',
    isFake: true,
    explanation: 'AI拟声+社交工程的组合攻击。判断要点：是否要求改变原有支付方式、是否催促操作、是否能通过其他方式联系本人确认。务必通过已知联系方式二次确认。',
    difficulty: 'hard',
    riskType: 'AI拟声特征',
    audioDescription: '🔊 想象你收到一条微信语音，声音像你的商业伙伴，但要求更改收款账号',
    telltaleSigns: ['要求改变支付方式', '催促操作', '无法通过其他方式确认'],
  },
  {
    id: 303,
    type: 'audio',
    category: '真实音频',
    content: '"各位同事，明天下午2点在3楼会议室开部门例会，请准时参加。"',
    description: '一条公司内部的工作通知语音',
    isFake: false,
    explanation: '正常的办公通知语音。特征：1) 内容具体明确（时间、地点、事项）2) 不涉及资金操作 3) 语气平和 4) 可以通过其他渠道验证（如查看公司日历、询问其他同事）。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    audioDescription: '🔊 一条公司内部的工作通知语音，内容具体明确，语气平和',
    telltaleSigns: ['内容具体可查', '不涉及资金操作', '语气平和'],
  },

  // ============ 情绪操控 ============
  {
    id: 401,
    type: 'text',
    category: '情绪操控',
    content: '重要提醒！你的银行卡已被冻结，请立即点击链接验证身份，否则将面临法律后果！',
    description: '一条"银行"发来的短信',
    isFake: true,
    explanation: '典型的情绪操控诈骗。特征：制造恐惧、设置紧迫时限、要求点击不明链接。银行不会通过短信要求点击链接验证。',
    difficulty: 'easy',
    riskType: '情绪操控风险',
    telltaleSigns: ['制造恐惧', '紧迫时限', '要求点击不明链接'],
  },
  {
    id: 402,
    type: 'text',
    category: '情绪操控',
    content: '转发！每转发一次，平台就捐1元给患病儿童！不转发就是没有爱心！',
    description: '一条在社交媒体上转发的"爱心接力"',
    isFake: true,
    explanation: '道德绑架式传播诱导。特征：1) 利用善良和同情心 2) 用"没有爱心"进行道德施压 3) "转发即捐款"的模式从未有平台真正执行 4) 真实的慈善活动有正规的捐赠渠道和公示。',
    difficulty: 'medium',
    riskType: '传播诱导模式',
    telltaleSigns: ['道德绑架', '转发即捐款（不真实）', '利用同情心施压'],
  },
  {
    id: 403,
    type: 'text',
    category: '真实信息',
    content: '中国移动提醒您：您本月已使用流量15.6GB，套餐剩余4.4GB。如需办理加油包，请拨打10086或登录App办理。',
    description: '一条来自运营商的流量提醒短信',
    isFake: false,
    explanation: '标准的运营商提醒短信格式：1) 来自官方号码 2) 提供官方查询渠道（10086/App）3) 不含任何不明链接 4) 措辞专业中性。真实运营商通知不会附可疑链接。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    telltaleSigns: ['来自官方号码', '提供官方查询渠道', '不含不明链接'],
  },
  {
    id: 404,
    type: 'text',
    category: '情绪操控',
    content: '紧急！你家老人可能正在被骗！新型诈骗手段曝光，看完请立即转给家人！不然后悔一辈子！',
    description: '一条家族群里的"紧急提醒"',
    isFake: true,
    explanation: '利用恐惧心理的传播操控。虽然内容可能是善意的，但表述方式是典型的操控手法：1) "紧急"制造紧迫感 2) "后悔一辈子"制造恐惧 3) 要求转发扩大传播。真正的反诈宣传由公安机关统一发布，措辞专业冷静。',
    difficulty: 'hard',
    riskType: '情绪操控风险',
    telltaleSigns: ['紧迫感制造', '恐惧诉求', '道德施压要求转发'],
  },
  {
    id: 405,
    type: 'text',
    category: '真实信息',
    content: '尊敬的用户，您预约的体检时间为本周六上午9:00，请携带身份证空腹前往。如有疑问请致电400-xxx-xxxx。',
    description: '一条医院发来的体检预约确认短信',
    isFake: false,
    explanation: '标准的医疗机构提醒短信。特征：1) 信息具体明确（时间、要求）2) 提供官方联系方式 3) 措辞专业 4) 不含可疑链接或要求转账。',
    difficulty: 'easy',
    riskType: '信息来源验证',
    telltaleSigns: ['信息具体明确', '官方联系方式', '无转账要求'],
  },
  {
    id: 406,
    type: 'image',
    category: 'AI图片',
    content: '这张猫咪照片是真实拍摄的吗？',
    description: '请判断这张猫咪照片是真实拍摄还是AI生成',
    isFake: false,
    explanation: '这是真实的猫咪照片。真实动物照片的特征：1) 毛发有自然的层次和光泽变化 2) 眼睛反光自然 3) 身体姿态有自然的随意性 4) 整体色调和谐自然。AI生成的动物图片常在毛发纹理和身体比例上出现异常。',
    difficulty: 'medium',
    riskType: 'AI换脸异常',
    imageUrl: '/lab/cats-real/cat1.jpg',
    hint: '注意毛发的自然层次和光泽',
    telltaleSigns: ['毛发层次自然', '眼睛反光自然', '姿态自然随意'],
  },
  {
    id: 407,
    type: 'image',
    category: '真实场景',
    content: '这张自然风景照片是真实拍摄的吗？',
    description: '请判断这张风景照片是真实拍摄还是AI生成',
    isFake: false,
    explanation: '这是真实的自然风景照片。真实风景照片的特征：1) 光影与天气条件一致 2) 远景有自然的空气透视（远处偏蓝/灰）3) 植物细节有真实的随机性 4) 无AI常见的"过于完美"构图。',
    difficulty: 'medium',
    riskType: '信息来源验证',
    imageUrl: '/lab/scenes-real/scene2.jpg',
    hint: '注意远景的自然空气透视',
    telltaleSigns: ['光影与天气一致', '远景有空气透视', '植物细节自然随机'],
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
