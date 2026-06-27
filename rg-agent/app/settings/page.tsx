import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-slate-900">설정</h1>

      <Card>
        <CardHeader><CardTitle>AI Provider</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          <p>현재 AI_PROVIDER = mock (규칙 기반 모의 AI). 실제 LLM(OpenAI/Anthropic) 연동은 .env의 AI_PROVIDER 값과 API 키를 설정한 뒤 사용할 수 있습니다.</p>
          {/* TODO: OpenAI/Anthropic Provider 구현 및 Provider 선택 UI 연동 (src/lib/ai/mock-provider.ts 의 TODO 참고) */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>쿠팡 WING 연동</CardTitle></CardHeader>
        <CardContent className="text-sm text-slate-600">
          본 서비스는 쿠팡 WING 자동 로그인/자동 등록/자동 광고 집행을 지원하지 않으며, 향후에도 계정 정보를 저장하지 않습니다.
          생성된 등록 패키지를 직접 복붙·업로드해 사용해 주세요.
        </CardContent>
      </Card>

      <Alert variant="warning">
        <AlertTitle>중요 고지</AlertTitle>
        <AlertDescription>
          본 서비스의 모든 AI 산출물(리스크 점검 포함)은 1차 참고 자료입니다. 최종 법률·인증·정책 판단 및 등록 책임은 사용자에게 있습니다.
        </AlertDescription>
      </Alert>
    </div>
  );
}
