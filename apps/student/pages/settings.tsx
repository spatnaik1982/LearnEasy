import type { NextPage } from "next";
import { AppShell, COPY } from "@learn-easy/ui";
import { useSensoryProfile } from "../lib/SensoryProfileContext";

const VOLUME_LEVELS = [
  { label: "Off", value: 0 },
  { label: "Low", value: 30 },
  { label: "Medium", value: 60 },
  { label: "High", value: 100 },
] as const;

function SettingsContent() {
  const {
    reduceMotion,
    lowContrast,
    soundEnabled,
    volume,
    setReduceMotion,
    setLowContrast,
    setSoundEnabled,
    setVolume,
  } = useSensoryProfile();

  const cycleVolume = () => {
    const idx = VOLUME_LEVELS.findIndex((l) => l.value === volume);
    const nextIdx = (idx + 1) % VOLUME_LEVELS.length;
    setVolume(VOLUME_LEVELS[nextIdx].value);
  };

  const currentLabel = VOLUME_LEVELS.find((l) => l.value === volume)?.label ?? "Medium";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-text">{COPY.settingsTitle}</h1>

      <ToggleRow
        label={COPY.settingsReduceMotion}
        description="Turn off animations and transitions"
        checked={reduceMotion}
        onChange={setReduceMotion}
      />

      <ToggleRow
        label={COPY.settingsLowerContrast}
        description="Increase text and border contrast for readability"
        checked={lowContrast}
        onChange={setLowContrast}
      />

      <ToggleRow
        label={COPY.settingsSound}
        description="Enable audio feedback during activities"
        checked={soundEnabled}
        onChange={setSoundEnabled}
      />

      <VolumeRow
        label="Volume"
        description="Set audio volume level"
        level={currentLabel}
        onCycle={cycleVolume}
      />
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-white p-4">
      <div>
        <p className="font-medium text-slate-text">{label}</p>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative min-h-[56px] min-w-[56px] rounded-full p-2 motion-safe:transition-colors motion-safe:duration-200 focus:outline-none focus:ring-2 focus:ring-soft-blue ${
          checked ? "bg-soft-blue" : "bg-outline-variant"
        }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow motion-safe:transition-transform motion-safe:duration-200 ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function VolumeRow({
  label,
  description,
  level,
  onCycle,
}: {
  label: string;
  description: string;
  level: string;
  onCycle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-outline-variant bg-white p-4">
      <div>
        <p className="font-medium text-slate-text">{label}</p>
        <p className="text-sm text-on-surface-variant">{description}</p>
      </div>
      <button
        onClick={onCycle}
        className="relative min-h-[56px] min-w-[56px] rounded-full bg-soft-blue p-2 text-center text-sm font-semibold text-white motion-safe:transition-colors motion-safe:duration-200 motion-safe:active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-soft-blue"
      >
        {level}
      </button>
    </div>
  );
}

const Settings: NextPage = () => {
  return (
    <AppShell variant="student">
      <SettingsContent />
    </AppShell>
  );
};

export default Settings;
