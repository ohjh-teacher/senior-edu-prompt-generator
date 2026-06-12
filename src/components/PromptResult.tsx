interface PromptResultProps {
  prompt: string;
  copied: boolean;
  onCopy: () => Promise<boolean>;
}

export function PromptResult({ prompt, copied, onCopy }: PromptResultProps) {
  const hasPrompt = prompt.length > 0;

  return (
    <section className="panel result-panel" aria-labelledby="result-title">
      <div className="result-heading">
        <div>
          <p className="eyebrow">생성 결과</p>
          <h2 id="result-title">이미지 프롬프트</h2>
          <p className="intro">외부 이미지 생성 AI에 바로 붙여넣을 수 있습니다.</p>
        </div>
        <button
          className="copy-button compact-copy-button"
          type="button"
          onClick={onCopy}
          disabled={!hasPrompt}
        >
          복사하기
        </button>
      </div>

      <article className="result-card">
        <div className="result-card-label">오늘 수업 결과 이미지용</div>
        {hasPrompt ? (
          <p>{prompt}</p>
        ) : (
          <p className="placeholder">
            왼쪽에서 교육 주제를 입력한 뒤 프롬프트를 만들어보세요.
          </p>
        )}
      </article>

      <div className="copy-row" aria-live="polite">
        {copied && <span className="copy-message">복사되었습니다</span>}
      </div>
    </section>
  );
}
