import { defaultPromptValues } from '../constants/options';
import type { PromptFormValues, TopicHistoryRecord } from '../types/prompt';

const TOPIC_HISTORY_KEY = 'today-class-ai-topic-history';
const MAX_HISTORY_COUNT = 30;

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

export function loadTopicHistory(): TopicHistoryRecord[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  try {
    const savedValue = window.localStorage.getItem(TOPIC_HISTORY_KEY);
    if (!savedValue) {
      return [];
    }

    const parsedValue = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .filter(
        (record): record is TopicHistoryRecord =>
        typeof record?.id === 'string' &&
        typeof record?.topic === 'string' &&
        typeof record?.createdAt === 'string'
      )
      .map((record) => ({
        ...record,
        values: record.values ? normalizePromptValues(record.values) : undefined,
      }));
  } catch {
    return [];
  }
}

function normalizePromptValues(values: Partial<PromptFormValues>): PromptFormValues {
  return {
    ...defaultPromptValues,
    ...values,
    topic: values.topic?.trim() ?? defaultPromptValues.topic,
    referenceImageNames: Array.isArray(values.referenceImageNames)
      ? values.referenceImageNames
      : [],
    stepCount:
      typeof values.stepCount === 'number' && Number.isFinite(values.stepCount)
        ? Math.max(1, values.stepCount)
        : defaultPromptValues.stepCount,
    pageCount: values.pageCount === 2 ? 2 : 1,
  };
}

export function saveTopicHistoryRecord(values: PromptFormValues): TopicHistoryRecord[] {
  const normalizedValues = normalizePromptValues(values);
  const trimmedTopic = normalizedValues.topic.trim();

  if (!trimmedTopic || !canUseLocalStorage()) {
    return loadTopicHistory();
  }

  const nextRecord: TopicHistoryRecord = {
    id: `${Date.now()}`,
    topic: trimmedTopic,
    createdAt: new Date().toISOString(),
    values: normalizedValues,
  };

  const nextHistory = [nextRecord, ...loadTopicHistory()].slice(0, MAX_HISTORY_COUNT);

  window.localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}
