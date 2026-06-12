export interface PromptFormValues {
  topic: string;
  referenceImageNames: string[];
  audience: string;
  materialType: string;
  colorTone: string;
  aspectRatio: string;
  stepCount: number;
  pageCount: number;
  institutionName: string;
  purpose: string;
  eventDate: string;
  eventTime: string;
  eventPlace: string;
  instructorName: string;
  contactInfo: string;
  posterNote: string;
}

export interface TopicHistoryRecord {
  id: string;
  topic: string;
  createdAt: string;
  values?: PromptFormValues;
}
