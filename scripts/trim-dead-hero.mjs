import fs from "fs";

const p = "src/components/reservation/public-reservation-form.tsx";
let s = fs.readFileSync(p, "utf8");
const start = s.indexOf("      {false ? <section");
if (start < 0) {
  console.error("start not found");
  process.exit(1);
}
const end = s.indexOf("      </section>", start) + "      </section>".length;
const after = s.indexOf("\n", end) + 1;
s = s.slice(0, start) + s.slice(after);
fs.writeFileSync(p, s);
console.log("ok");
