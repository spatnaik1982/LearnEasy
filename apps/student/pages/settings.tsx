import type { NextPage } from "next";
import { AppShell, COPY } from "@learn-easy/ui";
import { useSensoryProfile } from "../lib/SensoryProfileContext";

function SettingsContent() {
  const {
    reduceMotion,
    lowContrast,
    soundEnabled,
    setReduceMotion,
    setLowContrast,
    setSoundEnabled,
  } = useSensoryProfile();

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

const Settings: NextPage = () => {
  return (
    <AppShell variant="student">
      <SettingsContent />
    </AppShell>
  );
};

export default Settings;
