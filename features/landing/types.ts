import type { IconSvgElement } from '@hugeicons/react'

export interface LottiePlaceholderProps {
  className?: string
  label?: string
}

export interface FeatureSection {
  badge: string
  title: string
  description: string
  points: string[]
  icon: IconSvgElement
  alignment: 'left' | 'right'
  gradient: string
}

export interface Testimonial {
  quote: string
  name: string
  school: string
  grade: string
  rating: number
  id: string
}

export interface Step {
  number: string
  title: string
  description: string
}

export interface Stat {
  icon: IconSvgElement
  value: string
  label: string
}
