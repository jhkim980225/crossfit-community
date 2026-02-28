import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

// 빌드 시 사전 렌더링하지 않고 요청 시마다 생성
export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/wod`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE_URL}/pr`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // 최근 게시글 100개 포함
  const posts = await prisma.post.findMany({
    where: { isHidden: false },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/community/${post.id}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
