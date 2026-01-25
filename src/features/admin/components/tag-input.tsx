"use client";

import { useState, useCallback, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Add01Icon } from '@hugeicons/core-free-icons'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  placeholder?: string
  label?: string
  description?: string
  error?: string
  maxTags?: number
  className?: string
}

export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = 'Add tag...',
  label,
  description,
  error,
  maxTags = 10,
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // Filter suggestions based on input and exclude already selected tags
  const filteredSuggestions = useMemo(() => {
    const lowerInput = inputValue.toLowerCase()
    return suggestions
      .filter((s) => !value.includes(s))
      .filter((s) => s.toLowerCase().includes(lowerInput))
      .slice(0, 10)
  }, [suggestions, value, inputValue])

  const addTag = useCallback(
    (tag: string) => {
      const trimmedTag = tag.trim().toLowerCase()
      if (!trimmedTag) return
      if (value.includes(trimmedTag)) return
      if (value.length >= maxTags) return

      onChange([...value, trimmedTag])
      setInputValue('')
      setOpen(false)
    },
    [value, onChange, maxTags]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove))
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(inputValue)
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1])
      }
    },
    [inputValue, value, addTag, removeTag]
  )

  return (
    <Field className={className}>
      {label && (
        <FieldLabel className="text-xs font-mono text-muted-foreground uppercase">
          {label}
        </FieldLabel>
      )}
      {description && <FieldDescription>{description}</FieldDescription>}

      <div className="flex flex-col gap-2 mt-2">
        {/* Tag display */}
        {value.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {value.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="gap-1 pr-1 text-[11px]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-muted rounded-sm p-0.5"
                >
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag input with suggestions */}
        {value.length < maxTags && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger>
              <Input
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  if (!open && e.target.value) setOpen(true)
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                className="font-mono"
              />
            </PopoverTrigger>
            <PopoverContent
              className="w-[200px] p-0"
              align="start"
            >
              <Command>
                <CommandList>
                  {filteredSuggestions.length === 0 && inputValue && (
                    <CommandItem
                      onSelect={() => addTag(inputValue)}
                      className="cursor-pointer"
                    >
                      <HugeiconsIcon icon={Add01Icon} strokeWidth={2} className="size-3.5" />
                      Create {inputValue}
                    </CommandItem>
                  )}
                  {filteredSuggestions.length > 0 && (
                    <CommandGroup heading="Suggestions">
                      {filteredSuggestions.map((suggestion) => (
                        <CommandItem
                          key={suggestion}
                          onSelect={() => addTag(suggestion)}
                          className="cursor-pointer"
                        >
                          {suggestion}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                  {filteredSuggestions.length === 0 && !inputValue && (
                    <CommandEmpty>Type to search or create tags</CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}

        {value.length >= maxTags && (
          <p className="text-[10px] text-muted-foreground">
            Maximum {maxTags} tags reached
          </p>
        )}
      </div>

      {error && <FieldError>{error}</FieldError>}
    </Field>
  )
}
