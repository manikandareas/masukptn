"use client";

import { useState, useMemo } from 'react'
import { Search01Icon, ViewIcon, Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MarkdownRenderer } from '@/components/markdown-renderer'

import { useAdminQuestions, useAdminSubtests } from '../hooks'
import type { QuestionFilters } from '../types'
import type { QuestionListItem } from './question-list'

export type QuestionPickerQuestion = QuestionListItem

interface QuestionPickerProps {
  examId?: string
  subtestId?: string
  excludeIds: string[]
  onSelect: (questions: QuestionPickerQuestion[]) => void
  trigger?: React.ReactNode
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

function truncateStem(stem: string, maxLength = 50): string {
  const plainText = stem
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\n/g, ' ')
    .trim()

  if (plainText.length <= maxLength) return plainText
  return `${plainText.slice(0, maxLength)}...`
}

export function QuestionPicker({
  examId,
  subtestId,
  excludeIds,
  onSelect,
  trigger,
}: QuestionPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [previewQuestion, setPreviewQuestion] = useState<QuestionPickerQuestion | null>(null)
  const [filters, setFilters] = useState<QuestionFilters>({
    subtestId: subtestId,
    status: 'published', // Default to published questions
    limit: 50,
    offset: 0,
  })

  const { data: subtests = [] } = useAdminSubtests()
  const { data, isLoading } = useAdminQuestions(filters)

  // Filter out already added questions
  const availableQuestions = (data?.questions ?? [])
    .filter((question) => !excludeIds.includes(question.id))
    .map((question) => ({
      ...question,
      difficulty: question.difficulty ?? 'medium',
    }))

  // Filter subtests by exam if examId is provided
  const filteredSubtests = useMemo(() => {
    if (!examId) return subtests
    return subtests.filter((s) => s.exam?.id === examId)
  }, [subtests, examId])

  const handleToggleSelect = (questionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === availableQuestions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(availableQuestions.map((q) => q.id)))
    }
  }

  const handleAddSelected = () => {
    const selectedQuestions = availableQuestions.filter((q) =>
      selectedIds.has(q.id),
    )
    onSelect(selectedQuestions)
    setSelectedIds(new Set())
    setOpen(false)
  }

  const handleSubtestChange = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      subtestId: value === 'all' || !value ? undefined : value,
      offset: 0,
    }))
  }

  const handleDifficultyChange = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      difficulty: value === 'all' || !value ? undefined : (value as QuestionFilters['difficulty']),
      offset: 0,
    }))
  }

  const handleStatusChange = (value: string | null) => {
    setFilters((prev) => ({
      ...prev,
      status: value === 'all' || !value ? undefined : (value as QuestionFilters['status']),
      offset: 0,
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value || undefined,
      offset: 0,
    }))
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSelectedIds(new Set())
      setPreviewQuestion(null)
    }
  }

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
      Add Questions
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger render={trigger as React.ReactElement} />
      ) : (
        <DialogTrigger render={defaultTrigger} />
      )}
      <DialogContent className="sm:max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Questions</DialogTitle>
          <DialogDescription>
            Select questions to add to this question set. Use filters to find specific questions.
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 py-2 border-b border-border/60">
          <div className="relative flex-1 min-w-[180px]">
            <HugeiconsIcon
              icon={Search01Icon}
              strokeWidth={2}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search questions..."
              value={filters.search ?? ''}
              onChange={handleSearchChange}
              className="pl-8 h-8 text-xs"
            />
          </div>

          <Select
            value={filters.subtestId ?? 'all'}
            onValueChange={handleSubtestChange}
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="All Subtests" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subtests</SelectItem>
              {filteredSubtests.map((subtest) => (
                <SelectItem key={subtest.id} value={subtest.id}>
                  {subtest.code.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.difficulty ?? 'all'}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content area with table and preview */}
        <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
          {/* Questions table */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between py-2">
              <span className="text-[11px] text-muted-foreground">
                {availableQuestions.length} question{availableQuestions.length !== 1 ? 's' : ''} available
                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
              </span>
              {availableQuestions.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px]"
                  onClick={handleSelectAll}
                >
                  {selectedIds.size === availableQuestions.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 border border-border/60">
              {isLoading ? (
                <QuestionPickerSkeleton />
              ) : availableQuestions.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-xs text-muted-foreground">
                  No questions found matching your filters
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="w-[45%]">Question</TableHead>
                      <TableHead>Subtest</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableQuestions.map((question) => (
                      <TableRow
                        key={question.id}
                        className="cursor-pointer"
                        onClick={() => handleToggleSelect(question.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(question.id)}
                            onCheckedChange={() => handleToggleSelect(question.id)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-[10px]">
                          {truncateStem(question.stem)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase">
                            {question.subtest.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium ${difficultyColors[question.difficulty]}`}
                          >
                            {question.difficulty}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={question.status === 'published' ? 'default' : 'secondary'}
                            className="text-[9px]"
                          >
                            {question.status}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-6 w-6"
                            onClick={() => setPreviewQuestion(question)}
                          >
                            <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </div>

          {/* Preview panel */}
          {previewQuestion && (
            <div className="w-72 flex flex-col border border-border/60 bg-muted/20">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/60">
                <span className="text-[10px] font-medium uppercase text-muted-foreground">
                  Preview
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 text-[10px] px-1.5"
                  onClick={() => setPreviewQuestion(null)}
                >
                  Close
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[9px]">
                      {previewQuestion.subtest.code.toUpperCase()}
                    </Badge>
                    <Badge variant="secondary" className="text-[9px]">
                      {questionTypeLabels[previewQuestion.questionType]}
                    </Badge>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium ${difficultyColors[previewQuestion.difficulty]}`}
                    >
                      {previewQuestion.difficulty}
                    </span>
                  </div>
                  <div className="text-[11px]">
                    <MarkdownRenderer content={previewQuestion.stem} />
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleAddSelected}
            disabled={selectedIds.size === 0}
          >
            Add {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Question{selectedIds.size !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function QuestionPickerSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-10"></TableHead>
          <TableHead className="w-[45%]">Question</TableHead>
          <TableHead>Subtest</TableHead>
          <TableHead>Difficulty</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-4 w-4" /></TableCell>
            <TableCell><Skeleton className="h-4 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
            <TableCell><Skeleton className="h-4 w-12" /></TableCell>
            <TableCell><Skeleton className="h-5 w-14" /></TableCell>
            <TableCell><Skeleton className="h-6 w-6" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
