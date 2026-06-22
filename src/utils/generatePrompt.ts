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

const instructorCharacterPrompt =
  '이미지에는 오정화 강사 캐릭터가 설명하고 알려주는 모습으로 등장한다. 강사 캐릭터는 짧은 갈색 단발머리, 둥근 안경, 큰 눈, 부드러운 미소, 남색 상하의, 목걸이, 손에 포인터를 든 따뜻한 디지털 강사 스타일이다. 시니어 어르신은 주인공이 아니라 수업을 듣거나 따라 하는 학습자로 필요한 경우에만 보조적으로 표현한다.';

const balancedLayoutPrompt = `[레이아웃 규칙]
모든 번호 카드의 크기를 최대한 균일하게 유지한다.
상단은 크게, 하단은 작게 배치하지 않는다.
페이지 아래로 갈수록 글자 크기나 아이콘 크기를 줄이지 않는다.
카드 간 여백(상하좌우)을 균일하게 배치한다.
페이지 전체의 밀도와 시각적 무게를 균형 있게 유지한다.
특정 영역에 내용이 몰리지 않도록 배치한다.
충분한 여백을 확보하여 답답하지 않게 구성한다.
모든 항목은 동일한 수준의 가독성을 유지한다.`;

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
  const materialTypeLabel = values.materialType.replace('단계별', '번호형');
  const firstPageEndNumber = Math.ceil(values.stepCount / 2);
  const secondPageStartNumber = firstPageEndNumber + 1;
  const firstPageRangeLabel =
    firstPageEndNumber === 1 ? '1번' : `1~${firstPageEndNumber}번`;
  const secondPageRangeLabel =
    secondPageStartNumber === values.stepCount
      ? `${secondPageStartNumber}번`
      : `${secondPageStartNumber}~${values.stepCount}번`;
  const itemLabels = Array.from(
    { length: values.stepCount },
    (_, index) => `${index + 1}`
  ).join(', ');
  const pageInstruction =
    pageCount === 2
      ? `[매우 중요]
총 2장의 이미지를 생성한다.

이미지 1:
1페이지(1/2) 전용.
${firstPageRangeLabel}만 포함한다.
${secondPageRangeLabel}은 절대 넣지 않는다.

이미지 2:
2페이지(2/2) 전용.
${secondPageRangeLabel}만 포함한다.
${firstPageRangeLabel}은 절대 넣지 않는다.

각 이미지는 독립적인 완성본이어야 한다.
하나의 이미지 안에 1/2와 2/2를 함께 배치하는 것을 금지한다.
위아래로 연결된 긴 이미지를 만드는 것을 금지한다.

[중요 제작 규칙]
1페이지(1/2)와 2페이지(2/2)는 서로 독립된 별도 이미지 파일로 제작한다.
이미지 1은 1페이지(1/2)만 포함한다.
이미지 2는 2페이지(2/2)만 포함한다.

1페이지에는 앞쪽 번호 항목을, 2페이지에는 나머지 번호 항목을 배치한다.
각 페이지의 항목 수가 비슷하도록 나누고, 각 페이지 하단에 각각 "1/2", "2/2" 페이지 표시를 넣는다.
두 페이지는 같은 디자인 톤과 레이아웃 규칙을 유지한다.
${balancedLayoutPrompt}`
      : `전체 내용을 1페이지 인포그래픽으로 구성한다.
글자가 작아지지 않도록 각 항목 문장은 짧게 유지하고 충분한 여백을 둔다.
${balancedLayoutPrompt}`;
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

  const basePrompt = `${topic}을/를 ${values.stepCount}개 번호로 설명하는 ${materialTypeLabel}.
${values.audience}도 쉽게 이해할 수 있도록 큰 아이콘과 짧은 문장을 사용한다.
각 항목은 한눈에 보이도록 번호와 간단한 행동 중심 문장으로 구성한다. 번호 표현: ${itemLabels}.
결과물의 번호 표시는 "1", "2"처럼 숫자만 사용한다.
${pageInstruction}
흰 배경, ${values.colorTone} 색감, 큼직한 버튼형 레이아웃, ${usageLabel}용 자료.
친절하고 따뜻한 분위기, 복잡한 장식 없이 가독성 높은 디자인, ${values.aspectRatio}.
${instructorCharacterPrompt}
${referenceImageLabel ? `첨부한 참고 이미지(${referenceImageLabel})는 교재, 수업 자료, 화면 예시로 간주한다. 첨부 이미지의 핵심 화면 구성, 단계 흐름, 아이콘, 버튼 위치, 설명 순서를 참고한다. 단, 첨부 이미지의 글자는 그대로 복사하지 말고 현재 수업 주제와 입력 정보에 맞게 정확하고 크게 다시 구성한다.` : ''}

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
