import { useState } from 'react';
import { aiServiceCategories, aiServices } from '../constants/aiServices';

interface AIServiceLinksProps {
  prompt: string;
  onCopy: () => Promise<boolean>;
}

export function AIServiceLinks({ prompt, onCopy }: AIServiceLinksProps) {
  const [showAll, setShowAll] = useState(false);
  const hasPrompt = prompt.trim().length > 0;
  const visibleServices = showAll
    ? aiServices
    : aiServices.filter((service) => service.isPrimary);

  const openService = async (serviceUrl: string) => {
    if (!hasPrompt) {
      return;
    }

    await onCopy();
    window.open(serviceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="ai-service-panel" aria-labelledby="ai-service-title">
      <div className="panel-heading compact-heading">
        <p className="eyebrow">AI 서비스 연결</p>
        <h2 id="ai-service-title">복사 후 AI에서 만들기</h2>
        <p className="intro">
          프롬프트를 복사한 뒤 원하는 AI 서비스로 이동합니다.
        </p>
      </div>

      <div className="service-group-list">
        {aiServiceCategories.map((category) => {
          const servicesInCategory = visibleServices.filter(
            (service) => service.category === category
          );

          if (servicesInCategory.length === 0) {
            return null;
          }

          return (
            <div className="service-group" key={category}>
              <h3>{category}</h3>
              <div className="service-button-list">
                {servicesInCategory.map((service) => (
                  <button
                    className="service-link-button"
                    key={service.name}
                    type="button"
                    onClick={() => openService(service.url)}
                    disabled={!hasPrompt}
                  >
                    <span className="service-name">{service.name}</span>
                    <span className="service-description">{service.description}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="secondary-button service-toggle-button"
        type="button"
        onClick={() => setShowAll((currentValue) => !currentValue)}
      >
        {showAll ? '자주 쓰는 AI만 보기' : 'AI 더 보기'}
      </button>

      {!hasPrompt && (
        <p className="service-help">먼저 프롬프트를 만든 뒤 AI 서비스로 이동할 수 있습니다.</p>
      )}
    </section>
  );
}
