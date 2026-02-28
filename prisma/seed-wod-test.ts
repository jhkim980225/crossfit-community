import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const today = "2026-03-01";

  // ─── 관리자 확인 ───
  const admin = await prisma.user.findUnique({ where: { email: "admin@crossfit.com" } });
  if (!admin) {
    console.error("❌ 어드민 계정 없음. npm run seed 먼저 실행하세요.");
    return;
  }

  // ─── 테스트 유저 3명 생성 (없으면) ───
  const testUsers = [
    { email: "rx1@test.com", nickname: "김철수", level: "RX", box: "강남CrossFit" },
    { email: "rx2@test.com", nickname: "이영희", level: "RX_PLUS", box: "홍대CrossFit" },
    { email: "sc1@test.com", nickname: "박민준", level: "INTERMEDIATE", box: "강남CrossFit" },
  ];

  const hashed = await bcrypt.hash("test1234!", 12);
  const createdUsers: { id: string; nickname: string }[] = [];

  for (const u of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        password: hashed,
        name: u.nickname,
        nickname: u.nickname,
        level: u.level as "RX" | "RX_PLUS" | "INTERMEDIATE" | "BEGINNER",
        box: u.box,
      },
    });
    createdUsers.push({ id: user.id, nickname: user.nickname });
  }

  console.log("✅ 테스트 유저 준비 완료");

  // ─── 오늘 WOD 생성 (이미 있으면 스킵) ───
  const existingWod = await prisma.wOD.findFirst({
    where: {
      date: {
        gte: new Date(`${today}T00:00:00.000Z`),
        lt:  new Date(`${today}T23:59:59.999Z`),
      },
    },
  });

  const wod = existingWod ?? await prisma.wOD.create({
    data: {
      title: "Fran",
      description: "21-15-9\nThrusters (43/30 kg)\nPull-ups",
      type: "FOR_TIME",
      movements: ["Thrusters", "Pull-ups"],
      date: new Date(`${today}T00:00:00.000Z`),
      createdById: admin.id,
    },
  });

  console.log(`✅ WOD: ${wod.title} (${wod.type})`);

  // ─── WOD 결과 삽입 (어드민 + 테스트 유저) ───
  // FOR_TIME: 초 단위 (낮을수록 좋음)
  const resultData = [
    { user: admin,              score: "245", rx: "RX",     memo: "PR!" },
    { user: createdUsers[0],    score: "198", rx: "RX",     memo: "개인 최고 기록" },
    { user: createdUsers[1],    score: "183", rx: "RX",     memo: "" },
    { user: createdUsers[2],    score: "312", rx: "SCALED", memo: "스케일드로 했음" },
  ];

  for (const r of resultData) {
    const rx = r.rx as "RX" | "SCALED";
    await prisma.wODResult.upsert({
      where: { wodId_userId: { wodId: wod.id, userId: r.user.id } },
      update: { score: r.score, rxOrScaled: rx, memo: r.memo || null },
      create: {
        wodId: wod.id,
        userId: r.user.id,
        score: r.score,
        rxOrScaled: rx,
        memo: r.memo || null,
      },
    });
    console.log(`   📝 ${r.user.nickname}: ${r.score}초 (${r.rx})`);
  }

  console.log("\n✅ 테스트 데이터 삽입 완료");
  console.log(`👉 http://localhost:3000/wod/${today} 에서 확인하세요`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
