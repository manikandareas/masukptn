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

import type { QuestionFilters } from '../types'

export type QuestionListItem = {
  id: string
  stem: string
  questionType: 'single_choice' | 'complex_selection' | 'fill_in'
  difficulty: 'easy' | 'medium' | 'hard'
  status: 'draft' | 'published'
  createdAt: Date | string
  subtest: {
    id: string
    name: string
    code: string
  }
}

interface QuestionListProps {
  questions: QuestionListItem[]
  isLoading?: boolean
  filters?: QuestionFilters
  onRowClick?: (questionId: string) => void
}

const questionTypeLabels: Record<string, string> = {
  single_choice: 'Single Choice',
  complex_selection: 'Complex',
  fill_in: 'Fill In',
}

const difficultyColors: Record<string, string> = {
  easy: 'bg-green-500/10 text-green-600 dark:text-green-400',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  hard: 'bg-red-500/10 text-red-600 dark:text-red-400',
}

function truncateStem(stem: string, maxLength = 60): string {
  // Remove markdown formatting for preview
  const plainText = stem
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\n/g, ' ')
    .trim()
  
  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength)}...`
}

export function QuestionList({ questions, isLoading, onRowClick }: QuestionListProps) {
  const router = useRouter()

  const handleRowClick = (questionId: string) => {
    if (onRowClick) {
      onRowClick(questionId)
    } else {
      router.push(`/admin/questions/${questionId}`)
    }
  }

  if (isLoading) {
    return <QuestionListSkeleton />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-medium">Questions</h2>
          <p className="text-[11px] text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button size="sm" render={<Link href="/admin/questions/new" />}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
          New Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-12">
          <p className="text-xs text-muted-foreground">No questions found</p>
          <Button variant="outline" size="sm" render={<Link href="/admin/questions/new" />}>
            Create your first question
          </Button>
        </div>
      ) : (
        <div className="border border-border/60">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[40%]">Stem</TableHead>
                <TableHead>Subtest</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow
                  key={question.id}
                  className="cursor-pointer"
                  onClick={() => handleRowClick(question.id)}
                >
                  <TableCell className="font-mono text-[11px]">
                    {truncateStem(question.stem)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {question.subtest.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {questionTypeLabels[question.questionType] ?? question.questionType}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium ${difficultyColors[question.difficulty]}`}
                    >
                      {question.difficulty}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={question.status === 'published' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {question.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    {format(new Date(question.createdAt), 'MMM d, yyyy')}
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

function QuestionListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-7 w-28" />
      </div>
      <div className="border border-border/60">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[40%]">Stem</TableHead>
              <TableHead>Subtest</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-14" /></TableCell>
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
