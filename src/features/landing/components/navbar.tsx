"use client";

import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { Terminal } from '@hugeicons/core-free-icons'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-mono">
            M
          </span>
          <span className="font-mono tracking-tight">masukptn_core</span>
        </Link>
        
        <nav className="hidden md:flex gap-6 text-sm font-medium font-mono text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors hover:underline decoration-primary decoration-2 underline-offset-4">
            [MODULES]
          </Link>
          <Link href="/" className="hover:text-primary transition-colors hover:underline decoration-primary decoration-2 underline-offset-4">
            [ANALYTICS]
          </Link>
          <Link href="/" className="hover:text-primary transition-colors hover:underline decoration-primary decoration-2 underline-offset-4">
            [PRICING]
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/signin"
            className="text-sm font-mono font-medium text-muted-foreground hover:text-foreground hidden sm:block"
          >
            LOG_IN
          </Link>
          <Link
            href="/signup"
            className={cn(
              buttonVariants({ size: 'sm' }),
              'font-mono rounded-[0.5rem]'
            )}
          >
            <HugeiconsIcon icon={Terminal} className="mr-2 h-4 w-4" />
            INIT_SYSTEM
          </Link>
        </div>
      </div>
    </header>
  )
}
