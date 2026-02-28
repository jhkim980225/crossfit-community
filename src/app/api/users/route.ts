import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { apiSuccess, apiError } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        apiError("VALIDATION_ERROR", parsed.error.issues[0].message),
        { status: 400 }
      );
    }

    const { email, password, name, nickname, box } = parsed.data;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        apiError("EMAIL_EXISTS", "이미 사용 중인 이메일입니다"),
        { status: 409 }
      );
    }

    const existingNickname = await prisma.user.findUnique({ where: { nickname } });
    if (existingNickname) {
      return NextResponse.json(
        apiError("NICKNAME_EXISTS", "이미 사용 중인 닉네임입니다"),
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        box: box || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        nickname: true,
        level: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(apiSuccess(user), { status: 201 });
  } catch (error) {
    console.error("회원가입 오류:", error);
    return NextResponse.json(
      apiError("SERVER_ERROR", "서버 오류가 발생했습니다"),
      { status: 500 }
    );
  }
}
