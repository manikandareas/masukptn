"use client";

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  File01Icon,
  Folder01Icon,
  Home01Icon,
  Terminal,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface AdminLayoutProps {
  children: React.ReactNode
}

const adminNavItems = [
  {
    label: 'Dashboard',
    to: '/admin' as const,
    icon: Home01Icon,
    description: 'Overview and statistics',
  },
  {
    label: 'Questions',
    to: '/admin/questions' as const,
    icon: File01Icon,
    description: 'Manage question bank',
  },
  {
    label: 'Question Sets',
    to: '/admin/question-sets' as const,
    icon: Folder01Icon,
    description: 'Curate practice sets',
  },
]

function AdminNavLink({
  item,
  isActive,
}: {
  item: (typeof adminNavItems)[number]
  isActive: boolean
}) {
  const { state, isMobile } = useSidebar()
  const isCollapsed = state === 'collapsed' && !isMobile

  const linkContent = (
    <Link
      href={item.to}
      className={cn(
        'flex w-full items-center gap-2 rounded-none p-2 text-left text-xs transition-colors',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
        isCollapsed && 'justify-center'
      )}
    >
      <HugeiconsIcon icon={item.icon} strokeWidth={2} size={16} />
      {!isCollapsed && <span>{item.label}</span>}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={linkContent} />
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader className="border-b border-border/60">
          <div className="flex items-center gap-3 px-2 py-1">
            <span className="flex size-8 items-center justify-center border border-border/60 bg-muted">
              <HugeiconsIcon icon={Terminal} strokeWidth={2} size={16} />
            </span>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-medium">admin_console</span>
              <span className="text-[10px] text-muted-foreground">
                Content management
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => {
                  const isActive =
                    item.to === '/admin'
                      ? pathname === '/admin'
                      : pathname.startsWith(item.to)

                  return (
                    <SidebarMenuItem key={item.to}>
                      <AdminNavLink item={item} isActive={isActive} />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-border/60">
          <div className="flex items-center justify-between px-2 py-1 group-data-[collapsible=icon]:justify-center">
            <Badge
              variant="outline"
              className="text-[9px] tracking-[0.15em] uppercase group-data-[collapsible=icon]:hidden"
            >
              admin:active
            </Badge>
            <Link
              href="/dashboard"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors group-data-[collapsible=icon]:hidden"
            >
              ← Back to app
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-12 items-center gap-3 border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              ADMIN
            </span>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs font-medium">
              {adminNavItems.find(
                (item) =>
                  item.to === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.to),
              )?.label ?? 'Dashboard'}
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
