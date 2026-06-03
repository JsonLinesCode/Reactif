import { CprEvent, CprSession } from "@/models/session";
import {
  formatLocalizedDate,
  formatLocalizedTime,
  t,
} from "@/i18n";

interface EventWithCycle {
  event: CprEvent;
  cycle: number;
}

export interface CprEpisodeSummary {
  cycle: number;
  startTime: number;
  endTime: number;
  shock: CprEvent[];
  adrenaline: CprEvent[];
  cordarone: CprEvent[];
}

function isRacsEvent(event: CprEvent): boolean {
  return (
    event.type === "event" &&
    String(event.details || "").toUpperCase() === "RACS"
  );
}

function isResumeEvent(event: CprEvent): boolean {
  return (
    event.type === "event" &&
    String(event.details || "").toUpperCase() === "RESUME"
  );
}

export function formatSecondsToClock(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatDuration(startTime: number, endTime?: number): string {
  if (!endTime || endTime < startTime) {
    return "00:00";
  }
  const diffSeconds = Math.floor((endTime - startTime) / 1000);
  return formatSecondsToClock(diffSeconds);
}

export function formatHumanReadableTime(timestamp: number): string {
  return formatLocalizedTime(timestamp, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatTimeWithLetters(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function formatHumanReadableDateTime(timestamp: number): string {
  return `${formatHumanReadableTime(timestamp)}`;
}

export function formatElapsedFromStart(
  startTimestamp: number,
  eventTimestamp: number,
): string {
  const elapsedSeconds = Math.max(
    0,
    Math.floor((eventTimestamp - startTimestamp) / 1000),
  );
  return formatSecondsToClock(elapsedSeconds);
}

export function formatEventType(type: CprEvent["type"]): string {
  switch (type) {
    case "shock":
      return t("session.shock");
    case "analysis":
      return t("session.analysis");
    case "cordarone":
      return t("session.cordarone");
    case "adrenaline":
      return t("session.adrenaline");
    case "event":
      return t("session.event");
    case "cpr_end":
      return t("session.cprEnd");
    default:
      return type;
  }
}

export function formatEventDetails(details: unknown): string {
  if (details === undefined || details === null || details === "") {
    return "-";
  }
  if (typeof details === "string") {
    return details;
  }
  try {
    return JSON.stringify(details);
  } catch {
    return String(details);
  }
}

export function getEventsWithCycles(session: CprSession): EventWithCycle[] {
  const sortedEvents = [...session.events].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const eventsWithCycles: EventWithCycle[] = [];
  let cycle = 1;

  for (const event of sortedEvents) {
    eventsWithCycles.push({ event, cycle });
    if (isRacsEvent(event)) {
      cycle += 1;
    }
  }

  return eventsWithCycles;
}

const createEmptyActions = () => ({
  shock: [] as CprEvent[],
  adrenaline: [] as CprEvent[],
  cordarone: [] as CprEvent[],
});

export function getCprEpisodeSummaries(
  session: CprSession,
): CprEpisodeSummary[] {
  const sortedEvents = [...session.events].sort(
    (a, b) => a.timestamp - b.timestamp,
  );
  const summaries: CprEpisodeSummary[] = [];
  let cycle = 1;
  let cycleStartTime = session.startTime;
  let actions = createEmptyActions();

  for (const event of sortedEvents) {
    if (isResumeEvent(event)) {
      cycleStartTime = event.timestamp;
      actions = createEmptyActions();
      continue;
    }

    if (event.type === "shock") {
      actions.shock.push(event);
    } else if (event.type === "adrenaline") {
      actions.adrenaline.push(event);
    } else if (event.type === "cordarone") {
      actions.cordarone.push(event);
    }

    if (isRacsEvent(event)) {
      summaries.push({
        cycle,
        startTime: cycleStartTime,
        endTime: event.timestamp,
        shock: [...actions.shock],
        adrenaline: [...actions.adrenaline],
        cordarone: [...actions.cordarone],
      });
      cycle += 1;
      cycleStartTime = event.timestamp;
      actions = createEmptyActions();
    }
  }

  return summaries;
}

export function getCprDurationMs(session: CprSession): number {
  const summaries = getCprEpisodeSummaries(session);
  if (summaries.length > 0) {
    return summaries.reduce(
      (total, episode) => total + episode.endTime - episode.startTime,
      0,
    );
  }

  return session.endTime ? Math.max(0, session.endTime - session.startTime) : 0;
}

export function getCurrentCycleElapsedSeconds(
  session: CprSession | null,
  now: number,
): number {
  if (!session) return 0;

  const sortedEvents = [...session.events].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  let cycleStart = session.startTime;
  for (const event of sortedEvents) {
    if (isResumeEvent(event)) {
      cycleStart = event.timestamp;
    }
  }

  const rawEnd = session.endTime ?? now;
  const elapsedMs = Math.max(0, rawEnd - cycleStart);
  return Math.floor(elapsedMs / 1000);
}

export function generateSessionHtml(session: CprSession): string {
  const eventsWithCycles = getEventsWithCycles(session);
  const eventsHtml = eventsWithCycles
    .map(
      ({ event, cycle }) => `
        <tr>
            <td>RCP ${cycle}</td>
            <td>${formatEventType(event.type)}</td>
            <td>${formatEventDetails(event.details)}</td>
            <td>${formatHumanReadableDateTime(event.timestamp)} (${formatElapsedFromStart(session.startTime, event.timestamp)})</td>
        </tr>
    `,
    )
    .join("");

  const pediatricInfo = session.pediatricData
    ? `<p><strong>${t("session.patient")}:</strong> ${t("session.child")} (${session.pediatricData.ageValue} ${session.pediatricData.ageMode})</p>`
    : `<p><strong>${t("session.patient")}:</strong> ${t("session.adult")}</p>`;

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
            body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #333; }
            .info { margin-bottom: 20px; border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${t("session.reportTitle")}</h1>
        <div class="info">
            <p><strong>${t("session.date")}:</strong> ${formatLocalizedDate(session.startTime)}</p>
            ${pediatricInfo}
            <p><strong>${t("session.duration")}:</strong> ${formatDuration(session.startTime, session.endTime)}</p>
            <p><strong>${t("session.sessionId")}:</strong> ${session.id}</p>
        </div>

        <h2>${t("session.logTitle")}</h2>
        <table>
            <thead>
                <tr>
                  <th>${t("session.cycle")}</th>
                    <th>${t("session.type")}</th>
                    <th>${t("session.details")}</th>
                  <th>${t("session.timeElapsed")}</th>
                </tr>
            </thead>
            <tbody>
                ${eventsHtml}
            </tbody>
        </table>
      </body>
    </html>
  `;
}
