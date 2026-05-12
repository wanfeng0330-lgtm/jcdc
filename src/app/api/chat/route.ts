import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    // 模拟AI响应
    const response = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `我来帮你分析这个情况。

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
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: response });
  } catch {
    return NextResponse.json(
      { success: false, error: '响应失败，请重试' },
      { status: 500 }
    );
  }
}
