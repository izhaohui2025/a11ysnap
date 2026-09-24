import fs from "fs";
import path from "path";
import { ScanResult } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const SCANS_DIR = path.join(DATA_DIR, "scans");
const RATE_FILE = path.join(DATA_DIR, "rate-limit.json");

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(SCANS_DIR)) fs.mkdirSync(SCANS_DIR, { recursive: true });
}

function scanPath(id: string) {
  return path.join(SCANS_DIR, `${id}.json`);
}

export function saveScan(scan: ScanResult): void {
  ensureDirs();
  fs.writeFileSync(scanPath(scan.id), JSON.stringify(scan, null, 2), "utf-8");
}

export function getScan(id: string): ScanResult | null {
  ensureDirs();
  const p = scanPath(id);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8")) as ScanResult;
  } catch {
    return null;
  }
}

export function markScanPaid(id: string, stripeSessionId?: string): ScanResult | null {
  const scan = getScan(id);
  if (!scan) return null;
  scan.paid = true;
  if (stripeSessionId) scan.stripeSessionId = stripeSessionId;
  saveScan(scan);
  return scan;
}

interface RateBucket {
  count: number;
  day: string; // YYYY-MM-DD UTC
}

type RateMap = Record<string, RateBucket>;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readRates(): RateMap {
  ensureDirs();
  if (!fs.existsSync(RATE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(RATE_FILE, "utf-8")) as RateMap;
  } catch {
    return {};
  }
}

function writeRates(map: RateMap) {
  ensureDirs();
  fs.writeFileSync(RATE_FILE, JSON.stringify(map, null, 2), "utf-8");
}

const FREE_LIMIT = 5;

export function checkAndIncrementRate(ip: string): { ok: boolean; remaining: number } {
  const map = readRates();
  const day = todayKey();
  const bucket = map[ip];
  if (!bucket || bucket.day !== day) {
    map[ip] = { count: 1, day };
    writeRates(map);
    return { ok: true, remaining: FREE_LIMIT - 1 };
  }
  if (bucket.count >= FREE_LIMIT) {
    return { ok: false, remaining: 0 };
  }
  bucket.count += 1;
  writeRates(map);
  return { ok: true, remaining: FREE_LIMIT - bucket.count };
}
