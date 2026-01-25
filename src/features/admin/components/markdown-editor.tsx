"use client";

import { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AlertTriangle } from 'lucide-react'
import katex from 'katex'

interface MarkdownValidationError {
  type: 'table' | 'latex'
  message: string
  line?: number
}

/**
 * Validates LaTeX expressions in markdown content
 * Detects both inline ($...$) and block ($$...$$) LaTeX
 */
function validateLatex(content: string): MarkdownValidationError[] {
  const errors: MarkdownValidationError[] = []
  
  // Match block LaTeX ($$...$$)
  const blockLatexRegex = /\$\$([\s\S]*?)\$\$/g
  let match: RegExpExecArray | null
  
  while ((match = blockLatexRegex.exec(content)) !== null) {
    const latex = match[1]
    const lineNumber = content.substring(0, match.index).split('\n').length
    try {
      katex.renderToString(latex, { throwOnError: true })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid LaTeX'
      errors.push({
        type: 'latex',
        message: `Block LaTeX error: ${errorMessage}`,
        line: lineNumber,
      })
    }
  }
  
  // Match inline LaTeX ($...$) - but not $$
  // Use a more careful regex to avoid matching $$ as two inline $
  const inlineLatexRegex = /(?<!\$)\$(?!\$)((?:[^$\\]|\\.)+?)\$(?!\$)/g
  
  while ((match = inlineLatexRegex.exec(content)) !== null) {
    const latex = match[1]
    const lineNumber = content.substring(0, match.index).split('\n').length
    try {
      katex.renderToString(latex, { throwOnError: true })
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Invalid LaTeX'
      errors.push({
        type: 'latex',
        message: `Inline LaTeX error: ${errorMessage}`,
        line: lineNumber,
      })
    }
  }
  
  return errors
}


/**
 * Validates markdown tables for structural issues
 * Detects: inconsistent column counts, missing separators, malformed rows
 */
function validateTables(content: string): MarkdownValidationError[] {
  const errors: MarkdownValidationError[] = []
  const lines = content.split('\n')
  
  let inTable = false
  let tableStartLine = 0
  let expectedColumns = 0
  let hasSeparator = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const lineNumber = i + 1
    
    // Check if line looks like a table row (starts and ends with |, or has | in middle)
    const isTableRow = line.includes('|') && (
      (line.startsWith('|') && line.endsWith('|')) ||
      line.split('|').length >= 2
    )
    
    // Check if line is a separator row (contains only |, -, :, and spaces)
    const isSeparatorRow = /^\|?[\s\-:|]+\|?$/.test(line) && line.includes('-')
    
    if (isTableRow && !inTable) {
      // Starting a new table
      inTable = true
      tableStartLine = lineNumber
      hasSeparator = false
      
      // Count columns (number of | minus 1, or cells between |)
      const cells = line.split('|').filter((cell, idx, arr) => {
        // Filter out empty strings at start/end if line starts/ends with |
        if (idx === 0 && cell.trim() === '' && line.startsWith('|')) return false
        if (idx === arr.length - 1 && cell.trim() === '' && line.endsWith('|')) return false
        return true
      })
      expectedColumns = cells.length
    } else if (inTable) {
      if (isSeparatorRow) {
        hasSeparator = true
        // Validate separator has correct number of columns
        const separatorCells = line.split('|').filter((cell, idx, arr) => {
          if (idx === 0 && cell.trim() === '' && line.startsWith('|')) return false
          if (idx === arr.length - 1 && cell.trim() === '' && line.endsWith('|')) return false
          return true
        })
        if (separatorCells.length !== expectedColumns) {
          errors.push({
            type: 'table',
            message: `Table separator has ${separatorCells.length} columns, expected ${expectedColumns}`,
            line: lineNumber,
          })
        }
      } else if (isTableRow) {
        // Validate row has correct number of columns
        const cells = line.split('|').filter((cell, idx, arr) => {
          if (idx === 0 && cell.trim() === '' && line.startsWith('|')) return false
          if (idx === arr.length - 1 && cell.trim() === '' && line.endsWith('|')) return false
          return true
        })
        if (cells.length !== expectedColumns) {
          errors.push({
            type: 'table',
            message: `Table row has ${cells.length} columns, expected ${expectedColumns}`,
            line: lineNumber,
          })
        }
      } else if (line === '') {
        // Empty line ends the table
        if (!hasSeparator && expectedColumns > 0) {
          errors.push({
            type: 'table',
            message: `Table starting at line ${tableStartLine} is missing separator row`,
            line: tableStartLine,
          })
        }
        inTable = false
        expectedColumns = 0
      } else {
        // Non-table content ends the table
        if (!hasSeparator && expectedColumns > 0) {
          errors.push({
            type: 'table',
            message: `Table starting at line ${tableStartLine} is missing separator row`,
            line: tableStartLine,
          })
        }
        inTable = false
        expectedColumns = 0
      }
    }
  }
  
  // Check if we ended while still in a table
  if (inTable && !hasSeparator && expectedColumns > 0) {
    errors.push({
      type: 'table',
      message: `Table starting at line ${tableStartLine} is missing separator row`,
      line: tableStartLine,
    })
  }
  
  return errors
}

/**
 * Validates markdown content for malformed tables and invalid LaTeX
 */
export function validateMarkdown(content: string): MarkdownValidationError[] {
  if (!content.trim()) return []
  
  const tableErrors = validateTables(content)
  const latexErrors = validateLatex(content)
  
  return [...tableErrors, ...latexErrors]
}


interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: string
  label?: string
  error?: string
  /** Whether to show validation errors for malformed markdown */
  showValidation?: boolean
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter markdown content...',
  className,
  minHeight = 'min-h-[200px]',
  label,
  error,
  showValidation = true,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  // Validate markdown content for malformed tables and invalid LaTeX
  const validationErrors = useMemo(() => {
    if (!showValidation || !value) return []
    return validateMarkdown(value)
  }, [value, showValidation])

  const hasValidationErrors = validationErrors.length > 0

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && (
        <label className="text-xs font-mono text-muted-foreground uppercase">
          {label}
        </label>
      )}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'write' | 'preview')}
        className="w-full"
      >
        <TabsList variant="line" className="mb-2">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-1.5">
            Preview
            {hasValidationErrors && (
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="mt-0">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn('font-mono resize-y', minHeight)}
            aria-invalid={!!error || hasValidationErrors}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div
            className={cn(
              'border border-input bg-muted/20 p-3 overflow-auto',
              minHeight,
              hasValidationErrors && 'border-amber-500/50'
            )}
          >
            {/* Validation error indicator */}
            {hasValidationErrors && (
              <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded-sm">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-xs font-mono font-medium">
                    MARKDOWN_VALIDATION_ERRORS
                  </span>
                </div>
                <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-0.5 pl-6">
                  {validationErrors.map((err, idx) => (
                    <li key={idx} className="font-mono">
                      {err.line ? `Line ${err.line}: ` : ''}{err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Nothing to preview
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <p className="text-[10px] text-muted-foreground">
        Supports Markdown, tables, and LaTeX math (use $...$ for inline, $$...$$ for block)
      </p>
    </div>
  )
}
