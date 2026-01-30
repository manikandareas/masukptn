"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import type { QuestionSetFilters } from '../types'

export type ExamOption = {
  id: string
  name: string
  code: string
}

export type SubtestOptionForSet = {
  id: string
  name: string
  code: string
  examId: string
}

interface QuestionSetFiltersProps {
  filters: QuestionSetFilters
  onFiltersChange: (filters: QuestionSetFilters) => void
  exams: ExamOption[]
  subtests: SubtestOptionForSet[]
  isLoading?: boolean
}

export function QuestionSetFiltersComponent({
  filters,
  onFiltersChange,
  exams,
  subtests,
  isLoading,
}: QuestionSetFiltersProps) {
  // Filter subtests by selected exam
  const filteredSubtests = filters.examId
    ? subtests.filter((s) => s.examId === filters.examId)
    : subtests

  const selectedExam = exams.find(e => e.id === filters.examId)
  const selectedSubtest = filteredSubtests.find(s => s.id === filters.subtestId)

  const handleExamChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      examId: value === 'all' || !value ? undefined : value,
      subtestId: undefined, // Reset subtest when exam changes
      offset: 0,
    })
  }

  const handleSubtestChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      subtestId: value === 'all' || !value ? undefined : value,
      offset: 0,
    })
  }

  const handleStatusChange = (value: string | null) => {
    onFiltersChange({
      ...filters,
      status: value === 'all' || !value ? undefined : (value as QuestionSetFilters['status']),
      offset: 0,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Exam Filter */}
        <Select
          value={filters.examId ?? 'all'}
          onValueChange={handleExamChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Exams">
              {filters.examId === 'all' || !filters.examId ? 'All Exams' : selectedExam ? `${selectedExam.code.toUpperCase()} - ${selectedExam.name}` : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map((exam) => (
              <SelectItem key={exam.id} value={exam.id}>
                {exam.code.toUpperCase()} - {exam.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Subtest Filter */}
        <Select
          value={filters.subtestId ?? 'all'}
          onValueChange={handleSubtestChange}
          disabled={isLoading || filteredSubtests.length === 0}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All Subtests">
              {filters.subtestId === 'all' || !filters.subtestId ? 'All Subtests' : selectedSubtest ? `${selectedSubtest.code.toUpperCase()} - ${selectedSubtest.name}` : null}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subtests</SelectItem>
            {filteredSubtests.map((subtest) => (
              <SelectItem key={subtest.id} value={subtest.id}>
                {subtest.code.toUpperCase()} - {subtest.name}
              </SelectItem>
            ))}
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
