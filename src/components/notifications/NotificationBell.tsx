"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ApiResponse } from "@/types";

const POLL_INTERVAL_MS = 30_000;

interface NotificationData {
  unreadCount: number;
}

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications");
      const result: ApiResponse<NotificationData> = await res.json();
      if (result.success && result.data) {
        setUnreadCount(result.data.unreadCount);
      }
    } catch {
      // 무시 - 폴링 실패는 조용히 처리
    }
  }

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <Link href="/notifications" className="relative" aria-label="알림">
      <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-2 -top-2 h-4 min-w-4 px-1 text-[10px]"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </Badge>
      )}
    </Link>
  );
}
