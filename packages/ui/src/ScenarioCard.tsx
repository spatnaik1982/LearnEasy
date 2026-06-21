import { cn } from "./utils";
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export interface ScenarioCardProps {
  text: string;
  visual?: string;
  collapsible?: boolean;
  readAloud?: boolean;
}

export function ScenarioCard({
  text,
  visual,
  collapsible = true,
  readAloud = true,
}: ScenarioCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis?.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div
      data-testid="scenario-card"
      className="relative rounded-lg p-4"
      style={{ backgroundColor: "#EBC06D1A" }}
    >
      {readAloud && (
        <button
          type="button"
          data-testid="read-aloud-button"
          onClick={handleReadAloud}
          className="absolute top-3 right-3 flex items-center justify-center rounded-lg border bg-white"
          style={{
            width: "56px",
            height: "56px",
            borderColor: "#E5E7EB",
          }}
          aria-label={isSpeaking ? "Stop reading aloud" : "Read aloud"}
        >
          {isSpeaking ? (
            <VolumeX style={{ color: "#5D87B1" }} size={20} />
          ) : (
            <Volume2 style={{ color: "#5D87B1" }} size={20} />
          )}
        </button>
      )}

      <div
        data-testid="scenario-content"
        className={cn(isExpanded ? "block" : "hidden")}
      >
        {visual && (
          <span
            data-testid="scenario-visual"
            style={{ fontSize: "48px" }}
            aria-hidden="true"
          >
            {visual}
          </span>
        )}
        <p
          className="text-left"
          style={{
            fontSize: "16px",
            fontWeight: 400,
            color: "#374151",
            paddingRight: readAloud ? "3.5rem" : undefined,
          }}
        >
          {text}
        </p>
      </div>

      {collapsible && (
        <button
          type="button"
          data-testid="collapse-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm bg-transparent border-none cursor-pointer"
          style={{ color: "#5D87B1" }}
        >
          {isExpanded ? "Hide Story" : "Show Story"}
        </button>
      )}
    </div>
  );
}
