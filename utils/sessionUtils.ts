import { CprEvent, CprSession } from "@/models/session";

interface EventWithCycle {
  event: CprEvent;
  cycle: number;
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
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatHumanReadableDateTime(timestamp: number): string {
  return `${new Date(timestamp).toLocaleDateString("fr-FR")} ${formatHumanReadableTime(timestamp)}`;
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
      return "Choc";
    case "analysis":
      return "Analyse";
    case "cordarone":
      return "Cordarone";
    case "adrenaline":
      return "Adrenaline";
    case "event":
      return "Evenement";
    case "cpr_end":
      return "Fin RCP";
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
        </tr>
    `,
    )
    .join("");

  const pediatricInfo = session.pediatricData
    ? `<p><strong>Patient:</strong> Enfant (${session.pediatricData.ageValue} ${session.pediatricData.ageMode})</p>`
    : `<p><strong>Patient:</strong> Adulte (Standard)</p>`;

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
        <h1>Rapport de Reanimation</h1>
        <div class="info">
            <p><strong>Date:</strong> ${new Date(session.startTime).toLocaleDateString()}</p>
            ${pediatricInfo}
            <p><strong>Duree:</strong> ${formatDuration(session.startTime, session.endTime)}</p>
            <p><strong>ID Session:</strong> ${session.id}</p>
        </div>

        <h2>Journal des evenements</h2>
        <table>
            <thead>
                <tr>
                <th>Cycle</th>
                    <th>Type</th>
                    <th>Details</th>
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
