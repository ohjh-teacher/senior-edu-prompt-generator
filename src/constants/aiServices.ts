export interface AIService {
  name: string;
  category: '이미지 만들기' | '디자인 편집' | '수업 자료 정리';
  description: string;
  url: string;
  isPrimary?: boolean;
}

export const aiServiceCategories: AIService['category'][] = [
  '이미지 만들기',
  '디자인 편집',
  '수업 자료 정리',
];

export const aiServices: AIService[] = [
  {
    name: 'ChatGPT',
    category: '이미지 만들기',
    description: '이미지 생성과 문구 수정',
    url: 'https://chatgpt.com/',
    isPrimary: true,
  },
  {
    name: 'Gemini',
    category: '이미지 만들기',
    description: '이미지 생성과 대안 시안 제작',
    url: 'https://gemini.google.com/',
    isPrimary: true,
  },
  {
    name: 'Grok',
    category: '이미지 만들기',
    description: '아이디어 확장과 이미지 생성',
    url: 'https://grok.com/',
  },
  {
    name: 'Genspark',
    category: '이미지 만들기',
    description: '여러 AI 모델을 활용한 콘텐츠 제작',
    url: 'https://www.genspark.ai/',
  },
  {
    name: 'Adobe Firefly',
    category: '이미지 만들기',
    description: '상업용 이미지와 그래픽 생성',
    url: 'https://firefly.adobe.com/',
  },
  {
    name: 'Ideogram',
    category: '이미지 만들기',
    description: '글자가 들어간 이미지 시안 제작',
    url: 'https://ideogram.ai/',
  },
  {
    name: 'Canva',
    category: '디자인 편집',
    description: '완성 이미지를 피드와 포스터로 편집',
    url: 'https://www.canva.com/',
    isPrimary: true,
  },
  {
    name: 'Adobe Express',
    category: '디자인 편집',
    description: '간단한 카드뉴스와 홍보물 편집',
    url: 'https://www.adobe.com/express/',
  },
  {
    name: 'NotebookLM',
    category: '수업 자료 정리',
    description: '수업 자료 요약과 복습 노트 정리',
    url: 'https://notebooklm.google/',
  },
  {
    name: 'Gamma',
    category: '수업 자료 정리',
    description: '수업 내용을 발표 자료로 정리',
    url: 'https://gamma.app/',
  },
];
