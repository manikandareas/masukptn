"use client";

import { Search01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { QuestionFilters } from '../types'

export type SubtestOption = {
  id: string
  name: string
  code: string
  examName?: string
  exam?: {
    id: string
    code: string
    name: string
  }
}

interface QuestionFiltersProps {
  filters: QuestionFilters
  onFiltersChange: (filters: QuestionFilters) => void
  subtests: SubtestOption[]
  isLoading?: boolean
}

export function QuestionFiltersComponent({
  filters,
  onFiltersChange,
  subtests,
  isLoading,
}: QuestionFiltersProps) {
  const handleSubtestChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      subtestId: value === 'all' || !value ? undefined : value,
      offset: 0, // Reset pagination on filter change
    })
  }

  const handleTypeChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      questionType: value === 'all' || !value ? undefined : (value as QuestionFilters['questionType']),
      offset: 0,
    })
  }

  const handleDifficultyChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      difficulty: value === 'all' || !value ? undefined : (value as QuestionFilters['difficulty']),
      offset: 0,
    })
  }

  const handleStatusChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' || !value ? undefined : (value as QuestionFilters['status']),
      offset: 0,
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined,
      offset: 0,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <HugeiconsIcon
            icon={Search01Icon}
            strokeWidth={2}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
          />
          <Input
            placeholder="Search by stem content..."
            value={filters.search ?? ''}
            onChange={handleSearchChange}
            className="pl-8"
            disabled={isLoading}
          />
        </div>

        {/* Subtest Filter */}
        <Select
          value={filters.subtestId ?? 'all'}
          onValueChange={handleSubtestChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Subtests" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subtests</SelectItem>
            {subtests.map((subtest) => (
              <SelectItem key={subtest.id} value={subtest.id}>
                {subtest.code.toUpperCase()} - {subtest.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Question Type Filter */}
        <Select
          value={filters.questionType ?? 'all'}
          onValueChange={handleTypeChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="single_choice">Single Choice</SelectItem>
            <SelectItem value="complex_selection">Complex</SelectItem>
            <SelectItem value="fill_in">Fill In</SelectItem>
          </SelectContent>
        </Select>

        {/* Difficulty Filter */}
        <Select
          value={filters.difficulty ?? 'all'}
          onValueChange={handleDifficultyChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status ?? 'all'}
          onValueChange={handleStatusChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
