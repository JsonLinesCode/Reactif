import AsyncStorage from "@react-native-async-storage/async-storage";

export type SoundAssetName =
  | "metronomeTickWav"
  | "metronomeTickMp3"
  | "beep"
  | "beepShock"
  | "beep2"
  | "beep3"
  | "beep4";

export type TimerSoundKind =
  | "shock"
  | "adrenaline"
  | "cordarone"
  | "generic";

export type ReminderSoundKind = "first" | "mid" | "end";
export type SoundSlot = "tick" | `${TimerSoundKind}.${ReminderSoundKind}`;

export const SOUND_ASSET_OPTIONS: {
  name: SoundAssetName;
  label: string;
}[] = [
  { name: "metronomeTickWav", label: "Métronome tick (WAV)" },
  { name: "metronomeTickMp3", label: "Métronome tick (MP3)" },
  { name: "beep", label: "Beep standard" },
  { name: "beepShock", label: "Beep fin de timer" },
  { name: "beep2", label: "Beep 2" },
  { name: "beep3", label: "Beep 3" },
  { name: "beep4", label: "Beep 4" },
];

export const TIMER_SOUND_OPTIONS: {
  kind: TimerSoundKind;
  label: string;
}[] = [
  { kind: "shock", label: "Analyse / choc" },
  { kind: "adrenaline", label: "Adrénaline" },
  { kind: "cordarone", label: "Cordarone" },
  { kind: "generic", label: "Autres alertes" },
];

export const REMINDER_SOUND_OPTIONS: {
  kind: ReminderSoundKind;
  label: string;
}[] = [
  { kind: "first", label: "Première alerte" },
  { kind: "mid", label: "Rappel" },
  { kind: "end", label: "Fin de timer" },
];

export const METRONOME_SOUND_SLOT: SoundSlot = "tick";

export function makeTimerSoundSlot(
  timerKind: TimerSoundKind,
  reminderKind: ReminderSoundKind,
): SoundSlot {
  return `${timerKind}.${reminderKind}`;
}

function buildDefaultSoundChoices() {
  const defaults = {
    tick: "metronomeTickWav",
  } as Record<SoundSlot, SoundAssetName>;

  for (const { kind: timerKind } of TIMER_SOUND_OPTIONS) {
    defaults[makeTimerSoundSlot(timerKind, "first")] = "beep";
    defaults[makeTimerSoundSlot(timerKind, "mid")] = "beep";
    defaults[makeTimerSoundSlot(timerKind, "end")] = "beepShock";
  }

  return defaults;
}

export const DEFAULT_SOUND_CHOICES = buildDefaultSoundChoices();

export const SOUND_SLOT_OPTIONS: {
  slot: SoundSlot;
  label: string;
}[] = [
  { slot: METRONOME_SOUND_SLOT, label: "Métronome" },
  ...TIMER_SOUND_OPTIONS.flatMap(({ kind: timerKind, label: timerLabel }) =>
    REMINDER_SOUND_OPTIONS.map(({ kind: reminderKind, label }) => ({
      slot: makeTimerSoundSlot(timerKind, reminderKind),
      label: `${timerLabel} - ${label}`,
    })),
  ),
];

const STORAGE_KEY_SOUND_CHOICES = "@cpr_settings_sound_choices";
const SOUND_ASSET_NAMES = new Set(SOUND_ASSET_OPTIONS.map((item) => item.name));
const SOUND_SLOTS = SOUND_SLOT_OPTIONS.map((item) => item.slot);

export function getSoundAssetLabel(name: SoundAssetName) {
  return SOUND_ASSET_OPTIONS.find((item) => item.name === name)?.label ?? name;
}

function getLegacySlotCandidate(
  source: Partial<Record<string, unknown>>,
  slot: SoundSlot,
) {
  if (slot === "tick") return source.tick;
  if (slot.endsWith(".first")) return source.firstReminder;
  if (slot.endsWith(".mid")) return source.midReminder;
  if (slot.endsWith(".end")) return source.timerEnd;
  return undefined;
}

function normalizeSoundChoices(value: unknown) {
  const source =
    value && typeof value === "object"
      ? (value as Partial<Record<string, unknown>>)
      : {};
  const normalized = { ...DEFAULT_SOUND_CHOICES };

  for (const slot of SOUND_SLOTS) {
    const candidate = source[slot] ?? getLegacySlotCandidate(source, slot);
    if (
      typeof candidate === "string" &&
      SOUND_ASSET_NAMES.has(candidate as SoundAssetName)
    ) {
      normalized[slot] = candidate as SoundAssetName;
    }
  }

  return normalized;
}

export async function getSoundChoices() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_SOUND_CHOICES);
    return normalizeSoundChoices(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_SOUND_CHOICES };
  }
}

export async function saveSoundChoice(
  slot: SoundSlot,
  assetName: SoundAssetName,
) {
  const next = {
    ...(await getSoundChoices()),
    [slot]: assetName,
  };
  await AsyncStorage.setItem(STORAGE_KEY_SOUND_CHOICES, JSON.stringify(next));
  return next;
}

export async function resetSoundChoice(slot: SoundSlot) {
  const next = {
    ...(await getSoundChoices()),
    [slot]: DEFAULT_SOUND_CHOICES[slot],
  };
  await AsyncStorage.setItem(STORAGE_KEY_SOUND_CHOICES, JSON.stringify(next));
  return next;
}

export async function resetSoundChoices() {
  await AsyncStorage.removeItem(STORAGE_KEY_SOUND_CHOICES);
  return { ...DEFAULT_SOUND_CHOICES };
}
