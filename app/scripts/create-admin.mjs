/**
 * 내부 직원(관리자) 계정 생성 스크립트
 *
 * 사용법:
 *   node --env-file=.env.local ./scripts/create-admin.mjs <이메일> <비밀번호> [이름]
 * 예시:
 *   node --env-file=.env.local ./scripts/create-admin.mjs staff@blueegg.com 'Str0ng!Pass' 홍길동
 *
 * 동작:
 *   1) Supabase auth.users 에 이메일 확인 완료 상태로 계정 생성 (pgcrypto bcrypt 해시)
 *   2) public.users 에 role='admin' 로우 생성/승격
 * 이미 존재하는 이메일이면 비밀번호를 갱신하고 admin 으로 승격합니다.
 */
import postgres from "postgres";

const [email, password, name] = process.argv.slice(2);

if (!email || !password) {
  console.error("❌ 사용법: node --env-file=.env.local ./scripts/create-admin.mjs <이메일> <비밀번호> [이름]");
  process.exit(1);
}
if (password.length < 6) {
  console.error("❌ 비밀번호는 6자 이상이어야 합니다.");
  process.exit(1);
}

const displayName = name || email.split("@")[0];
const sql = postgres(process.env.DATABASE_URL, { prepare: false });

try {
  await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;

  // 기존 auth 계정 확인
  const existing = await sql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1;`;

  let userId;
  if (existing.length) {
    userId = existing[0].id;
    await sql`
      UPDATE auth.users
      SET encrypted_password = crypt(${password}, gen_salt('bf')),
          email_confirmed_at = COALESCE(email_confirmed_at, now()),
          updated_at = now()
      WHERE id = ${userId};`;
    console.log("🔑 기존 계정 비밀번호 갱신:", email);
  } else {
    const inserted = await sql`
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data,
        confirmation_token, recovery_token, email_change, email_change_token_new
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        ${email},
        crypt(${password}, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        ${sql.json({ display_name: displayName })},
        '', '', '', ''
      ) RETURNING id;`;
    userId = inserted[0].id;
    console.log("✅ auth 계정 생성:", email);
  }

  // auth.identities 레코드 보장 (GoTrue 비밀번호 로그인에 필수)
  await sql`
    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      ${userId}, ${userId},
      ${sql.json({ sub: userId, email, email_verified: true, phone_verified: false })},
      'email', now(), now(), now()
    )
    ON CONFLICT (provider, provider_id)
    DO UPDATE SET identity_data = EXCLUDED.identity_data, updated_at = now();`;

  // public.users 승격/생성
  await sql`
    INSERT INTO users (id, name, email, role)
    VALUES (${userId}, ${displayName}, ${email}, 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', name = EXCLUDED.name, updated_at = now();`;

  console.log("✅ 관리자 권한 부여 완료");
  console.log("   → /admin/login 에서 로그인하세요.");
} catch (e) {
  console.error("❌", e);
  process.exitCode = 1;
} finally {
  await sql.end();
}
