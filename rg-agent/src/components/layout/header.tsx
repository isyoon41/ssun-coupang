export function Header() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <p className="text-sm font-medium text-slate-700">Human-in-the-loop AI 등록 보조 워크스페이스</p>
      <div className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        AI 산출물은 1차 점검입니다 · 최종 등록은 직접 검토 후 진행하세요
      </div>
    </header>
  );
}
