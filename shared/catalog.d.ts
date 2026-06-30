export type PlanCatalogEntry = {
  id: string
  name: string
  monthlyPriceLabel: string
  monthlyAmountCents: number
  currency: string
  subtitle: string
  etaMinutes: number
  includedDeployments: number
  bullets: string[]
  featured: boolean
}

export type ModelCatalogEntry = {
  id: string
  name: string
  status: string
}

export type ChannelCatalogEntry = {
  id: string
  name: string
  status: string
}

export const annualBillingMultiplier: number
export const planCatalog: PlanCatalogEntry[]
export const modelCatalog: ModelCatalogEntry[]
export const channelCatalog: ChannelCatalogEntry[]
