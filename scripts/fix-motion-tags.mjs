import fs from "fs";
const files = [
  "c:/Users/Goffi/zengrow/src/components/dashboard/settings/public-page-settings-panel.tsx",
];
for (const p of files) {
  let s = fs.readFileSync(p, "utf8");
  s = s.replace(/<\/motion>/g, "</div>");
  s = s.replace(/<motion(\s|>)/g, "<motion$1"); // noop - fix opening motion if any
  s = s.replace(/<motion className=/g, "<div className=");
  s = s.replace(/<motion>/g, "<div>");
  fs.writeFileSync(p, s);
  console.log("fixed", p);
}
