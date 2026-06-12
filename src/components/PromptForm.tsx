import {
  aspectRatioOptions,
  audienceOptions,
  colorToneOptions,
  materialTypeOptions,
  minStepCount,
  pageCountOptions,
  purposeOptions,
} from '../constants/options';
import type { DragEvent } from 'react';
import type { PromptFormValues, TopicHistoryRecord } from '../types/prompt';
import { ExampleTopics } from './ExampleTopics';

interface ReferenceImagePreview {
  id: string;
  name: string;
  url: string;
}

interface PromptFormProps {
  values: PromptFormValues;
  exampleTopics: string[];
  topicHistory: TopicHistoryRecord[];
  errorMessage: string;
  onChange: <K extends keyof PromptFormValues>(
    key: K,
    value: PromptFormValues[K]
  ) => void;
  referenceImagePreviews: ReferenceImagePreview[];
  onReferenceImagesAdd: (files: File[]) => void;
  onReferenceImageRemove: (imageId: string) => void;
  onReferenceImagesClear: () => void;
  onSelectTopic: (topic: string) => void;
  onSelectHistory: (record: TopicHistoryRecord) => void;
  onSubmit: () => void;
  onReset: () => void;
}

const colorSwatches: Record<string, string> = {
  '파스텔 블루': '#8fc7ff',
  '따뜻한 민트': '#92dcc5',
  '밝은 라벤더': '#c5b2ff',
  '부드러운 옐로우': '#f5d36f',
};

const workflowSteps = ['주제 입력', '수업 정보', '프롬프트 생성', 'AI로 제작'];

