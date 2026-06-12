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

function getRecordKey(values: PromptFormValues): string {
  return [values.topic.trim(), values.eventDate.trim()].join('::');
}

export function saveTopicHistoryRecord(values: PromptFormValues): TopicHistoryRecord[] {
  const normalizedValues = normalizePromptValues(values);
  const trimmedTopic = normalizedValues.topic.trim();

  if (!trimmedTopic || !canUseLocalStorage()) {
    return loadTopicHistory();
  }

  const currentHistory = loadTopicHistory();
  const currentRecord = currentHistory.find(
    (record) =>
      getRecordKey(record.values ?? { ...defaultPromptValues, topic: record.topic }) ===
      getRecordKey(normalizedValues)
  );
  const nextRecord: TopicHistoryRecord = {
    id: currentRecord?.id ?? `${Date.now()}`,
    topic: trimmedTopic,
    createdAt: new Date().toISOString(),
    values: normalizedValues,
  };

  const nextHistory = [
    nextRecord,
    ...currentHistory.filter((record) => record.id !== nextRecord.id),
  ].slice(0, MAX_HISTORY_COUNT);

  window.localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export function deleteTopicHistoryRecord(recordId: string): TopicHistoryRecord[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  const nextHistory = loadTopicHistory().filter((record) => record.id !== recordId);
  window.localStorage.setItem(TOPIC_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export function clearTopicHistory(): TopicHistoryRecord[] {
  if (!canUseLocalStorage()) {
    return [];
  }

  window.localStorage.removeItem(TOPIC_HISTORY_KEY);

  return [];
}
