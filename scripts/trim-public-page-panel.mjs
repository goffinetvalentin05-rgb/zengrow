import fs from "fs";

const path = "src/components/dashboard/settings/public-page-settings-panel.tsx";
let lines = fs.readFileSync(path, "utf8").split(/\r?\n/);

const start = lines.findIndex((l) => l.includes('title="Sections & blocs"'));
const reservation = lines.findIndex((l, i) => i > start && l.includes('title="Réservation"'));

if (start < 0 || reservation < 0) {
  console.error("markers not found", { start, reservation });
  process.exit(1);
}

// Keep blank line before Réservation; remove from line before Sections (often empty)
let removeFrom = start;
while (removeFrom > 0 && lines[removeFrom - 1].trim() === "") removeFrom--;

lines.splice(removeFrom, reservation - removeFrom);

fs.writeFileSync(path, lines.join("\n"));
console.log(`Removed lines ${removeFrom + 1}–${reservation} (Sections & blocs + Contenu)`);