export function PromptForm({
  values,
  exampleTopics,
  topicHistory,
  errorMessage,
  onChange,
  referenceImagePreviews,
  onReferenceImagesAdd,
  onReferenceImageRemove,
  onReferenceImagesClear,
  onSelectTopic,
  onSelectHistory,
  onSubmit,
  onReset,
}: PromptFormProps) {
  const showPosterFields = values.materialType === '홍보 포스터';

  const formatHistoryDate = (createdAt: string) =>
    new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(createdAt));

  const formatHistoryLabel = (record: TopicHistoryRecord) => {
    const classDate = record.values?.eventDate;
    const classDateLabel = classDate ? ` · 수업 ${classDate}` : '';

    return `${record.topic}${classDateLabel} · 입력 ${formatHistoryDate(record.createdAt)}`;
  };

  const handleStepCountChange = (value: string) => {
    const nextStepCount = Math.max(minStepCount, Number(value) || minStepCount);

    onChange('stepCount', nextStepCount);
  };

  const handleReferenceImageDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const droppedFiles = Array.from(event.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );

    if (droppedFiles.length === 0) {
      return;
    }

    onReferenceImagesAdd(droppedFiles);
  };

  return (
    <section className="panel input-panel" aria-labelledby="form-title">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true">
          AI
        </span>
        <div>
          <p className="eyebrow">시니어 디지털 수업 콘텐츠 도구</p>
          <h1 id="form-title">오늘 수업 AI</h1>
          <p className="intro">
            수업 주제와 강사 정보를 입력하면 복습 이미지, 홍보 포스터, 공유 피드용 프롬프트를 준비합니다.
          </p>
        </div>
      </div>

      <ol className="workflow-strip" aria-label="작업 흐름">
        {workflowSteps.map((step, index) => (
          <li key={step}>
            <span>{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>

      <form
        className="prompt-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="field featured-field">
          <label htmlFor="topic">교육 주제</label>
          <textarea
            id="topic"
            className="topic-textarea"
            rows={3}
            value={values.topic}
            placeholder="예: 문자 메시지 보내기"
            onChange={(event) => onChange('topic', event.target.value)}
            aria-describedby={errorMessage ? 'topic-error' : undefined}
          />
          {errorMessage && (
            <p className="error-message" id="topic-error" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="reference-image-field">
            <label htmlFor="reference-image">참고 이미지</label>
            <div
              className="reference-image-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleReferenceImageDrop}
            >
              <input
                id="reference-image"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => {
                  onReferenceImagesAdd(Array.from(event.target.files ?? []));
                  event.target.value = '';
                }}
              />
              <p>이미지를 여러 장 끌어다 놓거나 파일을 선택하세요</p>
            </div>
            <p className="field-help">
              수업 결과 이미지나 참고 화면을 여러 장 넣으면 프롬프트에 참고 이미지 안내가 추가됩니다.
            </p>
            {referenceImagePreviews.length > 0 && (
              <div className="reference-image-preview-list">
                {referenceImagePreviews.map((image) => (
                  <div className="reference-image-preview" key={image.id}>
                    <img src={image.url} alt={`${image.name} 미리보기`} />
                    <div>
                      <p>{image.name}</p>
                      <button
                        className="text-button"
                        type="button"
                        onClick={() => onReferenceImageRemove(image.id)}
                      >
                        이미지 제거
                      </button>
                    </div>
                  </div>
                ))}
                <button className="text-button" type="button" onClick={onReferenceImagesClear}>
                  전체 이미지 제거
                </button>
              </div>
            )}
          </div>
        </div>

        <ExampleTopics topics={exampleTopics} onSelectTopic={onSelectTopic} />

        {topicHistory.length > 0 && (
          <section className="history-section" aria-labelledby="topic-history-title">
            <label id="topic-history-title" htmlFor="topic-history-select">
              최근 입력 기록
            </label>
            <select
              id="topic-history-select"
              defaultValue=""
              onChange={(event) => {
                const selectedRecord = topicHistory.find(
                  (record) => record.id === event.target.value
                );

                if (selectedRecord) {
                  onSelectHistory(selectedRecord);
                }

                event.target.value = '';
              }}
            >
              <option value="">저장된 주제 불러오기</option>
              {topicHistory.map((record) => (
                <option key={record.id} value={record.id}>
                  {formatHistoryLabel(record)}
                </option>
              ))}
            </select>
            <p className="history-help">
              프롬프트를 만들 때마다 주제와 입력일시가 이 브라우저에 저장됩니다.
            </p>
          </section>
        )}

        <section className="poster-info-section" aria-labelledby="class-info-title">
          <div className="poster-info-heading">
            <p className="eyebrow">공통 수업 정보</p>
            <h2 id="class-info-title">모든 결과물에 표시할 정보를 입력하세요</h2>
          </div>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="event-date">수업 일자</label>
              <input
                id="event-date"
                type="date"
                value={values.eventDate}
                onChange={(event) => onChange('eventDate', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="event-time">수업 시간</label>
              <input
                id="event-time"
                type="time"
                value={values.eventTime}
                onChange={(event) => onChange('eventTime', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="instructor-name">강사명</label>
              <input
                id="instructor-name"
                type="text"
                value={values.instructorName}
                placeholder="예: 오정화 강사"
                onChange={(event) => onChange('instructorName', event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="institution-name">기관명</label>
              <input
                id="institution-name"
                type="text"
                value={values.institutionName}
                placeholder="예: 행복복지센터"
                onChange={(event) => onChange('institutionName', event.target.value)}
              />
            </div>
          </div>
        </section>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="audience">대상</label>
            <select
              id="audience"
              value={values.audience}
              onChange={(event) => onChange('audience', event.target.value)}
            >
              {audienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="material-type">자료 유형</label>
            <select
              id="material-type"
              value={values.materialType}
              onChange={(event) => onChange('materialType', event.target.value)}
            >
              {materialTypeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="aspect-ratio">이미지 비율</label>
            <select
              id="aspect-ratio"
              value={values.aspectRatio}
              onChange={(event) => onChange('aspectRatio', event.target.value)}
            >
              {aspectRatioOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="step-count">단계 수</label>
            <input
              id="step-count"
              type="number"
              min={minStepCount}
              value={values.stepCount}
              onChange={(event) => handleStepCountChange(event.target.value)}
            />
            <p className="field-help">필요한 단계 수를 자유롭게 입력할 수 있습니다.</p>
          </div>

          <div className="field">
            <label htmlFor="page-count">페이지 수</label>
            <select
              id="page-count"
              value={values.pageCount}
              onChange={(event) => onChange('pageCount', Number(event.target.value))}
            >
              {pageCountOptions.map((option) => (
                <option key={option} value={option}>
                  {option}페이지
                </option>
              ))}
            </select>
            <p className="field-help">결과 이미지를 몇 페이지로 나눌지 선택하세요.</p>
          </div>

          <div className="field full-width-field">
            <label htmlFor="purpose">용도</label>
            <select
              id="purpose"
              value={values.purpose}
              onChange={(event) => onChange('purpose', event.target.value)}
            >
              {purposeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <fieldset className="field color-field full-width-field">
            <legend>색감</legend>
            <div className="color-palette">
              {colorToneOptions.map((option) => (
                <button
                  key={option}
                  className="color-swatch-button"
                  type="button"
                  aria-pressed={values.colorTone === option}
                  onClick={() => onChange('colorTone', option)}
                >
                  <span
                    className="color-dot"
                    style={{ backgroundColor: colorSwatches[option] ?? '#dff1ff' }}
                    aria-hidden="true"
                  />
                  {option}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {showPosterFields && (
          <section className="poster-info-section" aria-labelledby="poster-info-title">
            <div className="poster-info-heading">
              <p className="eyebrow">홍보 포스터 추가 정보</p>
              <h2 id="poster-info-title">홍보물에 필요한 행사 정보를 입력하세요</h2>
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="event-place">장소</label>
                <input
                  id="event-place"
                  type="text"
                  value={values.eventPlace}
                  placeholder="예: 2층 디지털 배움실"
                  onChange={(event) => onChange('eventPlace', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="contact-info">문의</label>
                <input
                  id="contact-info"
                  type="text"
                  value={values.contactInfo}
                  placeholder="예: 02-000-0000"
                  onChange={(event) => onChange('contactInfo', event.target.value)}
                />
              </div>
              <div className="field full-width-field">
                <label htmlFor="poster-note">추가 안내</label>
                <input
                  id="poster-note"
                  type="text"
                  value={values.posterNote}
                  placeholder="예: 선착순 15명, 스마트폰 지참"
                  onChange={(event) => onChange('posterNote', event.target.value)}
                />
              </div>
            </div>
          </section>
        )}

        <div className="form-actions">
          <button className="primary-button" type="submit">
            프롬프트 만들기
          </button>
          <button className="secondary-button" type="button" onClick={onReset}>
            초기화
          </button>
        </div>
      </form>
    </section>
  );
}
