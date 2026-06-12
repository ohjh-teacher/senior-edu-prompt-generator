interface ExampleTopicsProps {
  topics: string[];
  onSelectTopic: (topic: string) => void;
}

export function ExampleTopics({ topics, onSelectTopic }: ExampleTopicsProps) {
  return (
    <section className="example-section" aria-labelledby="example-topics-title">
      <label id="example-topics-title" htmlFor="example-topic-select">
        예시 주제 선택
      </label>
      <select
        id="example-topic-select"
        defaultValue=""
        onChange={(event) => {
          if (event.target.value) {
            onSelectTopic(event.target.value);
          }
        }}
      >
        <option value="" disabled>
          예시 주제를 선택하세요
        </option>
        {topics.map((topic) => (
          <option key={topic} value={topic}>
            {topic}
          </option>
        ))}
      </select>
    </section>
  );
}
