import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { apiSuccess, apiError } from "@/lib/utils";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(apiError("UNAUTHORIZED", "로그인이 필요합니다"), {
        status: 401,
      });
    }

    const body = await req.json();
    const { fileName, contentType, folder } = body as {
      fileName: string;
      contentType: string;
      folder: "posts" | "profiles";
    };

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        apiError("INVALID_TYPE", "지원하지 않는 파일 형식입니다 (jpg, png, webp, gif만 가능)"),
        { status: 400 }
      );
    }

    const ext = fileName.split(".").pop() || "jpg";
    const key = `${folder}/${session.user.id}/${randomUUID()}.${ext}`;

    const presignedUrl = await getPresignedUploadUrl(key, contentType);

    return NextResponse.json(apiSuccess({ presignedUrl, key }));
  } catch (error) {
    console.error("Presigned URL 발급 오류:", error);
    return NextResponse.json(apiError("SERVER_ERROR", "서버 오류가 발생했습니다"), {
      status: 500,
    });
  }
}
