"use client";

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function SignOutButton() {
  return (
    <DropdownMenuItem
      className="cursor-pointer text-destructive focus:text-destructive"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      로그아웃
    </DropdownMenuItem>
  );
}
