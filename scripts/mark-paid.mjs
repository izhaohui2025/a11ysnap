#!/usr/bin/env node
/** Demo helper: flip paid=true on a scan JSON file. Usage: npm run mark-paid -- <scanId> */
import fs from "fs";
import path from "path";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run mark-paid -- <scanId>");
  process.exit(1);
}
const p = path.join(process.cwd(), "data", "scans", `${id}.json`);
if (!fs.existsSync(p)) {
  console.error("Scan not found:", p);
  process.exit(1);
}
const scan = JSON.parse(fs.readFileSync(p, "utf8"));
scan.paid = true;
fs.writeFileSync(p, JSON.stringify(scan, null, 2));
console.log("Marked paid:", id);
