import type { PromptFormValues } from '../types/prompt';

export const audienceOptions = [
  '60대 이상 어르신',
  '스마트폰 초보자',
  '복지관 수강생',
  '디지털 기기 사용이 익숙하지 않은 분',
];

export const materialTypeOptions = [
  '교육용 인포그래픽',
  '단계별 안내 카드',
  '수업용 포스터',
  '홍보 포스터',
  '강의 슬라이드 이미지',
];

export const colorToneOptions = [
  '파스텔 블루',
  '따뜻한 민트',
  '밝은 라벤더',
  '부드러운 옐로우',
];

export const aspectRatioOptions = [
  '세로형 9:16',
  '가로형 16:9',
  '정사각형 1:1',
  '인스타그램 피드 4:5',
  'A4 세로형',
];

export const minStepCount = 1;

export const pageCountOptions = [1, 2];

export const purposeOptions = [
  '수업 결과 공유',
  '수강생 복습 안내',
  '인스타그램 피드',
  '복지관 홍보 게시물',
  '강의 화면 공유',
  '인쇄용 안내 자료',
];

export const exampleTopics = [
  'QR코드 찍는 법',
  '카카오톡 사진 보내기',
  '네이버 지도 길찾기',
  '키오스크 주문하기',
  'AI로 여행 계획 세우기',
  '스마트폰 글자 크게 보기',
  '와이파이 연결하기',
  '스마트폰 사진 정리하기',
  '유튜브 영상 검색하기',
  '문자 메시지 보내기',
  '스팸 문자 구별하기',
  '보이스피싱 예방하기',
  '스마트폰 배터리 오래 쓰기',
  '앱 설치하고 삭제하기',
  '카카오톡 친구 추가하기',
  '카카오톡 단체방 알림 끄기',
  '사진에 글씨 넣기',
  '병원 예약 앱 사용하기',
  '모바일 신분증 확인하기',
  '버스 도착 시간 확인하기',
  '택시 호출 앱 사용하기',
  '온라인 장보기 주문하기',
  '계좌 이체 전 확인하기',
  '스마트폰 화면 캡처하기',
  '음성으로 검색하기',
  '구글 번역 앱 사용하기',
  '날씨 앱으로 미세먼지 확인하기',
  '사진을 가족에게 공유하기',
  '스마트폰 용량 비우기',
  'AI에게 질문하는 법',
];

export const defaultPromptValues: PromptFormValues = {
  topic: '',
  referenceImageNames: [],
  audience: '60대 이상 어르신',
  materialType: '교육용 인포그래픽',
  colorTone: '파스텔 블루',
  aspectRatio: '인스타그램 피드 4:5',
  stepCount: 3,
  pageCount: 1,
  institutionName: '복지관',
  purpose: '수업 결과 공유',
  eventDate: '',
  eventTime: '',
  eventPlace: '',
  instructorName: '',
  contactInfo: '',
  posterNote: '',
};
