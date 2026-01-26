import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'

import { cn } from '@/lib/utils'

const katexSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), 'className'],
    span: [...(defaultSchema.attributes?.span ?? []), 'className'],
    code: [...(defaultSchema.attributes?.code ?? []), 'className'],
    pre: [...(defaultSchema.attributes?.pre ?? []), 'className'],
    table: [...(defaultSchema.attributes?.table ?? []), 'className'],
    th: [...(defaultSchema.attributes?.th ?? []), 'className'],
    td: [...(defaultSchema.attributes?.td ?? []), 'className'],
    img: [...(defaultSchema.attributes?.img ?? []), 'className'],
  },
}

export type MarkdownRendererProps = {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        'text-xs/relaxed text-foreground [&_p]:mb-3 [&_p]:leading-relaxed [&_a]:underline [&_a]:underline-offset-3 [&_a]:text-primary [&_a]:hover:text-foreground [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_ul]:my-3 [&_ol]:my-3 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_img]:max-w-full [&_img]:rounded-none [&_img]:border [&_img]:border-border [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-none [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/50 [&_pre]:p-3 [&_code]:rounded-none [&_code]:border [&_code]:border-border [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[11px] [&_code]:font-medium',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          [rehypeKatex, { throwOnError: false }],
          [rehypeSanitize, katexSchema],
        ]}
        components={{
        img({ className: imgClassName, ...props }) {
          return (
            <img
              className={cn('max-w-full h-auto', imgClassName)}
              loading="lazy"
              {...props}
            />
          )
        },
        code({ className: codeClassName, children, ...props }) {
          return (
            <code className={cn('font-medium', codeClassName)} {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  )
}
