import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/types/domain';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: '초안',
  source_added: '소스 등록됨',
  analyzing: 'AI 분석 중',
  analysis_done: '분석 완료',
  risk_review: '리스크 검토',
  content_drafted: '콘텐츠 초안',
  user_review: '사용자 검수',
  revision_requested: '수정 요청',
  approved: '승인됨',
  listing_pack_ready: '등록 패키지 준비',
  listed: '등록 완료',
  inbound_ready: '입고 준비',
  inbound_sent: '입고 발송',
  live: '판매 중',
  ad_testing: '광고 테스트',
  scale: '스케일업',
  hold: '보류',
  discarded: '폐기됨',
};

const STATUS_VARIANT: Record<ProjectStatus, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  draft: 'default',
  source_added: 'default',
  analyzing: 'info',
  analysis_done: 'info',
  risk_review: 'warning',
  content_drafted: 'info',
  user_review: 'warning',
  revision_requested: 'warning',
  approved: 'success',
  listing_pack_ready: 'success',
  listed: 'success',
  inbound_ready: 'info',
  inbound_sent: 'info',
  live: 'success',
  ad_testing: 'info',
  scale: 'success',
  hold: 'warning',
  discarded: 'danger',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus | string }) {
  const key = status as ProjectStatus;
  return <Badge variant={STATUS_VARIANT[key] ?? 'default'}>{STATUS_LABEL[key] ?? status}</Badge>;
}
