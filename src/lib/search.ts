// UCAE 统一认知分析引擎 - 联网检索模块
// 基于 Tavily API，用于事实核查和信息验证

const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '';
const TAVILY_BASE_URL = 'https://api.tavily.com';

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string;
  images?: string[]; // Tavily 返回的图片 URL 列表
}

/**
 * Search the web using Tavily API
 * Free tier: 1000 requests/month
 */
export async function webSearch(
  query: string,
  options?: {
    maxResults?: number;
    searchDepth?: 'basic' | 'advanced';
    includeAnswer?: boolean;
    topic?: 'general' | 'news';
    includeImages?: boolean;
  }
): Promise<SearchResponse> {
  if (!TAVILY_API_KEY) {
    console.warn('TAVILY_API_KEY not set, skipping web search');
    return { query, results: [] };
  }

  try {
    const response = await fetch(`${TAVILY_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        max_results: options?.maxResults ?? 5,
        search_depth: options?.searchDepth ?? 'basic',
        include_answer: options?.includeAnswer ?? true,
        include_images: options?.includeImages ?? false,
        topic: options?.topic ?? 'general',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Tavily API error:', error);
      return { query, results: [] };
    }

    const data = await response.json();

    return {
      query,
      results: (data.results || []).map((r: Record<string, unknown>) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
        score: r.score || 0,
        publishedDate: r.published_date || undefined,
      })),
      answer: data.answer || undefined,
      images: data.images || undefined,
    };
  } catch (error) {
    console.error('Web search error:', error);
    return { query, results: [] };
  }
}

/**
 * Search for news articles - for timeline and source verification
 */
export async function newsSearch(
  query: string,
  options?: { maxResults?: number }
): Promise<SearchResponse> {
  return webSearch(query, {
    maxResults: options?.maxResults ?? 5,
    searchDepth: 'advanced',
    includeAnswer: true,
    topic: 'news',
  });
}

/**
 * Download an image from URL and convert to base64
 * Used for visual comparison with user-uploaded images
 */
export async function downloadImageAsBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UCAE-Bot/1.0)',
      },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;

    // Limit image size to 4MB
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 4 * 1024 * 1024) return null;

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Image download error:', imageUrl, error);
    return null;
  }
}

/**
 * Extract key claims from text for fact-checking searches
 * Returns an array of search queries
 */
export function generateSearchQueries(
  contentType: string,
  extractedText: string,
  imageDescription?: string
): string[] {
  const queries: string[] = [];

  // If we have extracted text, search for exact or similar claims
  if (extractedText.trim()) {
    // Take the most meaningful sentence/phrase (first 100 chars or first sentence)
    const firstSentence = extractedText.split(/[。！？!?.\n]/)[0];
    if (firstSentence && firstSentence.length > 5) {
      queries.push(`"${firstSentence.slice(0, 80)}" 辟谣 核实`);
      queries.push(`${firstSentence.slice(0, 60)} 真假`);
    }

    // Search for key entities/names mentioned
    const entities = extractEntities(extractedText);
    if (entities.length > 0) {
      queries.push(entities.join(' ') + ' 官方回应');
    }
  }

  // If we have an image description, search for similar images/content
  if (imageDescription?.trim()) {
    const descWords = imageDescription.slice(0, 60);
    queries.push(`${descWords} 原图 来源`);
  }

  // Remove duplicates and empty queries
  return [...new Set(queries.filter((q) => q.trim().length > 3))];
}

/**
 * Simple entity extraction from Chinese text
 * Extracts organization names, location names, etc.
 */
function extractEntities(text: string): string[] {
  const entities: string[] = [];

  // Common Chinese organizational patterns
  const orgPatterns = [
    /[\u4e00-\u9fff]{2,6}(局|部|厅|委|办|院|中心|银行|公司|集团)/g,
    /[\u4e00-\u9fff]{1,3}(省|市|区|县|镇)/g,
  ];

  for (const pattern of orgPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      entities.push(...matches.slice(0, 3));
    }
  }

  // Phone numbers
  const phoneMatch = text.match(/1[3-9]\d{9}/g);
  if (phoneMatch) {
    entities.push(...phoneMatch.slice(0, 2));
  }

  // URLs
  const urlMatch = text.match(/https?:\/\/[^\s]+/g);
  if (urlMatch) {
    entities.push(...urlMatch.slice(0, 2));
  }

  // Specific numbers mentioned (like bank account patterns)
  const accountMatch = text.match(/\d{4,}/g);
  if (accountMatch) {
    entities.push(...accountMatch.slice(0, 1));
  }

  return [...new Set(entities)].slice(0, 5);
}
