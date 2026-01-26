import type { Attempt, AttemptItem } from '@/data-access/queries/attempts'
import type {
  Blueprint,
  BlueprintSection,
  Exam,
  Subtest,
} from '@/data-access/queries/exams'
import type { Question } from '@/data-access/queries/questions'

export type TryoutCatalogBlueprintSection = BlueprintSection & {
  subtest: Subtest
}

export type TryoutCatalogBlueprint = Blueprint & {
  sections: TryoutCatalogBlueprintSection[]
  totalQuestions: number
  totalDurationSeconds: number
}

export type TryoutCatalogExam = Exam & {
  blueprints: TryoutCatalogBlueprint[]
}

export type TryoutCatalog = {
  exams: TryoutCatalogExam[]
}

export type TryoutSessionItem = AttemptItem & { question: Question }

export type TryoutBlueprintSection = BlueprintSection & {
  subtest: Subtest
}

export type TryoutBlueprint = Blueprint & {
  sections: TryoutBlueprintSection[]
}

export type TryoutSession = Attempt & {
  items: TryoutSessionItem[]
  blueprint: TryoutBlueprint
  serverTime: string
}

export type TryoutAnswer =
  | { type: 'single_choice'; selected: string | null }
  | { type: 'complex_selection'; rows: Array<{ selected: string | null }> }
  | { type: 'fill_in'; value: string | null }

export type TryoutConfigInput = {
  blueprintId: string
}
