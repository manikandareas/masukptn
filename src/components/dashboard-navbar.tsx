"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  SearchIcon,
  SidebarLeftIcon,
  Terminal,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DashboardNavbarProps = {
  email?: string | null;
  onSignOut?: () => void;
  isSigningOut?: boolean;
};

const navItems = [
  {
    label: "Overview",
    to: "/dashboard",
    description: "Analytics and progress",
  },
  {
    label: "Practice",
    to: "/practice",
    description: "Question sets and drills",
  },
  {
    label: "Tryout",
    to: "/tryout",
    description: "Timed simulations",
  },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getInitials(value?: string | null) {
  if (!value) {
    return "MP";
  }

  const name = value.split("@")[0] ?? "";
  const parts = name.split(/[._-]+/).filter(Boolean);
  const initials = parts.map((part) => part[0]).join("");

  return (initials || name.slice(0, 2)).toUpperCase();
}

export function DashboardNavbar({
  email,
  onSignOut,
  isSigningOut,
}: DashboardNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const initials = useMemo(() => getInitials(email), [email]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon-sm" className="md:hidden" />}
              aria-label="Open dashboard navigation"
            >
              <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} />
            </SheetTrigger>
            <SheetContent side="left" className="border-border/60 bg-background/95 p-0">
              <SheetHeader className="border-b border-border/60">
                <SheetTitle className="text-sm font-semibold">Navigation</SheetTitle>
                <SheetDescription>
                  Switch between practice, tryout, and analytics.
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center border border-border/60 bg-muted">
                    <HugeiconsIcon icon={Terminal} strokeWidth={2} />
                  </span>
                  <div className="text-xs">
                    <p className="font-medium text-foreground">masukptn_core</p>
                    <p className="text-muted-foreground">Industrial workspace</p>
                  </div>
                </div>

                <InputGroup className="border-border/60 bg-card/60">
                  <InputGroupAddon>
                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder="Search modules, attempts..."
                    aria-label="Search dashboard"
                  />
                  <InputGroupAddon align="inline-end">
                    <Kbd>/</Kbd>
                  </InputGroupAddon>
                </InputGroup>

                <nav className="flex flex-col gap-2">
                  {navItems.map((item) => {
                    const active = isActivePath(pathname, item.to);
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        className={cn(
                          "border border-border/60 bg-card/40 px-3 py-2 text-xs text-foreground transition-colors hover:bg-muted/60",
                          active && "border-foreground/60 bg-accent text-accent-foreground",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium">{item.label}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{item.description}</span>
                      </Link>
                    );
                  })}
                </nav>

                <div className="flex flex-col gap-2 pt-2">
                  {onSignOut ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-center text-[11px] tracking-wide"
                      onClick={onSignOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? "SIGNING_OUT..." : "SIGN_OUT"}
                    </Button>
                  ) : null}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center border border-border/60 bg-muted">
              <HugeiconsIcon icon={Terminal} strokeWidth={2} />
            </span>
            <span className="hidden sm:inline-flex">masukptn_core</span>
          </Link>

          <Badge variant="outline" className="hidden text-[10px] uppercase tracking-[0.2em] md:inline-flex">
            sync:live
          </Badge>
        </div>

        <nav className="hidden items-center gap-2 text-xs text-muted-foreground lg:flex">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.to);
            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  "border border-transparent px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-border/60 hover:bg-muted/40 hover:text-foreground",
                  active && "border-border/60 bg-muted/40 text-foreground",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground md:flex">
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} size={14} />
            <span>Search</span>
            <Kbd className="ml-1">/</Kbd>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon-sm" className="rounded-full" />
              }
              aria-label="Open profile menu"
            >
              <Avatar className="size-8">
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    session
                  </span>
                  <span className="truncate text-xs text-foreground">{email ?? "SESSION_ACTIVE"}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/practice")}>
                  Practice
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/tryout")}>
                  Tryout
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {onSignOut ? (
                <DropdownMenuItem onSelect={onSignOut} disabled={isSigningOut}>
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
