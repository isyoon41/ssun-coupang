import type { AiProvider } from './provider';
import { MockAiProvider } from './mock-provider';
import { GoogleAiProvider } from './google-provider';

let cachedProvider: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = process.env.AI_PROVIDER ?? 'mock';

  if (providerName === 'google') {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('AI_PROVIDER=google 이지만 GOOGLE_API_KEY 환경변수가 설정되지 않았습니다.');
    }
    cachedProvider = new GoogleAiProvider(apiKey);
  } else {
    cachedProvider = new MockAiProvider();
  }

  return cachedProvider;
}
