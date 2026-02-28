import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "admin@crossfit.com";
  const password = "admin1234!";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("이미 어드민 계정이 존재합니다:", email);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashed,
      name: "관리자",
      nickname: "admin",
      role: "ADMIN",
      level: "RX_PLUS",
    },
  });

  console.log("✅ 어드민 계정 생성 완료");
  console.log("   이메일:", admin.email);
  console.log("   비밀번호:", password);
  console.log("   역할:", admin.role);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
