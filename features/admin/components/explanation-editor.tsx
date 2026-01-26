"use client";

import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons'

import type { QuestionFormValues } from '../types'

interface ExplanationEditorProps {
  control: Control<QuestionFormValues>
  register: UseFormRegister<QuestionFormValues>
  options?: string[]
  errors?: {
    level1?: { message?: string }
    level1WrongOptions?: { message?: string }
    level2?: { message?: string }
  }
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E'] as const

export function ExplanationEditor({
  control,
  register,
  options = [],
  errors,
}: ExplanationEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'explanation.level2' as never,
  })

  return (
    <FieldGroup className="gap-6">
      {/* Level 1 Explanation - Required for publishing */}
      <Field>
        <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
          Level 1 Explanation
          <Badge variant="secondary" className="ml-2 text-[9px]">Required for publishing</Badge>
        </FieldLabel>
        <FieldDescription>
          Main explanation for why the correct answer is correct.
        </FieldDescription>
        <Textarea
          placeholder="Explain why the correct answer is correct..."
          className="font-mono min-h-[120px] mt-2"
          {...register('explanation.level1')}
        />
        {errors?.level1 && <FieldError>{errors.level1.message}</FieldError>}
        <p className="text-[10px] text-muted-foreground mt-1">
          Supports Markdown and LaTeX math
        </p>
      </Field>

      {/* Wrong Option Explanations */}
      <Accordion className="w-full">
        <AccordionItem value="wrong-options">
          <AccordionTrigger className="text-xs font-mono text-muted-foreground uppercase">
            Wrong Option Explanations (Optional)
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-[11px] text-muted-foreground">
                Explain why each wrong option is incorrect. Only options with content are shown.
              </p>
              {OPTION_LETTERS.map((letter, index) => {
                const optionText = options[index] || ''
                const hasOption = optionText.trim().length > 0

                if (!hasOption) return null

                return (
                  <Field key={letter}>
                    <FieldLabel className="text-[11px] font-mono">
                      Option {letter}
                      <span className="text-muted-foreground font-normal ml-2">
                        {optionText.length > 40 ? `${optionText.slice(0, 40)}...` : optionText}
                      </span>
                    </FieldLabel>
                    <Textarea
                      placeholder={`Why option ${letter} is incorrect...`}
                      className="font-mono min-h-[60px]"
                      {...register(`explanation.level1WrongOptions.${letter}`)}
                    />
                  </Field>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>


      {/* Level 2 Step-by-Step Explanation */}
      <Accordion className="w-full">
        <AccordionItem value="level2-steps">
          <AccordionTrigger className="text-xs font-mono text-muted-foreground uppercase">
            Level 2 Steps (Optional)
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-[11px] text-muted-foreground">
                Break down the solution into step-by-step instructions for students who need more guidance.
              </p>

              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 bg-muted/20 py-6">
                  <p className="text-xs text-muted-foreground">No steps added yet</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append('')}
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground mt-2 w-6">
                        {index + 1}.
                      </span>
                      <Input
                        placeholder={`Step ${index + 1}...`}
                        className="flex-1 font-mono"
                        {...register(`explanation.level2.${index}`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => remove(index)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append('')}
                    className="w-fit"
                  >
                    <HugeiconsIcon icon={Add01Icon} strokeWidth={2} data-icon="inline-start" />
                    Add Step
                  </Button>
                </div>
              )}

              {errors?.level2 && <FieldError>{errors.level2.message}</FieldError>}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </FieldGroup>
  )
}
