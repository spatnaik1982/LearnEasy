import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

interface SensoryProfile {
  reduceMotion: boolean;
  lowContrast: boolean;
  soundEnabled: boolean;
  volume: number;
}

interface SensoryProfileContextValue extends SensoryProfile {
  setReduceMotion: (v: boolean) => void;
  setLowContrast: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  setVolume: (v: number) => void;
}

const STORAGE_KEY = "learn-easy.sensory";

function loadProfile(): SensoryProfile {
  if (typeof window === "undefined")
    return { reduceMotion: false, lowContrast: false, soundEnabled: true, volume: 50 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...{ reduceMotion: false, lowContrast: false, soundEnabled: true, volume: 50 }, ...JSON.parse(stored) };
  } catch {
    /* ignore */
  }
  return { reduceMotion: false, lowContrast: false, soundEnabled: true, volume: 50 };
}

function saveProfile(profile: SensoryProfile) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    /* ignore */
  }
}

const SensoryProfileContext = createContext<SensoryProfileContextValue | null>(
  null,
);

export function SensoryProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [profile, setProfile] = useState<SensoryProfile>(loadProfile);

  useEffect(() => {
    saveProfile(profile);
    // Apply classes to html element
    document.documentElement.classList.toggle(
      "motion-reduce",
      profile.reduceMotion,
    );
    document.documentElement.classList.toggle(
      "high-contrast",
      profile.lowContrast,
    );
  }, [profile]);

  const setReduceMotion = useCallback(
    (v: boolean) => setProfile((p) => ({ ...p, reduceMotion: v })),
    [],
  );
  const setLowContrast = useCallback(
    (v: boolean) => setProfile((p) => ({ ...p, lowContrast: v })),
    [],
  );
  const setSoundEnabled = useCallback(
    (v: boolean) => setProfile((p) => ({ ...p, soundEnabled: v })),
    [],
  );
  const setVolume = useCallback(
    (v: number) => setProfile((p) => ({ ...p, volume: Math.min(100, Math.max(0, v)) })),
    [],
  );

  return (
    <SensoryProfileContext.Provider
      value={{
        ...profile,
        setReduceMotion,
        setLowContrast,
        setSoundEnabled,
        setVolume,
      }}
    >
      {children}
    </SensoryProfileContext.Provider>
  );
}

export function useSensoryProfile(): SensoryProfileContextValue {
  const ctx = useContext(SensoryProfileContext);
  if (!ctx)
    throw new Error(
      "useSensoryProfile must be used within a SensoryProfileProvider",
    );
  return ctx;
}
