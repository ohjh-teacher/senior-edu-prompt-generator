import { useEffect, useState } from 'react';
import { AIServiceLinks } from './components/AIServiceLinks';
import { PromptForm } from './components/PromptForm';
import { PromptResult } from './components/PromptResult';
import { defaultPromptValues, exampleTopics } from './constants/options';
import type { PromptFormValues, TopicHistoryRecord } from './types/prompt';
import { copyToClipboard } from './utils/copyToClipboard';
import { generatePrompt } from './utils/generatePrompt';
import { loadTopicHistory, saveTopicHistoryRecord } from './utils/topicHistory';

interface ReferenceImagePreview {
  id: string;
  name: string;
  url: string;
}

function App() {
  const [formValues, setFormValues] = useState<PromptFormValues>(defaultPromptValues);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [topicHistory, setTopicHistory] = useState<TopicHistoryRecord[]>([]);
  const [referenceImagePreviews, setReferenceImagePreviews] = useState<
    ReferenceImagePreview[]
  >([]);

  useEffect(() => {
    setTopicHistory(loadTopicHistory());
  }, []);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const updateValue = <K extends keyof PromptFormValues>(
    key: K,
    value: PromptFormValues[K]
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));

    if (key === 'topic' && String(value).trim()) {
      setErrorMessage('');
    }
  };

  const handleSelectTopic = (topic: string) => {
    updateValue('topic', topic);
  };

  const handleSelectHistory = (record: TopicHistoryRecord) => {
    setFormValues(record.values ?? { ...defaultPromptValues, topic: record.topic });
    setGeneratedPrompt('');
    setErrorMessage('');
    setCopied(false);
    setReferenceImagePreviews([]);
  };

  const handleReferenceImagesAdd = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      return;
    }

    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== 'string') {
          return;
        }

        setReferenceImagePreviews((currentPreviews) => {
          const nextPreviews = [
            ...currentPreviews,
            {
              id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
              name: file.name,
              url: reader.result as string,
            },
          ];

          updateValue(
            'referenceImageNames',
            nextPreviews.map((preview) => preview.name)
          );

          return nextPreviews;
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReferenceImageRemove = (imageId: string) => {
    setReferenceImagePreviews((currentPreviews) => {
      const nextPreviews = currentPreviews.filter((preview) => preview.id !== imageId);
      updateValue(
        'referenceImageNames',
        nextPreviews.map((preview) => preview.name)
      );
      return nextPreviews;
    });
  };

  const handleReferenceImagesClear = () => {
    setReferenceImagePreviews([]);
    updateValue('referenceImageNames', []);
  };

  const handleGeneratePrompt = () => {
    if (!formValues.topic.trim()) {
      setGeneratedPrompt('');
      setErrorMessage('주제를 입력해주세요');
      return;
    }

    setErrorMessage('');
    setTopicHistory(saveTopicHistoryRecord(formValues));
    setGeneratedPrompt(generatePrompt(formValues));
  };

  const handleReset = () => {
    setFormValues(defaultPromptValues);
    setGeneratedPrompt('');
    setErrorMessage('');
    setCopied(false);
    setReferenceImagePreviews([]);
  };

  const handleCopy = async () => {
    const copySucceeded = await copyToClipboard(generatedPrompt);
    setCopied(copySucceeded);
    return copySucceeded;
  };

  return (
    <main className="app-shell">
      <PromptForm
        values={formValues}
        exampleTopics={exampleTopics}
        topicHistory={topicHistory}
        errorMessage={errorMessage}
        onChange={updateValue}
        referenceImagePreviews={referenceImagePreviews}
        onReferenceImagesAdd={handleReferenceImagesAdd}
        onReferenceImageRemove={handleReferenceImageRemove}
        onReferenceImagesClear={handleReferenceImagesClear}
        onSelectTopic={handleSelectTopic}
        onSelectHistory={handleSelectHistory}
        onSubmit={handleGeneratePrompt}
        onReset={handleReset}
      />
      <div className="right-column">
        <PromptResult prompt={generatedPrompt} copied={copied} onCopy={handleCopy} />
        <AIServiceLinks prompt={generatedPrompt} onCopy={handleCopy} />
      </div>
    </main>
  );
}

export default App;
