import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var postgresClient: postgres.Sql | undefined;
}

const client = globalThis.postgresClient ?? postgres(process.env.DATABASE_URL!, {
  prepare: false,   // Supabase 풀러(transaction 모드) 호환
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  // 풀러가 오래된 서버 커넥션을 조용히 끊으면 클라이언트는 죽은 소켓을 붙들고
  // 응답을 영원히 기다린다(= 페이지가 멈춤). 주기적으로 소켓을 재활용해 예방하고,
  // 그래도 물린 쿼리는 statement_timeout으로 끊어 커넥션을 풀에 돌려준다.
  max_lifetime: 60 * 5,
  connection: { statement_timeout: 20_000 },   // ms
});

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresClient = client;
}

export const db = drizzle(client, { schema });
