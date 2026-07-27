// 생성된 drizzle 마이그레이션 SQL을 문장 단위로 적용한다.
// 이미 존재하는 객체(중복 테이블/컬럼/타입/제약)는 건너뛴다 — 스냅샷 드리프트 대응.
import { readFileSync } from "node:fs";
import postgres from "postgres";

const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/apply-migration.mjs <sql-file>");
  process.exit(1);
}

const SKIP_CODES = new Set([
  "42P07", // duplicate_table
  "42701", // duplicate_column
  "42710", // duplicate_object (type, constraint)
  "42P06", // duplicate_schema
]);

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

const statements = readFileSync(file, "utf8")
  .split("--> statement-breakpoint")
  .map((s) => s.trim().replace(/;$/, ""))
  .filter(Boolean);

let applied = 0;
let skipped = 0;
const failures = [];

for (const stmt of statements) {
  const label = stmt.split("\n")[0].slice(0, 80);
  try {
    await sql.unsafe(stmt);
    applied++;
    console.log(`  ok    ${label}`);
  } catch (e) {
    if (SKIP_CODES.has(e.code)) {
      skipped++;
      console.log(`  skip  ${label}  (${e.code})`);
    } else {
      failures.push({ label, code: e.code, message: e.message });
      console.log(`  FAIL  ${label}  (${e.code}) ${e.message}`);
    }
  }
}

await sql.end();

console.log(`\napplied=${applied} skipped=${skipped} failed=${failures.length}`);
if (failures.length) process.exit(1);
