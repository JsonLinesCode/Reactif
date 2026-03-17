import { CprEvent, CprSession } from "@/models/session";

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

export function generateSessionHtml(session: CprSession): string {
  const eventsHtml = session.events
    .map(
      (evt: CprEvent) => `
        <tr>
            <td>${new Date(evt.timestamp).toLocaleTimeString()}</td>
            <td>${formatEventType(evt.type)}</td>
            <td>${formatEventDetails(evt.details)}</td>
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
            <p><strong>Heure debut:</strong> ${new Date(session.startTime).toLocaleTimeString()}</p>
            ${session.endTime ? `<p><strong>Heure fin:</strong> ${new Date(session.endTime).toLocaleTimeString()}</p>` : ""}
            ${pediatricInfo}
            <p><strong>Duree:</strong> ${formatDuration(session.startTime, session.endTime)}</p>
            <p><strong>ID Session:</strong> ${session.id}</p>
        </div>

        <h2>Journal des evenements</h2>
        <table>
            <thead>
                <tr>
                    <th>Heure</th>
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
