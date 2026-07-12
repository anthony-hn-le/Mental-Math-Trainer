"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initialFor(name?: string | null, email?: string | null): string {
  return (name?.trim()?.[0] ?? email?.trim()?.[0] ?? "?").toUpperCase();
}

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="size-8 shrink-0 rounded-full bg-muted" aria-hidden />;
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" onClick={() => signIn("google")}>
        Sign in
      </Button>
    );
  }

  const { name, email, image } = session.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <Avatar>
          <AvatarImage src={image ?? undefined} alt={name ?? email ?? "User"} />
          <AvatarFallback>{initialFor(name, email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{name ?? email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/history">History</Link>} />
        <DropdownMenuItem onClick={() => signOut()}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
