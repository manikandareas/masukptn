import type { Attempt, AttemptItem } from '@/data-access/queries/attempts'
import type { Exam } from '@/data-access/queries/exams'
import type { QuestionSetSummary } from '@/data-access/queries/question-sets'
import type { Question } from '@/data-access/queries/questions'

export type PracticeCatalogQuestionSet = QuestionSetSummary
export type PracticeCatalogExam = Exam & { questionSets: PracticeCatalogQuestionSet[] }

export type PracticeCatalog = {
  exams: PracticeCatalogExam[]
}

export type PracticeCatalogSearch = {
  exam?: string
  subtest?: string
}

export type PracticeCatalogSelection = {
  examCode: string
  subtestCode: string | null
}

export type PracticeCatalogTreeNode = {
  id: string
  name: string
  type: 'exam' | 'subtest'
  children?: PracticeCatalogTreeNode[]
}

export type PracticeSessionItem = AttemptItem & { question: Question }

export type PracticeSession = Attempt & { items: PracticeSessionItem[] }

export type PracticeAnswer =
  | { type: 'single_choice'; selected: string | null }
  | { type: 'complex_selection'; rows: Array<{ selected: string | null }> }
  | { type: 'fill_in'; value: string | null }

export type PracticeConfigInput = {
  questionSetId: string
  timeMode: 'relaxed' | 'timed'
}
