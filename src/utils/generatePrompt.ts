import type { PromptFormValues } from '../types/prompt';

function compactInfo(label: string, value: string): string | null {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return `${label}: ${trimmedValue}`;
}

function formatDate(value: string): string {
  if (!value) {
    return '';
  }

  const [year, month, day] = value.split('-');

  if (!year || !month || !day) {
    return value;
  }

  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatTime(value: string): string {
  if (!value) {
    return '';
  }

  const [hourValue, minuteValue] = value.split(':');
  const hour = Number(hourValue);
  const minute = Number(minuteValue);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return value;
  }

  const period = hour < 12 ? '오전' : '오후';
  const twelveHour = hour % 12 === 0 ? 12 : hour % 12;
  const minuteLabel = minute === 0 ? '' : ` ${minute}분`;

  return `${period} ${twelveHour}시${minuteLabel}`;
}

export function generatePrompt(values: PromptFormValues): string {
  const topic = values.topic.trim();
  const referenceImageNames = values.referenceImageNames
    .map((name) => name.trim())
    .filter(Boolean);
  const referenceImageLabel = referenceImageNames.join(', ');
  const institutionName = values.institutionName.trim();
  const purpose = values.purpose.trim();
  const usageLabel = [institutionName, purpose].filter(Boolean).join(' ');
  const pageCount = values.pageCount === 2 ? 2 : 1;
  const stepLabels = Array.from(
    { length: values.stepCount },
    (_, index) => `${index + 1}단계`
  ).join(', ');
  const pageInstruction =
    pageCount === 2
      ? `전체 내용을 2페이지 인포그래픽으로 구성한다.
1페이지에는 앞부분 단계를, 2페이지에는 나머지 단계를 배치한다.
각 페이지의 단계 수가 비슷하도록 나누고, 각 페이지 하단에 "1/2", "2/2" 페이지 표시를 넣는다.
두 페이지는 같은 디자인 톤과 레이아웃 규칙을 유지한다.`
      : `전체 내용을 1페이지 인포그래픽으로 구성한다.
글자가 작아지지 않도록 각 단계 문장은 짧게 유지하고 충분한 여백을 둔다.`;
  const classDateTime = [formatDate(values.eventDate), formatTime(values.eventTime)]
    .filter(Boolean)
    .join(' ');
  const isPromotionPoster = values.materialType === '홍보 포스터';
  const commonClassInfo = [
    compactInfo('수업 일자', classDateTime),
    compactInfo('강사명', values.instructorName),
    compactInfo('기관명', values.institutionName),
  ].filter(Boolean);
  const posterInfo = [
    ...commonClassInfo,
    compactInfo('장소', values.eventPlace),
    compactInfo('문의', values.contactInfo),
    compactInfo('추가 안내', values.posterNote),
  ].filter(Boolean);

  const basePrompt = `${topic}을/를 ${values.stepCount}단계로 설명하는 ${values.materialType}.
${values.audience}도 쉽게 이해할 수 있도록 큰 아이콘과 짧은 문장을 사용한다.
각 단계는 한눈에 보이도록 번호와 간단한 행동 중심 문장으로 구성한다. 단계 표현: ${stepLabels}.
${pageInstruction}
흰 배경, ${values.colorTone} 색감, 큼직한 버튼형 레이아웃, ${usageLabel}용 자료.
친절하고 따뜻한 분위기, 복잡한 장식 없이 가독성 높은 디자인, ${values.aspectRatio}.
${referenceImageLabel ? `첨부한 참고 이미지(${referenceImageLabel})의 핵심 화면, 아이콘, 분위기를 참고하되 글자는 새로 정확하게 구성한다.` : ''}

결과물 하단 또는 잘 보이는 영역에 아래 수업 정보를 정확히 표시한다.
${commonClassInfo.length > 0 ? commonClassInfo.join('\n') : '입력된 수업 정보 없음'}
수업 일자, 강사명, 기관명은 입력된 내용만 사용하고 임의로 만들지 않는다.
정보가 비어 있는 항목은 결과물에 넣지 않는다.`;

  if (!isPromotionPoster) {
    return basePrompt;
  }

  return `${basePrompt}

홍보 포스터에는 아래 행사 정보도 함께 정확히 표시한다.
${posterInfo.length > 0 ? posterInfo.join('\n') : '입력된 행사 정보 없음'}
장소, 문의, 추가 안내는 입력된 내용만 사용하고 임의로 만들지 않는다.`;
}
