import { defaultPromptValues } from '../constants/options';
import type { PromptFormValues, TopicHistoryRecord } from '../types/prompt';

const TOPIC_HISTORY_KEY = 'today-class-ai-topic-history';
const MAX_HISTORY_COUNT = 30;
const FIREBASE_PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;
const FIREBASE_COLLECTION = 'topicHistory';

interface FirestoreDocument {
  name: string;
  fields?: {
    topic?: { stringValue?: string };
    createdAt?: { timestampValue?: string; stringValue?: string };
    recordKey?: { stringValue?: string };
    valuesJson?: { stringValue?: string };
  };
}

interface FirestoreListResponse {
  documents?: FirestoreDocument[];
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function shouldUseFirestore() {
  return Boolean(FIREBASE_PROJECT_ID && FIREBASE_API_KEY);
}

function getFirestoreBaseUrl() {
  return `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${FIREBASE_COLLECTION}`;
}

function getFirestoreUrl(path = '') {
  const baseUrl = path ? `${getFirestoreBaseUrl()}/${path}` : getFirestoreBaseUrl();
  return `${baseUrl}?key=${FIREBASE_API_KEY}`;
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

function normalizeTopicHistoryRecord(record: Partial<TopicHistoryRecord>): TopicHistoryRecord | null {
  if (
    typeof record.id !== 'string' ||
    typeof record.topic !== 'string' ||
    typeof record.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: record.id,
    topic: record.topic,
    createdAt: record.createdAt,
    values: record.values ? normalizePromptValues(record.values) : undefined,
  };
}

function sortByCreatedAtDesc(records: TopicHistoryRecord[]) {
  return [...records].sort(
    (firstRecord, secondRecord) =>
      new Date(secondRecord.createdAt).getTime() - new Date(firstRecord.createdAt).getTime()
  );
}

function getRecordKey(values: PromptFormValues): string {
  return [values.topic.trim(), values.eventDate.trim()].join('::');
}

function getRecordKeyFromRecord(record: TopicHistoryRecord): string {
  return getRecordKey(record.values ?? { ...defaultPromptValues, topic: record.topic });
}

function loadLocalTopicHistory(): TopicHistoryRecord[] {
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
      .map((record) => normalizeTopicHistoryRecord(record))
      .filter((record): record is TopicHistoryRecord => Boolean(record));
  } catch {
    return [];
  }
}

function persistLocalTopicHistory(records: TopicHistoryRecord[]) {
  if (!canUseLocalStorage()) {
    return;
  }

  window.localStorage.setItem(
    TOPIC_HISTORY_KEY,
    JSON.stringify(sortByCreatedAtDesc(records).slice(0, MAX_HISTORY_COUNT))
  );
}

function saveLocalTopicHistoryRecord(values: PromptFormValues): TopicHistoryRecord[] {
  const normalizedValues = normalizePromptValues(values);
  const trimmedTopic = normalizedValues.topic.trim();

  if (!trimmedTopic || !canUseLocalStorage()) {
    return loadLocalTopicHistory();
  }

  const currentHistory = loadLocalTopicHistory();
  const currentRecord = currentHistory.find(
    (record) => getRecordKeyFromRecord(record) === getRecordKey(normalizedValues)
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

  persistLocalTopicHistory(nextHistory);

  return nextHistory;
}

function deleteLocalTopicHistoryRecord(recordId: string): TopicHistoryRecord[] {
  const nextHistory = loadLocalTopicHistory().filter((record) => record.id !== recordId);
  persistLocalTopicHistory(nextHistory);

  return nextHistory;
}

function clearLocalTopicHistory(): TopicHistoryRecord[] {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(TOPIC_HISTORY_KEY);
  }

  return [];
}

function getDocumentId(documentName: string) {
  const documentPathParts = documentName.split('/');
  return documentPathParts[documentPathParts.length - 1] ?? documentName;
}

function fromFirestoreDocument(document: FirestoreDocument): TopicHistoryRecord | null {
  const valuesJson = document.fields?.valuesJson?.stringValue;

  if (!valuesJson) {
    return null;
  }

  try {
    const parsedValues = normalizePromptValues(
      JSON.parse(valuesJson) as Partial<PromptFormValues>
    );
    return normalizeTopicHistoryRecord({
      id: getDocumentId(document.name),
      topic: document.fields?.topic?.stringValue,
      createdAt:
        document.fields?.createdAt?.timestampValue ??
        document.fields?.createdAt?.stringValue,
      values: parsedValues,
    });
  } catch {
    return null;
  }
}

async function loadFirestoreTopicHistory(): Promise<TopicHistoryRecord[]> {
  const response = await fetch(getFirestoreUrl());

  if (!response.ok) {
    throw new Error('Firestore topic history load failed');
  }

  const data = (await response.json()) as FirestoreListResponse;

  return sortByCreatedAtDesc(
    (data.documents ?? [])
      .map((document) => fromFirestoreDocument(document))
      .filter((record): record is TopicHistoryRecord => Boolean(record))
  ).slice(0, MAX_HISTORY_COUNT);
}

async function saveFirestoreDocument(record: TopicHistoryRecord, isUpdate: boolean) {
  const body = {
    fields: {
      topic: { stringValue: record.topic },
      createdAt: { timestampValue: record.createdAt },
      recordKey: { stringValue: getRecordKeyFromRecord(record) },
      valuesJson: { stringValue: JSON.stringify(record.values ?? defaultPromptValues) },
    },
  };

  if (isUpdate) {
    const response = await fetch(getFirestoreUrl(record.id), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error('Firestore topic history update failed');
    }

    return;
  }

  const response = await fetch(`${getFirestoreUrl()}&documentId=${record.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Firestore topic history create failed');
  }
}

async function deleteFirestoreDocument(recordId: string) {
  const response = await fetch(getFirestoreUrl(recordId), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Firestore topic history delete failed');
  }
}

async function saveFirestoreTopicHistoryRecord(
  values: PromptFormValues
): Promise<TopicHistoryRecord[]> {
  const normalizedValues = normalizePromptValues(values);
  const trimmedTopic = normalizedValues.topic.trim();

  if (!trimmedTopic) {
    return loadFirestoreTopicHistory();
  }

  const currentHistory = await loadFirestoreTopicHistory();
  const currentRecord = currentHistory.find(
    (record) => getRecordKeyFromRecord(record) === getRecordKey(normalizedValues)
  );
  const nextRecord: TopicHistoryRecord = {
    id: currentRecord?.id ?? `${Date.now()}`,
    topic: trimmedTopic,
    createdAt: new Date().toISOString(),
    values: normalizedValues,
  };

  await saveFirestoreDocument(nextRecord, Boolean(currentRecord));

  const nextHistory = sortByCreatedAtDesc([
    nextRecord,
    ...currentHistory.filter((record) => record.id !== nextRecord.id),
  ]);

  await Promise.all(
    nextHistory
      .slice(MAX_HISTORY_COUNT)
      .map((record) => deleteFirestoreDocument(record.id).catch(() => undefined))
  );

  return nextHistory.slice(0, MAX_HISTORY_COUNT);
}

async function deleteFirestoreTopicHistoryRecord(
  recordId: string
): Promise<TopicHistoryRecord[]> {
  await deleteFirestoreDocument(recordId);

  return loadFirestoreTopicHistory();
}

async function clearFirestoreTopicHistory(): Promise<TopicHistoryRecord[]> {
  const currentHistory = await loadFirestoreTopicHistory();
  await Promise.all(
    currentHistory.map((record) => deleteFirestoreDocument(record.id).catch(() => undefined))
  );

  return [];
}

export async function loadTopicHistory(): Promise<TopicHistoryRecord[]> {
  if (!shouldUseFirestore()) {
    return loadLocalTopicHistory();
  }

  try {
    return await loadFirestoreTopicHistory();
  } catch {
    return loadLocalTopicHistory();
  }
}

export async function saveTopicHistoryRecord(
  values: PromptFormValues
): Promise<TopicHistoryRecord[]> {
  if (!shouldUseFirestore()) {
    return saveLocalTopicHistoryRecord(values);
  }

  try {
    const nextHistory = await saveFirestoreTopicHistoryRecord(values);
    persistLocalTopicHistory(nextHistory);
    return nextHistory;
  } catch {
    return saveLocalTopicHistoryRecord(values);
  }
}

export async function deleteTopicHistoryRecord(
  recordId: string
): Promise<TopicHistoryRecord[]> {
  if (!shouldUseFirestore()) {
    return deleteLocalTopicHistoryRecord(recordId);
  }

  try {
    const nextHistory = await deleteFirestoreTopicHistoryRecord(recordId);
    persistLocalTopicHistory(nextHistory);
    return nextHistory;
  } catch {
    return deleteLocalTopicHistoryRecord(recordId);
  }
}

export async function clearTopicHistory(): Promise<TopicHistoryRecord[]> {
  if (!shouldUseFirestore()) {
    return clearLocalTopicHistory();
  }

  try {
    const nextHistory = await clearFirestoreTopicHistory();
    persistLocalTopicHistory(nextHistory);
    return nextHistory;
  } catch {
    return clearLocalTopicHistory();
  }
}
