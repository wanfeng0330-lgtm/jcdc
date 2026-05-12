import { NextResponse } from 'next/server';
import { fetchAndCacheNews } from '@/lib/data-service';

// Cron 定时任务端点 - 每天自动抓取最新AI风险新闻
// 由 Vercel Cron 或外部调度器触发

export async function GET(request: Request) {
  // 验证请求来源 - 防止未授权调用
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const savedCount = await fetchAndCacheNews();

    console.log(`[Cron] News update completed: ${savedCount} new articles saved`);

    return NextResponse.json({
      success: true,
      message: `Updated ${savedCount} news articles`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] News update failed:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
