export type BillingCycle = 'annual' | 'monthly'

export type ChoiceOption = {
  id: string
  name: string
  summary: string
  badge?: string
}

export type Plan = {
  id: string
  name: string
  monthlyPriceLabel: string
  monthlyAmountCents: number
  currency: string
  subtitle: string
  bullets: string[]
  etaMinutes: number
  includedDeployments: number
  featured?: boolean
}

export type FaqItem = {
  question: string
  answer: string
}

export type LegalSection = {
  title: string
  paragraphs: string[]
  bullets?: string[]
}
