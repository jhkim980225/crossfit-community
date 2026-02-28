import { redirect } from "next/navigation";
import { toDateString } from "@/lib/utils";

// /wod 진입 시 오늘 날짜 WOD로 리다이렉트
export default function WodIndexPage() {
  const today = toDateString(new Date());
  redirect(`/wod/${today}`);
}
