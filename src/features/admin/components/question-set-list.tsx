"use client";

import { format } from 'date-fns'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import type { QuestionSetFilters } from '../types'

export type QuestionSetListItem = {
  id: string
  name: string
  description: string | null
  status: 'draft' | 'published'
  createdAt: Date | string
  questionCount: number
  exam: {
    id: string
    name: string
    code: string
  }
  subtest: {
    id: string
    name: string
    code: string
  } | null
}

interface QuestionSetListProps {
  questionSets: QuestionSetListItem[]
  isLoading?: boolean
  filters?: QuestionSetFilters
  onRowClick?: (questionSetId: string) => void
}

export function QuestionSetList({
  questionSets,
  isLoading,
  onRowClick,
}: QuestionSetListProps) {
  const router = useRouter()

  const handleRowClick = (questionSetId: string) => {
    if (onRowClick) {
      onRowClick(questionSetId)
    } else {
      router.push(`/admin/question-sets/${questionSetId}`)
    }
  }

  if (isLoading) {
    return <QuestionSetListSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Question Sets</h2>
          <p className="text-[11px] text-muted-foreground">
            {questionSets.length} set{questionSets.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button size="sm" render={<Link href="/admin/question-sets/new" />}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
          New Question Set
        </Button>
      </div>

      {questionSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-12">
          <p className="text-xs text-muted-foreground">No question sets found</p>
          <Button variant="outline" size="sm" render={<Link href="/admin/question-sets/new" />}>
            Create your first question set
          </Button>
        </div>
      ) : (
        <div className="border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[35%]">Name</TableHead>
                <TableHead>Exam</TableHead>
                <TableHead>Subtest</TableHead>
                <TableHead className="text-center">Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questionSets.map((set) => (
                <TableRow
                  key={set.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(set.id)}
                >
                  <TableCell className="font-mono text-[11px]">
                    {set.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {set.exam.code}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {set.subtest ? (
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        {set.subtest.code}
                      </Badge>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 text-[10px] font-medium bg-muted/50 rounded">
                      {set.questionCount}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={set.status === 'published' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {set.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {format(new Date(set.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function QuestionSetListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-32" />
      </div>
      <div className="border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[35%]">Name</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Subtest</TableHead>
              <TableHead className="text-center">Questions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell className="text-center"><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
