/**
 * 어드민 데모 시드 데이터
 * 실행: node --env-file=.env.local ./scripts/seed-admin-demo.mjs
 * 비우기: 각 테이블 TRUNCATE (아래 CLEAR=1 로 실행 시 데모 데이터 삭제)
 */
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const CLEAR = process.env.CLEAR === "1";

const pick = (arr, i) => arr[i % arr.length];
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

try {
  if (CLEAR) {
    await sql`TRUNCATE settlements, assignments, suppliers, credits, orders, campaign_events, campaigns, products, businesses RESTART IDENTITY CASCADE;`;
    // 데모로 만든 회원만 삭제 (admin/실계정 보호: role='admin' 제외)
    await sql`DELETE FROM users WHERE role <> 'admin';`;
    console.log("🧹 데모 데이터 삭제 완료");
    await sql.end();
    process.exit(0);
  }

  // ── 1. 회원 (광고주 6 + 공급자 3) ──
  const advertisers = [
    ["김서준", "seojun.kim@example.com", "45000"],
    ["이하윤", "hayoon.lee@example.com", "120000"],
    ["박도윤", "doyoon.park@example.com", "0"],
    ["최지우", "jiwoo.choi@example.com", "8000"],
    ["정민서", "minseo.jung@example.com", "350000"],
    ["강예은", "yeeun.kang@example.com", "22000"],
  ];
  const supplierUsers = [
    ["한블로거", "blogger.han@example.com"],
    ["윤인플루", "influ.yoon@example.com"],
    ["장카페", "cafe.jang@example.com"],
  ];

  const advIds = [];
  for (const [name, email, bal] of advertisers) {
    const [row] = await sql`
      INSERT INTO users (name, email, role, credit_balance, created_at)
      VALUES (${name}, ${email}, 'advertiser', ${bal}, now() - (random()*60 || ' days')::interval)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id;`;
    advIds.push(row.id);
  }
  const supIds = [];
  for (const [name, email] of supplierUsers) {
    const [row] = await sql`
      INSERT INTO users (name, email, role, created_at)
      VALUES (${name}, ${email}, 'supplier', now() - (random()*90 || ' days')::interval)
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name RETURNING id;`;
    supIds.push(row.id);
  }

  // ── 2. 사업자 ──
  const bizNames = ["○○갈비 본점", "감성카페 무브", "왁싱살롱 글로우", "원피스랩 쇼핑몰", "헬스클럽 파워짐", "네일아뜨리에"];
  const bizTypes = ["place", "place", "place", "store", "place", "place"];
  const bizIds = [];
  for (let i = 0; i < bizNames.length; i++) {
    const [row] = await sql`
      INSERT INTO businesses (user_id, type, name, external_url)
      VALUES (${pick(advIds, i)}, ${bizTypes[i]}, ${bizNames[i]}, ${"https://place.example.com/" + (1000 + i)})
      RETURNING id;`;
    bizIds.push(row.id);
  }

  // ── 3. 상품 카탈로그 ──
  const products = [
    ["place_traffic", "네이버 플레이스 트래픽", "플레이스 유입/저장 상위노출", "per_visit_day", "3300", 10, 500, 30],
    ["store_traffic", "네이버 쇼핑 트래픽", "쇼핑 상품 유입 상위노출", "per_visit_day", "2800", 10, 500, 30],
    ["blog_review", "블로그 체험단 리뷰", "네이버 블로그 방문 리뷰 발행", "per_item", "45000", 5, 100, 14],
    ["visit_review", "영수증 방문 리뷰", "실방문 영수증 리뷰", "per_item", "12000", 10, 300, 21],
    ["community_viral", "카페/커뮤니티 바이럴", "지역 카페 바이럴 확산", "per_item", "38000", 3, 50, 14],
    ["rank_tracking", "키워드 순위 추적", "키워드 랭킹 모니터링 구독", "subscription", "99000", 1, 1, 30],
  ];
  const prodIds = [];
  for (const [pt, title, desc, unit, price, minQ, maxQ, dur] of products) {
    const [row] = await sql`
      INSERT INTO products (product_type, title, description, unit, unit_price, min_qty, max_qty, est_duration_days, form_schema, is_active)
      VALUES (${pt}, ${title}, ${desc}, ${unit}, ${price}, ${minQ}, ${maxQ}, ${dur}, ${sql.json({ fields: [] })}, true)
      RETURNING id;`;
    prodIds.push(row.id);
  }
  // 하나는 비활성 상품
  await sql`UPDATE products SET is_active = false WHERE id = ${prodIds[prodIds.length - 1]};`;

  // ── 4. 캠페인 (다양한 상태) ──
  const statuses = ["submitted", "reviewing", "running", "running", "scheduled", "completed", "paused", "submitted", "reviewing", "running", "completed", "canceled"];
  const keywords = ["○○갈비 맛집", "성수 감성카페", "강남 왁싱", "여름 원피스", "동네 헬스장", "네일 아트", "브런치 카페", "제주 흑돼지", "왁싱 이벤트", "가을 니트", "PT 등록", "웨딩 네일"];
  const campIds = [];
  for (let i = 0; i < statuses.length; i++) {
    const total = 30 + ((i * 37) % 300);
    const daily = 10 + (i % 5) * 5;
    const unitPrice = 3300;
    const quoted = String(total * unitPrice);
    const st = statuses[i];
    const paid = ["running", "scheduled", "completed", "paused"].includes(st) ? quoted : "0";
    const started = ["running", "completed", "paused"].includes(st);
    const [row] = await sql`
      INSERT INTO campaigns (user_id, business_id, product_id, status, inputs, daily_qty, total_qty, start_date, end_date, quoted_amount, paid_amount, created_at)
      VALUES (
        ${pick(advIds, i)}, ${pick(bizIds, i)}, ${pick(prodIds, i)}, ${st},
        ${sql.json({ keyword: keywords[i], region: "서울" })},
        ${daily}, ${total},
        ${started ? daysAgo(20 - i) : null},
        ${st === "completed" ? daysAgo(2) : started ? daysAgo(-10) : null},
        ${quoted}, ${paid},
        now() - (${i} || ' days')::interval
      ) RETURNING id, total_qty, status;`;
    campIds.push(row);

    // 진행중/완료 캠페인은 일별 이벤트 생성
    if (["running", "completed", "paused"].includes(st)) {
      const days = st === "completed" ? 12 : 6;
      for (let d = 0; d < days; d++) {
        await sql`
          INSERT INTO campaign_events (campaign_id, event_date, delivered_qty)
          VALUES (${row.id}, ${daysAgo(days - d)}, ${Math.min(daily, 8 + ((i + d) % 12))});`;
      }
    }
  }

  // ── 5. 주문/결제 ──
  for (let i = 0; i < campIds.length; i++) {
    const c = campIds[i];
    if (["running", "scheduled", "completed", "paused"].includes(c.status)) {
      const amount = String(c.total_qty * 3300);
      await sql`
        INSERT INTO orders (user_id, campaign_id, amount, method, pg_tx_id, status, created_at)
        VALUES (${pick(advIds, i)}, ${c.id}, ${amount}, ${pick(["card", "bank_transfer", "virtual_account"], i)}, ${"tx_" + (100000 + i)}, ${i === 11 ? "refunded" : "paid"}, now() - (${i} || ' days')::interval);`;
    }
  }

  // ── 6. 크레딧 원장 ──
  for (let i = 0; i < advIds.length; i++) {
    await sql`INSERT INTO credits (user_id, delta, reason, created_at) VALUES (${advIds[i]}, ${String((i + 1) * 50000)}, '충전', now() - (${i + 5} || ' days')::interval);`;
    await sql`INSERT INTO credits (user_id, delta, reason, created_at) VALUES (${advIds[i]}, ${String(-(i + 1) * 10000)}, '캠페인 차감', now() - (${i} || ' days')::interval);`;
  }

  // ── 7. 공급자 ──
  const supRowIds = [];
  const channels = ["naver_blog", "instagram", "cafe"];
  for (let i = 0; i < supIds.length; i++) {
    const [row] = await sql`
      INSERT INTO suppliers (user_id, channel_type, capacity, is_active)
      VALUES (${supIds[i]}, ${channels[i]}, ${5 + i * 3}, true) RETURNING id;`;
    supRowIds.push(row.id);
  }

  // ── 8. 배정 ──
  const runningCamps = campIds.filter((c) => ["running", "completed"].includes(c.status));
  for (let i = 0; i < runningCamps.length; i++) {
    await sql`
      INSERT INTO assignments (campaign_id, supplier_id, assigned_qty, status)
      VALUES (${runningCamps[i].id}, ${pick(supRowIds, i)}, ${20 + i * 5}, ${pick(["assigned", "in_progress", "submitted", "approved"], i)});`;
  }

  // ── 9. 정산 ──
  for (let i = 0; i < supRowIds.length; i++) {
    await sql`INSERT INTO settlements (supplier_id, period, amount, status) VALUES (${supRowIds[i]}, '2026-06', ${String((i + 1) * 480000)}, 'completed');`;
    await sql`INSERT INTO settlements (supplier_id, period, amount, status) VALUES (${supRowIds[i]}, '2026-07', ${String((i + 1) * 520000)}, ${pick(["pending", "processing"], i)});`;
  }

  console.log("✅ 데모 시드 완료");
  for (const t of ["users", "businesses", "products", "campaigns", "campaign_events", "orders", "credits", "suppliers", "assignments", "settlements"]) {
    const [{ count }] = await sql.unsafe(`SELECT count(*)::int AS count FROM ${t}`);
    console.log(`  ${t}: ${count}`);
  }
} catch (e) {
  console.error("❌", e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
